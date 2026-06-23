/**
 * 메인 API 클라이언트
 * api-endpoints 스킬 원칙을 준수하는 중앙집중화된 API 관리
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { apiConfig } from './config';
import { tokenManager } from './tokenManager';
import { UserData, AdminUser, AuditLog } from '../types/shared';

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// API 에러 타입
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeUserData(raw: Record<string, any>): UserData {
  return {
    id: toStringValue(raw.id),
    nickname: toStringValue(raw.nickname),
    name: raw.name,
    email: toStringValue(raw.email),
    phone: raw.phone,
    rank: toStringValue(raw.rank),
    status: raw.status ?? 'inactive',
    joinDate: toStringValue(raw.joinDate ?? raw.join_date),
    balanceUSDT: toNumber(raw.balanceUSDT ?? raw.balance_usdt),
    lockedUSDT: toNumber(raw.lockedUSDT ?? raw.locked_usdt),
    balanceCNYT: toNumber(raw.balanceCNYT ?? raw.balance_cnyt),
    totalAssets: toNumber(raw.totalAssets ?? raw.total_assets),
    package: toStringValue(raw.package, 'Flexible'),
    initialInvestment: toNumber(raw.initialInvestment ?? raw.initial_investment),
    investmentDate: raw.investmentDate ?? raw.investment_date,
    sponsorId: toStringValue(raw.sponsorId ?? raw.sponsor_id),
    teamSize: toNumber(raw.teamSize ?? raw.team_size),
    teamVol: toNumber(raw.teamVol ?? raw.team_vol),
    bodyValue: toNumber(raw.bodyValue ?? raw.body_value),
    kycLevel: toNumber(raw.kycLevel ?? raw.kyc_level),
    kycStatus: raw.kycStatus ?? raw.kyc_status,
    kycUpdatedAt: raw.kycUpdatedAt ?? raw.kyc_updated_at,
    pageface: Boolean(raw.pageface),
    mobileBinding: Boolean(raw.mobileBinding ?? raw.mobile_binding),
    hasSetTradingPassword: Boolean(raw.hasSetTradingPassword ?? raw.has_set_trading_password),
    isTradingPasswordVerified: Boolean(raw.isTradingPasswordVerified ?? raw.is_trading_password_verified),
    otp: Boolean(raw.otp ?? raw.otp_enabled),
    lastLoginAt: raw.lastLoginAt ?? raw.last_login_at,
    distributorStatus: raw.distributorStatus ?? raw.distributor_status ?? 'none',
    distributorCode: raw.distributorCode ?? raw.distributor_code,
    distributorApprovedAt: raw.distributorApprovedAt ?? raw.distributor_approved_at,
    restrictions: {
      isWithdrawalBlocked: Boolean(raw.restrictions?.isWithdrawalBlocked ?? raw.is_withdrawal_blocked),
      isAccountLocked: Boolean(raw.restrictions?.isAccountLocked ?? raw.is_account_locked),
      isFrozen: Boolean(raw.restrictions?.isFrozen ?? raw.is_frozen),
      blockReason: raw.restrictions?.blockReason ?? raw.block_reason,
      blockExpiresAt: raw.restrictions?.blockExpiresAt ?? raw.block_expires_at,
    },
    createdAt: toStringValue(raw.createdAt ?? raw.created_at),
    updatedAt: toStringValue(raw.updatedAt ?? raw.updated_at),
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = this.createClient();
    this.setupInterceptors();
  }

  /**
   * Axios 인스턴스 생성
   */
  private createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Build-UID': apiConfig.buildUID,
        'X-Environment': apiConfig.environment,
      },
    });

    return client;
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors(): void {
    // 요청 인터셉터: 토큰 자동 첨부
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 디버그 로그
        if (apiConfig.logLevel === 'debug') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 에러 처리 및 토큰 갱신
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 디버그 로그
        if (apiConfig.logLevel === 'debug') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // 401 on authenticated requests only — login endpoint 401 means wrong credentials
        const isLoginRequest = originalRequest?.url?.includes('/admin/login');
        if (error.response?.status === 401 && originalRequest && !isLoginRequest) {
          tokenManager.clearToken();
          return Promise.reject(new ApiError(
            'AUTH_EXPIRED',
            'Authentication has expired. Please log in again.',
            401,
            error.response
          ));
        }

        // 일반적인 API 에러 처리
        const apiError = this.handleApiError(error);
        console.error('❌ API Error:', apiError);

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * API 에러 처리
   */
  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status;
      const data = error.response.data as any;

      return new ApiError(
        data?.error?.code || `HTTP_${status}`,
        data?.error?.message || error.message,
        status,
        error.response
      );
    } else if (error.request) {
      // 요청은 보내졌지만 응답이 없는 경우
      return new ApiError(
        'NETWORK_ERROR',
        'Unable to connect to the server. Please check your internet connection.',
        0
      );
    } else {
      // 요청 설정 중 에러
      return new ApiError(
        'REQUEST_ERROR',
        error.message,
        0
      );
    }
  }

  /**
   * 기본 요청 메서드
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
      });

      return response.data;
    } catch (error) {
      throw error; // 인터셉터에서 이미 처리됨
    }
  }

  // ================== 사용자 관리 API ==================

  /**
   * 사용자 목록 조회
   */
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    rank?: string;
  } = {}): Promise<ApiResponse<{ data: UserData[]; total: number }>> {
    const { page = 1, pageSize = 20, search = '', rank } = params;
    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search,
      ...(rank && { rank }),
    });

    const response = await this.request<ApiResponse<{ data: UserData[]; total: number }> | UserData[]>('GET', `/users?${query}`);
    if (Array.isArray(response)) {
      const users = response.map((item) => normalizeUserData(item as Record<string, any>));
      return {
        success: true,
        data: {
          data: users,
          total: users.length,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return response;
  }

  /**
   * 사용자 상세 정보 조회
   */
  async getUserById(userId: string): Promise<ApiResponse<UserData>> {
    return this.request('GET', `/users/${userId}`);
  }

  /**
   * 사용자 잔액 조정
   */
  async adjustUserBalance(
    userId: string,
    currency: 'USDT' | 'CNYT',
    amount: number
  ): Promise<ApiResponse<UserData>> {
    const response = await this.request<ApiResponse<UserData> | UserData>('PUT', `/admin-console/users/${userId}/balance`, {
      currency,
      amount,
    });
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: normalizeUserData(response as Record<string, any>),
        timestamp: new Date().toISOString(),
      };
    }
    return response as ApiResponse<UserData>;
  }

  /**
   * 사용자 제한 설정
   */
  async setUserRestrictions(
    userId: string,
    restrictionType: 'withdrawal' | 'account' | 'freeze',
    enabled: boolean
  ): Promise<ApiResponse<UserData>> {
    const response = await this.request<ApiResponse<UserData> | UserData>('PUT', `/admin-console/users/${userId}/restrictions`, {
      restrictionType,
      enabled,
    });
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: normalizeUserData(response as Record<string, any>),
        timestamp: new Date().toISOString(),
      };
    }
    return response as ApiResponse<UserData>;
  }

  /**
   * KYC 재설정
   */
  async resetUserKyc(userId: string): Promise<ApiResponse<UserData>> {
    const adminInfo = tokenManager.getAdminInfo();
    if (!adminInfo) {
      throw new ApiError('AUTH_REQUIRED', 'Authentication required for this operation.');
    }

    return this.request('PUT', `/users/${userId}/kyc`, {
      adminId: adminInfo.adminId,
      adminName: adminInfo.adminRole,
    });
  }

  /**
   * 사용자 차단
   */
  async banUser(userId: string): Promise<ApiResponse<UserData>> {
    const response = await this.request<ApiResponse<UserData> | UserData>('PUT', `/admin-console/users/${userId}/ban`, {});
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: normalizeUserData(response as Record<string, any>),
        timestamp: new Date().toISOString(),
      };
    }
    return response as ApiResponse<UserData>;
  }

  /**
   * 사용자 감사 로그 조회
   */
  async getUserAuditLogs(userId: string): Promise<ApiResponse<AuditLog[]>> {
    return this.request('GET', `/users/${userId}/audit-logs`);
  }

  // ================== 관리자 API ==================

  /**
   * 관리자 목록 조회
   */
  async getAdmins(): Promise<ApiResponse<AdminUser[]>> {
    return this.request('GET', '/admin/users');
  }

  /**
   * 현재 관리자 정보 조회
   */
  async getCurrentAdmin(): Promise<ApiResponse<AdminUser>> {
    const response = await this.request<ApiResponse<AdminUser> | AdminUser>('GET', '/admin/me');
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: response as AdminUser,
        timestamp: new Date().toISOString(),
      };
    }
    return response as ApiResponse<AdminUser>;
  }

  /**
   * 시스템 감사 로그 조회
   */
  async getSystemAuditLogs(limit = 50): Promise<ApiResponse<AuditLog[]>> {
    return this.request('GET', `/admin/audit-logs?limit=${limit}`);
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await this.request<ApiResponse<any> | any>('GET', '/dashboard/admin');
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    }
    return response;
  }

  async getCoreSettings(): Promise<ApiResponse<any>> {
    const response = await this.request<ApiResponse<any> | any>('GET', '/admin-console/settings/core');
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    }
    return response;
  }

  async updateCoreSetting(settingKey: string, settingValue: string, changeReason?: string): Promise<ApiResponse<any>> {
    const response = await this.request<ApiResponse<any> | any>('PUT', `/admin-console/settings/${settingKey}`, {
      setting_value: settingValue,
      change_reason: changeReason,
    });
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    }
    return response;
  }

  // ================== 인증 API ==================

  /**
   * 관리자 로그인 (JSON 방식)
   */
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    expires_in: number;
    admin_id: string;
    role: string;
  }>> {
    const response = await this.request<ApiResponse<{
      access_token: string;
      token_type: string;
      expires_in: number;
      admin_id: string;
      role: string;
    }> | {
      access_token: string;
      token_type: string;
      expires_in: number;
      admin_id: string;
      role: string;
    }>('POST', '/admin/login/json', credentials);
    if (response && typeof response === 'object' && !('success' in response)) {
      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    }
    return response;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await this.request('POST', '/admin/logout');
      tokenManager.clearToken();
      return response;
    } catch (error) {
      // 로그아웃은 항상 성공으로 처리
      tokenManager.clearToken();
      throw error;
    }
  }

  // ================== 출금 관리 API ==================

  /**
   * 출금 요청 목록 조회
   */
  async getWithdrawals(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/withdrawals?${query}`);
  }

  /**
   * 대기 중인 출금 요청 조회
   */
  async getPendingWithdrawals(limit = 50): Promise<ApiResponse<any[]>> {
    return this.request('GET', `/withdrawals/pending?limit=${limit}`);
  }

  /**
   * 출금 승인
   */
  async approveWithdrawal(withdrawalId: string, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/withdrawals/${withdrawalId}/approve`, {
      withdrawal_id: withdrawalId,
      admin_notes: adminNotes
    });
  }

  /**
   * 출금 거부
   */
  async rejectWithdrawal(withdrawalId: string, rejectionReason: string, adminNotes?: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/withdrawals/${withdrawalId}/reject`, {
      withdrawal_id: withdrawalId,
      rejection_reason: rejectionReason,
      admin_notes: adminNotes
    });
  }

  /**
   * 출금 통계 조회
   */
  async getWithdrawalStats(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);
    return this.request('GET', `/withdrawals/stats/summary?${query}`);
  }

  // ================== 수당 정산 API ==================

  /**
   * 수당 지급 로그 조회
   */
  async getPayoutLogs(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/payouts?${query}`);
  }

  /**
   * 수당 설정 조회
   */
  async getPayoutSettings(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/payout-settings');
  }

  /**
   * 수당 설정 업데이트
   */
  async updatePayoutSetting(settingKey: string, settingValue: number): Promise<ApiResponse<any>> {
    return this.request('PUT', `/payout-settings/${settingKey}`, {
      setting_value: settingValue
    });
  }

  /**
   * 배치 수당 실행
   */
  async executeBatchPayout(payoutType: string, dryRun = false): Promise<ApiResponse<any>> {
    return this.request('POST', '/payouts/batch', {
      payout_type: payoutType,
      dry_run: dryRun
    });
  }

  // ================== 투자 패키지 API ==================

  /**
   * 투자 패키지 목록 조회
   */
  async getInvestmentPackages(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/investment-packages');
  }

  /**
   * 투자 패키지 생성
   */
  async createInvestmentPackage(packageData: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/investment-packages', packageData);
  }

  /**
   * 투자 패키지 업데이트
   */
  async updateInvestmentPackage(packageId: string, packageData: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/investment-packages/${packageId}`, packageData);
  }

  /**
   * 사용자 투자 내역 조회
   */
  async getUserInvestments(userId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = userId ? `/user-investments?user_id=${userId}` : '/user-investments';
    return this.request('GET', endpoint);
  }

  // ================== 거래 이력 API ==================

  /**
   * 거래 이력 조회
   */
  async getTransactions(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/transactions?${query}`);
  }

  /**
   * 토큰 가격 조회
   */
  async getTokenPrices(): Promise<ApiResponse<any[]>> {
    return this.request('GET', '/token-prices');
  }

  /**
   * 토큰 가격 업데이트
   */
  async updateTokenPrice(tokenSymbol: string, priceUsd: number): Promise<ApiResponse<any>> {
    return this.request('PUT', `/token-prices/${tokenSymbol}`, {
      price_usd: priceUsd,
      is_manual: true
    });
  }

  // ================== 감사 로그 API ==================

  /**
   * 감사 로그 조회 (확장)
   */
  async getAuditLogs(params: {
    page?: number;
    pageSize?: number;
    adminId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/audit-logs?${query}`);
  }

  /**
   * 감사 로그 요약
   */
  async getAuditSummary(days = 30): Promise<ApiResponse<any>> {
    return this.request('GET', `/audit-logs/summary?days=${days}`);
  }

  /**
   * 관리자 활동 조회
   */
  async getAdminActivity(adminId: string, days = 30): Promise<ApiResponse<any>> {
    return this.request('GET', `/audit-logs/admin/${adminId}/activity?days=${days}`);
  }

  // ================== FDS & 시스템 API ==================

  /**
   * FDS 알림 조회
   */
  async getFDSAlerts(params: {
    page?: number;
    pageSize?: number;
    severity?: string;
    status?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/fds-alerts?${query}`);
  }

  /**
   * FDS 알림 상태 업데이트
   */
  async updateFDSAlert(alertId: string, status: string, resolution?: string): Promise<ApiResponse<any>> {
    return this.request('PUT', `/fds-alerts/${alertId}`, {
      status,
      resolution
    });
  }

  /**
   * 시스템 설정 조회
   */
  async getSystemSettings(category?: string): Promise<ApiResponse<any[]>> {
    const endpoint = category ? `/system-settings?category=${category}` : '/system-settings';
    return this.request('GET', endpoint);
  }

  /**
   * 시스템 설정 업데이트
   */
  async updateSystemSetting(settingKey: string, settingValue: string, changeReason?: string): Promise<ApiResponse<any>> {
    return this.request('PUT', `/system-settings/${settingKey}`, {
      setting_value: settingValue,
      change_reason: changeReason
    });
  }

  /**
   * 승인 요청 조회
   */
  async getApprovalRequests(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/approval-requests?${query}`);
  }

  /**
   * 승인 요청 처리
   */
  async processApprovalRequest(requestId: string, action: 'approve' | 'reject', comment?: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/approval-requests/${requestId}/process`, {
      action,
      comment
    });
  }

  // ================== 회계 대사 API ==================

  /**
   * 회계 대사 기록 조회
   */
  async getReconciliationRecords(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/reconciliation?${query}`);
  }

  /**
   * 회계 대사 실행
   */
  async executeReconciliation(type: string, date: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/reconciliation/execute', {
      type,
      reconciliation_date: date
    });
  }

  /**
   * 회계 대사 불일치 항목 조회
   */
  async getReconciliationDiscrepancies(reconciliationId: string): Promise<ApiResponse<any[]>> {
    return this.request('GET', `/reconciliation/${reconciliationId}/discrepancies`);
  }

  // ================== P2P 거래 API ==================

  /**
   * P2P 거래 조회
   */
  async getP2PTrades(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/p2p-trades?${query}`);
  }

  /**
   * P2P 분쟁 조회
   */
  async getP2PDisputes(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/p2p-disputes?${query}`);
  }

  /**
   * P2P 분쟁 해결
   */
  async resolveP2PDispute(disputeId: string, resolution: string, resolutionAmount?: number): Promise<ApiResponse<any>> {
    return this.request('PUT', `/p2p-disputes/${disputeId}/resolve`, {
      resolution,
      resolution_amount: resolutionAmount
    });
  }

  // ================== 콘텐츠 관리 API ==================

  /**
   * 뉴스 기사 조회
   */
  async getNewsArticles(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/news?${query}`);
  }

  /**
   * 뉴스 기사 생성
   */
  async createNewsArticle(articleData: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/news', articleData);
  }

  /**
   * 뉴스 기사 업데이트
   */
  async updateNewsArticle(articleId: string, articleData: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/news/${articleId}`, articleData);
  }

  /**
   * CMS 콘텐츠 조회
   */
  async getCMSContents(type?: string): Promise<ApiResponse<any[]>> {
    const endpoint = type ? `/cms?type=${type}` : '/cms';
    return this.request('GET', endpoint);
  }

  /**
   * CMS 콘텐츠 업데이트
   */
  async updateCMSContent(contentKey: string, content: any): Promise<ApiResponse<any>> {
    return this.request('PUT', `/cms/${contentKey}`, content);
  }

  /**
   * 고객 지원 티켓 조회
   */
  async getSupportTickets(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
    priority?: string;
  } = {}): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return this.request('GET', `/support-tickets?${query}`);
  }

  /**
   * 지원 티켓 응답 추가
   */
  async addSupportTicketResponse(ticketId: string, message: string, isInternal = false): Promise<ApiResponse<any>> {
    return this.request('POST', `/support-tickets/${ticketId}/responses`, {
      message,
      is_internal: isInternal
    });
  }

  /**
   * 지원 티켓 상태 업데이트
   */
  async updateSupportTicket(ticketId: string, status: string, assignedTo?: string): Promise<ApiResponse<any>> {
    return this.request('PUT', `/support-tickets/${ticketId}`, {
      status,
      assigned_to: assignedTo
    });
  }

  // ================== 헬스체크 ==================

  /**
   * 서버 헬스체크
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('GET', '/health');
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const api = new ApiClient();

export default api;

// 편의를 위한 개별 API 그룹 내보내기 (기존 코드 호환성)
export const userApi = {
  list: (page = 1, pageSize = 20, search = '') =>
    api.getUsers({ page, pageSize, search }),
  getById: (id: string) =>
    api.getUserById(id),
  adjustBalance: (userId: string, currency: 'USDT' | 'CNYT', amount: number) =>
    api.adjustUserBalance(userId, currency, amount),
  setRestrictions: (userId: string, restrictionType: 'withdrawal' | 'account' | 'freeze', enabled: boolean) =>
    api.setUserRestrictions(userId, restrictionType, enabled),
  resetKyc: (userId: string) =>
    api.resetUserKyc(userId),
  ban: (userId: string) =>
    api.banUser(userId),
  getAuditLogs: (userId: string) =>
    api.getUserAuditLogs(userId),
  getInvestments: (userId?: string) =>
    api.getUserInvestments(userId),
};

export const adminApi = {
  listAdmins: () =>
    api.getAdmins(),
  getCurrent: () =>
    api.getCurrentAdmin(),
  getAuditLogs: (limit?: number) =>
    api.getSystemAuditLogs(limit),
  getAuditSummary: (days?: number) =>
    api.getAuditSummary(days),
  getActivity: (adminId: string, days?: number) =>
    api.getAdminActivity(adminId, days),
};

export const withdrawalApi = {
  list: (params?: any) =>
    api.getWithdrawals(params),
  getPending: (limit?: number) =>
    api.getPendingWithdrawals(limit),
  approve: (withdrawalId: string, notes?: string) =>
    api.approveWithdrawal(withdrawalId, notes),
  reject: (withdrawalId: string, reason: string, notes?: string) =>
    api.rejectWithdrawal(withdrawalId, reason, notes),
  getStats: (startDate?: string, endDate?: string) =>
    api.getWithdrawalStats(startDate, endDate),
};

export const payoutApi = {
  getLogs: (params?: any) =>
    api.getPayoutLogs(params),
  getSettings: () =>
    api.getPayoutSettings(),
  updateSetting: (key: string, value: number) =>
    api.updatePayoutSetting(key, value),
  executeBatch: (type: string, dryRun?: boolean) =>
    api.executeBatchPayout(type, dryRun),
};

export const investmentApi = {
  getPackages: () =>
    api.getInvestmentPackages(),
  createPackage: (data: any) =>
    api.createInvestmentPackage(data),
  updatePackage: (id: string, data: any) =>
    api.updateInvestmentPackage(id, data),
  getUserInvestments: (userId?: string) =>
    api.getUserInvestments(userId),
};

export const transactionApi = {
  list: (params?: any) =>
    api.getTransactions(params),
  getTokenPrices: () =>
    api.getTokenPrices(),
  updateTokenPrice: (symbol: string, price: number) =>
    api.updateTokenPrice(symbol, price),
};

export const auditApi = {
  getLogs: (params?: any) =>
    api.getAuditLogs(params),
  getSummary: (days?: number) =>
    api.getAuditSummary(days),
  getAdminActivity: (adminId: string, days?: number) =>
    api.getAdminActivity(adminId, days),
};

export const systemApi = {
  getFDSAlerts: (params?: any) =>
    api.getFDSAlerts(params),
  updateFDSAlert: (alertId: string, status: string, resolution?: string) =>
    api.updateFDSAlert(alertId, status, resolution),
  getSettings: (category?: string) =>
    api.getSystemSettings(category),
  updateSetting: (key: string, value: string, reason?: string) =>
    api.updateSystemSetting(key, value, reason),
  getApprovalRequests: (params?: any) =>
    api.getApprovalRequests(params),
  processApproval: (requestId: string, action: 'approve' | 'reject', comment?: string) =>
    api.processApprovalRequest(requestId, action, comment),
};

export const reconciliationApi = {
  getRecords: (params?: any) =>
    api.getReconciliationRecords(params),
  execute: (type: string, date: string) =>
    api.executeReconciliation(type, date),
  getDiscrepancies: (reconciliationId: string) =>
    api.getReconciliationDiscrepancies(reconciliationId),
};

export const p2pApi = {
  getTrades: (params?: any) =>
    api.getP2PTrades(params),
  getDisputes: (params?: any) =>
    api.getP2PDisputes(params),
  resolveDispute: (disputeId: string, resolution: string, amount?: number) =>
    api.resolveP2PDispute(disputeId, resolution, amount),
};

export const cmsApi = {
  getNews: (params?: any) =>
    api.getNewsArticles(params),
  createNews: (data: any) =>
    api.createNewsArticle(data),
  updateNews: (id: string, data: any) =>
    api.updateNewsArticle(id, data),
  getContents: (type?: string) =>
    api.getCMSContents(type),
  updateContent: (key: string, content: any) =>
    api.updateCMSContent(key, content),
  getSupportTickets: (params?: any) =>
    api.getSupportTickets(params),
  addTicketResponse: (ticketId: string, message: string, isInternal?: boolean) =>
    api.addSupportTicketResponse(ticketId, message, isInternal),
  updateTicket: (ticketId: string, status: string, assignedTo?: string) =>
    api.updateSupportTicket(ticketId, status, assignedTo),
};

export const healthCheck = () => api.healthCheck();

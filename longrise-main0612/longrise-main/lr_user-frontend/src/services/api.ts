/**
 * API Service for Longrise AI Platform
 * Centralized API client with authentication and error handling
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { UserData } from '../types/api';

export type { UserData };

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface EmailAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface SendSignupCodeResponse {
  sent: boolean;
  cooldown_seconds: number;
  expires_in_seconds: number;
  message: string;
}

export interface VerifySignupCodeResponse {
  verified: boolean;
  message: string;
}

export interface OTPSetupResponse {
  configured: boolean;
  enabled: boolean;
  issuer: string;
  account: string;
  secret: string;
  otpauth_uri: string;
  qr_code_data_url: string;
}

export interface OTPVerifySetupResponse {
  enabled: boolean;
  configured: boolean;
  backup_codes: string[];
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

class ApiService {
  private client: AxiosInstance;
  private tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'longrise_token';

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    if (!baseURL) {
      throw new Error('VITE_API_BASE_URL environment variable is required');
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private handleError(error: AxiosError): void {
    if (error.response?.status === 401) {
      // Token expired or invalid
      this.removeToken();
      window.location.href = '/login';
    }

    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post('/auth/login/json', credentials);
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async checkSignupEmail(email: string): Promise<EmailAvailabilityResponse> {
    const response = await this.client.post('/auth/signup/check-email', { email });
    return response.data;
  }

  async sendSignupCode(email: string): Promise<SendSignupCodeResponse> {
    const response = await this.client.post('/auth/signup/send-code', { email });
    return response.data;
  }

  async verifySignupCode(email: string, code: string): Promise<VerifySignupCodeResponse> {
    const response = await this.client.post('/auth/signup/verify-code', { email, code });
    return response.data;
  }

  async completeSignup(payload: { email: string; password: string; referral_code: string }): Promise<LoginResponse> {
    const response = await this.client.post('/auth/signup/complete', payload);
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.removeToken();
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.client.post('/auth/refresh');
    const { access_token } = response.data;

    if (access_token) {
      this.setToken(access_token);
    }

    return response.data;
  }

  async testToken(): Promise<UserData> {
    const response = await this.client.post('/auth/test-token');
    return response.data;
  }

  // User management
  async getCurrentUser(): Promise<UserData> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateUser(userData: Partial<UserData>): Promise<UserData> {
    const response = await this.client.put('/users/me', userData);
    return response.data;
  }

  async setReferralCode(payload: { referral_code: string }): Promise<UserData> {
    const response = await this.client.post('/account/referral-code', payload);
    return response.data;
  }

  async setTradingPassword(payload: { password: string; confirm_password: string; current_password?: string; otp_code?: string }): Promise<UserData> {
    const response = await this.client.post('/account/trading-password', payload);
    return response.data;
  }

  async verifyTradingPassword(payload: { password: string }): Promise<{ verified: boolean }> {
    const response = await this.client.post('/account/trading-password/verify', payload);
    return response.data;
  }

  async setupOtp(payload: { current_otp_code?: string } = {}): Promise<OTPSetupResponse> {
    const response = await this.client.post('/account/otp/setup', payload);
    return response.data;
  }

  async verifyOtpSetup(payload: { verification_code: string }): Promise<OTPVerifySetupResponse> {
    const response = await this.client.post('/account/otp/verify', payload);
    return response.data;
  }

  async enableOtp(payload: { verification_code: string }): Promise<{ enabled: boolean; configured: boolean }> {
    const response = await this.client.post('/account/otp/enable', payload);
    return response.data;
  }

  async disableOtp(payload: { verification_code: string; password: string }): Promise<UserData> {
    const response = await this.client.post('/account/otp/disable', payload);
    return response.data;
  }

  async createUser(userData: any): Promise<UserData> {
    const response = await this.client.post('/users/', userData);
    return response.data;
  }

  // Additional API methods can be added here
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<UserData[]> {
    const response = await this.client.get('/users/', { params });
    return response.data;
  }

  async getUsersCount(status?: string): Promise<{ total_users: number }> {
    const params = status ? { status } : {};
    const response = await this.client.get('/users/count/total', { params });
    return response.data;
  }

  async getUserDashboard(): Promise<any> {
    const response = await this.client.get('/dashboard/me');
    return response.data;
  }

  async getInvestmentPackages(): Promise<any[]> {
    const response = await this.client.get('/investments/packages');
    return response.data;
  }

  async getMyInvestments(): Promise<any[]> {
    const response = await this.client.get('/investments/me');
    return response.data;
  }

  async getMyTransactions(limit = 20): Promise<any[]> {
    const response = await this.client.get('/transactions/me', { params: { limit } });
    return response.data;
  }

  async getMyWithdrawals(): Promise<any[]> {
    const response = await this.client.get('/withdrawals/my');
    return response.data;
  }

  async getNews(limit = 10): Promise<any[]> {
    const response = await this.client.get('/content/news', { params: { limit } });
    return response.data;
  }

  async getSupportFaq(limit = 20): Promise<any[]> {
    const response = await this.client.get('/content/support/faq', { params: { limit } });
    return response.data;
  }

  async getP2PMarket(asset = 'CNYT'): Promise<any> {
    const response = await this.client.get('/market/p2p', { params: { asset } });
    return response.data;
  }

  async purchaseInvestment(payload: { package_id: string; amount?: number }): Promise<any> {
    const response = await this.client.post('/investments/purchase', payload);
    return response.data;
  }

  async createP2POrder(payload: {
    asset: string;
    trade_type: 'buy' | 'sell';
    amount: number;
    price_per_unit: number;
    currency: string;
  }): Promise<any> {
    const response = await this.client.post('/market/p2p/orders', payload);
    return response.data;
  }

  async getMyMarketOrders(asset = 'CNYT'): Promise<any> {
    const response = await this.client.get('/market/p2p/orders/me', { params: { asset } });
    return response.data;
  }

  async cancelP2POrder(tradeId: string): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/cancel`);
    return response.data;
  }

  async completeP2POrder(tradeId: string): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/complete`);
    return response.data;
  }

  async fillP2POrder(tradeId: string, payload: { amount: number }): Promise<any> {
    const response = await this.client.post(`/market/p2p/orders/${tradeId}/fill`, payload);
    return response.data;
  }

  async createWithdrawal(payload: { amount: number; asset: 'USDT' | 'CNYT'; network: string; wallet_address: string; trading_password: string; otp_code?: string }): Promise<any> {
    const response = await this.client.post('/withdrawals', payload);
    return response.data;
  }

  async createWalletTransfer(payload: { recipient: string; amount: number; asset: string; trading_password: string }): Promise<any> {
    const response = await this.client.post('/wallet/transfers', payload);
    return response.data;
  }

  async createDepositRequest(payload: {
    leader_id: string;
    leader_name: string;
    bank_account?: string;
    deposit_amount?: number;
    notes?: string;
  }): Promise<any> {
    const response = await this.client.post('/wallet/deposit-requests', payload);
    return response.data;
  }

  async getMyDepositRequests(): Promise<any[]> {
    const response = await this.client.get('/wallet/deposit-requests/me');
    return response.data;
  }

  async convertToCNYT(payload: { amount: number }): Promise<any> {
    const response = await this.client.post('/wallet/conversions', payload);
    return response.data;
  }

  async createSupportTicket(payload: {
    title: string;
    description: string;
    category: string;
    priority?: string;
  }): Promise<any> {
    const response = await this.client.post('/support/tickets', payload);
    return response.data;
  }

  async getMySupportTickets(): Promise<any[]> {
    const response = await this.client.get('/support/tickets/my');
    return response.data;
  }

  async createFraudReport(payload: {
    fraudster_uid: string;
    fraud_reason: string;
    description: string;
    evidence: string[];
  }): Promise<any> {
    const response = await this.client.post('/support/fraud-reports', payload);
    return response.data;
  }

  async terminateInvestment(investmentId: string): Promise<any> {
    const response = await this.client.post(`/investments/${investmentId}/terminate`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearAuth(): void {
    this.removeToken();
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

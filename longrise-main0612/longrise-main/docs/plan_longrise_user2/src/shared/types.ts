/**
 * Shared Types - LONGRISE-AI-MAIN & LONGRISE-AI-ADMIN 통합 데이터 모델
 * 양쪽 프로젝트에서 동일하게 사용
 */

// ============= 기본 사용자 데이터 =============
export interface UserData {
  // 기본 정보
  id: string;                              // 고유 ID (예: "user_001")
  nickname: string;                        // 회원 ID/닉네임 (예: "GoldenDragon")
  name?: string;                           // 실명 (선택)
  email: string;                           // 이메일
  phone?: string;                          // 전화번호

  // 계정 상태
  rank: string;                            // 등급 (예: "Blue Dragon", "Red Dragon")
  status: 'active' | 'inactive' | 'banned' | 'suspended'; // 계정 상태
  joinDate: string;                        // 가입일 (YYYY-MM-DD)

  // 자산 정보
  balanceUSDT: number;                     // USDT 잔액 (가용)
  lockedUSDT?: number;                     // USDT 잠금 (스테이킹)
  balanceCNYT: number;                     // CNYT 토큰 (보상)
  totalAssets?: number;                    // 총 자산 (계산됨)

  // 투자 정보
  package: string;                         // 투자 패키지 (Flexible/Basic/Standard/Premium/VIP)
  initialInvestment: number;               // 초기 투자액
  investmentDate?: string;                 // 투자일

  // 팀/조직 정보
  sponsorId: string;                       // 후원자 ID (직접추천인)
  teamSize: number;                        // 팀 크기 (직접 추천 수)
  teamVol: number;                         // 팀 볼륨 (전체 팀 거래량)
  bodyValue?: number;                      // 본인 가치 (거래량)

  // 인증 정보
  kycLevel: number;                        // KYC/얼굴인증 레벨 (0-3)
  kycStatus?: 'pending' | 'verified' | 'rejected'; // 인증 상태
  kycUpdatedAt?: string;                   // 인증 업데이트 날짜
  pageface?: boolean;                      // 페이지 얼굴인증 여부
  mobileBinding?: boolean;                 // 모바일 바인딩 여부

  // 보안 정보
  tradingPassword?: string;                // 거래 비밀번호 (해시됨)
  hasSetTradingPassword: boolean;          // 거래 비밀번호 설정 여부
  isTradingPasswordVerified?: boolean;     // 거래 비밀번호 검증 여부
  otp?: boolean;                           // 2FA 활성화 여부
  lastLoginAt?: string;                    // 마지막 로그인

  // 디스트리뷰터 정보
  distributorStatus: 'none' | 'pending' | 'approved'; // 디스트리뷰터 상태
  distributorCode?: string | null;         // 초대 코드
  distributorApprovedAt?: string;          // 승인일

  // 제한 조건 (관리자만 설정)
  restrictions?: {
    isWithdrawalBlocked?: boolean;         // 출금 차단
    isAccountLocked?: boolean;             // 계정 잠금
    isFrozen?: boolean;                    // 자산 동결
    blockReason?: string;                  // 차단 사유
    blockExpiresAt?: string;               // 차단 만료일
  };

  // 메타데이터
  createdAt: string;                       // 계정 생성일
  updatedAt: string;                       // 마지막 수정일
}

// ============= 거래 관련 =============
export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'commission' | 'adjustment' | 'swap';
  amount: number;
  currency: 'USDT' | 'CNYT';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  completedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: 'USDT' | 'CNYT';
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

// ============= 관리자 관련 =============
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'super' | 'finance' | 'community' | 'content';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: 'user' | 'product' | 'transaction' | 'content' | 'system';
  resourceId: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: string;
}

// ============= 패키지 정보 =============
export interface PackagePolicy {
  id: string;
  name: string;
  label: 'Flexible' | 'Basic' | 'Standard' | 'Premium' | 'VIP';
  usdtDaily: number;                       // USDT 일일 수익률 (%)
  cnytDaily: number;                       // CNYT 일일 수익률 (%)
  minInvestment: number;                   // 최소 투자액
  maturityMonths: number;                  // 만기 (개월)
  earlyWithdrawalPenalty: Record<string, number>; // 조기 출금 수수료
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============= API 응답 =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

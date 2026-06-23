export type DragonRank = 'Investor' | 'White Dragon' | 'Blue Dragon' | 'Purple Dragon' | 'Red Dragon' | 'Black Dragon';
export type PagefaceStatus = 'Approved' | 'Pending' | 'Rejected' | 'None';
export type UserStatus = 'Active' | 'Inactive';
export type PayoutStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RECOVERED';
export type PayoutType = 'Daily ROI' | 'Direct Bonus' | 'Rollup Bonus' | 'Rank Share' | 'CNYT Airdrop' | 'Promotion';

export interface UserWallet {
  type: string;
  label: string;
  address: string;
  isPrimary: boolean;
}

export interface UserPackage {
  type: string;
  price: number;
  date: string;
  qty?: number;
}

// 디스트리뷰터 정보
export interface DistributorInfo {
  id: string;
  code: string;                                    // 디스트리뷰터 코드
  status: 'pending' | 'approved' | 'rejected';   // 신청 상태
  applicationDate: string;                        // 신청 날짜
  approvalDate?: string;                          // 승인 날짜
  rejectionReason?: string;                       // 거절 사유
  commissionRate: number;                         // 수수료율 (%)
  totalCommission: number;                        // 누적 수수료
  referredCount: number;                          // 추천한 회원 수
}

// 회원 투자 패키지 (상세 정보)
export interface MemberPackage {
  id: string;
  packageType: 'Flexible' | 'Basic' | 'Standard' | 'Premium' | 'VIP';
  principal: number;           // 원금 (투입액)
  joinDate: Date;              // 진입일
  maturityDate: Date;          // 만기일
  currentBalance: number;      // 현재 자산
  currentROI: number;          // 현재까지 ROI (%)
  expectedROI: number;         // 예상 최종 ROI (%)
  status: 'active' | 'early_termination_pending' | 'early_terminated' | 'matured';
  expectedRefund: number;      // 예상 환급액
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  rank: DragonRank;
  bodyValue: number;
  directs: number;
  teamSize: number;
  teamVol: number;
  vpx: string;
  usdt: number;
  cnyt: number;
  pageface: PagefaceStatus;
  otp: boolean;
  mobileBinding: boolean;
  status: UserStatus;
  joinDate: string;
  sponsorId: string;
  packages: MemberPackage[];  // 통일된 회원 투자 패키지 모델
  permissions: {
    deposit: boolean;
    withdraw: boolean;
    swap: boolean;
  };
  wallets: UserWallet[];
  tradingPinSet: boolean;
  hasSetTradingPassword: boolean;       // 거래 비밀번호 설정 여부
  isTradingPasswordVerified: boolean;   // 거래 비밀번호 검증 여부
  antiPhishingCode: string;
  maxOutRatio: number; // 0 to 10.0 (1000%)
  isFrozen: boolean;
  totalEarnings: number;
  distributor?: DistributorInfo;         // 디스트리뷰터 정보 (선택사항)
  memberLifecycleStatus?: 'new' | 'active' | 'suspended' | 'inactive' | 'withdrew';  // 회원 생명주기
  loginHistory: {
    device: string;
    location: string;
    ip: string;
    date: string;
  }[];
}

export interface PayoutLog {
  id: string;
  user: string;
  type: PayoutType;
  amount: string; // e.g. "120.00 USDT"
  status: string;
  reason: string;
  date: string;
}

export interface P2PLog {
  txId: string;
  sender: string;
  receiver: string;
  amount: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  withdrawalId: string;
  amount: number;
  asset: string;
  requestTime: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SupportTicket {
  id: string;
  category: 'FINANCE' | 'TECHNICAL' | 'GENERAL';
  title: string;
  author: string;
  date: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  content: string;
  responses: {
    admin: string;
    message: string;
    timestamp: string;
  }[];
  resolvedAt: string | null;
  responseTime?: number; // minutes
}

// ========== 어드민 인증 시스템 ==========

export type AdminRole = 'super' | 'finance' | 'community' | 'content';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  name: string;
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string; // 'create', 'update', 'delete', 'approve', 'reject', etc.
  resource: string; // 'user', 'withdrawal', 'product', 'cms', etc.
  resourceId: string;
  changes?: Record<string, any>; // 변경 전후 데이터
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
  ipAddress?: string;
}

// ========== New Modular Type Exports ==========

// API types
export * from './api';

// Feature-specific types
export * from '../features/users/types';
export * from '../features/transactions/types';
export * from '../features/withdrawals/types';

// Shared types
export * from './shared';
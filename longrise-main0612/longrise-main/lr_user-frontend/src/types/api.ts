/**
 * API Types for Longrise AI Platform
 * Compatible with FastAPI backend responses
 */

// ============= Authentication =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ============= User Data =============
export interface UserData {
  // Basic info
  id: string;
  nickname: string;
  email: string;
  name?: string;
  phone?: string;

  // Account status
  rank: 'Investor' | 'White Dragon' | 'Blue Dragon' | 'Purple Dragon' | 'Red Dragon' | 'Black Dragon';
  status: 'active' | 'inactive' | 'banned' | 'suspended';
  join_date: string;

  // Assets
  balance_usdt: number;
  locked_usdt: number;
  balance_cnyt: number;
  total_assets: number;

  // Investment
  package: string;
  initial_investment: number;
  investment_date?: string;

  // Team/Organization
  sponsor_id?: string;
  team_size: number;
  team_vol: number;
  body_value: number;
  referral_code?: string;
  referred_by_code?: string;

  // KYC
  kyc_level: number;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_updated_at?: string;
  pageface: boolean;
  mobile_binding: boolean;

  // Security
  has_set_trading_password: boolean;
  is_trading_password_verified: boolean;
  otp_enabled: boolean;
  otp_configured?: boolean;
  last_login_at?: string;
  anti_phishing_code?: string;

  // Distributor
  distributor_status: 'none' | 'pending' | 'approved' | 'rejected';
  distributor_code?: string;
  distributor_approved_at?: string;
  commission_rate: number;
  total_commission: number;
  referred_count: number;

  // Restrictions
  is_withdrawal_blocked: boolean;
  is_account_locked: boolean;
  is_frozen: boolean;
  block_reason?: string;
  block_expires_at?: string;
  max_out_ratio: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  nickname: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  trading_password?: string;
}

export interface UserUpdate {
  nickname?: string;
  name?: string;
  phone?: string;
  anti_phishing_code?: string;
  mobile_binding?: boolean;
}

// ============= Transactions =============
export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'commission' | 'adjustment' | 'swap' | 'daily_roi' | 'direct_bonus' | 'rollup_bonus';
  amount: number;
  currency: 'USDT' | 'CNYT' | 'BTC' | 'ETH';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  hash?: string;
  fee: number;
  created_at: string;
  completed_at?: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: 'USDT' | 'CNYT' | 'BTC' | 'ETH';
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  transaction_hash?: string;
}

// ============= Packages =============
export interface PackagePolicy {
  id: string;
  name: string;
  label: 'Flexible' | 'Basic' | 'Standard' | 'Premium' | 'VIP';
  usdt_daily: number;
  cnyt_daily: number;
  min_investment: number;
  maturity_months: number;
  early_withdrawal_penalty: Record<string, number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberPackage {
  id: string;
  user_id: string;
  package_type: 'Flexible' | 'Basic' | 'Standard' | 'Premium' | 'VIP';
  principal: number;
  join_date: string;
  maturity_date: string;
  current_balance: number;
  current_roi: number;
  expected_roi: number;
  status: 'active' | 'early_termination_pending' | 'early_terminated' | 'matured';
  expected_refund?: number;
  created_at: string;
  updated_at: string;
}

// ============= API Responses =============
export interface ApiError {
  detail: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============= Application State =============
export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  theme: 'light' | 'dark';
  language: 'en' | 'ko' | 'zh';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ============= Form Types =============
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  phone?: string;
  sponsorCode?: string;
  referralCode?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface ProfileUpdateForm {
  name?: string;
  phone?: string;
  antiPhishingCode?: string;
}

export interface SecurityUpdateForm {
  currentPassword: string;
  newPassword?: string;
  confirmNewPassword?: string;
  tradingPassword?: string;
  confirmTradingPassword?: string;
  enableOTP?: boolean;
}

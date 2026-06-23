/**
 * Investment feature type definitions
 */

// Investment package enums
export enum PackageType {
  FLEXIBLE = 'flexible',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VIP = 'vip',
}

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated',
}

export enum InvestmentStatus {
  ACTIVE = 'active',
  EARLY_TERMINATION_PENDING = 'early_termination_pending',
  EARLY_TERMINATED = 'early_terminated',
  MATURED = 'matured',
  CANCELLED = 'cancelled',
}

// Investment package interfaces
export interface InvestmentPackage {
  id: string;
  name: string;
  type: PackageType;
  status: PackageStatus;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  roi_rate: number; // Daily ROI percentage
  early_termination_fee: number;
  description: string;
  terms_conditions: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPackageCreate {
  name: string;
  type: PackageType;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  roi_rate: number;
  early_termination_fee: number;
  description: string;
  terms_conditions: string;
}

export interface InvestmentPackageUpdate {
  name?: string;
  status?: PackageStatus;
  min_amount?: number;
  max_amount?: number;
  roi_rate?: number;
  early_termination_fee?: number;
  description?: string;
  terms_conditions?: string;
}

// User investment interfaces
export interface UserInvestment {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  status: InvestmentStatus;
  roi_earned: number;
  daily_roi: number;
  start_date: string;
  maturity_date: string;
  early_termination_date?: string;
  early_termination_reason?: string;
  created_at: string;
  updated_at: string;
  // Related data
  user?: {
    id: string;
    username: string;
    email: string;
  };
  package?: InvestmentPackage;
}

export interface UserInvestmentCreate {
  user_id: string;
  package_id: string;
  amount: number;
}

export interface UserInvestmentUpdate {
  status?: InvestmentStatus;
  early_termination_reason?: string;
}

// Investment filters
export interface InvestmentPackageFilters {
  type?: PackageType[];
  status?: PackageStatus[];
  min_amount_min?: number;
  min_amount_max?: number;
  roi_rate_min?: number;
  roi_rate_max?: number;
  search?: string;
}

export interface UserInvestmentFilters {
  user_id?: string;
  package_id?: string;
  status?: InvestmentStatus[];
  amount_min?: number;
  amount_max?: number;
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
}

// Investment statistics
export interface InvestmentStats {
  total_packages: number;
  active_packages: number;
  total_investments: number;
  active_investments: number;
  total_invested_amount: number;
  total_roi_paid: number;
  by_package_type: Record<PackageType, { count: number; amount: number }>;
  by_status: Record<InvestmentStatus, number>;
  recent_investments: UserInvestment[];
}
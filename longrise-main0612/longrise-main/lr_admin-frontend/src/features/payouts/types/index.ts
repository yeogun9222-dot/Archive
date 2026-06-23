/**
 * Payout feature type definitions
 */

// Payout enums
export enum PayoutType {
  DAILY_ROI = 'daily_roi',
  DIRECT_BONUS = 'direct_bonus',
  ROLLUP_BONUS = 'rollup_bonus',
  RANK_SHARE = 'rank_share',
  CNYT_AIRDROP = 'cnyt_airdrop',
  PROMOTION = 'promotion',
  REFERRAL_BONUS = 'referral_bonus',
  LEADERSHIP_BONUS = 'leadership_bonus',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Payout interfaces
export interface Payout {
  id: string;
  user_id: string;
  type: PayoutType;
  amount: number;
  currency: string;
  status: PayoutStatus;
  description: string;
  reference_id?: string;
  batch_id?: string;
  scheduled_date?: string;
  processed_date?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Related data
  user?: {
    id: string;
    username: string;
    email: string;
    balance: number;
  };
}

export interface PayoutCreate {
  user_id: string;
  type: PayoutType;
  amount: number;
  currency: string;
  description: string;
  reference_id?: string;
  scheduled_date?: string;
  metadata?: Record<string, any>;
}

export interface PayoutUpdate {
  status?: PayoutStatus;
  description?: string;
  scheduled_date?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
}

// Payout settings
export interface PayoutSettings {
  id: string;
  type: PayoutType;
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  daily_limit: number;
  monthly_limit: number;
  auto_process: boolean;
  requires_approval: boolean;
  fee_percentage: number;
  processing_delay_hours: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutSettingsCreate {
  type: PayoutType;
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  daily_limit: number;
  monthly_limit: number;
  auto_process: boolean;
  requires_approval: boolean;
  fee_percentage: number;
  processing_delay_hours: number;
  description: string;
}

export interface PayoutSettingsUpdate {
  enabled?: boolean;
  min_amount?: number;
  max_amount?: number;
  daily_limit?: number;
  monthly_limit?: number;
  auto_process?: boolean;
  requires_approval?: boolean;
  fee_percentage?: number;
  processing_delay_hours?: number;
  description?: string;
}

// Payout filters
export interface PayoutFilters {
  user_id?: string;
  type?: PayoutType[];
  status?: PayoutStatus[];
  amount_min?: number;
  amount_max?: number;
  currency?: string[];
  batch_id?: string;
  created_from?: string;
  created_to?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  search?: string;
}

// Payout batch
export interface PayoutBatch {
  id: string;
  name: string;
  type: PayoutType;
  total_amount: number;
  total_count: number;
  processed_count: number;
  failed_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_date: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
}

// Payout statistics
export interface PayoutStats {
  total_payouts: number;
  total_amount: number;
  pending_count: number;
  pending_amount: number;
  today_count: number;
  today_amount: number;
  failed_count: number;
  by_type: Record<PayoutType, { count: number; amount: number }>;
  by_status: Record<PayoutStatus, number>;
  recent_payouts: Payout[];
}
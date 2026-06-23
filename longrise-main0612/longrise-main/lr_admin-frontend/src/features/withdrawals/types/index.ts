/**
 * Withdrawal feature type definitions
 */

// Withdrawal enums
export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WithdrawalType {
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  DIGITAL_WALLET = 'digital_wallet',
}

export enum Network {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
  TRON = 'tron',
  POLYGON = 'polygon',
  BSC = 'bsc',
}

// Withdrawal interfaces
export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: WithdrawalType;
  status: WithdrawalStatus;
  network?: Network;
  wallet_address?: string;
  bank_account?: {
    account_number: string;
    bank_name: string;
    account_holder: string;
  };
  fee: number;
  final_amount: number;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  completed_at?: string;
  // Related data
  user?: {
    id: string;
    username: string;
    email: string;
    balance: number;
  };
  approver?: {
    id: string;
    username: string;
  };
}

export interface WithdrawalCreate {
  user_id: string;
  amount: number;
  currency: string;
  type: WithdrawalType;
  network?: Network;
  wallet_address?: string;
  bank_account?: {
    account_number: string;
    bank_name: string;
    account_holder: string;
  };
  notes?: string;
}

export interface WithdrawalApproval {
  status: WithdrawalStatus.APPROVED | WithdrawalStatus.REJECTED;
  admin_notes?: string;
}

// Withdrawal filters
export interface WithdrawalFilters {
  user_id?: string;
  status?: WithdrawalStatus[];
  type?: WithdrawalType[];
  network?: Network[];
  amount_min?: number;
  amount_max?: number;
  currency?: string[];
  created_from?: string;
  created_to?: string;
  search?: string;
}

// Withdrawal statistics
export interface WithdrawalStats {
  pending_count: number;
  pending_amount: number;
  approved_today_count: number;
  approved_today_amount: number;
  total_this_month: number;
  by_status: Record<WithdrawalStatus, { count: number; amount: number }>;
  by_type: Record<WithdrawalType, { count: number; amount: number }>;
  recent_requests: Withdrawal[];
}
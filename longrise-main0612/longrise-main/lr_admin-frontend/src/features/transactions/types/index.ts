/**
 * Transaction feature type definitions
 */

// Transaction enums
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVESTMENT = 'investment',
  PAYOUT = 'payout',
  DIVIDEND = 'dividend',
  TRADE = 'trade',
  FEE = 'fee',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

// Transaction interfaces
export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  fee?: number;
  description: string;
  reference_id?: string;
  external_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Related data
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface TransactionCreate {
  user_id: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  fee?: number;
  description: string;
  reference_id?: string;
  external_id?: string;
  metadata?: Record<string, any>;
}

export interface TransactionUpdate {
  status?: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
  completed_at?: string;
}

// Transaction filters
export interface TransactionFilters {
  user_id?: string;
  type?: TransactionType[];
  status?: TransactionStatus[];
  direction?: TransactionDirection[];
  amount_min?: number;
  amount_max?: number;
  currency?: string[];
  created_from?: string;
  created_to?: string;
  search?: string;
}

// Transaction statistics
export interface TransactionStats {
  total_count: number;
  total_volume: number;
  today_count: number;
  today_volume: number;
  by_type: Record<TransactionType, { count: number; volume: number }>;
  by_status: Record<TransactionStatus, number>;
  recent_transactions: Transaction[];
}
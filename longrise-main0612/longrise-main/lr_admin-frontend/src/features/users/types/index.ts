/**
 * User management feature type definitions
 */

// User status and rank enums
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
}

export enum DragonRank {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  MASTER = 'master',
}

// Base user interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  status: UserStatus;
  rank: DragonRank;
  created_at: string;
  updated_at: string;
  last_login?: string;
  verification_status: boolean;
  kyc_status: 'pending' | 'approved' | 'rejected';
  balance: number;
  total_investment: number;
  total_payout: number;
}

// User creation and update
export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  rank?: DragonRank;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  rank?: DragonRank;
}

// User filters and search
export interface UserFilters {
  status?: UserStatus[];
  rank?: DragonRank[];
  verification_status?: boolean;
  kyc_status?: string[];
  created_date_from?: string;
  created_date_to?: string;
  search?: string;
}

// User statistics
export interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  new_users_today: number;
  new_users_this_month: number;
  by_rank: Record<DragonRank, number>;
  by_status: Record<UserStatus, number>;
}
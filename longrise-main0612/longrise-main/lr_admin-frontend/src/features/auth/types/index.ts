/**
 * Authentication feature type definitions
 */

// Admin role types (enhanced from existing)
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  COMPLIANCE = 'compliance',
  SUPPORT = 'support',
  VIEWER = 'viewer',
}

// Admin status
export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
}

// Auth interfaces
export interface Admin {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: string[];
  last_login?: string;
  last_login_ip?: string;
  failed_login_attempts: number;
  locked_until?: string;
  must_change_password: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AdminCreate {
  username: string;
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  permissions?: string[];
  must_change_password?: boolean;
  two_factor_enabled?: boolean;
}

export interface AdminUpdate {
  username?: string;
  email?: string;
  name?: string;
  role?: AdminRole;
  status?: AdminStatus;
  permissions?: string[];
  must_change_password?: boolean;
  two_factor_enabled?: boolean;
}

export interface AdminLogin {
  username: string;
  password: string;
  two_factor_code?: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  admin: Admin;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  permissions: string[];
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Session management
export interface AdminSession {
  id: string;
  admin_id: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  is_current: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface TwoFactorVerification {
  code: string;
}

// Login history
export interface LoginHistory {
  id: string;
  admin_id: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  status: 'success' | 'failed' | 'blocked';
  failure_reason?: string;
  created_at: string;
}

// Admin filters
export interface AdminFilters {
  role?: AdminRole[];
  status?: AdminStatus[];
  two_factor_enabled?: boolean;
  last_login_from?: string;
  last_login_to?: string;
  created_from?: string;
  created_to?: string;
  search?: string;
}

// Auth statistics
export interface AuthStats {
  total_admins: number;
  active_admins: number;
  suspended_admins: number;
  locked_admins: number;
  online_admins: number;
  two_factor_enabled_count: number;
  failed_logins_today: number;
  by_role: Record<AdminRole, number>;
}
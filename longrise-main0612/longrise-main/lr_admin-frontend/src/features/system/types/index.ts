/**
 * System feature type definitions
 */

// System setting enums
export enum SettingCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  FINANCIAL = 'financial',
  NOTIFICATION = 'notification',
  API = 'api',
  UI = 'ui',
  BACKUP = 'backup',
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
  PASSWORD = 'password',
}

// FDS (Fraud Detection System) enums
export enum FDSRuleType {
  VELOCITY = 'velocity',
  PATTERN = 'pattern',
  AMOUNT = 'amount',
  FREQUENCY = 'frequency',
  DEVICE = 'device',
  LOCATION = 'location',
}

export enum FDSSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum FDSAlertStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// Approval system enums
export enum ApprovalType {
  WITHDRAWAL = 'withdrawal',
  PAYOUT = 'payout',
  USER_MODIFICATION = 'user_modification',
  SYSTEM_SETTING = 'system_setting',
  INVESTMENT_PACKAGE = 'investment_package',
  MANUAL_TRANSACTION = 'manual_transaction',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

// System setting interfaces
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  description: string;
  default_value: any;
  is_sensitive: boolean;
  requires_restart: boolean;
  validation_rule?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface SystemSettingCreate {
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  description: string;
  default_value: any;
  is_sensitive?: boolean;
  requires_restart?: boolean;
  validation_rule?: string;
}

export interface SystemSettingUpdate {
  value?: any;
  description?: string;
  default_value?: any;
  is_sensitive?: boolean;
  requires_restart?: boolean;
  validation_rule?: string;
}

// FDS Alert interfaces
export interface FDSAlert {
  id: string;
  rule_type: FDSRuleType;
  severity: FDSSeverity;
  status: FDSAlertStatus;
  title: string;
  description: string;
  user_id?: string;
  transaction_id?: string;
  metadata: Record<string, any>;
  triggered_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  user?: {
    id: string;
    username: string;
    email: string;
  };
  resolver?: {
    id: string;
    username: string;
  };
}

export interface FDSAlertCreate {
  rule_type: FDSRuleType;
  severity: FDSSeverity;
  title: string;
  description: string;
  user_id?: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
}

export interface FDSAlertUpdate {
  status?: FDSAlertStatus;
  resolution_notes?: string;
}

// Approval request interfaces
export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  title: string;
  description: string;
  resource_id: string;
  resource_data: Record<string, any>;
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Related data
  requester?: {
    id: string;
    username: string;
  };
  approver?: {
    id: string;
    username: string;
  };
}

export interface ApprovalRequestCreate {
  type: ApprovalType;
  title: string;
  description: string;
  resource_id: string;
  resource_data: Record<string, any>;
  expires_at?: string;
}

export interface ApprovalAction {
  request_id: string;
  action: 'approve' | 'reject';
  notes?: string;
}

// Filter interfaces
export interface SystemSettingFilters {
  category?: SettingCategory[];
  type?: SettingType[];
  is_sensitive?: boolean;
  search?: string;
}

export interface FDSAlertFilters {
  rule_type?: FDSRuleType[];
  severity?: FDSSeverity[];
  status?: FDSAlertStatus[];
  user_id?: string;
  triggered_from?: string;
  triggered_to?: string;
  search?: string;
}

export interface ApprovalRequestFilters {
  type?: ApprovalType[];
  status?: ApprovalStatus[];
  requested_by?: string;
  approved_by?: string;
  created_from?: string;
  created_to?: string;
  search?: string;
}

// Statistics interfaces
export interface SystemStats {
  total_settings: number;
  sensitive_settings: number;
  open_alerts: number;
  critical_alerts: number;
  pending_approvals: number;
  server_uptime: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  active_sessions: number;
}
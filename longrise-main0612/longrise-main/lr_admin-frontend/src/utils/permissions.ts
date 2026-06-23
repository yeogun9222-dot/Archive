/**
 * Permissions utilities - Role-based access control
 */

// Admin permission types
export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  BLOCK_USERS = 'block_users',
  MANAGE_USER_VERIFICATION = 'manage_user_verification',

  // Financial operations
  VIEW_TRANSACTIONS = 'view_transactions',
  CREATE_TRANSACTIONS = 'create_transactions',
  EDIT_TRANSACTIONS = 'edit_transactions',
  DELETE_TRANSACTIONS = 'delete_transactions',

  // Withdrawal management
  VIEW_WITHDRAWALS = 'view_withdrawals',
  APPROVE_WITHDRAWALS = 'approve_withdrawals',
  REJECT_WITHDRAWALS = 'reject_withdrawals',
  PROCESS_WITHDRAWALS = 'process_withdrawals',

  // Payout management
  VIEW_PAYOUTS = 'view_payouts',
  CREATE_PAYOUTS = 'create_payouts',
  EDIT_PAYOUTS = 'edit_payouts',
  APPROVE_PAYOUTS = 'approve_payouts',

  // Investment management
  VIEW_INVESTMENTS = 'view_investments',
  CREATE_INVESTMENTS = 'create_investments',
  EDIT_INVESTMENTS = 'edit_investments',
  DELETE_INVESTMENTS = 'delete_investments',

  // System administration
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  MANAGE_ADMINS = 'manage_admins',
  VIEW_SYSTEM_STATS = 'view_system_stats',

  // P2P trading
  VIEW_P2P_TRADES = 'view_p2p_trades',
  MANAGE_P2P_DISPUTES = 'manage_p2p_disputes',

  // Content management
  VIEW_CMS = 'view_cms',
  CREATE_CMS_CONTENT = 'create_cms_content',
  EDIT_CMS_CONTENT = 'edit_cms_content',
  DELETE_CMS_CONTENT = 'delete_cms_content',
  MANAGE_SUPPORT_TICKETS = 'manage_support_tickets',

  // Reconciliation
  VIEW_RECONCILIATION = 'view_reconciliation',
  MANAGE_RECONCILIATION = 'manage_reconciliation',
  APPROVE_RECONCILIATION = 'approve_reconciliation',

  // Advanced permissions
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  MANAGE_API_KEYS = 'manage_api_keys',
  VIEW_ERROR_LOGS = 'view_error_logs',
}

// Admin role types
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
  SUPPORT = 'support',
  FINANCE = 'finance',
  COMPLIANCE = 'compliance',
}

// Role permission mappings
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission), // All permissions

  [AdminRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.BLOCK_USERS,
    Permission.MANAGE_USER_VERIFICATION,
    Permission.VIEW_TRANSACTIONS,
    Permission.CREATE_TRANSACTIONS,
    Permission.EDIT_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.APPROVE_WITHDRAWALS,
    Permission.REJECT_WITHDRAWALS,
    Permission.PROCESS_WITHDRAWALS,
    Permission.VIEW_PAYOUTS,
    Permission.CREATE_PAYOUTS,
    Permission.EDIT_PAYOUTS,
    Permission.APPROVE_PAYOUTS,
    Permission.VIEW_INVESTMENTS,
    Permission.CREATE_INVESTMENTS,
    Permission.EDIT_INVESTMENTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_STATS,
    Permission.VIEW_P2P_TRADES,
    Permission.MANAGE_P2P_DISPUTES,
    Permission.VIEW_CMS,
    Permission.CREATE_CMS_CONTENT,
    Permission.EDIT_CMS_CONTENT,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.VIEW_RECONCILIATION,
    Permission.MANAGE_RECONCILIATION,
    Permission.EXPORT_DATA,
  ],

  [AdminRole.MANAGER]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.BLOCK_USERS,
    Permission.MANAGE_USER_VERIFICATION,
    Permission.VIEW_TRANSACTIONS,
    Permission.EDIT_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.APPROVE_WITHDRAWALS,
    Permission.REJECT_WITHDRAWALS,
    Permission.VIEW_PAYOUTS,
    Permission.APPROVE_PAYOUTS,
    Permission.VIEW_INVESTMENTS,
    Permission.EDIT_INVESTMENTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_SYSTEM_STATS,
    Permission.VIEW_P2P_TRADES,
    Permission.MANAGE_P2P_DISPUTES,
    Permission.VIEW_CMS,
    Permission.EDIT_CMS_CONTENT,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.VIEW_RECONCILIATION,
    Permission.EXPORT_DATA,
  ],

  [AdminRole.OPERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.PROCESS_WITHDRAWALS,
    Permission.VIEW_PAYOUTS,
    Permission.VIEW_INVESTMENTS,
    Permission.VIEW_P2P_TRADES,
    Permission.VIEW_CMS,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.VIEW_RECONCILIATION,
  ],

  [AdminRole.FINANCE]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.CREATE_TRANSACTIONS,
    Permission.EDIT_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.APPROVE_WITHDRAWALS,
    Permission.REJECT_WITHDRAWALS,
    Permission.PROCESS_WITHDRAWALS,
    Permission.VIEW_PAYOUTS,
    Permission.CREATE_PAYOUTS,
    Permission.EDIT_PAYOUTS,
    Permission.APPROVE_PAYOUTS,
    Permission.VIEW_INVESTMENTS,
    Permission.VIEW_RECONCILIATION,
    Permission.MANAGE_RECONCILIATION,
    Permission.APPROVE_RECONCILIATION,
    Permission.EXPORT_DATA,
  ],

  [AdminRole.COMPLIANCE]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_USER_VERIFICATION,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_P2P_TRADES,
    Permission.MANAGE_P2P_DISPUTES,
    Permission.VIEW_RECONCILIATION,
    Permission.EXPORT_DATA,
  ],

  [AdminRole.SUPPORT]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_CMS,
    Permission.MANAGE_SUPPORT_TICKETS,
  ],

  [AdminRole.VIEWER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_WITHDRAWALS,
    Permission.VIEW_PAYOUTS,
    Permission.VIEW_INVESTMENTS,
    Permission.VIEW_SYSTEM_STATS,
    Permission.VIEW_P2P_TRADES,
    Permission.VIEW_CMS,
    Permission.VIEW_RECONCILIATION,
  ],
};

// Permission utility functions
export class PermissionManager {
  private userRole: AdminRole;
  private userPermissions: Permission[];

  constructor(userRole: AdminRole) {
    this.userRole = userRole;
    this.userPermissions = ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    return this.userPermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get all user permissions
   */
  getUserPermissions(): Permission[] {
    return [...this.userPermissions];
  }

  /**
   * Get user role
   */
  getUserRole(): AdminRole {
    return this.userRole;
  }

  /**
   * Check if user can access a specific feature
   */
  canAccessFeature(feature: string): boolean {
    const featurePermissions: Record<string, Permission[]> = {
      users: [Permission.VIEW_USERS],
      transactions: [Permission.VIEW_TRANSACTIONS],
      withdrawals: [Permission.VIEW_WITHDRAWALS],
      payouts: [Permission.VIEW_PAYOUTS],
      investments: [Permission.VIEW_INVESTMENTS],
      audit: [Permission.VIEW_AUDIT_LOGS],
      system: [Permission.MANAGE_SYSTEM_SETTINGS, Permission.VIEW_SYSTEM_STATS],
      p2p: [Permission.VIEW_P2P_TRADES],
      cms: [Permission.VIEW_CMS],
      reconciliation: [Permission.VIEW_RECONCILIATION],
    };

    const requiredPermissions = featurePermissions[feature];
    if (!requiredPermissions) {
      return false;
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Check if user can perform a specific action
   */
  canPerformAction(action: string, resource: string): boolean {
    const actionPermissionMap: Record<string, Record<string, Permission[]>> = {
      view: {
        users: [Permission.VIEW_USERS],
        transactions: [Permission.VIEW_TRANSACTIONS],
        withdrawals: [Permission.VIEW_WITHDRAWALS],
        payouts: [Permission.VIEW_PAYOUTS],
        investments: [Permission.VIEW_INVESTMENTS],
        audit: [Permission.VIEW_AUDIT_LOGS],
        p2p: [Permission.VIEW_P2P_TRADES],
        cms: [Permission.VIEW_CMS],
        reconciliation: [Permission.VIEW_RECONCILIATION],
      },
      create: {
        users: [Permission.CREATE_USERS],
        transactions: [Permission.CREATE_TRANSACTIONS],
        payouts: [Permission.CREATE_PAYOUTS],
        investments: [Permission.CREATE_INVESTMENTS],
        cms: [Permission.CREATE_CMS_CONTENT],
      },
      edit: {
        users: [Permission.EDIT_USERS],
        transactions: [Permission.EDIT_TRANSACTIONS],
        payouts: [Permission.EDIT_PAYOUTS],
        investments: [Permission.EDIT_INVESTMENTS],
        cms: [Permission.EDIT_CMS_CONTENT],
      },
      delete: {
        users: [Permission.DELETE_USERS],
        transactions: [Permission.DELETE_TRANSACTIONS],
        investments: [Permission.DELETE_INVESTMENTS],
        cms: [Permission.DELETE_CMS_CONTENT],
      },
      approve: {
        withdrawals: [Permission.APPROVE_WITHDRAWALS],
        payouts: [Permission.APPROVE_PAYOUTS],
        reconciliation: [Permission.APPROVE_RECONCILIATION],
      },
    };

    const requiredPermissions = actionPermissionMap[action]?.[resource];
    if (!requiredPermissions) {
      return false;
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Get readable role name
   */
  static getRoleName(role: AdminRole): string {
    const roleNames: Record<AdminRole, string> = {
      [AdminRole.SUPER_ADMIN]: '최고관리자',
      [AdminRole.ADMIN]: '관리자',
      [AdminRole.MANAGER]: '매니저',
      [AdminRole.OPERATOR]: '운영자',
      [AdminRole.FINANCE]: '재무담당자',
      [AdminRole.COMPLIANCE]: '컴플라이언스',
      [AdminRole.SUPPORT]: '고객지원',
      [AdminRole.VIEWER]: '조회자',
    };

    return roleNames[role] || role;
  }

  /**
   * Get permission description
   */
  static getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      [Permission.VIEW_USERS]: '사용자 조회',
      [Permission.CREATE_USERS]: '사용자 생성',
      [Permission.EDIT_USERS]: '사용자 수정',
      [Permission.DELETE_USERS]: '사용자 삭제',
      [Permission.BLOCK_USERS]: '사용자 차단/해제',
      [Permission.MANAGE_USER_VERIFICATION]: '사용자 인증 관리',
      [Permission.VIEW_TRANSACTIONS]: '거래 내역 조회',
      [Permission.CREATE_TRANSACTIONS]: '거래 생성',
      [Permission.EDIT_TRANSACTIONS]: '거래 수정',
      [Permission.DELETE_TRANSACTIONS]: '거래 삭제',
      [Permission.VIEW_WITHDRAWALS]: '출금 요청 조회',
      [Permission.APPROVE_WITHDRAWALS]: '출금 승인',
      [Permission.REJECT_WITHDRAWALS]: '출금 거부',
      [Permission.PROCESS_WITHDRAWALS]: '출금 처리',
      [Permission.VIEW_PAYOUTS]: '배당 조회',
      [Permission.CREATE_PAYOUTS]: '배당 생성',
      [Permission.EDIT_PAYOUTS]: '배당 수정',
      [Permission.APPROVE_PAYOUTS]: '배당 승인',
      [Permission.VIEW_INVESTMENTS]: '투자 상품 조회',
      [Permission.CREATE_INVESTMENTS]: '투자 상품 생성',
      [Permission.EDIT_INVESTMENTS]: '투자 상품 수정',
      [Permission.DELETE_INVESTMENTS]: '투자 상품 삭제',
      [Permission.VIEW_AUDIT_LOGS]: '감사 로그 조회',
      [Permission.MANAGE_SYSTEM_SETTINGS]: '시스템 설정 관리',
      [Permission.MANAGE_ADMINS]: '관리자 계정 관리',
      [Permission.VIEW_SYSTEM_STATS]: '시스템 통계 조회',
      [Permission.VIEW_P2P_TRADES]: 'P2P 거래 조회',
      [Permission.MANAGE_P2P_DISPUTES]: 'P2P 분쟁 관리',
      [Permission.VIEW_CMS]: 'CMS 조회',
      [Permission.CREATE_CMS_CONTENT]: 'CMS 콘텐츠 생성',
      [Permission.EDIT_CMS_CONTENT]: 'CMS 콘텐츠 수정',
      [Permission.DELETE_CMS_CONTENT]: 'CMS 콘텐츠 삭제',
      [Permission.MANAGE_SUPPORT_TICKETS]: '고객지원 티켓 관리',
      [Permission.VIEW_RECONCILIATION]: '대사 관리 조회',
      [Permission.MANAGE_RECONCILIATION]: '대사 관리',
      [Permission.APPROVE_RECONCILIATION]: '대사 승인',
      [Permission.EXPORT_DATA]: '데이터 내보내기',
      [Permission.IMPORT_DATA]: '데이터 가져오기',
      [Permission.MANAGE_API_KEYS]: 'API 키 관리',
      [Permission.VIEW_ERROR_LOGS]: '오류 로그 조회',
    };

    return descriptions[permission] || permission;
  }
}

// React hook for permissions
export function usePermissions(userRole: AdminRole) {
  const permissionManager = new PermissionManager(userRole);

  return {
    hasPermission: permissionManager.hasPermission.bind(permissionManager),
    hasAnyPermission: permissionManager.hasAnyPermission.bind(permissionManager),
    hasAllPermissions: permissionManager.hasAllPermissions.bind(permissionManager),
    canAccessFeature: permissionManager.canAccessFeature.bind(permissionManager),
    canPerformAction: permissionManager.canPerformAction.bind(permissionManager),
    getUserPermissions: permissionManager.getUserPermissions.bind(permissionManager),
    getUserRole: permissionManager.getUserRole.bind(permissionManager),
  };
}
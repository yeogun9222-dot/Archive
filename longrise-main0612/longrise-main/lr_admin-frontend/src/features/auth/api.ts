/**
 * Authentication API service - All auth-related API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import {
  Admin,
  AdminCreate,
  AdminUpdate,
  AdminFilters,
  AdminLogin,
  AuthResponse,
  PasswordChange,
  PasswordReset,
  PasswordResetConfirm,
  AdminSession,
  TwoFactorSetup,
  TwoFactorVerification,
  LoginHistory,
  AuthStats
} from './types';

class AuthApiService extends BaseApiClient {
  // ========== Authentication ==========

  /**
   * Admin login
   */
  async login(credentials: AdminLogin): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/admin/auth/login', credentials);
  }

  /**
   * Admin logout
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.post<void>('/admin/auth/logout');
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string; expires_in: number }>> {
    return this.post<{ access_token: string; expires_in: number }>('/admin/auth/refresh', {
      refresh_token: refreshToken,
    });
  }

  /**
   * Get current admin profile
   */
  async getProfile(): Promise<ApiResponse<Admin>> {
    return this.get<Admin>('/admin/auth/profile');
  }

  /**
   * Update current admin profile
   */
  async updateProfile(data: Partial<AdminUpdate>): Promise<ApiResponse<Admin>> {
    return this.patch<Admin>('/admin/auth/profile', data);
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChange): Promise<ApiResponse<void>> {
    return this.post<void>('/admin/auth/change-password', data);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordReset): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/admin/auth/password-reset', data);
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/admin/auth/password-reset-confirm', data);
  }

  // ========== Two-Factor Authentication ==========

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(): Promise<ApiResponse<TwoFactorSetup>> {
    return this.post<TwoFactorSetup>('/admin/auth/2fa/setup');
  }

  /**
   * Verify two-factor authentication setup
   */
  async verifyTwoFactorSetup(data: TwoFactorVerification): Promise<ApiResponse<{ backup_codes: string[] }>> {
    return this.post<{ backup_codes: string[] }>('/admin/auth/2fa/verify-setup', data);
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(data: TwoFactorVerification): Promise<ApiResponse<void>> {
    return this.post<void>('/admin/auth/2fa/disable', data);
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<ApiResponse<{ backup_codes: string[] }>> {
    return this.post<{ backup_codes: string[] }>('/admin/auth/2fa/backup-codes');
  }

  // ========== Session Management ==========

  /**
   * Get current admin sessions
   */
  async getSessions(): Promise<ApiResponse<AdminSession[]>> {
    return this.get<AdminSession[]>('/admin/auth/sessions');
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<ApiResponse<{ revoked_count: number }>> {
    return this.post<{ revoked_count: number }>('/admin/auth/sessions/revoke-others');
  }

  // ========== Admin Management ==========

  /**
   * Get paginated list of admins (requires admin permissions)
   */
  async getAdmins(
    filters?: AdminFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Admin>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<Admin>>('/admin/admins', params);
  }

  /**
   * Get single admin by ID
   */
  async getAdmin(id: string): Promise<ApiResponse<Admin>> {
    return this.get<Admin>(`/admin/admins/${id}`);
  }

  /**
   * Create new admin
   */
  async createAdmin(data: AdminCreate): Promise<ApiResponse<Admin>> {
    return this.post<Admin>('/admin/admins', data);
  }

  /**
   * Update existing admin
   */
  async updateAdmin(id: string, data: AdminUpdate): Promise<ApiResponse<Admin>> {
    return this.patch<Admin>(`/admin/admins/${id}`, data);
  }

  /**
   * Delete admin
   */
  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/admins/${id}`);
  }

  /**
   * Suspend admin
   */
  async suspendAdmin(id: string, reason?: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/suspend`, { reason });
  }

  /**
   * Unsuspend admin
   */
  async unsuspendAdmin(id: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/unsuspend`);
  }

  /**
   * Lock admin account
   */
  async lockAdmin(id: string, reason?: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/lock`, { reason });
  }

  /**
   * Unlock admin account
   */
  async unlockAdmin(id: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/unlock`);
  }

  /**
   * Reset admin password
   */
  async resetAdminPassword(id: string): Promise<ApiResponse<{ temporary_password: string }>> {
    return this.post<{ temporary_password: string }>(`/admin/admins/${id}/reset-password`);
  }

  /**
   * Force admin to change password
   */
  async forcePasswordChange(id: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/force-password-change`);
  }

  /**
   * Disable admin two-factor authentication
   */
  async disableAdminTwoFactor(id: string): Promise<ApiResponse<Admin>> {
    return this.post<Admin>(`/admin/admins/${id}/disable-2fa`);
  }

  // ========== Login History & Analytics ==========

  /**
   * Get login history for current admin
   */
  async getMyLoginHistory(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<LoginHistory>>> {
    const params = pagination;
    return this.get<PaginatedResponse<LoginHistory>>('/admin/auth/login-history', params);
  }

  /**
   * Get login history for specific admin
   */
  async getAdminLoginHistory(
    adminId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<LoginHistory>>> {
    const params = pagination;
    return this.get<PaginatedResponse<LoginHistory>>(`/admin/admins/${adminId}/login-history`, params);
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<LoginHistory>>> {
    const params = { status: 'failed', ...pagination };
    return this.get<PaginatedResponse<LoginHistory>>('/admin/auth/failed-logins', params);
  }

  /**
   * Get authentication statistics
   */
  async getAuthStats(): Promise<ApiResponse<AuthStats>> {
    return this.get<AuthStats>('/admin/auth/stats');
  }

  /**
   * Get online admins
   */
  async getOnlineAdmins(): Promise<ApiResponse<Admin[]>> {
    return this.get<Admin[]>('/admin/auth/online');
  }

  // ========== Permission Management ==========

  /**
   * Get all available permissions
   */
  async getAvailablePermissions(): Promise<ApiResponse<{ permissions: string[]; descriptions: Record<string, string> }>> {
    return this.get<{ permissions: string[]; descriptions: Record<string, string> }>('/admin/auth/permissions');
  }

  /**
   * Check if current admin has specific permission
   */
  async checkPermission(permission: string): Promise<ApiResponse<{ has_permission: boolean }>> {
    return this.get<{ has_permission: boolean }>(`/admin/auth/check-permission/${permission}`);
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(role: string): Promise<ApiResponse<string[]>> {
    return this.get<string[]>(`/admin/auth/roles/${role}/permissions`);
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(role: string, permissions: string[]): Promise<ApiResponse<void>> {
    return this.patch<void>(`/admin/auth/roles/${role}/permissions`, { permissions });
  }

  // ========== Security ==========

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/auth/security-settings');
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: any): Promise<ApiResponse<any>> {
    return this.patch<any>('/admin/auth/security-settings', settings);
  }

  /**
   * Get IP whitelist
   */
  async getIPWhitelist(): Promise<ApiResponse<string[]>> {
    return this.get<string[]>('/admin/auth/ip-whitelist');
  }

  /**
   * Update IP whitelist
   */
  async updateIPWhitelist(ipAddresses: string[]): Promise<ApiResponse<void>> {
    return this.post<void>('/admin/auth/ip-whitelist', { ip_addresses: ipAddresses });
  }

  /**
   * Test login from IP
   */
  async testIPAccess(ipAddress: string): Promise<ApiResponse<{ allowed: boolean; reason?: string }>> {
    return this.post<{ allowed: boolean; reason?: string }>('/admin/auth/test-ip-access', {
      ip_address: ipAddress,
    });
  }
}

// Export singleton instance
export const authApi = new AuthApiService();
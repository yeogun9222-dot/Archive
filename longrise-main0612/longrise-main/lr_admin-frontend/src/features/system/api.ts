/**
 * System API service - All system administration API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import {
  SystemSetting,
  SystemSettingCreate,
  SystemSettingUpdate,
  SystemSettingFilters,
  FDSAlert,
  FDSAlertCreate,
  FDSAlertUpdate,
  FDSAlertFilters,
  ApprovalRequest,
  ApprovalRequestCreate,
  ApprovalRequestFilters,
  ApprovalAction,
  SystemStats
} from './types';

class SystemApiService extends BaseApiClient {
  // ========== System Settings ==========

  /**
   * Get paginated list of system settings
   */
  async getSettings(
    filters?: SystemSettingFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<SystemSetting>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<SystemSetting>>('/admin/system/settings', params);
  }

  /**
   * Get single system setting by ID or key
   */
  async getSetting(keyOrId: string): Promise<ApiResponse<SystemSetting>> {
    return this.get<SystemSetting>(`/admin/system/settings/${keyOrId}`);
  }

  /**
   * Create new system setting
   */
  async createSetting(data: SystemSettingCreate): Promise<ApiResponse<SystemSetting>> {
    return this.post<SystemSetting>('/admin/system/settings', data);
  }

  /**
   * Update existing system setting
   */
  async updateSetting(keyOrId: string, data: SystemSettingUpdate): Promise<ApiResponse<SystemSetting>> {
    return this.patch<SystemSetting>(`/admin/system/settings/${keyOrId}`, data);
  }

  /**
   * Delete system setting
   */
  async deleteSetting(keyOrId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/system/settings/${keyOrId}`);
  }

  /**
   * Reset setting to default value
   */
  async resetSetting(keyOrId: string): Promise<ApiResponse<SystemSetting>> {
    return this.post<SystemSetting>(`/admin/system/settings/${keyOrId}/reset`);
  }

  /**
   * Bulk update system settings
   */
  async bulkUpdateSettings(
    settings: Array<{ key: string; value: any }>
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return this.post<{ updated_count: number }>('/admin/system/settings/bulk-update', {
      settings,
    });
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<ApiResponse<SystemSetting[]>> {
    return this.get<SystemSetting[]>(`/admin/system/settings/category/${category}`);
  }

  // ========== FDS Alerts ==========

  /**
   * Get paginated list of FDS alerts
   */
  async getFDSAlerts(
    filters?: FDSAlertFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<FDSAlert>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<FDSAlert>>('/admin/system/fds-alerts', params);
  }

  /**
   * Get single FDS alert by ID
   */
  async getFDSAlert(id: string): Promise<ApiResponse<FDSAlert>> {
    return this.get<FDSAlert>(`/admin/system/fds-alerts/${id}`);
  }

  /**
   * Create new FDS alert
   */
  async createFDSAlert(data: FDSAlertCreate): Promise<ApiResponse<FDSAlert>> {
    return this.post<FDSAlert>('/admin/system/fds-alerts', data);
  }

  /**
   * Update FDS alert status
   */
  async updateFDSAlert(id: string, data: FDSAlertUpdate): Promise<ApiResponse<FDSAlert>> {
    return this.patch<FDSAlert>(`/admin/system/fds-alerts/${id}`, data);
  }

  /**
   * Resolve FDS alert
   */
  async resolveFDSAlert(id: string, notes?: string): Promise<ApiResponse<FDSAlert>> {
    return this.post<FDSAlert>(`/admin/system/fds-alerts/${id}/resolve`, {
      resolution_notes: notes,
    });
  }

  /**
   * Mark FDS alert as false positive
   */
  async markFDSAlertFalsePositive(id: string, notes?: string): Promise<ApiResponse<FDSAlert>> {
    return this.post<FDSAlert>(`/admin/system/fds-alerts/${id}/false-positive`, {
      resolution_notes: notes,
    });
  }

  /**
   * Get open FDS alerts
   */
  async getOpenFDSAlerts(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<FDSAlert>>> {
    const params = { status: 'open', ...pagination };
    return this.get<PaginatedResponse<FDSAlert>>('/admin/system/fds-alerts/open', params);
  }

  /**
   * Bulk resolve FDS alerts
   */
  async bulkResolveFDSAlerts(
    alertIds: string[],
    notes?: string
  ): Promise<ApiResponse<{ resolved_count: number }>> {
    return this.post<{ resolved_count: number }>('/admin/system/fds-alerts/bulk-resolve', {
      alert_ids: alertIds,
      resolution_notes: notes,
    });
  }

  // ========== Approval Requests ==========

  /**
   * Get paginated list of approval requests
   */
  async getApprovalRequests(
    filters?: ApprovalRequestFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<ApprovalRequest>>('/admin/system/approval-requests', params);
  }

  /**
   * Get single approval request by ID
   */
  async getApprovalRequest(id: string): Promise<ApiResponse<ApprovalRequest>> {
    return this.get<ApprovalRequest>(`/admin/system/approval-requests/${id}`);
  }

  /**
   * Create new approval request
   */
  async createApprovalRequest(data: ApprovalRequestCreate): Promise<ApiResponse<ApprovalRequest>> {
    return this.post<ApprovalRequest>('/admin/system/approval-requests', data);
  }

  /**
   * Process approval action (approve/reject)
   */
  async processApprovalAction(data: ApprovalAction): Promise<ApiResponse<ApprovalRequest>> {
    return this.post<ApprovalRequest>('/admin/system/approval-requests/action', data);
  }

  /**
   * Cancel approval request
   */
  async cancelApprovalRequest(id: string, reason?: string): Promise<ApiResponse<ApprovalRequest>> {
    return this.post<ApprovalRequest>(`/admin/system/approval-requests/${id}/cancel`, {
      reason,
    });
  }

  /**
   * Get pending approval requests
   */
  async getPendingApprovalRequests(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    const params = { status: 'pending', ...pagination };
    return this.get<PaginatedResponse<ApprovalRequest>>('/admin/system/approval-requests/pending', params);
  }

  /**
   * Get approval requests for current user
   */
  async getMyApprovalRequests(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    const params = pagination;
    return this.get<PaginatedResponse<ApprovalRequest>>('/admin/system/approval-requests/my-requests', params);
  }

  // ========== System Health & Monitoring ==========

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.get<SystemStats>('/admin/system/stats');
  }

  /**
   * Get system health check
   */
  async getSystemHealth(): Promise<ApiResponse<{ status: string; checks: Record<string, any> }>> {
    return this.get<{ status: string; checks: Record<string, any> }>('/admin/system/health');
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/system/info');
  }

  /**
   * Get application logs
   */
  async getSystemLogs(
    level?: string,
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<{ logs: any[]; total: number }>> {
    const params = { level, limit, offset };
    return this.get<{ logs: any[]; total: number }>('/admin/system/logs', params);
  }

  /**
   * Clear application logs
   */
  async clearSystemLogs(): Promise<ApiResponse<{ cleared_count: number }>> {
    return this.delete<{ cleared_count: number }>('/admin/system/logs');
  }

  // ========== Backup & Maintenance ==========

  /**
   * Create database backup
   */
  async createBackup(): Promise<ApiResponse<{ backup_id: string; file_path: string }>> {
    return this.post<{ backup_id: string; file_path: string }>('/admin/system/backup');
  }

  /**
   * Get backup list
   */
  async getBackups(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>('/admin/system/backups');
  }

  /**
   * Download backup file
   */
  async downloadBackup(backupId: string): Promise<Blob> {
    const response = await this.client.get(`/admin/system/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/system/backups/${backupId}`);
  }

  /**
   * Clear cache
   */
  async clearCache(cacheType?: string): Promise<ApiResponse<{ cleared: string[] }>> {
    return this.post<{ cleared: string[] }>('/admin/system/cache/clear', {
      cache_type: cacheType,
    });
  }

  /**
   * Restart application
   */
  async restartApplication(): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/admin/system/restart');
  }

  // ========== Notifications ==========

  /**
   * Send system notification
   */
  async sendSystemNotification(
    title: string,
    message: string,
    userIds?: string[],
    type?: string
  ): Promise<ApiResponse<{ sent_count: number }>> {
    return this.post<{ sent_count: number }>('/admin/system/notifications', {
      title,
      message,
      user_ids: userIds,
      type,
    });
  }

  /**
   * Get notification templates
   */
  async getNotificationTemplates(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>('/admin/system/notification-templates');
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(testEmail: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.post<{ success: boolean; message: string }>('/admin/system/test-email', {
      test_email: testEmail,
    });
  }
}

// Export singleton instance
export const systemApi = new SystemApiService();
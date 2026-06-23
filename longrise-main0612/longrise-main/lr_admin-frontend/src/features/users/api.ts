/**
 * User API service - All user-related API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import { User, UserCreateData, UserUpdateData, UserFilters, UserStats } from './types';

class UserApiService extends BaseApiClient {
  /**
   * Get paginated list of users
   */
  async getUsers(
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<User>>('/admin/users', params);
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/admin/users/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: UserCreateData): Promise<ApiResponse<User>> {
    return this.post<User>('/admin/users', data);
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, data: UserUpdateData): Promise<ApiResponse<User>> {
    return this.patch<User>(`/admin/users/${id}`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/users/${id}`);
  }

  /**
   * Block/unblock user
   */
  async blockUser(id: string, reason?: string): Promise<ApiResponse<User>> {
    return this.post<User>(`/admin/users/${id}/block`, { reason });
  }

  async unblockUser(id: string): Promise<ApiResponse<User>> {
    return this.post<User>(`/admin/users/${id}/unblock`);
  }

  /**
   * Update user verification status
   */
  async updateVerificationStatus(
    id: string,
    status: boolean,
    notes?: string
  ): Promise<ApiResponse<User>> {
    return this.patch<User>(`/admin/users/${id}/verification`, {
      verification_status: status,
      notes,
    });
  }

  /**
   * Update user KYC status
   */
  async updateKYCStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<ApiResponse<User>> {
    return this.patch<User>(`/admin/users/${id}/kyc`, {
      kyc_status: status,
      notes,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.get<UserStats>('/admin/users/stats');
  }

  /**
   * Get user activity log
   */
  async getUserActivity(
    id: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = pagination;
    return this.get<PaginatedResponse<any>>(`/admin/users/${id}/activity`, params);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string): Promise<ApiResponse<{ temporary_password: string }>> {
    return this.post<{ temporary_password: string }>(`/admin/users/${id}/reset-password`);
  }

  /**
   * Get user's financial summary
   */
  async getUserFinancialSummary(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${id}/financial-summary`);
  }

  /**
   * Search users by username or email
   */
  async searchUsers(query: string, limit: number = 20): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/admin/users/search', { query, limit });
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UserUpdateData>
  ): Promise<ApiResponse<{ updated_count: number }>> {
    return this.post<{ updated_count: number }>('/admin/users/bulk-update', {
      user_ids: userIds,
      updates,
    });
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: UserFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const params = { ...filters, format };
    const response = await this.client.get('/admin/users/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

// Export singleton instance
export const userApi = new UserApiService();
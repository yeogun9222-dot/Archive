/**
 * Withdrawal API service - All withdrawal-related API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import {
  Withdrawal,
  WithdrawalCreate,
  WithdrawalApproval,
  WithdrawalFilters,
  WithdrawalStats
} from './types';

class WithdrawalApiService extends BaseApiClient {
  /**
   * Get paginated list of withdrawal requests
   */
  async getWithdrawals(
    filters?: WithdrawalFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<Withdrawal>>('/admin/withdrawals', params);
  }

  /**
   * Get single withdrawal request by ID
   */
  async getWithdrawal(id: string): Promise<ApiResponse<Withdrawal>> {
    return this.get<Withdrawal>(`/admin/withdrawals/${id}`);
  }

  /**
   * Create new withdrawal request (admin-initiated)
   */
  async createWithdrawal(data: WithdrawalCreate): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>('/admin/withdrawals', data);
  }

  /**
   * Approve withdrawal request
   */
  async approveWithdrawal(
    id: string,
    approval: WithdrawalApproval
  ): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>(`/admin/withdrawals/${id}/approve`, approval);
  }

  /**
   * Reject withdrawal request
   */
  async rejectWithdrawal(
    id: string,
    rejection: WithdrawalApproval
  ): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>(`/admin/withdrawals/${id}/reject`, rejection);
  }

  /**
   * Process approved withdrawal
   */
  async processWithdrawal(id: string): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>(`/admin/withdrawals/${id}/process`);
  }

  /**
   * Mark withdrawal as completed
   */
  async completeWithdrawal(
    id: string,
    transactionHash?: string
  ): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>(`/admin/withdrawals/${id}/complete`, {
      transaction_hash: transactionHash,
    });
  }

  /**
   * Mark withdrawal as failed
   */
  async failWithdrawal(
    id: string,
    reason: string
  ): Promise<ApiResponse<Withdrawal>> {
    return this.post<Withdrawal>(`/admin/withdrawals/${id}/fail`, {
      reason,
    });
  }

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats(): Promise<ApiResponse<WithdrawalStats>> {
    return this.get<WithdrawalStats>('/admin/withdrawals/stats');
  }

  /**
   * Get pending withdrawals requiring approval
   */
  async getPendingWithdrawals(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> {
    const params = { status: 'pending', ...pagination };
    return this.get<PaginatedResponse<Withdrawal>>('/admin/withdrawals/pending', params);
  }

  /**
   * Bulk approve withdrawals
   */
  async bulkApproveWithdrawals(
    withdrawalIds: string[],
    notes?: string
  ): Promise<ApiResponse<{ approved_count: number }>> {
    return this.post<{ approved_count: number }>('/admin/withdrawals/bulk-approve', {
      withdrawal_ids: withdrawalIds,
      admin_notes: notes,
    });
  }

  /**
   * Bulk reject withdrawals
   */
  async bulkRejectWithdrawals(
    withdrawalIds: string[],
    reason: string
  ): Promise<ApiResponse<{ rejected_count: number }>> {
    return this.post<{ rejected_count: number }>('/admin/withdrawals/bulk-reject', {
      withdrawal_ids: withdrawalIds,
      admin_notes: reason,
    });
  }

  /**
   * Get withdrawal limits and settings
   */
  async getWithdrawalSettings(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/withdrawals/settings');
  }

  /**
   * Update withdrawal limits and settings
   */
  async updateWithdrawalSettings(settings: any): Promise<ApiResponse<any>> {
    return this.patch<any>('/admin/withdrawals/settings', settings);
  }

  /**
   * Get user's withdrawal history
   */
  async getUserWithdrawals(
    userId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> {
    const params = pagination;
    return this.get<PaginatedResponse<Withdrawal>>(`/admin/users/${userId}/withdrawals`, params);
  }

  /**
   * Export withdrawals data
   */
  async exportWithdrawals(
    filters?: WithdrawalFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    const params = { ...filters, format };
    const response = await this.client.get('/admin/withdrawals/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Generate withdrawal report
   */
  async generateWithdrawalReport(
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/withdrawals/report', {
      period,
      start_date: startDate,
      end_date: endDate,
    });
  }
}

// Export singleton instance
export const withdrawalApi = new WithdrawalApiService();
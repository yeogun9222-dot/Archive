/**
 * Payout API service - All payout-related API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import {
  Payout,
  PayoutCreate,
  PayoutUpdate,
  PayoutFilters,
  PayoutSettings,
  PayoutSettingsCreate,
  PayoutSettingsUpdate,
  PayoutBatch,
  PayoutStats
} from './types';

class PayoutApiService extends BaseApiClient {
  // ========== Payouts ==========

  /**
   * Get paginated list of payouts
   */
  async getPayouts(
    filters?: PayoutFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Payout>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<Payout>>('/admin/payouts', params);
  }

  /**
   * Get single payout by ID
   */
  async getPayout(id: string): Promise<ApiResponse<Payout>> {
    return this.get<Payout>(`/admin/payouts/${id}`);
  }

  /**
   * Create new payout
   */
  async createPayout(data: PayoutCreate): Promise<ApiResponse<Payout>> {
    return this.post<Payout>('/admin/payouts', data);
  }

  /**
   * Update existing payout
   */
  async updatePayout(id: string, data: PayoutUpdate): Promise<ApiResponse<Payout>> {
    return this.patch<Payout>(`/admin/payouts/${id}`, data);
  }

  /**
   * Delete payout
   */
  async deletePayout(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/payouts/${id}`);
  }

  /**
   * Process payout manually
   */
  async processPayout(id: string): Promise<ApiResponse<Payout>> {
    return this.post<Payout>(`/admin/payouts/${id}/process`);
  }

  /**
   * Cancel payout
   */
  async cancelPayout(id: string, reason?: string): Promise<ApiResponse<Payout>> {
    return this.post<Payout>(`/admin/payouts/${id}/cancel`, { reason });
  }

  /**
   * Retry failed payout
   */
  async retryPayout(id: string): Promise<ApiResponse<Payout>> {
    return this.post<Payout>(`/admin/payouts/${id}/retry`);
  }

  /**
   * Get pending payouts
   */
  async getPendingPayouts(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Payout>>> {
    const params = { status: 'pending', ...pagination };
    return this.get<PaginatedResponse<Payout>>('/admin/payouts/pending', params);
  }

  /**
   * Get user's payout history
   */
  async getUserPayouts(
    userId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Payout>>> {
    const params = pagination;
    return this.get<PaginatedResponse<Payout>>(`/admin/users/${userId}/payouts`, params);
  }

  // ========== Batch Operations ==========

  /**
   * Create payout batch
   */
  async createPayoutBatch(
    name: string,
    type: string,
    userIds: string[],
    amount: number,
    scheduledDate?: string
  ): Promise<ApiResponse<PayoutBatch>> {
    return this.post<PayoutBatch>('/admin/payouts/batch', {
      name,
      type,
      user_ids: userIds,
      amount,
      scheduled_date: scheduledDate,
    });
  }

  /**
   * Get payout batches
   */
  async getPayoutBatches(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<PayoutBatch>>> {
    const params = pagination;
    return this.get<PaginatedResponse<PayoutBatch>>('/admin/payouts/batches', params);
  }

  /**
   * Get single payout batch
   */
  async getPayoutBatch(id: string): Promise<ApiResponse<PayoutBatch>> {
    return this.get<PayoutBatch>(`/admin/payouts/batches/${id}`);
  }

  /**
   * Process payout batch
   */
  async processPayoutBatch(id: string): Promise<ApiResponse<PayoutBatch>> {
    return this.post<PayoutBatch>(`/admin/payouts/batches/${id}/process`);
  }

  /**
   * Cancel payout batch
   */
  async cancelPayoutBatch(id: string, reason?: string): Promise<ApiResponse<PayoutBatch>> {
    return this.post<PayoutBatch>(`/admin/payouts/batches/${id}/cancel`, { reason });
  }

  /**
   * Bulk process payouts
   */
  async bulkProcessPayouts(
    payoutIds: string[]
  ): Promise<ApiResponse<{ processed_count: number; failed_count: number }>> {
    return this.post<{ processed_count: number; failed_count: number }>('/admin/payouts/bulk-process', {
      payout_ids: payoutIds,
    });
  }

  // ========== Payout Settings ==========

  /**
   * Get all payout settings
   */
  async getPayoutSettings(): Promise<ApiResponse<PayoutSettings[]>> {
    return this.get<PayoutSettings[]>('/admin/payout-settings');
  }

  /**
   * Get payout settings by type
   */
  async getPayoutSettingsByType(type: string): Promise<ApiResponse<PayoutSettings>> {
    return this.get<PayoutSettings>(`/admin/payout-settings/${type}`);
  }

  /**
   * Create payout settings
   */
  async createPayoutSettings(data: PayoutSettingsCreate): Promise<ApiResponse<PayoutSettings>> {
    return this.post<PayoutSettings>('/admin/payout-settings', data);
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(
    type: string,
    data: PayoutSettingsUpdate
  ): Promise<ApiResponse<PayoutSettings>> {
    return this.patch<PayoutSettings>(`/admin/payout-settings/${type}`, data);
  }

  /**
   * Delete payout settings
   */
  async deletePayoutSettings(type: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/payout-settings/${type}`);
  }

  // ========== Statistics & Reports ==========

  /**
   * Get payout statistics
   */
  async getPayoutStats(): Promise<ApiResponse<PayoutStats>> {
    return this.get<PayoutStats>('/admin/payouts/stats');
  }

  /**
   * Calculate total payouts for users
   */
  async calculateTotalPayouts(
    userIds: string[],
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ total_amount: number; user_totals: Record<string, number> }>> {
    return this.post<{ total_amount: number; user_totals: Record<string, number> }>(
      '/admin/payouts/calculate-total',
      {
        user_ids: userIds,
        type,
        start_date: startDate,
        end_date: endDate,
      }
    );
  }

  /**
   * Generate daily ROI payouts
   */
  async generateDailyROIPayouts(): Promise<ApiResponse<{ created_count: number; total_amount: number }>> {
    return this.post<{ created_count: number; total_amount: number }>('/admin/payouts/generate-daily-roi');
  }

  /**
   * Export payouts data
   */
  async exportPayouts(
    filters?: PayoutFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    const params = { ...filters, format };
    const response = await this.client.get('/admin/payouts/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Generate payout report
   */
  async generatePayoutReport(
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/payouts/report', {
      period,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get payout audit trail
   */
  async getPayoutAuditTrail(
    id: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = pagination;
    return this.get<PaginatedResponse<any>>(`/admin/payouts/${id}/audit-trail`, params);
  }
}

// Export singleton instance
export const payoutApi = new PayoutApiService();
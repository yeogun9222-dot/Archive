/**
 * Investment API service - All investment-related API endpoints
 */

import { BaseApiClient, ApiResponse } from '../../services/base-api';
import { PaginatedResponse, PaginationParams } from '../../types/api';
import {
  InvestmentPackage,
  InvestmentPackageCreate,
  InvestmentPackageUpdate,
  InvestmentPackageFilters,
  UserInvestment,
  UserInvestmentCreate,
  UserInvestmentUpdate,
  UserInvestmentFilters,
  InvestmentStats
} from './types';

class InvestmentApiService extends BaseApiClient {
  // ========== Investment Packages ==========

  /**
   * Get paginated list of investment packages
   */
  async getPackages(
    filters?: InvestmentPackageFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<InvestmentPackage>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<InvestmentPackage>>('/admin/investment-packages', params);
  }

  /**
   * Get single investment package by ID
   */
  async getPackage(id: string): Promise<ApiResponse<InvestmentPackage>> {
    return this.get<InvestmentPackage>(`/admin/investment-packages/${id}`);
  }

  /**
   * Create new investment package
   */
  async createPackage(data: InvestmentPackageCreate): Promise<ApiResponse<InvestmentPackage>> {
    return this.post<InvestmentPackage>('/admin/investment-packages', data);
  }

  /**
   * Update existing investment package
   */
  async updatePackage(id: string, data: InvestmentPackageUpdate): Promise<ApiResponse<InvestmentPackage>> {
    return this.patch<InvestmentPackage>(`/admin/investment-packages/${id}`, data);
  }

  /**
   * Delete investment package
   */
  async deletePackage(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/investment-packages/${id}`);
  }

  /**
   * Activate/deactivate investment package
   */
  async togglePackageStatus(id: string, active: boolean): Promise<ApiResponse<InvestmentPackage>> {
    return this.post<InvestmentPackage>(`/admin/investment-packages/${id}/toggle-status`, {
      active,
    });
  }

  // ========== User Investments ==========

  /**
   * Get paginated list of user investments
   */
  async getUserInvestments(
    filters?: UserInvestmentFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserInvestment>>> {
    const params = { ...filters, ...pagination };
    return this.get<PaginatedResponse<UserInvestment>>('/admin/investments', params);
  }

  /**
   * Get single user investment by ID
   */
  async getUserInvestment(id: string): Promise<ApiResponse<UserInvestment>> {
    return this.get<UserInvestment>(`/admin/investments/${id}`);
  }

  /**
   * Create new user investment (admin-initiated)
   */
  async createUserInvestment(data: UserInvestmentCreate): Promise<ApiResponse<UserInvestment>> {
    return this.post<UserInvestment>('/admin/investments', data);
  }

  /**
   * Update user investment
   */
  async updateUserInvestment(id: string, data: UserInvestmentUpdate): Promise<ApiResponse<UserInvestment>> {
    return this.patch<UserInvestment>(`/admin/investments/${id}`, data);
  }

  /**
   * Force mature user investment
   */
  async forceMatureInvestment(id: string, reason?: string): Promise<ApiResponse<UserInvestment>> {
    return this.post<UserInvestment>(`/admin/investments/${id}/force-mature`, {
      reason,
    });
  }

  /**
   * Process early termination request
   */
  async processEarlyTermination(
    id: string,
    approved: boolean,
    reason?: string
  ): Promise<ApiResponse<UserInvestment>> {
    return this.post<UserInvestment>(`/admin/investments/${id}/early-termination`, {
      approved,
      reason,
    });
  }

  /**
   * Calculate ROI for investment
   */
  async calculateROI(id: string): Promise<ApiResponse<{ roi_amount: number; days_elapsed: number }>> {
    return this.get<{ roi_amount: number; days_elapsed: number }>(`/admin/investments/${id}/calculate-roi`);
  }

  /**
   * Pay ROI for investment
   */
  async payROI(id: string, amount?: number): Promise<ApiResponse<UserInvestment>> {
    return this.post<UserInvestment>(`/admin/investments/${id}/pay-roi`, {
      amount,
    });
  }

  /**
   * Get user's investment history
   */
  async getUserInvestmentHistory(
    userId: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserInvestment>>> {
    const params = pagination;
    return this.get<PaginatedResponse<UserInvestment>>(`/admin/users/${userId}/investments`, params);
  }

  /**
   * Get investment statistics
   */
  async getInvestmentStats(): Promise<ApiResponse<InvestmentStats>> {
    return this.get<InvestmentStats>('/admin/investments/stats');
  }

  /**
   * Get active investments requiring ROI payment
   */
  async getActiveInvestments(
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserInvestment>>> {
    const params = { status: 'active', ...pagination };
    return this.get<PaginatedResponse<UserInvestment>>('/admin/investments/active', params);
  }

  /**
   * Bulk process ROI payments
   */
  async bulkPayROI(
    investmentIds: string[]
  ): Promise<ApiResponse<{ processed_count: number; failed_count: number }>> {
    return this.post<{ processed_count: number; failed_count: number }>('/admin/investments/bulk-pay-roi', {
      investment_ids: investmentIds,
    });
  }

  /**
   * Get investment package performance
   */
  async getPackagePerformance(packageId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/investment-packages/${packageId}/performance`);
  }

  /**
   * Export investments data
   */
  async exportInvestments(
    filters?: UserInvestmentFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    const params = { ...filters, format };
    const response = await this.client.get('/admin/investments/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Generate investment report
   */
  async generateInvestmentReport(
    period: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/investments/report', {
      period,
      start_date: startDate,
      end_date: endDate,
    });
  }
}

// Export singleton instance
export const investmentApi = new InvestmentApiService();
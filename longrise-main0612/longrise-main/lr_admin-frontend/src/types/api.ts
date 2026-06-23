/**
 * API-related type definitions
 * Common types used across all API interactions
 */

// Base API response structure
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Filter types
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface AmountRangeFilter {
  min_amount?: number;
  max_amount?: number;
}

// API error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  status?: number;
}

// Request configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
}
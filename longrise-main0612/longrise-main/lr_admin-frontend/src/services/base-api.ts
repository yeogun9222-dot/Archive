/**
 * Base API client - Foundation for all domain-specific API services
 * Provides common functionality like authentication, error handling, and interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { apiConfig } from './config';
import { tokenManager } from './tokenManager';

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// API error class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API client class
export class BaseApiClient {
  protected client: AxiosInstance;

  constructor() {
    this.client = this.createClient();
    this.setupInterceptors();
  }

  /**
   * Create Axios instance
   */
  private createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Build-UID': apiConfig.buildUID,
        'X-Environment': apiConfig.environment,
      },
    });

    return client;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: Auto-attach token
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug logging
        if (apiConfig.logLevel === 'debug') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor: Error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Debug logging
        if (apiConfig.logLevel === 'debug') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              await this.refreshToken();

              // Retry original request with new token
              const newToken = tokenManager.getToken();
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client.request(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            tokenManager.removeTokens();
            // Redirect to login could be handled here
          }
        }

        // Create structured error
        const apiError = this.createApiError(error);

        // Log error
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: apiError.message,
          data: error.response?.data,
        });

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Create structured API error from Axios error
   */
  private createApiError(error: AxiosError): ApiError {
    const response = error.response;

    if (response?.data && typeof response.data === 'object') {
      const data = response.data as any;
      return new ApiError(
        data.error?.code || 'API_ERROR',
        data.error?.message || data.message || error.message,
        response.status,
        response.data
      );
    }

    return new ApiError(
      'NETWORK_ERROR',
      error.message || 'An unexpected error occurred',
      response?.status,
      response?.data
    );
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;
    tokenManager.setTokens(access_token, newRefreshToken);
  }

  /**
   * Generic GET request
   */
  protected async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  /**
   * Generic POST request
   */
  protected async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }
}
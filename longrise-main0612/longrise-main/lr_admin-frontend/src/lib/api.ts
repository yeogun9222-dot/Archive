/**
 * API Client - Frontend API communication utility
 * Used by both User Platform and Admin Panel
 */

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:5000/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

async function apiCall<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to API server',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// User endpoints
export const userApi = {
  // List users with pagination
  list: (page = 1, pageSize = 20, search = '') =>
    apiCall(`/users?page=${page}&pageSize=${pageSize}&search=${search}`),

  // Get user details
  getById: (id: string) =>
    apiCall(`/users/${id}`),

  // Adjust balance
  adjustBalance: (userId: string, currency: 'USDT' | 'CNYT', amount: number, adminId: string, adminName: string) =>
    apiCall(`/users/${userId}/balance`, {
      method: 'PUT',
      body: { currency, amount, adminId, adminName },
    }),

  // Set restrictions
  setRestrictions: (userId: string, restrictionType: 'withdrawal' | 'account' | 'freeze', enabled: boolean, adminId: string, adminName: string) =>
    apiCall(`/users/${userId}/restrictions`, {
      method: 'PUT',
      body: { restrictionType, enabled, adminId, adminName },
    }),

  // Reset KYC
  resetKyc: (userId: string, adminId: string, adminName: string) =>
    apiCall(`/users/${userId}/kyc`, {
      method: 'PUT',
      body: { adminId, adminName },
    }),

  // Ban user
  ban: (userId: string, adminId: string, adminName: string) =>
    apiCall(`/users/${userId}/ban`, {
      method: 'PUT',
      body: { adminId, adminName },
    }),

  // Get audit logs
  getAuditLogs: (userId: string) =>
    apiCall(`/users/${userId}/audit-logs`),
};

// Admin endpoints
export const adminApi = {
  // List all admins
  listAdmins: () =>
    apiCall('/admin/users'),

  // Get current admin
  getCurrent: () =>
    apiCall('/admin/current'),

  // Get system audit logs
  getAuditLogs: (limit = 50) =>
    apiCall(`/admin/audit-logs?limit=${limit}`),
};

// Health check
export const healthCheck = () =>
  fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(r => r.json());

export default { userApi, adminApi, healthCheck };
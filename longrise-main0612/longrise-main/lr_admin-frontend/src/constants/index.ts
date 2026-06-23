/**
 * Global application constants
 */

// Application configuration
export const APP_CONFIG = {
  name: 'Longrise Admin Panel',
  version: '1.0.0',
  description: 'Administrative Control Panel',
  sessionTimeout: 3600000, // 1 hour in milliseconds
  refreshInterval: 10000, // 10 seconds
} as const;

// API configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 1000,
} as const;

// Date/time formats
export const DATE_FORMATS = {
  display: 'YYYY-MM-DD HH:mm:ss',
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  dateTime: 'YYYY-MM-DD HH:mm',
  api: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Currency configuration
export const CURRENCY = {
  primary: 'USD',
  supported: ['USD', 'KRW', 'BTC', 'ETH', 'USDT'] as const,
  decimalPlaces: {
    USD: 2,
    KRW: 0,
    BTC: 8,
    ETH: 6,
    USDT: 6,
  },
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxFiles: 5,
} as const;

// Validation rules
export const VALIDATION = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// Theme configuration
export const THEME = {
  defaultTheme: 'dark',
  storageKey: 'longrise-admin-theme',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  authToken: 'longrise_admin_token',
  refreshToken: 'longrise_admin_refresh_token',
  theme: 'longrise-admin-theme',
  language: 'longrise-admin-language',
  sidebarCollapsed: 'longrise-admin-sidebar-collapsed',
} as const;

// Route paths
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  users: '/users',
  transactions: '/transactions',
  withdrawals: '/withdrawals',
  payouts: '/payouts',
  investments: '/investments',
  audit: '/audit',
  system: '/system',
  p2p: '/p2p',
  cms: '/cms',
  reconciliation: '/reconciliation',
} as const;
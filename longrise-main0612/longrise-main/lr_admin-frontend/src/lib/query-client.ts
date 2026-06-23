/**
 * React Query client configuration
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Global query options
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  },
  mutations: {
    // Global mutation options
    retry: false,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any, pagination?: any) =>
      [...queryKeys.users.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    stats: () => [...queryKeys.users.all, 'stats'] as const,
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: any, pagination?: any) =>
      [...queryKeys.transactions.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    stats: () => [...queryKeys.transactions.all, 'stats'] as const,
  },

  // Withdrawals
  withdrawals: {
    all: ['withdrawals'] as const,
    lists: () => [...queryKeys.withdrawals.all, 'list'] as const,
    list: (filters?: any, pagination?: any) =>
      [...queryKeys.withdrawals.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.withdrawals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.withdrawals.details(), id] as const,
    pending: () => [...queryKeys.withdrawals.all, 'pending'] as const,
    stats: () => [...queryKeys.withdrawals.all, 'stats'] as const,
  },

  // Payouts
  payouts: {
    all: ['payouts'] as const,
    lists: () => [...queryKeys.payouts.all, 'list'] as const,
    list: (filters?: any, pagination?: any) =>
      [...queryKeys.payouts.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.payouts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payouts.details(), id] as const,
    pending: () => [...queryKeys.payouts.all, 'pending'] as const,
    stats: () => [...queryKeys.payouts.all, 'stats'] as const,
    batches: () => [...queryKeys.payouts.all, 'batches'] as const,
    settings: () => [...queryKeys.payouts.all, 'settings'] as const,
  },

  // Investments
  investments: {
    all: ['investments'] as const,
    packages: {
      all: [...queryKeys.investments.all, 'packages'] as const,
      lists: () => [...queryKeys.investments.packages.all, 'list'] as const,
      list: (filters?: any) => [...queryKeys.investments.packages.lists(), filters] as const,
      detail: (id: string) => [...queryKeys.investments.packages.all, 'detail', id] as const,
    },
    userInvestments: {
      all: [...queryKeys.investments.all, 'user-investments'] as const,
      lists: () => [...queryKeys.investments.userInvestments.all, 'list'] as const,
      list: (filters?: any, pagination?: any) =>
        [...queryKeys.investments.userInvestments.lists(), { filters, pagination }] as const,
      detail: (id: string) => [...queryKeys.investments.userInvestments.all, 'detail', id] as const,
      active: () => [...queryKeys.investments.userInvestments.all, 'active'] as const,
    },
    stats: () => [...queryKeys.investments.all, 'stats'] as const,
  },

  // System
  system: {
    all: ['system'] as const,
    settings: {
      all: [...queryKeys.system.all, 'settings'] as const,
      list: (filters?: any) => [...queryKeys.system.settings.all, 'list', filters] as const,
      detail: (key: string) => [...queryKeys.system.settings.all, 'detail', key] as const,
    },
    alerts: {
      all: [...queryKeys.system.all, 'alerts'] as const,
      lists: () => [...queryKeys.system.alerts.all, 'list'] as const,
      list: (filters?: any, pagination?: any) =>
        [...queryKeys.system.alerts.lists(), { filters, pagination }] as const,
      open: () => [...queryKeys.system.alerts.all, 'open'] as const,
    },
    approvals: {
      all: [...queryKeys.system.all, 'approvals'] as const,
      lists: () => [...queryKeys.system.approvals.all, 'list'] as const,
      list: (filters?: any, pagination?: any) =>
        [...queryKeys.system.approvals.lists(), { filters, pagination }] as const,
      pending: () => [...queryKeys.system.approvals.all, 'pending'] as const,
    },
    stats: () => [...queryKeys.system.all, 'stats'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },

  // Auth
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    sessions: () => [...queryKeys.auth.all, 'sessions'] as const,
    admins: {
      all: [...queryKeys.auth.all, 'admins'] as const,
      lists: () => [...queryKeys.auth.admins.all, 'list'] as const,
      list: (filters?: any, pagination?: any) =>
        [...queryKeys.auth.admins.lists(), { filters, pagination }] as const,
      detail: (id: string) => [...queryKeys.auth.admins.all, 'detail', id] as const,
      online: () => [...queryKeys.auth.admins.all, 'online'] as const,
    },
    loginHistory: (adminId?: string) =>
      adminId
        ? [...queryKeys.auth.all, 'login-history', adminId] as const
        : [...queryKeys.auth.all, 'login-history'] as const,
    stats: () => [...queryKeys.auth.all, 'stats'] as const,
  },
} as const;
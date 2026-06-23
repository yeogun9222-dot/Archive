/**
 * React Query hooks for user management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import { queryKeys } from '../../../lib/query-client';
import { User, UserFilters, UserStats, UserCreateData, UserUpdateData } from '../types';
import { PaginationParams } from '../../../types/api';

// ========== Queries ==========

/**
 * Hook to fetch paginated users list
 */
export function useUsersQuery(filters?: UserFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users.list(filters, pagination),
    queryFn: async () => {
      const response = await userApi.getUsers(filters, pagination);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch users');
      }
      return response.data;
    },
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch single user
 */
export function useUserQuery(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const response = await userApi.getUser(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStatsQuery() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: async () => {
      const response = await userApi.getUserStats();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user stats');
      }
      return response.data;
    },
    // Refetch every 5 minutes for fresh stats
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Hook to search users
 */
export function useUserSearchQuery(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.list({ search: query }),
    queryFn: async () => {
      const response = await userApi.searchUsers(query, 20);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to search users');
      }
      return response.data;
    },
    enabled: enabled && query.length >= 2,
    // Don't cache search results for long
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch user activity
 */
export function useUserActivityQuery(userId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'activity', pagination],
    queryFn: async () => {
      const response = await userApi.getUserActivity(userId, pagination);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user activity');
      }
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user financial summary
 */
export function useUserFinancialSummaryQuery(userId: string) {
  return useQuery({
    queryKey: [...queryKeys.users.detail(userId), 'financial-summary'],
    queryFn: async () => {
      const response = await userApi.getUserFinancialSummary(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user financial summary');
      }
      return response.data;
    },
    enabled: !!userId,
  });
}

// ========== Mutations ==========

/**
 * Hook to create new user
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserCreateData) => {
      const response = await userApi.createUser(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create user');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

/**
 * Hook to update user
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserUpdateData }) => {
      const response = await userApi.updateUser(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update user');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook to delete user
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userApi.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete user');
      }
      return userId;
    },
    onSuccess: (userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Update stats
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
    },
  });
}

/**
 * Hook to block user
 */
export function useBlockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await userApi.blockUser(id, reason);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to block user');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook to unblock user
 */
export function useUnblockUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userApi.unblockUser(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to unblock user');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook to update user verification status
 */
export function useUpdateUserVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: boolean;
      notes?: string;
    }) => {
      const response = await userApi.updateVerificationStatus(id, status, notes);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update verification status');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook to bulk update users
 */
export function useBulkUpdateUsersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      updates,
    }: {
      userIds: string[];
      updates: Partial<UserUpdateData>;
    }) => {
      const response = await userApi.bulkUpdateUsers(userIds, updates);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to bulk update users');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

/**
 * Hook to reset user password
 */
export function useResetUserPasswordMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userApi.resetUserPassword(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to reset user password');
      }
      return response.data;
    },
  });
}

/**
 * Hook to export users data
 */
export function useExportUsersMutation() {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters?: UserFilters;
      format?: 'csv' | 'xlsx';
    }) => {
      const blob = await userApi.exportUsers(filters, format);
      return blob;
    },
  });
}
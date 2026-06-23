/**
 * User management hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { userApi } from '../api';
import { User, UserFilters, UserStats, UserCreateData, UserUpdateData } from '../types';
import { PaginationParams, PaginatedResponse } from '../../../types/api';

// Hook for managing users list
export function useUsers(initialFilters?: UserFilters, initialPagination?: PaginationParams) {
  const [users, setUsers] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || {});
  const [pagination, setPagination] = useState<PaginationParams>(
    initialPagination || { page: 1, page_size: 20 }
  );

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.getUsers(filters, pagination);
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Effect to fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination({ page: 1, page_size: 20 });
  }, []);

  // Computed values
  const totalCount = useMemo(() => users?.total || 0, [users]);
  const hasUsers = useMemo(() => (users?.items.length || 0) > 0, [users]);

  return {
    users: users?.items || [],
    totalCount,
    hasUsers,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    resetFilters,
    refetch: fetchUsers,
  };
}

// Hook for managing single user
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await userApi.getUser(userId);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (data: UserUpdateData) => {
    if (!userId) return false;

    try {
      const response = await userApi.updateUser(userId, data);
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [userId]);

  const blockUser = useCallback(async (reason?: string) => {
    if (!userId) return false;

    try {
      const response = await userApi.blockUser(userId, reason);
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to block user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [userId]);

  const unblockUser = useCallback(async () => {
    if (!userId) return false;

    try {
      const response = await userApi.unblockUser(userId);
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to unblock user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [userId]);

  return {
    user,
    loading,
    error,
    updateUser,
    blockUser,
    unblockUser,
    refetch: fetchUser,
  };
}

// Hook for user statistics
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch user stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// Hook for creating users
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: UserCreateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.createUser(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    loading,
    error,
  };
}
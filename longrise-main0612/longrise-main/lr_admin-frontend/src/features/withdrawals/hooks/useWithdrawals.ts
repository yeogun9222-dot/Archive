/**
 * Withdrawal management hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { withdrawalApi } from '../api';
import { Withdrawal, WithdrawalFilters, WithdrawalStats, WithdrawalApproval } from '../types';
import { PaginationParams, PaginatedResponse } from '../../../types/api';

// Hook for managing withdrawals list
export function useWithdrawals(
  initialFilters?: WithdrawalFilters,
  initialPagination?: PaginationParams
) {
  const [withdrawals, setWithdrawals] = useState<PaginatedResponse<Withdrawal> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WithdrawalFilters>(initialFilters || {});
  const [pagination, setPagination] = useState<PaginationParams>(
    initialPagination || { page: 1, page_size: 20 }
  );

  // Fetch withdrawals function
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.getWithdrawals(filters, pagination);
      if (response.success && response.data) {
        setWithdrawals(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Effect to fetch withdrawals when dependencies change
  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<WithdrawalFilters>) => {
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
  const totalCount = useMemo(() => withdrawals?.total || 0, [withdrawals]);
  const hasWithdrawals = useMemo(() => (withdrawals?.items.length || 0) > 0, [withdrawals]);

  return {
    withdrawals: withdrawals?.items || [],
    totalCount,
    hasWithdrawals,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    resetFilters,
    refetch: fetchWithdrawals,
  };
}

// Hook for managing single withdrawal
export function useWithdrawal(withdrawalId: string) {
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchWithdrawal = useCallback(async () => {
    if (!withdrawalId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.getWithdrawal(withdrawalId);
      if (response.success && response.data) {
        setWithdrawal(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [withdrawalId]);

  useEffect(() => {
    fetchWithdrawal();
  }, [fetchWithdrawal]);

  const approveWithdrawal = useCallback(async (approval: WithdrawalApproval) => {
    if (!withdrawalId) return false;

    setUpdating(true);
    setError(null);

    try {
      const response = await withdrawalApi.approveWithdrawal(withdrawalId, approval);
      if (response.success && response.data) {
        setWithdrawal(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to approve withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [withdrawalId]);

  const rejectWithdrawal = useCallback(async (rejection: WithdrawalApproval) => {
    if (!withdrawalId) return false;

    setUpdating(true);
    setError(null);

    try {
      const response = await withdrawalApi.rejectWithdrawal(withdrawalId, rejection);
      if (response.success && response.data) {
        setWithdrawal(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to reject withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [withdrawalId]);

  const processWithdrawal = useCallback(async () => {
    if (!withdrawalId) return false;

    setUpdating(true);
    setError(null);

    try {
      const response = await withdrawalApi.processWithdrawal(withdrawalId);
      if (response.success && response.data) {
        setWithdrawal(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to process withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [withdrawalId]);

  const completeWithdrawal = useCallback(async (transactionHash?: string) => {
    if (!withdrawalId) return false;

    setUpdating(true);
    setError(null);

    try {
      const response = await withdrawalApi.completeWithdrawal(withdrawalId, transactionHash);
      if (response.success && response.data) {
        setWithdrawal(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to complete withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [withdrawalId]);

  return {
    withdrawal,
    loading,
    updating,
    error,
    approveWithdrawal,
    rejectWithdrawal,
    processWithdrawal,
    completeWithdrawal,
    refetch: fetchWithdrawal,
  };
}

// Hook for withdrawal statistics
export function useWithdrawalStats() {
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.getWithdrawalStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch withdrawal stats');
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

// Hook for pending withdrawals
export function usePendingWithdrawals() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.getPendingWithdrawals();
      if (response.success && response.data) {
        setPendingWithdrawals(response.data.items);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch pending withdrawals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingWithdrawals();
  }, [fetchPendingWithdrawals]);

  const pendingCount = useMemo(() => pendingWithdrawals.length, [pendingWithdrawals]);
  const pendingAmount = useMemo(
    () => pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0),
    [pendingWithdrawals]
  );

  return {
    pendingWithdrawals,
    pendingCount,
    pendingAmount,
    loading,
    error,
    refetch: fetchPendingWithdrawals,
  };
}

// Hook for bulk operations
export function useBulkWithdrawals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkApprove = useCallback(async (withdrawalIds: string[], notes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.bulkApproveWithdrawals(withdrawalIds, notes);
      if (response.success && response.data) {
        return response.data.approved_count;
      } else {
        throw new Error(response.error?.message || 'Failed to approve withdrawals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkReject = useCallback(async (withdrawalIds: string[], reason: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await withdrawalApi.bulkRejectWithdrawals(withdrawalIds, reason);
      if (response.success && response.data) {
        return response.data.rejected_count;
      } else {
        throw new Error(response.error?.message || 'Failed to reject withdrawals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bulkApprove,
    bulkReject,
    loading,
    error,
  };
}
/**
 * Authentication hooks
 */

import { useState, useCallback } from 'react';
import { authApi } from '../api';
import { Admin, AdminLogin, AuthResponse, PasswordChange } from '../types';
import { tokenManager } from '../../../services/tokenManager';

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login function
  const login = useCallback(async (credentials: AdminLogin): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        const authData = response.data;

        // Store tokens
        tokenManager.setTokens(authData.access_token, authData.refresh_token);

        // Set admin data
        setAdmin(authData.admin);

        return true;
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear tokens and admin data regardless of API call result
      tokenManager.removeTokens();
      setAdmin(null);
      setError(null);
    }
  }, []);

  // Get current profile
  const getProfile = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.getProfile();

      if (response.success && response.data) {
        setAdmin(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);

      // If profile fetch fails, likely token is invalid
      tokenManager.removeTokens();
      setAdmin(null);

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<Admin>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.updateProfile(data);

      if (response.success && response.data) {
        setAdmin(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (data: PasswordChange): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.changePassword(data);

      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to change password');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback((): boolean => {
    return admin !== null && tokenManager.hasValidToken();
  }, [admin]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!admin) return false;
    return admin.permissions.includes(permission);
  }, [admin]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!admin) return false;
    return permissions.some(permission => admin.permissions.includes(permission));
  }, [admin]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!admin) return false;
    return permissions.every(permission => admin.permissions.includes(permission));
  }, [admin]);

  // Initialize auth state from stored token
  const initializeAuth = useCallback(async (): Promise<boolean> => {
    if (tokenManager.hasValidToken()) {
      return await getProfile();
    }
    return false;
  }, [getProfile]);

  return {
    admin,
    loading,
    error,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    initializeAuth,
    clearError: () => setError(null),
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { admin, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  return {
    admin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: admin?.role,
    permissions: admin?.permissions || [],
  };
}
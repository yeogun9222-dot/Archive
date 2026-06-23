/**
 * Authentication Hook for Longrise AI Platform
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { UserData, LoginRequest } from '../types/api';

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!apiService.isAuthenticated()) {
        setState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
        return;
      }

      // Validate token and get user data
      const userData = await apiService.getCurrentUser();
      setState({
        user: userData,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Auth check failed:', error);
      apiService.clearAuth();
      setState({
        user: null,
        loading: false,
        error: error.response?.data?.detail || 'Authentication failed',
        isAuthenticated: false,
      });
    }
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await apiService.login(credentials);
      const userData = await apiService.getCurrentUser();

      setState({
        user: userData,
        loading: false,
        error: null,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (!apiService.isAuthenticated()) return;

      const userData = await apiService.getCurrentUser();
      setState(prev => ({ ...prev, user: userData }));
      return userData;
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserData>) => {
    try {
      const updatedUser = await apiService.updateUser(updates);
      setState(prev => ({ ...prev, user: updatedUser }));
      return updatedUser;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshUser,
    updateUser,
    checkAuth,
  };
};
/**
 * Authentication Context Provider
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Admin, AdminLogin, PasswordChange } from '../types';

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
  login: (credentials: AdminLogin) => Promise<boolean>;
  logout: () => Promise<void>;
  getProfile: () => Promise<boolean>;
  updateProfile: (data: Partial<Admin>) => Promise<boolean>;
  changePassword: (data: PasswordChange) => Promise<boolean>;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Initialize authentication on mount
  useEffect(() => {
    auth.initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Permission wrapper component
interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthContext();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Authentication guard component
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role guard component
interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  roles,
  requireAll = false,
  fallback = null,
}: RoleGuardProps) {
  const { admin } = useAuthContext();

  if (!admin) {
    return <>{fallback}</>;
  }

  const hasRole = requireAll
    ? roles.every(role => admin.role === role)
    : roles.some(role => admin.role === role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for role-based access
export function useRole() {
  const { admin } = useAuthContext();

  const hasRole = (role: string): boolean => {
    return admin?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!admin) return false;
    return roles.includes(admin.role);
  };

  const isSuperAdmin = (): boolean => {
    return admin?.role === 'super_admin';
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['super_admin', 'admin']);
  };

  const isManager = (): boolean => {
    return hasAnyRole(['super_admin', 'admin', 'manager']);
  };

  return {
    role: admin?.role,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isManager,
  };
}
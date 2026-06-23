import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager } from '../services/tokenManager';
import { api } from '../services';
import { AdminUser } from '../types/shared';

interface AuthContextType {
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트시 저장된 토큰으로 현재 관리자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      try {
        const adminInfo = tokenManager.getAdminInfo();
        if (adminInfo && tokenManager.isValid()) {
          const response = await api.getCurrentAdmin();
          // FastAPI는 래퍼 없이 직접 관리자 객체를 반환
          const adminData = (response as any)?.data ?? response;
          if (adminData?.username) {
            setCurrentAdmin(adminData as AdminUser);
          } else {
            tokenManager.clearToken();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        tokenManager.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.login({ username, password });

      // FastAPI는 래퍼 없이 직접 토큰 객체를 반환
      const tokenPayload = (response as any)?.data ?? response;
      const access_token = tokenPayload?.access_token;

      if (!access_token) {
        throw new Error('로그인 응답이 유효하지 않습니다.');
      }

      const { expires_in, admin_id, role } = tokenPayload;

      tokenManager.setToken({
        accessToken: access_token,
        expiresAt: Date.now() + (expires_in * 1000),
        adminId: admin_id,
        adminRole: role,
      });

      // 현재 관리자 정보 조회
      const adminResponse = await api.getCurrentAdmin();
      // FastAPI는 래퍼 없이 직접 관리자 객체를 반환
      const adminData = (adminResponse as any)?.data ?? adminResponse;

      if (!adminData?.username) {
        throw new Error('관리자 정보를 가져올 수 없습니다.');
      }

      setCurrentAdmin({
        ...adminData,
        lastLogin: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      tokenManager.clearToken();
      setCurrentAdmin(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 실제 API 로그아웃
      await api.logout();
      console.log('✅ API 로그아웃 성공');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 로컬 상태 정리 (API 실패 여부와 관계없이 실행)
      tokenManager.clearToken();
      setCurrentAdmin(null);
    }
  };

  const value: AuthContextType = {
    currentAdmin,
    isAuthenticated: !!currentAdmin,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 토큰 관리자
 * api-endpoints 스킬 원칙: 중앙집중화된 토큰 관리
 */

import { apiConfig } from './config';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  adminId: string;
  adminRole: string;
}

class TokenManager {
  private tokenData: TokenData | null = null;
  private readonly storageKey = apiConfig.tokenStorageKey;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 토큰 설정
   */
  setToken(data: TokenData): void {
    this.tokenData = data;
    this.saveToStorage();
  }

  /**
   * 현재 토큰 조회
   */
  getToken(): string | null {
    if (!this.tokenData) return null;

    // 토큰 만료 확인
    if (Date.now() >= this.tokenData.expiresAt) {
      this.clearToken();
      return null;
    }

    return this.tokenData.accessToken;
  }

  /**
   * 토큰 유효성 확인
   */
  isValid(): boolean {
    return this.getToken() !== null;
  }

  /**
   * 관리자 정보 조회
   */
  getAdminInfo(): { adminId: string; adminRole: string } | null {
    if (!this.tokenData || !this.isValid()) return null;

    return {
      adminId: this.tokenData.adminId,
      adminRole: this.tokenData.adminRole,
    };
  }

  /**
   * 토큰 만료까지 남은 시간 (밀리초)
   */
  getTimeUntilExpiry(): number {
    if (!this.tokenData) return 0;
    return Math.max(0, this.tokenData.expiresAt - Date.now());
  }

  /**
   * 토큰 제거
   */
  clearToken(): void {
    this.tokenData = null;
    this.removeFromStorage();
  }

  /**
   * 로컬 스토리지에서 토큰 로드
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 자동 만료 확인
        if (Date.now() < parsed.expiresAt) {
          this.tokenData = parsed;
        } else {
          this.removeFromStorage();
        }
      }
    } catch (error) {
      console.warn('Failed to load token from storage:', error);
      this.removeFromStorage();
    }
  }

  /**
   * 로컬 스토리지에 토큰 저장
   */
  private saveToStorage(): void {
    try {
      if (this.tokenData) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tokenData));
      }
    } catch (error) {
      console.warn('Failed to save token to storage:', error);
    }
  }

  /**
   * 로컬 스토리지에서 토큰 제거
   */
  private removeFromStorage(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to remove token from storage:', error);
    }
  }
}

// 싱글톤 인스턴스
export const tokenManager = new TokenManager();
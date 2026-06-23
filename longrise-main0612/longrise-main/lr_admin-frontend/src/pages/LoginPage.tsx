/**
 * Login Page - Admin authentication
 */

import React, { useState } from 'react';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { Input, Checkbox } from '../components/shared/FormControls';
import { LoadingButton } from '../components/shared/LoadingStates';
import { Lock, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    two_factor_code: '',
    remember_me: false,
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await login(formData);

      if (success) {
        // Redirect will be handled by App component
        window.location.href = '/';
      } else if (error?.includes('2FA') || error?.includes('two-factor')) {
        setShowTwoFactor(true);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Longrise Admin</h1>
          <p className="text-slate-300">관리자 패널에 로그인하세요</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <Input
              name="username"
              type="text"
              label="사용자명"
              placeholder="관리자 계정을 입력하세요"
              value={formData.username}
              onChange={handleInputChange}
              leftIcon={<User className="w-5 h-5" />}
              required
              disabled={loading}
              className="bg-white/5 border-white/20 text-white placeholder-white/60"
            />

            {/* Password */}
            <Input
              name="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              leftIcon={<Lock className="w-5 h-5" />}
              required
              disabled={loading}
              className="bg-white/5 border-white/20 text-white placeholder-white/60"
            />

            {/* Two-Factor Code */}
            {showTwoFactor && (
              <Input
                name="two_factor_code"
                type="text"
                label="2단계 인증 코드"
                placeholder="6자리 인증 코드를 입력하세요"
                value={formData.two_factor_code}
                onChange={handleInputChange}
                leftIcon={<Shield className="w-5 h-5" />}
                required
                disabled={loading}
                maxLength={6}
                className="bg-white/5 border-white/20 text-white placeholder-white/60"
                hint="인증 앱에서 6자리 코드를 확인하세요"
              />
            )}

            {/* Remember Me */}
            <Checkbox
              name="remember_me"
              label="로그인 상태 유지"
              checked={formData.remember_me}
              onChange={handleInputChange}
              disabled={loading}
              className="text-white"
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="로그인 중..."
              variant="primary"
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={!formData.username || !formData.password || (showTwoFactor && !formData.two_factor_code)}
            >
              로그인
            </LoadingButton>
          </form>

          {/* Forgot Password */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-slate-300 hover:text-white text-sm transition-colors"
              onClick={() => {
                // Handle forgot password
                console.log('Forgot password clicked');
              }}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/40 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm font-medium">보안 알림</span>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed">
              이 페이지는 관리자 전용입니다. 승인되지 않은 접근 시도는 모니터링되며
              보안팀에 자동으로 보고됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          © 2024 Longrise AI Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
}
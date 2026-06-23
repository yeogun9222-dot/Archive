import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertCircle, X, Shield } from 'lucide-react';
import { apiConfig } from '../services/config';

interface LoginForm {
  username: string;
  password: string;
}

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      setShowErrorModal(true);
      return;
    }

    try {
      setError('');
      const success = await login(form.username, form.password);
      if (!success) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setShowErrorModal(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      {/* 메인 로그인 폼 */}
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="admin-card p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                    <Shield className="text-blue-400" size={32} />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  관리자 로그인
                </h2>
                <p className="text-slate-400 text-sm">
                  ENV: <span className="text-blue-400 font-bold">{apiConfig.environment}</span>
                  {' / '}
                  build-uid: <span className="text-blue-400 font-bold">{apiConfig.buildUID}</span>
                </p>
                <p className="text-slate-400 mt-2">
                  🚀 Longrise AI Admin Panel에 오신 것을 환영합니다! 🚀
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && !showErrorModal && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="아이디를 입력해주세요"
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="비밀번호를 입력해주세요"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-admin-primary w-full py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="animate-spin" size={16} />}
                  {isLoading ? 'Loading...' : 'Sign in'}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>

      {/* 에러 모달 */}
      {showErrorModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content max-w-sm mx-auto mt-32 p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-white mb-2">
                  로그인 실패
                </h3>
                <p className="text-sm text-slate-400">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="ml-4 text-slate-400 hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowErrorModal(false)}
                className="btn-admin-primary w-full py-2 text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

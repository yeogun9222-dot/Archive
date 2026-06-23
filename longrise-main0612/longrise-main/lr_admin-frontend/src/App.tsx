import { useState, useMemo } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UserManagement } from './components/UserManagement';
import { LoginView } from './components/LoginView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader, LogOut } from 'lucide-react';

// Simple placeholder component
function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-8 admin-card">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-400">이 기능은 개발 중입니다.</p>
      </div>
    </div>
  );
}

// 메인 어드민 화면 컴포넌트
function AdminDashboard() {
  const { currentAdmin, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const viewTitle = useMemo(() => {
    const titles: Record<ViewType, string> = {
      // 핵심 운영
      dashboard: '📊 종합 대시보드',

      // 회원 관리
      users: '👥 회원 통합 제어',
      member_lifecycle: '👥 회원 생명주기',
      referrals: '👥 조직 계보 트리 뷰',
      board: '👥 CS 데스크',

      // 자산 및 정산
      products: '💰 투자 패키지 제어',
      payouts: '💰 수당 정산 엔진',
      withdrawals: '💰 출금 신청 승인',
      p2p_market: '💰 P2P 이체 제어',
      tokens: '💰 토큰 시세 조정',

      // 보안 및 규제
      fds_monitoring: '🔒 이상거래 탐지 (FDS)',
      p2p_disputes: '🔒 P2P 분쟁 조정',
      reconciliation: '🔒 회계 대사',
      approvals: '🔒 승인 센터',
      audit_logs: '🔒 감사 로그',

      // 콘텐츠 관리 - 랜딩 페이지
      fe_hero: '🎨 랜딩 - 히어로 섹션',
      fe_features: '🎨 랜딩 - 핵심 기능',
      fe_whyus: '🎨 랜딩 - 플랫폼 강점',
      fe_crypto_ai: '🎨 랜딩 - AI 솔루션',
      fe_faq_footer: '🎨 랜딩 - FAQ/푸터',

      // 콘텐츠 관리 - 리워드 페이지
      fe_wall_of_fame: '🎨 리워드 - 명예의 전당',
      fe_team: '🎨 리워드 - 팀 실적',
      fe_tree: '🎨 리워드 - 조직도 관리',
      fe_ranks: '🎨 리워드 - 직급 정책',
      fe_invite: '🎨 리워드 - 초대 시스템',

      // 콘텐츠 관리 - 사용자 페이지
      fe_support: '🎨 사용자 - 고객센터',
      fe_news: '🎨 사용자 - 공지사항',
      fe_auth: '🎨 사용자 - 인증/가입',
      fe_security: '🎨 사용자 - 보안 설정',
      fe_profile: '🎨 사용자 - 프로필 페이지',
      fe_my_wealth: '🎨 사용자 - My Wealth',

      // 시스템 관리
      admin_mgmt: '⚙️ 관리자 계정',
      settings: '⚙️ 환경설정',
      ranks: '⚙️ 등급 관리'
    };
    return titles[currentView] || '시스템';
  }, [currentView]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;

      case 'users':
        return <UserManagement />;

      // Add other views as needed
      default:
        return <PlaceholderView title={viewTitle} />;
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logout();
    }
  };

  if (!currentAdmin) {
    return null; // This shouldn't happen due to auth guard, but just in case
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* 사이드바 */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        adminRole={currentAdmin.role}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단바 */}
        <header className="admin-topbar px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{viewTitle}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {currentAdmin.name} | {currentAdmin.role} 권한
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="btn-admin-outline px-3 py-2 text-sm flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">
                  {currentAdmin.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{currentAdmin.name}</p>
                <p className="text-xs text-slate-400">{currentAdmin.username}</p>
              </div>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
}

// 인증 상태에 따라 화면 전환하는 메인 앱 컴포넌트
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader className="animate-spin" size={24} />
          <span>인증 상태를 확인하는 중...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AdminDashboard /> : <LoginView />;
}

// 루트 앱 컴포넌트
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
import { useState, useMemo } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { PayoutEngine } from './components/PayoutEngine';
import { ProductControl } from './components/ProductControl';
import { TokenControl } from './components/TokenControl';
import { WithdrawalDesk } from './components/WithdrawalDesk';
import { ReferralTree } from './components/ReferralTree';
import { UserManagement } from './components/UserManagement';
import { ReconciliationCenter } from './components/ReconciliationCenter';
import { SupportBoard } from './components/SupportBoard';
import { SystemSettings } from './components/SystemSettings';
import { P2PMarket } from './components/P2PMarket';
import { KYCVerification } from './components/KYCVerification';
import { FrontEndControl } from './components/FrontEndControl';
import { FDSMonitoring } from './components/FDSMonitoring';
import { AdminManagement } from './components/AdminManagement';
import { Approvals } from './components/Approvals';
import { P2PDisputes } from './components/P2PDisputes';
import { NewsManagement } from './components/NewsManagement';
import { PolicySecurity } from './components/PolicySecurity';
import { CircuitBreaker } from './components/CircuitBreaker';
import { LandingPageControl } from './components/LandingPageControl';
import { AuthPolicyControl } from './components/AuthPolicyControl';
import { FeaturesControl } from './components/FeaturesControl';
import { TechStackControl } from './components/TechStackControl';
import { FooterControl } from './components/FooterControl';
import { HonorHallControl } from './components/HonorHallControl';
import { TeamRewardsControl } from './components/TeamRewardsControl';
import { TreeRewardsControl } from './components/TreeRewardsControl';
import { RankManagement } from './components/RankManagement';
import { AnimatePresence, motion } from 'motion/react';
import { MOCK_USERS, MOCK_WITHDRAWALS } from './lib/mockData';
import { cn } from './lib/utils';
import { User, DragonRank, WithdrawalRequest } from './types';
import { ClipboardCheck, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  
  const viewTitle = useMemo(() => {
    // ... same as before
    const titles: Record<ViewType, string> = {
      dashboard: '플랫폼 종합 대시보드',
      admin_mgmt: '관리자 계정 관리',
      users: '회원 통합 제어 센터',
      referrals: '조직 계보 마스터 제어 터미널',
      ranks: '드래곤 직급 모니터링',
      products: '드래곤 웰스 패키지(DWP) 통합 제어',
      p2p_market: 'P2P 및 내부 이체 제어',
      tokens: '토큰 풀 및 시세 조정',
      payouts: '수당 정산 분배 엔진',
      withdrawals: '출금 트랜잭션 데스크',
      circuit_breaker: '서킷 브레이커 & 킬스위치',
      reconciliation: '회계 대사 센터 (Auto-Recon)',
      approvals: '관리자 승인 센터',
      fds_monitoring: '이상거래 탐지 (FDS)',
      p2p_disputes: 'P2P 분쟁 조정 데스크',
      fe_support: '고객센터 UI 제어',
      fe_news: '공지사항 제어',
      fe_auth: '인증/가입 정책',
      fe_security: '보안 센터 제어',
      fe_profile: '마이 프로필 제어',
      fe_my_wealth: 'My Wealth 제어',
      fe_hero: '히어로 섹션 제어',
      fe_features: '핵심 기능 제어',
      fe_whyus: '플랫폼 강점 제어',
      fe_ranks: '직급 정책 및 승급 모니터링',
      fe_invite: '초대 화면 제어',
      fe_faq_footer: 'FAQ/푸터 제어',
      fe_crypto_ai: 'Crypto AI 제어',
      fe_wall_of_fame: '명예의 전당 제어',
      fe_team: '팀 실적 상세 제어',
      fe_tree: '조직 계보 UI/UX 및 디자인 엔진',
      board: 'CS 데스크 (고객센터)',
      settings: '환경설정 및 비상 제어 시스템'
    };
    return titles[currentView] || currentView;
  }, [currentView]);

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-dashboard-bg relative">
        {/* Global System Notice Bar */}
        <div className="bg-accent-amber/10 border-b border-accent-amber/20 px-6 py-2 flex items-center justify-between z-30">
           <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-accent-amber animate-pulse" />
              <p className="text-[10px] font-black text-accent-amber uppercase tracking-widest">
                 System Advisory: V7.2.2 엔진 최적화 작업이 진행 중입니다. (예상 종료: 14:00 UTC)
              </p>
           </div>
           <button className="text-[9px] font-bold text-accent-amber/60 hover:text-accent-amber transition-colors uppercase">상세 정책 확인</button>
        </div>
        
        <Topbar title={viewTitle} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'users' && <UserManagement users={users} />}
              {currentView === 'payouts' && <PayoutEngine />}
              {currentView === 'withdrawals' && <WithdrawalDesk withdrawals={withdrawals} />}
              {currentView === 'circuit_breaker' && <CircuitBreaker />}
              {currentView === 'products' && <ProductControl />}
              {currentView === 'tokens' && <TokenControl />}
              {currentView === 'referrals' && <ReferralTree />}
              {currentView === 'reconciliation' && <ReconciliationCenter />}
              {currentView === 'board' && <SupportBoard />}
              {currentView === 'settings' && <SystemSettings />}
              {currentView === 'p2p_market' && <P2PMarket />}
              {currentView === 'approvals' && <Approvals />}
              {currentView === 'fds_monitoring' && <FDSMonitoring />}
              {currentView === 'p2p_disputes' && <P2PDisputes />}
              {currentView === 'admin_mgmt' && <AdminManagement />}
              {currentView === 'fe_news' && <NewsManagement />}
              {(currentView === 'fe_auth' || currentView === 'fe_security') && <PolicySecurity view={currentView} />}
              {currentView === 'fe_hero' && <LandingPageControl />}
              {currentView === 'fe_auth' && <AuthPolicyControl />}
              {currentView === 'fe_features' && <FeaturesControl />}
              {currentView === 'fe_whyus' && <TechStackControl />}
              {currentView === 'fe_faq_footer' && <FooterControl />}
              {currentView === 'fe_wall_of_fame' && <HonorHallControl />}
              {currentView === 'fe_team' && <TeamRewardsControl />}
              {currentView === 'fe_tree' && <TreeRewardsControl />}
              {currentView === 'fe_ranks' && <RankManagement />}
              {currentView.startsWith('fe_') && !['fe_news', 'fe_auth', 'fe_security', 'fe_hero', 'fe_features', 'fe_whyus', 'fe_faq_footer', 'fe_wall_of_fame', 'fe_team', 'fe_tree', 'fe_ranks'].includes(currentView) && <FrontEndControl view={currentView} />}
              {renderPlaceholder(currentView)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global UI Decoration - Subtle Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#38bdf8 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </main>
    </div>
  );
}

function renderPlaceholder(view: string) {
  const implementedViews = [
    'dashboard', 'users', 'payouts', 'withdrawals', 'products', 
    'tokens', 'referrals', 'reconciliation', 'board', 'settings', 
    'p2p_market', 'approvals', 'fds_monitoring', 'admin_mgmt',
    'p2p_disputes', 'fe_news', 'fe_auth', 'fe_security', 'circuit_breaker'
  ];
  if (implementedViews.includes(view) || view.startsWith('fe_')) return null;
  return (
    <div className="dashboard-card flex flex-col items-center justify-center min-h-[400px] border-dashed border-white/10 opacity-50 italic">
      <p className="text-sm text-slate-500 uppercase tracking-widest text-center">
        {view} 컴포넌트 <br /> 구현 대기 중
      </p>
    </div>
  );
}

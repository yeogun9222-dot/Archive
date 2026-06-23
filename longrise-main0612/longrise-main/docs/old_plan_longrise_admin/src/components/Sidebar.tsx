import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Network, 
  Award, 
  Package, 
  Store, 
  Coins, 
  Zap, 
  ArrowDownToLine, 
  CheckCircle2, 
  ClipboardCheck, 
  Eye, 
  AlertTriangle, 
  Headset, 
  Newspaper, 
  Shield, 
  ShieldAlert, 
  UserCog, 
  Wallet, 
  MonitorPlay, 
  Layers, 
  Trophy, 
  Ticket, 
  Settings,
  ChevronDown,
  HelpCircle,
  Info,
  Cpu,
  UserPlus,
  ChevronRight,
  FolderTree,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewType = 
  | 'dashboard' | 'admin_mgmt' | 'users' | 'referrals' | 'ranks' 
  | 'products' | 'p2p_market' | 'tokens' | 'payouts' | 'withdrawals' 
  | 'circuit_breaker' | 'reconciliation' | 'approvals' | 'fds_monitoring' | 'p2p_disputes' 
  | 'fe_support' | 'fe_news' | 'fe_auth' | 'fe_security' | 'fe_profile' 
  | 'fe_my_wealth' | 'fe_hero' | 'fe_features' | 'fe_whyus' | 'fe_ranks' 
  | 'fe_invite' | 'fe_faq_footer' | 'fe_crypto_ai' | 'fe_wall_of_fame' | 'fe_team' | 'fe_tree'
  | 'board' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface MenuItem {
  id: ViewType;
  icon: any;
  label: string;
}

interface MenuFolder {
  id: string;
  label: string;
  icon: any;
  items: MenuItem[];
}

interface MenuGroup {
  title: string;
  items: (MenuItem | MenuFolder)[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '플랫폼 코어',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, label: '통합 대시보드' },
      { id: 'admin_mgmt', icon: ShieldCheck, label: '관리 계정 제어' }
    ]
  },
  {
    title: '회원 및 커뮤니티',
    items: [
      { id: 'users', icon: Users, label: '회원 통합 제어' },
      { id: 'referrals', icon: Network, label: '조직 계보 마스터 제어' },
      { id: 'board', icon: Ticket, label: 'CS 데스크 (티켓)' }
    ]
  },
  {
    title: '자산 및 정산 엔진',
    items: [
      { id: 'products', icon: Package, label: '드래곤 패키지 제어' },
      { id: 'payouts', icon: Zap, label: '수당 정산 엔진' },
      { id: 'withdrawals', icon: ArrowDownToLine, label: '출금 승인 데스크' },
      { id: 'p2p_market', icon: Store, label: 'P2P 이체 제어' },
      { id: 'tokens', icon: Coins, label: '토큰 풀 / 시세' }
    ]
  },
  {
    title: '보안 및 리스크',
    items: [
      { id: 'circuit_breaker', icon: ShieldAlert, label: '서킷 브레이커' },
      { id: 'reconciliation', icon: CheckCircle2, label: '회계 대사 센터' },
      { id: 'approvals', icon: ClipboardCheck, label: '관리자 승인 센터' },
      { id: 'fds_monitoring', icon: Eye, label: 'FDS 모니터링' },
      { id: 'p2p_disputes', icon: AlertTriangle, label: 'P2P 분쟁 조정' }
    ]
  },
  {
    title: '프론트엔드 CMS',
    items: [
      {
        id: 'folder_landing',
        label: '메인 랜딩 제어',
        icon: Monitor,
        items: [
          { id: 'fe_hero', icon: MonitorPlay, label: '히어로 섹션' },
          { id: 'fe_features', icon: Layers, label: '핵심 기능 섹션' },
          { id: 'fe_whyus', icon: HelpCircle, label: '플랫폼 강점' },
          { id: 'fe_crypto_ai', icon: Cpu, label: 'CRYPTO AI 솔루션' },
          { id: 'fe_faq_footer', icon: Info, label: 'FAQ / 푸터 제어' }
        ]
      },
      {
        id: 'folder_rewards',
        label: '리워드 페이지 제어',
        icon: Award,
        items: [
          { id: 'fe_wall_of_fame', icon: Trophy, label: '명예의 전당 (Honor)' },
          { id: 'fe_team', icon: Users, label: '팀 실적 상세 (Team)' },
          { id: 'fe_tree', icon: Network, label: '조직 계보 UI/에셋 제어' },
          { id: 'fe_ranks', icon: Award, label: '직급 정책 및 승급 모니터링' },
          { id: 'fe_invite', icon: UserPlus, label: '초대 보너스 구성 (Invite)' }
        ]
      },
      {
        id: 'folder_app',
        label: '사용자 기능 제어',
        icon: UserCog,
        items: [
          { id: 'fe_support', icon: Headset, label: '고객센터 UI' },
          { id: 'fe_news', icon: Newspaper, label: '공지사항 관리' },
          { id: 'fe_auth', icon: Shield, label: '인증/가입 정책' },
          { id: 'fe_security', icon: ShieldAlert, label: '보안 센터 설정' },
          { id: 'fe_profile', icon: UserCog, label: '마이 프로필' },
          { id: 'fe_my_wealth', icon: Wallet, label: 'My Wealth 구성' }
        ]
      }
    ]
  },
  {
    title: '설정',
    items: [
      { id: 'settings', icon: Settings, label: '환경설정 (M13 EXIT)' }
    ]
  }
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    folder_landing: true,
    folder_rewards: false,
    folder_app: false
  });

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-expand folder if current view is inside it
  useEffect(() => {
    MENU_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if ('items' in item) {
          if (item.items.some(sub => sub.id === currentView)) {
            setOpenFolders(prev => ({ ...prev, [item.id]: true }));
          }
        }
      });
    });
  }, [currentView]);

  return (
    <aside className="w-60 bg-[#020617] border-r border-border-main flex flex-col h-screen shrink-0 z-20">
      <div className="p-6 pb-8">
        <h1 className="text-lg font-extrabold text-accent-blue tracking-wider uppercase">
          LONGRISE AI
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
          Master Plan V7.5
        </p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="px-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if ('items' in item) {
                  const isOpen = openFolders[item.id];
                  const hasActiveChild = item.items.some(sub => sub.id === currentView);

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        onClick={() => toggleFolder(item.id)}
                        className={cn(
                          "nav-item w-full text-left flex items-center justify-between group",
                          hasActiveChild && !isOpen && "bg-white/5 text-accent-blue"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={16} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                      </button>
                      
                      {isOpen && (
                        <div className="ml-4 border-l border-white/5 pl-2 space-y-0.5 mt-0.5 animate-in slide-in-from-left-2 duration-200">
                          {item.items.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => onViewChange(sub.id as ViewType)}
                              className={cn(
                                "nav-item w-full text-left py-1.5 text-[11px]",
                                currentView === sub.id && "active"
                              )}
                            >
                              <sub.icon size={14} />
                              <span className="truncate">{sub.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as ViewType)}
                    className={cn(
                      "nav-item w-full text-left",
                      currentView === item.id && "active"
                    )}
                  >
                    <item.icon size={16} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border-main bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-bold text-xs">
            JP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-text-primary truncate">제이크 (총괄 관리자)</span>
            <span className="text-[10px] text-text-muted font-mono truncate">관리자 ID: lrs_m04</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

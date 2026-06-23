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
  Monitor,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewType =
  | 'dashboard' | 'admin_mgmt' | 'users' | 'referrals' | 'ranks'
  | 'products' | 'p2p_market' | 'tokens' | 'payouts' | 'withdrawals'
  | 'reconciliation' | 'approvals' | 'fds_monitoring' | 'p2p_disputes'
  | 'fe_support' | 'fe_news' | 'fe_auth' | 'fe_security' | 'fe_profile'
  | 'fe_my_wealth' | 'fe_hero' | 'fe_features' | 'fe_whyus' | 'fe_ranks'
  | 'fe_invite' | 'fe_faq_footer' | 'fe_crypto_ai' | 'fe_wall_of_fame' | 'fe_team' | 'fe_tree'
  | 'board' | 'settings' | 'audit_logs' | 'member_lifecycle';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  adminRole?: 'super' | 'finance' | 'community' | 'content';
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

// 역할별 접근 권한 정의
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'super': [
    // 모든 메뉴 접근 가능
    'dashboard', 'users', 'referrals', 'board', 'member_lifecycle',
    'products', 'payouts', 'withdrawals', 'p2p_market', 'tokens',
    'fds_monitoring', 'p2p_disputes', 'reconciliation', 'approvals', 'audit_logs',
    'fe_hero', 'fe_features', 'fe_whyus', 'fe_crypto_ai', 'fe_faq_footer',
    'fe_wall_of_fame', 'fe_team', 'fe_tree', 'fe_ranks', 'fe_invite',
    'fe_support', 'fe_news', 'fe_auth', 'fe_security', 'fe_profile', 'fe_my_wealth',
    'admin_mgmt', 'settings'
  ],
  'finance': [
    // 재정 관리 관련만
    'dashboard', 'products', 'payouts', 'withdrawals', 'tokens', 'reconciliation', 'settings', 'audit_logs'
  ],
  'community': [
    // 커뮤니티 관리 관련만
    'dashboard', 'users', 'referrals', 'board', 'member_lifecycle', 'fds_monitoring', 'p2p_disputes', 'approvals', 'audit_logs'
  ],
  'content': [
    // 콘텐츠 관리만
    'dashboard', 'fe_hero', 'fe_features', 'fe_whyus', 'fe_crypto_ai', 'fe_faq_footer',
    'fe_wall_of_fame', 'fe_team', 'fe_tree', 'fe_ranks', 'fe_invite',
    'fe_support', 'fe_news', 'fe_auth', 'fe_security', 'fe_profile', 'fe_my_wealth'
  ]
};

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '📊 핵심 운영',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, label: '종합 대시보드' }
    ]
  },
  {
    title: '👥 회원 관리',
    items: [
      { id: 'users', icon: Users, label: '회원 통합 제어 (500+명)' },
      { id: 'member_lifecycle', icon: Activity, label: '회원 생명주기' },
      { id: 'referrals', icon: Network, label: '조직 계보 트리 뷰' },
      { id: 'board', icon: Ticket, label: 'CS 데스크' }
    ]
  },
  {
    title: '💰 자산 및 정산',
    items: [
      { id: 'products', icon: Package, label: '투자 패키지 제어' },
      { id: 'payouts', icon: Zap, label: '수당 정산 엔진' },
      { id: 'withdrawals', icon: ArrowDownToLine, label: '출금 신청 승인' },
      { id: 'p2p_market', icon: Store, label: 'P2P 이체 제어' },
      { id: 'tokens', icon: Coins, label: '토큰 시세 조정' }
    ]
  },
  {
    title: '🔒 보안 및 규제',
    items: [
      { id: 'fds_monitoring', icon: Eye, label: '이상거래 탐지 (FDS)' },
      { id: 'p2p_disputes', icon: AlertTriangle, label: 'P2P 분쟁 조정' },
      { id: 'reconciliation', icon: CheckCircle2, label: '회계 대사' },
      { id: 'approvals', icon: ClipboardCheck, label: '승인 센터' },
      { id: 'audit_logs', icon: ClipboardCheck, label: '감사 로그' }
    ]
  },
  {
    title: '🎨 콘텐츠 관리',
    items: [
      {
        id: 'folder_landing',
        label: '📄 랜딩 페이지',
        icon: Monitor,
        items: [
          { id: 'fe_hero', icon: MonitorPlay, label: '히어로 섹션' },
          { id: 'fe_features', icon: Layers, label: '핵심 기능' },
          { id: 'fe_whyus', icon: HelpCircle, label: '플랫폼 강점' },
          { id: 'fe_crypto_ai', icon: Cpu, label: 'AI 솔루션' },
          { id: 'fe_faq_footer', icon: Info, label: 'FAQ / 푸터' }
        ]
      },
      {
        id: 'folder_rewards',
        label: '🏆 리워드 페이지',
        icon: Award,
        items: [
          { id: 'fe_wall_of_fame', icon: Trophy, label: '명예의 전당' },
          { id: 'fe_team', icon: Users, label: '팀 실적' },
          { id: 'fe_tree', icon: Network, label: '조직도 관리' },
          { id: 'fe_ranks', icon: Award, label: '직급 정책' },
          { id: 'fe_invite', icon: UserPlus, label: '초대 시스템' }
        ]
      },
      {
        id: 'folder_app',
        label: '⚡ 사용자 페이지',
        icon: UserCog,
        items: [
          { id: 'fe_support', icon: Headset, label: '고객센터' },
          { id: 'fe_news', icon: Newspaper, label: '공지사항' },
          { id: 'fe_auth', icon: Shield, label: '인증/가입' },
          { id: 'fe_security', icon: ShieldAlert, label: '보안 설정' },
          { id: 'fe_profile', icon: UserCog, label: '프로필 페이지' },
          { id: 'fe_my_wealth', icon: Wallet, label: 'My Wealth' }
        ]
      }
    ]
  },
  {
    title: '⚙️ 시스템 관리',
    items: [
      { id: 'admin_mgmt', icon: ShieldCheck, label: '관리자 계정' },
      { id: 'settings', icon: Settings, label: '환경설정' }
    ]
  }
];

export function Sidebar({ currentView, onViewChange, adminRole = 'super' }: SidebarProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    folder_landing: false,  // 기본적으로 접혀있음 (필요시만 열기)
    folder_rewards: false,
    folder_app: false
  });

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 역할 기반으로 메뉴 필터링
  const getFilteredMenuGroups = (role: string): MenuGroup[] => {
    const allowedItems = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS['super'];

    return MENU_GROUPS.map(group => ({
      ...group,
      items: group.items
        .map(item => {
          if ('items' in item) {
            // 폴더인 경우 - 서브 아이템 필터링
            const filteredSubItems = item.items.filter(sub => allowedItems.includes(sub.id));
            if (filteredSubItems.length === 0) return null; // 빈 폴더는 제거
            return { ...item, items: filteredSubItems };
          }
          // 일반 메뉴 아이템
          return allowedItems.includes(item.id) ? item : null;
        })
        .filter((item): item is MenuItem | MenuFolder => item !== null)
    }))
    .filter(group => group.items.length > 0); // 빈 그룹 제거
  };

  const filteredMenuGroups = getFilteredMenuGroups(adminRole);

  // Auto-expand folder if current view is inside it
  useEffect(() => {
    filteredMenuGroups.forEach(group => {
      group.items.forEach(item => {
        if ('items' in item) {
          if (item.items.some(sub => sub.id === currentView)) {
            setOpenFolders(prev => ({ ...prev, [item.id]: true }));
          }
        }
      });
    });
  }, [currentView, filteredMenuGroups]);

  return (
    <aside className="admin-sidebar w-60 flex flex-col h-screen shrink-0 z-20">
      <div className="p-6 pb-8">
        <h1 className="text-lg font-extrabold text-blue-400 tracking-wider uppercase">
          LONGRISE AI
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
          Admin Panel V1.0
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {filteredMenuGroups.map((group) => (
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
                          "w-full text-left flex items-center justify-between group px-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors",
                          hasActiveChild && !isOpen && "bg-white/5 text-blue-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={16} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                      </button>

                      {isOpen && (
                        <div className="ml-4 border-l border-white/5 pl-2 space-y-0.5 mt-0.5">
                          {item.items.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => onViewChange(sub.id as ViewType)}
                              className={cn(
                                "w-full text-left py-1.5 text-[11px] px-6 text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors flex items-center gap-3",
                                currentView === sub.id && "bg-blue-600/20 text-blue-300 border-r-2 border-blue-400"
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
                      "w-full text-left px-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center gap-3",
                      currentView === item.id && "bg-blue-600/20 text-blue-300 border-r-2 border-blue-400"
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

      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
            JP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-200 truncate">제이크 (총괄 관리자)</span>
            <span className="text-[10px] text-slate-400 font-mono truncate">관리자 ID: lrs_m04</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
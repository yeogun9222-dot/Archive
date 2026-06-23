import { useState } from 'react';
import { User, DragonRank } from '../types';
import { cn } from '../lib/utils';
import { Search, Filter, MoreHorizontal, UserCog, Ban, Lock, Unlock, LogOut, Wallet, ShieldCheck, ShieldAlert, X, Package, Users, History, ArrowDownRight, ArrowUpRight, ArrowRight } from 'lucide-react';

export function UserManagement({ users }: { users: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [activeRank, setActiveRank] = useState<DragonRank | 'All'>('All');

  const rankPriority: Record<DragonRank, number> = {
    'Black Dragon': 6,
    'Red Dragon': 5,
    'Purple Dragon': 4,
    'Blue Dragon': 3,
    'White Dragon': 2,
    'Investor': 0
  };

  const filteredUsers = users
    .filter(u => 
      (activeRank === 'All' || u.rank === activeRank) &&
      (u.nickname.toLowerCase().includes(search.toLowerCase()) || 
       u.id.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => rankPriority[b.rank] - rankPriority[a.rank]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getRankColor = (rank: DragonRank) => {
    const colors: Record<DragonRank, string> = {
      'Investor': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      'White Dragon': 'text-slate-100 border-slate-100/20 bg-slate-100/5',
      'Blue Dragon': 'text-accent-blue border-accent-blue/20 bg-accent-blue/5',
      'Purple Dragon': 'text-purple-400 border-purple-400/20 bg-purple-400/5',
      'Red Dragon': 'text-red-400 border-red-400/20 bg-red-400/5',
      'Black Dragon': 'text-accent-amber border-accent-amber/20 bg-accent-amber/10'
    };
    return colors[rank];
  };

  const translateRank = (rank: string) => {
    const ranks: any = {
      'Investor': '일반 회원',
      'White Dragon': '화이트 드래곤',
      'Blue Dragon': '블루 드래곤',
      'Purple Dragon': '퍼플 드래곤',
      'Red Dragon': '레드 드래곤',
      'Black Dragon': '블랙 드래곤'
    };
    return ranks[rank] || rank;
  };

  return (
    <div className="space-y-6 px-6 relative">
      <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-main bg-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">회원 통합 제어 센터</h3>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-medium">관리 레벨: 관리자 전용 엑세스 V7.2</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
              <input 
                type="text" 
                placeholder="UID, 닉네임 검색..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-64"
              />
            </div>
            <button className="btn-gold text-[10px] py-1.5 px-4 uppercase tracking-widest">회원 추가</button>
            <button className="btn-outline-gold text-[10px] py-1.5 px-4 uppercase tracking-widest">CSV 내보내기</button>
          </div>
        </div>

        {/* Rank Filter Tabs */}
        <div className="flex px-6 border-b border-border-main bg-black/5 overflow-x-auto no-scrollbar">
           {['All', 'Black Dragon', 'Red Dragon', 'Purple Dragon', 'Blue Dragon', 'White Dragon', 'Investor'].map((r) => (
             <button
               key={r}
               onClick={() => setActiveRank(r as any)}
               className={cn(
                 "px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2",
                 activeRank === r 
                   ? "text-accent-blue border-accent-blue bg-accent-blue/5" 
                   : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
               )}
             >
               {r === 'All' ? '전체 회원' : translateRank(r)}
             </button>
           ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="whitespace-nowrap">
                <th className="w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-accent-blue"
                  />
                </th>
                <th className="w-12 text-center text-[10px]">고유번호</th>
                <th className="text-[10px]">회원 프로필</th>
                <th className="text-[10px]">직급 상태</th>
                <th className="text-[10px]">활성 패키지 (Units)</th>
                <th className="text-[10px]">보유 자산 (USDT/CNYT)</th>
                <th className="text-[10px]">팀 전체 실적</th>
                <th className="text-[10px]">KYC 상태</th>
                <th className="text-[10px]">Max-Out (10배수)</th>
                <th className="text-[10px]">계정 상태</th>
                <th className="sticky right-0 top-0 bg-bg-surface z-10 text-right text-[10px] border-l border-white/10 px-4">제어</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className={cn("hover:bg-white/[0.01] transition-colors", selectedIds.includes(u.id) && "bg-accent-blue/5")}>
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(u.id)}
                      onChange={() => toggleSelectOne(u.id)}
                      className="accent-accent-blue"
                    />
                  </td>
                  <td className="text-center font-mono text-[10px] text-text-muted italic opacity-50">{u.id.split('-')[1]}</td>
                  <td className="cursor-pointer group/profile" onClick={() => setSelectedUser(u)}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="font-bold text-text-primary text-[11px] group-hover/profile:text-accent-blue transition-colors">{u.nickname}</span>
                      <span className="text-[9px] text-text-muted font-mono opacity-50 group-hover/profile:opacity-100">{u.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter shadow-sm whitespace-nowrap",
                      getRankColor(u.rank)
                    )}>
                      {translateRank(u.rank)}
                    </span>
                  </td>
                  <td>
                    <PortfolioBadges packages={u.packages} />
                  </td>
                  <td className="font-mono text-xs whitespace-nowrap">
                    <span className="text-accent-blue font-bold">{u.usdt.toLocaleString()} USDT</span>
                    <span className="text-text-muted mx-2">/</span>
                    <span className="text-purple-400 font-bold opacity-60 text-[9px]">{u.cnyt.toLocaleString()} CNYT</span>
                  </td>
                  <td className="font-mono text-xs font-black text-slate-300">
                    ${u.teamVol.toLocaleString()}
                  </td>
                  <td>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap",
                      u.pageface === 'Approved' ? "text-accent-green bg-accent-green/10" : u.pageface === 'Pending' ? "text-accent-amber bg-accent-amber/10" : "text-red-500 bg-red-500/10"
                    )}>
                      {u.pageface === 'Approved' ? '인증 완료' : u.pageface === 'Pending' ? '심사 중' : '미인증'}
                    </span>
                  </td>
                  <td>
                    <div className="w-24">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                          "text-[9px] font-black tabular-nums",
                          u.maxOutRatio >= 9 ? "text-red-500 animate-pulse" : u.maxOutRatio >= 7 ? "text-accent-amber" : "text-accent-green"
                        )}>
                          {u.maxOutRatio.toFixed(1)}x
                        </span>
                        <span className="text-[8px] text-text-muted opacity-50 uppercase font-bold">Limit</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            u.maxOutRatio >= 9 ? "bg-red-500" : u.maxOutRatio >= 7 ? "bg-accent-amber" : "bg-accent-green"
                          )} 
                          style={{ width: `${Math.min(u.maxOutRatio * 10, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0", 
                        u.isFrozen ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : u.status === 'Active' ? "bg-accent-green shadow-[0_0_8px_rgba(74,222,128,0.4)]" : "bg-slate-500"
                      )} />
                      <span className="text-[9px] font-bold uppercase text-text-muted">
                        {u.isFrozen ? '동결됨' : u.status === 'Active' ? '정상' : '정지'}
                      </span>
                    </div>
                  </td>
                  <td className="sticky right-0 bg-bg-surface z-10 text-right border-l border-white/10 px-4">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="text-[9px] text-accent-blue border border-accent-blue/30 px-2 py-1.5 rounded hover:bg-accent-blue hover:text-white transition-all font-black uppercase tracking-tighter bg-bg-surface"
                    >
                      상세 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent-blue px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300 z-40">
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
              {selectedIds.length}명의 회원 선택됨
            </span>
            <div className="h-4 w-px bg-slate-900/20" />
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-slate-800 transition-all">
                <Ban size={12} /> 계정 일괄 정지
              </button>
              <button className="flex items-center gap-2 bg-white text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-slate-100 transition-all shadow-sm">
                <Wallet size={12} /> 포인트 일괄 지급
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-1.5 text-slate-900/60 hover:text-slate-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 bg-black/20 flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest border-t border-border-main">
          <span>활성 노드 총계: {users.length}</span>
          <div className="flex gap-4 items-center">
             <button disabled className="opacity-30 cursor-not-allowed">이전</button>
             <div className="bg-black/40 px-3 py-1 rounded border border-white/5">
                <span className="text-accent-blue font-black">페이지 01 // 01</span>
             </div>
             <button disabled className="opacity-30 cursor-not-allowed">다음</button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          getRankColor={getRankColor}
          translateRank={translateRank}
        />
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, getRankColor, translateRank }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'wallets' | 'packages' | 'network' | 'history'>('info');

  const tabs = [
    { id: 'info', label: '정보 요약 (Profile)', icon: UserCog },
    { id: 'wallets', label: '자산/지갑 (Assets)', icon: Wallet },
    { id: 'packages', label: '투자/패키지 (Nodes)', icon: Package },
    { id: 'network', label: '계보/팀 (Referrals)', icon: Users },
    { id: 'history', label: '활동기록 (Logs)', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-bg-surface border border-border-main w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border-main bg-black/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-black text-xl">
                {user.nickname[0]}
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">{user.nickname}</h3>
                   <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter",
                      getRankColor(user.rank)
                   )}>{translateRank(user.rank)}</span>
                </div>
                <p className="text-[10px] text-text-muted font-mono tracking-widest">{user.id} | 가입일: {user.joinDate}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-main bg-black/10 shrink-0 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
             <button
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={cn(
                 "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                 activeTab === t.id 
                   ? "text-accent-blue border-accent-blue bg-accent-blue/5" 
                   : "text-text-muted border-transparent hover:text-white hover:bg-white/5"
               )}
             >
               <t.icon size={14} />
               {t.label}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
           {activeTab === 'info' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-6">
                   <SectionTitle title="계정 프로필 매니지먼트" />
                   <div className="space-y-4">
                      <DetailRow label="닉네임" value={user.nickname} controllable />
                      <DetailRow label="이메일" value={user.email} />
                      <DetailRow label="추천인 ID (Sponsor)" value={user.sponsorId || 'SYSTEM'} controllable />
                      <DetailRow label="계정 등급" value={translateRank(user.rank)} controllable />
                      <DetailRow label="보안 OTP" value={user.otp ? '활성화됨' : '비활성'} controllable />
                   </div>

                   <div className="pt-4 space-y-3">
                      <SectionTitle title="본인 인증 제어 (KYC Layer)" />
                      <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                         <div className="flex items-center justify-between mb-4">
                            <div>
                               <p className="text-xs font-bold text-text-primary uppercase">얼굴 인식 인증 상태</p>
                               <p className="text-[9px] text-text-muted italic">회원의 잘못된 등록이나 리뉴얼 시 사용</p>
                            </div>
                            <span className={cn(
                               "text-[10px] font-black px-2 py-1 rounded",
                               user.pageface === 'Approved' ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-500"
                            )}>{user.pageface === 'Approved' ? '인증 완료' : '미인증'}</span>
                         </div>
                         <button className="w-full py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            얼굴 인증(KYC) 즉시 초기화/해제
                         </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <SectionTitle title="시스템 제한 프로토콜" />
                   <div className="space-y-3">
                     <RestrictionItem icon={Lock} label="출금 차단" desc="블록체인 출금 게이트웨이 정지" active />
                     <RestrictionItem icon={Ban} label="계정 잠금" desc="내부 모든 활동 즉시 정지" />
                     <RestrictionItem icon={ShieldAlert} label="자산 동결 (Force Freeze)" desc="마스터 플랜 10배수 정책 위반 및 부정거래 탐지" active={user.isFrozen} />
                     <RestrictionItem icon={LogOut} label="강제 세션 종료" desc="즉각적인 로그아웃 프로토콜" />
                   </div>
                   
                   <div className="pt-4">
                      <button className="w-full bg-red-600 py-3 rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all border border-red-500/30">
                         영구 시스템 BAN (계정 파괴)
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'wallets' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="dashboard-card border-accent-blue/20 bg-accent-blue/5">
                      <SectionTitle title="USDT 노드 자산 현황" />
                      <p className="text-3xl font-black text-accent-blue mt-4 tabular-nums">{user.usdt.toLocaleString()} USDT</p>
                      <button className="mt-4 text-[9px] font-black text-accent-blue border border-accent-blue/30 px-3 py-1 rounded uppercase hover:bg-accent-blue/10">잔액 수동 조정</button>
                   </div>
                   <div className="dashboard-card border-purple-500/20 bg-purple-500/5">
                      <SectionTitle title="CNYT 거래 자산 현황" />
                      <p className="text-3xl font-black text-purple-400 mt-4 tabular-nums">{user.cnyt.toLocaleString()} CNYT</p>
                      <button className="mt-4 text-[9px] font-black text-purple-400 border border-purple-400/30 px-3 py-1 rounded uppercase hover:bg-purple-400/10">포인트 지급/차감</button>
                   </div>
                </div>

                <div className="space-y-4">
                   <SectionTitle title="연동 지갑 주소 (On-Chain Addresses)" />
                   <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent-blue/10 text-accent-blue rounded">
                               <ArrowDownRight size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-text-muted uppercase">입금 게이트웨이 (Deposit)</p>
                               <code className="text-xs font-mono text-text-primary select-all">TJ9M...Rw8qLzP3kNm7x9Qz2A5vW1e5R</code>
                            </div>
                         </div>
                         <button className="text-[9px] font-black text-slate-500 uppercase hover:text-white">주소 초기화</button>
                      </div>
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent-amber/10 text-accent-amber rounded">
                               <ArrowUpRight size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-text-muted uppercase">출금 전용 지갑 (Withdrawal)</p>
                               <code className="text-xs font-mono text-text-primary select-all">TR7NH...8pLq2vA9xL1k5wM3e9R2zP</code>
                            </div>
                         </div>
                         <button className="text-[9px] font-black text-red-400 uppercase hover:text-red-500">주소 변경 차단</button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'packages' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionTitle title="활성 노드 패키지 인벤토리" />
                <table className="data-table">
                   <thead>
                      <tr>
                         <th className="text-[10px]">상품명</th>
                         <th className="text-[10px]">구매가</th>
                         <th className="text-[10px]">활성화 일시</th>
                         <th className="text-[10px]">일일 ROI</th>
                         <th className="text-right text-[10px]">상태</th>
                      </tr>
                   </thead>
                   <tbody>
                      {user.packages.length > 0 ? user.packages.map((p: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                           <td className="text-[11px] font-bold text-white uppercase">{p.type} Node</td>
                           <td className="text-[11px] font-mono">${p.price.toLocaleString()}</td>
                           <td className="text-[11px] font-mono text-text-muted">{p.date}</td>
                           <td className="text-[11px] font-bold text-accent-blue">추구형 (고정 4~18%)</td>
                           <td className="text-right">
                              <span className="text-[9px] font-black text-accent-green bg-accent-green/10 px-2 py-0.5 rounded border border-accent-green/20 uppercase tracking-widest">수익 엔진 가동 중</span>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan={5} className="text-center py-8 text-[11px] text-text-muted italic">활성화된 상품이 없습니다.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'network' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-6">
                   <SectionTitle title="팀 성과 지표 (Performance)" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                         <p className="text-[9px] font-bold text-text-muted uppercase mb-1">직계 추천 (Direct)</p>
                         <p className="text-xl font-black text-white">{user.directs} 명</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                         <p className="text-[9px] font-bold text-text-muted uppercase mb-1">전체 팀원 (Total)</p>
                         <p className="text-xl font-black text-white">{user.teamSize.toLocaleString()} 명</p>
                      </div>
                      <div className="col-span-2 p-4 bg-black/40 rounded-xl border border-white/5">
                         <p className="text-[9px] font-bold text-text-muted uppercase mb-1">총 팀 매출 실적 (Total Team Volume)</p>
                         <p className="text-2xl font-black text-accent-green">${user.teamVol.toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <SectionTitle title="직급 달성 및 유지 기록" />
                   <div className="space-y-3">
                      <div className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-bold text-text-muted uppercase">현재 직급 달성일</span>
                         <span className="text-[10px] font-black text-white">2026-03-15</span>
                      </div>
                      <div className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                         <span className="text-[10px] font-bold text-text-muted uppercase">최고 직급 도달 시간</span>
                         <span className="text-[10px] font-black text-accent-blue">가입 후 42일 경과</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'history' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SectionTitle title="최근 거래 및 입출금 기록 (Audit Logs)" />
                <table className="data-table">
                   <thead>
                      <tr>
                         <th className="text-[10px]">유형</th>
                         <th className="text-[10px]">수량</th>
                         <th className="text-[10px]">TX ID / 사유</th>
                         <th className="text-right text-[10px]">일시</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr className="hover:bg-white/[0.02]">
                         <td><span className="text-[9px] font-bold text-accent-blue p-1 rounded bg-accent-blue/5 border border-accent-blue/10 uppercase">출금 (Withdraw)</span></td>
                         <td className="font-mono text-xs font-bold">-1,500.00 USDT</td>
                         <td className="text-[10px] text-text-muted font-mono">TJ9M...Rw8qL</td>
                         <td className="text-right text-[10px] text-text-muted">12분 전</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                         <td><span className="text-[9px] font-bold text-purple-400 p-1 rounded bg-purple-400/5 border border-purple-400/10 uppercase">P2P 이체</span></td>
                         <td className="font-mono text-xs font-bold text-purple-400">-500.00 CNYT</td>
                         <td className="text-[10px] text-text-muted font-mono italic">회원 {user.nickname}에게 이체</td>
                         <td className="text-right text-[10px] text-text-muted">1시간 전</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                         <td><span className="text-[9px] font-bold text-accent-green p-1 rounded bg-accent-green/5 border border-accent-green/10 uppercase">수당 (POI)</span></td>
                         <td className="font-mono text-xs font-bold text-accent-green">+42.50 USDT</td>
                         <td className="text-[10px] text-text-muted">일일 ROI 배당 지급</td>
                         <td className="text-right text-[10px] text-text-muted">오늘 04:00</td>
                      </tr>
                   </tbody>
                </table>
             </div>
           )}
        </div>

        {/* Footer Audit Label */}
        <div className="p-4 bg-black/40 border-t border-border-main flex items-center justify-between shrink-0">
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent-blue" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">모든 제어 로그는 보안 서버에 기록되며 취소가 불가능합니다.</span>
           </div>
           <span className="text-[9px] font-black text-white/20 uppercase font-mono">SYS_ADMIN_UID: AD-1029</span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
       <div className="h-4 w-1 bg-accent-blue rounded-full" />
       <h4 className="text-[11px] font-black text-text-primary uppercase tracking-[0.1em]">{title}</h4>
    </div>
  );
}

function DetailRow({ label, value, controllable }: { label: string, value: string, controllable?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.03]">
       <span className="text-[11px] text-text-muted">{label}</span>
       <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-text-primary font-mono">{value}</span>
          {controllable && (
            <button className="text-[9px] text-accent-blue opacity-50 hover:opacity-100 transition-opacity font-bold uppercase italic border-b border-accent-blue/30">수정</button>
          )}
       </div>
    </div>
  );
}

function RestrictionItem({ icon: Icon, label, desc, active }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20">
       <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded bg-white/5", active ? "text-red-400" : "text-text-muted")}>
             <Icon size={14} />
          </div>
          <div>
             <p className="text-[10px] font-bold text-text-primary uppercase tracking-tight">{label}</p>
             <p className="text-[9px] text-text-muted italic">{desc}</p>
          </div>
       </div>
       <div className={cn(
         "w-8 h-4 rounded-full relative transition-colors",
         active ? "bg-red-500" : "bg-slate-700"
       )}>
         <div className={cn(
           "absolute top-1 w-2 h-2 rounded-full bg-white transition-all",
           active ? "right-1" : "left-1"
         )} />
       </div>
    </div>
  );
}

function PortfolioBadges({ packages }: { packages: any[] }) {
  const counts = packages.reduce((acc: any, p: any) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const pTypes = [
    { type: 'Flexible', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { type: 'Basic', color: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30' },
    { type: 'Standard', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { type: 'Premium', color: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30' },
    { type: 'VIP', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  return (
    <div className="flex gap-1" title="패키지 활성화 분포 (F | B | S | P | V)">
      {pTypes.map(p => {
        const count = counts[p.type] || 0;
        return (
          <div 
            key={p.type} 
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-[9px] font-black border transition-all",
              count > 0 ? p.color : "opacity-10 border-white/5 grayscale"
            )}
          >
            {count}
          </div>
        );
      })}
    </div>
  );
}

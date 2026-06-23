import { useState } from 'react';
import { Users, Save, RefreshCw, BarChart3, Search, Filter, ArrowUpRight, ShieldCheck, Mail, Calendar, UserPlus, MinusCircle, PlusCircle, History, AlertTriangle, UserMinus, Settings2, Database, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_USERS } from '../lib/mockData';

interface AuditLog {
  id: string;
  timestamp: string;
  type: 'volume_add' | 'volume_sub' | 'status_change' | 'sponsor_change';
  detail: string;
  admin: string;
}

export function TeamRewardsControl() {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log_1', timestamp: '2026-04-19 14:20', type: 'volume_add', detail: '초기 프로모션 실적 +2,000 USDT 인젝션', admin: 'lrs_master' }
  ]);

  const handleSearch = () => {
    // Exact match for ID or Nickname
    const user = MOCK_USERS.find(u => 
      u.id.toLowerCase() === searchQuery.toLowerCase() || 
      u.nickname.toLowerCase() === searchQuery.toLowerCase()
    );

    if (user) {
      setTargetUser({
        ...user,
        organizationVolume: user.teamVol || 0,
        activeDirects: user.directs || 0,
        totalTeam: user.teamSize || 0,
        referrals: [
          { id: 'R01', userId: 'Dragon_Master', rank: 'BLACK DRAGON', package: 'VIP PACKAGE', investment: 15000, regDate: '2026-04-18', status: 'ACTIVE' },
          { id: 'R02', userId: 'Golden_Tiger88', rank: 'RED DRAGON', package: 'PREMIUM PACK', investment: 8000, regDate: '2026-04-17', status: 'ACTIVE' },
          { id: 'R03', userId: 'Phoenix_Alpha', rank: 'BLUE DRAGON', package: 'VIP PACKAGE', investment: 12000, regDate: '2026-04-15', status: 'ACTIVE' },
          { id: 'R04', userId: 'Crypto_King', rank: 'WHITE DRAGON', package: 'STANDARD PACK', investment: 3000, regDate: '2026-04-12', status: 'INACTIVE' },
        ]
      });
    } else {
      alert('회원을 정확히 찾을 수 없습니다. (ID: LR-1001, LR-1002 등을 입력하세요)');
    }
  };

  const applyVolumeOverride = (mode: 'plus' | 'minus') => {
    if (!targetUser || adjustmentValue <= 0) return;
    
    setSaving(true);
    const change = mode === 'plus' ? adjustmentValue : -adjustmentValue;
    
    setTimeout(() => {
      setTargetUser(prev => ({
        ...prev,
        organizationVolume: prev.organizationVolume + change
      }));

      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: mode === 'plus' ? 'volume_add' : 'volume_sub',
        detail: `[조직 볼륨 ${mode === 'plus' ? '+' : '-'}${adjustmentValue.toLocaleString()} USDT] 관리자 수동 보정`,
        admin: '제이크(lrs_m04)'
      };

      setAuditLogs(prev => [newLog, ...prev]);
      setAdjustmentValue(0);
      setSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Search Header */}
      <div className="dashboard-card border-accent-blue/20 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl text-accent-blue shadow-lg shadow-accent-blue/5">
                <Database size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">마스터 네트워크 오버라이드 (Master Network Override)</h3>
                <p className="text-[11px] text-accent-blue font-bold uppercase tracking-widest mt-1 opacity-80 flex items-center gap-1.5">
                   <ShieldCheck size={14} /> 실시간 회원 실적 감시 및 관리자 강제 개입 시스템
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="회원 ID(LR-1001) 또는 닉네임 입력"
                   className="w-80 bg-black/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-accent-blue focus:ring-1 ring-accent-blue/30 outline-none transition-all placeholder:text-slate-600"
                />
             </div>
             <button 
                onClick={handleSearch} 
                className="bg-accent-blue hover:bg-accent-blue/80 text-slate-950 font-black py-3 px-8 rounded-xl text-[12px] uppercase tracking-wider transition-all h-[46px]"
             >
                회원 검색
             </button>
          </div>
        </div>
      </div>

      {!targetUser ? (
        <div className="dashboard-card border-dashed border-white/10 flex flex-col items-center justify-center py-32 opacity-30 select-none">
           <div className="relative mb-6">
              <Users size={80} className="text-slate-500" />
              <Search size={32} className="absolute -bottom-2 -right-2 text-accent-blue animate-pulse" />
           </div>
           <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-400">Waiting for User Search</p>
           <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Enter UID to initiate master audit session</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
           
           {/* Section 1: User Identity & Micro Stats */}
           <div className="xl:col-span-3 space-y-6">
              <div className="dashboard-card bg-[#1e293b]/50 border-white/5 p-8 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Users size={120} />
                 </div>

                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-blue to-accent-blue/30 p-[1px]">
                       <div className="w-full h-full rounded-3xl bg-slate-900 flex items-center justify-center text-3xl font-black text-accent-blue">
                          {targetUser.nickname[0]}
                       </div>
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-white">{targetUser.nickname}</h2>
                       <p className="text-xs font-mono text-accent-blue tracking-widest mt-1 uppercase">{targetUser.id}</p>
                    </div>
                    <div className="px-3 py-1 bg-accent-amber/10 border border-accent-amber/20 rounded-full">
                       <span className="text-[10px] font-black text-accent-amber uppercase">{targetUser.rank}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Active Directs</p>
                       <p className="text-xl font-black text-white">{targetUser.activeDirects}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Total Team</p>
                       <p className="text-xl font-black text-white">{targetUser.totalTeam.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              {/* Volume Master Override Panel */}
              <div className="dashboard-card border-accent-amber/30 bg-accent-amber/[0.03] p-8">
                 <div className="flex items-center gap-2 mb-6">
                    <Settings2 size={18} className="text-accent-amber" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Master Volume Override</h4>
                 </div>

                 <div className="p-5 bg-black/40 rounded-2xl border border-accent-amber/10 mb-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Calculated Volume</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white tabular-nums">${targetUser.organizationVolume.toLocaleString()}</span>
                       <span className="text-xs font-bold text-accent-amber uppercase underline">USDT</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Adjustment Amount</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={adjustmentValue || ''}
                            onChange={(e) => setAdjustmentValue(Math.abs(parseInt(e.target.value)) || 0)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-accent-amber focus:border-accent-amber outline-none transition-all"
                            placeholder="0"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <button 
                          onClick={() => applyVolumeOverride('plus')}
                          disabled={saving || !adjustmentValue}
                          className="flex flex-col items-center justify-center p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl hover:bg-accent-green/20 transition-all text-accent-green disabled:opacity-30"
                       >
                          <TrendingUp size={24} className="mb-2" />
                          <span className="text-[10px] font-black uppercase">Increase</span>
                       </button>
                       <button 
                          onClick={() => applyVolumeOverride('minus')}
                          disabled={saving || !adjustmentValue}
                          className="flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-red-500 disabled:opacity-30"
                       >
                          <TrendingDown size={24} className="mb-2" />
                          <span className="text-[10px] font-black uppercase">Decrease</span>
                       </button>
                    </div>
                 </div>

                 <div className="mt-6 flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-red-400/80 leading-tight">
                       Manual overrides bypass smart contract validation. This action will be logged under your administrative ID for permanent auditing.
                    </p>
                 </div>
              </div>
           </div>

           {/* Section 2: Interactive Records & Logs */}
           <div className="xl:col-span-9 space-y-6">
              
              {/* Direct Referral Insights */}
              <div className="dashboard-card p-0 overflow-hidden border-white/5">
                 <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-accent-blue/10 rounded-lg text-accent-blue">
                          <Users size={20} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-white uppercase">Direct Referral Network (Level 1)</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Real-time interaction with {targetUser.nickname}'s downstream nodes</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase">
                          <Filter size={14} /> Filter
                       </button>
                    </div>
                 </div>

                 <div className="overflow-x-auto overflow-y-auto max-h-[440px] custom-scrollbar">
                    <table className="data-table w-full">
                       <thead className="sticky top-0 z-10">
                          <tr>
                             <th className="bg-slate-900/95 backdrop-blur-sm">ID / NICKNAME</th>
                             <th className="bg-slate-900/95 backdrop-blur-sm">DRAGON RANK</th>
                             <th className="bg-slate-900/95 backdrop-blur-sm">TEAM VOLUME</th>
                             <th className="bg-slate-900/95 backdrop-blur-sm">JOIN DATE</th>
                             <th className="bg-slate-900/95 backdrop-blur-sm text-right">MASTER CONTROL</th>
                          </tr>
                       </thead>
                       <tbody>
                          {targetUser.referrals.map((r: any) => (
                             <tr key={r.id} className="hover:bg-accent-blue/[0.02] group transition-colors">
                                <td className="py-5 px-6">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white">{r.userId}</span>
                                      <span className="text-[9px] font-mono text-slate-500 tracking-tighter uppercase">{r.id}</span>
                                   </div>
                                </td>
                                <td className="px-6">
                                   <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 border border-white/5 rounded text-[9px] font-black text-accent-amber uppercase tracking-tighter">
                                      {r.rank}
                                   </div>
                                </td>
                                <td className="px-6 font-mono text-xs font-black text-white">
                                   ${r.investment.toLocaleString()}
                                </td>
                                <td className="px-6">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-mono text-slate-500">{r.regDate}</span>
                                      <span className={cn(
                                         "text-[8px] font-black uppercase mt-0.5",
                                         r.status === 'ACTIVE' ? "text-accent-green" : "text-red-500 opacity-50"
                                      )}>{r.status}</span>
                                   </div>
                                </td>
                                <td className="px-6 text-right">
                                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      <button title="Audit Node" className="p-2 bg-white/5 hover:bg-accent-blue/10 text-slate-400 hover:text-accent-blue rounded-lg">
                                         <ArrowUpRight size={16} />
                                      </button>
                                      <button title="Change Sponsor" className="p-2 bg-white/5 hover:bg-accent-amber/10 text-slate-400 hover:text-accent-amber rounded-lg">
                                         <RefreshCw size={16} />
                                      </button>
                                      <button title="Restrict Access" className="p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg">
                                         <UserMinus size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Master Audit Trails (Real-time Updated) */}
              <div className="dashboard-card border-white/5">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <History size={18} />
                       </div>
                       <div>
                          <h6 className="text-[12px] font-black text-white uppercase tracking-widest leading-none">Administrative Audit Trails</h6>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Chain-of-custody logs for recent network manipulations</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-accent-blue hover:underline uppercase tracking-widest">Global Log History</button>
                 </div>

                 <div className="space-y-2">
                    {auditLogs.map((log) => (
                       <div key={log.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                                "p-1.5 rounded-md",
                                log.type.includes('add') ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-500"
                             )}>
                                {log.type.includes('add') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-white leading-relaxed">{log.detail}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[8px] font-mono text-slate-500">{log.timestamp}</span>
                                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">·</span>
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin ID: {log.admin}</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-[10px] font-black text-slate-700 uppercase select-none">Verified</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
           <div className="bg-[#1e293b] border border-white/10 p-8 rounded-3xl flex flex-col items-center space-y-4 shadow-2xl">
              <RefreshCw size={40} className="text-accent-blue animate-spin" />
              <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Master Node Data...</p>
           </div>
        </div>
      )}
    </div>
  );
}

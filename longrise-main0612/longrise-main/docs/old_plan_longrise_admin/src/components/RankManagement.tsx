import { useState, useMemo } from 'react';
import { Award, ShieldCheck, Target, TrendingUp, Users, ArrowRight, Zap, Edit3, Save, Search, UserCheck, Flame, Crown, Diamond, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_USERS } from '../lib/mockData';
import { DragonRank, User } from '../types';

interface RankCriteria {
  rank: DragonRank;
  minBodyValue: number;
  minDirects: number;
  minSubRankCount: number;
  subRankType: DragonRank;
  minTeamVol: number;
  benefit: string;
  color: string;
  accent: string;
}

const INITIAL_CRITERIA: RankCriteria[] = [
  {
    rank: 'White Dragon',
    minBodyValue: 0,
    minDirects: 0,
    minSubRankCount: 0,
    subRankType: 'Investor',
    minTeamVol: 0,
    benefit: 'Basic Member Access',
    color: 'text-slate-300',
    accent: 'bg-slate-500'
  },
  {
    rank: 'Blue Dragon',
    minBodyValue: 500,
    minDirects: 2,
    minSubRankCount: 2,
    subRankType: 'White Dragon',
    minTeamVol: 2500,
    benefit: '3-Tier Rollup Bonus',
    color: 'text-accent-blue',
    accent: 'bg-accent-blue'
  },
  {
    rank: 'Purple Dragon',
    minBodyValue: 1000,
    minDirects: 5,
    minSubRankCount: 3,
    subRankType: 'Blue Dragon',
    minTeamVol: 10000,
    benefit: '7-Tier Rollup Bonus',
    color: 'text-purple-500',
    accent: 'bg-purple-500'
  },
  {
    rank: 'Red Dragon',
    minBodyValue: 5000,
    minDirects: 8,
    minSubRankCount: 3,
    subRankType: 'Purple Dragon',
    minTeamVol: 100000,
    benefit: '15-Tier + 1% Growth Pool',
    color: 'text-red-500',
    accent: 'bg-red-500'
  },
  {
    rank: 'Black Dragon',
    minBodyValue: 10000,
    minDirects: 12,
    minSubRankCount: 3,
    subRankType: 'Red Dragon',
    minTeamVol: 1000000,
    benefit: '25-Tier + 1% Founder Pool',
    color: 'text-accent-amber',
    accent: 'bg-accent-amber'
  }
];

export function RankManagement() {
  const [activeTab, setActiveTab] = useState<'policy' | 'monitor'>('policy');
  const [criteria, setCriteria] = useState<RankCriteria[]>(INITIAL_CRITERIA);
  const [editingRank, setEditingRank] = useState<DragonRank | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditUser, setAuditUser] = useState<User | null>(null);

  const handleSearchUser = () => {
    const user = MOCK_USERS.find(u => 
      u.id.toLowerCase() === searchQuery.toLowerCase() || 
      u.nickname.toLowerCase() === searchQuery.toLowerCase()
    );
    setAuditUser(user || null);
  };

  const calculateProgress = (user: User, targetRank: RankCriteria) => {
    if (!targetRank) return null;
    return {
      bodyValue: Math.min(100, (user.bodyValue / targetRank.minBodyValue) * 100) || 0,
      directs: Math.min(100, (user.directs / targetRank.minDirects) * 100) || 0,
      subRanks: Math.min(100, (3 / targetRank.minSubRankCount) * 100), // Mocking sub-rank count for now
      teamVol: Math.min(100, (user.teamVol / targetRank.minTeamVol) * 100) || 0
    };
  };

  const distributionData = [
    { name: 'Inv', count: 420 },
    { name: 'White', count: 180 },
    { name: 'Blue', count: 85 },
    { name: 'Purple', count: 32 },
    { name: 'Red', count: 12 },
    { name: 'Black', count: 4 }
  ];

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-accent-amber/20 bg-[#0f172a]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-accent-amber/10 border border-accent-amber/20 rounded-2xl text-accent-amber shadow-lg shadow-accent-amber/5">
                <Crown size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">드래곤 등급(RANK) 통합 관리 센터</h3>
                <div className="flex items-center gap-3 mt-1.5 font-bold">
                   <button 
                    onClick={() => setActiveTab('policy')}
                    className={cn(
                      "text-[10px] uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                      activeTab === 'policy' ? "bg-accent-amber text-black" : "text-slate-500 hover:text-white"
                    )}
                   >
                     System Policy
                   </button>
                   <button 
                    onClick={() => setActiveTab('monitor')}
                    className={cn(
                      "text-[10px] uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                      activeTab === 'monitor' ? "bg-accent-amber text-black" : "text-slate-500 hover:text-white"
                    )}
                   >
                     Member Promotion Audit
                   </button>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             {/* Global Distribution Mini Chart */}
             <div className="hidden lg:flex items-end gap-1 h-10">
                {distributionData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 group">
                     <div className="w-4 bg-accent-amber/20 rounded-t-[1px] relative h-full">
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-accent-amber rounded-t-[1px] transition-all" 
                          style={{ height: `${(d.count / 420) * 100}%` }}
                        />
                     </div>
                     <span className="text-[6px] text-slate-500 font-bold group-hover:text-white">{d.name}</span>
                  </div>
                ))}
             </div>
             <div className="text-right mr-4 border-l border-white/10 pl-8">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</p>
                <p className="text-xs font-black text-accent-green uppercase">Engine Healthy</p>
             </div>
          </div>
        </div>
      </div>

      {activeTab === 'policy' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rank Criteria List */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Zap size={14} className="text-accent-amber" /> Dragon Rank Hierarchy & Trophies
            </h4>
            
            {criteria.map((rank) => (
              <div 
                key={rank.rank}
                className={cn(
                  "dashboard-card border-white/5 bg-[#1e293b]/40 hover:bg-[#1e293b]/60 transition-all cursor-pointer group p-6",
                  editingRank === rank.rank && "border-accent-amber bg-[#1e293b]/80"
                )}
                onClick={() => setEditingRank(rank.rank)}
              >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", 
                        rank.accent.replace('bg-', 'bg-opacity-10 border-').replace('text-', '')
                      )}>
                         {rank.rank === 'Black Dragon' ? <Crown size={32} className={rank.color} /> : 
                          rank.rank === 'Red Dragon' ? <Flame size={32} className={rank.color} /> :
                          rank.rank === 'Purple Dragon' ? <Diamond size={32} className={rank.color} /> :
                          <Award size={32} className={rank.color} />}
                      </div>
                      <div>
                         <h5 className="text-lg font-black text-white italic">{rank.rank}</h5>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{rank.benefit}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 text-right">
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase">Min Team Vol</p>
                         <p className="text-sm font-black text-white font-mono">${rank.minTeamVol.toLocaleString()}</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-700 group-hover:text-white transition-colors" />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Panel */}
          <div className="xl:sticky xl:top-6 h-fit space-y-6">
            {!editingRank ? (
              <div className="dashboard-card border-dashed border-white/10 flex flex-col items-center justify-center py-40 opacity-30 select-none">
                 <Edit3 size={60} className="text-slate-500 mb-4" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Rank Card to Modify Criteria</p>
              </div>
            ) : (
              <div className="dashboard-card border-accent-amber/50 bg-[#1e293b]/80 p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Target size={24} className="text-accent-amber" />
                      <h4 className="text-xl font-black text-white italic">{editingRank} Edit Mode</h4>
                   </div>
                   <button className="flex items-center gap-2 px-6 py-2 bg-accent-amber text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                      <Save size={16} /> Update Policy
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min Body Value ($)</label>
                      <input 
                        type="number" 
                        defaultValue={criteria.find(c => c.rank === editingRank)?.minBodyValue}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-accent-amber outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min Team Sales ($)</label>
                      <input 
                        type="number" 
                        defaultValue={criteria.find(c => c.rank === editingRank)?.minTeamVol}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-accent-amber outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Direct Referrals (Count)</label>
                      <input 
                        type="number" 
                        defaultValue={criteria.find(c => c.rank === editingRank)?.minDirects}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-accent-amber outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sub-Rank Condition</label>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-4">
                         <span className="text-xs text-white font-bold">{criteria.find(c => c.rank === editingRank)?.minSubRankCount}x</span>
                         <span className="text-[10px] text-slate-500 uppercase">{criteria.find(c => c.rank === editingRank)?.subRankType}</span>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-accent-amber/5 border border-accent-amber/10 rounded-2xl space-y-4">
                   <p className="text-[10px] font-black text-accent-amber uppercase tracking-widest">Promotion Benefit Logic</p>
                   <textarea 
                     className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-xs text-slate-300 min-h-[100px] outline-none focus:border-accent-amber"
                     defaultValue={criteria.find(c => c.rank === editingRank)?.benefit}
                   />
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                   <AlertTriangle size={18} className="text-red-500 shrink-0" />
                   <p className="text-[9px] text-slate-400 font-bold leading-relaxed uppercase">
                      현 등급의 조건을 수정하면 전체 가입 회원 중 해당 등급 전 단계 회원들의 실시간 승급 연산에 즉각 반영됩니다. 신중히 저장하십시오.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Member Promotion Monitor Card */
        <div className="space-y-8 animate-in fade-in duration-500">
           {/* User Search */}
           <div className="dashboard-card bg-[#1e293b]/50 border-white/5 p-8">
              <div className="flex items-center justify-between gap-8">
                 <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                      placeholder="Audit member by ID or Nickname (e.g. InvestJP)"
                      className="w-full bg-black/60 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-lg text-white focus:border-accent-amber outline-none transition-all placeholder:text-slate-700 font-black tracking-tight"
                    />
                 </div>
                 <button 
                  onClick={handleSearchUser}
                  className="btn-gold px-12 py-5 rounded-2xl flex items-center gap-2 font-black uppercase text-sm"
                 >
                   <UserCheck size={20} /> RUN RANK AUDIT
                 </button>
              </div>
           </div>

           {!auditUser ? (
             <div className="dashboard-card border-dashed border-white/10 flex flex-col items-center justify-center py-32 opacity-30 select-none">
                <Target size={80} className="text-slate-500 mb-6" />
                <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-400">Waiting for Audit Target</p>
             </div>
           ) : (
             <div className="space-y-8">
                {/* User Current Status Section - Derived from Image */}
                <div className="dashboard-card bg-gradient-to-r from-[#2c0b0e] via-[#4a0e12] to-[#2c0b0e] border-accent-amber/20 p-12 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Award size={160} className="text-accent-amber rotate-12" />
                   </div>
                   
                   <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
                      <div className="flex items-center gap-10">
                         <div className="w-40 h-40 rounded-full border-4 border-accent-amber/30 p-2 shadow-2xl relative">
                            <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center overflow-hidden">
                               <Users size={64} className="text-slate-600" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-[#4a0e12]">
                               {auditUser.rank === 'White Dragon' ? 'BASIC MEMBER' : 'ELITE MEMBER'}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[12px] font-black text-accent-amber uppercase tracking-[0.3em]">Current Identity Status</p>
                            <h2 className="text-7xl font-light text-white italic font-serif leading-none tracking-tighter">
                               {auditUser.rank}
                            </h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-2">
                               Entry Level Rank — Active Since {auditUser.joinDate}
                            </p>
                         </div>
                      </div>

                      <div className="flex gap-6 mt-12 md:mt-0">
                         <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 min-w-[220px] text-center transform hover:scale-105 transition-transform">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Body Value</p>
                            <p className="text-4xl font-black text-white italic tracking-tight">${auditUser.bodyValue.toLocaleString()}</p>
                         </div>
                         <div className="bg-black/60 backdrop-blur-xl border border-accent-amber/20 rounded-[2.5rem] p-10 min-w-[220px] text-center shadow-[0_0_40px_-5px_rgba(245,158,11,0.15)] relative transform hover:scale-105 transition-transform">
                            <div className="absolute -top-8 -right-8 opacity-20">
                               <Crown size={80} className="text-accent-amber" />
                            </div>
                            <p className="text-[10px] font-black text-accent-amber uppercase tracking-widest mb-3">Team Sales</p>
                            <p className="text-4xl font-black text-accent-amber italic tracking-tight">${auditUser.teamVol.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Target Achievement Section - Derived from Image */}
                <div className="dashboard-card bg-[#1a080a] border-white/5 p-12">
                   <div className="flex items-center justify-between mb-16">
                      <div className="space-y-4">
                         <h3 className="text-4xl font-light text-white italic uppercase tracking-[0.1em] font-serif">Target Achievement</h3>
                         <p className="text-[11px] font-black text-accent-amber uppercase tracking-[0.3em]">Conditions to reach "Blue Dragon" Rank</p>
                      </div>
                      <button className="bg-accent-amber/10 border border-accent-amber/30 text-accent-amber px-8 py-3 rounded-xl flex items-center gap-3 hover:bg-accent-amber hover:text-black transition-all">
                         <Flame size={18} />
                         <span className="text-[12px] font-black uppercase tracking-widest">Boost Active</span>
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                      {[
                        { label: 'Body Value (Personal)', current: auditUser.bodyValue, target: 500, ratio: 48, units: '$' },
                        { label: 'Direct Referrals', current: auditUser.directs, target: 4, ratio: 33, units: '' },
                        { label: 'Sub-Rank (White)', current: 1, target: 3, ratio: 33, units: '' },
                        { label: 'Team Sales Vol', current: auditUser.teamVol, target: 2500, ratio: 17, units: '$' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-6">
                           <div className="flex justify-between items-baseline">
                              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{item.label}</span>
                              <span className="text-lg font-black text-white font-mono">{item.ratio}%</span>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-accent-amber to-red-600 transition-all duration-1000" 
                                style={{ width: `${item.ratio}%` }}
                              />
                           </div>
                           <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl">
                              <div>
                                 <p className="text-[8px] font-bold text-slate-500 uppercase">Now</p>
                                 <p className="text-xs font-black text-white">{item.units}{item.current.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-bold text-accent-amber uppercase">Gap</p>
                                 <p className="text-xs font-black text-accent-amber">+{item.units}{(item.target - item.current).toLocaleString()}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Rank Catalog Grid - Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                   {criteria.slice(1).map((rank) => (
                     <div key={rank.rank} className="dashboard-card bg-[#140506]/80 border-white/5 p-10 flex flex-col items-center text-center group hover:bg-[#1f0709] transition-all">
                        <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                           <ShieldCheck size={28} className="text-accent-blue opacity-40" />
                        </div>
                        <h4 className="text-2xl font-light text-white italic tracking-tighter uppercase font-serif mb-4">{rank.rank}</h4>
                        <div className="space-y-1 mb-8">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Qualification</p>
                           <p className="text-[10px] font-bold text-slate-300 max-w-[140px] leading-relaxed">
                              Body ${rank.minBodyValue} / Team ${rank.minTeamVol.toLocaleString()} + {rank.minSubRankCount}x Lower Rank Subs
                           </p>
                        </div>
                        <div className="mt-auto border-t border-white/5 pt-6 w-full">
                           <p className="text-[8px] font-black text-accent-amber uppercase tracking-[0.2em] mb-1">Elite Benefit</p>
                           <p className="text-sm font-black text-accent-amber tracking-tighter uppercase">{rank.benefit.split(' + ')[0]}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Admin Manual Override Action */}
                <div className="dashboard-card border-red-500/30 bg-red-500/[0.05] p-8 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="p-4 bg-red-500/20 rounded-2xl text-red-500">
                         <Zap size={32} className="animate-pulse" />
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-white uppercase tracking-tight">System Force Promotion</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Manually elevate user rank bypassing qualification engine logs</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <select className="bg-black border border-white/10 rounded-xl px-6 py-3 text-xs font-black text-white outline-none focus:border-red-500 uppercase tracking-widest">
                         {criteria.map(c => <option key={c.rank} value={c.rank}>{c.rank}</option>)}
                      </select>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                         AUTHORIZE PROMOTION
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

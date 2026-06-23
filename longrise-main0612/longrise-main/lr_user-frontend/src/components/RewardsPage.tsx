import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Users, 
  Network, 
  Target, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Plus, 
  Minus,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
  History,
  LayoutGrid,
  Percent,
  PlusCircle,
  MinusCircle,
  FileText,
  Gem,
  Shield,
  ShieldCheck,
  Award,
  Lock,
  Unlock,
  Key,
  AlertTriangle
} from 'lucide-react';

type RewardsTab = 'honor' | 'team' | 'tree' | 'ranks';

// --- Trading Password Gate Component ---
const TradingPasswordGate = ({
  onSuccess,
  onVerify,
}: {
  onSuccess: () => void;
  onVerify: (password: string) => Promise<boolean>;
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 4) {
      setError('Enter the 4-digit Trading PIN');
      return;
    }
    const verified = await onVerify(password).catch(() => false);
    if (verified) {
      onSuccess();
    } else {
      setError('Invalid Identity Passkey');
      setPassword('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-20 p-10 glass-panel rounded-2xl border border-luxury-gold/30 flex flex-col items-center text-center space-y-8"
    >
      <div className="w-20 h-20 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold border border-luxury-gold/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
        <Lock size={32} />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest">Authentication Required</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Please enter your Trading Password to access sensitive team data.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="relative">
          <input 
            type="password" 
            inputMode="numeric"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`w-full bg-black/60 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-5 px-6 pt-8 text-white text-center text-2xl font-mono tracking-[1em] focus:border-luxury-gold transition-all outline-none`}
            placeholder="••••"
          />
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-gray-600 uppercase tracking-widest">Secure Entry</span>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] font-black uppercase tracking-widest"
          >
            {error}
          </motion.p>
        )}

        <button 
          type="submit"
          disabled={password.length !== 4}
          className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.2)]"
        >
          Verify Identity
        </button>
      </form>

      <div className="flex flex-col gap-2 pt-4">
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Security Protocol V7.2 Active</p>
        <button className="text-[9px] text-luxury-gold font-bold uppercase tracking-widest hover:underline">Forgot password?</button>
      </div>
    </motion.div>
  );
};

// --- Trading Password Required Notice ---
const TradingPasswordRequiredPrompt = ({ onSetView }: { onSetView: (v: any) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-20 p-10 glass-panel rounded-2xl border border-red-500/30 flex flex-col items-center text-center space-y-8"
    >
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <AlertTriangle size={32} />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest text-red-500">Action Required</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
           To view organizational data and team details, you must first configure your <span className="text-white">Trading Password</span> (4-digit numeric PIN) in your profile.
        </p>
      </div>

      <button 
        onClick={() => onSetView('profile')}
        className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3"
      >
        <UserCheck size={18} /> Configure Security PIN
      </button>

      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Security Protocol V7.2 Active</p>
    </motion.div>
  );
};

const EmptyRewardsState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">{title}</p>
    <p className="mt-3 text-sm text-gray-600">{description}</p>
  </div>
);

export const RewardsPage = ({
  user,
  onSetView,
  rewardsData,
  onVerifyTradingPassword,
}: {
  user: any;
  onSetView: (v: any) => void;
  rewardsData?: any;
  onVerifyTradingPassword?: (password: string) => Promise<boolean>;
}) => {
  const [activeTab, setActiveTab] = useState<RewardsTab>('honor');
  const [isVerified, setIsVerified] = useState(false);

  // Verification helper based on global user state
  const hasSetPassword = user.hasSetTradingPassword;

  // Auto-reset verification on tab change if you want, but user usually wants to browse all tabs once unlocked
  // We'll keep it verified for the duration of the page mount

  const tabs = [
    { id: 'honor', label: 'HONOR', icon: Crown },
    { id: 'team', label: 'TEAM', icon: Users },
    { id: 'tree', label: 'TREE', icon: Network },
    { id: 'ranks', label: 'RANKS', icon: Target },
  ];

  const sovereignHall = rewardsData?.honorLeaders || [];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-20 min-h-screen">
      {/* Top 3 Honor Cards (Always visible at the top of Rewards) */}
      <div className="space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">The Highest Achievement</p>
          <h2 className="text-5xl lg:text-8xl font-serif font-black text-white">The Sovereign Hall</h2>
        </div>

        {sovereignHall.length === 0 ? (
          <EmptyRewardsState title="No honor rankings yet" description="Honor rankings will appear when live leaderboard data is available." />
        ) : (
        <div className="grid grid-cols-3 gap-2 lg:gap-8 px-2 lg:px-4 items-center">
          {sovereignHall.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-3 lg:p-10 rounded-2xl border-2 flex flex-col items-center text-center space-y-3 lg:space-y-8 relative overflow-hidden group transition-all duration-700
                ${s.type === 'black' 
                  ? 'scale-105 lg:scale-110 z-10 bg-gradient-to-br from-[#1a0505] to-[#000] border-luxury-gold shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_40px_rgba(234,179,8,0.2)]' 
                  : 'scale-95 bg-gradient-to-br from-[#4a0808]/80 to-[#2d0505]/95 border-luxury-gold/30 shadow-[0_0_50px_rgba(220,38,38,0.25)] hover:shadow-[0_0_70px_rgba(234,179,8,0.3)] hover:border-luxury-gold/60'}
              `}
            >
              {/* Type-specific glow backgrounds */}
              {s.type === 'black' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)] animate-pulse" />
              )}

              <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-black/60 border-2 flex items-center justify-center p-4 relative group-hover:scale-110 transition-transform
                ${s.type === 'black' ? 'border-luxury-gold shadow-[0_0_40px_rgba(234,179,8,0.4)]' : 'border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.3)]'}
              `}>
                <Crown className={`w-8 lg:w-12 h-8 lg:h-12 ${s.type === 'black' ? 'text-luxury-gold' : 'text-red-500'}`} />
                {s.type === 'black' && <div className="absolute inset-0 rounded-full border-4 border-luxury-gold/60 animate-[pulse_2s_infinite]"></div>}
              </div>
              
              <div className="space-y-2 lg:space-y-4 relative z-10">
                <h3 className="text-sm lg:text-lg font-serif font-black text-white">{s.name}</h3>
                <div className={`h-px w-12 mx-auto ${s.type === 'black' ? 'bg-luxury-gold/30' : 'bg-red-500/30'}`}></div>
                <p className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] ${s.type === 'black' ? 'text-luxury-gold' : 'text-red-400'}`}>{s.role}</p>
              </div>

              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-2 lg:p-4 flex justify-between items-center group-hover:bg-white/5 transition-colors relative z-10">
                <p className="text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-widest">{s.country || '-'}</p>
                <p className="text-sm lg:text-base font-mono font-black text-white">{s.vol || '0 Vol'}</p>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Re-positioned Sub-Nav: below honor cards, above tab content */}
      <div className="flex flex-col items-center space-y-12">
        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 p-2 bg-black/60 rounded-2xl border border-white/10 w-fit backdrop-blur-xl shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RewardsTab)}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-luxury-gold text-black shadow-[0_10px_30px_rgba(234,179,8,0.4)] scale-105' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Render */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {activeTab === 'honor' ? (
              <HonorTab leaders={rewardsData?.vanguardLeaders || []} />
            ) : !hasSetPassword ? (
              <TradingPasswordRequiredPrompt onSetView={onSetView} />
            ) : isVerified ? (
              <>
                {activeTab === 'team' && <TeamTab teamMembers={rewardsData?.teamMembers || []} summary={rewardsData?.summary} />}
                {activeTab === 'tree' && <TreeTab teamMembers={rewardsData?.teamMembers || []} summary={rewardsData?.summary} />}
                {activeTab === 'ranks' && <RanksTab user={user} summary={rewardsData?.summary} />}
              </>
            ) : (
              <TradingPasswordGate onVerify={(password) => onVerifyTradingPassword ? onVerifyTradingPassword(password) : Promise.resolve(false)} onSuccess={() => setIsVerified(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-Tab Components ---

const HonorTab = ({ leaders }: { leaders: any[] }) => {
  return (
    <div className="space-y-24 w-full">
      <div className="p-8 lg:p-16 rounded-2xl border-2 border-luxury-gold/30 space-y-16 shadow-[0_30px_70px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(165deg, rgba(160, 20, 20, 0.5) 0%, rgba(80, 10, 10, 0.7) 50%, rgba(30, 5, 5, 0.9) 100%)', backdropFilter: 'blur(30px)' }}>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">Extended Leadership</p>
          <h2 className="text-4xl lg:text-6xl font-serif font-black text-white">Imperial Vanguard</h2>
        </div>

        {leaders.length === 0 ? (
          <EmptyRewardsState title="No vanguard records yet" description="Extended leadership records will appear here when published by the platform." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-8">
          {leaders.map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-luxury-gold/30 flex items-center justify-center group-hover:border-luxury-gold transition-colors shadow-[0_5px_20px_rgba(239,68,68,0.2)]">
                <Flame className="text-red-500 group-hover:text-luxury-gold transition-colors" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white tracking-widest">{v.name || v.nickname}</p>
                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{v.rank}</p>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-6 opacity-60">
        <div className="h-px w-24 bg-luxury-gold/50 mx-auto"></div>
        <p className="text-lg font-serif text-gray-400 leading-relaxed">
          "Honor is not given, it is architected. These leaders represent the pinnacle of strategic wealth synthesis within the Longrise ecosystem."
        </p>
        <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.6em]">The Council of Sovereigns</p>
      </div>
    </div>
  );
};

const TeamTab = ({ teamMembers, summary }: { teamMembers: any[]; summary?: any }) => {
  const referrals = teamMembers.map((member, index) => ({
    id: String(index + 1).padStart(2, '0'),
    user: member.nickname,
    rank: member.rank,
    pkg: member.package || '-',
    amount: `${Number(member.balanceUSDT || 0).toLocaleString()} USDT`,
    date: member.joinedAt ? member.joinedAt.slice(0, 10) : '-',
    status: 'ACTIVE',
  }));

  return (
    <div className="glass-panel p-6 lg:p-16 rounded-2xl border border-white/10 space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Organization Volume</h2>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">Direct Referral Network</p>
        </div>
        
        <div className="bg-black/40 border border-luxury-gold/30 p-6 lg:p-8 rounded-2xl flex items-center gap-6 lg:gap-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div className="flex -space-x-3 lg:-space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-black bg-luxury-gold/20 flex items-center justify-center text-[10px] font-black">{i}</div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Volume</p>
            <p className="text-2xl lg:text-3xl font-mono font-black text-luxury-gold">{Number(summary?.teamVolume || 0).toLocaleString()} <span className="text-xs">USDT</span></p>
          </div>
        </div>
      </div>

      {referrals.length === 0 ? (
        <EmptyRewardsState title="No direct referrals yet" description="Direct referral records will appear here after members join under your account." />
      ) : (
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 min-w-[800px]">
          <thead>
            <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-8">
              <th className="pb-4 pl-10 w-24">No</th>
              <th className="pb-4">User ID / Package</th>
              <th className="pb-4">Investment</th>
              <th className="pb-4">Reg Date</th>
              <th className="pb-4 text-right pr-10">Status</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={i} className="group cursor-pointer">
                <td className="bg-white/[0.03] border-l border-y border-white/5 py-4 pl-10 rounded-l-[2rem] group-hover:bg-luxury-gold/5 transition-colors">
                  <span className="text-xs font-mono font-black text-gray-700">{r.id}</span>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{r.user}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{r.rank} <span className="mx-1 opacity-30">•</span> {r.pkg}</p>
                    </div>
                  </div>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <p className="text-2xl font-mono font-black text-white">{r.amount}</p>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <p className="text-xs font-mono font-bold text-gray-500">{r.date}</p>
                </td>
                <td className="bg-white/[0.03] border-r border-y border-white/5 py-4 pr-10 rounded-r-[2rem] text-right group-hover:bg-luxury-gold/5 transition-colors">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 text-green-500 text-[9px] font-black uppercase tracking-widest bg-green-500/5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <div className="text-center pt-8">
        <p className="text-[10px] text-gray-600 font-black tracking-[0.4em] uppercase">Showing Live Direct Referral Records</p>
      </div>
    </div>
  );
};

const TreeTab = ({ teamMembers, summary }: { teamMembers: any[]; summary?: any }) => {
  const nodes = teamMembers.map((member, index) => ({
    name: member.nickname,
    rank: member.rank,
    lv: String(index + 1),
    vol: `${Number(member.balanceUSDT || 0).toLocaleString()} USDT`,
    subs: '0',
    color: member.rank === 'Black Dragon'
      ? 'border-luxury-gold shadow-luxury-gold/20'
      : member.rank === 'Red Dragon'
        ? 'border-red-500 shadow-red-500/10'
        : member.rank === 'Purple Dragon'
          ? 'border-purple-500 shadow-purple-500/10'
          : 'border-blue-500 shadow-blue-500/10',
  }));

  return (
    <div className="glass-panel p-6 lg:p-16 rounded-2xl border border-white/10 space-y-12 h-[800px] lg:h-[1200px] relative overflow-hidden flex flex-col items-center overflow-y-auto custom-scrollbar">
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Organization Structure</h2>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">Interactive Unilevel Terminal</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-6 shadow-xl">
             <div className="flex items-center gap-2">
               <Users size={18} className="text-luxury-gold" />
               <div className="text-right">
                 <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Total Org</p>
                 <p className="text-lg font-mono font-black text-white">{Number(summary?.teamSize || 0).toLocaleString()}</p>
               </div>
             </div>
             <div className="w-px h-6 bg-white/10"></div>
             <div className="flex items-center gap-2">
               <Network size={18} className="text-luxury-gold" />
               <div className="text-right">
                 <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Max Depth</p>
                 <p className="text-lg font-mono font-black text-white">{nodes.length ? '1 LV' : '0 LV'}</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute top-40 right-4 lg:right-10 z-20 flex flex-col gap-3">
        <div className="bg-black/60 border border-luxury-gold/40 px-4 lg:px-6 py-2 rounded-full text-[8px] lg:text-[10px] font-black text-luxury-gold tracking-widest uppercase">Zoom: 100%</div>
        <div className="flex flex-col bg-black/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <button className="p-3 lg:p-4 hover:bg-white/10 text-white"><Plus size={16} /></button>
          <button className="p-3 lg:p-4 hover:bg-white/10 text-white border-t border-white/10"><Minus size={16} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-8 lg:mt-12 bg-black/40 px-6 lg:px-10 py-4 lg:py-5 rounded-full border border-white/10 relative z-10">
        {[
          { label: 'BLACK DRAGON', color: 'bg-luxury-gold' },
          { label: 'RED DRAGON', color: 'bg-red-500' },
          { label: 'PURPLE DRAGON', color: 'bg-purple-500' },
          { label: 'BLUE DRAGON', color: 'bg-blue-500' },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${l.color} shadow-lg shadow-${l.color}/50`}></div>
            <span className="text-[8px] lg:text-[9px] font-black text-gray-400 tracking-widest uppercase">{l.label}</span>
          </div>
        ))}
      </div>

      {nodes.length === 0 ? (
        <div className="mt-16 w-full">
          <EmptyRewardsState title="No organization tree yet" description="Your organization tree will appear after referral relationships exist in the database." />
        </div>
      ) : (
        <div className="relative mt-24 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {nodes.map((node) => <Node key={`${node.name}-${node.lv}`} {...node} />)}
        </div>
      )}
    </div>
  );
};

const Node = ({ name, rank, lv, vol, subs, color }: any) => (
  <div className={`w-56 lg:w-64 bg-black/60 border-2 ${color} rounded-2xl p-5 lg:p-6 text-center space-y-4 lg:space-y-6 shadow-2xl relative group hover:scale-105 transition-all duration-500`}>
    <div className="absolute top-2 right-4 text-[8px] font-black tracking-widest text-gray-600 uppercase">LV.{lv}</div>
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase border border-inherit text-inherit bg-black`}>
       {rank}
    </div>
    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mt-2 lg:mt-4 group-hover:scale-110 transition-transform">
      {rank === 'Black Dragon' ? <Crown className="text-luxury-gold" size={20} /> : <Users className="text-gray-500" size={20} />}
    </div>
    <div>
      <h4 className="text-lg lg:text-xl font-serif font-black text-white">{name}</h4>
      <div className="mt-1 flex items-center justify-center gap-2">
        <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
        <span className="text-[8px] lg:text-[9px] font-black text-green-500 uppercase tracking-widest">Active Agent</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white/5 rounded-xl p-2 lg:p-3 border border-white/5">
        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Volume</p>
        <p className="text-[9px] lg:text-xs font-mono font-black text-luxury-gold">{vol}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-2 lg:p-3 border border-white/5">
        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Direct Subs</p>
        <p className="text-[14px] lg:text-lg font-mono font-black text-white">{subs}</p>
      </div>
    </div>
    <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 text-gray-700">
      <div className="w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center">
        <ChevronRight size={14} className="rotate-90" />
      </div>
    </div>
  </div>
);

const RanksTab = ({ user, summary }: { user: any; summary?: any }) => {
  const currentRank = {
    name: summary?.rank || user.rank || 'Investor',
    level: 'CURRENT ACCOUNT RANK',
    activeSince: user.joinDate || user.createdAt || '-',
    val: `${Number(summary?.bodyValue || user.bodyValue || 0).toLocaleString()} USDT`,
    sales: `${Number(summary?.teamVolume || user.teamVolume || 0).toLocaleString()} USDT`,
  };
  
  const targets = [
    { label: 'BODY VALUE (PERSONAL)', value: Number(summary?.bodyValue || user.bodyValue || 0), color: 'bg-white' },
    { label: 'TEAM SIZE', value: Number(summary?.teamSize || user.teamSize || 0), color: 'bg-blue-400' },
    { label: 'TEAM SALES VOL', value: Number(summary?.teamVolume || user.teamVolume || 0), color: 'bg-luxury-gold' },
    { label: 'TOTAL COMMISSION', value: Number(summary?.totalCommission || user.totalCommission || 0), color: 'bg-purple-500' },
  ];

  const rankCards = [
    { id: 'blue', name: 'BLUE DRAGON', qual: 'Body $500 / Team $3k • 3x Lower Rank Subs', benefit: '3-TIER ROLLUP', active: true },
    { id: 'purple', name: 'PURPLE DRAGON', qual: 'Body $1k / Team $10k • 3x Lower Rank Subs', benefit: '7-TIER ROLLUP', active: false },
    { id: 'red', name: 'RED DRAGON', qual: 'Body $5k / Team $100k • 3x Lower Rank Subs', benefit: '15-TIER + 1% POOL', active: false },
    { id: 'black', name: 'BLACK DRAGON', qual: 'Body $10k / Team $1M • 3x Lower Rank Subs', benefit: '25-TIER + 1% POOL', active: false },
  ];

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 lg:p-16 rounded-2xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-5">
           <Crown size={200} className="text-luxury-gold" />
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-2 border-white/10 flex items-center justify-center bg-black/40 shadow-2xl">
                <Users size={48} className="text-white/40" />
              </div>
              <div className="absolute -bottom-2 lg:-bottom-4 left-1/2 -translate-x-1/2 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-white text-black text-[7px] lg:text-[8px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap">
                 BASIC MEMBER
              </div>
            </div>
            <div className="space-y-2 lg:space-y-4">
              <p className="text-[8px] lg:text-[10px] text-luxury-gold font-black uppercase tracking-[0.4em]">Current Identity Status</p>
              <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">{currentRank.name}</h1>
              <p className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-widest">{currentRank.level} — ACTIVE SINCE {currentRank.activeSince}</p>
            </div>
          </div>

          <div className="flex gap-3 lg:gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 text-center min-w-[120px] lg:min-w-[140px] shadow-2xl">
               <p className="text-[7px] lg:text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2 lg:mb-3">Body Value</p>
               <p className="text-2xl lg:text-3xl font-mono font-black text-white">{currentRank.val}</p>
             </div>
             <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 lg:p-8 text-center min-w-[120px] lg:min-w-[140px] shadow-2xl">
               <p className="text-[7px] lg:text-[8px] text-luxury-gold font-black uppercase tracking-widest mb-2 lg:mb-3">Team Sales</p>
               <p className="text-2xl lg:text-3xl font-mono font-black text-luxury-gold">{currentRank.sales}</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel p-8 lg:p-16 rounded-2xl border border-white/5 space-y-12 lg:space-y-16">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Target Achievement</h2>
            <p className="text-[8px] lg:text-[10px] text-luxury-gold font-black tracking-[0.4em] uppercase">Live account metrics from database</p>
          </div>
          <div className="flex items-center gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-[8px] lg:text-[10px] font-black tracking-widest uppercase">
            <Flame size={16} /> Live Metrics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {targets.map((t, i) => (
            <div key={i} className="space-y-4 lg:space-y-6">
              <div className="flex justify-between items-center text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center">
                <span>{t.label}</span>
                <span className="text-white">{Number(t.value).toLocaleString()}</span>
              </div>
              <div className="h-1.5 lg:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: t.value > 0 ? '100%' : '0%' }}
                  className={`h-full ${t.color} rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                </motion.div>
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[8px] lg:text-[9px] font-mono font-black text-gray-700">CURRENT</p>
                <p className="text-[8px] lg:text-[9px] font-black text-luxury-gold uppercase tracking-widest"><span className="text-white">{Number(t.value).toLocaleString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {rankCards.map((r, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className={`glass-panel p-6 lg:p-10 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-4 lg:gap-8 group cursor-pointer ${r.active ? 'opacity-100' : 'opacity-20 grayscale'}`}
          >
            <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full border-2 border-white/10 flex items-center justify-center p-3 lg:p-5 bg-black/40 group-hover:scale-110 transition-transform">
              {r.id === 'blue' && <Shield size={24} className="text-blue-400" />}
              {r.id === 'purple' && <Sparkles size={24} className="text-purple-400" />}
              {r.id === 'red' && <Flame size={24} className="text-red-500" />}
              {r.id === 'black' && <Crown size={24} className="text-luxury-gold" />}
            </div>
            
            <div className="space-y-2 lg:space-y-4">
              <h4 className="text-sm lg:text-2xl font-serif font-black text-white">{r.name}</h4>
              <div className="space-y-1">
                <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Qualification</p>
                <p className="text-[8px] lg:text-[10px] text-gray-400 leading-relaxed font-black">{r.qual}</p>
              </div>
            </div>

            <div className="w-full pt-4 lg:pt-6 border-t border-white/10 mt-auto">
              <p className="text-[7px] text-luxury-gold font-bold uppercase tracking-widest mb-1">Elite Benefit</p>
              <p className="text-[10px] lg:text-sm font-serif font-black gold-gradient-text">{r.benefit}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

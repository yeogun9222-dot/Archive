import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Users, 
  Network, 
  Target, 
  UserPlus, 
  Flame, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
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
  Copy,
  PlusCircle,
  MinusCircle,
  FileText,
  Zap,
  Gem,
  Shield,
  ShieldCheck,
  Award,
  Send,
  Lock,
  Unlock,
  Key,
  AlertTriangle
} from 'lucide-react';

type RewardsTab = 'honor' | 'team' | 'tree' | 'ranks' | 'invite';

// --- Trading Password Gate Component ---
const TradingPasswordGate = ({ tradingPassword, onSuccess }: { tradingPassword: string, onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === tradingPassword) {
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
           To view organizational data and team details, you must first configure your <span className="text-white">Trading Password</span> (8+ alphanumeric) in your profile.
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

export const RewardsPage = ({ user, onUpdateUser, onSetView }: { user: any, onUpdateUser: (u: any) => void, onSetView: (v: any) => void }) => {
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
    { id: 'invite', label: 'INVITE', icon: UserPlus },
  ];

  const sovereignHall = [
    { country: 'UAE', name: 'Sovereign_Alpha', role: 'Red Dragon Sovereign', type: 'red', vol: '9.2M Vol' },
    { country: 'SOUTH KOREA', name: 'Golden_Dragon_One', role: 'Black Dragon Sovereign', type: 'black', active: true, vol: '12.5M Vol' },
    { country: 'SWITZERLAND', name: 'Imperial_Z', role: 'Red Dragon Sovereign', type: 'red', vol: '8.8M Vol' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-20 min-h-screen">
      {/* Top 3 Honor Cards (Always visible at the top of Rewards) */}
      <div className="space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">The Highest Achievement</p>
          <h2 className="text-5xl lg:text-8xl font-serif font-black text-white">The Sovereign Hall</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 items-center">
          {sovereignHall.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-10 rounded-2xl border-2 flex flex-col items-center text-center space-y-8 relative overflow-hidden group transition-all duration-700
                ${s.type === 'black' 
                  ? 'scale-105 lg:scale-110 z-10 bg-gradient-to-br from-[#1a0505] to-[#000] border-luxury-gold shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_40px_rgba(234,179,8,0.2)]' 
                  : 'scale-95 bg-gradient-to-br from-[#4a0808]/80 to-[#2d0505]/95 border-luxury-gold/30 shadow-[0_0_50px_rgba(220,38,38,0.25)] hover:shadow-[0_0_70px_rgba(234,179,8,0.3)] hover:border-luxury-gold/60'}
              `}
            >
              {/* Type-specific glow backgrounds */}
              {s.type === 'black' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)] animate-pulse" />
              )}

              <div className={`w-28 h-28 rounded-full bg-black/60 border-2 flex items-center justify-center p-4 relative group-hover:scale-110 transition-transform 
                ${s.type === 'black' ? 'border-luxury-gold shadow-[0_0_40px_rgba(234,179,8,0.4)]' : 'border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.3)]'}
              `}>
                <Crown className={s.type === 'black' ? 'text-luxury-gold' : 'text-red-500'} size={48} />
                {s.type === 'black' && <div className="absolute inset-0 rounded-full border-4 border-luxury-gold/60 animate-[pulse_2s_infinite]"></div>}
              </div>
              
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl lg:text-3xl font-serif font-black text-white">{s.name}</h3>
                <div className={`h-px w-12 mx-auto ${s.type === 'black' ? 'bg-luxury-gold/30' : 'bg-red-500/30'}`}></div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.type === 'black' ? 'text-luxury-gold' : 'text-red-400'}`}>{s.role}</p>
              </div>

              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 flex justify-between items-center group-hover:bg-white/5 transition-colors relative z-10">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{s.country}</p>
                <p className="text-lg font-mono font-black text-white">{s.vol}</p>
              </div>
            </motion.div>
          ))}
        </div>
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
              <HonorTab />
            ) : !hasSetPassword ? (
              <TradingPasswordRequiredPrompt onSetView={onSetView} />
            ) : isVerified ? (
              <>
                {activeTab === 'team' && <TeamTab />}
                {activeTab === 'tree' && <TreeTab />}
                {activeTab === 'ranks' && <RanksTab />}
                {activeTab === 'invite' && <InviteTab />}
              </>
            ) : (
              <TradingPasswordGate tradingPassword={user.tradingPassword} onSuccess={() => setIsVerified(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-Tab Components ---

const HonorTab = () => {
  const vanguard = [
    { name: 'PHOENIX_V7', rank: 'RED DRAGON' }, { name: 'RED_STORM', rank: 'RED DRAGON' }, 
    { name: 'DRAGON_HEART', rank: 'RED DRAGON' }, { name: 'VANGUARD_88', rank: 'RED DRAGON' },
    { name: 'SOLAR_FLARE', rank: 'RED DRAGON' }, { name: 'CRIMSON_LORD', rank: 'RED DRAGON' },
    { name: 'MARS_ALPHA', rank: 'RED DRAGON' }, { name: 'TITAN_SHIELD', rank: 'RED DRAGON' },
    { name: 'IRON_WILL', rank: 'RED DRAGON' }, { name: 'ETERNAL_FLAME', rank: 'RED DRAGON' },
    { name: 'RED_NEXUS', rank: 'RED DRAGON' }, { name: 'PRIME_LEADER', rank: 'RED DRAGON' },
  ];

  return (
    <div className="space-y-24 w-full">
      <div className="p-8 lg:p-16 rounded-2xl border-2 border-luxury-gold/30 space-y-16 shadow-[0_30px_70px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(165deg, rgba(160, 20, 20, 0.5) 0%, rgba(80, 10, 10, 0.7) 50%, rgba(30, 5, 5, 0.9) 100%)', backdropFilter: 'blur(30px)' }}>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">Extended Leadership</p>
          <h2 className="text-4xl lg:text-6xl font-serif font-black text-white">Imperial Vanguard</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-8">
          {vanguard.map((v, i) => (
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
                <p className="text-[10px] font-black text-white tracking-widest">{v.name}</p>
                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{v.rank}</p>
              </div>
            </motion.div>
          ))}
        </div>
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

const TeamTab = () => {
  const referrals = [
    { id: '01', user: 'Dragon_Master', rank: 'BLACK DRAGON', pkg: 'VIP PACKAGE', amount: '$15,000', date: '2026-04-18', status: 'ACTIVE' },
    { id: '02', user: 'Golden_Tiger88', rank: 'RED DRAGON', pkg: 'PREMIUM PACK', amount: '$8,000', date: '2026-04-17', status: 'ACTIVE' },
    { id: '03', user: 'Phoenix_Alpha', rank: 'BLUE DRAGON', pkg: 'VIP PACKAGE', amount: '$12,000', date: '2026-04-15', status: 'ACTIVE' },
    { id: '04', user: 'Crypto_King', rank: 'WHITE DRAGON', pkg: 'STANDARD PACK', amount: '$3,000', date: '2026-04-12', status: 'ACTIVE' },
    { id: '05', user: 'Lion_Wealth', rank: 'WHITE DRAGON', pkg: 'BASIC PACK', amount: '$1,000', date: '2026-04-10', status: 'ACTIVE' },
    { id: '06', user: 'Rich_Panda', rank: 'PURPLE DRAGON', pkg: 'PREMIUM PACK', amount: '$5,000', date: '2026-04-08', status: 'ACTIVE' },
    { id: '07', user: 'Elite_Falcon', rank: 'RED DRAGON', pkg: 'VIP PACKAGE', amount: '$10,000', date: '2026-04-05', status: 'ACTIVE' },
    { id: '08', user: 'Noble_Dragon', rank: 'BLACK DRAGON', pkg: 'VIP PACKAGE', amount: '$15,000', date: '2026-04-03', status: 'ACTIVE' },
    { id: '09', user: 'Alpha_Trader', rank: 'BLUE DRAGON', pkg: 'STANDARD PACK', amount: '$2,500', date: '2026-04-01', status: 'ACTIVE' },
    { id: '10', user: 'Ace_Direct', rank: 'WHITE DRAGON', pkg: 'BASIC PACK', amount: '$500', date: '2026-03-28', status: 'ACTIVE' },
  ];

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
            <p className="text-2xl lg:text-3xl font-mono font-black text-luxury-gold">42,500 <span className="text-xs">USDT</span></p>
          </div>
        </div>
      </div>

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

      <div className="text-center pt-8">
        <p className="text-[10px] text-gray-600 font-black tracking-[0.4em] uppercase">Showing Top 10 Recent Direct Referrals</p>
      </div>
    </div>
  );
};

const TreeTab = () => {
  const nodes = [
    { name: 'GoldenDragon', rank: 'Black Dragon', lv: '0', vol: '$125,400', subs: '15', active: true, color: 'border-luxury-gold shadow-luxury-gold/20' },
    { name: 'Phoenix_Leader', rank: 'Red Dragon', lv: '1', vol: '$45,000', subs: '12', active: true, color: 'border-red-500 shadow-red-500/10' },
    { name: 'Golden_Tiger', rank: 'Purple Dragon', lv: '1', vol: '$32,000', subs: '8', active: true, color: 'border-purple-500 shadow-purple-500/10' },
    { name: 'Fire_Bird', rank: 'Purple Dragon', lv: '2', vol: '$12,500', subs: '5', active: true, color: 'border-purple-500 shadow-purple-500/10' },
    { name: 'Mystic_Rider', rank: 'Blue Dragon', lv: '2', vol: '$8,400', subs: '3', active: true, color: 'border-blue-500 shadow-blue-500/10' },
    { name: 'Solar_Flare', rank: 'Blue Dragon', lv: '2', vol: '$5,600', subs: '4', active: true, color: 'border-blue-500 shadow-blue-500/10' },
  ];

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
                 <p className="text-lg font-mono font-black text-white">15,420</p>
               </div>
             </div>
             <div className="w-px h-6 bg-white/10"></div>
             <div className="flex items-center gap-2">
               <Network size={18} className="text-luxury-gold" />
               <div className="text-right">
                 <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Max Depth</p>
                 <p className="text-lg font-mono font-black text-white">25 LV</p>
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

      {/* Tree Visualization */}
      <div className="relative mt-24 scale-75 lg:scale-100 origin-top">
        {/* Level 0 */}
        <div className="flex justify-center mb-32 lg:mb-40 relative">
          <Node {...nodes[0]} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[400px] lg:w-[600px] h-16 lg:h-20 border-x-2 border-b-2 border-white/10"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 lg:h-20 bg-white/10"></div>
        </div>

        {/* Level 1 */}
        <div className="flex justify-center gap-[200px] lg:gap-[400px] mb-32 lg:mb-40 relative">
          <div className="relative">
            <Node {...nodes[1]} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[200px] lg:w-[300px] h-16 lg:h-20 border-x-2 border-b-2 border-white/10"></div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 lg:h-20 bg-white/10"></div>
          </div>
          <div className="relative">
             <Node {...nodes[2]} />
             <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 lg:h-20 bg-white/10"></div>
          </div>
        </div>

        {/* Level 2 */}
        <div className="flex justify-center gap-10 lg:gap-20">
          <Node {...nodes[3]} />
          <Node {...nodes[4]} />
          <div className="w-[50px] lg:w-[100px]"></div> {/* Spacing */}
          <Node {...nodes[5]} />
        </div>
      </div>
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

const RanksTab = () => {
  const currentRank = { name: 'White Dragon', level: 'ENTRY LEVEL RANK', activeSince: '2026.04.10', val: '$200', sales: '$500' };
  
  const targets = [
    { label: 'BODY VALUE (PERSONAL)', progress: 48, now: '$200', gap: '$300', color: 'bg-white' },
    { label: 'DIRECT REFERRALS', progress: 33, now: '1', gap: '2', color: 'bg-blue-400' },
    { label: 'SUB-RANK (WHITE)', progress: 33, now: '1', gap: '2', color: 'bg-purple-500' },
    { label: 'TEAM SALES VOL', progress: 17, now: '$500', gap: '$2,500', color: 'bg-luxury-gold' },
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
            <p className="text-[8px] lg:text-[10px] text-luxury-gold font-black tracking-[0.4em] uppercase">Conditions to reach "Blue Dragon" Rank</p>
          </div>
          <div className="flex items-center gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-[8px] lg:text-[10px] font-black tracking-widest uppercase">
            <Flame size={16} className="animate-pulse" /> Boost Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {targets.map((t, i) => (
            <div key={i} className="space-y-4 lg:space-y-6">
              <div className="flex justify-between items-center text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center">
                <span>{t.label}</span>
                <span className="text-white">{t.progress}%</span>
              </div>
              <div className="h-1.5 lg:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${t.progress}%` }}
                  className={`h-full ${t.color} rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                </motion.div>
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[8px] lg:text-[9px] font-mono font-black text-gray-700">NOW: {t.now}</p>
                <p className="text-[8px] lg:text-[9px] font-black text-luxury-gold uppercase tracking-widest">GAP: <span className="text-white">{t.gap}</span></p>
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

const InviteTab = () => {
  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 lg:p-20 rounded-2xl border border-luxury-gold/20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-10">
           <Zap size={200} className="text-luxury-gold" />
        </div>
        
        <div className="shrink-0 space-y-4 lg:space-y-6 text-center z-10">
          <div className="w-40 h-40 lg:w-56 lg:h-56 bg-white p-4 lg:p-6 rounded-2xl shadow-[0_30px_70px_rgba(255,255,255,0.1)] relative group">
             <div className="absolute inset-0 border-4 lg:border-8 border-luxury-gold/10 rounded-2xl animate-pulse"></div>
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=longrise.ai/join?ref=GD88" alt="QR" className="w-full h-full object-contain relative z-10 shadow-inner" />
          </div>
          <div className="space-y-1">
            <p className="text-[8px] lg:text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Your Elite ID</p>
            <p className="text-lg lg:text-xl text-white font-serif font-black tracking-widest">GD88-2026</p>
          </div>
        </div>

        <div className="hidden lg:block h-64 w-px bg-gradient-to-b from-transparent via-luxury-gold/50 to-transparent relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
             {[...Array(12)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-black border border-white/20"></div>)}
          </div>
        </div>

        <div className="flex-1 space-y-8 lg:space-y-10 relative z-10 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-[8px] lg:text-[9px] font-black uppercase tracking-widest">Partner Program</span>
              <span className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-[8px] lg:text-[9px] font-black uppercase tracking-widest">7.0% Instant Commission</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-serif font-black text-white leading-tight">The Golden Ticket</h1>
            <p className="text-gray-400 text-sm lg:text-lg leading-relaxed font-light max-w-xl">Invite partners and earn up to <span className="text-white font-bold">7.0% instant commission</span> on every successful allocation.</p>
          </div>

          <div className="space-y-3">
             <p className="text-[8px] lg:text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase ml-1">Referral Link</p>
             <div className="flex flex-col sm:flex-row bg-black/60 border border-white/10 p-2 rounded-2xl lg:rounded-2.5xl overflow-hidden shadow-2xl gap-2">
               <input disabled type="text" value="longrise.ai/join?ref=GD88" className="bg-transparent flex-1 px-4 py-3 lg:px-5 font-mono text-sm text-gray-500 outline-none" />
               <button className="bg-luxury-gold text-black px-6 lg:px-10 py-3 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[10px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2">
                 <Copy size={16} /> COPY LINK
               </button>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-8 lg:space-y-10">
           <div className="flex items-center gap-4 text-luxury-gold">
             <Target size={24} />
             <h3 className="text-lg lg:text-xl font-serif font-black uppercase tracking-[0.2em]">Growth Analytics</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="p-6 lg:p-10 bg-white/5 rounded-2xl border border-white/5 space-y-3 lg:space-y-4 text-center">
                <p className="text-[8px] lg:text-[10px] text-gray-500 font-black tracking-widest uppercase">Total Clicks</p>
                <div className="space-y-1">
                  <p className="text-4xl lg:text-5xl font-mono font-black text-white leading-none">1,254</p>
                  <p className="text-[9px] lg:text-[10px] text-green-400 font-black">+12% from yesterday</p>
                </div>
              </div>
              <div className="p-6 lg:p-10 bg-white/5 rounded-2xl border border-white/5 space-y-3 lg:space-y-4 text-center">
                <p className="text-[8px] lg:text-[10px] text-gray-500 font-black tracking-widest uppercase">New Agents</p>
                <div className="space-y-1">
                  <p className="text-4xl lg:text-5xl font-mono font-black text-luxury-gold leading-none">42</p>
                  <p className="text-[8px] lg:text-[10px] text-gray-600 font-black uppercase">Pending verification: 5</p>
                </div>
              </div>
           </div>
        </div>

        <div className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-8 lg:space-y-10">
           <div className="flex items-center gap-4 text-luxury-gold">
             <Zap size={24} />
             <h3 className="text-lg lg:text-xl font-serif font-black uppercase tracking-[0.2em]">Instant Social Blast</h3>
           </div>
           <div className="grid grid-cols-4 gap-2 lg:gap-4 pb-4">
              {[
                { icon: Send, label: 'TELEGRAM' },
                { icon: Users, label: 'WHATSAPP' },
                { icon: Share2, label: 'FACEBOOK' },
                { icon: Globe, label: 'TWITTER' },
              ].map((s, i) => (
                <button key={i} className="aspect-square bg-white/5 rounded-2xl lg:rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 lg:gap-4 hover:border-luxury-gold/50 transition-all group overflow-hidden">
                   <s.icon size={20} className="text-luxury-gold group-hover:scale-125 transition-transform" />
                   <span className="text-[7px] lg:text-[8px] font-black text-gray-500 group-hover:text-white tracking-widest uppercase scale-75 sm:scale-100">{s.label}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

    </div>
  );
};

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Lock, 
  Gem, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCcw, 
  ChevronRight, 
  Filter,
  Zap,
  Users,
  Network,
  Crown,
  BarChart3,
  AlertCircle,
  X,
  UserCheck
} from 'lucide-react';

export const WalletPage = ({ user, onSetView }: { user: any, onSetView: (v: any) => void }) => {
  const [payAmount, setPayAmount] = useState('0.00');
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);

  const handleWithdrawClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
    } else {
      alert('Withdrawal interface would open here.');
    }
  };

  const assets = [
    { label: 'AVAILABLE USDT', value: '142,500.5', unit: 'USDT', icon: Wallet, tag: 'LIQUID', color: 'from-luxury-red-light' },
    { label: 'LOCKED USDT', value: '50,000', unit: 'USDT', icon: Lock, tag: 'STAKED', color: 'from-[#3d0a0a]' },
    { label: 'CNYT TOKENS', value: '85,000', unit: 'USDT', icon: Gem, tag: 'REWARDS', color: 'from-[#2a0505]' },
  ];

  const activities = [
    { label: 'AI Performance Bonus', date: 'Mar 23, 2026 09:12', value: '+125.40', type: 'PERFORMANCE', icon: Zap, iconColor: 'text-green-500' },
    { label: 'Direct Referral Bonus', date: 'Mar 22, 2026 23:10', value: '+50.00', type: 'DIRECT', icon: Users, iconColor: 'text-luxury-gold' },
    { label: 'Matching Commission', date: 'Mar 22, 2026 09:00', value: '+45.20', type: 'MATCHING', icon: Network, iconColor: 'text-luxury-gold' },
    { label: 'Global Pool Distribution', date: 'Mar 21, 2026 14:45', value: '+1,200.00', type: 'GLOBAL POOL', icon: Crown, iconColor: 'text-luxury-gold' },
    { label: 'Team Sales Bonus', date: 'Mar 20, 2026 11:28', value: '+250.00', type: 'TEAM', icon: BarChart3, iconColor: 'text-luxury-gold' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <p className="text-luxury-gold text-[10px] font-black tracking-[0.6em] uppercase">Portfolio</p>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">My Wealth</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-1"
        >
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase">Total Assets</p>
          <p className="text-4xl lg:text-6xl font-mono font-black text-luxury-gold tracking-tighter">$277,500.5</p>
        </motion.div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {assets.map((asset, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-10 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-luxury-gold/30 transition-all shadow-2xl`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${asset.color} to-transparent opacity-30`}></div>
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                  <asset.icon size={28} />
                </div>
                <span className="px-5 py-2 rounded-full bg-black/60 border border-white/10 text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 group-hover:text-luxury-gold transition-colors">
                  {asset.tag}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">{asset.label}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl lg:text-5xl font-mono font-black text-white tracking-tighter">{asset.value}</h2>
                  <span className="text-xs font-mono font-black text-luxury-gold">{asset.unit}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Actions & Convert */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileActive={{ scale: 0.98 }}
              className="glass-panel py-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-green-500/5 hover:border-green-500/30 transition-all font-black text-[10px] tracking-widest uppercase text-white shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <ArrowDownCircle size={32} />
              </div>
              DEPOSIT
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileActive={{ scale: 0.98 }}
              onClick={handleWithdrawClick}
              className="glass-panel py-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-red-500/5 hover:border-red-500/30 transition-all font-black text-[10px] tracking-widest uppercase text-white shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <ArrowUpCircle size={32} />
              </div>
              WITHDRAW
            </motion.button>
          </div>

          <motion.button 
             whileHover={{ x: 5 }}
             className="w-full glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-luxury-gold/30 transition-all text-left shadow-xl"
          >
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:rotate-180 transition-transform duration-700">
                  <RefreshCcw size={28} />
                </div>
                <div>
                   <h3 className="text-[11px] font-black text-white tracking-widest uppercase">SWAP REWARDS</h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Convert USDT to CNYT (1:1)</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-gray-700 group-hover:text-luxury-gold group-hover:translate-x-2 transition-all" />
          </motion.button>

          <div className="glass-panel p-10 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-red/10 to-transparent opacity-30"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">Convert to CNYT</h2>
              
              <div className="space-y-6">
                <div className="bg-black/40 border border-white/5 rounded-3xl p-8 space-y-3 relative group/input focus-within:border-luxury-gold/30 transition-all">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-gray-500">
                    <span>PAY USDT</span>
                    <button className="text-luxury-gold hover:text-white transition-colors">MAX</button>
                  </div>
                  <input 
                    type="text" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-transparent text-3xl font-mono font-black text-white focus:outline-none placeholder:text-gray-800" 
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-center -my-9 relative z-10">
                   <div className="w-12 h-12 bg-luxury-gold text-black rounded-full flex items-center justify-center border-4 border-[#120303] shadow-lg group-hover:rotate-180 transition-transform duration-1000">
                      <ArrowDownCircle size={24} />
                   </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-3">
                  <div className="text-[10px] font-black tracking-widest uppercase text-luxury-gold">
                    RECEIVE CNYT (1:1)
                  </div>
                  <p className="text-3xl font-mono font-black text-gray-600">{payAmount === '' ? '0.00' : payAmount}</p>
                </div>
              </div>

              <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest leading-relaxed">* Conversion is permanent and cannot be reversed.</p>
              </div>

              <button className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all">
                CONFIRM CONVERSION
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel h-full p-8 lg:p-12 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
            
            <div className="flex justify-between items-center relative z-10 px-4">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">RECENT ACTIVITY</h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase hover:text-white transition-colors">
                <Filter size={16} /> FILTER
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {activities.map((activity, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                >
                  <div className="flex items-center gap-6 lg:gap-8">
                     <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <activity.icon size={28} className={activity.iconColor} />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{activity.label}</h4>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">{activity.date}</p>
                     </div>
                  </div>
                  <div className="text-right space-y-1">
                     <p className={`text-2xl font-mono font-black ${activity.value.startsWith('+') ? 'text-green-500' : 'text-red-500'} tracking-tighter`}>
                       {activity.value}
                     </p>
                     <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{activity.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-10 flex flex-col items-center gap-6 relative z-10">
               <div className="h-px w-24 bg-white/10"></div>
               <button className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] hover:text-luxury-gold hover:tracking-[0.8em] transition-all">
                 VIEW FULL TRANSACTION LEDGER
               </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isRequirementModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequirementModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-10 rounded-2xl border border-luxury-gold/30 text-center space-y-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mx-auto">
                 <AlertCircle size={32} />
              </div>
              
              <div className="space-y-4">
                 <h2 className="text-2xl font-serif font-black text-white uppercase italic">Security Requirement</h2>
                 <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                   To authorize asset withdrawals and protect your digital footprint, you must configure your <span className="text-luxury-gold">Trading Password</span> (8+ alphanumeric) in your Profile settings.
                 </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                 <button 
                   onClick={() => onSetView('profile')}
                   className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:scale-105 transition-all flex items-center justify-center gap-3"
                 >
                   <UserCheck size={18} /> GO TO PROFILE SETTINGS
                 </button>
                 <button 
                   onClick={() => setIsRequirementModalOpen(false)}
                   className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all"
                 >
                   REMAIN IN WALLET
                 </button>
              </div>
              
              <button 
                onClick={() => setIsRequirementModalOpen(false)}
                className="absolute top-6 right-6 text-gray-600 hover:text-white"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

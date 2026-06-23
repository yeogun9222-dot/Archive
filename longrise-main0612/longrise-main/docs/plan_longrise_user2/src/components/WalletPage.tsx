import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Lock,
  Gem,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Zap,
  Users,
  Network,
  Crown,
  BarChart3,
  AlertCircle,
  X,
  UserCheck,
  Send,
  TrendingUp
} from 'lucide-react';

export const WalletPage = ({ user, onSetView }: { user: any, onSetView: (v: any) => void }) => {
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  const handleWithdrawClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
    } else {
      alert('Withdrawal interface would open here.');
    }
  };

  const assets = [
    { label: 'AVAILABLE USDT', value: '142,500', unit: 'USDT', icon: Wallet, tag: 'LIQUID', color: 'from-luxury-red-light' },
    { label: 'PLATFORM USDT', value: '25,500', unit: 'USDT', icon: TrendingUp, tag: 'INTERNAL', color: 'from-orange-600' },
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

  const usdtTransfers = [
    { user: 'RED_DRAGON_KR', type: 'RECEIVE', amount: '500', date: 'Mar 23, 2026 14:22', status: 'COMPLETED', country: '🇰🇷' },
    { user: 'RED_DRAGON_CN', type: 'SELL', amount: '250', date: 'Mar 22, 2026 10:15', status: 'COMPLETED', country: '🇨🇳' },
    { user: 'RED_DRAGON_VN', type: 'RECEIVE', amount: '1000', date: 'Mar 21, 2026 16:45', status: 'COMPLETED', country: '🇻🇳' },
    { user: 'DRAGON_ASIA', type: 'SELL', amount: '400', date: 'Mar 20, 2026 09:30', status: 'COMPLETED', country: '🇨🇳' },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 to-transparent opacity-10"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">Package History</h2>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { type: 'VIP', investment: 1000, date: '2023-11-20', maturity: '2024-11-20' },
                  { type: 'Premium', investment: 1000, date: '2023-12-15', maturity: '2024-12-15' },
                  { type: 'Standard', investment: 800, date: '2024-01-10', maturity: '2025-01-10' },
                  { type: 'Basic', investment: 500, date: '2024-02-05', maturity: '2025-02-05' },
                  { type: 'Flexible', investment: 200, date: '2024-02-20', maturity: '2024-02-20' }
                ].map((pkg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center text-luxury-gold text-xs font-black">
                        {pkg.type.slice(0, 1)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{pkg.type}</h4>
                        <p className="text-[9px] text-gray-500 font-mono">{pkg.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-black text-luxury-gold">${pkg.investment}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{pkg.maturity}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* USDT Transfer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 shadow-2xl"
          >
            <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">Transfer USDT</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Recipient UID</label>
                <input
                  type="text"
                  placeholder="USER_12345"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Amount (USDT)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsTransferModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-sm tracking-widest rounded-lg transition-all uppercase"
              >
                <Send size={16} className="inline mr-2" />
                Transfer USDT
              </motion.button>
            </div>

            {/* USDT Transfer History */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wide">Recent Transfers</h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {usdtTransfers.slice(0, 3).map((transfer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg flex items-center justify-between transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${transfer.type === 'RECEIVE' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {transfer.type === 'RECEIVE' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{transfer.user}</p>
                        <p className="text-[9px] text-gray-500">{transfer.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-mono font-black ${transfer.type === 'RECEIVE' ? 'text-green-400' : 'text-blue-400'}`}>
                        {transfer.type === 'RECEIVE' ? '+' : '-'}{transfer.amount}
                      </p>
                      <p className="text-[8px] text-gray-500">{transfer.country}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
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

        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsTransferModalOpen(false);
                setTransferAmount('');
                setTransferRecipient('');
              }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-10 rounded-2xl border border-luxury-gold/30 space-y-8"
            >
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-serif font-black text-white uppercase italic">Confirm Transfer</h2>
                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Verify your transfer details before proceeding</p>
              </div>

              <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Recipient</span>
                  <span className="text-sm font-mono font-black text-white">{transferRecipient || '—'}</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Amount</span>
                  <span className="text-sm font-mono font-black text-luxury-gold">{transferAmount || '0'} USDT</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Status</span>
                  <span className="text-sm font-black text-green-400">PENDING</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    alert(`Transfer of ${transferAmount} USDT to ${transferRecipient} initiated. Awaiting confirmation from Red Dragon.`);
                    setIsTransferModalOpen(false);
                    setTransferAmount('');
                    setTransferRecipient('');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-[10px] tracking-widest rounded-lg transition-all uppercase"
                >
                  <Send size={16} className="inline mr-2" />
                  Confirm Transfer
                </motion.button>
                <button
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setTransferAmount('');
                    setTransferRecipient('');
                  }}
                  className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all"
                >
                  CANCEL
                </button>
              </div>

              <button
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferAmount('');
                  setTransferRecipient('');
                }}
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

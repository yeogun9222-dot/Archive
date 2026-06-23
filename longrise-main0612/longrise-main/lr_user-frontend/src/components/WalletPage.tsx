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
  Crown,
  AlertCircle,
  X,
  UserCheck,
  Send,
  Target,
  History,
  CheckCircle2,
  DollarSign,
  Package,
  Calendar,
  ShoppingCart,
  Banknote,
  Layers
} from 'lucide-react';

export const WalletPage = ({
  user,
  onSetView,
  portalData,
  onCreateWithdrawal,
  onCreateTransfer,
  onConvertToCNYT,
}: {
  user: any;
  onSetView: (v: any) => void;
  portalData?: any;
  onCreateWithdrawal?: (payload: { amount: number; wallet_address: string; asset: 'USDT' | 'CNYT'; network: string; trading_password: string; otp_code?: string }) => Promise<void>;
  onCreateTransfer?: (payload: { recipient: string; amount: number; asset: string; trading_password: string }) => Promise<void>;
  onConvertToCNYT?: (amount: number) => Promise<void>;
}) => {
  const [payAmount, setPayAmount] = useState('0.00');
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientWallet, setRecipientWallet] = useState('');
  const [transferPassword, setTransferPassword] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawTradingPassword, setWithdrawTradingPassword] = useState('');
  const [withdrawOtpCode, setWithdrawOtpCode] = useState('');
  const [walletMessage, setWalletMessage] = useState('');
  const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);
  const [showAllPackageHistory, setShowAllPackageHistory] = useState(false);

  const handleWithdrawClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
    } else {
      setIsWithdrawalModalOpen(true);
    }
  };

  const handleTransferClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
    } else {
      setIsTransferModalOpen(true);
    }
  };

  const handleTransferSubmit = async () => {
    try {
      await onCreateTransfer?.({
        recipient: recipientWallet,
        amount: Number(transferAmount),
        asset: 'USDT',
        trading_password: transferPassword,
      });
      setWalletMessage('Transfer completed successfully.');
      setShowTransferConfirmation(true);
      setTimeout(() => {
        setShowTransferConfirmation(false);
        setWalletMessage('');
        setIsTransferModalOpen(false);
        setTransferAmount('');
        setRecipientWallet('');
        setTransferPassword('');
      }, 2000);
    } catch (err: any) {
      setWalletMessage(err?.response?.data?.detail || 'Transfer failed.');
    }
  };

  const handleWithdrawalSubmit = async () => {
    try {
      await onCreateWithdrawal?.({
        amount: Number(withdrawAmount),
        wallet_address: withdrawAddress,
        asset: 'USDT',
        network: 'INTERNAL',
        trading_password: withdrawTradingPassword,
        otp_code: withdrawOtpCode || undefined,
      });
      setWalletMessage('Withdrawal request submitted.');
      setIsWithdrawalModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawTradingPassword('');
      setWithdrawOtpCode('');
    } catch (err: any) {
      setWalletMessage(err?.response?.data?.detail || 'Withdrawal request failed.');
    }
  };

  const handleConvert = async () => {
    try {
      await onConvertToCNYT?.(Number(payAmount));
      setWalletMessage('USDT was converted to CNYT.');
      setPayAmount('0.00');
    } catch (err: any) {
      setWalletMessage(err?.response?.data?.detail || 'Conversion failed.');
    }
  };

  const assets = portalData?.wallet?.assets?.length
    ? portalData.wallet.assets.map((asset: any, index: number) => ({
        label: asset.label,
        value: Number(asset.value).toLocaleString(),
        unit: asset.unit,
        icon: [Wallet, Lock, Gem, Package][index] || Wallet,
        tag: asset.tag,
        color: ['from-luxury-red-light', 'from-[#3d0a0a]', 'from-[#2a0505]', 'from-[#1a0505]'][index] || 'from-[#1a0505]',
      }))
    : [
    { label: 'AVAILABLE USDT', value: '0', unit: 'USDT', icon: Wallet, tag: 'LIQUID', color: 'from-luxury-red-light' },
    { label: 'LOCKED USDT', value: '0', unit: 'USDT', icon: Lock, tag: 'STAKED', color: 'from-[#3d0a0a]' },
    { label: 'CNYT TOKENS', value: '0', unit: 'CNYT', icon: Gem, tag: 'REWARDS', color: 'from-[#2a0505]' },
    { label: 'PACKAGE VALUE', value: '0', unit: 'USDT', icon: Package, tag: 'GROWTH', color: 'from-[#1a0505]' },
  ];

  const packageHistory = portalData?.wallet?.packageHistory?.length
    ? portalData.wallet.packageHistory.map((item: any) => ({
        name: item.name,
        date: item.date?.slice(0, 10) || '',
        amount: Number(item.amount).toLocaleString(),
        status: String(item.status || '').toUpperCase(),
        returns: `+${Number(item.returns || 0).toLocaleString()}`,
        icon: Crown,
      }))
    : [];
  const visiblePackageHistory = showAllPackageHistory ? packageHistory : packageHistory.slice(0, 3);

  const activities = portalData?.wallet?.activities?.length
    ? portalData.wallet.activities.map((item: any) => ({
        label: item.label,
        date: item.date,
        value: `${item.direction === 'credit' ? '+' : '-'}${Number(item.value || item.amount || 0).toLocaleString()}`,
        type: String(item.type || '').toUpperCase(),
        icon: item.direction === 'credit' ? Zap : ArrowUpCircle,
        iconColor: item.direction === 'credit' ? 'text-green-500' : 'text-luxury-gold',
      }))
    : [];

  const transferHistory = portalData?.wallet?.transferHistory?.length
    ? portalData.wallet.transferHistory.map((item: any) => ({
        to: item.counterparty,
        amount: Number(item.amount).toLocaleString(),
        date: item.date,
        status: String(item.status || '').toUpperCase(),
        txId: item.id,
        type: item.type === 'swap' ? 'SENT' : 'RECEIVED',
      }))
    : [];

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
          <p className="text-4xl lg:text-6xl font-mono font-black text-luxury-gold tracking-tighter">
            ${Number(portalData?.wallet?.totalAssets ?? user.totalAssets ?? 0).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
                  <h2 className="text-3xl lg:text-4xl font-mono font-black text-white tracking-tighter">{asset.value}</h2>
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
              whileTap={{ scale: 0.98 }}
              onClick={() => onSetView('usdt-onboarding')}
              className="glass-panel py-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-green-500/5 hover:border-green-500/30 transition-all font-black text-[10px] tracking-widest uppercase text-white shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <ArrowDownCircle size={32} />
              </div>
              DEPOSIT
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
             onClick={handleTransferClick}
             className="w-full glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all text-left shadow-xl"
          >
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Send size={28} />
                </div>
                <div>
                   <h3 className="text-[11px] font-black text-white tracking-widest uppercase">SEND USDT</h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Transfer to another wallet</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-gray-700 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
          </motion.button>

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

              <div className="relative">
                <div className="bg-black/40 border border-white/5 rounded-t-3xl rounded-b-none p-8 pb-10 space-y-3 relative group/input focus-within:border-luxury-gold/30 transition-all">
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

                <div className="relative z-20 h-0">
                   <div className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#120303] bg-luxury-gold text-black shadow-lg group-hover:rotate-180 transition-transform duration-1000">
                      <ArrowDownCircle size={24} />
                   </div>
                </div>

                <div className="bg-white/5 border border-white/5 border-t-0 rounded-b-3xl rounded-t-none p-8 pt-10 space-y-3">
                  <div className="text-[10px] font-black tracking-widest uppercase text-luxury-gold">
                    RECEIVE CNYT (1:1)
                  </div>
                  <p className="text-3xl font-mono font-black text-gray-600">{payAmount === '' ? '0.00' : payAmount}</p>
                </div>
              </div>

              <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                <p className="text-[9px] text-red-500 font-black uppercase tracking-widest leading-relaxed">* Conversion is permanent and cannot be reversed.</p>
              </div>

              <button onClick={handleConvert} className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all">
                CONFIRM CONVERSION
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Package History & Activity */}
        <div className="lg:col-span-3 space-y-8">
          {/* Package History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center relative z-10">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">PACKAGE HISTORY</h2>
              <button
                onClick={() => setShowAllPackageHistory((current) => !current)}
                disabled={packageHistory.length <= 3}
                className="flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase hover:text-white transition-colors disabled:cursor-not-allowed disabled:text-gray-700"
              >
                <ShoppingCart size={16} /> {showAllPackageHistory ? 'SHOW LESS' : 'VIEW ALL'}
              </button>
            </div>

            <div className="relative z-10 -mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
              <span>{showAllPackageHistory ? 'All Package Records' : 'Recent Package Records'}</span>
              <span>{visiblePackageHistory.length} / {packageHistory.length}</span>
            </div>

            <div className="space-y-4 relative z-10">
              {visiblePackageHistory.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">No package history yet</p>
                  <p className="mt-2 text-sm text-gray-600">Your package purchases will appear here.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
              {visiblePackageHistory.map((pkg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                >
                  <div className="flex items-center gap-6 lg:gap-8">
                     <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold transition-all group-hover:scale-110">
                        <pkg.icon size={28} />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{pkg.name}</h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest">{pkg.date}</p>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${
                            pkg.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {pkg.status}
                          </span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-2xl font-mono font-black text-white tracking-tighter">
                       {pkg.amount} USDT
                     </p>
                     <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">
                       {pkg.returns} Returns
                     </p>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

            <div className="flex justify-between items-center relative z-10">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">RECENT ACTIVITY</h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase hover:text-white transition-colors">
                <Filter size={16} /> FILTER
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {activities.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">No recent activity yet</p>
                  <p className="mt-2 text-sm text-gray-600">Deposits, rewards, and transactions will appear here.</p>
                </div>
              )}
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

          {/* Transfer History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center relative z-10">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">TRANSFER HISTORY</h2>
              <button className="flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase hover:text-white transition-colors">
                <History size={16} /> VIEW ALL
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {transferHistory.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">No transfer history yet</p>
                  <p className="mt-2 text-sm text-gray-600">Wallet transfers will appear here.</p>
                </div>
              )}
              {transferHistory.map((transfer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                >
                  <div className="flex items-center gap-6 lg:gap-8">
                     <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${
                       transfer.type === 'SENT' ? 'text-red-500' : 'text-green-500'
                     }`}>
                        {transfer.type === 'SENT' ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">
                          {transfer.type === 'SENT' ? `To: ${transfer.to}` : `From: ${transfer.from}`}
                        </h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest">{transfer.date}</p>
                          <p className="text-[8px] text-gray-600 font-mono tracking-widest">{transfer.txId}</p>
                        </div>
                     </div>
                  </div>
                  <div className="text-right space-y-1">
                     <p className={`text-2xl font-mono font-black tracking-tighter ${
                       transfer.type === 'SENT' ? 'text-red-500' : 'text-green-500'
                     }`}>
                       {transfer.type === 'SENT' ? '-' : '+'}{transfer.amount}
                     </p>
                     <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">{transfer.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {walletMessage && (
        <div className="fixed top-24 right-6 z-[120] rounded-2xl border border-luxury-gold/20 bg-black/80 px-4 py-3 text-sm text-white shadow-2xl">
          {walletMessage}
        </div>
      )}

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isWithdrawalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWithdrawalModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg glass-panel p-10 rounded-2xl border border-red-500/30 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-serif font-black text-white uppercase italic">Request Withdrawal</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Submit managed-ledger settlement request</p>
                </div>
                <button onClick={() => setIsWithdrawalModalOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <input value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="Settlement destination / account memo" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50" />
              <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={withdrawTradingPassword}
                onChange={(e) => setWithdrawTradingPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4-digit Trading PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
              />
              {user.otp && (
                <input
                  value={withdrawOtpCode}
                  maxLength={6}
                  onChange={(e) => setWithdrawOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Google OTP code"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
                />
              )}
              <button onClick={handleWithdrawalSubmit} disabled={!withdrawAddress || !withdrawAmount || withdrawTradingPassword.length !== 4 || (user.otp && withdrawOtpCode.length !== 6)} className="w-full py-5 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all">
                SUBMIT WITHDRAWAL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USDT Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-10 rounded-2xl border border-blue-500/30 space-y-8"
            >
              {!showTransferConfirmation ? (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                         <Send size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-black text-white uppercase italic">Send USDT</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Transfer to wallet</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsTransferModalOpen(false)}
                      className="text-gray-600 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Recipient Wallet</label>
                      <input
                        type="email"
                        value={recipientWallet}
                        onChange={(e) => setRecipientWallet(e.target.value)}
                        placeholder="Enter email or wallet address"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Amount (USDT)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-20"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white">
                          MAX
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Trading Password</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={transferPassword}
                        onChange={(e) => setTransferPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4-digit Trading PIN"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                        ⚠ Transfers are irreversible. Verify recipient details carefully.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTransferSubmit}
                    disabled={!recipientWallet || !transferAmount || transferPassword.length !== 4}
                    className="w-full py-5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all"
                  >
                    CONFIRM TRANSFER
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center text-green-500 mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-black text-white mb-2">Transfer Sent!</h3>
                    <p className="text-sm text-gray-400">Your USDT transfer is being processed</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Requirement Modal */}
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
                   To authorize asset withdrawals and transfers, you must configure your <span className="text-luxury-gold">Trading Password</span> (4-digit numeric PIN) in your Profile settings.
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

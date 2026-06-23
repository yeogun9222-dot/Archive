import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { USDTMarketPage } from './USDTMarketPage';
import {
  Gem,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Search,
  Crown,
  ChevronRight,
  Info
} from 'lucide-react';

const orders = [
  { type: 'SELL', user: 'DIAMOND88', amount: '1,651', price: '0.0325', total: '53.66', isPremium: false },
  { type: 'SELL', user: 'PHOENIX99', amount: '1,143', price: '0.0304', total: '34.75', isPremium: true },
  { type: 'SELL', user: 'DIAMOND88', amount: '500', price: '0.031', total: '15.50', isPremium: true },
  { type: 'BUY', user: 'PHOENIX99', amount: '800', price: '0.0295', total: '23.60', isPremium: false },
  { type: 'SELL', user: 'GOLDENEAGLE', amount: '1,200', price: '0.032', total: '38.40', isPremium: true },
  { type: 'BUY', user: 'SILVERWOLF', amount: '600', price: '0.0298', total: '17.88', isPremium: false },
  { type: 'SELL', user: 'CRIMSONDRAGON', amount: '2,000', price: '0.0315', total: '63.00', isPremium: true },
];

const myOrders = [
  { type: 'SELL', user: 'YOU', amount: '2,500', price: '0.032', total: '80.00', isPremium: true, status: 'ACTIVE', createdAt: '2 hours ago' },
  { type: 'BUY', user: 'YOU', amount: '1,000', price: '0.03', total: '30.00', isPremium: false, status: 'ACTIVE', createdAt: '5 hours ago' },
  { type: 'SELL', user: 'YOU', amount: '750', price: '0.0335', total: '25.13', isPremium: true, status: 'PENDING', createdAt: '1 day ago' },
];

export const CNYTMarketPage = ({ userRank }: { userRank?: string }) => {
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [activeMarket, setActiveMarket] = useState<'cnyt' | 'usdt'>('cnyt');

  // USDT 페이지로 이동 시
  if (activeMarket === 'usdt') {
    return (
      <div className="relative">
        <USDTMarketPage userRank={userRank} />
        {/* Market Tab Switcher - Fixed at top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMarket('cnyt')}
            className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
          >
            CNYT Trading
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMarket('usdt')}
            className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-gradient-to-r from-luxury-gold to-yellow-400 text-black shadow-lg"
          >
            USDT Trading
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Market Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center gap-3 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveMarket('cnyt')}
          className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-gradient-to-r from-luxury-gold to-yellow-400 text-black shadow-lg"
        >
          CNYT Trading
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveMarket('usdt')}
          className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
        >
          USDT Trading
        </motion.button>
      </motion.div>

      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">CNYT P2P MARKET</span>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">
            Premium Trading Floor
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent rounded-full mt-2 opacity-50"></div>
        </motion.div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-3 gap-2 lg:gap-6 px-2 lg:px-0">
        {[
          { label: 'CNYT INDEX PRICE', value: '$0.031', sub: '+2.4%', icon: Gem },
          { label: '24H TRADING VOL', value: '1.2M CNYT', sub: '+12.5%', icon: BarChart3 },
          { label: 'ACTIVE LISTINGS', value: '2.8K+', sub: '+85', icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-3 lg:p-8 rounded-2xl flex flex-col lg:flex-row items-center lg:justify-between group cursor-pointer border border-white/5 hover:border-luxury-gold/30 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-1">
              <p className="text-[7px] lg:text-[9px] text-gray-500 font-black tracking-widest uppercase">{stat.label}</p>
              <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-1 lg:gap-3">
                <span className="text-lg lg:text-3xl font-mono font-black text-white tracking-tighter">{stat.value}</span>
                <span className="text-[9px] lg:text-[11px] font-black text-luxury-gold">{stat.sub}</span>
              </div>
            </div>
            <div className="w-10 lg:w-14 h-10 lg:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform mt-2 lg:mt-0">
              <stat.icon size={16} className="lg:size-[28] opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Span - Order Stream */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 flex flex-col h-fit"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              <h2 className="text-xl font-serif font-black text-white uppercase tracking-tight italic">LIVE ORDER STREAM</h2>
            </div>
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setActiveOrderTab('all')}
                className={`px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeOrderTab === 'all' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                ALL ORDERS
              </button>
              <button
                onClick={() => setActiveOrderTab('mine')}
                className={`px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeOrderTab === 'mine' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                MY ORDERS ({myOrders.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(activeOrderTab === 'all' ? orders : myOrders).map((order, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl lg:p-1 p-4 transition-all overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-center lg:py-6 lg:px-10 gap-4 lg:gap-1 10 w-full">
                  {/* Direction Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${order.type === 'SELL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {order.type === 'SELL' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>

                  {/* User & Info */}
                  <div className="flex-1 space-y-1 text-center lg:text-left">
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2">
                       <span className={`px-3 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] transition-colors ${order.type === 'SELL' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                         {order.type}
                       </span>
                       {order.isPremium && (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30">
                            <Crown size={10} className="text-luxury-gold" />
                            <span className="text-[7px] font-black text-luxury-gold tracking-widest">PREMIUM</span>
                         </div>
                       )}
                       {(order as any).status && (
                         <span className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-[0.2em] ${(order as any).status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                           {(order as any).status}
                         </span>
                       )}
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.user}</span>
                    </div>
                    <p className="text-lg lg:text-xl font-mono font-black text-white">
                      {order.amount} <span className="text-xs font-serif font-black text-gray-500 tracking-widest">CNYT</span> <span className="mx-2 text-gray-700">@</span> <span className="text-luxury-gold">${order.price}</span>
                    </p>
                    {(order as any).createdAt && (
                      <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">{(order as any).createdAt}</p>
                    )}
                  </div>

                  {/* Total Value */}
                  <div className="text-center lg:text-right px-6 shrink-0 space-y-1">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total Value</p>
                    <p className="text-2xl font-mono font-black text-white tracking-tighter">{order.total}</p>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 w-full lg:w-fit mt-4 lg:mt-0">
                    {activeOrderTab === 'mine' ? (
                      <button className="w-full lg:w-32 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl hover:scale-105 active:scale-95 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30">
                        CANCEL
                      </button>
                    ) : (
                      <button className={`w-full lg:w-32 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl hover:scale-105 active:scale-95 ${order.type === 'SELL' ? 'bg-luxury-gold text-black shadow-[0_5px_15px_rgba(234,179,8,0.3)]' : 'bg-white text-black'}`}>
                        {order.type === 'SELL' ? 'BUY' : 'SELL'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Span - Trade Form & Marketplace Info */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-10 rounded-2xl border border-white/5 space-y-10"
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">TRADE CNYT</h2>
              
              <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full">
                <button 
                  onClick={() => setTradeType('BUY')}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'BUY' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  BUY
                </button>
                <button 
                  onClick={() => setTradeType('SELL')}
                  className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'SELL' ? 'bg-luxury-gold-light/40 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  SELL
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">AMOUNT</label>
                <div className="relative group">
                  <input type="text" placeholder="0.00" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-white focus:outline-none focus:border-luxury-gold/50 transition-all placeholder:text-gray-800" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 uppercase tracking-widest">CNYT</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRICE PER CNYT</label>
                   <span className="text-[9px] font-black text-luxury-gold uppercase tracking-widest flex items-center gap-1"><Info size={12} /> Index: $0.031</span>
                </div>
                <div className="relative group">
                  <input type="text" defaultValue="0.0310" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-luxury-gold focus:outline-none focus:border-luxury-gold transition-all" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 uppercase tracking-widest">USDT</span>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                  <span className="text-gray-600">Transaction Fee</span>
                  <span className="text-green-500">0.00% (FREE)</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Total USDT</span>
                  <span className="text-3xl font-mono font-black text-white">0.00</span>
                </div>
              </div>

              <button className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all">
                POST {tradeType} ORDER
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-serif font-black text-white uppercase italic tracking-tight underline-offset-4 decoration-luxury-gold/30">Market Safety</h3>
            </div>
            
            <ul className="space-y-6">
              {[
                'All P2P trades are secured by our smart contract escrow system.',
                'Zero transaction fees for all CNYT ecosystem members.',
                'Verified sellers are marked with the premium badge.',
              ].map((text, i) => (
                <li key={i} className="flex gap-4">
                   <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-luxury-gold mt-1.5"></div>
                   <p className="text-xs text-gray-400 font-light leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

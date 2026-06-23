import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Info,
  Globe,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  Lock,
  Clock,
  AlertTriangle,
  X,
  ArrowRight
} from 'lucide-react';

interface Reputation {
  stars: number; // 2, 1, or 0 (locked)
  status: 'GOOD' | 'WARNING' | 'LOCKED';
  completedTrades: number;
  disputeTrades: number;
  averageResponseTime: string;
  fraudStrikes: number;
}

interface Order {
  type: 'SELL' | 'BUY';
  user: string;
  amount: string;
  price: string;
  total: string;
  country: string;
  status?: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  createdAt?: string;
  rank?: 'RED_DRAGON' | 'GOLD' | 'SILVER' | 'BRONZE';
  reputation?: Reputation;
}

const orders: Order[] = [
  { type: 'SELL', user: 'DRAGON_ASIA', amount: '500', price: '0.90', total: '450', country: '🇨🇳 China', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 247, disputeTrades: 0, averageResponseTime: '2 mins', fraudStrikes: 0 } },
  { type: 'SELL', user: 'RED_KR', amount: '300', price: '0.90', total: '270', country: '🇰🇷 Korea', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 189, disputeTrades: 2, averageResponseTime: '3 mins', fraudStrikes: 0 } },
  { type: 'SELL', user: 'PHOENIX_VN', amount: '200', price: '0.90', total: '180', country: '🇻🇳 Vietnam', rank: 'RED_DRAGON', reputation: { stars: 1, status: 'WARNING', completedTrades: 124, disputeTrades: 3, averageResponseTime: '5 mins', fraudStrikes: 1 } },
  { type: 'BUY', user: 'SILVERKING', amount: '250', price: '0.90', total: '225', country: '🇺🇸 USA' },
  { type: 'SELL', user: 'GOLDLEADER', amount: '750', price: '0.90', total: '675', country: '🇵🇭 Philippines', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 312, disputeTrades: 1, averageResponseTime: '1 min', fraudStrikes: 0 } },
  { type: 'SELL', user: 'DRAGON_EU', amount: '400', price: '0.90', total: '360', country: '🇬🇧 UK', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 156, disputeTrades: 0, averageResponseTime: '4 mins', fraudStrikes: 0 } },
  { type: 'BUY', user: 'DIAMOND', amount: '600', price: '0.90', total: '540', country: '🇨🇳 China' },
];

const myOrders: Order[] = [
  { type: 'SELL', user: 'YOU', amount: '800', price: '0.90', total: '720', country: '🇰🇷 Korea', status: 'ACTIVE', createdAt: '2 hours ago', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 89, disputeTrades: 0, averageResponseTime: '1 min', fraudStrikes: 0 } },
  { type: 'SELL', user: 'YOU', amount: '400', price: '0.90', total: '360', country: '🇨🇳 China', status: 'ACTIVE', createdAt: '5 hours ago', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 89, disputeTrades: 0, averageResponseTime: '1 min', fraudStrikes: 0 } },
  { type: 'SELL', user: 'YOU', amount: '600', price: '0.90', total: '540', country: '🇰🇷 Korea', status: 'COMPLETED', createdAt: '1 day ago', rank: 'RED_DRAGON', reputation: { stars: 2, status: 'GOOD', completedTrades: 89, disputeTrades: 0, averageResponseTime: '1 min', fraudStrikes: 0 } },
];

const countries = [
  '🇨🇳 China',
  '🇰🇷 Korea',
  '🇻🇳 Vietnam',
  '🇵🇭 Philippines',
  '🇬🇧 UK',
  '🇺🇸 USA',
  '🇲🇴 Macau',
  'All Countries'
];

export const USDTMarketPage = ({ userRank }: { userRank?: string }) => {
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [selectedReputation, setSelectedReputation] = useState<Reputation | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buyStep, setBuyStep] = useState<'form' | 'confirm' | 'complete'>('form');

  const isRedDragon = userRank === 'RED_DRAGON' || userRank === 'DIAMOND';
  const userBalance = 50000; // Mock wallet balance

  // 국가별 필터링
  const filteredOrders = orders.filter(order => {
    const countryMatch = selectedCountry === 'All Countries' || order.country === selectedCountry;
    const searchMatch = order.user.toLowerCase().includes(searchTerm.toLowerCase());
    return countryMatch && searchMatch && order.status !== 'COMPLETED';
  });

  const filteredMyOrders = myOrders.filter(order => {
    const countryMatch = selectedCountry === 'All Countries' || order.country === selectedCountry;
    return countryMatch;
  });

  const totalProfit = myOrders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, order) => sum + (parseFloat(order.total) * 0.2), 0); // 20% 차익

  const handleBuyClick = (order: Order) => {
    if (!isRedDragon) {
      setShowUpgradeModal(true);
    } else {
      setSelectedOrder(order);
      setBuyQuantity('');
      setBuyStep('form');
      setShowBuyModal(true);
    }
  };

  const handleConfirmBuy = () => {
    if (!selectedOrder || !buyQuantity || parseFloat(buyQuantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const totalCost = parseFloat(selectedOrder.price) * parseFloat(buyQuantity);
    if (totalCost > userBalance) {
      alert('Insufficient balance');
      return;
    }

    setBuyStep('confirm');
  };

  const handleCompleteBuy = () => {
    setBuyStep('complete');
    setTimeout(() => {
      setShowBuyModal(false);
      setSelectedOrder(null);
      setBuyQuantity('');
    }, 2000);
  };

  const handleCancelOrder = (index: number) => {
    alert('Order cancelled');
  };

  const handleCompleteOrder = (index: number) => {
    alert('Order marked as completed');
  };

  const handleUserClick = (user: string, reputation?: Reputation) => {
    if (reputation) {
      setSelectedUser(user);
      setSelectedReputation(reputation);
      setShowReputationModal(true);
    }
  };

  return (
    <div className="pt-56 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">USDT P2P MARKET</span>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">
            USDT Trading Floor
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent rounded-full mt-2 opacity-50"></div>
        </motion.div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-3 gap-2 lg:gap-6 px-2 lg:px-0">
        {[
          { label: 'USDT INDEX PRICE', value: '$1.00', sub: 'Fixed Rate', icon: Gem },
          { label: '24H TRADING VOL', value: '45.2K USDT', sub: '+18.3%', icon: BarChart3 },
          { label: 'ACTIVE LISTINGS', value: '1.2K+', sub: '+42', icon: TrendingUp },
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
                MY ORDERS ({filteredMyOrders.length})
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none bg-white/[0.08] border border-luxury-gold/40 hover:border-luxury-gold/60 rounded-lg px-5 py-3 text-white font-black text-sm tracking-wide focus:outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 cursor-pointer transition-all pr-10"
              >
                {countries.map(country => (
                  <option key={country} value={country} className="bg-[#1a0505] text-white">{country}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-luxury-gold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {(activeOrderTab === 'all' ? filteredOrders : filteredMyOrders).map((order, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl lg:p-1 p-4 transition-all overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row items-center lg:py-6 lg:px-10 gap-4 lg:gap-10 w-full">
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
                      {order.rank === 'RED_DRAGON' && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30">
                          <Crown size={10} className="text-luxury-gold" />
                          <span className="text-[7px] font-black text-luxury-gold tracking-widest">RED DRAGON</span>
                        </div>
                      )}
                      {order.reputation && (
                        <motion.button
                          onClick={() => handleUserClick(order.user, order.reputation)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all cursor-pointer group"
                        >
                          {order.reputation.status === 'LOCKED' ? (
                            <>
                              <Lock size={10} className="text-red-400 group-hover:scale-110 transition-transform" />
                              <span className="text-[7px] font-black text-red-400">LOCKED</span>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-0.5">
                                {[...Array(2)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={8}
                                    className={i < order.reputation!.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                                  />
                                ))}
                              </div>
                              <span className="text-[7px] font-black text-yellow-400">({order.reputation.stars}/2)</span>
                            </>
                          )}
                        </motion.button>
                      )}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                        <Globe size={10} className="text-blue-400" />
                        <span className="text-[7px] font-black text-blue-300">{order.country}</span>
                      </div>
                      {(order as any).status && (
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-[0.2em] ${(order as any).status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : (order as any).status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {(order as any).status}
                        </span>
                      )}
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.user}</span>
                    </div>
                    <p className="text-lg lg:text-xl font-mono font-black text-white">
                      {order.amount} <span className="text-xs font-serif font-black text-gray-500 tracking-widest">USDT</span> <span className="mx-2 text-gray-700">@</span> <span className="text-luxury-gold">${order.price}</span>
                    </p>
                    {(order as any).createdAt && (
                      <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">{(order as any).createdAt}</p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    {activeOrderTab === 'all' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBuyClick(order)}
                        className="px-6 py-2 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-xs tracking-widest rounded-lg transition-all disabled:opacity-50"
                        disabled={!isRedDragon && order.type === 'SELL'}
                      >
                        {order.type === 'SELL' ? 'BUY' : 'SELL'}
                      </motion.button>
                    ) : (
                      <>
                        {(order as any).status === 'ACTIVE' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCompleteOrder(i)}
                              className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-black text-xs rounded-lg hover:bg-green-500/30 transition-all"
                              title="Mark as completed"
                            >
                              <CheckCircle size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelOrder(i)}
                              className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-black text-xs rounded-lg hover:bg-red-500/30 transition-all"
                              title="Cancel order"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar - Stats & History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Trading Stats */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Statistics</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Total Profit</span>
                <span className="text-2xl font-mono font-black text-green-400">${totalProfit.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Active Orders</span>
                <span className="text-2xl font-mono font-black text-white">{myOrders.filter(o => o.status === 'ACTIVE').length}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Completed</span>
                <span className="text-2xl font-mono font-black text-white">{myOrders.filter(o => o.status === 'COMPLETED').length}</span>
              </div>
            </div>
          </div>

          {/* Buy Rate Info */}
          <div className="glass-panel p-6 rounded-2xl border border-luxury-gold/30 bg-luxury-gold/5 space-y-4">
            <div className="flex items-center gap-2">
              <Info size={20} className="text-luxury-gold" />
              <h4 className="font-black text-luxury-gold text-sm uppercase tracking-wide">Buy Rate</h4>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>🎯 <span className="font-black text-white">Buy Price: $0.90 USDT</span></p>
              <p className="text-xs text-gray-500">
                Red Dragon members can purchase USDT at a fixed rate of $0.90. Resale price is determined by market conditions.
              </p>
            </div>
          </div>

          {/* Trade History */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Recent Trades</h3>
            <div className="space-y-3">
              {myOrders.filter(o => o.status === 'COMPLETED').slice(0, 5).map((order, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5"
                >
                  <div className="text-xs">
                    <p className="font-black text-white">{order.amount} USDT</p>
                    <p className="text-gray-500 text-[10px]">{order.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-green-400 text-sm">${(parseFloat(order.total) * 0.2).toFixed(2)}</p>
                    <p className="text-gray-500 text-[10px]">+20% profit</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#1a0505] to-[#0a0a0a] border border-luxury-gold/30 rounded-2xl p-8 max-w-md z-[101]"
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={28} className="text-red-500" />
                <h3 className="text-2xl font-black text-white">Rank Upgrade Required</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Only <span className="text-luxury-gold font-black">Red Dragon</span> rank members and above can purchase USDT. Upgrade your rank to unlock this feature.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-lg transition-all"
                >
                  Close
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black rounded-lg transition-all">
                  Upgrade Now
                </button>
              </div>
            </motion.div>
          </>
        )}

        {showReputationModal && selectedReputation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowReputationModal(false);
                setSelectedReputation(null);
                setSelectedUser('');
              }}
              className="fixed inset-0 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6"
            >
              <motion.div className="relative w-full max-w-md glass-panel rounded-2xl border border-luxury-gold/30 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-white/10 bg-gradient-to-r from-luxury-gold/5 to-transparent space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">{selectedUser}</h3>
                      <p className="text-xs text-gray-500 font-black tracking-widest uppercase">Red Dragon - Reputation Details</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowReputationModal(false);
                        setSelectedReputation(null);
                        setSelectedUser('');
                      }}
                      className="text-gray-600 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Trust Rating */}
                  <div className="space-y-3">
                    {selectedReputation.status === 'LOCKED' ? (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <Lock size={24} className="text-red-400" />
                        <div>
                          <p className="font-black text-red-400">ACCOUNT LOCKED</p>
                          <p className="text-xs text-gray-400 mt-1">This account has been permanently locked due to fraudulent activity.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {[...Array(2)].map((_, i) => (
                            <Star
                              key={i}
                              size={32}
                              className={i < selectedReputation.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                            />
                          ))}
                        </div>
                        <div>
                          <p className="text-3xl font-black text-white">{selectedReputation.stars}/2</p>
                          <p className={`text-xs font-black tracking-widest uppercase ${selectedReputation.status === 'GOOD' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {selectedReputation.status}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-8 space-y-6">
                  {selectedReputation.status !== 'LOCKED' && (
                    <>
                      {/* Warning Message */}
                      {selectedReputation.status === 'WARNING' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3"
                        >
                          <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-yellow-200 space-y-1">
                            <p className="font-black">⚠️ FRAUD WARNING</p>
                            <p>This user has {selectedReputation.fraudStrikes} strike{selectedReputation.fraudStrikes !== 1 ? 's' : ''}. One more fraudulent activity will result in account permanent lock.</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Strike Policy */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wide">Strike Policy</p>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex items-start gap-2">
                            <span className="text-luxury-gold font-black">⭐⭐</span>
                            <span>Good Standing - All trading available</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-black">⭐</span>
                            <span>First Fraud - 1 star removed (Warning)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-400 font-black">🔒</span>
                            <span>Second Fraud - Account Locked Forever</span>
                          </div>
                        </div>
                      </div>

                      {/* Trade Statistics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <p className="text-[11px] text-gray-500 font-black uppercase tracking-wide mb-2">Completed Trades</p>
                          <p className="text-2xl font-mono font-black text-white">{selectedReputation.completedTrades}</p>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <p className="text-[11px] text-gray-500 font-black uppercase tracking-wide mb-2">Disputes</p>
                          <p className="text-2xl font-mono font-black text-red-400">{selectedReputation.disputeTrades}</p>
                        </div>
                      </div>

                      {/* Average Response Time */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-luxury-gold" />
                          <span className="text-sm font-black text-gray-400 uppercase tracking-wide">Avg Response Time</span>
                        </div>
                        <span className="text-lg font-mono font-black text-white">{selectedReputation.averageResponseTime}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                  <button
                    onClick={() => {
                      setShowReputationModal(false);
                      setSelectedReputation(null);
                      setSelectedUser('');
                    }}
                    className="w-full py-3 bg-luxury-gold/10 hover:bg-luxury-gold/20 border border-luxury-gold/30 rounded-lg text-luxury-gold font-black text-sm uppercase tracking-widest transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {showBuyModal && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowBuyModal(false);
                setSelectedOrder(null);
                setBuyQuantity('');
              }}
              className="fixed inset-0 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6"
            >
              <motion.div className="relative w-full max-w-md glass-panel rounded-2xl border border-luxury-gold/30 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* Step 1: Purchase Form */}
                  {buyStep === 'form' && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-8 space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white">Purchase USDT</h3>
                        <p className="text-xs text-gray-500 font-black tracking-widest uppercase">From {selectedOrder.user}</p>
                      </div>

                      {/* Seller Info */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-black uppercase tracking-wide">Seller</span>
                          <span className="text-sm font-black text-white">{selectedOrder.user}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-black uppercase tracking-wide">Price per USDT</span>
                          <span className="text-sm font-mono font-black text-luxury-gold">${selectedOrder.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-black uppercase tracking-wide">Available</span>
                          <span className="text-sm font-mono font-black text-white">{selectedOrder.amount} USDT</span>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 font-black uppercase tracking-wide">Your Balance</span>
                          <span className="text-sm font-mono font-black text-green-400">${userBalance.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Purchase Quantity (USDT)</label>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold/50 text-lg font-mono"
                        />
                        {buyQuantity && (
                          <div className="text-xs text-gray-400">
                            Total Cost: <span className="text-luxury-gold font-black">${(parseFloat(selectedOrder.price) * parseFloat(buyQuantity)).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowBuyModal(false);
                            setSelectedOrder(null);
                            setBuyQuantity('');
                          }}
                          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirmBuy}
                          className="flex-1 py-3 bg-gradient-to-r from-luxury-gold to-yellow-400 hover:from-luxury-gold/80 hover:to-yellow-400/80 text-black font-black text-sm rounded-lg transition-all uppercase"
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Confirmation */}
                  {buyStep === 'confirm' && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-8 space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white">Confirm Purchase</h3>
                        <p className="text-xs text-gray-500 font-black tracking-widest uppercase">Review your order details</p>
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Quantity</span>
                          <span className="text-sm font-mono font-black text-white">{buyQuantity} USDT</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Unit Price</span>
                          <span className="text-sm font-mono font-black text-white">${selectedOrder.price}</span>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-gray-300">Total Cost</span>
                          <span className="text-lg font-mono font-black text-luxury-gold">${(parseFloat(selectedOrder.price) * parseFloat(buyQuantity)).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wide">Payment Method</p>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-black">
                          Bank Transfer (Same Country)
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-200">
                          ⚠️ After confirming, you must complete the bank transfer to the seller's account within 15 minutes.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setBuyStep('form')}
                          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-sm rounded-lg transition-all uppercase"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCompleteBuy}
                          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-600/80 hover:to-green-500/80 text-white font-black text-sm rounded-lg transition-all uppercase"
                        >
                          Confirm Purchase
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Complete */}
                  {buyStep === 'complete' && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-8 text-center space-y-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto"
                      >
                        <CheckCircle size={40} className="text-green-400" />
                      </motion.div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white">Purchase Confirmed!</h3>
                        <p className="text-sm text-gray-400">
                          {buyQuantity} USDT will be transferred to your wallet shortly
                        </p>
                      </div>

                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2 text-left">
                        <p className="text-xs font-black text-green-400">✓ Order Details</p>
                        <p className="text-xs text-gray-300">
                          • Seller: {selectedOrder.user}<br/>
                          • Amount: {buyQuantity} USDT<br/>
                          • Total: ${(parseFloat(selectedOrder.price) * parseFloat(buyQuantity)).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close Button */}
                {buyStep !== 'complete' && (
                  <button
                    onClick={() => {
                      setShowBuyModal(false);
                      setSelectedOrder(null);
                      setBuyQuantity('');
                    }}
                    className="absolute top-6 right-6 text-gray-600 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

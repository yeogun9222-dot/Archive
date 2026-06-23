import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Gem,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Globe,
  Info,
  X,
} from 'lucide-react';

type OrderAction = (tradeId: string) => Promise<void>;
type FillAction = (tradeId: string, amount: number) => Promise<void>;
type CreateAction = (payload: { amount: number; price_per_unit: number; trade_type: 'buy' | 'sell' }) => Promise<void>;

const countries = ['All Countries', 'Global'];

export const USDTMarketPage = ({
  userRank,
  portalData,
  onCreateOrder,
  onCancelOrder,
  onCompleteOrder,
  onFillOrder,
  onSelectCnyt,
}: {
  userRank?: string;
  portalData?: any;
  onCreateOrder?: CreateAction;
  onCancelOrder?: OrderAction;
  onCompleteOrder?: OrderAction;
  onFillOrder?: FillAction;
  onSelectCnyt?: () => void;
}) => {
  const [activeOrderTab, setActiveOrderTab] = useState<'all' | 'mine'>('all');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amountInput, setAmountInput] = useState('');
  const [priceInput, setPriceInput] = useState(String(portalData?.market?.usdt?.stats?.indexPrice || '1'));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const marketData = portalData?.market?.usdt || { stats: {}, orderBook: [], myOrders: [] };
  const userBalance = Number(portalData?.wallet?.assets?.find((asset: any) => asset.label === 'AVAILABLE USDT')?.value || 0);
  const isRedDragon = ['RED_DRAGON', 'DIAMOND', 'Red Dragon', 'Black Dragon', 'VIP'].includes(String(userRank));

  const filteredOrders = useMemo(
    () =>
      (marketData.orderBook || []).filter((order: any) => {
        const countryMatch = selectedCountry === 'All Countries' || selectedCountry === 'Global';
        const searchMatch = String(order.user || '').toLowerCase().includes(searchTerm.toLowerCase());
        return countryMatch && searchMatch;
      }),
    [marketData.orderBook, searchTerm, selectedCountry],
  );

  const filteredMyOrders = useMemo(() => marketData.myOrders || [], [marketData.myOrders]);
  const completedOrders = filteredMyOrders.filter((order: any) => order.status === 'COMPLETED');
  const totalProfit = completedOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0) * 0.02, 0);

  const stats = [
    { label: 'USDT INDEX PRICE', value: `$${Number(marketData?.stats?.indexPrice || 1).toFixed(4)}`, sub: 'market ref', icon: Gem },
    { label: 'ACTIVE LISTINGS', value: `${marketData?.stats?.activeListings || 0}`, sub: 'order book', icon: BarChart3 },
    { label: 'MY ORDERS', value: `${marketData?.stats?.myOrders || 0}`, sub: 'posted', icon: TrendingUp },
  ];

  const handleCreateOrder = async () => {
    if (!amountInput || Number(amountInput) <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (!priceInput || Number(priceInput) <= 0) {
      setError('Enter a valid price.');
      return;
    }
    if (tradeType === 'BUY' && !isRedDragon) {
      setError('Red Dragon rank or above is required to post direct USDT buy orders.');
      return;
    }

    try {
      await onCreateOrder?.({
        amount: Number(amountInput),
        price_per_unit: Number(priceInput),
        trade_type: tradeType === 'BUY' ? 'buy' : 'sell',
      });
      setAmountInput('');
      setError('');
      setMessage(`USDT ${tradeType.toLowerCase()} order posted.`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to post order.');
    }
  };

  const handleFill = async (order: any) => {
    if (Number(order.price) * Number(order.amount) > userBalance) {
      setError('Insufficient balance to fill this order.');
      return;
    }
    try {
      await onFillOrder?.(order.id, Number(order.amount));
      setError('');
      setMessage(`Order ${order.id} matched successfully.`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to execute order.');
    }
  };

  const handleCancel = async (tradeId: string) => {
    try {
      await onCancelOrder?.(tradeId);
      setError('');
      setMessage(`Order ${tradeId} was cancelled.`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to cancel order.');
    }
  };

  const handleComplete = async (tradeId: string) => {
    try {
      await onCompleteOrder?.(tradeId);
      setError('');
      setMessage(`Order ${tradeId} was completed.`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to complete order.');
    }
  };

  return (
    <div className="pt-56 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSelectCnyt} className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10">
          CNYT Trading
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-gradient-to-r from-luxury-gold to-yellow-400 text-black shadow-lg">
          USDT Trading
        </motion.button>
      </motion.div>

      <div className="text-center space-y-4">
        <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">USDT P2P MARKET</span>
        <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">USDT Trading Floor</h1>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl border p-4 text-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-green-500/30 bg-green-500/10 text-green-200'}`}>
          <div className="flex items-center justify-between gap-4">
            <span>{error || message}</span>
            <button onClick={() => { setError(''); setMessage(''); }} className="text-current opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 lg:gap-6 px-2 lg:px-0">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-3 lg:p-8 rounded-2xl flex flex-col lg:flex-row items-center lg:justify-between border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="space-y-1">
              <p className="text-[7px] lg:text-[9px] text-gray-500 font-black tracking-widest uppercase">{stat.label}</p>
              <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-1 lg:gap-3">
                <span className="text-lg lg:text-3xl font-mono font-black text-white tracking-tighter">{stat.value}</span>
                <span className="text-[9px] lg:text-[11px] font-black text-luxury-gold">{stat.sub}</span>
              </div>
            </div>
            <div className="w-10 lg:w-14 h-10 lg:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold mt-2 lg:mt-0">
              <stat.icon size={16} className="lg:size-[28] opacity-60" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 flex flex-col h-fit">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              <h2 className="text-xl font-serif font-black text-white uppercase tracking-tight italic">LIVE ORDER STREAM</h2>
            </div>
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
              <button onClick={() => setActiveOrderTab('all')} className={`px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeOrderTab === 'all' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                ALL ORDERS
              </button>
              <button onClick={() => setActiveOrderTab('mine')} className={`px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeOrderTab === 'mine' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                MY ORDERS ({filteredMyOrders.length})
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="appearance-none bg-white/[0.08] border border-luxury-gold/40 rounded-lg px-5 py-3 text-white font-black text-sm tracking-wide focus:outline-none focus:border-luxury-gold cursor-pointer transition-all pr-10"
              >
                {countries.map((country) => (
                  <option key={country} value={country} className="bg-[#1a0505] text-white">{country}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-luxury-gold">
                <Globe size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {(activeOrderTab === 'all' ? filteredOrders : filteredMyOrders).length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-gray-400">
                No market orders are available.
              </div>
            )}
            {(activeOrderTab === 'all' ? filteredOrders : filteredMyOrders).map((order: any, i: number) => (
              <motion.div key={order.id || i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl lg:p-1 p-4 transition-all overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center lg:py-6 lg:px-10 gap-4 lg:gap-10 w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${order.type === 'SELL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {order.type === 'SELL' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="flex-1 space-y-1 text-center lg:text-left">
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] ${order.type === 'SELL' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {order.type}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                        <Globe size={10} className="text-blue-400" />
                        <span className="text-[7px] font-black text-blue-300">Global</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-[0.2em] ${order.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : order.status === 'MATCHED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.user || 'MARKET'}</span>
                    </div>
                    <p className="text-lg lg:text-xl font-mono font-black text-white">
                      {Number(order.amount).toLocaleString()} <span className="text-xs font-serif font-black text-gray-500 tracking-widest">USDT</span> <span className="mx-2 text-gray-700">@</span> <span className="text-luxury-gold">${Number(order.price).toFixed(4)}</span>
                    </p>
                    {order.createdAt && <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">{order.createdAt.slice(0, 19).replace('T', ' ')}</p>}
                  </div>
                  <div className="flex gap-2">
                    {activeOrderTab === 'all' ? (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFill(order)} className="px-6 py-2 bg-gradient-to-r from-luxury-gold to-yellow-400 text-black font-black text-xs tracking-widest rounded-lg transition-all">
                        {order.type === 'SELL' ? 'BUY' : 'SELL'}
                      </motion.button>
                    ) : (
                      <>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleComplete(order.id)} className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-black text-xs rounded-lg hover:bg-green-500/30 transition-all">
                          COMPLETE
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleCancel(order.id)} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-black text-xs rounded-lg hover:bg-red-500/30 transition-all">
                          CANCEL
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Your Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Wallet Balance</span>
                <span className="text-2xl font-mono font-black text-green-400">${userBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Active Orders</span>
                <span className="text-2xl font-mono font-black text-white">{filteredMyOrders.filter((o: any) => o.status === 'ACTIVE').length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-400 font-black uppercase tracking-wide">Trading PnL</span>
                <span className="text-2xl font-mono font-black text-white">${totalProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-8">
            <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">TRADE USDT</h2>
            <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full">
              <button onClick={() => setTradeType('BUY')} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'BUY' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                BUY
              </button>
              <button onClick={() => setTradeType('SELL')} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'SELL' ? 'bg-luxury-gold-light/40 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                SELL
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">AMOUNT</label>
              <input value={amountInput} onChange={(e) => setAmountInput(e.target.value)} type="text" placeholder="0.00" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-white focus:outline-none focus:border-luxury-gold/50 transition-all placeholder:text-gray-800" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRICE PER USDT</label>
                <span className="text-[9px] font-black text-luxury-gold uppercase tracking-widest flex items-center gap-1"><Info size={12} /> Index: ${Number(marketData?.stats?.indexPrice || 1).toFixed(4)}</span>
              </div>
              <input value={priceInput} onChange={(e) => setPriceInput(e.target.value)} type="text" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-luxury-gold focus:outline-none focus:border-luxury-gold transition-all" />
            </div>
            <button onClick={handleCreateOrder} className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all">
              POST {tradeType} ORDER
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-luxury-gold/30 bg-luxury-gold/5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-luxury-gold" />
              <h4 className="font-black text-luxury-gold text-sm uppercase tracking-wide">Execution Notice</h4>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Spot fills settle directly against the shared RDS state.</p>
              <p className="text-xs text-gray-500">
                Buy-side posting is restricted to upper ranks, while fill, cancel, and completion actions mutate the same live market records used by stage.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

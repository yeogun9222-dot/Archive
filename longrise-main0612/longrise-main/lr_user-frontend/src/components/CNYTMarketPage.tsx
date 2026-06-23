import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { USDTMarketPage } from './USDTMarketPage';
import {
  Gem,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Crown,
  Info,
  X,
} from 'lucide-react';

type OrderAction = (tradeId: string) => Promise<void>;
type FillAction = (tradeId: string, amount: number) => Promise<void>;
type CreateAction = (payload: { amount: number; price_per_unit: number; trade_type: 'buy' | 'sell' }) => Promise<void>;

export const CNYTMarketPage = ({
  userRank,
  portalData,
  onCreateOrder,
  onCreateUsdtOrder,
  onCancelOrder,
  onCompleteOrder,
  onFillOrder,
}: {
  userRank?: string;
  portalData?: any;
  onCreateOrder?: CreateAction;
  onCreateUsdtOrder?: CreateAction;
  onCancelOrder?: OrderAction;
  onCompleteOrder?: OrderAction;
  onFillOrder?: FillAction;
}) => {
  const [activeOrderTab, setActiveOrderTab] = useState<'all' | 'mine'>('all');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [activeMarket, setActiveMarket] = useState<'cnyt' | 'usdt'>('cnyt');
  const [amountInput, setAmountInput] = useState('');
  const [priceInput, setPriceInput] = useState(String(portalData?.market?.cnyt?.stats?.indexPrice || '0'));
  const [marketMessage, setMarketMessage] = useState('');
  const [marketError, setMarketError] = useState('');

  const marketData = portalData?.market?.cnyt || { stats: {}, orderBook: [], myOrders: [] };
  const liveOrders = marketData.orderBook || [];
  const liveMyOrders = marketData.myOrders || [];

  const stats = useMemo(
    () => [
      { label: 'CNYT INDEX PRICE', value: `$${Number(marketData?.stats?.indexPrice || 0).toFixed(4)}`, sub: `${marketData?.stats?.activeListings || 0} live`, icon: Gem },
      { label: 'ACTIVE LISTINGS', value: `${marketData?.stats?.activeListings || 0}`, sub: 'order book', icon: BarChart3 },
      { label: 'MY ORDERS', value: `${marketData?.stats?.myOrders || 0}`, sub: 'posted', icon: TrendingUp },
    ],
    [marketData],
  );

  const visibleOrders = activeOrderTab === 'all' ? liveOrders : liveMyOrders;

  if (activeMarket === 'usdt') {
    return (
      <div className="relative">
        <USDTMarketPage
          userRank={userRank}
          portalData={portalData}
          onCreateOrder={onCreateUsdtOrder}
          onCancelOrder={onCancelOrder}
          onCompleteOrder={onCompleteOrder}
          onFillOrder={onFillOrder}
          onSelectCnyt={() => setActiveMarket('cnyt')}
        />
      </div>
    );
  }

  const handleCreate = async () => {
    if (!amountInput || Number(amountInput) <= 0) {
      setMarketError('Enter a valid amount.');
      return;
    }
    if (!priceInput || Number(priceInput) <= 0) {
      setMarketError('Enter a valid price.');
      return;
    }

    try {
      await onCreateOrder?.({
        amount: Number(amountInput),
        price_per_unit: Number(priceInput),
        trade_type: tradeType === 'BUY' ? 'buy' : 'sell',
      });
      setAmountInput('');
      setMarketError('');
      setMarketMessage(`CNYT ${tradeType.toLowerCase()} order posted.`);
    } catch (err: any) {
      setMarketError(err?.response?.data?.detail || 'Unable to post order.');
    }
  };

  const handleFill = async (order: any) => {
    try {
      await onFillOrder?.(order.id, Number(order.amount));
      setMarketError('');
      setMarketMessage(`Order ${order.id} matched successfully.`);
    } catch (err: any) {
      setMarketError(err?.response?.data?.detail || 'Unable to execute order.');
    }
  };

  const handleCancel = async (tradeId: string) => {
    try {
      await onCancelOrder?.(tradeId);
      setMarketError('');
      setMarketMessage(`Order ${tradeId} was cancelled.`);
    } catch (err: any) {
      setMarketError(err?.response?.data?.detail || 'Unable to cancel order.');
    }
  };

  const handleComplete = async (tradeId: string) => {
    try {
      await onCompleteOrder?.(tradeId);
      setMarketError('');
      setMarketMessage(`Order ${tradeId} was completed.`);
    } catch (err: any) {
      setMarketError(err?.response?.data?.detail || 'Unable to complete order.');
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-3 mb-8">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveMarket('cnyt')} className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-gradient-to-r from-luxury-gold to-yellow-400 text-black shadow-lg">
          CNYT Trading
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveMarket('usdt')} className="px-8 py-3 rounded-xl text-sm font-black tracking-widest uppercase bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10">
          USDT Trading
        </motion.button>
      </motion.div>

      <div className="text-center space-y-4">
        <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">CNYT P2P MARKET</span>
        <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">Premium Trading Floor</h1>
      </div>

      {(marketMessage || marketError) && (
        <div className={`rounded-2xl border p-4 text-sm ${marketError ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-green-500/30 bg-green-500/10 text-green-200'}`}>
          <div className="flex items-center justify-between gap-4">
            <span>{marketError || marketMessage}</span>
            <button onClick={() => { setMarketError(''); setMarketMessage(''); }} className="text-current opacity-70 hover:opacity-100">
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
                MY ORDERS ({liveMyOrders.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {visibleOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-gray-400">
                No CNYT market orders are available.
              </div>
            )}
            {visibleOrders.map((order: any, i: number) => (
              <motion.div key={order.id || i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl lg:p-1 p-4 transition-all overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center lg:py-6 lg:px-10 gap-4 lg:gap-1 w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${order.type === 'SELL' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                    {order.type === 'SELL' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="flex-1 space-y-1 text-center lg:text-left">
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black tracking-[0.2em] ${order.type === 'SELL' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {order.type}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30">
                        <Crown size={10} className="text-luxury-gold" />
                        <span className="text-[7px] font-black text-luxury-gold tracking-widest">{activeOrderTab === 'mine' ? 'YOUR ORDER' : 'LIVE'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-[0.2em] ${order.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : order.status === 'MATCHED' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.user || 'MARKET'}</span>
                    </div>
                    <p className="text-lg lg:text-xl font-mono font-black text-white">
                      {Number(order.amount).toLocaleString()} <span className="text-xs font-serif font-black text-gray-500 tracking-widest">CNYT</span> <span className="mx-2 text-gray-700">@</span> <span className="text-luxury-gold">${Number(order.price).toFixed(4)}</span>
                    </p>
                    {order.createdAt && <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">{order.createdAt.slice(0, 19).replace('T', ' ')}</p>}
                  </div>
                  <div className="text-center lg:text-right px-6 shrink-0 space-y-1">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total Value</p>
                    <p className="text-2xl font-mono font-black text-white tracking-tighter">{Number(order.total).toFixed(2)}</p>
                  </div>
                  <div className="shrink-0 w-full lg:w-fit mt-4 lg:mt-0 flex gap-2">
                    {activeOrderTab === 'mine' ? (
                      <>
                        <button onClick={() => handleCancel(order.id)} className="w-full lg:w-28 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30">
                          CANCEL
                        </button>
                        <button onClick={() => handleComplete(order.id)} className="w-full lg:w-28 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30">
                          COMPLETE
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleFill(order)} className={`w-full lg:w-32 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${order.type === 'SELL' ? 'bg-luxury-gold text-black' : 'bg-white text-black'}`}>
                        {order.type === 'SELL' ? 'BUY' : 'SELL'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-10 rounded-2xl border border-white/5 space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">TRADE CNYT</h2>
              <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full">
                <button onClick={() => setTradeType('BUY')} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'BUY' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                  BUY
                </button>
                <button onClick={() => setTradeType('SELL')} className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all ${tradeType === 'SELL' ? 'bg-luxury-gold-light/40 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                  SELL
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">AMOUNT</label>
                <div className="relative group">
                  <input value={amountInput} onChange={(e) => setAmountInput(e.target.value)} type="text" placeholder="0.00" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-white focus:outline-none focus:border-luxury-gold/50 transition-all placeholder:text-gray-800" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 uppercase tracking-widest">CNYT</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRICE PER CNYT</label>
                  <span className="text-[9px] font-black text-luxury-gold uppercase tracking-widest flex items-center gap-1"><Info size={12} /> Index: ${Number(marketData?.stats?.indexPrice || 0).toFixed(4)}</span>
                </div>
                <div className="relative group">
                  <input value={priceInput} onChange={(e) => setPriceInput(e.target.value)} type="text" className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 font-mono text-xl font-black text-luxury-gold focus:outline-none focus:border-luxury-gold transition-all" />
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
                  <span className="text-3xl font-mono font-black text-white">{((Number(amountInput) || 0) * (Number(priceInput) || 0)).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCreate} className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all">
                POST {tradeType} ORDER
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-10 rounded-2xl border border-white/5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-serif font-black text-white uppercase italic tracking-tight underline-offset-4 decoration-luxury-gold/30">Market Safety</h3>
            </div>

            <ul className="space-y-6">
              {[
                'All CNYT P2P trades are settled against the live order book stored in the operational database.',
                'Cancelling and completing your own orders updates the same market state used by local and stage environments.',
                'Incoming fills update wallet balances immediately after the trade is confirmed.',
              ].map((text) => (
                <li key={text} className="flex gap-4">
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

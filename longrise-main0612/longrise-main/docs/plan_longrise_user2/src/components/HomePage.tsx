import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Brain,
  Cpu,
  ShieldCheck,
  Box,
  Crown,
  Zap,
  Star,
  Headphones,
  Send,
  BookOpen,
  X as XIcon
} from 'lucide-react';
import { PackageSection } from './PackageSection';

import { NetworkOverlay } from './VisualEffects';

export const Counter = ({ value, suffix = '', duration = 2 }: { value: number | string, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const target = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime > 0 ? incrementTime : 10);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const MetricCard = ({ title, value, suffix, delay = 0 }: { title: string, value: number, suffix: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }}
    viewport={{ once: true }}
    transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    className="group relative cursor-pointer"
  >
    <div className="absolute -inset-1 lg:-inset-2 bg-gradient-to-r from-red-600 to-luxury-gold rounded-2xl blur-xl lg:blur-3xl opacity-10 group-hover:opacity-40 transition duration-700"></div>
    
    <div className="relative h-full bg-gradient-to-br from-[#800000] via-[#660000] to-[#4a0000] border border-luxury-gold/30 rounded-2xl p-2 lg:p-6 flex flex-col items-center justify-center overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] lg:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] group-hover:border-luxury-gold group-hover:shadow-[0_40px_80px_-15px_rgba(128,0,0,0.3)] transition-all duration-500 min-h-[100px] lg:min-h-[200px]">
      <div className="absolute top-0 -inset-full h-full w-3/4 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:animate-shine pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 lg:opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 right-0 w-32 lg:w-80 h-32 lg:h-80 bg-white/10 blur-[40px] lg:blur-[100px] rounded-full -mr-16 -mt-16 lg:-mr-32 lg:-mt-32"></div>

      <div className="relative z-10 text-center">
        <div className="mb-1 lg:mb-4 inline-block">
          <h4 className="text-[7px] lg:text-[14px] font-black text-white/90 uppercase tracking-[0.2em] lg:tracking-[0.6em] drop-shadow-lg group-hover:text-luxury-gold-light transition-colors duration-300">
            {title}
          </h4>
          <div className="w-full h-0.5 lg:h-0.5 bg-luxury-gold mt-0.5 lg:mt-2 rounded-full transform scale-x-50 group-hover:scale-x-100 group-hover:bg-white transition-all duration-700 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
        </div>
        <p className="text-3xl lg:text-7xl font-mono font-black text-white tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] lg:drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
          {suffix === '$' ? '$' : ''}<Counter value={value} suffix={suffix !== '$' ? suffix : ''} />
        </p>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none"></div>
    </div>
  </motion.div>
);

export const PhoneMockup = () => {
  const [totalEarnings, setTotalEarnings] = useState(142500);
  const [trades, setTrades] = useState([
    { id: 1, type: 'BUY', pair: 'BTC/USD', amount: '+245.50', time: 'now' }
  ]);

  useEffect(() => {
    const earningsInterval = setInterval(() => {
      setTotalEarnings(prev => prev + Math.random() * 50);
    }, 2000);

    const tradeInterval = setInterval(() => {
      const newTrade = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        pair: ['BTC/USD', 'ETH/USD', 'ADA/USD', 'CNYT/USD'][Math.floor(Math.random() * 4)],
        amount: `+$${(Math.random() * 500 + 50).toFixed(2)}`,
        time: 'now'
      };
      setTrades(prev => [newTrade, ...prev.slice(0, 3)]);
    }, 3000);

    return () => {
      clearInterval(earningsInterval);
      clearInterval(tradeInterval);
    };
  }, []);

  return (
    <div className="relative animate-floating-phone" style={{ perspective: '2000px' }}>
      <div className="relative" style={{
        width: '280px',
        height: '580px',
        background: '#0a0a0a',
        border: '10px solid #3d3d3d',
        borderRadius: '50px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px #555, inset 0 0 20px rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="absolute inset-[1px] rounded-[42px] border border-white/20 pointer-events-none z-[70]"></div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-[80] flex items-center justify-end px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 blur-[1px]"></div>
        </div>
        <div className="w-full h-full p-4 flex flex-col relative bg-gradient-to-br from-[#3d0a0a] via-[#1a0505] to-[#0a0a0a] z-50 overflow-hidden">
          {/* Header */}
          <div className="text-center pt-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-gold/40 to-transparent border border-luxury-gold/30 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <Brain size={20} className="text-luxury-gold" />
            </div>
            <p className="text-[7px] font-black text-luxury-gold uppercase tracking-[0.3em] mb-0.5">Neural Core V6</p>
            <p className="text-sm font-serif font-black text-white">LONGRISE</p>
          </div>

          {/* Live Earnings Display */}
          <div className="mt-3 text-center px-2">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Live Earnings</p>
            <p className="text-lg font-mono font-black text-green-400 mt-1">
              ${(totalEarnings).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <div className="h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <motion.div
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-green-500/30 via-green-400 to-transparent"
              />
            </div>
          </div>

          {/* Live Trade Stream */}
          <div className="flex-1 mt-3 overflow-hidden">
            <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Live Trades</p>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence>
                {trades.map((trade, idx) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`text-[8px] px-2.5 py-1.5 rounded-lg border backdrop-blur-sm ${
                      trade.type === 'BUY'
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-black uppercase">{trade.type}</p>
                        <p className="text-gray-400 text-[7px]">{trade.pair}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">{trade.amount}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1.5 mt-3">
            <div className="flex justify-between items-center text-[8px]">
              <span className="text-gray-500 font-black uppercase">Status</span>
              <span className="text-green-400 font-black flex items-center gap-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                ACTIVE
              </span>
            </div>
          </div>

          {/* Button */}
          <button className="w-full mt-2 py-2.5 bg-luxury-gold text-black text-[9px] font-black rounded-lg shadow-[0_8px_16px_rgba(234,179,8,0.3)] uppercase tracking-widest active:scale-95 transition-transform">
            TERMINAL
          </button>

          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const HeroSection = ({ onStartClick, onAboutClick }: { onStartClick: () => void, onAboutClick: () => void }) => (
  <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-12 lg:pt-20">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(128,0,0,0.3)_0%,_transparent_70%)]"></div>
      <NetworkOverlay isHero={true} intensity={0.4} speed={0.3} />
    </div>

    <div className="relative z-10 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 gap-8 items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-7xl lg:text-[100px] font-serif font-black text-white mb-8 leading-[1.1] tracking-tighter">
            AI-Powered <br className="hidden lg:block" /> <span className="gold-gradient-text italic">Passive Income</span>
          </h1>
          
          <p className="text-lg lg:text-2xl text-gray-400 max-w-3xl mb-12 leading-relaxed font-light mx-auto px-4">
            Wealth Starts Automatically<br />
            24/7 Automated Trading & Rewards Platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onStartClick} className="px-12 py-5 bg-gradient-to-r from-luxury-gold via-yellow-400 to-yellow-300 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_15px_40px_rgba(234,179,8,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-[0_10px_30px_rgba(234,179,8,0.4)]">
              <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
              JOIN THE EMPIRE
            </button>
            <button 
              onClick={onAboutClick}
              className="px-12 py-5 rounded-xl border border-luxury-gold/30 bg-luxury-gold/5 text-luxury-gold/90 text-xs font-black uppercase tracking-widest hover:bg-luxury-gold/10 hover:border-luxury-gold/60 hover:text-luxury-gold transition-all flex items-center justify-center gap-3 group backdrop-blur-sm"
            >
              WHAT IS LONGRISE AI?
              <Star size={18} className="text-luxury-gold group-hover:rotate-90 transition-transform opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3 lg:gap-10 mt-12 lg:mt-16 pb-12">
        <MetricCard title="AUM" value={142} suffix="M+" delay={0.2} />
        <MetricCard title="GLOBAL" value={840} suffix="K+" delay={0.4} />
        <MetricCard title="PROFIT" value={236} suffix="%" delay={0.6} />
      </div>
    </div>
  </section>
);

export const TechnologyStorySection = () => (
  <section id="tech-story" className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(107,15,15,0.4)_0%,_transparent_70%)] opacity-30"></div>
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent"></div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-3 text-luxury-gold mb-8">
            <div className="w-12 h-px bg-luxury-gold/30"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Exchange Integration</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-10 leading-tight">
            <span className="whitespace-nowrap">Neural Adaptation to</span> <br/>
            <span className="gold-gradient-text italic">Global Liquidity.</span>
          </h2>
          
          <div className="space-y-8">
            <div className="group border-l-2 border-white/5 hover:border-luxury-gold transition-colors pl-8 py-2">
              <h4 className="text-xl font-serif font-black text-white mb-3 group-hover:text-luxury-gold transition-colors">Massive Exchange Synchronization</h4>
              <p className="text-gray-400 font-light leading-relaxed">
                Direct neural synchronization with <span className="text-white font-bold">Binance, Coinbase, KuCoin, and Coincheck</span>. Every tick across global order books is ingested, processed, and mastered in milliseconds.
              </p>
            </div>
            
            <div className="group border-l-2 border-white/5 hover:border-luxury-gold transition-colors pl-8 py-2">
              <h4 className="text-xl font-serif font-black text-white mb-3 group-hover:text-luxury-gold transition-colors">Tactical Pattern Recognition</h4>
              <p className="text-gray-400 font-light leading-relaxed">
                Our V6 Core architecture continuously evolves by learning micro-pattern anomalies across disparate exchanges, identifying arbitrage and directional trend shifts before they manifest in market price.
              </p>
            </div>
            
            <div className="group border-l-2 border-white/5 hover:border-luxury-gold transition-colors pl-8 py-2">
              <h4 className="text-xl font-serif font-black text-white mb-3 group-hover:text-luxury-gold transition-colors">Precision Execution Logic</h4>
              <p className="text-gray-400 font-light leading-relaxed">
                Once a probabilistic edge is identified, the system deploys capital with institutional-grade risk management filters, ensuring maximum yield integrity while preserving capital sovereignty.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 800, opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: "linear" }}
                className="absolute h-px w-64 bg-gradient-to-r from-transparent via-luxury-gold to-transparent"
                style={{ top: `${15 + i * 15}%`, transform: 'rotate(-5deg)' }}
              />
            ))}
          </div>
          
          <div className="relative z-10 scale-110">
            <div className="absolute inset-0 bg-luxury-gold/5 blur-[120px] rounded-full"></div>
            <PhoneMockup />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export const AITechnologySection = () => {
  const technologies = [
    { title: 'Neural AI Trading', desc: 'Learns market patterns through neural networks, generating real-time trading signals unlike conventional algorithms.' },
    { title: 'High-Frequency Execution', desc: 'Ultra-low latency trading execution at microsecond speeds to capture optimal entry and exit points.' },
    { title: 'Risk Management System', desc: 'Aims for consistent profitability through automated stop-loss limits and position management.' },
    { title: 'Real-time Analytics', desc: '24/7 market analysis dashboard for transparent monitoring of all trading activities.' },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif font-black gold-gradient-text mb-6">LONGRISE AI Technology Stack</h2>
        <div className="h-1 w-32 bg-gradient-to-r from-luxury-gold to-red-600 rounded-full mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-[400px] aspect-square flex items-center justify-center"
          >
            <div className="absolute w-64 h-64 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute w-full h-full border-2 border-dashed border-luxury-gold/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute w-4/5 h-4/5 border border-dotted border-luxury-gold/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            
            <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-luxury-red-light to-luxury-red-dark border-4 border-luxury-gold rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)]">
              <div className="absolute inset-0 rounded-full bg-luxury-gold/20 animate-ping"></div>
              <Brain size={80} className="text-luxury-gold drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 order-1 lg:order-2">
          {technologies.map((tech, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-luxury-gold/10 to-luxury-red/10 border border-luxury-gold/30 hover:border-luxury-gold/60 transition-all hover:shadow-lg hover:shadow-luxury-gold/10"
            >
              <h3 className="text-xl font-black text-luxury-gold mb-3">{tech.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HomePage = ({ onLoginClick, onSelectPackage, onAboutClick }: { onLoginClick: () => void, onSelectPackage: (p: string) => void, onAboutClick: () => void }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number, text: string, sender: 'user' | 'ai' }[]>([
    { id: 1, text: 'Hello! How can we help you today? 👋', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response after 1 second
    setTimeout(() => {
      const aiResponses = [
        'Thank you for your message! Our support team will review this shortly.',
        'I understand. Can you provide more details about your issue?',
        'We appreciate your feedback. This will help us improve our service.',
        'Your ticket has been recorded. You\'ll receive a response within 24 hours.',
        'Is there anything else we can help you with?',
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { id: Date.now(), text: randomResponse, sender: 'ai' }]);
    }, 1000);
  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HeroSection onStartClick={onLoginClick} onAboutClick={onAboutClick} />

      {/* Core Terminal Area - Moved Up for Mobile Speed */}
      <PackageSection onSelect={onSelectPackage} />

      {/* Collapsible/Hidden on Mobile for Performance and Speed */}
      <div className="hidden lg:block lg:pb-12">
        <TechnologyStorySection />
        <AITechnologySection />
      </div>

      {/* Floating Action Buttons - Bottom Right Corner */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        {/* Customer Support */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-rose-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_30px_rgba(220,38,38,0.6)] transition-all duration-300 group"
          onClick={() => setIsSupportOpen(true)}
          title="Customer Support"
        >
          <Headphones size={24} className="group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Telegram */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_30px_rgba(249,115,22,0.6)] transition-all duration-300 group"
          onClick={() => window.open('https://t.me/longrise_ai', '_blank')}
          title="Telegram Community"
        >
          <Send size={24} className="group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Guide */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 via-orange-500 to-red-400 flex items-center justify-center text-white shadow-[0_8px_20px_rgba(217,119,6,0.5)] hover:shadow-[0_12px_30px_rgba(217,119,6,0.6)] transition-all duration-300 group"
          onClick={() => onAboutClick()}
          title="View Guide"
        >
          <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Customer Support Modal */}
      <AnimatePresence>
        {isSupportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupportOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-8 w-80 bg-gradient-to-br from-[#1a0505] to-[#0a0a0a] border border-luxury-gold/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-[101] flex flex-col h-96"
            >
              {/* Header */}
              <div className="p-4 border-b border-luxury-gold/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-luxury-gold/20 rounded-lg flex items-center justify-center">
                    <Headphones size={20} className="text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm">Customer Support</h3>
                    <p className="text-gray-400 text-xs">AI Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSupportOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XIcon size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-luxury-gold to-yellow-400 text-black font-semibold'
                          : 'bg-white/10 text-gray-300 border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-luxury-gold/20 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold/50 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-luxury-gold to-yellow-400 text-black rounded-lg font-black hover:shadow-lg transition-all"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

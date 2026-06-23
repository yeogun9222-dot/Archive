import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Database, 
  TrendingUp, 
  Target, 
  ShieldAlert,
  Crown,
  Power,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Page Components ---
import { AICoreAnimation } from './AICoreAnimation';

import { VIPEntranceModal } from './VIPEntranceModal';

export const CryptoAIPage = ({ onUpgrade }: { onUpgrade?: () => void }) => {
    const [showModal, setShowModal] = useState(false);
    const [metrics, setMetrics] = useState({ daily: 1.25, cnyt: 200.42, roi: 23.54, winRate: 98.86 });
    const [jitterValue, setJitterValue] = useState(700);
    const [isPulsing, setIsPulsing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Irregular heartbeat logic
    const triggerHertzEffect = useCallback(() => {
        setIsPulsing(true);
        setTimeout(() => {
            setIsPulsing(false);
            const nextInterval = Math.random() * 4000 + 2000;
            setTimeout(triggerHertzEffect, nextInterval);
        }, 1200);
    }, []);

    useEffect(() => {
        triggerHertzEffect();

        // Real-time data updates and log generation
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                daily: +(prev.daily + Math.random() * 0.0001).toFixed(2),
                cnyt: +(prev.cnyt + Math.random() * 0.01).toFixed(2),
                roi: +(prev.roi + 0.0001).toFixed(2)
            }));
            
            const noise = (Math.random() * 0.008).toFixed(2);
            setJitterValue(700 + parseFloat(noise));

            const actions = ["QUANT_EXE", "HFT_BETS", "API_SYNC", "DB_UPDATE"];
            const newLog = `[${new Date().toLocaleTimeString()}] ${actions[Math.floor(Math.random() * 4)]} :: STABLE`;
            setLogs(prev => [newLog, ...prev].slice(0, 5));
        }, 3000);

        return () => clearInterval(interval);
    }, [triggerHertzEffect]);

    return (
        <div className={cn("relative min-h-screen flex flex-col items-center p-8 lg:p-16 pt-24 lg:pt-32 overflow-hidden", isPulsing ? 'is-beating' : '')}>
            
            {/* Main Split Layout: Left(Core) - Right(Asset) */}
            <div className="relative z-10 w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-0 mt-12">
                {/* Right: Dynamic Asset Display (Ordered first on mobile) */}
                <div className="flex flex-col items-center lg:items-start order-1 lg:order-2 space-y-8">
                    <div className="space-y-1 w-full flex flex-col items-center lg:items-start">
                        <span className="text-xs font-black tracking-[0.8em] text-red-500 uppercase block">Liquidity Engagement Portfolio</span>
                        <div className="flex items-baseline gap-4 mt-2">
                            <h1 className="text-[70px] sm:text-[100px] lg:text-[140px] font-black leading-none asset-number tracking-tighter text-white">
                                {jitterValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </h1>
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/30">USDT</span>
                        </div>
                        <div className="w-24 h-2 bg-gradient-to-r from-red-600 to-transparent rounded-full shadow-[0_0_30px_#ff0000] mb-6"></div>
                    </div>

                    {/* Metrics Section: Now integrated directly under asset display */}
                    <div className="w-full grid grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { label: 'Profit', value: `$${metrics.daily.toFixed(2)}`, icon: Zap },
                            { label: 'CNYT', value: metrics.cnyt.toFixed(1), icon: Database },
                            { label: 'ROI', value: `${metrics.roi.toFixed(1)}%`, icon: TrendingUp },
                            { label: 'Win', value: `${metrics.winRate}%`, icon: Target }
                        ].map((item, idx) => (
                            <div key={idx} className="aspect-square luxury-card-quantum p-2 flex flex-col items-center justify-center group border border-red-600/30 bg-gradient-to-br from-white/10 via-white/[0.02] to-black/40 backdrop-blur-2xl relative overflow-hidden transition-all duration-500 hover:border-red-500 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,0,0,0.3),inset_0_1px_10px_rgba(255,255,255,0.05)]">
                                {/* Glossy Overlay Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none"></div>
                                {/* Top-Left Highlight */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                
                                <span className="text-[12px] sm:text-[14px] font-black uppercase tracking-widest mb-1 bg-gradient-to-b from-[#BF953F] via-white to-[#B38728] bg-clip-text text-transparent group-hover:brightness-150 transition-all drop-shadow-sm">{item.label}</span>
                                <span className="text-[15px] sm:text-[26px] text-white tracking-tighter font-black drop-shadow-md group-hover:scale-110 transition-transform">{item.value}</span>
                                
                                {/* Bottom Accent Line */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-red-600 transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Short System Log for Credibility - Now positioned under metrics */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-mono text-red-600 font-bold uppercase tracking-widest">Real-time Pulse Feed</span>
                            <span className="text-[8px] font-mono text-gray-600">NODE: JP_TYO_04</span>
                        </div>
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className={cn("text-[10px] font-mono flex justify-between", i === 0 ? 'text-gray-300' : 'text-gray-700')}>
                                    <span>{log}</span>
                                    {i === 0 && <span className="animate-pulse">●</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Left: Advanced AI Quantum Core (Ordered second on mobile) */}
                <div className="flex justify-center relative scale-100 order-2 lg:order-1 h-[400px] sm:h-[500px] lg:h-[550px] w-full">
                    <AICoreAnimation />
                </div>
            </div>

            {/* Action Console */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col sm:flex-row gap-6 justify-center px-4 mt-8">
                <motion.button 
                    onClick={onUpgrade}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(245,175,25,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-[#f12711] to-[#f5af19] p-[2px] rounded-2xl shadow-[0_20px_50px_rgba(241,39,17,0.3)]"
                >
                    <div className="bg-black/90 group-hover:bg-transparent transition-colors duration-300 w-full h-full rounded-[14px] py-6 px-8 flex items-center justify-center gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-white/20">
                            <Crown className="text-[#f5af19] group-hover:text-black" size={24} />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] font-black text-[#f5af19] group-hover:text-black/60 uppercase tracking-widest leading-none mb-1">Elite Potential</span>
                            <span className="block text-lg font-black text-white group-hover:text-black tracking-tighter uppercase leading-none">Upgrade Package</span>
                        </div>
                        <ChevronRight className="ml-auto text-[#f5af19] group-hover:text-black" size={20} />
                    </div>
                </motion.button>

                <motion.button 
                    onClick={() => setShowModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 group relative bg-black/40 border-2 border-red-900/50 hover:border-red-600 transition-all duration-300 rounded-2xl py-6 px-8 flex items-center justify-center gap-4 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors"></div>
                    <div className="p-2 bg-red-600/10 rounded-lg">
                        <Power className="text-red-500" size={24} />
                    </div>
                    <div className="text-left relative z-10">
                        <span className="block text-[10px] font-black text-red-900 uppercase tracking-widest leading-none mb-1">Critical Action</span>
                        <span className="block text-lg font-black text-gray-400 group-hover:text-red-500 tracking-tighter uppercase leading-none transition-colors">Terminate Engagement</span>
                    </div>
                </motion.button>
            </div>

            {/* Footer HUD */}
            <footer className="mt-28 py-10 text-center opacity-30 border-t border-white/5 w-full">
            </footer>

            {/* Security Protocol Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg luxury-card-quantum p-16 border-2 border-red-600 bg-[#300] space-y-12 shadow-[0_0_100px_rgba(255,0,0,0.4)]" style={{borderRadius: '1rem'}}>
                        <div className="text-center">
                            <div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <ShieldAlert size={48} className="text-red-500 animate-pulse" />
                            </div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter italic">Security Protocol</h3>
                            <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">ID: TERMINATION_LIQUIDITY_PENALTY</span>
                        </div>
                        <div className="space-y-6">
                            <div className="p-10 bg-black/30 rounded-2xl border border-white/10 font-mono">
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-white/5 pb-3">
                                        <span className="text-white/40">0 - 6 Months</span>
                                        <span className="font-black text-red-500">30% CAPITAL LOSS</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-3">
                                        <span className="text-white/40">7 - 9 Months</span>
                                        <span className="font-black text-red-500">20% CAPITAL LOSS</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/40">10 - 11 Months</span>
                                        <span className="font-black text-red-500">15% CAPITAL LOSS</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-bold text-center px-6">
                                Critical Warning: Immediate termination will disconnect your node from the HFT pool. All future daily dividends and CNYT rewards will be permanently forfeited.
                            </p>
                        </div>
                        <div className="flex gap-6 w-full">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-6 bg-white/5 rounded-full font-black text-xs tracking-widest text-gray-500 hover:text-white transition-all uppercase">Abort</button>
                            <button className="flex-1 py-6 bg-red-600 rounded-full font-black text-xs tracking-widest text-white hover:bg-red-500 transition-all shadow-2xl uppercase">Confirm Exit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

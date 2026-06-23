import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ChevronRight, 
  Info, 
  Cpu, 
  Zap, 
  Calendar,
  Gift,
  ArrowRight
} from 'lucide-react';

const newsItems = [
  {
    id: 1,
    category: 'PROMOTION',
    isNew: true,
    date: '2026.03.23',
    title: 'Quantum Node Upgrade Special: +0.2% Daily ROI Bonus',
    desc: 'We are excited to announce a limited-time upgrade to our neural nodes...',
    icon: Gift,
    iconBg: 'bg-red-900/30 text-red-500'
  },
  {
    id: 2,
    category: 'SYSTEM',
    isNew: false,
    date: '2026.03.20',
    title: 'LONGRISE V6.0 Neural Server Maintenance Complete',
    desc: 'The scheduled maintenance for our global server network has been successfully completed...',
    icon: Info,
    iconBg: 'bg-white/5 text-gray-400'
  },
  {
    id: 3,
    category: 'UPDATE',
    isNew: false,
    date: '2026.03.15',
    title: 'New High-Frequency Arbitrage Algorithm Deployed',
    desc: 'Version 6.2 of our core trading algorithm is now live across all nodes...',
    icon: Cpu,
    iconBg: 'bg-blue-900/30 text-blue-500'
  },
  {
    id: 4,
    category: 'SYSTEM',
    isNew: false,
    date: '2026.03.01',
    title: 'Scheduled Global Network Inspection Notice',
    desc: 'To ensure maximum uptime and security, we will perform a routine inspection...',
    icon: Info,
    iconBg: 'bg-white/5 text-gray-400'
  }
];

export const NoticesPage = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'SYSTEM', 'UPDATE', 'PROMOTION'];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-4"
        >
          <span className="text-[10px] font-black text-luxury-gold tracking-[0.6em] uppercase">NEWS & UPDATES</span>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">
            Official Announcements
          </h1>
          <div className="flex items-center justify-center">
             <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent rounded-full opacity-50"></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-8">
          {/* Categories Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 space-y-8"
          >
            <div className="space-y-2">
               <h3 className="text-[11px] font-black text-white tracking-[0.4em] uppercase opacity-70">CATEGORIES</h3>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${
                    activeCategory === cat 
                      ? 'bg-luxury-gold text-black shadow-lg shadow-luxury-gold/20' 
                      : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                  <ChevronRight size={14} className={activeCategory === cat ? 'text-black' : 'text-gray-700'} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Search Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6"
          >
             <h3 className="text-[11px] font-black text-white tracking-[0.4em] uppercase opacity-70">SEARCH</h3>
             <div className="relative group">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-luxury-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search news..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-14 py-4 text-[10px] text-white font-bold focus:outline-none focus:border-luxury-gold/30 transition-all placeholder:text-gray-800"
                />
             </div>
          </motion.div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {newsItems.map((item, i) => (
            <motion.div 
               key={item.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="group glass-panel p-8 lg:p-10 rounded-2xl border border-white/5 hover:border-luxury-gold/20 transition-all relative overflow-hidden"
            >
               <div className="flex items-center gap-8 lg:gap-12 relative z-10">
                  {/* Left Icon Container */}
                  <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform`}>
                     <item.icon size={28} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-2 ${
                            item.category === 'PROMOTION' ? 'bg-red-500/20 text-red-500' : 
                            item.category === 'SYSTEM' ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                           {item.category === 'PROMOTION' && <Zap size={10} />}
                           {item.category}
                        </span>
                        {item.isNew && (
                           <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-[8px] font-black tracking-widest uppercase">NEW</span>
                        )}
                        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold tracking-widest uppercase ml-auto lg:ml-0">
                           <Calendar size={12} /> {item.date}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <h2 className="text-xl lg:text-2xl font-black text-white group-hover:text-luxury-gold transition-colors tracking-tight">
                           {item.title}
                        </h2>
                        <p className="text-[10px] lg:text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-1">
                           {item.desc}
                        </p>
                     </div>
                  </div>

                  {/* Right Arrow Button */}
                  <div className="shrink-0 hidden sm:block">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-700 group-hover:bg-luxury-gold/10 group-hover:text-luxury-gold transition-all border border-transparent group-hover:border-luxury-gold/20">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

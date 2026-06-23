import { motion } from 'motion/react';
import { Settings, User, Bell, Globe, Moon, Shield, Eye, Database, Smartphone, Info, ChevronRight, LogOut } from 'lucide-react';

export const PlatformSettingsPage = () => {
  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 space-y-10 max-w-5xl mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-luxury-gold">
          <Settings size={20} />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Technical Configuration</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-serif font-black text-white">PLATFORM <span className="gold-gradient-text">SETTINGS</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {[
            { label: 'General', icon: Settings, active: true },
            { label: 'Security', icon: Shield, active: false },
            { label: 'Privacy', icon: Eye, active: false },
            { label: 'Data & Storage', icon: Database, active: false },
            { label: 'Mobile Sync', icon: Smartphone, active: false },
            { label: 'About', icon: Info, active: false },
          ].map(item => (
            <button key={item.label} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              item.active ? 'bg-luxury-gold text-black font-black' : 'text-gray-400 hover:bg-white/5'
            }`}>
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </div>
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="h-px bg-white/5 my-4" />
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold">
            <LogOut size={20} />
            <span className="text-sm">Sign Out Everywhere</span>
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl space-y-10">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Appearance & Localization</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <Moon size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold">Midnight Mode</p>
                      <p className="text-[10px] text-gray-500">Enable ultra-dark luxury theme</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-luxury-gold rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <Globe size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold">Display Language</p>
                      <p className="text-[10px] text-gray-500">Currently: English (US)</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-luxury-gold tracking-widest uppercase">CHANGE</button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Advanced Engine Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Haptic Feedback', desc: 'Vibrate on trade confirmation', active: true },
                  { label: 'Profit Overlay', desc: 'Show daily ROI in status bar', active: true },
                  { label: 'Low Latency Mode', desc: 'Bypass animation caching', active: false },
                ].map(opt => (
                  <div key={opt.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-[10px] text-gray-500">{opt.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative ${opt.active ? 'bg-luxury-gold' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${opt.active ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

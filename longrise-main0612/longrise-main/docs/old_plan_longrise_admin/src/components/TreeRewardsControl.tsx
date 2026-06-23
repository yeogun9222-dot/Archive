import { useState } from 'react';
import { Palette, Image as ImageIcon, Sparkles, Move, RefreshCw, Layers, ShieldCheck, CheckCircle2, Sliders, Play, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function TreeRewardsControl() {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'animation' | 'assets'>('design');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Tree 페이지 모션 및 디자인 설정이 클라우드에 배포되었습니다.');
    }, 1500);
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-accent-amber/20 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3.5 bg-accent-amber/10 border border-accent-amber/20 rounded-2xl text-accent-amber shadow-lg shadow-accent-amber/5">
                <Palette size={28} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">트리 페이지 디자인 엔진 (Tree UX Designer)</h3>
                <p className="text-[11px] text-accent-amber font-bold uppercase tracking-widest mt-1 opacity-80 flex items-center gap-1.5">
                   <Sparkles size={14} /> 조직 계보 페이지 전용 비주얼 효과 및 드래곤 에셋 관리
                </p>
             </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="btn-gold py-3 px-8 rounded-xl text-[12px] uppercase tracking-wider transition-all h-[46px] shadow-lg shadow-accent-amber/10"
          >
            Publish Visual Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Settings Panel */}
        <div className="xl:col-span-4 space-y-6">
          <div className="dashboard-card p-0 overflow-hidden border-white/5 bg-[#1e293b]/50">
            <div className="flex border-b border-white/5">
              {(['design', 'animation', 'assets'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
                    activeTab === tab ? "border-accent-amber text-white bg-white/5" : "border-transparent text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8 space-y-6">
              {activeTab === 'design' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Node Theme Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['#f59e0b', '#ef4444', '#a855f7', '#3b82f6'].map(color => (
                        <button key={color} className="h-10 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Connection Line Style</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
                      <option>Solid Gradient (Gold)</option>
                      <option>Dashed Cyber Line</option>
                      <option>Glowing Pulse Connection</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Grid Opacity</span>
                       <span className="text-[10px] font-mono text-accent-amber">15%</span>
                    </label>
                    <input type="range" className="w-full accent-accent-amber" min="0" max="100" defaultValue="15" />
                  </div>
                </div>
              )}

              {activeTab === 'animation' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Dragon Floating Effect</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Slow Y-Axis Motion</p>
                    </div>
                    <div className="w-10 h-5 bg-accent-amber rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Entrance Ease</label>
                    <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
                      <option>Spring (Snappy)</option>
                      <option>Smooth Linear</option>
                      <option>Bounce Overflow</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                   <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 hover:border-accent-amber/30 transition-all cursor-pointer bg-black/20 group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-accent-amber group-hover:scale-110 transition-all">
                        <Plus size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Dragon PNG</p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      {[1,2].map(i => (
                        <div key={i} className="aspect-square bg-slate-800 rounded-xl border border-white/5 relative overflow-hidden group">
                           <img src={`https://picsum.photos/seed/dragon${i}/200`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                           <div className="absolute bottom-2 right-2 p-1.5 bg-black/60 rounded-lg text-white pointer-events-none">
                             <CheckCircle2 size={12} className="text-accent-green" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card border-accent-blue/20 bg-accent-blue/[0.03] p-6">
             <div className="flex items-center gap-3 mb-4">
                <Sliders size={18} className="text-accent-blue" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Live Preview HUD</h4>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest opacity-60">
                실제 유저 화면에 적용될 비주얼 레이어들을 리얼타임으로 렌더링하고 에셋을 최적화합니다.
             </p>
          </div>
        </div>

        {/* Right: Live Preview Component */}
        <div className="xl:col-span-8">
           <div className="dashboard-card p-0 overflow-hidden border-white/5 min-h-[500px] flex flex-col bg-slate-950 relative rounded-[2.5rem]">
              <div className="bg-slate-900 border-b border-white/5 px-8 py-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Preview Mode: Normal User</span>
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-black text-accent-amber uppercase tracking-widest">
                    <Play size={14} /> Simulate Animation
                 </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-20 relative">
                 <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                 
                 {/* Dummy Tree Node Preview */}
                 <div className="relative group">
                    {/* Dragon Image Mockup */}
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-48 opacity-40 animate-bounce transition-all duration-[3000ms]" style={{ animationTimingFunction: 'ease-in-out' }}>
                       <img src="https://picsum.photos/seed/dragonv/400" className="w-full h-full object-contain mix-blend-screen" referrerPolicy="no-referrer" />
                    </div>

                    <div className="w-64 p-8 bg-slate-900 border-2 border-accent-amber rounded-3xl shadow-2xl flex flex-col items-center space-y-4">
                       <div className="w-16 h-1 bg-accent-amber/30 rounded-full" />
                       <div className="text-2xl font-black text-white tracking-[0.2em] uppercase">User_Nick</div>
                       <div className="badge-gold">BLACK DRAGON</div>
                       <div className="w-full grid grid-cols-2 gap-4 mt-2">
                          <div className="h-2 bg-white/5 rounded-full" />
                          <div className="h-2 bg-white/5 rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center">
           <div className="bg-[#1e293b] border border-white/10 p-10 rounded-[2rem] flex flex-col items-center space-y-6 shadow-2xl">
              <RefreshCw size={44} className="text-accent-amber animate-spin" />
              <p className="text-lg font-black text-white uppercase tracking-[0.3em] animate-pulse">Pushing Visual updates...</p>
           </div>
        </div>
      )}
    </div>
  );
}

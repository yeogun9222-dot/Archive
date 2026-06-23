import { useState } from 'react';
import { Trophy, Save, RefreshCw, Star, Users, Flag, TrendingUp, Edit3, Plus, Trash2, Quote } from 'lucide-react';
import { cn } from '../lib/utils';

export function HonorHallControl() {
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState({
    mainTitle: 'The Sovereign Hall',
    mainSub: 'THE HIGHEST ACHIEVEMENT',
    topLeaders: [
      { id: 1, name: 'Sovereign_Alpha', rank: 'RED DRAGON SOVEREIGN', country: 'UAE', volume: '9.2M Vol' },
      { id: 2, name: 'Golden_Dragon_One', rank: 'BLACK DRAGON SOVEREIGN', country: 'SOUTH KOREA', volume: '12.5M Vol', isCenter: true },
      { id: 3, name: 'Imperial_Z', rank: 'RED DRAGON SOVEREIGN', country: 'SWITZERLAND', volume: '8.8M Vol' }
    ],
    vanguardTitle: 'Imperial Vanguard',
    vanguardSub: 'EXTENDED LEADERSHIP',
    vanguardLeaders: [
      { id: 101, name: 'PHOENIX_V7', rank: 'RED DRAGON' },
      { id: 102, name: 'RED_STORM', rank: 'RED DRAGON' },
      { id: 103, name: 'DRAGON_HEART', rank: 'RED DRAGON' },
      { id: 104, name: 'VANGUARD_88', rank: 'RED DRAGON' },
      { id: 105, name: 'SOLAR_FLARE', rank: 'RED DRAGON' },
      { id: 106, name: 'CRIMSON_LORD', rank: 'RED DRAGON' },
      { id: 107, name: 'MARS_ALPHA', rank: 'RED DRAGON' },
      { id: 108, name: 'TITAN_SHIELD', rank: 'RED DRAGON' },
      { id: 109, name: 'IRON_WILL', rank: 'RED DRAGON' },
      { id: 110, name: 'ETERNAL_FLAME', rank: 'RED DRAGON' },
      { id: 111, name: 'RED_NEXUS', rank: 'RED DRAGON' },
      { id: 112, name: 'PRIME_LEADER', rank: 'RED DRAGON' }
    ],
    footerQuote: '"Honor is not given, it is architected. These leaders represent the pinnacle of strategic wealth synthesis within the Longrise ecosystem."',
    councilText: 'THE COUNCIL OF SOVEREIGNS'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const updateTopLeader = (index: number, field: string, value: string) => {
    const list = [...content.topLeaders];
    list[index] = { ...list[index], [field]: value };
    setContent({ ...content, topLeaders: list });
  };

  const updateVanguard = (index: number, field: string, value: string) => {
    const list = [...content.vanguardLeaders];
    list[index] = { ...list[index], [field]: value };
    setContent({ ...content, vanguardLeaders: list });
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-accent-amber/20 bg-accent-amber/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent-amber/10 border border-accent-amber/30 rounded-xl text-accent-amber">
                <Trophy size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">명예의 전당 (Wall of Fame) 제어</h3>
                <p className="text-[10px] text-accent-amber font-bold uppercase tracking-widest mt-1">리워드 섹션의 'Honor' 탭에 표시되는 최상위 리더들을 관리합니다.</p>
             </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-gold px-8 py-2.5 flex items-center gap-2 text-[11px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? '서버 적용 중...' : '변경 사항 즉시 반영'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* The Sovereign Hall (Top 3) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="dashboard-card border-accent-amber/20">
            <div className="flex items-center gap-2 mb-8">
              <Star size={18} className="text-accent-amber" />
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">The Sovereign Hall (Top 3 Leaders)</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.topLeaders.map((leader, i) => (
                <div key={leader.id} className={cn(
                  "p-6 rounded-2xl border transition-all relative overflow-hidden",
                  leader.isCenter ? "bg-accent-amber/5 border-accent-amber/30 scale-105 z-10" : "bg-black/40 border-white/5"
                )}>
                  {leader.isCenter && <div className="absolute top-0 inset-x-0 h-1 bg-accent-amber" />}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-text-muted uppercase mb-1 block">Leader Name</label>
                      <input 
                        type="text" 
                        value={leader.name}
                        onChange={(e) => updateTopLeader(i, 'name', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-accent-amber"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-text-muted uppercase mb-1 block">Dragon Rank</label>
                      <input 
                        type="text" 
                        value={leader.rank}
                        onChange={(e) => updateTopLeader(i, 'rank', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-[10px] text-accent-amber font-black outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                       <div>
                          <label className="text-[8px] font-black text-text-muted uppercase mb-1 block">Region</label>
                          <div className="flex items-center gap-1.5 bg-black/20 rounded px-2 py-1 border border-white/5">
                             <Flag size={10} className="text-text-muted" />
                             <input 
                                type="text" 
                                value={leader.country}
                                onChange={(e) => updateTopLeader(i, 'country', e.target.value)}
                                className="bg-transparent text-[10px] text-white outline-none w-full font-bold"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="text-[8px] font-black text-text-muted uppercase mb-1 block">Volume</label>
                          <div className="flex items-center gap-1.5 bg-black/20 rounded px-2 py-1 border border-white/5">
                             <TrendingUp size={10} className="text-accent-green" />
                             <input 
                                type="text" 
                                value={leader.volume}
                                onChange={(e) => updateTopLeader(i, 'volume', e.target.value)}
                                className="bg-transparent text-[10px] text-white outline-none w-full font-mono font-bold"
                             />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imperial Vanguard (Grid) */}
          <div className="dashboard-card">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <Users size={18} className="text-accent-blue" />
                   <h4 className="text-sm font-bold text-white uppercase tracking-tight">Imperial Vanguard (Extended Grid)</h4>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-extrabold text-text-muted transition-all border border-white/10 italic">
                   <Plus size={14} /> ADD LEADER
                </button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {content.vanguardLeaders.map((leader, i) => (
                  <div key={leader.id} className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col items-center text-center space-y-2 group">
                     <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-1 group-hover:bg-red-500/20 transition-all">
                        <TrendingUp size={16} />
                     </div>
                     <input 
                       type="text" 
                       value={leader.name}
                       onChange={(e) => updateVanguard(i, 'name', e.target.value)}
                       className="bg-transparent text-[10px] text-white font-bold text-center border-b border-transparent focus:border-red-500/50 outline-none w-full"
                     />
                     <input 
                       type="text" 
                       value={leader.rank}
                       onChange={(e) => updateVanguard(i, 'rank', e.target.value)}
                       className="bg-transparent text-[8px] text-red-500 font-extrabold text-center outline-none w-full opacity-60"
                     />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Global Settings & Quote */}
        <div className="space-y-6">
           <div className="dashboard-card border-white/5">
              <div className="flex items-center gap-2 mb-6 text-accent-amber">
                 <Edit3 size={18} />
                 <h4 className="text-sm font-bold uppercase tracking-tight">섹션 타이틀 (Headers)</h4>
              </div>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Main Hall Title</label>
                    <input 
                       type="text" 
                       value={content.mainTitle}
                       onChange={(e) => setContent({...content, mainTitle: e.target.value})}
                       className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-2.5 text-lg text-white font-bold outline-none"
                    />
                    <input 
                       type="text" 
                       value={content.mainSub}
                       onChange={(e) => setContent({...content, mainSub: e.target.value})}
                       className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-2 text-[10px] text-accent-amber font-black outline-none"
                    />
                 </div>
                 <div className="space-y-3 pt-6 border-t border-white/5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Vanguard Title</label>
                    <input 
                       type="text" 
                       value={content.vanguardTitle}
                       onChange={(e) => setContent({...content, vanguardTitle: e.target.value})}
                       className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-2.5 text-sm text-white font-bold outline-none"
                    />
                    <input 
                       type="text" 
                       value={content.vanguardSub}
                       onChange={(e) => setContent({...content, vanguardSub: e.target.value})}
                       className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-2 text-[10px] text-text-muted font-black outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="dashboard-card border-white/5 bg-accent-amber/5">
              <div className="flex items-center gap-2 mb-6">
                 <Quote size={18} className="text-accent-amber" />
                 <h4 className="text-sm font-bold text-white uppercase tracking-tight">명예의 전당 철학 (Quote)</h4>
              </div>
              <div className="space-y-4">
                 <textarea 
                    rows={6}
                    value={content.footerQuote}
                    onChange={(e) => setContent({...content, footerQuote: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded-xl px-4 py-4 text-xs text-text-muted italic leading-relaxed outline-none focus:border-accent-amber transition-all"
                 />
                 <input 
                    type="text" 
                    value={content.councilText}
                    onChange={(e) => setContent({...content, councilText: e.target.value})}
                    className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-2 text-[10px] text-accent-amber font-black text-center outline-none"
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

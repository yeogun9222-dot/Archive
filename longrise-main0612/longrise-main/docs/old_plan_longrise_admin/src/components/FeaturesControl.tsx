import { useState } from 'react';
import { Layers, Save, RefreshCw, Smartphone, Edit3, Monitor, Link as LinkIcon, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export function FeaturesControl() {
  const [saving, setSaving] = useState(false);
  
  // Section 3: Neural Adaptation Content
  const [content, setContent] = useState({
    tag: 'GLOBAL EXCHANGE INTEGRATION',
    title: 'Neural Adaptation to Global Liquidity.',
    features: [
      {
        title: 'Massive Exchange Synchronization',
        desc: 'Direct neural synchronization with Binance, Coinbase, KuCoin, and Coincheck. Every tick across global order books is ingested, processed, and mastered in milliseconds.'
      },
      {
        title: 'Tactical Pattern Recognition',
        desc: 'Our V6 Core architecture continuously evolves by learning micro-pattern anomalies across disparate exchanges, identifying arbitrage and directional trend shifts before they manifest in market price.'
      },
      {
        title: 'Precision Execution Logic',
        desc: 'Once a probabilistic edge is identified, the system deploys capital with institutional-grade risk management filters, ensuring maximum yield integrity while preserving capital sovereignty.'
      }
    ],
    mobileStats: '142,500,000',
    buttonText: 'ENTER TERMINAL',
    buttonLink: '/terminal'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const updateFeature = (index: number, field: 'title' | 'desc', value: string) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setContent({ ...content, features: newFeatures });
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <Layers size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">핵심 기능 섹션 (Neural Core) 제어</h3>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">거래소 연동 및 기술적 강점을 설명하는 3번째 섹션을 제어합니다.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Text Content */}
        <div className="space-y-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-6">
              <Edit3 size={18} className="text-accent-blue" />
              <h4 className="text-sm font-bold text-white uppercase">메인 텍스트 (Left Area)</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">섹션 태그 (Section Tag)</label>
                 <input 
                   type="text" 
                   value={content.tag}
                   onChange={(e) => setContent({...content, tag: e.target.value})}
                   className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-xs text-accent-amber font-bold outline-none"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">메인 타이틀 (Headline)</label>
                 <textarea 
                   rows={2}
                   value={content.title}
                   onChange={(e) => setContent({...content, title: e.target.value})}
                   className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-lg text-white font-bold outline-none leading-tight"
                 />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
             <div className="flex items-center gap-2 mb-6">
                <Smartphone size={18} className="text-accent-amber" />
                <h4 className="text-sm font-bold text-white uppercase">모바일 터미널 프리뷰 제어 (Mobile Visual)</h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">상태 수치 (Global Liquidity)</label>
                   <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold font-mono">$</span>
                      <input 
                        type="text" 
                        value={content.mobileStats}
                        onChange={(e) => setContent({...content, mobileStats: e.target.value})}
                        className="w-full bg-black/40 border border-border-main rounded pl-7 pr-4 py-2 text-xs text-white font-mono outline-none"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">버튼 텍스트 (CTA)</label>
                   <input 
                      type="text" 
                      value={content.buttonText}
                      onChange={(e) => setContent({...content, buttonText: e.target.value})}
                      className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-xs text-white font-bold outline-none"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* Feature Blocks */}
        <div className="dashboard-card h-full">
           <div className="flex items-center gap-2 mb-6">
              <Cpu size={18} className="text-accent-green" />
              <h4 className="text-sm font-bold text-white uppercase">기술적 특징 포인트 (3-Points)</h4>
           </div>

           <div className="space-y-6">
             {content.features.map((f, i) => (
               <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 bg-white/5 text-[9px] font-black text-text-muted rounded-bl select-none">
                     POINT 0{i+1}
                  </div>
                  <div>
                     <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 block opacity-60">특징 제목 (Point Title)</label>
                     <input 
                        type="text" 
                        value={f.title}
                        onChange={(e) => updateFeature(i, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 text-xs text-white font-bold pb-1 outline-none focus:border-accent-blue transition-all"
                     />
                  </div>
                  <div>
                     <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 block opacity-60">설명 (Description)</label>
                     <textarea 
                        rows={3}
                        value={f.desc}
                        onChange={(e) => updateFeature(i, 'desc', e.target.value)}
                        className="w-full bg-transparent text-[11px] text-text-muted outline-none leading-relaxed resize-none"
                     />
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

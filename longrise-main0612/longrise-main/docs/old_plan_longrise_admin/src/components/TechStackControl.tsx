import { useState } from 'react';
import { HelpCircle, Save, RefreshCw, Cpu, ShieldCheck, Zap, LineChart, Edit3, Plus, Trash2, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export function TechStackControl() {
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState({
    mainTitle: 'LONGRISE AI Technology Stack',
    stacks: [
      {
        id: 1,
        title: 'Neural AI Trading',
        desc: 'Learns market patterns through neural networks, generating real-time trading signals unlike conventional algorithms.',
        icon: Cpu
      },
      {
        id: 2,
        title: 'High-Frequency Execution',
        desc: 'Ultra-low latency trading execution at microsecond speeds to capture optimal entry and exit points.',
        icon: Zap
      },
      {
        id: 3,
        title: 'Risk Management System',
        desc: 'Aims for consistent profitability through automated stop-loss limits and position management.',
        icon: ShieldCheck
      },
      {
        id: 4,
        title: 'Real-time Analytics',
        desc: '24/7 market analysis dashboard for transparent monitoring of all trading activities.',
        icon: LineChart
      }
    ]
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const updateStack = (id: number, field: string, value: string) => {
    setContent({
      ...content,
      stacks: content.stacks.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-accent-amber/20 bg-accent-amber/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent-amber/10 border border-accent-amber/30 rounded-xl text-accent-amber">
                <HelpCircle size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">플랫폼 기술 스택 (Tech Stack) 제어</h3>
                <p className="text-[10px] text-accent-amber font-bold uppercase tracking-widest mt-1">메인 페이지의 4번째 섹션인 인공지능 기술 스택 및 강점을 관리합니다.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dashboard-card border-white/5">
             <div className="flex items-center gap-2 mb-6">
                <Edit3 size={18} className="text-accent-blue" />
                <h4 className="text-sm font-bold text-white uppercase">섹션 타이틀 제어</h4>
             </div>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">전체 제목 (Main Title)</label>
                   <textarea 
                     rows={2}
                     value={content.mainTitle}
                     onChange={(e) => setContent({...content, mainTitle: e.target.value})}
                     className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-3 text-lg text-white font-bold outline-none focus:border-accent-blue transition-all"
                   />
                </div>
                <div className="p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-lg">
                   <p className="text-[10px] text-accent-amber font-bold leading-relaxed">
                      * 타이틀 아래의 그라데이션 라인은 UI 디자인에 따라 자동으로 렌더링됩니다.
                   </p>
                </div>
             </div>
          </div>

          <div className="dashboard-card border-white/5">
             <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">비주얼 프리뷰 (Visuals)</h4>
             <div className="aspect-square bg-black/40 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-amber/10 to-transparent opacity-50" />
                <div className="w-32 h-32 rounded-full bg-accent-amber/10 border-2 border-accent-amber/30 flex items-center justify-center text-accent-amber animate-pulse">
                   <Cpu size={64} />
                </div>
                <div className="absolute bottom-4 text-[9px] text-text-muted font-black uppercase tracking-tighter">
                   Central Neural Brain Animation Active
                </div>
             </div>
          </div>
        </div>

        {/* Tech Cards Editor */}
        <div className="lg:col-span-2">
           <div className="dashboard-card border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <Layers size={18} className="text-accent-green" />
                    <h4 className="text-sm font-bold text-white uppercase">기술 스택 카드 (Tech Cards)</h4>
                 </div>
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold text-text-primary transition-all border border-white/10">
                    <Plus size={14} /> 카드 추가
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {content.stacks.map((s, i) => (
                   <div key={s.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 flex gap-6 group hover:border-white/10 transition-all">
                      <div className="w-12 h-12 shrink-0 bg-accent-amber/10 border border-accent-amber/30 rounded-xl flex items-center justify-center text-accent-amber">
                         <s.icon size={24} />
                      </div>
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between gap-4">
                            <input 
                              type="text" 
                              value={s.title}
                              onChange={(e) => updateStack(s.id, 'title', e.target.value)}
                              className="bg-transparent text-sm font-bold text-white focus:outline-none w-full border-b border-transparent focus:border-accent-amber pb-1"
                              placeholder="기술 명칭"
                            />
                            <button className="text-text-muted hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                               <Trash2 size={14} />
                            </button>
                         </div>
                         <textarea 
                           rows={2}
                           value={s.desc}
                           onChange={(e) => updateStack(s.id, 'desc', e.target.value)}
                           className="w-full bg-transparent text-[11px] text-text-muted outline-none leading-relaxed resize-none focus:text-white transition-colors"
                           placeholder="기술에 대한 상세 설명을 입력하세요."
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

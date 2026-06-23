import { useState } from 'react';
import { Type, BarChart3, Users, Percent, Link as LinkIcon, RefreshCw, Save, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

export function LandingPageControl() {
  const [heroTitle, setHeroTitle] = useState('Profit Sovereignty.');
  const [heroSub, setHeroSub] = useState('Mastering global markets through Neural AI dominance. Simple, Secure, and Automated.');
  
  const [stats, setStats] = useState({
    aum: { value: 142, label: 'M+', suffix: 'USDT', auto: false },
    global: { value: 840, label: 'K+', suffix: 'Users', auto: false },
    profit: { value: 236, label: '%', suffix: 'ROI', auto: false }
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* CMS Header */}
      <div className="dashboard-card border-accent-amber/20 bg-accent-amber/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent-amber/10 border border-accent-amber/30 rounded-xl text-accent-amber">
                <Type size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">메인 랜딩 페이지 CMS 마스터</h3>
                <p className="text-[10px] text-accent-amber font-bold uppercase tracking-widest mt-1">사용자가 보는 첫 화면의 모든 수치와 문구를 실시간 제어합니다.</p>
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
        {/* Text Control */}
        <div className="dashboard-card space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <Type size={18} className="text-accent-blue" />
              <h4 className="text-sm font-bold text-white uppercase">히어로 섹션 문구 제어 (Hero Text)</h4>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">메인 타이틀 (Main Title)</label>
                 <input 
                   type="text" 
                   value={heroTitle}
                   onChange={(e) => setHeroTitle(e.target.value)}
                   className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-3 text-sm text-white focus:border-accent-blue focus:outline-none transition-all font-bold"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">서브 디스크립션 (Sub Description)</label>
                 <textarea 
                   rows={3}
                   value={heroSub}
                   onChange={(e) => setHeroSub(e.target.value)}
                   className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-3 text-sm text-text-muted focus:border-accent-blue focus:outline-none transition-all leading-relaxed"
                 />
              </div>
           </div>
        </div>

        {/* Action Button Control */}
        <div className="dashboard-card space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={18} className="text-purple-400" />
              <h4 className="text-sm font-bold text-white uppercase">CTA 버튼 및 외부 링크 (Call to Action)</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-accent-amber uppercase underline">Primary Button</span>
                    <Eye size={12} className="text-accent-amber opacity-50" />
                 </div>
                 <input type="text" defaultValue="JOIN THE EMPIRE" className="w-full bg-transparent border-b border-white/10 text-[11px] text-white font-bold pb-1 outline-none" />
                 <input type="text" defaultValue="https://longrise.ai/register" className="w-full bg-transparent text-[9px] text-text-muted font-mono outline-none" />
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Secondary Button</span>
                    <Eye size={12} className="text-slate-500 opacity-50" />
                 </div>
                 <input type="text" defaultValue="WHAT IS LONGRISE AI?" className="w-full bg-transparent border-b border-white/10 text-[11px] text-white font-bold pb-1 outline-none" />
                 <input type="text" defaultValue="https://longrise.ai/info" className="w-full bg-transparent text-[9px] text-text-muted font-mono outline-none" />
              </div>
           </div>
        </div>
      </div>

      {/* Stats Manipulation - THE BIG THREE */}
      <div className="dashboard-card">
         <div className="flex items-center gap-2 mb-8">
            <BarChart3 size={18} className="text-accent-green" />
            <h4 className="text-sm font-bold text-white uppercase">메인 수치 데이터 조작 레이어 (Stats Manipulation)</h4>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatEditor 
              label="AUM (자산 운용 규모)" 
              color="text-red-500" 
              icon={BarChart3}
              data={stats.aum} 
              onUpdate={(v) => setStats({...stats, aum: {...stats.aum, ...v}})}
            />
            <StatEditor 
              label="GLOBAL (글로벌 노드/유저)" 
              color="text-red-500" 
              icon={Users}
              data={stats.global} 
              onUpdate={(v) => setStats({...stats, global: {...stats.global, ...v}})}
            />
            <StatEditor 
              label="PROFIT (누적 수익률)" 
              color="text-red-500" 
              icon={Percent}
              data={stats.profit} 
              onUpdate={(v) => setStats({...stats, profit: {...stats.profit, ...v}})}
            />
         </div>
      </div>
    </div>
  );
}

function StatEditor({ label, color, icon: Icon, data, onUpdate }: any) {
  return (
    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <Icon size={16} className={color} />
             <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-text-muted uppercase">자동 연동</span>
             <button 
                onClick={() => onUpdate({ auto: !data.auto })}
                className={cn(
                   "w-8 h-4 rounded-full relative transition-all duration-300",
                   data.auto ? "bg-accent-green" : "bg-slate-700"
                )}
             >
                <div className={cn("absolute top-1 w-2 h-2 bg-white rounded-full transition-all", data.auto ? "right-1" : "left-1")} />
             </button>
          </div>
       </div>

       <div className="flex items-baseline gap-2">
          <input 
            type="number" 
            value={data.value}
            disabled={data.auto}
            onChange={(e) => onUpdate({ value: parseInt(e.target.value) })}
            className={cn(
               "bg-transparent text-4xl font-black focus:outline-none w-32 tabular-nums",
               data.auto ? "text-slate-500" : "text-white"
            )}
          />
          <span className="text-xl font-bold text-slate-500">{data.label}</span>
       </div>
       
       {data.auto && (
         <div className="mt-4 p-2 bg-accent-green/5 border border-accent-green/20 rounded text-[9px] text-accent-green font-bold uppercase text-center animate-pulse">
            실시간 DB 합계값 자동 반영 중
         </div>
       )}
       {!data.auto && (
         <div className="mt-4 p-2 bg-red-500/5 border border-red-500/20 rounded text-[9px] text-red-500 font-bold uppercase text-center">
            관리자 수동 조작 모드 (고정값 출력)
         </div>
       )}
    </div>
  );
}

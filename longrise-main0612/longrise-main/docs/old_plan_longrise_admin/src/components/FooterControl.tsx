import { useState } from 'react';
import { Info, Save, RefreshCw, Type, Link as LinkIcon, Copyright, ShieldCheck, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function FooterControl() {
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState({
    brandDescription: "The world's first AI-driven integrated wealth management platform connecting Crypto and Institutional assets with premium financial services.",
    platforms: [
      { label: 'Crypto AI Trading', link: '/trading' },
      { label: 'VIP Packages', link: '/packages' },
      { label: 'Rewards Program', link: '/rewards' }
    ],
    support: [
      { label: 'Help Center', link: '/support' },
      { label: 'Terms of Service', link: '/terms' },
      { label: 'Privacy Policy', link: '/privacy' }
    ],
    copyright: "© 2026 LONGRISE AI. All rights reserved. | V6.0 Master Plan Edition"
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const updateLink = (category: 'platforms' | 'support', index: number, field: 'label' | 'link', value: string) => {
    const list = [...content[category]];
    list[index] = { ...list[index], [field]: value };
    setContent({ ...content, [category]: list });
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Header */}
      <div className="dashboard-card border-slate-500/20 bg-slate-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-500/10 border border-slate-500/30 rounded-xl text-slate-400">
                <Info size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">글로벌 푸터(Footer) 마스터 제어</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">플랫폼 하단 브랜드 정보, 퀵 링크 및 저작권 정보를 제어합니다.</p>
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
        {/* Brand & Description */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dashboard-card h-full">
            <div className="flex items-center gap-2 mb-6">
              <Type size={18} className="text-accent-amber" />
              <h4 className="text-sm font-bold text-white uppercase">브랜드 및 설명 (Primary)</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">플랫폼 소개 문구 (Description)</label>
                 <textarea 
                   rows={6}
                   value={content.brandDescription}
                   onChange={(e) => setContent({...content, brandDescription: e.target.value})}
                   className="w-full bg-black/40 border border-border-main rounded-lg px-4 py-3 text-xs text-text-muted outline-none focus:border-accent-blue transition-all leading-relaxed"
                 />
              </div>
              <div className="pt-4 border-t border-white/5">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">하단 저작권 (Copyright)</label>
                 <input 
                   type="text" 
                   value={content.copyright}
                   onChange={(e) => setContent({...content, copyright: e.target.value})}
                   className="w-full bg-black/40 border border-border-main rounded px-4 py-2 text-[10px] text-text-muted font-mono outline-none focus:border-accent-blue"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Links Control */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Platforms Links */}
              <div className="dashboard-card bg-black/20">
                 <div className="flex items-center gap-2 mb-6">
                    <ShieldCheck size={18} className="text-accent-blue" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Platform Links</h4>
                 </div>
                 <div className="space-y-4">
                    {content.platforms.map((link, i) => (
                       <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               value={link.label}
                               onChange={(e) => updateLink('platforms', i, 'label', e.target.value)}
                               className="flex-1 bg-transparent border-b border-white/10 text-xs text-white font-bold pb-1 outline-none focus:border-accent-blue"
                               placeholder="표시 이름"
                             />
                          </div>
                          <div className="flex items-center gap-2 text-text-muted bg-black/20 rounded p-1.5">
                             <LinkIcon size={12} className="shrink-0" />
                             <input 
                               type="text" 
                               value={link.link}
                               onChange={(e) => updateLink('platforms', i, 'link', e.target.value)}
                               className="w-full bg-transparent text-[10px] outline-none font-mono"
                               placeholder="이동 경로 (URL)"
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Support Links */}
              <div className="dashboard-card bg-black/20">
                 <div className="flex items-center gap-2 mb-6">
                    <HelpCircle size={18} className="text-accent-green" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Support Links</h4>
                 </div>
                 <div className="space-y-4">
                    {content.support.map((link, i) => (
                       <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               value={link.label}
                               onChange={(e) => updateLink('support', i, 'label', e.target.value)}
                               className="flex-1 bg-transparent border-b border-white/10 text-xs text-white font-bold pb-1 outline-none focus:border-accent-green"
                               placeholder="표시 이름"
                             />
                          </div>
                          <div className="flex items-center gap-2 text-text-muted bg-black/20 rounded p-1.5">
                             <LinkIcon size={12} className="shrink-0" />
                             <input 
                               type="text" 
                               value={link.link}
                               onChange={(e) => updateLink('support', i, 'link', e.target.value)}
                               className="w-full bg-transparent text-[10px] outline-none font-mono"
                               placeholder="이동 경로 (URL)"
                             />
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
}

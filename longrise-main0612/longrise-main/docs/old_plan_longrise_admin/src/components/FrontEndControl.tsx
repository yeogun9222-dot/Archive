import { useState } from 'react';
import { Layout, Save, Eye, Move, Edit3, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface SectionConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  isVisible: boolean;
  lastUpdated: string;
}

const INITIAL_SECTIONS: SectionConfig[] = [
  { id: 'hero', name: '히어로 영역', title: 'AI와 함께하는 당신의 크립토 미래', subtitle: '차세대 자동화 수익 노드에 합류하세요.', isVisible: true, lastUpdated: '2시간 전' },
  { id: 'features', name: '핵심 기능', title: '왜 LONGRISE AI인가요?', subtitle: '보안, 안정성, 그리고 확장성.', isVisible: true, lastUpdated: '1일 전' },
  { id: 'ranks', name: '커리어 패스', title: '드래곤 등급 생태계', subtitle: '체계적인 보상을 통한 잠재력 해방.', isVisible: true, lastUpdated: '3일 전' },
  { id: 'faq', name: '도움말 & FAQ', title: '자주 묻는 질문', subtitle: '일반적인 문의에 대한 명확한 답변.', isVisible: false, lastUpdated: '5일 전' },
];

export function FrontEndControl({ view }: { view: string }) {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const currentSection = sections.find(s => view.includes(s.id)) || sections[0];

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Side */}
        <div className="lg:col-span-2 space-y-6">
           <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Edit3 size={18} className="text-accent-blue" />
                    <div>
                       <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">섹션 컨텐츠 관리 엔진</h3>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">관리 중인 섹션: {currentSection.name}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="btn-outline-gold text-[10px] py-1.5 px-4 font-bold border-border-main flex items-center gap-2">
                       <Eye size={12} /> 실시간 미리보기
                    </button>
                    <button className="btn-gold text-[10px] py-1.5 px-6 font-bold flex items-center gap-2">
                       <Save size={12} /> 변경 사항 배포
                    </button>
                 </div>
              </div>

              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">메인 캐치프레이즈 (H1)</label>
                       <textarea 
                          defaultValue={currentSection.title}
                          className="w-full bg-black/20 border border-border-main rounded-lg p-4 text-xl font-bold text-text-primary focus:border-accent-blue/40 focus:outline-none min-h-[100px]"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">하단 보조 텍스트</label>
                       <textarea 
                          defaultValue={currentSection.subtitle}
                          className="w-full bg-black/20 border border-border-main rounded-lg p-4 text-sm text-text-muted focus:border-accent-blue/40 focus:outline-none min-h-[80px]"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">기본 CTA 버튼 텍스트</label>
                       <input type="text" defaultValue="지금 시작하기" className="w-full bg-black/20 border border-border-main rounded-md px-4 py-2 text-xs text-text-primary" />
                       <div className="flex items-center gap-2">
                          <LinkIcon size={12} className="text-text-muted" />
                          <input type="text" defaultValue="/register" className="flex-1 bg-black/40 border border-border-main rounded-md px-3 py-1 text-[10px] text-accent-blue font-mono" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">배경 미디어 (URL)</label>
                       <div className="flex gap-3">
                          <div className="w-16 h-16 rounded border border-border-main bg-black/40 flex items-center justify-center shrink-0">
                             <ImageIcon size={20} className="text-text-muted opacity-30" />
                          </div>
                          <input type="text" placeholder="https://cdn.longrise.ai/hero.mp4" className="w-full bg-black/20 border border-border-main rounded-md px-4 py-2 text-[10px] text-text-primary self-center" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="dashboard-card border-border-main">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">컴포넌트 상태</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-border-main">
                    <div>
                       <p className="text-[11px] font-bold text-text-primary uppercase">노출 여부 (Visibility)</p>
                       <p className="text-[9px] text-text-muted">모든 장치에 실시간 게시</p>
                    </div>
                    <div className="w-10 h-5 bg-accent-green rounded-full relative">
                       <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-border-main opacity-50">
                    <div>
                       <p className="text-[11px] font-bold text-text-primary uppercase">A/B 테스트</p>
                       <p className="text-[9px] text-text-muted">비활성 (시작하려면 클릭)</p>
                    </div>
                    <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="dashboard-card border-border-main">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">섹션 블록 구성</h4>
                 <button className="text-[9px] text-accent-blue font-black flex items-center gap-1">
                    <Plus size={10} /> 블록 추가
                 </button>
              </div>
              <div className="space-y-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded bg-black/30 border border-white/5 group hover:border-accent-blue/30 transition-all cursor-move">
                       <Move size={12} className="text-text-muted opacity-20 group-hover:opacity-100" />
                       <span className="text-[10px] font-bold text-text-primary uppercase">블록 헤더 0{i}</span>
                       <div className="flex-1" />
                       <Edit3 size={10} className="text-text-muted cursor-pointer hover:text-white" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

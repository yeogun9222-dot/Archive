import { useState } from 'react';
import { Newspaper, Plus, Search, Filter, Calendar, Eye, Edit3, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewsItem {
  id: string;
  title: string;
  category: 'Update' | 'Notice' | 'Event' | 'Maintenance' | 'Draft';
  author: string;
  date: string;
  views: number;
  isPinned: boolean;
  status: 'Published' | 'Draft' | 'Scheduled';
}

const MOCK_NEWS: NewsItem[] = [
  { id: 'N-421', title: 'V7.2.2 시스템 업그레이드 및 정산 엔진 최적화 안내', category: 'Update', author: 'LRS_Dev', date: '현재', views: 1245, isPinned: true, status: 'Published' },
  { id: 'N-418', title: '제 3회 글로벌 드래곤 리더스 컨퍼런스 개최', category: 'Event', author: 'Strategy_X', date: '2시간 전', views: 852, isPinned: false, status: 'Published' },
  { id: 'N-415', title: '출금 지연 현상 복구 완료 안내 (이더리움 네트워크 서브셋)', category: 'Notice', author: 'Ops_Team', date: '1일 전', views: 4210, isPinned: false, status: 'Published' },
  { id: 'N-412', title: 'P2P 거래소 수수료 인하 프로모션 기획안', category: 'Draft', author: 'Marketing', date: '3일 전', views: 0, isPinned: false, status: 'Draft' },
];

export function NewsManagement() {
  const [news, setNews] = useState(MOCK_NEWS);

  const translateCategory = (cat: string) => {
    const cats: any = {
      'Update': '업데이트',
      'Notice': '공지사항',
      'Event': '이벤트',
      'Maintenance': '입출금 점검'
    };
    return cats[cat] || cat;
  };

  const translateStatus = (status: string) => {
     const statuses: any = {
       'Published': '게시됨',
       'Draft': '초안',
       'Scheduled': '예정됨'
     };
     return statuses[status] || status;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-2">
            <Newspaper size={20} className="text-accent-blue" />
            <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">공지사항 및 뉴스 피드 제어 (CMS)</h3>
         </div>
         <button className="btn-gold flex items-center gap-2 py-2 px-6 text-xs font-black uppercase tracking-widest">
            <Plus size={16} /> 신규 게시글 작성
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <div className="dashboard-card border-border-main p-4">
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">카테고리 필터</h4>
               <div className="space-y-1">
                  {['전체', '업데이트', '공지사항', '이벤트', '점검'].map(cat => (
                    <button key={cat} className={cn(
                      "w-full text-left px-3 py-2 rounded text-[11px] font-bold uppercase transition-all",
                      cat === '전체' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" : "text-text-muted hover:bg-white/5"
                    )}>
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            <div className="dashboard-card border-border-main bg-accent-blue/5 p-4">
               <div className="flex items-center gap-2 text-accent-blue mb-2">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">실시간 게시 가이드</span>
               </div>
               <p className="text-[10px] text-text-muted leading-relaxed italic">
                  중요 공지사항은 "상단 고정" 설정을 통해 앱 첫 화면 팝업으로 노출할 수 있습니다. 
                  HTML 에디터를 통해 이미지 및 링크 삽입이 가능합니다.
               </p>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-6">
            <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
               <div className="p-4 border-b border-border-main bg-black/10 flex items-center justify-between">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                     <input 
                        type="text" 
                        placeholder="제목 또는 본문 검색..." 
                        className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-64"
                     />
                  </div>
                  <button className="p-1.5 border border-border-main rounded hover:bg-white/5 text-text-muted">
                     <Filter size={14} />
                  </button>
               </div>

               <table className="data-table">
                  <thead>
                     <tr>
                        <th className="w-16 text-[10px]">ID</th>
                        <th className="text-[10px]">제목 및 카테고리</th>
                        <th className="text-[10px]">작성자</th>
                        <th className="text-[10px]">조회수</th>
                        <th className="text-[10px]">상태</th>
                        <th className="text-right text-[10px]">액션</th>
                     </tr>
                  </thead>
                  <tbody>
                     {news.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.01] group">
                           <td className="font-mono text-[10px] text-text-muted font-bold">{item.id}</td>
                           <td>
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-2">
                                    {item.isPinned && <div className="px-1 py-0.5 bg-accent-amber/10 text-accent-amber border border-accent-amber/20 rounded text-[8px] font-black uppercase">고정</div>}
                                    <span className="text-[11px] font-bold text-text-primary group-hover:text-accent-blue transition-colors">{item.title}</span>
                                 </div>
                                 <span className="text-[9px] text-text-muted uppercase font-black mt-1 italic">{translateCategory(item.category)}</span>
                              </div>
                           </td>
                           <td className="text-[10px] text-text-muted font-bold uppercase">{item.author}</td>
                           <td className="text-xs font-mono text-text-muted">{item.views.toLocaleString()}</td>
                           <td>
                              <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                 item.status === 'Published' ? "text-accent-green bg-accent-green/10 border-accent-green/20" :
                                 item.status === 'Draft' ? "text-slate-500 bg-white/5 border-border-main" :
                                 "text-accent-blue bg-accent-blue/10 border-accent-blue/20"
                              )}>
                                 {translateStatus(item.status)}
                              </span>
                           </td>
                           <td className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button className="p-1.5 text-text-muted hover:text-white"><Eye size={14} /></button>
                                 <button className="p-1.5 text-text-muted hover:text-white"><Edit3 size={14} /></button>
                                 <button className="p-1.5 text-text-muted hover:text-red-500"><Trash2 size={14} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

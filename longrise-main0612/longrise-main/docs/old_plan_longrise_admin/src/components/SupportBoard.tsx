import { useState } from 'react';
import { Mail, Search, Filter, CheckCircle, Clock, AlertCircle, MessageSquare, Tag, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface Ticket {
  id: string;
  user: string;
  subject: string;
  category: 'Withdrawal' | 'Node' | 'Rank' | 'General';
  status: 'Open' | 'Pending' | 'Resolved' | 'Urgent';
  time: string;
  priority: 'High' | 'Medium' | 'Low';
}

const MOCK_TICKETS: Ticket[] = [
  { id: 'TKT-1082', user: 'WhiteDragon_01', subject: '지갑에서 출금 잔액이 업데이트되지 않습니다', category: 'Withdrawal', status: 'Urgent', time: '12분 전', priority: 'High' },
  { id: 'TKT-1079', user: 'BTC_Miner_Z', subject: '노드 5의 보상 계산 오차 문의', category: 'Node', status: 'Open', time: '45분 전', priority: 'Medium' },
  { id: 'TKT-1075', user: 'Global_Leader', subject: '드래곤 등급 업그레이드 기준 확인 요청', category: 'Rank', status: 'Pending', time: '2시간 전', priority: 'Low' },
  { id: 'TKT-1068', user: 'Investor_99', subject: '내부 CNYT 이체 수수료 관련 문의', category: 'General', status: 'Resolved', time: '5시간 전', priority: 'Low' },
];

export function SupportBoard() {
  const [filter, setFilter] = useState('All');

  const translateCategory = (cat: string) => {
    const cats: any = {
      'Withdrawal': '출금',
      'Node': '노드',
      'Rank': '등급',
      'General': '일반'
    };
    return cats[cat] || cat;
  };

  const translateStatus = (status: string) => {
    const statuses: any = {
      'Open': '활성',
      'Pending': '보류',
      'Resolved': '해결됨',
      'Urgent': '긴급'
    };
    return statuses[status] || status;
  };

  const translatePriority = (prio: string) => {
    const prios: any = {
      'High': '높음',
      'Medium': '보통',
      'Low': '낮음'
    };
    return prios[prio] || prio;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="총 문의 건수" val="1.2K" icon={Mail} color="blue" />
        <StatCard label="긴급 처리 필요" val="8" icon={AlertCircle} color="red" />
        <StatCard label="SLA 준수율" val="98.2%" icon={CheckCircle} color="green" />
        <StatCard label="평균 응답 시간" val="14분" icon={Clock} color="purple" />
      </div>

      <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-main bg-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-accent-blue" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">고객 지원 센터 (티켓 리스트)</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
              <input 
                type="text" 
                placeholder="UID 또는 제목 검색..." 
                className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-64"
              />
            </div>
            <button className="btn-outline-gold text-[10px] py-1.5 px-4 font-bold border-border-main flex items-center gap-2">
              <Filter size={12} /> 필터링
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24 text-[10px]">TID</th>
                <th className="text-[10px]">작성자</th>
                <th className="text-[10px]">제목 및 카테고리</th>
                <th className="text-[10px]">상태</th>
                <th className="text-[10px]">우선순위</th>
                <th className="text-[10px]">등록 시점</th>
                <th className="text-right text-[10px]">상세 관리</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TICKETS.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] cursor-pointer group">
                  <td className="font-mono text-[10px] text-text-muted font-bold">{t.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                         <User size={10} className="text-accent-blue" />
                       </div>
                       <span className="text-[11px] font-bold text-text-primary">{t.user}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                      <span className="text-[11px] text-text-primary font-bold truncate max-w-[280px]">{t.subject}</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/10 shrink-0">
                        <Tag size={10} className="text-text-muted" />
                        <span className="text-[8px] text-text-muted uppercase font-black">{translateCategory(t.category)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                      t.status === 'Urgent' ? "text-red-400 bg-red-400/10 border-red-400/20" :
                      t.status === 'Resolved' ? "text-accent-green bg-accent-green/10 border-accent-green/20" :
                      "text-accent-blue bg-accent-blue/10 border-accent-blue/20"
                    )}>
                      {translateStatus(t.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1 h-3 rounded-full",
                        t.priority === 'High' ? "bg-red-500" : t.priority === 'Medium' ? "bg-amber-500" : "bg-slate-500"
                      )} />
                      <span className="text-[10px] font-bold text-text-muted uppercase">{translatePriority(t.priority)}</span>
                    </div>
                  </td>
                  <td className="text-[9px] text-text-muted font-bold uppercase">{t.time}</td>
                  <td className="text-right">
                    <button className="text-[9px] font-black text-accent-blue uppercase border border-accent-blue/30 px-3 py-1.5 rounded hover:bg-accent-blue/10 opacity-0 group-hover:opacity-100 transition-all">
                      답변 작성
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-accent-blue',
    red: 'text-red-400',
    green: 'text-accent-green',
    purple: 'text-purple-400'
  };
  return (
    <div className="dashboard-card border-border-main py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
        <Icon size={14} className={colors[color]} />
      </div>
      <p className="text-xl font-black text-text-primary tabular-nums">{val}</p>
    </div>
  );
}

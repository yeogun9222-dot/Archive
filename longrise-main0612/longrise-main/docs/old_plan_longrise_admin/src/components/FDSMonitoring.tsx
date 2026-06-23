import { useState } from 'react';
import { ShieldAlert, AlertTriangle, Search, Filter, ShieldCheck, XCircle, MoreVertical, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface Alert {
  id: string;
  user: string;
  type: 'Multiple IP' | 'Large Withdrawal' | 'Fast Rollup' | 'Wash Trade';
  severity: 'Critical' | 'Warning';
  time: string;
}

const MOCK_ALERTS: Alert[] = [
  { id: 'FDS-922', user: 'Farmer_Joe', type: 'Multiple IP', severity: 'Warning', time: '5분 전' },
  { id: 'FDS-918', user: 'Whale_Hunter', type: 'Large Withdrawal', severity: 'Critical', time: '14분 전' },
  { id: 'FDS-915', user: 'Bot_008', type: 'Fast Rollup', severity: 'Warning', time: '1시간 전' },
];

export function FDSMonitoring() {
  const translateType = (type: string) => {
    const types: any = {
      'Multiple IP': '다중 IP 접속',
      'Large Withdrawal': '고액 출금 시도',
      'Fast Rollup': '비정상 고속 롤업',
      'Wash Trade': '자전거래 의심'
    };
    return types[type] || type;
  };

  const translateSeverity = (sev: string) => {
    const sevs: any = {
      'Critical': '위험',
      'Warning': '경고'
    };
    return sevs[sev] || sev;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-card border-red-500/20 bg-red-500/5">
           <div className="flex items-center gap-2 text-red-400 mb-4">
              <ShieldAlert size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">글로벌 리스크 스코어</h4>
           </div>
           <p className="text-2xl font-black text-red-500 tabular-nums">위험 (78/100)</p>
           <p className="text-[10px] text-red-400/60 font-bold uppercase mt-2 italic">자전거래 활동 증가가 감지되었습니다</p>
        </div>
        <div className="dashboard-card border-border-main">
           <div className="flex items-center gap-2 text-accent-blue mb-4">
              <ShieldCheck size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">보호된 거래 규모</h4>
           </div>
           <p className="text-2xl font-black text-text-primary tabular-nums">$2.8M</p>
           <p className="text-[10px] text-accent-green font-bold uppercase mt-2 tracking-widest">전체 트랜잭션의 99.2% 검증됨</p>
        </div>
        <div className="dashboard-card border-border-main">
           <div className="flex items-center gap-2 text-amber-500 mb-4">
              <AlertTriangle size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">검토 대기 건수</h4>
           </div>
           <p className="text-2xl font-black text-amber-500 tabular-nums">14</p>
           <p className="text-[10px] text-text-muted font-bold uppercase mt-2 italic">수동 검토가 필요합니다</p>
        </div>
      </div>

      <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">FDS 이상 탐지 알림 (FDS Monitoring)</h3>
            <div className="flex gap-2">
               <button className="btn-outline-gold text-[9px] py-1.5 px-4 font-black uppercase tracking-widest border-border-main">안전 로그 정제</button>
               <button className="btn-gold text-[9px] py-1.5 px-4 font-black uppercase tracking-widest">풀 스캔 실행</button>
            </div>
         </div>
         <table className="data-table">
            <thead>
               <tr>
                  <th className="text-[10px]">사건 ID</th>
                  <th className="text-[10px]">대상 사용자</th>
                  <th className="text-[10px]">탐지 패턴</th>
                  <th className="text-[10px]">위험도</th>
                  <th className="text-[10px]">탐지 시각</th>
                  <th className="text-right text-[10px]">즉시 개입</th>
               </tr>
            </thead>
            <tbody>
               {MOCK_ALERTS.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.01]">
                     <td className="font-mono text-[10px] text-text-muted font-bold italic">{a.id}</td>
                     <td className="text-[11px] font-bold text-text-primary">{a.user}</td>
                     <td>
                        <span className="text-[10px] font-black uppercase text-accent-blue/80 tracking-tighter">{translateType(a.type)}</span>
                     </td>
                     <td>
                        <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                           a.severity === 'Critical' ? "text-red-400 bg-red-400/10 border-red-400/20 animate-pulse" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        )}>
                           {translateSeverity(a.severity)}
                        </span>
                     </td>
                     <td className="text-[10px] text-text-muted font-bold uppercase">{a.time}</td>
                     <td className="text-right">
                        <div className="flex justify-end gap-2 px-2">
                           <button className="p-2 border border-border-main rounded hover:bg-white/5 text-text-muted">
                              <Eye size={12} />
                           </button>
                           <button className="p-2 border border-red-500/30 bg-red-500/5 text-red-500 rounded hover:bg-red-500/10">
                              <XCircle size={12} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

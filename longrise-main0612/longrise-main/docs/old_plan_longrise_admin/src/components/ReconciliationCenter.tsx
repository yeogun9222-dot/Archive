import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Database, Wallet, Search, ArrowRight, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export function ReconciliationCenter() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-6 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-card border-accent-green/20 bg-accent-green/5 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-accent-green">
             <ShieldCheck size={20} />
             <h3 className="text-xs font-bold uppercase tracking-widest font-mono">대사 상태: 일치</h3>
           </div>
           <p className="text-[11px] text-text-muted leading-relaxed">
             DB 장부와 핫월렛 잔액 간의 최신 자동 대사가 성공적으로 완료되었습니다. 불일치가 발견되지 않았습니다.
           </p>
           <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-text-muted">
              <span>최근 동기화: 오늘 04:00 UTC</span>
              <span className="text-accent-green font-bold uppercase tracking-widest">검증 완료</span>
           </div>
        </div>

        <div className="lg:col-span-2 dashboard-card border-border-main flex flex-col md:flex-row gap-8 shadow-sm">
           <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-border-main">
                 <div className="flex items-center gap-2">
                    <Database size={14} className="text-accent-blue" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">DB 글로벌 장부 총액</span>
                 </div>
                 <span className="text-sm font-bold text-text-primary font-mono tabular-nums">$185,000.42</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-border-main">
                 <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">핫월렛 실잔고 캐시</span>
                 </div>
                 <span className="text-sm font-bold text-text-primary font-mono tabular-nums">$185,000.42</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
                 <span className="text-[10px] font-bold text-accent-blue uppercase italic tracking-widest">불일치 오차 범위</span>
                 <span className="text-sm font-bold text-accent-blue font-mono tabular-nums">$0.00</span>
              </div>
           </div>
           
           <div className="flex flex-col justify-center gap-3">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={cn(
                  "btn-gold px-10 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest",
                  isSyncing && "animate-pulse"
                )}
              >
                <Activity size={14} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? '동기화 중...' : '수동 대사 실행'}
              </button>
              <p className="text-[9px] text-text-muted italic text-center leading-tight uppercase font-medium">
                최근 수동 동기화: <br /> 24시간 임계치 충족.
              </p>
           </div>
        </div>
      </div>

      <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm mb-12">
        <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
           <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">회계 대사 감사 이력 (History)</h3>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-[10px]">감사 추적 ID</th>
              <th className="text-[10px]">실행 시간 (UTC)</th>
              <th className="text-[10px]">장부 로직 총액</th>
              <th className="text-[10px]">실제 데이터 총액</th>
              <th className="text-[10px]">오차 발생액</th>
              <th className="text-[10px]">감사 상태</th>
              <th className="text-right text-[10px]">상세</th>
            </tr>
          </thead>
          <tbody>
             <ReconRow id="REC-2026-04-17" time="04:00" val1="185,000" val2="185,000" diff="0" status="일치" />
             <ReconRow id="REC-2026-04-16" time="04:00" val1="183,500" val2="183,500" diff="0" status="일치" />
             <ReconRow id="REC-2026-04-15" time="04:00" val1="182,000" val2="182,100" diff="+100" status="해결됨" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReconRow({ id, time, val1, val2, diff, status }: any) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="font-mono text-[10px] text-text-muted font-bold uppercase tracking-tighter">{id}</td>
      <td className="text-text-muted text-[10px]">{time}</td>
      <td className="font-mono text-[11px] text-text-primary">${val1}</td>
      <td className="font-mono text-[11px] text-text-primary">${val2}</td>
      <td className={cn("font-mono text-[11px] font-bold", diff === '0' ? "text-text-muted" : "text-accent-amber")}>
        {diff === '0' ? '-' : `$${diff}`}
      </td>
      <td>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
          status === '일치' ? "text-accent-green bg-accent-green/10 border border-accent-green/20" : "text-accent-amber bg-accent-amber/10 border border-accent-amber/20"
        )}>
          {status}
        </span>
      </td>
      <td className="text-right px-4">
        <button className="text-accent-blue hover:text-accent-blue/70 transition-colors">
          <ArrowRight size={14} />
        </button>
      </td>
    </tr>
  );
}

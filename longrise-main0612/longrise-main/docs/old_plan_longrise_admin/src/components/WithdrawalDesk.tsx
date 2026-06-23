import { ClipboardCheck, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { WithdrawalRequest } from '../types';

export function WithdrawalDesk({ withdrawals }: { withdrawals: WithdrawalRequest[] }) {
  return (
    <div className="space-y-6 px-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dashboard-card border-border-main">
            <div className="flex items-center gap-2 text-accent-blue mb-4">
              <Clock size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">심사 대기 건수</h4>
            </div>
            <p className="text-3xl font-bold text-text-primary tabular-nums">{withdrawals.length}</p>
          </div>
          <div className="dashboard-card border-border-main">
            <div className="flex items-center gap-2 text-accent-green mb-4">
              <CheckCircle2 size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">승인 완료 (24H)</h4>
            </div>
            <p className="text-3xl font-bold text-text-primary tabular-nums">42</p>
          </div>
          <div className="dashboard-card border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <ShieldCheck size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">FDS 위험 감지</h4>
            </div>
            <p className="text-3xl font-bold text-red-400 tabular-nums">1</p>
          </div>
       </div>

       <div className="dashboard-card p-0 overflow-hidden border-border-main">
          <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">출금 승인 요청 큐</h3>
              <p className="text-[10px] text-text-muted mt-1 uppercase font-medium">자동 플래깅 활성: $10,000 초과 건</p>
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-[10px]">요청 번호</th>
                <th className="text-[10px]">회원 노드</th>
                <th className="text-[10px]">출금액</th>
                <th className="text-[10px]">인증 상태</th>
                <th className="text-[10px]">네트워크 / 지갑 주소</th>
                <th className="sticky right-0 top-0 bg-bg-surface z-10 text-right text-[10px] border-l border-white/10 px-4">최종 결정</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="font-mono text-[10px] text-text-muted uppercase font-bold">{w.withdrawalId}</td>
                      <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-bold text-text-primary text-[11px]">{w.userId}</span>
                          <span className="text-[9px] text-text-muted italic uppercase font-medium opacity-50">마스터 노드 레벨 4</span>
                        </div>
                      </td>
                  <td className="font-mono text-xs font-black text-accent-blue">
                    ${w.amount.toLocaleString()} USDT
                  </td>
                  <td>
                    <div className="flex items-center gap-2 opacity-80">
                       <CheckCircle2 size={12} className="text-accent-green" />
                       <span className="text-[9px] font-black text-accent-green uppercase tracking-tighter">본인 인증 완료</span>
                    </div>
                  </td>
                      <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-text-muted">TRC-20</span>
                          <span className="text-[9px] text-slate-500 font-mono tracking-tighter truncate max-w-[120px] opacity-70">{w.walletAddress}</span>
                        </div>
                      </td>
                  <td className="sticky right-0 bg-bg-surface z-10 text-right border-l border-white/10 px-4">
                    <div className="flex justify-end gap-2">
                       <button className="px-4 py-1.5 bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all">
                          반려
                       </button>
                       <button className="px-4 py-1.5 bg-accent-green text-white rounded hover:bg-accent-green/80 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-green/20">
                          승인
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

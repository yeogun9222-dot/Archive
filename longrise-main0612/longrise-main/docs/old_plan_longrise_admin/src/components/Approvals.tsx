import { useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Search, Filter, Eye, User, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ApprovalRequest {
  id: string;
  type: 'KYC' | 'Big Withdrawal' | 'New Node' | 'Rank Appeal' | 'Commission Audit';
  user: string;
  userId: string;
  amount?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  auditReason?: string;
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'APR-201', type: 'KYC', user: 'Investor_99', userId: 'LR-1002', date: '5분 전', status: 'Pending', priority: 'Medium' },
  { id: 'APR-200', type: 'Commission Audit', user: 'Auto_Engine', userId: 'SYSTEM', amount: '$1,245.50', auditReason: '롤업 수당(11.11%) 중복 계산 의심', date: '2분 전', status: 'Pending', priority: 'High' },
  { id: 'APR-198', type: 'Big Withdrawal', user: 'Whale_Hunter', userId: 'LR-0051', amount: '50,000 USDT', date: '12분 전', status: 'Pending', priority: 'High' },
  { id: 'APR-195', type: 'Rank Appeal', user: 'Leader_X', userId: 'LR-0881', date: '1시간 전', status: 'Pending', priority: 'Low' },
  { id: 'APR-194', type: 'Commission Audit', user: 'Admin_Audit', userId: 'AUDIT-02', amount: '$420.00', auditReason: '추천 수당(12%) 과지급 탐지 (회원 LR-1004)', date: '3시간 전', status: 'Pending', priority: 'High' },
];

export function Approvals() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const translateType = (type: string) => {
    const types: any = {
      'KYC': '신원 인증(KYC)',
      'Big Withdrawal': '고액 출금 승인',
      'New Node': '신규 노드 배포',
      'Rank Appeal': '직급 조정 요청',
      'Commission Audit': '수당 교차 검수(Audit)'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ApprovalStat label="검토 대기 중" val="14" color="amber" />
         <ApprovalStat label="오늘 승인됨" val="128" color="green" />
         <ApprovalStat label="평균 승인 시간" val="12.5분" color="blue" />
      </div>

      <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
         <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ClipboardCheck size={18} className="text-accent-blue" />
               <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">전역 관리자 승인 센터 (Approval Desk)</h3>
            </div>
            <div className="flex gap-2">
               <button className="btn-outline-gold text-[9px] py-1.5 px-4 font-bold border-border-main">준법 감시 보고서</button>
            </div>
         </div>

         <table className="data-table">
            <thead>
               <tr>
                  <th className="text-[10px]">승인 번호</th>
                  <th className="text-[10px]">요청 유형</th>
                  <th className="text-[10px]">요청 사용자</th>
                  <th className="text-[10px]">관련 수량/정보</th>
                  <th className="text-[10px]">우선순위</th>
                  <th className="text-[10px]">상태</th>
                  <th className="sticky right-0 top-0 bg-bg-surface z-10 text-right text-[10px] border-l border-white/10 px-4">제어</th>
               </tr>
            </thead>
            <tbody>
               {MOCK_APPROVALS.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.01] group">
                     <td className="font-mono text-[10px] text-text-muted font-bold italic">{a.id}</td>
                     <td>
                        <div className="flex items-center gap-2">
                           <div className={cn(
                              "w-1 h-3 rounded-full",
                              a.type === 'Big Withdrawal' ? "bg-red-500" : "bg-accent-blue"
                           )} />
                           <span className="text-[11px] font-bold text-text-primary">{translateType(a.type)}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                           <span className="text-[11px] font-bold text-white">{a.user}</span>
                           <span className="text-[9px] text-text-muted font-mono opacity-50">{a.userId}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                           <span className="text-xs font-black text-accent-blue">{a.amount || '문서 검토'}</span>
                           {a.auditReason && <span className="text-[8px] text-red-400 font-bold ml-1">{a.auditReason}</span>}
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest",
                           a.priority === 'High' ? "text-red-500" : a.priority === 'Medium' ? "text-accent-amber" : "text-slate-500"
                        )}>{a.priority}</span>
                     </td>
                     <td>
                        <div className="flex items-center gap-2">
                           <Clock size={10} className="text-accent-amber animate-spin-slow" />
                           <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest">심사 중</span>
                        </div>
                     </td>
                     <td className="sticky right-0 bg-bg-surface z-10 text-right border-l border-white/10 px-4">
                        <div className="flex justify-end gap-2">
                           <button className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded hover:bg-red-600 transition-all uppercase tracking-widest shadow-lg shadow-red-500/10">
                              반려
                           </button>
                           <button className="px-3 py-1 bg-accent-green text-white text-[10px] font-black rounded hover:bg-accent-green/80 transition-all uppercase tracking-widest shadow-lg shadow-accent-green/10">
                              승인
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="dashboard-card border-border-main">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">승급 심사 대기열 (Rank Appeals)</h4>
            <div className="space-y-4">
               {[1, 2].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                       <User size={16} className="text-accent-blue" />
                       <div>
                          <p className="text-[11px] font-bold text-text-primary">BlueDragon_Target_0{i}</p>
                          <p className="text-[9px] text-text-muted uppercase">팀 실적 달성됨 ($50,000)</p>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-text-muted cursor-pointer hover:text-white" />
                 </div>
               ))}
            </div>
         </div>

         <div className="dashboard-card border-border-main">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">보안 승인 프로세스 (Security Audit)</h4>
            <div className="space-y-4">
               <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-4">
                  <ShieldCheck className="text-red-400" size={24} />
                  <div>
                     <p className="text-[11px] font-bold text-red-400 uppercase">2FA 강제 초기화 요청</p>
                     <p className="text-[10px] text-text-muted leading-tight mt-1">
                        사용자 LR-0021의 OTP 하드웨어 분실로 인한 강제 리셋 승인이 필요합니다.
                     </p>
                  </div>
               </div>
               <button className="w-full py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-600">
                  보안 이슈 즉시 해결
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function ApprovalStat({ label, val, color }: any) {
  const colors: any = {
    amber: 'text-accent-amber',
    green: 'text-accent-green',
    blue: 'text-accent-blue'
  };
  return (
    <div className="dashboard-card border-border-main py-4">
       <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
          <div className={cn("w-2 h-2 rounded-full", colors[color].replace('text-', 'bg-'))} />
       </div>
       <p className={cn("text-2xl font-black mt-2 tabular-nums", colors[color])}>{val}</p>
    </div>
  );
}

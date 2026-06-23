import { useState } from 'react';
import { Gavel, AlertCircle, MessageSquare, ShieldAlert, CheckCircle2, XCircle, Search, Filter, MoreVertical, Paperclip } from 'lucide-react';
import { cn } from '../lib/utils';

interface Dispute {
  id: string;
  orderId: string;
  seller: string;
  buyer: string;
  amount: string;
  fiat: string;
  reason: 'Not Received' | 'Incorrect Amount' | 'Verification Failed' | 'Identity Mismatch';
  status: 'Open' | 'Under Review' | 'Resolved' | 'Cancelled';
  time: string;
}

const MOCK_DISPUTES: Dispute[] = [
  { id: 'DSP-001', orderId: 'ORD-9821', seller: 'BlueDragon_5', buyer: 'Investor_81', amount: '1,200 CNYT', fiat: '$165.00', reason: 'Not Received', status: 'Under Review', time: '14분 전' },
  { id: 'DSP-002', orderId: 'ORD-9750', seller: 'Farmer_Joe', buyer: 'Whale_Hunter', amount: '4,500 CNYT', fiat: '$618.00', reason: 'Identity Mismatch', status: 'Open', time: '2시간 전' },
  { id: 'DSP-003', orderId: 'ORD-9742', seller: 'NewBee_22', buyer: 'LRS_Master', amount: '200 CNYT', fiat: '$27.40', reason: 'Incorrect Amount', status: 'Resolved', time: '1일 전' },
];

export function P2PDisputes() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const translateReason = (reason: string) => {
    const reasons: any = {
      'Not Received': '입금 미확인',
      'Incorrect Amount': '금액 불일치',
      'Verification Failed': '증빙 자료 부적합',
      'Identity Mismatch': '신원 불일치'
    };
    return reasons[reason] || reason;
  };

  const translateStatus = (status: string) => {
    const statuses: any = {
      'Open': '활성',
      'Under Review': '심사 중',
      'Resolved': '해결됨',
      'Cancelled': '취소됨'
    };
    return statuses[status] || status;
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispute Stats */}
        <div className="lg:col-span-1 space-y-6">
           <div className="dashboard-card border-accent-amber/30 bg-accent-amber/5">
              <div className="flex items-center gap-2 text-accent-amber mb-4">
                 <Gavel size={18} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">분쟁 중개 총괄 (Overview)</h4>
              </div>
              <div className="space-y-4">
                 <StatRow label="전체 분쟁 건수" value="12" />
                 <StatRow label="평균 중재 시간" value="45분" />
                 <StatRow label="최종 승소율 (판매자)" value="68%" />
              </div>
              <p className="text-[9px] text-accent-amber/60 font-medium italic mt-6 leading-relaxed">
                 * 모든 분쟁 기록은 FDS 감사 노드에 백업되며, 반복적인 분쟁 발생 사용자는 자동으로 출금이 잠금 처리됩니다.
              </p>
           </div>

           <div className="dashboard-card border-border-main">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">분쟁 유형 분포</h4>
              <div className="space-y-2">
                 <TypeBar label="입금 미확인" percent={50} color="red" />
                 <TypeBar label="금액 불일치" percent={25} color="amber" />
                 <TypeBar label="신원 불일치" percent={15} color="purple" />
                 <TypeBar label="기타" percent={10} color="slate" />
              </div>
           </div>
        </div>

        {/* Dispute List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
              <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
                 <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">P2P 분쟁 조정 데스크</h3>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-medium">관리자 수동 중재 및 자산 회수 모듈</p>
                 </div>
                 <div className="flex gap-2">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
                       <input 
                          type="text" 
                          placeholder="분쟁 ID 또는 주문 번호..." 
                          className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-48"
                       />
                    </div>
                 </div>
              </div>
              <table className="data-table">
                 <thead>
                    <tr>
                       <th className="text-[10px]">분쟁 ID</th>
                       <th className="text-[10px]">사유</th>
                       <th className="text-[10px]">당사자</th>
                       <th className="text-[10px]">거래 수량</th>
                       <th className="text-[10px]">상태</th>
                       <th className="text-right text-[10px]">중재</th>
                    </tr>
                 </thead>
                 <tbody>
                    {MOCK_DISPUTES.map(d => (
                       <tr 
                        key={d.id} 
                        className={cn(
                          "hover:bg-white/[0.01] cursor-pointer group",
                          selectedDispute?.id === d.id && "bg-accent-blue/5"
                        )}
                        onClick={() => setSelectedDispute(d)}
                       >
                          <td className="font-mono text-[10px] text-text-muted font-bold italic">{d.id}</td>
                          <td>
                             <span className="text-[10px] font-bold text-text-primary">{translateReason(d.reason)}</span>
                          </td>
                          <td className="text-[11px] font-bold text-text-primary">
                             <div className="flex flex-col">
                                <span className="text-slate-500 text-[9px]">S: {d.seller}</span>
                                <span className="text-slate-500 text-[9px]">B: {d.buyer}</span>
                             </div>
                          </td>
                          <td className="text-xs font-black text-accent-blue">{d.amount}</td>
                          <td>
                             <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                                d.status === 'Open' ? "text-red-400 border-red-400/20 bg-red-400/5 animate-pulse" :
                                d.status === 'Under Review' ? "text-accent-amber border-accent-amber/20 bg-accent-amber/5" :
                                "text-text-muted border-border-main bg-white/5"
                             )}>
                                {translateStatus(d.status)}
                             </span>
                          </td>
                          <td className="text-right">
                             <button className="text-[9px] font-black uppercase border border-border-main px-3 py-1.5 rounded text-text-muted hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                케이스 확인
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {selectedDispute && (
             <div className="dashboard-card border-accent-blue/30 bg-accent-blue/5 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                   <div className="flex items-center gap-3">
                      <ShieldAlert className="text-accent-blue" size={20} />
                      <h4 className="text-sm font-black text-white uppercase italic">Case Mediation: {selectedDispute.id}</h4>
                   </div>
                   <button onClick={() => setSelectedDispute(null)} className="text-text-muted hover:text-white"><XCircle size={18} /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">채팅 시뮬레이션 및 증빙</h5>
                      <div className="bg-black/30 rounded-lg p-4 space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar border border-white/5">
                         <ChatMessage user={selectedDispute.seller} text="입금 확인이 안 됩니다. 영수증 올려주세요." time="14:10" />
                         <ChatMessage user={selectedDispute.buyer} text="방금 보냈습니다. $165.00 정확하게 송금했습니다." time="14:12" />
                         <ChatMessage user={selectedDispute.buyer} text="첨부파일 확인 바랍니다." time="14:13" isMe />
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-black/40 rounded border border-white/5 cursor-pointer hover:bg-black/60">
                         <Paperclip size={14} className="text-accent-blue" />
                         <span className="text-[10px] font-bold text-text-muted">송금_영수증_TX_882.png (클릭하여 확대)</span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">강제 개입 액션 (Intervention)</h5>
                      <div className="grid grid-cols-1 gap-2">
                         <button className="w-full flex items-center justify-center gap-2 py-3 rounded bg-accent-green text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-accent-green/10">
                            거래 강제 완료 (판매자 자산 이동)
                         </button>
                         <button className="w-full flex items-center justify-center gap-2 py-3 rounded bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/10">
                            거래 강제 취소 (에스크로 환불)
                         </button>
                         <button className="w-full flex items-center justify-center gap-2 py-3 rounded border border-border-main text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-white">
                            추가 증빙 자료 요청 알림
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
       <span className="text-[11px] font-bold text-text-muted uppercase tracking-tight">{label}</span>
       <span className="text-xs font-black text-text-primary">{value}</span>
    </div>
  );
}

function TypeBar({ label, percent, color }: any) {
  const colors: any = {
    red: 'bg-red-500',
    amber: 'bg-accent-amber',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500'
  };
  return (
    <div className="space-y-1">
       <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase">
          <span>{label}</span>
          <span>{percent}%</span>
       </div>
       <div className="h-1 bg-black/30 rounded-full overflow-hidden">
          <div className={cn("h-full", colors[color])} style={{ width: `${percent}%` }} />
       </div>
    </div>
  );
}

function ChatMessage({ user, text, time, isMe }: any) {
   return (
      <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
         <span className="text-[8px] font-black text-slate-500 uppercase">{user}</span>
         <p className={cn("text-[9px] p-2 rounded-lg max-w-[80%]", isMe ? "bg-accent-blue/20 text-accent-blue rounded-tr-none" : "bg-white/5 text-text-primary rounded-tl-none")}>
            {text}
         </p>
         <span className="text-[7px] text-slate-600 italic">{time}</span>
      </div>
   );
}

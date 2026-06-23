import { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Gavel,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';

export function P2PMarket() {
  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-card border-border-main">
          <div className="flex items-center gap-2 text-accent-blue mb-4">
            <TrendingUp size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">P2P 24H 거래량</h4>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">428,500 CNYT</p>
          <div className="mt-2 text-[10px] text-accent-green font-bold">어제 대비 +12.4%</div>
        </div>
        <div className="dashboard-card border-border-main">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <ArrowLeftRight size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">활성 광고 리스팅</h4>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">154</p>
          <div className="mt-2 text-[10px] text-text-muted font-black uppercase tracking-tighter italic">판매: 92 | 구매: 62</div>
        </div>
        <div className="dashboard-card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 text-accent-amber mb-4">
            <Gavel size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">진행 중인 분쟁</h4>
          </div>
          <p className="text-2xl font-bold text-accent-amber tabular-nums">3</p>
          <div className="mt-2 text-[10px] text-accent-amber/70 font-bold uppercase underline underline-offset-4 cursor-pointer">중재 개입 필요</div>
        </div>
      </div>

      <div className="dashboard-card p-0 overflow-hidden border-border-main shadow-sm">
        <div className="p-6 border-b border-border-main bg-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">P2P 내부 거래 장부</h3>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-medium">개인 간 자산 할당 및 이동 실시간 모니터링</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
              <input 
                type="text" 
                placeholder="주문 번호 또는 사용자명 검색..." 
                className="bg-black/20 border border-border-main rounded-md pl-8 pr-4 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/50 w-64"
              />
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="text-[10px]">주문 번호</th>
              <th className="text-[10px]">유형</th>
              <th className="text-[10px]">판매자 (노드)</th>
              <th className="text-[10px]">구매자 (노드)</th>
              <th className="text-[10px]">자산 수량</th>
              <th className="text-[10px]">법정화폐/환산액</th>
              <th className="text-[10px]">상태</th>
              <th className="text-right text-[10px]">제어</th>
            </tr>
          </thead>
          <tbody>
            <P2PRow id="ORD-01" type="판매" seller="BlueDragon_5" buyer="Investor_81" amount="1,200 CNYT" fiat="$165.00" status="완료됨" />
            <P2PRow id="ORD-02" type="구매" seller="LR-Admin" buyer="NewBee_22" amount="500 CNYT" fiat="$68.50" status="에스크로" />
            <P2PRow id="ORD-03" type="판매" seller="WhiteDragon_4" buyer="Shark_Node" amount="4,500 CNYT" fiat="$620.10" status="분쟁중" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function P2PRow({ id, type, seller, buyer, amount, fiat, status }: any) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="font-mono text-[10px] text-text-muted font-bold">{id}</td>
      <td className={cn("text-[9px] font-black uppercase")}>
        <span className={cn(
          "px-1.5 py-0.5 rounded",
          type === '판매' ? "text-red-400 bg-red-400/10" : "text-accent-green bg-accent-green/10"
        )}>{type}</span>
      </td>
      <td className="text-[11px] font-bold text-text-primary">{seller}</td>
      <td className="text-[11px] font-bold text-text-primary">{buyer}</td>
      <td className="text-xs font-black font-mono text-accent-blue">{amount}</td>
      <td className="text-xs font-mono text-text-muted">{fiat}</td>
      <td>
        <span className={cn(
          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
          status === '완료됨' ? "text-accent-green bg-accent-green/10 border-accent-green/20" : 
          status === '에스크로' ? "text-accent-blue bg-accent-blue/10 border-accent-blue/20" :
          "text-accent-amber bg-accent-amber/10 border-accent-amber/20"
        )}>
          {status}
        </span>
      </td>
      <td className="text-right">
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
}

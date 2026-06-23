import { Users, ShieldAlert, ClipboardCheck, AlertCircle, Activity, Zap, Ban, ArrowRight, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 1. 핵심 지표 바 (Context) - 규모만 확인 */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <StatusCard 
            icon={Users} 
            label="전체 회원수" 
            value="8,542 명" 
            sub="가입 대기: 12" 
            status="info" 
         />
         <StatusCard 
            icon={ClipboardCheck} 
            label="승인 대기 요청" 
            value="148 건" 
            sub="출금: 120 / KYC: 28" 
            status="warning" 
         />
         <StatusCard 
            icon={ShieldAlert} 
            label="현재 리저브 비율" 
            value="12.4%" 
            sub="추세: 안정" 
            status="safe" 
         />
         <StatusCard 
            icon={Activity} 
            label="이상거래 감지" 
            value="3 건" 
            sub="FDS 자동 블록 중" 
            status="critical" 
         />
         <StatusCard 
            icon={Wallet} 
            label="총 입금 합계 (USDT)" 
            value="12,450,000 USDT" 
            sub="오늘 유입: +74,900 USDT" 
            status="safe" 
         />
      </div>

      {/* 2. 패키지 활성화 분포 (Package Activation) - 5가지 등급별 투자 현황 */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
         <PackageStat label="Flexible" price="$100" count="12,450" color="slate" />
         <PackageStat label="Basic" price="$200" count="4,200" color="blue" />
         <PackageStat label="Standard" price="$500" count="1,250" color="purple" />
         <PackageStat label="Premium" price="$1,000" count="840" color="amber" />
         <PackageStat label="VIP" price="$5,000" count="120" color="red" />
      </div>

      {/* 3. 메인 제어 센터 (Main Control Hub) - 여기서 다 누르고 조절함 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-6">
        
        {/* Quick ROI & Payout Control */}
        <div className="xl:col-span-2 dashboard-card border-accent-blue/20">
           <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
              <Zap size={18} className="text-accent-blue" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">실시간 운영 엔진 제어 (Admin Commander)</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ROI 제어 섹션 */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">데일리 ROI 및 수당 관리</p>
                 <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">AI 데일리 ROI</span>
                       <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-accent-blue/30">
                          <input type="number" defaultValue={1.5} className="bg-transparent text-sm font-black text-accent-blue w-10 outline-none" />
                          <span className="text-[10px] font-bold text-accent-blue/50">%</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">CNYT 가입 정산 엔진</span>
                       <button className="w-10 h-5 bg-accent-green rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                       </button>
                    </div>
                    <button className="w-full py-2 bg-accent-blue text-slate-900 text-[10px] font-black uppercase tracking-widest rounded hover:bg-accent-blue/80 transition-all">설정 수치 즉시 반영</button>
                 </div>
              </div>

              {/* CNYT 리워드 비율 및 긴급 제어 */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">기능 제어 및 긴급 액션</p>
                 <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">CNYT 리워드 배수</span>
                       <span className="text-xs font-black text-accent-amber">1000 : 10</span>
                    </div>
                    <button className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all">
                       <Ban size={12} /> 전체 출금 일시 중단
                    </button>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all">
                       FDS 이상거래 일괄 동결
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* 심사 대기 간략 피드 (Actionable Feed) */}
        <div className="dashboard-card border-border-main bg-black/40">
           <div className="flex items-center justify-between mb-6 pb-2 border-b border-border-main">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">미처리 승인 알림 (Pending)</h3>
              <span className="text-[9px] font-black text-accent-blue uppercase">새 알림 5건</span>
           </div>
           
           <div className="space-y-4">
              <QuickTaskItem name="Whale_Hunter" info="50,000 USDT 출금" msg="고액 승인 필요" time="12분 전" />
              <QuickTaskItem name="Investor_99" info="KYC 신원 인증" msg="서류 검토 대기" time="24분 전" />
              <QuickTaskItem name="LR-1004" info="비정상 롤업 탐지" msg="수당 감사 요망" time="1시간 전" />
              <QuickTaskItem name="New_Dragon" info="Black 등급 승급" msg="매출 검증 필요" time="3시간 전" />
           </div>

           <button className="w-full mt-8 py-2 border border-white/10 rounded text-[10px] font-black text-text-muted uppercase hover:bg-white/5 transition-all">전체 업무 창으로 이동</button>
        </div>

      </div>

      {/* 3. 처리 대기 큐 (Simplified Work Queue) - 바로 버튼 눌러서 처리 */}
      <div className="px-6 pb-12">
         <div className="dashboard-card p-0 overflow-hidden border-border-main">
            <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
               <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">주요 업무 승인 대기열 (Action Queue)</h3>
               <button className="text-[10px] font-bold text-accent-blue uppercase">전체 보기</button>
            </div>
            
            <table className="data-table">
               <thead>
                  <tr>
                     <th className="text-[10px]">유형</th>
                     <th className="text-[10px]">회원 정보</th>
                     <th className="text-[10px]">요청 내용</th>
                     <th className="text-[10px]">시간</th>
                     <th className="text-right text-[10px]">최종 결정</th>
                  </tr>
               </thead>
               <tbody>
                  <QueueRow type="출금" user="Whale_Hunter (LR-0051)" amount="50,000 USDT" time="12분 전" />
                  <QueueRow type="KYC" user="Investor_99 (LR-1002)" amount="신분증 검토" time="24분 전" />
                  <QueueRow type="승급" user="Leader_X (LR-0881)" amount="Black Dragon" time="1시간 전" />
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, sub, status }: any) {
  const colors = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    warning: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
    info: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
    safe: 'text-accent-green bg-accent-green/10 border-accent-green/20'
  } as any;

  return (
    <div className={cn("dashboard-card p-4 border flex items-center gap-4 transition-all hover:scale-[1.02]", colors[status])}>
       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colors[status].split(' ')[1])}>
          <Icon size={24} />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
          <p className="text-xl font-black tabular-nums">{value}</p>
          <p className="text-[9px] font-bold opacity-60 italic mt-0.5">{sub}</p>
       </div>
    </div>
  );
}

function PackageStat({ label, price, count, color }: any) {
  const colors = {
    slate: 'border-slate-800 bg-slate-900/50 text-slate-400',
    blue: 'border-accent-blue/20 bg-accent-blue/5 text-accent-blue',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    amber: 'border-accent-amber/20 bg-accent-amber/5 text-accent-amber',
    red: 'border-red-500/20 bg-red-500/5 text-red-500'
  } as any;

  return (
    <div className={cn("dashboard-card p-3 border text-center transition-all hover:border-white/20", colors[color])}>
       <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{label}</p>
       <p className="text-[10px] font-bold opacity-60 mb-2">{price}</p>
       <p className="text-sm font-black text-white">{count}</p>
       <p className="text-[8px] font-bold opacity-60 uppercase mt-1">활성화 완료</p>
    </div>
  );
}

function QueueRow({ type, user, amount, time }: any) {
  return (
    <tr className="hover:bg-white/[0.01]">
       <td><span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border", type === '출금' ? 'text-red-400 border-red-500/20' : 'text-accent-blue border-accent-blue/20')}>{type}</span></td>
       <td><span className="text-[11px] font-bold text-white">{user}</span></td>
       <td className="text-[11px] font-black text-accent-blue">{amount}</td>
       <td className="text-[10px] text-text-muted font-mono">{time}</td>
       <td className="text-right">
          <div className="flex justify-end gap-2 pr-4">
             <button className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded hover:bg-red-600 transition-all uppercase tracking-widest">반려</button>
             <button className="px-3 py-1 bg-accent-green text-white text-[10px] font-black rounded hover:bg-accent-green/80 transition-all uppercase tracking-widest">승인</button>
          </div>
       </td>
    </tr>
  );
}

function QuickTaskItem({ name, info, msg, time }: any) {
  return (
    <div className="flex items-center justify-between group py-1.5 border-b border-white/[0.03] last:border-0">
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex flex-col shrink-0">
             <span className="text-[11px] font-bold text-white group-hover:text-accent-blue transition-colors whitespace-nowrap">{name}</span>
             <span className="text-[8px] text-text-muted font-bold uppercase tracking-tighter">{time}</span>
          </div>
          <div className="h-3 w-px bg-white/10 shrink-0" />
          <div className="flex items-center gap-2 overflow-hidden">
             <span className="text-[10px] text-text-muted font-bold uppercase shrink-0">[{info}]</span>
             <span className="text-[10px] text-red-400 font-bold tracking-tighter truncate">{msg}</span>
          </div>
       </div>
       <ArrowRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all shrink-0" />
    </div>
  );
}

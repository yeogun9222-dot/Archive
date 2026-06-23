import { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, History, Target, Play, ArrowRight } from 'lucide-react';
import { PayoutLog } from '../types';
import { MOCK_PAYOUT_LOGS } from '../lib/mockData';
import { cn } from '../lib/utils';

export function PayoutEngine() {
  const [dailyRate, setDailyRate] = useState(1.5);
  const [directRate, setDirectRate] = useState(10.0);
  const [matchingRate, setMatchingRate] = useState(11.1);
  const [globalPoolRate, setGlobalPoolRate] = useState(3.5);
  const [maxOutMultiplier, setMaxOutMultiplier] = useState(10.0);
  const [withdrawalFee, setWithdrawalFee] = useState(5.0);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [cnytRewardRatio, setCnytRewardRatio] = useState(10); // 1000 USDT = 10 CNYT
  const [logs] = useState<PayoutLog[]>(MOCK_PAYOUT_LOGS);
  
  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Rate Setting Center - High Density Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ROI & Main Commissions */}
        <div className="dashboard-card border-border-main">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border-main">
             <Zap size={16} className="text-accent-blue" />
             <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest font-mono">수당 및 ROI 수익률 정밀 제어</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <RateInput 
              label="AI 데일리 노드 ROI" 
              value={dailyRate} 
              setValue={setDailyRate} 
              helper="Daily %" 
              color="blue"
            />
            <RateInput 
              label="추천 보너스 (Direct)" 
              value={directRate} 
              setValue={setDirectRate} 
              helper="Total %" 
              color="amber"
            />
            <RateInput 
              label="매칭 로드맵 (Roll-up)" 
              value={matchingRate} 
              setValue={setMatchingRate} 
              helper="Total %" 
              color="green"
            />
            <RateInput 
              label="글로벌 직급 공유풀" 
              value={globalPoolRate} 
              setValue={setGlobalPoolRate} 
              helper="Total %" 
              color="purple"
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <RateInput 
              label="회원 Max-Out 배수" 
              value={maxOutMultiplier} 
              setValue={setMaxOutMultiplier} 
              helper="Multiplier" 
              color="amber"
            />
            <RateInput 
              label="인출 수수료 (Fee)" 
              value={withdrawalFee} 
              setValue={setWithdrawalFee} 
              helper="Unit %" 
              color="blue"
            />
            <RateInput 
              label="최소 인출 가능액" 
              value={minWithdrawal} 
              setValue={setMinWithdrawal} 
              helper="USDT" 
              color="green"
            />
          </div>

          <button className="w-full mt-8 btn-gold py-2.5 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg shadow-accent-blue/5">
             <Play size={14} fill="currentColor" /> 수치 일괄 적용 및 엔진 동기화
          </button>
        </div>

        {/* Global Investment Reward (USDT -> CNYT) */}
        <div className="dashboard-card border-accent-blue/20 bg-accent-blue/5">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border-main">
             <Target size={16} className="text-accent-blue" />
             <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest font-mono">패키지 구매 리워드 (USDT → CNYT)</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
             <div className="text-center">
                <p className="text-[10px] text-text-muted font-bold uppercase mb-2">패키지 구매 액</p>
                <div className="bg-black/40 border border-white/10 px-6 py-3 rounded-xl">
                   <span className="text-2xl font-black text-white">1,000</span>
                   <span className="ml-2 text-xs font-bold text-slate-500">USDT</span>
                </div>
             </div>
             
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-accent-blue/30 flex items-center justify-center text-accent-blue animate-pulse">
                   <ArrowRight size={20} />
                </div>
                <p className="text-[9px] text-accent-blue font-black uppercase tracking-widest mt-2">AUTO REWARD</p>
             </div>

             <div className="text-center">
                <p className="text-[10px] text-text-muted font-bold uppercase mb-2">CNYT 지급 수치</p>
                <div className="bg-black/40 border border-accent-blue/30 px-6 py-3 rounded-xl flex items-center gap-3">
                   <input 
                      type="number" 
                      value={cnytRewardRatio}
                      onChange={(e) => setCnytRewardRatio(parseInt(e.target.value))}
                      className="bg-transparent text-2xl font-black text-accent-blue w-12 focus:outline-none tabular-nums text-center"
                   />
                   <span className="text-xs font-bold text-accent-blue">CNYT</span>
                </div>
             </div>
          </div>

          <div className="mt-6 p-3 bg-black/20 rounded border border-white/5 text-[10px] text-text-muted italic text-center">
             "회원이 패키지(노드) 투자를 시작하면 설정된 비율에 따라 CNYT가 즉시 지급됩니다. 1000 USDT 기준 수치입니다."
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Status Toggle */}
        <div className="dashboard-card border-border-main">
           <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border-main">
             <Target className="text-accent-blue" size={16} />
             <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest font-mono">정산 엔진 제어 (상태)</h3>
           </div>
           
           <div className="space-y-1.5">
            <EngineToggle label="1. AI 데일리 ROI (노드)" isActive />
            <EngineToggle label="2. 추천 보너스 (10%)" isActive />
            <EngineToggle label="3. 25단계 매칭 롤업" isActive />
            <EngineToggle label="4. 글로벌 직급 공유 풀" isActive />
            <EngineToggle label="5. CNYT 가입비 정산 (리워드 연동)" isActive />
         </div>
        </div>

        {/* DLQ Monitor */}
        <div className="dashboard-card border-red-500/20 bg-red-400/5">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle size={16} />
               <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-widest">실패한 트랜잭션 (DLQ 보류)</h3>
             </div>
             <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 uppercase">2건의 오류 감지</span>
           </div>
           
           <div className="space-y-2 mb-6">
             {logs.filter(l => l.status === 'FAILED').map(l => (
               <div key={l.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded break-words flex items-center justify-between group hover:border-red-500/30 transition-all">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-text-primary">{l.user} - <span className="text-red-400 font-mono">{l.amount}</span></p>
                    <p className="text-[9px] text-text-muted italic mt-0.5 uppercase tracking-tighter">{l.reason}</p>
                  </div>
                  <button className="text-[9px] font-black text-red-400 border border-red-400/30 px-2 py-1 rounded hover:bg-red-400/10 transition-all uppercase whitespace-nowrap">
                    재전송 시도
                  </button>
               </div>
             ))}
           </div>
           
           <button className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[10px] font-bold uppercase tracking-widest transition-all rounded">
             전체 실패 건 일괄 복구 프로토콜 실행
           </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="dashboard-card p-0 overflow-hidden border-border-main">
        <div className="p-6 border-b border-border-main bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-accent-blue" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">정산 장부 (실시간)</h3>
          </div>
          <button className="btn-outline-gold text-[10px] py-1 px-4 uppercase tracking-widest border-border-main">
            전체 감사 로그
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-48 text-[10px]">정산 일시</th>
              <th className="text-[10px]">회원 노드</th>
              <th className="text-[10px]">보너스 유형</th>
              <th className="text-[10px]">지급액</th>
              <th className="text-[10px]">엔진 상태</th>
              <th className="text-[10px]">내부 비고</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-white/[0.02]">
                <td className="font-mono text-[10px] text-text-muted">{l.date}</td>
                <td><span className="font-bold text-text-primary text-[11px]">{l.user}</span></td>
                <td>
                  <span className="text-[9px] text-text-muted bg-black/20 px-2 py-0.5 rounded border border-white/5 uppercase font-medium">
                    {l.type === 'DAILY_ROI' ? '데일리 ROI' : l.type === 'MATCHING' ? '매칭' : l.type === 'DIRECT' ? '추천' : l.type}
                  </span>
                </td>
                <td className="font-mono text-xs font-bold text-accent-blue">{l.amount}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {l.status.includes('SUCCESS') ? (
                       <>
                         <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                         <span className="text-[9px] font-bold text-accent-green uppercase">성공</span>
                       </>
                    ) : (
                      <>
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                         <span className="text-[9px] font-bold text-red-500 uppercase">시스템 오류</span>
                       </>
                    )}
                  </div>
                </td>
                <td className="text-text-muted text-[10px] italic font-medium">{l.reason === '-' ? '엔진 V7.2 자동 처리' : l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RateInput({ label, value, setValue, helper, color }: any) {
  const colors = {
    blue: 'text-accent-blue focus:border-accent-blue/50',
    amber: 'text-accent-amber focus:border-accent-amber/50',
    green: 'text-accent-green focus:border-accent-green/50',
    purple: 'text-accent-purple focus:border-accent-purple/50'
  } as any;

  return (
    <div className="flex flex-col gap-1.5">
       <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded px-3 py-1.5 hover:border-white/10 transition-all">
          <input 
             type="number" 
             value={value}
             onChange={(e) => setValue(parseFloat(e.target.value))}
             step="0.1"
             className={cn("bg-transparent text-lg font-black w-14 focus:outline-none tabular-nums", colors[color])}
          />
          <span className="text-[10px] font-bold text-slate-500 uppercase">{helper}</span>
       </div>
    </div>
  );
}

function EngineToggle({ label, isActive }: { label: string, isActive: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded bg-black/20 hover:bg-black/10 transition-all border border-border-main">
       <span className={cn("text-[11px] font-bold uppercase tracking-tighter", isActive ? "text-text-primary" : "text-text-muted opacity-50")}>
         {label}
       </span>
       <button className={cn(
         "w-8 h-4 rounded-full relative transition-all duration-300",
         isActive ? "bg-accent-green" : "bg-slate-700"
       )}>
         <div className={cn(
           "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
           isActive ? "right-0.5" : "left-0.5"
         )} />
       </button>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldAlert, Zap, Lock, Unlock, AlertTriangle, Activity, Database, RefreshCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export function CircuitBreaker() {
  const [reserveRatio, setReserveRatio] = useState(12.5);
  const [breakerStage, setBreakerStage] = useState<0 | 1 | 2 | 3>(1);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const getStageInfo = (stage: number) => {
    switch(stage) {
      case 1: return { label: 'STAGE 1: NORMAL', color: 'text-accent-green', desc: '모든 수당 USDT 100% 지급' };
      case 2: return { label: 'STAGE 2: GUARD', color: 'text-accent-amber', desc: 'Reserve 15% 미만 - USDT 70% / CNYT 30% 혼합' };
      case 3: return { label: 'STAGE 3: CRITICAL', color: 'text-red-500', desc: 'Reserve 10% 미만 - USDT 50% / CNYT 50% 강제 전환' };
      default: return { label: 'OFF', color: 'text-slate-500', desc: '시스템 제어 중단' };
    }
  };

  return (
    <div className="space-y-6 px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Control & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card border-border-main p-0 overflow-hidden shadow-2xl relative">
            {/* Warning Overlay if Stage 3 */}
            {breakerStage === 3 && (
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
            )}
            
            <div className="p-6 border-b border-border-main bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className={cn(breakerStage === 3 ? "text-red-500" : "text-accent-blue")} size={24} />
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">자본 손실 방지 및 서킷 브레이커</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">마스터 플랜 자본 보호 프로토콜 V7.2</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={cn(
                   "text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest",
                   breakerStage === 3 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                 )}>
                   {isManualOverride ? "수동 제어 모드" : "자동 AI 모니터링"}
                 </span>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Reserve Ratio Gauge */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <svg className="w-full h-full rotate-[-90deg]">
                     <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                     <circle 
                        cx="96" 
                        cy="96" 
                        r="88" 
                        fill="transparent" 
                        stroke={reserveRatio < 10 ? "#ef4444" : reserveRatio < 15 ? "#fbbf24" : "#38bdf8"} 
                        strokeWidth="12" 
                        strokeDasharray={552.92}
                        strokeDashoffset={552.92 * (1 - reserveRatio / 100)}
                        className="transition-all duration-1000 ease-out"
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-sm text-text-muted font-bold uppercase tracking-widest">RESERVE RATIO</span>
                     <span className={cn(
                       "text-4xl font-black tabular-nums transition-colors",
                       reserveRatio < 10 ? "text-red-500" : reserveRatio < 15 ? "text-accent-amber" : "text-accent-blue"
                     )}>
                       {reserveRatio.toFixed(1)}%
                     </span>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setReserveRatio(Math.max(0, reserveRatio - 1))} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded hover:bg-white/10">- 1% 시뮬레이션</button>
                  <button onClick={() => setReserveRatio(Math.min(100, reserveRatio + 1))} className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded hover:bg-white/10">+ 1% 시뮬레이션</button>
                </div>
              </div>

              {/* 3-Stage Indicator */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StageCard 
                  stage={1} 
                  active={breakerStage === 1} 
                  info={getStageInfo(1)} 
                  onClick={() => { setBreakerStage(1); setIsManualOverride(true); }}
                />
                <StageCard 
                  stage={2} 
                  active={breakerStage === 2} 
                  info={getStageInfo(2)} 
                  onClick={() => { setBreakerStage(2); setIsManualOverride(true); }}
                />
                <StageCard 
                  stage={3} 
                  active={breakerStage === 3} 
                  info={getStageInfo(3)} 
                  onClick={() => { setBreakerStage(3); setIsManualOverride(true); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Emergency Controls */}
        <div className="space-y-6">
          <div className="dashboard-card border-red-500/40 bg-red-500/5">
             <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={20} />
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">EMERGENCY KILL SWITCH</h4>
             </div>
             
             <p className="text-[10px] text-red-100/60 font-medium leading-relaxed mb-6">
                비상 사태 발생 시 플랫폼 내의 모든 출금 게이트웨이를 즉각적으로 차단합니다. 
                이 작업은 즉시 실행되며, 모든 Pending 트랜잭션은 홀딩 상태로 전환됩니다.
             </p>

             <button 
                onClick={() => setKillSwitchActive(!killSwitchActive)}
                className={cn(
                  "w-full py-6 rounded-xl border-b-4 font-black text-sm uppercase tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-2",
                  killSwitchActive 
                    ? "bg-accent-green border-accent-green/60 text-black shadow-[0_0_20px_rgba(74,222,128,0.3)]" 
                    : "bg-red-600 border-red-800 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:scale-[1.02]"
                )}
             >
                {killSwitchActive ? (
                  <>
                    <Unlock size={24} />
                    시스템 정상화 실행
                  </>
                ) : (
                  <>
                    <Lock size={24} />
                    전체 출금 즉시 차단
                  </>
                )}
             </button>
          </div>

          <div className="dashboard-card border-border-main">
             <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">시스템 리밸런싱 현황</h4>
             <div className="space-y-4">
                <RebalanceStat label="USDT 지급 비율" value={breakerStage === 3 ? "50%" : breakerStage === 2 ? "70%" : "100%"} />
                <RebalanceStat label="CNYT 지급 비율" value={breakerStage === 3 ? "50%" : breakerStage === 2 ? "30%" : "0%"} />
                <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-text-muted uppercase font-bold">CNYT 유동성 공급</span>
                    <span className="text-[10px] text-accent-blue font-mono">STABLE</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-blue w-[85%]" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage, active, info, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all text-left group",
        active 
          ? (stage === 1 ? "bg-accent-green/10 border-accent-green/30" : stage === 2 ? "bg-accent-amber/10 border-accent-amber/30" : "bg-red-500/10 border-red-500/30")
          : "bg-black/20 border-white/5 hover:border-white/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          active ? info.color : "text-text-muted"
        )}>
          STAGE {stage}
        </span>
        {active && <Zap size={12} className={info.color} />}
      </div>
      <p className={cn("text-xs font-bold mb-1", active ? "text-text-primary" : "text-text-muted")}>{info.label}</p>
      <p className="text-[9px] text-text-muted italic leading-tight">{info.desc}</p>
    </button>
  );
}

function RebalanceStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[11px] text-text-primary">{label}</span>
      <span className="text-sm font-black text-accent-blue font-mono">{value}</span>
    </div>
  );
}

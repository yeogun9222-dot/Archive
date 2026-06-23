import { useState } from 'react';
import { Activity, ShieldAlert, TrendingUp, Lock, RefreshCcw, Cpu, Globe, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const PRICE_HISTORY = [
  { time: '10:00', price: 0.0310 },
  { time: '11:00', price: 0.0315 },
  { time: '12:00', price: 0.0322 },
  { time: '13:00', price: 0.0318 },
  { time: '14:00', price: 0.0325 },
  { time: '15:00', price: 0.0331 },
];

export function TokenControl() {
  const [indexPrice, setIndexPrice] = useState(0.0331);
  const [p2pBuyPrice, setP2pBuyPrice] = useState(1.9); // Dividend 1.9%
  const [m14LockDate, setM14LockDate] = useState('2026-12-31');
  const [displayYield, setDisplayYield] = useState(1.8);
  const [useRandomAlgo, setUseRandomAlgo] = useState(true);

  return (
    <div className="space-y-6 px-6 pb-12">
      {/* Dynamic Data Staging Row (Item 4) */}
      <div className="dashboard-card border-accent-amber/30 bg-accent-amber/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-lg text-accent-amber">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">실시간 데이터 조작 및 투명성 연출 (8.5항)</h3>
              <p className="text-[10px] text-accent-amber font-bold uppercase tracking-widest mt-1">
                사용자 프론트엔드 노출용 동적 수익률 및 거점 성과 커스텀 세팅
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">연출용 타겟 수익률</span>
               <div className="flex items-center gap-2">
                 <input 
                    type="number" 
                    value={displayYield}
                    onChange={(e) => setDisplayYield(parseFloat(e.target.value))}
                    step="0.1"
                    className="bg-transparent text-xl font-black text-accent-amber w-16 focus:outline-none tabular-nums"
                 />
                 <span className="text-lg font-bold text-accent-amber/50">%</span>
               </div>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">알고리즘 모드</span>
               <button 
                  onClick={() => setUseRandomAlgo(!useRandomAlgo)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all",
                    useRandomAlgo ? "bg-accent-amber text-black" : "bg-slate-700 text-white"
                  )}
               >
                  {useRandomAlgo ? "랜덤 오차 작동 중" : "고정값 출력 모드"}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Stats & CNYT Ecosystem (Item 5) */}
        <div className="lg:col-span-2 dashboard-card flex flex-col">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2">
               <Activity size={18} className="text-purple-400" />
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">CNYT 생태계 및 M14 제어</h3>
             </div>
             <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-3">
                   <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 uppercase font-black">M14 락업 해제</span>
                      <input 
                         type="date" 
                         value={m14LockDate} 
                         onChange={(e) => setM14LockDate(e.target.value)}
                         className="bg-transparent text-[10px] font-bold text-purple-400 focus:outline-none"
                      />
                   </div>
                   <Lock size={14} className="text-purple-400" />
                </div>
             </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
             <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">인덱스 가격</span>
                <span className="text-xl font-black text-accent-blue">${indexPrice.toFixed(4)}</span>
             </div>
             <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">P2P 매입 단가</span>
                <div className="flex items-baseline gap-1">
                   <input 
                      type="number" 
                      value={p2pBuyPrice}
                      onChange={(e) => setP2pBuyPrice(parseFloat(e.target.value))}
                      className="bg-transparent text-xl font-black text-green-400 w-12 focus:outline-none"
                   />
                   <span className="text-[10px] font-bold text-green-400/50">%</span>
                </div>
             </div>
             <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">유동성</span>
                <span className="text-xl font-black text-purple-400">$375K</span>
             </div>
             <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">전환 수수료</span>
                <span className="text-xl font-black text-white">0.5%</span>
             </div>
           </div>

           <div className="h-[180px] mt-auto">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={PRICE_HISTORY}>
                 <Area type="monotone" dataKey="price" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Region Performance Customization (Item 4) */}
        <div className="dashboard-card border-border-main">
           <div className="flex items-center gap-2 mb-6">
             <Globe className="text-accent-blue" size={18} />
             <h3 className="text-sm font-bold text-white uppercase">거점별 성과 데이터 매칭</h3>
           </div>
           
           <div className="space-y-4">
              <RegionRow name="APAC (아시아)" stat="42,500 USDT" growth="+12%" />
              <RegionRow name="EMEA (유럽)" stat="18,100 USDT" growth="+5%" />
              <RegionRow name="AMER (미주)" stat="9,400 USDT" growth="+2%" />
              <RegionRow name="CIS (중앙아)" stat="12,500 USDT" growth="+24%" />
              
              <div className="pt-6 mt-6 border-t border-white/5">
                 <button className="w-full py-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> 전체 거점 데이터 새로고침
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="dashboard-card border-blue-500/10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <TrendingUp size={14} className="text-blue-500" /> 토큰 배분 현황 (감사)
            </h3>
            <div className="space-y-4">
               <AuditStat label="회원 가입 보상" value="5,420,000" color="blue" />
               <AuditStat label="직접 교환 풀 (Swap Pool)" value="3,210,000" color="purple" />
               <AuditStat label="소각 지갑 (M14 이후)" value="0" color="slate" />
            </div>
         </div>

         <div className="dashboard-card border-green-500/10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <ShieldAlert size={14} className="text-green-500" /> 유동성 풀 보호 (LP)
            </h3>
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-full border-8 border-green-500/20 border-t-green-500 flex items-center justify-center relative">
                  <span className="text-xs font-black text-white">84%</span>
               </div>
               <div className="flex-1">
                  <p className="text-xs font-bold text-slate-300 uppercase">예비 담보 비율</p>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    유동성 노드는 V7.2 정책에 따라 83%의 준비금 비율을 유지합니다.
                    플래시 크래시 방지를 위해 자동 스케일링이 활성화되어 있습니다.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function RegionRow({ name, stat, growth }: { name: string, stat: string, growth: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 whitespace-nowrap overflow-hidden">
       <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white uppercase">{name}</span>
          <span className="text-[9px] text-accent-green font-bold opacity-60">({growth} 대비 성과)</span>
       </div>
       <span className="text-xs font-black text-slate-300 font-mono">{stat}</span>
    </div>
  );
}

function AuditStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
       <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
       <span className="text-xs font-black text-white font-mono tabular-nums">{value} <span className="text-[9px] text-slate-500 ml-1">CNYT</span></span>
    </div>
  );
}

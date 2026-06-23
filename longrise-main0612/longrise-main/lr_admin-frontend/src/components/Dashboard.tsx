import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, Activity, Zap, Ban, ArrowRight, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsCard } from './shared';
import { api } from '../services';

export function Dashboard() {
  const [data, setData] = useState<any>({
    revenueData: { totalBalance: 0, totalWithdrawals: 0 },
    membersStats: { byPackage: { Flexible: 0, Basic: 0, Standard: 0, Premium: 0, VIP: 0 } },
    pendingCounts: { withdrawals: 0, fds: 0 },
    pendingTasks: [],
    actionQueue: [],
  });
  const [settings, setSettings] = useState<any>({
    daily_roi_percent: 1.5,
    cnyt_reward_engine_enabled: true,
    withdrawals_enabled: true,
    fds_auto_freeze_enabled: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResponse, settingsResponse] = await Promise.all([
          api.getAdminDashboard(),
          api.getCoreSettings(),
        ]);
        if (dashboardResponse.success && dashboardResponse.data) {
          setData(dashboardResponse.data);
          setError(null);
        }
        if (settingsResponse.success && settingsResponse.data) {
          setSettings(settingsResponse.data);
          setError(null);
        }
      } catch (err: any) {
        setError(err?.message || '대시보드 데이터를 불러오지 못했습니다.');
      }
    };
    load();
  }, []);

  const reloadDashboard = async () => {
    const response = await api.getAdminDashboard();
    if (response.success && response.data) {
      setData(response.data);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        api.updateCoreSetting('daily_roi_percent', String(settings.daily_roi_percent), 'dashboard save'),
        api.updateCoreSetting('cnyt_reward_engine_enabled', String(settings.cnyt_reward_engine_enabled), 'dashboard save'),
      ]);
      setError(null);
      setMessage('운영 설정이 반영되었습니다.');
    } catch (err: any) {
      setError(err?.message || '설정 저장에 실패했습니다.');
    }
  };

  const toggleWithdrawals = async () => {
    try {
      const nextValue = !settings.withdrawals_enabled;
      await api.updateCoreSetting('withdrawals_enabled', String(nextValue), 'dashboard toggle');
      setSettings((prev: any) => ({ ...prev, withdrawals_enabled: nextValue }));
      setError(null);
      setMessage(nextValue ? '출금이 다시 활성화되었습니다.' : '출금이 일시 중단되었습니다.');
    } catch (err: any) {
      setError(err?.message || '출금 제어에 실패했습니다.');
    }
  };

  const toggleFdsFreeze = async () => {
    try {
      const nextValue = !settings.fds_auto_freeze_enabled;
      await api.updateCoreSetting('fds_auto_freeze_enabled', String(nextValue), 'dashboard toggle');
      setSettings((prev: any) => ({ ...prev, fds_auto_freeze_enabled: nextValue }));
      setError(null);
      setMessage(nextValue ? 'FDS 일괄 동결이 활성화되었습니다.' : 'FDS 일괄 동결이 해제되었습니다.');
    } catch (err: any) {
      setError(err?.message || 'FDS 제어에 실패했습니다.');
    }
  };

  const handleWithdrawalDecision = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await api.approveWithdrawal(withdrawalId, 'Dashboard queue approval');
      } else {
        await api.rejectWithdrawal(withdrawalId, 'Rejected from dashboard queue', 'Dashboard queue rejection');
      }
      await reloadDashboard();
      setError(null);
      setMessage(`출금 ${action === 'approve' ? '승인' : '반려'}가 완료되었습니다.`);
    } catch (err: any) {
      setError(err?.message || '출금 처리에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="px-6 p-4 rounded-lg border border-green-500/40 bg-green-500/10">
          <p className="text-sm text-green-400">{message}</p>
        </div>
      )}
      {/* 에러 표시 */}
      {error && (
        <div className="px-6 p-4 rounded-lg border border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 1. 총 입금/출금 핵심 지표 (Priority Metrics) */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
         <StatsCard
            title="총 입금액"
            value={(data.revenueData?.totalBalance || 0).toLocaleString()}
            unit="USDT"
            color="blue"
            icon={<Wallet size={24} />}
            size="lg"
         />
         <StatsCard
            title="총 출금액"
            value={(data.revenueData?.totalWithdrawals || 0).toLocaleString()}
            unit="USDT"
            color="amber"
            icon={<ArrowRight size={24} />}
            size="lg"
         />
      </div>

      {/* 2. 추가 모니터링 지표 (Compact Cards) */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
         <StatsCard
            title="전체 회원수"
            value={data.membersStats?.totalMembers || 0}
            unit="명"
            color="blue"
            icon={<Users size={20} />}
            size="sm"
         />
         <StatsCard
            title="승인 대기 요청"
            value={data.pendingCounts?.withdrawals || 0}
            unit="건"
            color="amber"
            icon={<ClipboardCheck size={20} />}
            size="sm"
         />
         <StatsCard
            title="이상거래 감지"
            value={data.pendingCounts?.fds || 0}
            unit="건"
            color="red"
            icon={<Activity size={20} />}
            size="sm"
         />
      </div>

      {/* 2. 패키지 활성화 분포 (Package Activation) - 5가지 등급별 투자 현황 */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
         <StatsCard
            title="Flexible"
            value={data.membersStats?.byPackage?.Flexible || 0}
            unit="100 USDT"
            color="blue"
            size="sm"
         />
         <StatsCard
            title="Basic"
            value={data.membersStats?.byPackage?.Basic || 0}
            unit="200 USDT"
            color="blue"
            size="sm"
         />
         <StatsCard
            title="Standard"
            value={data.membersStats?.byPackage?.Standard || 0}
            unit="500 USDT"
            color="purple"
            size="sm"
         />
         <StatsCard
            title="Premium"
            value={data.membersStats?.byPackage?.Premium || 0}
            unit="1000 USDT"
            color="amber"
            size="sm"
         />
         <StatsCard
            title="VIP"
            value={data.membersStats?.byPackage?.VIP || 0}
            unit="5000 USDT"
            color="red"
            size="sm"
         />
      </div>

      {/* 3. 메인 제어 센터 (Main Control Hub) - 여기서 다 누르고 조절함 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-6">

        {/* Quick ROI & Payout Control */}
        <div className="xl:col-span-2 admin-card">
           <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
              <Zap size={18} className="text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">실시간 운영 엔진 제어 (Admin Commander)</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ROI 제어 섹션 */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">데일리 ROI 및 수당 관리</p>
                 <div className="bg-slate-900/50 border border-slate-600 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">AI 데일리 ROI</span>
                       <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded border border-blue-500/30">
                          <input type="number" value={settings.daily_roi_percent} onChange={(e) => setSettings((prev: any) => ({ ...prev, daily_roi_percent: e.target.value }))} className="bg-transparent text-sm font-black text-blue-400 w-10 outline-none" />
                          <span className="text-[10px] font-bold text-blue-400/50">%</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">CNYT 가입 정산 엔진</span>
                       <button onClick={() => setSettings((prev: any) => ({ ...prev, cnyt_reward_engine_enabled: !prev.cnyt_reward_engine_enabled }))} className={`w-10 h-5 rounded-full relative ${settings.cnyt_reward_engine_enabled ? 'bg-green-500' : 'bg-slate-600'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.cnyt_reward_engine_enabled ? 'right-0.5' : 'left-0.5'}`} />
                       </button>
                    </div>
                    <button onClick={handleSaveSettings} className="w-full py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-blue-700 transition-all">설정 수치 즉시 반영</button>
                 </div>
              </div>

              {/* CNYT 리워드 비율 및 긴급 제어 */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">기능 제어 및 긴급 액션</p>
                 <div className="bg-slate-900/50 border border-slate-600 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-white">CNYT 리워드 배수</span>
                       <span className="text-xs font-black text-amber-400">1000 : 10</span>
                    </div>
                    <button onClick={toggleWithdrawals} className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all">
                       <Ban size={12} /> 전체 출금 일시 중단
                    </button>
                    <button onClick={toggleFdsFreeze} className="w-full py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all">
                       FDS 이상거래 일괄 동결
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* 심사 대기 간략 피드 (Actionable Feed) */}
        <div className="admin-card">
           <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-700">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">미처리 승인 알림 (Pending)</h3>
              <span className="text-[9px] font-black text-blue-400 uppercase">새 알림 0건</span>
           </div>

           {data.pendingTasks.length === 0 ? (
             <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
               <p className="text-sm font-bold text-white">대기 중인 승인 업무가 없습니다.</p>
               <p className="mt-2 text-xs text-slate-400">실제 운영 데이터가 연결되면 이 영역에 표시됩니다.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {data.pendingTasks.map((task: any) => (
                <QuickTaskItem key={`${task.name}-${task.time}`} {...task} />
              ))}
             </div>
           )}

           <button className="w-full mt-8 py-2 border border-slate-600 rounded text-[10px] font-black text-slate-400 uppercase hover:bg-slate-700/50 transition-all">전체 업무 창으로 이동</button>
        </div>

      </div>

      {/* 3. 처리 대기 큐 (Simplified Work Queue) - 바로 버튼 눌러서 처리 */}
      <div className="px-6 pb-12">
         <div className="admin-card p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">주요 업무 승인 대기열 (Action Queue)</h3>
               <button className="text-[10px] font-bold text-blue-400 uppercase">전체 보기</button>
            </div>

            <table className="admin-table">
               <thead>
                  <tr>
                     <th className="text-center text-[10px]">유형</th>
                     <th className="text-center text-[10px]">회원 정보</th>
                     <th className="text-center text-[10px]">요청 내용</th>
                     <th className="text-center text-[10px]">시간</th>
                     <th className="text-center text-[10px]">최종 결정</th>
                  </tr>
               </thead>
               <tbody>
                  {data.actionQueue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                        처리 대기 중인 업무가 없습니다.
                      </td>
                    </tr>
                  )}
                  {data.actionQueue.map((item: any) => (
                    <QueueRow key={`${item.type}-${item.user}-${item.time}`} {...item} onDecision={handleWithdrawalDecision} />
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}


function QueueRow({ id, type, user, amount, time, onDecision }: any) {
  return (
    <tr>
       <td className="text-center">
          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border", type === '출금' ? 'text-red-400 border-red-500/20' : 'text-blue-400 border-blue-500/20')}>{type}</span>
       </td>
       <td className="text-center"><span className="text-[11px] font-bold text-white">{user}</span></td>
       <td className="text-center text-[11px] font-black text-blue-400">{amount}</td>
       <td className="text-center text-[10px] text-slate-400 font-mono">{time}</td>
       <td className="text-center">
          <div className="flex justify-center gap-2">
             <button onClick={() => onDecision?.(id, 'reject')} className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded hover:bg-red-700 transition-all uppercase">반려</button>
             <button onClick={() => onDecision?.(id, 'approve')} className="px-3 py-1 bg-green-600 text-white text-[10px] font-black rounded hover:bg-green-700 transition-all uppercase">승인</button>
          </div>
       </td>
    </tr>
  );
}

function QuickTaskItem({ name, info, msg, time }: any) {
  return (
    <div className="flex items-center justify-between group py-1.5 border-b border-slate-700/30 last:border-0">
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex flex-col shrink-0">
             <span className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors whitespace-nowrap">{name}</span>
             <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{time}</span>
          </div>
          <div className="h-3 w-px bg-slate-600 shrink-0" />
          <div className="flex items-center gap-2 overflow-hidden">
             <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">[{info}]</span>
             <span className="text-[10px] text-red-400 font-bold tracking-tighter truncate">{msg}</span>
          </div>
       </div>
       <ArrowRight size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
    </div>
  );
}

/**
 * Payout Dashboard - Main dashboard for payout management
 */

import React from 'react';
import { DashboardPage } from '../../../layouts/DashboardLayout';
import { StatsCard } from '../../../components/shared/StatsCard';
import { LoadingButton } from '../../../components/shared/LoadingStates';
import { ActionButtonGroup } from '../../../components/shared/ActionButtonGroup';
import { Zap, DollarSign, Users, Activity, TrendingUp, Calculator } from 'lucide-react';
import { PayoutStats } from '../types';

interface PayoutDashboardProps {
  stats?: PayoutStats;
  loading?: boolean;
  onGenerateROI?: () => void;
  onProcessBatch?: () => void;
  onViewSettings?: () => void;
}

export function PayoutDashboard({
  stats,
  loading = false,
  onGenerateROI,
  onProcessBatch,
  onViewSettings,
}: PayoutDashboardProps) {
  const actions = [
    {
      key: 'generate-roi',
      label: 'Daily ROI 생성',
      icon: <Calculator className="w-4 h-4" />,
      onClick: onGenerateROI || (() => {}),
      variant: 'primary' as const,
    },
    {
      key: 'process-batch',
      label: '일괄 처리',
      icon: <Zap className="w-4 h-4" />,
      onClick: onProcessBatch || (() => {}),
      variant: 'secondary' as const,
    },
    {
      key: 'settings',
      label: '설정 관리',
      icon: <Activity className="w-4 h-4" />,
      onClick: onViewSettings || (() => {}),
      variant: 'secondary' as const,
    },
  ];

  return (
    <DashboardPage
      title="배당 엔진"
      subtitle="배당 생성 및 처리 관리"
      actions={<ActionButtonGroup actions={actions} />}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="총 배당 건수"
          value={stats?.total_payouts || 0}
          format="number"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="총 배당 금액"
          value={stats?.total_amount || 0}
          format="currency"
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="대기 중"
          value={stats?.pending_count || 0}
          format="number"
          icon={<Activity className="w-5 h-5" />}
          color="amber"
          loading={loading}
        />
        <StatsCard
          title="오늘 처리"
          value={stats?.today_amount || 0}
          format="currency"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Payout Type Statistics */}
      {stats && (
        <div className="bg-surface-primary border border-border-main rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">배당 유형별 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div key={type} className="bg-surface-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    {getPayoutTypeLabel(type)}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {data.count}건
                  </span>
                </div>
                <div className="text-lg font-bold text-text-primary">
                  ${data.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recent_payouts && stats.recent_payouts.length > 0 && (
        <div className="bg-surface-primary border border-border-main rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">최근 배당 내역</h3>
          <div className="space-y-3">
            {stats.recent_payouts.slice(0, 5).map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between py-2 border-b border-border-main last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {payout.user?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getPayoutTypeLabel(payout.type)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    ${payout.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(payout.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardPage>
  );
}

function getPayoutTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    daily_roi: 'Daily ROI',
    direct_bonus: '추천 보너스',
    rollup_bonus: '롤업 보너스',
    rank_share: '랭크 분배',
    cnyt_airdrop: 'CNYT 에어드랍',
    promotion: '프로모션',
    referral_bonus: '추천인 보너스',
    leadership_bonus: '리더십 보너스',
  };
  return labels[type] || type;
}
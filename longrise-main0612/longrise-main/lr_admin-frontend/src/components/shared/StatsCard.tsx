/**
 * StatsCard Component - Reusable statistics/metrics display
 * Used across admin and user platforms for KPIs
 */

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorVariants = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

const sizeVariants = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

export function StatsCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'blue',
  size = 'md',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'admin-card border rounded-lg transition-all hover:border-opacity-100',
        colorVariants[color],
        sizeVariants[size],
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</p>
          {icon && <div className="text-lg">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black">{value}</p>
          {unit && <span className="text-xs font-bold opacity-60">{unit}</span>}
        </div>

        {trend && trendValue !== undefined && (
          <div className="flex items-center gap-1 text-xs font-bold">
            {trend === 'up' && <TrendingUp size={12} className="text-green-400" />}
            {trend === 'down' && <TrendingDown size={12} className="text-red-400" />}
            <span className={trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : ''}>
              {trend === 'up' ? '+' : ''}{trendValue}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
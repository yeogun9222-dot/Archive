/**
 * StatusBadge Component - Reusable status indicator component
 * Provides consistent styling for different status types across the admin panel
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'dot' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Define status color mappings for consistent theming
const statusVariants = {
  // Common statuses
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',

  // User statuses
  verified: 'bg-blue-100 text-blue-800 border-blue-200',
  unverified: 'bg-orange-100 text-orange-800 border-orange-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',

  // Transaction statuses
  completed: 'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  failed: 'bg-red-100 text-red-800 border-red-200',

  // Investment statuses
  invested: 'bg-purple-100 text-purple-800 border-purple-200',
  matured: 'bg-indigo-100 text-indigo-800 border-indigo-200',

  // P2P statuses
  trading: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  dispute: 'bg-orange-100 text-orange-800 border-orange-200',

  // System statuses
  online: 'bg-green-100 text-green-800 border-green-200',
  offline: 'bg-gray-100 text-gray-800 border-gray-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',

  // Alert severities
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',

  // Default fallback
  default: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

const dotVariants = {
  // Common statuses
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  pending: 'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-400',

  // User statuses
  verified: 'bg-blue-500',
  unverified: 'bg-orange-500',
  blocked: 'bg-red-500',
  suspended: 'bg-yellow-500',

  // Transaction statuses
  completed: 'bg-green-500',
  processing: 'bg-blue-500',
  failed: 'bg-red-500',

  // Investment statuses
  invested: 'bg-purple-500',
  matured: 'bg-indigo-500',

  // P2P statuses
  trading: 'bg-cyan-500',
  dispute: 'bg-orange-500',

  // System statuses
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  maintenance: 'bg-yellow-500',
  error: 'bg-red-500',

  // Alert severities
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',

  // Default fallback
  default: 'bg-gray-400',
} as const;

const sizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
};

const dotSizeVariants = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

// Normalize status string for consistent lookup
const normalizeStatus = (status: string): string => {
  return status.toLowerCase().replace(/\s+/g, '_');
};

// Get display text for status
const getDisplayText = (status: string): string => {
  const normalized = normalizeStatus(status);

  // Handle special cases for better display
  const displayMappings: Record<string, string> = {
    'in_progress': '진행중',
    'not_started': '미시작',
    'on_hold': '보류',
    'under_review': '검토중',
  };

  return displayMappings[normalized] || status;
};

export function StatusBadge({
  status,
  variant = 'default',
  size = 'md',
  className,
}: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);
  const displayText = getDisplayText(status);

  if (variant === 'dot') {
    const dotColor = dotVariants[normalizedStatus as keyof typeof dotVariants] || dotVariants.default;

    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div
          className={cn(
            'rounded-full',
            dotSizeVariants[size],
            dotColor
          )}
        />
        <span className={cn(
          'text-text-primary',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {displayText}
        </span>
      </div>
    );
  }

  const statusColor = statusVariants[normalizedStatus as keyof typeof statusVariants] || statusVariants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeVariants[size],
        variant === 'outlined' ? `border ${statusColor}` : statusColor,
        variant === 'outlined' && 'bg-transparent',
        className
      )}
    >
      {displayText}
    </span>
  );
}

// Convenience components for specific domains
export function UserStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'active' | 'inactive' | 'verified' | 'unverified' | 'blocked' | 'suspended' }) {
  return <StatusBadge status={status} {...props} />;
}

export function TransactionStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'pending' | 'completed' | 'processing' | 'failed' | 'cancelled' }) {
  return <StatusBadge status={status} {...props} />;
}

export function InvestmentStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'active' | 'inactive' | 'invested' | 'matured' | 'cancelled' }) {
  return <StatusBadge status={status} {...props} />;
}

export function SystemStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'online' | 'offline' | 'maintenance' | 'error' }) {
  return <StatusBadge status={status} variant="dot" {...props} />;
}

export function AlertSeverityBadge({ severity, ...props }: Omit<StatusBadgeProps, 'status'> & { severity: 'low' | 'medium' | 'high' | 'critical' }) {
  return <StatusBadge status={severity} {...props} />;
}
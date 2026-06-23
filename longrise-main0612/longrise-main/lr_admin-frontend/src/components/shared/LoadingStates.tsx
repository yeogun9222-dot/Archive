/**
 * LoadingStates Components - Reusable loading indicators and skeleton screens
 * Provides consistent loading UX across the admin panel
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { RefreshCw, Loader2 } from 'lucide-react';

// Spinner component
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'default', className }: SpinnerProps) {
  const sizeVariants = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorVariants = {
    default: 'text-text-secondary',
    primary: 'text-primary',
    white: 'text-white',
  };

  return (
    <RefreshCw
      className={cn(
        'animate-spin',
        sizeVariants[size],
        colorVariants[variant],
        className
      )}
    />
  );
}

// Loading button component
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  loading = false,
  children,
  loadingText,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const sizeVariants = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-surface-secondary text-text-primary border border-border-main hover:bg-surface-secondary/80 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeVariants[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? (loadingText || '처리중...') : children}
    </button>
  );
}

// Page loader component
export interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageLoader({ message = '로딩 중...', size = 'md', className }: PageLoaderProps) {
  const sizeVariants = {
    sm: { spinner: 'lg', text: 'text-sm', container: 'py-8' },
    md: { spinner: 'xl', text: 'text-base', container: 'py-12' },
    lg: { spinner: 'xl', text: 'text-lg', container: 'py-16' },
  };

  const variant = sizeVariants[size];

  return (
    <div className={cn('flex flex-col items-center justify-center', variant.container, className)}>
      <Spinner size={variant.spinner as any} variant="primary" />
      <p className={cn('mt-4 text-text-secondary', variant.text)}>{message}</p>
    </div>
  );
}

// Skeleton components
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'animate-pulse bg-surface-secondary',
        variantStyles[variant],
        variant === 'circular' && 'w-10 h-10',
        variant === 'rectangular' && 'w-full h-32',
        className
      )}
      style={style}
    />
  );
}

// Table skeleton
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true, className }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-surface-secondary border-b border-border-main">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <Skeleton className="h-4" width={`${60 + Math.random() * 40}%`} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border-main">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton className="h-4" width={`${40 + Math.random() * 50}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card skeleton
export interface CardSkeletonProps {
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({ showAvatar = false, showImage = false, lines = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn('p-4 space-y-4 bg-surface-primary border border-border-main rounded-lg', className)}>
      {showImage && <Skeleton variant="rectangular" height={200} />}

      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-2 flex-1">
              <Skeleton width="40%" />
              <Skeleton width="20%" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === lines - 1 ? `${50 + Math.random() * 30}%` : '100%'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// List skeleton
export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ListSkeleton({ items = 5, showAvatar = false, showActions = false, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-3 bg-surface-primary border border-border-main rounded-lg"
        >
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}

          <div className="flex-1 space-y-2">
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Skeleton variant="rectangular" width={60} height={32} />
              <Skeleton variant="rectangular" width={60} height={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Dashboard skeleton
export interface DashboardSkeletonProps {
  cards?: number;
  showChart?: boolean;
  showTable?: boolean;
  className?: string;
}

export function DashboardSkeleton({ cards = 4, showChart = true, showTable = true, className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="p-4 bg-surface-primary border border-border-main rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Skeleton width="60%" />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
            <Skeleton className="h-8 mb-2" width="80%" />
            <Skeleton width="40%" />
          </div>
        ))}
      </div>

      {/* Chart */}
      {showChart && (
        <div className="p-6 bg-surface-primary border border-border-main rounded-lg">
          <div className="mb-4">
            <Skeleton className="h-6 mb-2" width="30%" />
            <Skeleton width="50%" />
          </div>
          <Skeleton variant="rectangular" height={300} />
        </div>
      )}

      {/* Table */}
      {showTable && (
        <div className="bg-surface-primary border border-border-main rounded-lg">
          <div className="p-4 border-b border-border-main">
            <Skeleton className="h-6" width="25%" />
          </div>
          <TableSkeleton rows={8} columns={5} showHeader={true} />
        </div>
      )}
    </div>
  );
}

// Empty state component
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-surface-secondary rounded-full">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>

      {description && (
        <p className="text-text-secondary mb-6 max-w-md">{description}</p>
      )}

      {action && (
        <LoadingButton
          onClick={action.onClick}
          variant={action.variant || 'primary'}
        >
          {action.label}
        </LoadingButton>
      )}
    </div>
  );
}
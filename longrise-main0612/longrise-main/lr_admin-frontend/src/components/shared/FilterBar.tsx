/**
 * FilterBar Component - Reusable search and filter interface
 * Provides consistent filtering functionality across admin panel pages
 */

import React, { ReactNode, useState } from 'react';
import { cn } from '../../lib/utils';
import { Search, Filter, X, Calendar, RotateCcw, Download } from 'lucide-react';
import { SearchInput, Select, DateInput } from './FormControls';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'daterange' | 'text' | 'number';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface FilterBarProps {
  title?: string;
  searchConfig?: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
  };
  filters?: FilterOption[];
  actions?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onReset?: () => void;
  className?: string;
  compact?: boolean;
}

export function FilterBar({
  title,
  searchConfig,
  filters = [],
  actions = [],
  onReset,
  className,
  compact = false,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Check if any filters have values
  const hasActiveFilters = filters.some(filter => filter.value || localFilters[filter.key]);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    const filter = filters.find(f => f.key === key);
    filter?.onChange?.(value);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset?.();
  };

  const renderFilter = (filter: FilterOption) => {
    const currentValue = filter.value || localFilters[filter.key] || '';

    switch (filter.type) {
      case 'select':
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={currentValue}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            options={filter.options || []}
            size="sm"
            containerClassName="min-w-[140px]"
          />
        );

      case 'date':
        return (
          <DateInput
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={currentValue}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            size="sm"
            containerClassName="min-w-[140px]"
          />
        );

      case 'daterange':
        return (
          <div key={filter.key} className="flex items-center gap-2">
            <DateInput
              placeholder="시작일"
              value={localFilters[`${filter.key}_start`] || ''}
              onChange={(e) => handleFilterChange(`${filter.key}_start`, e.target.value)}
              size="sm"
              containerClassName="min-w-[120px]"
            />
            <span className="text-text-secondary">~</span>
            <DateInput
              placeholder="종료일"
              value={localFilters[`${filter.key}_end`] || ''}
              onChange={(e) => handleFilterChange(`${filter.key}_end`, e.target.value)}
              size="sm"
              containerClassName="min-w-[120px]"
            />
          </div>
        );

      case 'text':
      case 'number':
        return (
          <div key={filter.key} className="min-w-[140px]">
            <input
              type={filter.type}
              placeholder={filter.placeholder || filter.label}
              value={currentValue}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-border-main rounded-md bg-surface-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={cn('bg-surface-primary border border-border-main rounded-lg p-3', className)}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          {searchConfig && (
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                placeholder={searchConfig.placeholder || '검색...'}
                value={searchConfig.value}
                onChange={(e) => searchConfig.onChange?.(e.target.value)}
                onSearch={searchConfig.onSearch}
                size="sm"
              />
            </div>
          )}

          {/* Quick Filters */}
          {filters.slice(0, 2).map(renderFilter)}

          {/* More Filters Button */}
          {filters.length > 2 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors',
                showFilters || hasActiveFilters
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-main bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80'
              )}
            >
              <Filter className="w-4 h-4" />
              필터 {hasActiveFilters && `(${filters.filter(f => f.value || localFilters[f.key]).length})`}
            </button>
          )}

          {/* Actions */}
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
                action.variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
                action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                (!action.variant || action.variant === 'secondary') && 'border border-border-main bg-surface-secondary text-text-primary hover:bg-surface-secondary/80'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          {/* Reset */}
          {(hasActiveFilters || (searchConfig?.value && searchConfig.value.length > 0)) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          )}
        </div>

        {/* Extended Filters */}
        {showFilters && filters.length > 2 && (
          <div className="mt-3 pt-3 border-t border-border-main">
            <div className="flex items-center gap-3 flex-wrap">
              {filters.slice(2).map(renderFilter)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-surface-primary border border-border-main rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-main">
        <div className="flex items-center gap-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}

          {/* Search */}
          {searchConfig && (
            <div className="min-w-[300px]">
              <SearchInput
                placeholder={searchConfig.placeholder || '검색...'}
                value={searchConfig.value}
                onChange={(e) => searchConfig.onChange?.(e.target.value)}
                onSearch={searchConfig.onSearch}
                size="md"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Actions */}
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                action.variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
                action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                (!action.variant || action.variant === 'secondary') && 'border border-border-main bg-surface-secondary text-text-primary hover:bg-surface-secondary/80'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}

          {/* Filter Toggle */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 border rounded-md transition-colors',
                showFilters || hasActiveFilters
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-main bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80'
              )}
            >
              <Filter className="w-4 h-4" />
              필터 {hasActiveFilters && `(${filters.filter(f => f.value || localFilters[f.key]).length})`}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 border-b border-border-main bg-surface-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map(renderFilter)}
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border-main">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border-main">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">활성 필터:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {filters
                .filter(filter => filter.value || localFilters[filter.key])
                .map(filter => {
                  const value = filter.value || localFilters[filter.key];
                  return (
                    <span
                      key={filter.key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {filter.label}: {value}
                      <button
                        onClick={() => handleFilterChange(filter.key, '')}
                        className="hover:text-primary/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Convenience components for common filter patterns
export function UserFilterBar(props: Omit<FilterBarProps, 'filters'> & {
  statusFilter?: boolean;
  rankFilter?: boolean;
  dateRangeFilter?: boolean;
}) {
  const filters: FilterOption[] = [];

  if (props.statusFilter) {
    filters.push({
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { label: '활성', value: 'active' },
        { label: '비활성', value: 'inactive' },
        { label: '차단됨', value: 'blocked' },
        { label: '정지됨', value: 'suspended' },
      ],
    });
  }

  if (props.rankFilter) {
    filters.push({
      key: 'rank',
      label: '등급',
      type: 'select',
      options: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'Diamond', value: 'diamond' },
        { label: 'Master', value: 'master' },
      ],
    });
  }

  if (props.dateRangeFilter) {
    filters.push({
      key: 'created_date',
      label: '가입일',
      type: 'daterange',
    });
  }

  return <FilterBar {...props} filters={filters} />;
}

export function TransactionFilterBar(props: Omit<FilterBarProps, 'filters'> & {
  statusFilter?: boolean;
  typeFilter?: boolean;
  amountRangeFilter?: boolean;
  dateRangeFilter?: boolean;
}) {
  const filters: FilterOption[] = [];

  if (props.statusFilter) {
    filters.push({
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { label: '대기중', value: 'pending' },
        { label: '완료', value: 'completed' },
        { label: '처리중', value: 'processing' },
        { label: '실패', value: 'failed' },
        { label: '취소됨', value: 'cancelled' },
      ],
    });
  }

  if (props.typeFilter) {
    filters.push({
      key: 'type',
      label: '유형',
      type: 'select',
      options: [
        { label: '입금', value: 'deposit' },
        { label: '출금', value: 'withdrawal' },
        { label: '투자', value: 'investment' },
        { label: '배당', value: 'dividend' },
        { label: '거래', value: 'trade' },
      ],
    });
  }

  if (props.amountRangeFilter) {
    filters.push(
      {
        key: 'min_amount',
        label: '최소 금액',
        type: 'number',
        placeholder: '최소 금액',
      },
      {
        key: 'max_amount',
        label: '최대 금액',
        type: 'number',
        placeholder: '최대 금액',
      }
    );
  }

  if (props.dateRangeFilter) {
    filters.push({
      key: 'transaction_date',
      label: '거래일',
      type: 'daterange',
    });
  }

  return <FilterBar {...props} filters={filters} />;
}
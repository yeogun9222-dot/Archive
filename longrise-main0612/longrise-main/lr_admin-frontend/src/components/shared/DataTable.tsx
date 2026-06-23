/**
 * DataTable Component - Reusable data table with sorting, pagination, and actions
 * Provides consistent table styling and functionality across the admin panel
 */

import React, { ReactNode, useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, MoreVertical, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface Column<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => ReactNode;
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  actions?: {
    title?: string;
    items: Array<{
      key: string;
      label: string;
      icon?: ReactNode;
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
      danger?: boolean;
    }>;
  };
  toolbar?: {
    title?: string;
    search?: {
      placeholder?: string;
      onSearch?: (value: string) => void;
    };
    filters?: Array<{
      key: string;
      label: string;
      options: Array<{ label: string; value: string }>;
      value?: string;
      onChange?: (value: string) => void;
    }>;
    actions?: Array<{
      key: string;
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
    }>;
  };
  className?: string;
  emptyText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  rowKey = 'id',
  onRowClick,
  actions,
  toolbar,
  className,
  emptyText = '데이터가 없습니다',
  size = 'md',
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] || index);
  };

  // Handle sorting
  const handleSort = (field: keyof T | string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested keys (e.g., 'user.name')
      if (typeof sortField === 'string' && sortField.includes('.')) {
        const keys = sortField.split('.');
        aVal = keys.reduce((obj, key) => obj?.[key], a);
        bVal = keys.reduce((obj, key) => obj?.[key], b);
      }

      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Size variants
  const sizeVariants = {
    sm: {
      table: 'text-xs',
      cell: 'px-3 py-2',
      header: 'px-3 py-3',
    },
    md: {
      table: 'text-sm',
      cell: 'px-4 py-3',
      header: 'px-4 py-3',
    },
    lg: {
      table: 'text-base',
      cell: 'px-6 py-4',
      header: 'px-6 py-4',
    },
  };

  const variant = sizeVariants[size];

  return (
    <div className={cn('bg-surface-primary border border-border-main rounded-lg', className)}>
      {/* Toolbar */}
      {toolbar && (
        <div className="p-4 border-b border-border-main">
          <div className="flex items-center justify-between mb-4">
            {toolbar.title && (
              <h3 className="text-lg font-semibold text-text-primary">{toolbar.title}</h3>
            )}
            <div className="flex items-center gap-2">
              {toolbar.actions?.map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded transition-colors',
                    action.variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
                    action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                    (!action.variant || action.variant === 'secondary') && 'bg-surface-secondary text-text-primary hover:bg-surface-secondary/80'
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            {toolbar.search && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder={toolbar.search.placeholder || '검색...'}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    toolbar.search?.onSearch?.(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-border-main rounded-md bg-surface-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Filters */}
            {toolbar.filters?.map((filter) => (
              <select
                key={filter.key}
                value={filter.value || ''}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="px-3 py-2 border border-border-main rounded-md bg-surface-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={cn('w-full', variant.table)}>
          <thead className="bg-surface-secondary border-b border-border-main">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'font-medium text-text-primary text-left',
                    variant.header,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-surface-secondary/80',
                    column.className
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3',
                            sortField === column.key && sortDirection === 'asc'
                              ? 'text-primary'
                              : 'text-text-tertiary'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3 -mt-1',
                            sortField === column.key && sortDirection === 'desc'
                              ? 'text-primary'
                              : 'text-text-tertiary'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className={cn('font-medium text-text-primary text-center', variant.header)}>
                  {actions.title || '작업'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-text-secondary" />
                    <span className="ml-2 text-text-secondary">로딩 중...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-text-secondary">
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const key = getRowKey(record, index);
                return (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-border-main hover:bg-surface-secondary/50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {columns.map((column) => {
                      const value = record[column.key];
                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            'text-text-primary',
                            variant.cell,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {column.render ? column.render(value, record, index) : value}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className={cn('text-center', variant.cell)}>
                        <div className="flex items-center justify-center">
                          <div className="relative group">
                            <button className="p-1 hover:bg-surface-secondary rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-text-secondary" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-surface-primary border border-border-main rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1 min-w-[120px]">
                                {actions.items.map((item) => (
                                  <button
                                    key={item.key}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      item.onClick(record);
                                    }}
                                    disabled={item.disabled?.(record)}
                                    className={cn(
                                      'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                      item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-text-primary hover:bg-surface-secondary'
                                    )}
                                  >
                                    {item.icon}
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t border-border-main">
          <div className="text-sm text-text-secondary">
            총 {pagination.total.toLocaleString()}개 중 {((pagination.current - 1) * pagination.pageSize + 1).toLocaleString()}-
            {Math.min(pagination.current * pagination.pageSize, pagination.total).toLocaleString()}개 표시
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="px-3 py-1 border border-border-main rounded transition-colors hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-3 py-1 bg-primary text-white rounded">
              {pagination.current}
            </span>
            <button
              onClick={() => pagination.onChange(pagination.current + 1)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 border border-border-main rounded transition-colors hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * ActionButtonGroup Component - Reusable action button groups
 * Provides consistent action patterns across the admin panel
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Check, X, Edit, Trash2, Eye, Download, MoreHorizontal, Lock, Unlock, Ban, CheckCircle } from 'lucide-react';

export interface ActionButton {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
}

export interface ActionButtonGroupProps {
  actions: ActionButton[];
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
  secondary: 'bg-surface-secondary text-text-primary border border-border-main hover:bg-surface-secondary/80 focus:ring-primary',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary focus:ring-primary',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const iconSizeStyles = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function ActionButtonGroup({
  actions,
  orientation = 'horizontal',
  spacing = 'normal',
  className,
}: ActionButtonGroupProps) {
  const spacingStyles = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    loose: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        spacingStyles[spacing],
        className
      )}
    >
      {actions.map((action) => {
        const size = action.size || 'md';
        const variant = action.variant || 'secondary';

        return (
          <button
            key={action.key}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            title={action.tooltip}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              sizeStyles[size],
              variantStyles[variant]
            )}
          >
            {action.loading ? (
              <div className={cn('animate-spin', iconSizeStyles[size])}>⭮</div>
            ) : action.icon ? (
              <span className={iconSizeStyles[size]}>{action.icon}</span>
            ) : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

// Predefined action patterns
export const commonActions = {
  approve: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'approve',
    label: '승인',
    icon: <Check />,
    variant: 'success',
    onClick,
    disabled,
  }),

  reject: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'reject',
    label: '거부',
    icon: <X />,
    variant: 'danger',
    onClick,
    disabled,
  }),

  edit: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'edit',
    label: '수정',
    icon: <Edit />,
    variant: 'secondary',
    onClick,
    disabled,
  }),

  delete: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'delete',
    label: '삭제',
    icon: <Trash2 />,
    variant: 'danger',
    onClick,
    disabled,
  }),

  view: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'view',
    label: '보기',
    icon: <Eye />,
    variant: 'ghost',
    onClick,
    disabled,
  }),

  download: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'download',
    label: '다운로드',
    icon: <Download />,
    variant: 'secondary',
    onClick,
    disabled,
  }),

  block: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'block',
    label: '차단',
    icon: <Ban />,
    variant: 'danger',
    onClick,
    disabled,
  }),

  unblock: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'unblock',
    label: '차단해제',
    icon: <CheckCircle />,
    variant: 'success',
    onClick,
    disabled,
  }),

  lock: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'lock',
    label: '잠금',
    icon: <Lock />,
    variant: 'warning',
    onClick,
    disabled,
  }),

  unlock: (onClick: () => void, disabled?: boolean): ActionButton => ({
    key: 'unlock',
    label: '잠금해제',
    icon: <Unlock />,
    variant: 'success',
    onClick,
    disabled,
  }),
};

// Predefined action groups
export interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: () => void;
  approveDisabled?: boolean;
  rejectDisabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ApprovalActions({
  onApprove,
  onReject,
  approveDisabled,
  rejectDisabled,
  loading,
  size = 'md',
  className,
}: ApprovalActionsProps) {
  const actions: ActionButton[] = [
    {
      ...commonActions.approve(onApprove, approveDisabled || loading),
      loading: loading,
      size,
    },
    {
      ...commonActions.reject(onReject, rejectDisabled || loading),
      size,
    },
  ];

  return <ActionButtonGroup actions={actions} className={className} />;
}

export interface CrudActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CrudActions({
  onView,
  onEdit,
  onDelete,
  viewDisabled,
  editDisabled,
  deleteDisabled,
  size = 'md',
  className,
}: CrudActionsProps) {
  const actions: ActionButton[] = [];

  if (onView) {
    actions.push({
      ...commonActions.view(onView, viewDisabled),
      size,
    });
  }

  if (onEdit) {
    actions.push({
      ...commonActions.edit(onEdit, editDisabled),
      size,
    });
  }

  if (onDelete) {
    actions.push({
      ...commonActions.delete(onDelete, deleteDisabled),
      size,
    });
  }

  return <ActionButtonGroup actions={actions} className={className} />;
}

export interface UserManagementActionsProps {
  onBlock?: () => void;
  onUnblock?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  blockDisabled?: boolean;
  unblockDisabled?: boolean;
  lockDisabled?: boolean;
  unlockDisabled?: boolean;
  showBlock?: boolean;
  showUnblock?: boolean;
  showLock?: boolean;
  showUnlock?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserManagementActions({
  onBlock,
  onUnblock,
  onLock,
  onUnlock,
  blockDisabled,
  unblockDisabled,
  lockDisabled,
  unlockDisabled,
  showBlock = true,
  showUnblock = false,
  showLock = true,
  showUnlock = false,
  size = 'md',
  className,
}: UserManagementActionsProps) {
  const actions: ActionButton[] = [];

  if (showBlock && onBlock) {
    actions.push({
      ...commonActions.block(onBlock, blockDisabled),
      size,
    });
  }

  if (showUnblock && onUnblock) {
    actions.push({
      ...commonActions.unblock(onUnblock, unblockDisabled),
      size,
    });
  }

  if (showLock && onLock) {
    actions.push({
      ...commonActions.lock(onLock, lockDisabled),
      size,
    });
  }

  if (showUnlock && onUnlock) {
    actions.push({
      ...commonActions.unlock(onUnlock, unlockDisabled),
      size,
    });
  }

  return <ActionButtonGroup actions={actions} className={className} />;
}

// Dropdown action menu
export interface DropdownAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface ActionDropdownProps {
  actions: DropdownAction[];
  trigger?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ActionDropdown({
  actions,
  trigger,
  size = 'md',
  className,
}: ActionDropdownProps) {
  return (
    <div className={cn('relative group', className)}>
      {trigger || (
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            sizeStyles[size]
          )}
        >
          <MoreHorizontal className={iconSizeStyles[size]} />
        </button>
      )}

      <div className="absolute right-0 top-full mt-1 bg-surface-primary border border-border-main rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <div className="py-1 min-w-[160px]">
          {actions.map((action) => (
            <React.Fragment key={action.key}>
              {action.divider && <div className="my-1 border-t border-border-main" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  action.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-text-primary hover:bg-surface-secondary'
                )}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
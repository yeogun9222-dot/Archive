/**
 * Modal Component - Reusable modal/dialog component
 * Supports different sizes, types, and actions
 */

import React, { ReactNode, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  className?: string;
}

const sizeVariants = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const typeVariants = {
  default: {
    icon: null,
    titleColor: 'text-text-primary',
    border: 'border-border-main',
  },
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    titleColor: 'text-green-400',
    border: 'border-green-500/30',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    titleColor: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  danger: {
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    titleColor: 'text-red-400',
    border: 'border-red-500/30',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-400" />,
    titleColor: 'text-blue-400',
    border: 'border-blue-500/30',
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
}: ModalProps) {
  const typeConfig = typeVariants[type];

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-4 bg-surface-primary border rounded-lg shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          sizeVariants[size],
          typeConfig.border,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border-main">
          <div className="flex items-center gap-3">
            {typeConfig.icon}
            <h2 className={cn('text-lg font-semibold', typeConfig.titleColor)}>
              {title}
            </h2>
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border-main">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience components for common modal types
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'warning',
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger';
  isLoading?: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-white rounded transition-colors disabled:opacity-50',
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-text-secondary">{message}</p>
    </Modal>
  );
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type="success"
      size="sm"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {buttonText}
        </button>
      }
    >
      <p className="text-text-secondary">{message}</p>
    </Modal>
  );
}
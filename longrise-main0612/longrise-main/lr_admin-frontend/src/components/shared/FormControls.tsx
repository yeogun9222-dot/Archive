/**
 * FormControls - Reusable form input components
 * Provides consistent styling and behavior for all form elements
 */

import React, { ReactNode, forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, Calendar, Clock, Search, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Base input props interface
export interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

// Input component
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconClick,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const sizeVariants = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizeVariants = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary',
            iconSizeVariants[size]
          )}>
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={actualType}
          disabled={disabled}
          className={cn(
            'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            sizeVariants[size],
            leftIcon && 'pl-10',
            (rightIcon || type === 'password') && 'pr-10',
            error
              ? 'border-red-500 bg-red-50 focus:ring-red-500'
              : disabled
              ? 'border-border-main bg-surface-secondary text-text-secondary cursor-not-allowed'
              : 'border-border-main bg-surface-primary text-text-primary hover:border-border-hover',
            className
          )}
          {...props}
        />

        {(rightIcon || type === 'password') && (
          <button
            type="button"
            onClick={type === 'password' ? () => setShowPassword(!showPassword) : onRightIconClick}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors',
              iconSizeVariants[size]
            )}
            tabIndex={-1}
          >
            {type === 'password' ? (
              showPassword ? <EyeOff /> : <Eye />
            ) : (
              rightIcon
            )}
          </button>
        )}
      </div>

      {(error || hint) && (
        <div className="flex items-start gap-2">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hint ? (
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
          ) : null}
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || hint}
          </p>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// TextArea component
export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  resize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  resize = true,
  ...props
}, ref) => {
  const sizeVariants = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]',
          sizeVariants[size],
          !resize && 'resize-none',
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500'
            : disabled
            ? 'border-border-main bg-surface-secondary text-text-secondary cursor-not-allowed'
            : 'border-border-main bg-surface-primary text-text-primary hover:border-border-hover',
          className
        )}
        {...props}
      />

      {(error || hint) && (
        <div className="flex items-start gap-2">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hint ? (
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
          ) : null}
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || hint}
          </p>
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Select component
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  options: Array<{ label: string; value: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  options,
  placeholder,
  ...props
}, ref) => {
  const sizeVariants = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-no-repeat bg-right bg-[length:16px] pr-10',
          'bg-[url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'m6 9 6 6 6-6\'/></svg>")]',
          sizeVariants[size],
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500'
            : disabled
            ? 'border-border-main bg-surface-secondary text-text-secondary cursor-not-allowed'
            : 'border-border-main bg-surface-primary text-text-primary hover:border-border-hover',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {(error || hint) && (
        <div className="flex items-start gap-2">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hint ? (
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
          ) : null}
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || hint}
          </p>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  ...props
}, ref) => {
  const sizeVariants = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            sizeVariants[size],
            error
              ? 'border-red-500 text-red-600 focus:ring-red-500'
              : disabled
              ? 'border-border-main text-text-secondary cursor-not-allowed'
              : 'border-border-main text-primary hover:border-border-hover',
            className
          )}
          {...props}
        />

        {label && (
          <label className={cn(
            'text-sm text-text-primary cursor-pointer',
            disabled && 'text-text-secondary cursor-not-allowed'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>

      {(error || hint) && (
        <div className="flex items-start gap-2 ml-8">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hint ? (
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
          ) : null}
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || hint}
          </p>
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio component
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  options: Array<{ label: string; value: string; disabled?: boolean }>;
  direction?: 'horizontal' | 'vertical';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  options,
  direction = 'vertical',
  name,
  value,
  onChange,
  ...props
}, ref) => {
  const sizeVariants = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={cn(
        'space-y-3',
        direction === 'horizontal' && 'flex items-center space-y-0 space-x-6'
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <input
              ref={ref}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled || option.disabled}
              className={cn(
                'border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                sizeVariants[size],
                error
                  ? 'border-red-500 text-red-600 focus:ring-red-500'
                  : (disabled || option.disabled)
                  ? 'border-border-main text-text-secondary cursor-not-allowed'
                  : 'border-border-main text-primary hover:border-border-hover',
                className
              )}
              {...props}
            />

            <label className={cn(
              'text-sm text-text-primary cursor-pointer',
              (disabled || option.disabled) && 'text-text-secondary cursor-not-allowed'
            )}>
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {(error || hint) && (
        <div className="flex items-start gap-2">
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hint ? (
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
          ) : null}
          <p className={cn(
            'text-sm',
            error ? 'text-red-600' : 'text-text-secondary'
          )}>
            {error || hint}
          </p>
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

// Date Input component
export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  showTimeInput?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({
  label,
  error,
  hint,
  required,
  disabled,
  className,
  containerClassName,
  size = 'md',
  showTimeInput = false,
  ...props
}, ref) => {
  const icon = showTimeInput ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />;

  return (
    <Input
      ref={ref}
      type={showTimeInput ? 'datetime-local' : 'date'}
      label={label}
      error={error}
      hint={hint}
      required={required}
      disabled={disabled}
      className={className}
      containerClassName={containerClassName}
      size={size}
      rightIcon={icon}
      {...props}
    />
  );
});

DateInput.displayName = 'DateInput';

// Search Input component
export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  onClear,
  onChange,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (e.target.value === '' && onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <Input
      ref={ref}
      type="text"
      leftIcon={<Search className="w-4 h-4" />}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';
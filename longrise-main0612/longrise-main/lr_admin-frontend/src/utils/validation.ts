/**
 * Validation utilities - Common validation functions
 */

import { VALIDATION } from '../constants';

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!VALIDATION.email.pattern.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; strength?: number } {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }

  if (password.length < VALIDATION.password.minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION.password.minLength} characters`,
      strength: 0,
    };
  }

  let strength = 0;
  const issues: string[] = [];

  // Check for uppercase
  if (VALIDATION.password.requireUppercase && !/[A-Z]/.test(password)) {
    issues.push('uppercase letter');
  } else {
    strength += 25;
  }

  // Check for lowercase
  if (VALIDATION.password.requireLowercase && !/[a-z]/.test(password)) {
    issues.push('lowercase letter');
  } else {
    strength += 25;
  }

  // Check for numbers
  if (VALIDATION.password.requireNumbers && !/\d/.test(password)) {
    issues.push('number');
  } else {
    strength += 25;
  }

  // Check for symbols
  if (VALIDATION.password.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('special character');
  } else {
    strength += 25;
  }

  if (issues.length > 0) {
    return {
      isValid: false,
      error: `Password must contain at least one: ${issues.join(', ')}`,
      strength,
    };
  }

  return { isValid: true, strength };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < VALIDATION.username.minLength) {
    return {
      isValid: false,
      error: `Username must be at least ${VALIDATION.username.minLength} characters`,
    };
  }

  if (username.length > VALIDATION.username.maxLength) {
    return {
      isValid: false,
      error: `Username must be no more than ${VALIDATION.username.maxLength} characters`,
    };
  }

  if (!VALIDATION.username.pattern.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { isValid: true };
}

/**
 * Validate amount (positive number)
 */
export function validateAmount(amount: string | number, min?: number, max?: number): { isValid: boolean; error?: string } {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (min !== undefined && numAmount < min) {
    return { isValid: false, error: `Amount must be at least ${min}` };
  }

  if (max !== undefined && numAmount > max) {
    return { isValid: false, error: `Amount must not exceed ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10 || cleaned.length > 15) {
    return { isValid: false, error: 'Phone number must be between 10 and 15 digits' };
  }

  return { isValid: true };
}

/**
 * Validate cryptocurrency address
 */
export function validateCryptoAddress(address: string, currency: string): { isValid: boolean; error?: string } {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  // Basic validation patterns for different currencies
  const patterns: Record<string, RegExp> = {
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT: /^0x[a-fA-F0-9]{40}$/, // ERC-20 USDT uses Ethereum addresses
    TRX: /^T[A-Za-z1-9]{33}$/,
  };

  const pattern = patterns[currency.toUpperCase()];
  if (!pattern) {
    return { isValid: false, error: `Unsupported currency: ${currency}` };
  }

  if (!pattern.test(address)) {
    return { isValid: false, error: `Invalid ${currency} address format` };
  }

  return { isValid: true };
}

/**
 * Validate bank account number
 */
export function validateBankAccount(accountNumber: string): { isValid: boolean; error?: string } {
  if (!accountNumber) {
    return { isValid: false, error: 'Account number is required' };
  }

  // Remove spaces and hyphens
  const cleaned = accountNumber.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Account number must contain only digits' };
  }

  if (cleaned.length < 8 || cleaned.length > 20) {
    return { isValid: false, error: 'Account number must be between 8 and 20 digits' };
  }

  return { isValid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both start and end dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (start >= end) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  // Check if date range is reasonable (not more than 1 year)
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 365) {
    return { isValid: false, error: 'Date range cannot exceed 1 year' };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSizeBytes: number,
  allowedTypes: string[]
): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} is not allowed` };
  }

  return { isValid: true };
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors[String(field)] = 'This field is required';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generic form validation helper
 */
export function createFormValidator<T extends Record<string, any>>(
  rules: Record<keyof T, (value: any) => { isValid: boolean; error?: string }>
) {
  return (data: T): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
      const rule = rules[field as keyof T];
      const result = rule(data[field as keyof T]);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
}
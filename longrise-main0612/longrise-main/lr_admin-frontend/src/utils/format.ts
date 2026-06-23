/**
 * Formatting utilities - Common formatting functions for display
 */

import { CURRENCY, DATE_FORMATS } from '../constants';

/**
 * Format currency amount with proper decimal places
 */
export function formatCurrency(
  amount: number,
  currency: keyof typeof CURRENCY.decimalPlaces = 'USD',
  includeSymbol: boolean = true
): string {
  const decimalPlaces = CURRENCY.decimalPlaces[currency];
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (!includeSymbol) {
    return formatted;
  }

  const symbols: Record<string, string> = {
    USD: '$',
    KRW: '₩',
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '₮',
  };

  return `${symbols[currency] || ''}${formatted}`;
}

/**
 * Format date string to display format
 */
export function formatDate(dateString: string, format: string = DATE_FORMATS.display): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Simple format mapping - in production, use a library like date-fns or dayjs
    switch (format) {
      case DATE_FORMATS.date:
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      case DATE_FORMATS.time:
        return date.toLocaleTimeString('en-US', { hour12: false });
      case DATE_FORMATS.dateTime:
        return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`;
      case DATE_FORMATS.display:
      default:
        return `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-US', {
          hour12: false,
        })}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return '방금 전';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 30) {
      return `${diffDays}일 전`;
    } else {
      return formatDate(dateString, DATE_FORMATS.date);
    }
  } catch (error) {
    return formatDate(dateString, DATE_FORMATS.date);
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(value: number, decimalPlaces: number = 2): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number, decimalPlaces: number = 1): string {
  if (num < 1000) {
    return num.toString();
  }

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(num) / 3);
  const shortValue = num / Math.pow(1000, suffixNum);

  return `${shortValue.toFixed(decimalPlaces)}${suffixes[suffixNum]}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length (assuming international format)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('82')) {
    // Korean format
    return `+82 ${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  } else {
    // Generic international format
    return `+${cleaned}`;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format transaction ID for display
 */
export function formatTransactionId(txId: string, length: number = 8): string {
  if (txId.length <= length * 2) {
    return txId;
  }
  return `${txId.slice(0, length)}...${txId.slice(-length)}`;
}

/**
 * Format address for display (blockchain addresses)
 */
export function formatAddress(address: string, length: number = 6): string {
  if (address.length <= length * 2) {
    return address;
  }
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
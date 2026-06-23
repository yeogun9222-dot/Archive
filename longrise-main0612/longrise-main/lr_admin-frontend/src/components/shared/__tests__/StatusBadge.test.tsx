/**
 * StatusBadge Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  StatusBadge,
  UserStatusBadge,
  TransactionStatusBadge,
  SystemStatusBadge,
  AlertSeverityBadge,
} from '../StatusBadge';

describe('StatusBadge', () => {
  describe('Basic functionality', () => {
    it('renders status text correctly', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('applies correct variant classes', () => {
      const { rerender } = render(<StatusBadge status="active" variant="default" />);
      expect(screen.getByText('active')).toHaveClass('bg-green-100');

      rerender(<StatusBadge status="active" variant="outlined" />);
      expect(screen.getByText('active')).toHaveClass('border');

      rerender(<StatusBadge status="active" variant="dot" />);
      expect(screen.getByText('active').parentElement).toHaveClass('inline-flex', 'items-center');
    });

    it('applies correct size classes', () => {
      const { rerender } = render(<StatusBadge status="active" size="sm" />);
      expect(screen.getByText('active')).toHaveClass('px-2', 'py-1', 'text-xs');

      rerender(<StatusBadge status="active" size="md" />);
      expect(screen.getByText('active')).toHaveClass('px-2.5', 'py-1.5', 'text-sm');

      rerender(<StatusBadge status="active" size="lg" />);
      expect(screen.getByText('active')).toHaveClass('px-3', 'py-2', 'text-base');
    });

    it('applies custom className', () => {
      render(<StatusBadge status="active" className="custom-class" />);
      expect(screen.getByText('active')).toHaveClass('custom-class');
    });
  });

  describe('Status color mappings', () => {
    const statusColorTests = [
      { status: 'active', expectedClass: 'bg-green-100' },
      { status: 'pending', expectedClass: 'bg-amber-100' },
      { status: 'rejected', expectedClass: 'bg-red-100' },
      { status: 'inactive', expectedClass: 'bg-gray-100' },
    ];

    statusColorTests.forEach(({ status, expectedClass }) => {
      it(`applies correct color for ${status} status`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(status)).toHaveClass(expectedClass);
      });
    });

    it('applies default color for unknown status', () => {
      render(<StatusBadge status="unknown-status" />);
      expect(screen.getByText('unknown-status')).toHaveClass('bg-gray-100');
    });
  });

  describe('Dot variant', () => {
    it('renders dot with text for dot variant', () => {
      render(<StatusBadge status="active" variant="dot" />);

      const container = screen.getByText('active').parentElement;
      expect(container).toHaveClass('inline-flex', 'items-center', 'gap-2');

      // Check if dot exists
      const dot = container?.querySelector('div');
      expect(dot).toHaveClass('rounded-full', 'bg-green-500');
    });

    it('applies correct dot size', () => {
      const { rerender } = render(<StatusBadge status="active" variant="dot" size="sm" />);
      const dot = screen.getByText('active').parentElement?.querySelector('div');
      expect(dot).toHaveClass('w-2', 'h-2');

      rerender(<StatusBadge status="active" variant="dot" size="lg" />);
      const dotLarge = screen.getByText('active').parentElement?.querySelector('div');
      expect(dotLarge).toHaveClass('w-3', 'h-3');
    });
  });
});

describe('Specialized StatusBadge Components', () => {
  describe('UserStatusBadge', () => {
    it('renders user-specific statuses', () => {
      const { rerender } = render(<UserStatusBadge status="active" />);
      expect(screen.getByText('active')).toBeInTheDocument();

      rerender(<UserStatusBadge status="blocked" />);
      expect(screen.getByText('blocked')).toBeInTheDocument();
    });
  });

  describe('TransactionStatusBadge', () => {
    it('renders transaction-specific statuses', () => {
      const { rerender } = render(<TransactionStatusBadge status="pending" />);
      expect(screen.getByText('pending')).toBeInTheDocument();

      rerender(<TransactionStatusBadge status="completed" />);
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  describe('SystemStatusBadge', () => {
    it('renders system status with dot variant by default', () => {
      render(<SystemStatusBadge status="online" />);

      const container = screen.getByText('online').parentElement;
      expect(container).toHaveClass('inline-flex', 'items-center');
    });
  });

  describe('AlertSeverityBadge', () => {
    it('renders alert severity levels', () => {
      const { rerender } = render(<AlertSeverityBadge severity="low" />);
      expect(screen.getByText('low')).toBeInTheDocument();

      rerender(<AlertSeverityBadge severity="critical" />);
      expect(screen.getByText('critical')).toHaveClass('bg-red-100');
    });
  });
});

describe('Status text display mappings', () => {
  it('handles special status display mappings', () => {
    // This would need to be implemented if we have special display mappings
    // For example, if 'in_progress' should display as '진행중'
    render(<StatusBadge status="in_progress" />);
    // For now, it should display the original status
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('normalizes status strings', () => {
    render(<StatusBadge status="ACTIVE" />);
    // Should still work with uppercase
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has proper text content for screen readers', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('active');
    expect(badge).toBeVisible();
    expect(badge.textContent).toBe('active');
  });

  it('maintains semantic meaning in dot variant', () => {
    render(<StatusBadge status="active" variant="dot" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
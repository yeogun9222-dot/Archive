/**
 * Dashboard Layout - Main layout component for authenticated admin pages
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Sidebar } from '../components/Sidebar';
import { Menu, Bell, User, Search, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Store preference in localStorage
    localStorage.setItem('longrise-admin-sidebar-collapsed', String(!sidebarCollapsed));
  };

  // Load sidebar preference on mount
  useEffect(() => {
    const stored = localStorage.getItem('longrise-admin-sidebar-collapsed');
    if (stored) {
      setSidebarCollapsed(stored === 'true');
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top Header */}
        <header className="h-16 bg-surface-primary border-b border-border-main px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-surface-secondary rounded-md transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>

            {title && (
              <div>
                <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-text-secondary">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="검색..."
                className="w-64 pl-10 pr-4 py-2 border border-border-main rounded-md bg-surface-primary text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-surface-secondary rounded-md transition-colors">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-surface-secondary rounded-md transition-colors">
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-2 p-2 hover:bg-surface-secondary rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-text-primary">관리자</span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-primary border border-border-main rounded-md shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-border-main">
                    <p className="text-sm font-medium text-text-primary">관리자</p>
                    <p className="text-xs text-text-secondary">admin@longrise.com</p>
                  </div>

                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors">
                    <User className="w-4 h-4" />
                    프로필 설정
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors">
                    <Settings className="w-4 h-4" />
                    환경 설정
                  </button>

                  <div className="border-t border-border-main mt-1 pt-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Header */}
        {(title || actions) && (
          <div className="bg-surface-primary border-b border-border-main px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                )}
                {subtitle && (
                  <p className="text-text-secondary mt-1">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn('p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Page wrapper with common layout patterns
export function DashboardPage({
  title,
  subtitle,
  actions,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={className}
    >
      {children}
    </DashboardLayout>
  );
}

// Simplified layout for nested pages
export function NestedPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}
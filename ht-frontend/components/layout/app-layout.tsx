'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  useIsMobile,
  useIsTablet,
  getResponsiveContainer,
} from '@/lib/utils/responsive';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  showSidebar = true,
  className,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Close sidebar when switching to mobile view
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={showSidebar}
      />

      <div className="flex">
        {/* Navigation Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main
          id="main-content"
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            showSidebar ? 'lg:ml-64' : '',
            'pt-16', // Account for fixed header
            // Responsive padding
            'px-4 sm:px-6 lg:px-8'
          )}
          role="main"
          aria-label="Main content"
        >
          <div
            className={cn(
              'mx-auto w-full',
              // Responsive max width
              'max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl',
              // Responsive vertical spacing
              'py-4 sm:py-6 lg:py-8'
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}

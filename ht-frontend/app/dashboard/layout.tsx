"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EnhancedSidebar } from "@/components/layout/enhanced-sidebar";
import { cn } from "@/lib/utils";
import { announceToScreenReader } from "@/lib/utils/accessibility";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const mainContentRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Focus main content on route changes only (avoid interfering with dropdowns)
  useEffect(() => {
    if (!mainContentRef.current) return;
    // Defer focus slightly after route change to allow layout to stabilize
    const id = setTimeout(() => {
      mainContentRef.current?.focus();
      const pageTitle = document.title;
      announceToScreenReader(`Page changed to ${pageTitle}`, 'polite');
    }, 50);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced skip links for accessibility */}
      <div className="sr-only focus-within:not-sr-only" role="navigation" aria-label="Skip navigation links">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:shadow-lg"
            onFocus={() => announceToScreenReader('Skip to main content link focused', 'polite')}
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:shadow-lg"
            onFocus={() => announceToScreenReader('Skip to navigation link focused', 'polite')}
          >
            Skip to navigation
          </a>
          <a
            href="#user-menu"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-80 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:shadow-lg"
            onFocus={() => announceToScreenReader('Skip to user menu link focused', 'polite')}
          >
            Skip to user menu
          </a>
        </div>

        {/* Enhanced Sidebar with responsive layout */}
        <EnhancedSidebar>
          {/* Main content area with responsive grid system */}
          <main
            id="main-content"
            ref={mainContentRef}
            tabIndex={-1}
            className={cn(
              // Base styles
              "flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
              // Responsive padding and spacing
              "p-4 sm:p-6 lg:p-8",
              // Mobile-first responsive grid container
              "w-full max-w-full",
              // Ensure proper content flow
              "min-h-[calc(100vh-4rem)] lg:min-h-screen"
            )}
            role="main"
            aria-label="Dashboard main content"
            aria-describedby="main-content-description"
          >
            {/* Hidden description for screen readers */}
            <div id="main-content-description" className="sr-only">
              Main dashboard content area. Use Tab to navigate between interactive elements.
            </div>
            
            {/* Responsive content wrapper with page transitions */}
            <div
              className={cn(
                // Mobile-first responsive grid
                "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8",
                // Responsive container with proper max-widths
                "w-full mx-auto",
                // Breakpoint-specific max widths
                "max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl",
                // Ensure content doesn't get too wide on large screens
                "2xl:max-w-7xl"
              )}
            >
              {children}
            </div>
          </main>
        </EnhancedSidebar>
      </div>
  );
}
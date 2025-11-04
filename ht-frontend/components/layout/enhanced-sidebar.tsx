'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/utils/accessibility';
import {
  Settings,
  TrendingUp,
  LogOut,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { useNavigationRoutes } from '@/hooks/use-navigation-routes';
import { useSidebarKeyboardNavigation } from '@/hooks/use-sidebar-keyboard-navigation';
import { useEnhancedKeyboardNavigation } from '@/hooks/use-enhanced-keyboard-navigation';
import { AriaAttributes, FocusManager } from '@/lib/utils/accessibility';

// Import the TopHeader component
import { TopHeader } from './top-header';

// shadcn components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface EnhancedSidebarProps {
  children: React.ReactNode;
  basePath?: string;
  className?: string;
}

// Remove the local NavigationItem interface since we're using the one from the hook

interface HealthSummary {
  healthScore: number;
  waterIntake: { current: number; goal: number };
  calories: { current: number; goal: number };
  exercise: { current: number; goal: number };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  healthGoal: string;
}

// Helper function to get user profile from localStorage
function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: '/avatar-placeholder.png',
      healthGoal: 'Stay Fit & Healthy',
    };
  }
  
  const storedName = localStorage.getItem('ht_name') || 'Test User';
  const storedGoal = localStorage.getItem('ht_goal') || 'Stay Fit & Healthy';
  
  return {
    id: '1',
    name: storedName,
    email: 'test@example.com',
    avatar: '/avatar-placeholder.png',
    healthGoal: storedGoal,
  };
}



function SidebarHeader({
  isCollapsed = false,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <header className="flex items-center justify-between p-6" role="banner">
      <div className="flex min-w-0 items-center space-x-3">
        <div className="from-primary to-primary/80 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-200 hover:scale-105">
          <Heart
            className="text-primary-foreground h-6 w-6"
            aria-hidden="true"
          />
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <h1 className="text-foreground text-xl font-bold whitespace-nowrap">
            HealthTracker
          </h1>
          <p className="text-muted-foreground text-sm whitespace-nowrap">
            Stay Healthy
          </p>
        </div>
      </div>

      {/* Collapse toggle button - only show on desktop */}
      {onToggleCollapse && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            'hover:bg-accent focus:ring-ring hidden h-8 w-8 transition-all duration-200 focus:ring-2 focus:ring-offset-2 lg:flex',
            isCollapsed && 'rotate-180'
          )}
          aria-label={
            isCollapsed
              ? 'Expand sidebar (Ctrl+F2)'
              : 'Collapse sidebar (Ctrl+F2)'
          }
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-content"
          title={
            isCollapsed
              ? 'Expand sidebar (Ctrl+F2)'
              : 'Collapse sidebar (Ctrl+F2)'
          }
        >
          <ChevronRight
            className="h-4 w-4 transition-transform duration-200"
            aria-hidden="true"
          />
        </Button>
      )}
    </header>
  );
}

function UserProfileSection({
  user,
  isCollapsed = false,
}: {
  user: UserProfile;
  isCollapsed?: boolean;
}) {
  return (
    <section className="px-6 pb-4" aria-label="User profile information">
      <Link
        href="/dashboard/profile"
        className={cn(
          'bg-accent/50 hover:bg-accent focus:ring-ring focus:ring-offset-background group flex items-center rounded-xl p-3 transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:outline-none',
          isCollapsed ? 'justify-center' : 'space-x-3'
        )}
        aria-label={`View profile for ${user.name}`}
      >
        <Avatar className="ring-primary/20 group-hover:ring-primary/40 h-12 w-12 ring-2 transition-all duration-200">
          <AvatarImage src={user.avatar} alt={`${user.name}'s avatar`} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {user.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <p className="text-foreground truncate text-sm font-semibold whitespace-nowrap">
            {user.name}
          </p>
          <p className="text-muted-foreground truncate text-xs whitespace-nowrap">
            {user.healthGoal}
          </p>
        </div>
        <ChevronRight
          className={cn(
            'text-muted-foreground group-hover:text-foreground h-4 w-4 transition-all duration-200',
            isCollapsed ? 'w-0 opacity-0' : 'w-4 opacity-100'
          )}
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}

function HealthSummaryWidget({
  healthSummary,
  isCollapsed = false,
}: {
  healthSummary: HealthSummary;
  isCollapsed?: boolean;
}) {
  const waterPercentage = Math.min(
    (healthSummary.waterIntake.current / healthSummary.waterIntake.goal) * 100,
    100
  );
  const caloriesPercentage = Math.min(
    (healthSummary.calories.current / healthSummary.calories.goal) * 100,
    100
  );
  const exercisePercentage = Math.min(
    (healthSummary.exercise.current / healthSummary.exercise.goal) * 100,
    100
  );

  if (isCollapsed) {
    // Collapsed view - just show health score as a badge
    return (
      <section className="px-6 pb-4" aria-label="Health score">
        <div className="flex justify-center">
          <div className="relative">
            <div className="from-primary/10 to-secondary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border bg-gradient-to-br transition-all duration-200 hover:scale-105">
              <span className="text-primary text-xs font-bold">
                {healthSummary.healthScore}
              </span>
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="bg-primary h-3 w-3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-4" aria-label="Today's health progress summary">
      <div className="from-primary/5 to-secondary/5 border-border rounded-xl border bg-gradient-to-br p-4 transition-all duration-200 hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          
          <div className="flex items-center space-x-1">
            <TrendingUp className="text-primary h-4 w-4" aria-hidden="true" />
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200"
            >
              {healthSummary.healthScore}/100
            </Badge>
          </div>
        </div>

        <div className="space-y-3" role="list" aria-label="Health metrics">
          {/* Water Intake */}
          <div className="space-y-1" role="listitem">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Water</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {healthSummary.waterIntake.current}L /{' '}
                {healthSummary.waterIntake.goal}L
              </span>
            </div>
            <Progress
              value={waterPercentage}
              className="h-2"
              aria-label={`Water intake progress: ${waterPercentage.toFixed(0)}% complete`}
            />
          </div>

          {/* Calories */}
          <div className="space-y-1" role="listitem">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Calories</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {healthSummary.calories.current} / {healthSummary.calories.goal}
              </span>
            </div>
            <Progress
              value={caloriesPercentage}
              className="h-2"
              aria-label={`Calorie intake progress: ${caloriesPercentage.toFixed(0)}% complete`}
            />
          </div>

          {/* Exercise */}
          <div className="space-y-1" role="listitem">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Exercise</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {healthSummary.exercise.current}min /{' '}
                {healthSummary.exercise.goal}min
              </span>
            </div>
            <Progress
              value={exercisePercentage}
              className="h-2"
              aria-label={`Exercise progress: ${exercisePercentage.toFixed(0)}% complete`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NavigationSection({
  onNavigate,
  isCollapsed = false,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const navigation = useNavigationRoutes();
  const {
    focusedIndex,
    isNavigating,
    getNavigationProps,
    startKeyboardNavigation,
  } = useEnhancedKeyboardNavigation({
    items: navigation,
    orientation: 'vertical',
    wrap: true,
    typeahead: true,
    announceNavigation: true,
    onNavigate: item => {
      onNavigate?.();
      announceToScreenReader(`Navigating to ${item.label}`, 'polite');
    },
    onActivate: item => {
      onNavigate?.();
      if (item.href) {
        announceToScreenReader(`Navigating to ${item.label}`, 'polite');
      }
    },
  });

  return (
    <div className="flex-1 px-3">
      <ScrollArea className="h-full">
        <nav
          className="space-y-1"
          role="navigation"
          aria-label="Main navigation menu"
          aria-describedby="nav-instructions"
          onFocus={() => {
            startKeyboardNavigation();
            announceToScreenReader(
              'Navigation menu focused. Use arrow keys to navigate, Enter to select, type to search.',
              'polite'
            );
          }}
        >
          {/* Hidden instructions for screen readers */}
          <div id="nav-instructions" className="sr-only">
            Use arrow keys to navigate between menu items, Enter or Space to
            select, type letters to search, Home and End to jump to first or
            last item, Escape to exit navigation mode.
          </div>

          {navigation.map((item, index) => {
            const Icon = item.icon;
            const navigationProps = getNavigationProps(index);
            const isFocused = focusedIndex === index && isNavigating;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  onNavigate?.();
                  announceToScreenReader(
                    `Navigating to ${item.label}`,
                    'polite'
                  );
                }}
                role="menuitem"
                aria-label={`${item.label}${item.badge ? ` (${item.badge} notifications)` : ''}${item.isActive ? ' - current page' : ''}`}
                aria-describedby={
                  isCollapsed ? `tooltip-${item.id}` : undefined
                }
                {...AriaAttributes.current(item.isActive ? 'page' : false)}
                {...navigationProps}
                className={cn(
                  // Base styles
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  // Enhanced focus styles for accessibility
                  'focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-none',
                  // Keyboard navigation focus with enhanced visibility
                  isFocused &&
                    'ring-primary ring-offset-background bg-primary/5 ring-2 ring-offset-2',
                  // Hover and scale effects with reduced motion support
                  'hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
                  // Collapsed vs expanded padding
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  // Active state styles with better contrast
                  item.isActive
                    ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  // High contrast mode support
                  'forced-colors:border forced-colors:border-solid'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isCollapsed ? 'mr-0' : 'mr-3',
                    item.isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'flex-1 truncate overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <Badge
                    variant={item.isActive ? 'default' : 'secondary'}
                    className={cn(
                      'flex-shrink-0 text-xs font-medium transition-all duration-300 ease-in-out',
                      isCollapsed
                        ? 'ml-0 w-0 opacity-0'
                        : 'ml-auto w-auto opacity-100'
                    )}
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div
                    id={`tooltip-${item.id}`}
                    className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100"
                    role="tooltip"
                    aria-hidden="true"
                  >
                    {item.label}
                    {item.badge && ` (${item.badge} notifications)`}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

function SidebarFooter({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const handleLogout = () => {
    // Handle logout - this would typically call an auth service
    console.log('Logout clicked');
  };

  return (
    <footer className="space-y-2 p-4" role="contentinfo">
      <Separator className="mb-3" />
      <Link
        href="/settings"
        className={cn(
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring focus:ring-offset-background group relative flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:outline-none',
          isCollapsed ? 'justify-center px-2' : 'px-3'
        )}
        aria-label="Go to settings"
      >
        <Settings
          className={cn(
            'h-4 w-4 transition-colors',
            isCollapsed ? 'mr-0' : 'mr-3'
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          Settings
        </span>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
            Settings
          </div>
        )}
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive group relative w-full rounded-xl py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02]',
          isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
        )}
        onClick={handleLogout}
        aria-label="Sign out of your account"
      >
        <LogOut
          className={cn(
            'h-4 w-4 transition-colors',
            isCollapsed ? 'mr-0' : 'mr-3'
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          Sign Out
        </span>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
            Sign Out
          </div>
        )}
      </Button>
    </footer>
  );
}

function SidebarContent({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());

  // Load and listen for profile updates
  useEffect(() => {
    setUserProfile(getUserProfile());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ht_name' || e.key === 'ht_goal') {
        setUserProfile(getUserProfile());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleCustomStorageChange = () => {
      setUserProfile(getUserProfile());
    };

    window.addEventListener('profileUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleCustomStorageChange);
    };
  }, []);

  // Navigation is now handled by the hook

  return (
    <div
      id="sidebar-content"
      className="bg-card border-border flex h-full flex-col border-r"
      role="complementary"
      aria-label="Sidebar navigation and user information"
      aria-expanded={!isCollapsed}
    >
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      <UserProfileSection user={userProfile} isCollapsed={isCollapsed} />
      <Separator className="mx-6" role="separator" aria-hidden="true" />
      <NavigationSection onNavigate={onNavigate} isCollapsed={isCollapsed} />
      <SidebarFooter isCollapsed={isCollapsed} />
    </div>
  );
}

// Remove the simple TopHeader function as we'll use the comprehensive one

export function EnhancedSidebar({
  children,
  basePath = '/dashboard',
  className,
}: EnhancedSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle escape key to close mobile sidebar and improve keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key for mobile sidebar
      if (event.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        // Return focus to menu button after closing
        const menuButton = document.querySelector(
          '[aria-label="Open navigation menu"]'
        ) as HTMLElement;
        if (menuButton) {
          menuButton.focus();
        }
        return;
      }

      // Handle keyboard navigation for sidebar collapse (desktop only)
      if (event.key === 'F2' && event.ctrlKey && !mobileOpen) {
        event.preventDefault();
        handleToggleCollapse();
        // Announce the state change
        const message = isCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed';
        announceToScreenReader(message, 'polite');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, isCollapsed]);

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Handle sidebar collapse animation with accessibility announcements
  const handleToggleCollapse = () => {
    setIsAnimating(true);
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    // Announce state change to screen readers
    const message = newCollapsedState
      ? 'Sidebar collapsed'
      : 'Sidebar expanded';
    announceToScreenReader(message, 'polite');

    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className={cn('bg-background min-h-screen', className)}>
      {/* Desktop Sidebar - Fixed positioning with proper z-index and collapse animation */}
      <aside
        className={cn(
          'hidden transition-all duration-300 ease-in-out lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block',
          isCollapsed ? 'lg:w-16' : 'lg:w-72',
          isAnimating && 'will-change-transform'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>

      {/* Mobile Sidebar with improved accessibility */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="border-border w-72 border-r p-0 focus:outline-none"
          aria-describedby="mobile-nav-description"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <div id="mobile-nav-description" className="sr-only">
              Use Tab to navigate between items, Enter or Space to select,
              Escape to close
            </div>
          </SheetHeader>
          <SidebarContent
            onNavigate={() => {
              setMobileOpen(false);
              // Announce navigation to screen readers
              announceToScreenReader('Navigation menu closed', 'polite');
            }}
            isCollapsed={false}
          />
        </SheetContent>
      </Sheet>

      {/* Main layout container with responsive grid system */}
      <div
        className={cn(
          // Base layout
          'flex min-h-screen flex-col',
          // Responsive sidebar offset with collapse animation
          isCollapsed ? 'lg:pl-16' : 'lg:pl-72',
          // Smooth transitions
          'transition-all duration-300 ease-in-out will-change-transform'
        )}
      >
        {/* Top Header with responsive behavior */}
        <TopHeader
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton={true}
          className="flex-shrink-0"
        />

        {/* Main content wrapper with responsive grid */}
        <div
          className={cn(
            // Flex layout for proper content flow
            'flex flex-1 flex-col',
            // Mobile-first responsive spacing
            'min-h-0' // Allow flex shrinking
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

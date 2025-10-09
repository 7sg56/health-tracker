'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type {
  NavigationItem,
  NavigationConfig,
  NavigationState,
  NavigationHandlers,
  UserProfile,
} from '@/lib/types/navigation';
import {
  useNavigationState,
  useNavigationItems,
  findActiveNavigationItem,
  generateBreadcrumbs,
} from '@/lib/utils/navigation';

/**
 * Hook for managing navigation state and interactions
 */
export function useNavigation(
  navigationConfig: NavigationConfig,
  handlers?: Partial<NavigationHandlers>
) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get navigation state with active items
  const navigationState = useNavigationState(navigationConfig);
  const navigationItems = useNavigationItems(navigationConfig.items);

  // Navigation handlers
  const handleNavigate = useCallback(
    (item: NavigationItem) => {
      if (item.disabled) return;

      // Close mobile navigation
      setMobileOpen(false);

      // Call custom handler if provided
      handlers?.onNavigate?.(item);

      // Navigate to the route
      router.push(item.href);
    },
    [router, handlers]
  );

  const handleMobileToggle = useCallback(
    (open?: boolean) => {
      const newState = open !== undefined ? open : !mobileOpen;
      setMobileOpen(newState);
      handlers?.onMobileToggle?.(newState);
    },
    [mobileOpen, handlers]
  );

  const handleProfileClick = useCallback(
    (profile: UserProfile) => {
      handlers?.onProfileClick?.(profile);
      // Default behavior: navigate to profile page
      router.push('/dashboard/profile');
    },
    [router, handlers]
  );

  const handleLogout = useCallback(() => {
    handlers?.onLogout?.();
    // Default behavior would be handled by auth service
  }, [handlers]);

  // Computed values
  const activeItem = useMemo(
    () => findActiveNavigationItem(navigationItems, pathname),
    [navigationItems, pathname]
  );

  const breadcrumbs = useMemo(
    () => generateBreadcrumbs(navigationConfig, pathname),
    [navigationConfig, pathname]
  );

  const state: NavigationState = {
    ...navigationState,
    mobileOpen,
  };

  return {
    // State
    state,
    navigationItems,
    activeItem,
    breadcrumbs,
    mobileOpen,

    // Actions
    navigate: handleNavigate,
    toggleMobile: handleMobileToggle,
    closeMobile: () => handleMobileToggle(false),
    openMobile: () => handleMobileToggle(true),
    onProfileClick: handleProfileClick,
    onLogout: handleLogout,

    // Utilities
    isActive: (itemId: string) => activeItem?.id === itemId,
    getItemById: (id: string) => navigationItems.find(item => item.id === id),
    getItemByHref: (href: string) =>
      navigationItems.find(item => item.href === href),
  };
}

/**
 * Hook for keyboard navigation shortcuts
 */
export function useNavigationShortcuts(
  navigationItems: NavigationItem[],
  onNavigate: (item: NavigationItem) => void
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for navigation shortcuts
      const shortcutKey = event.metaKey || event.ctrlKey;
      if (!shortcutKey) return;

      const key = event.key.toLowerCase();
      const shortcutMap: Record<string, string> = {
        d: 'dashboard',
        w: 'water',
        f: 'food',
        e: 'workout',
        h: 'health-score',
        p: 'profile',
        ',': 'settings',
      };

      const itemId = shortcutMap[key];
      if (itemId) {
        const item = navigationItems.find(nav => nav.id === itemId);
        if (item && !item.disabled) {
          event.preventDefault();
          onNavigate(item);
        }
      }
    },
    [navigationItems, onNavigate]
  );

  // Set up keyboard event listener
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
}

/**
 * Hook for navigation analytics and tracking
 */
export function useNavigationAnalytics() {
  const trackNavigation = useCallback(
    (
      item: NavigationItem,
      source: 'sidebar' | 'breadcrumb' | 'shortcut' = 'sidebar'
    ) => {
      // Track navigation events for analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'navigation', {
          event_category: 'Navigation',
          event_label: item.label,
          custom_parameter_1: source,
          custom_parameter_2: item.id,
        });
      }

      // You could also send to other analytics services here
      console.log('Navigation tracked:', {
        item: item.id,
        label: item.label,
        source,
        timestamp: new Date().toISOString(),
      });
    },
    []
  );

  return { trackNavigation };
}

/**
 * Hook for managing navigation preferences
 */
export function useNavigationPreferences() {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('navigation-preferences');
      return stored
        ? JSON.parse(stored)
        : {
            sidebarCollapsed: false,
            showBadges: true,
            showIcons: true,
            compactMode: false,
          };
    }
    return {
      sidebarCollapsed: false,
      showBadges: true,
      showIcons: true,
      compactMode: false,
    };
  });

  const updatePreferences = useCallback(
    (updates: Partial<typeof preferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'navigation-preferences',
          JSON.stringify(newPreferences)
        );
      }
    },
    [preferences]
  );

  return {
    preferences,
    updatePreferences,
    toggleSidebar: () =>
      updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed }),
    toggleBadges: () =>
      updatePreferences({ showBadges: !preferences.showBadges }),
    toggleIcons: () => updatePreferences({ showIcons: !preferences.showIcons }),
    toggleCompactMode: () =>
      updatePreferences({ compactMode: !preferences.compactMode }),
  };
}

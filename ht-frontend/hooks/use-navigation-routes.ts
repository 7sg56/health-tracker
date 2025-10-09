/**
 * Navigation Routes Hook
 * Provides consistent navigation routing throughout the application
 */

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  Home,
  Droplets,
  Utensils,
  Dumbbell,
  Heart,
  User,
  Settings,
  TrendingUp,
  Calendar,
  Target,
  Award,
  BarChart3,
  Clock,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationRoute {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  description?: string;
  shortcut?: string;
  isActive?: boolean;
  isExternal?: boolean;
}

export interface NavigationGroup {
  id: string;
  label: string;
  routes: NavigationRoute[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Main navigation routes for the dashboard
 */
const MAIN_ROUTES: Omit<NavigationRoute, 'isActive'>[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'View your health overview and daily progress',
    shortcut: '⌘D',
  },
  {
    id: 'water',
    label: 'Water Intake',
    href: '/dashboard/water',
    icon: Droplets,
    badge: 'Daily',
    description: 'Track your daily water consumption',
    shortcut: '⌘W',
  },
  {
    id: 'food',
    label: 'Food Intake',
    href: '/dashboard/food',
    icon: Utensils,
    badge: 'Track',
    description: 'Log your meals and nutrition',
    shortcut: '⌘F',
  },
  {
    id: 'workout',
    label: 'Workouts',
    href: '/dashboard/workout',
    icon: Dumbbell,
    badge: 'Fit',
    description: 'Record your exercise activities',
    shortcut: '⌘E',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Manage your account and preferences',
    shortcut: '⌘P',
  },
];

/**
 * Extended navigation routes (for premium features)
 */
const EXTENDED_ROUTES: Omit<NavigationRoute, 'isActive'>[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: 'Pro',
    description: 'Advanced health analytics and insights',
  },
  {
    id: 'goals',
    label: 'Goals',
    href: '/dashboard/goals',
    icon: Target,
    description: 'Set and track your health goals',
  },
  {
    id: 'history',
    label: 'History',
    href: '/dashboard/history',
    icon: Clock,
    description: 'View your health tracking history',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    href: '/dashboard/achievements',
    icon: Award,
    badge: 'New',
    description: 'View your health milestones and rewards',
  },
];

/**
 * Secondary navigation routes (settings, etc.)
 */
const SECONDARY_ROUTES: Omit<NavigationRoute, 'isActive'>[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure app preferences and account settings',
  },
];

/**
 * Hook to get navigation routes with active state
 */
export function useNavigationRoutes(
  options: {
    includeExtended?: boolean;
    includeSecondary?: boolean;
  } = {}
) {
  const pathname = usePathname();
  const { includeExtended = false, includeSecondary = false } = options;

  const routes = useMemo(() => {
    let allRoutes = [...MAIN_ROUTES];

    if (includeExtended) {
      allRoutes = [...allRoutes, ...EXTENDED_ROUTES];
    }

    if (includeSecondary) {
      allRoutes = [...allRoutes, ...SECONDARY_ROUTES];
    }

    return allRoutes.map(route => ({
      ...route,
      isActive:
        pathname === route.href ||
        (route.href === '/dashboard' && pathname === '/dashboard'),
    }));
  }, [pathname, includeExtended, includeSecondary]);

  return routes;
}

/**
 * Hook to get grouped navigation routes
 */
export function useNavigationGroups(): NavigationGroup[] {
  const routes = useNavigationRoutes({ includeExtended: true });

  return useMemo(() => {
    const groups: NavigationGroup[] = [
      {
        id: 'main',
        label: 'Main Navigation',
        routes: routes.filter(route =>
          ['dashboard', 'water'].includes(route.id)
        ),
      },
      {
        id: 'tracking',
        label: 'Health Tracking',
        routes: routes.filter(route => ['food', 'workout'].includes(route.id)),
        collapsible: true,
        defaultCollapsed: false,
      },
      {
        id: 'insights',
        label: 'Insights & Goals',
        routes: routes.filter(route =>
          ['analytics', 'goals', 'history', 'achievements'].includes(route.id)
        ),
        collapsible: true,
        defaultCollapsed: true,
      },
      {
        id: 'account',
        label: 'Account',
        routes: routes.filter(route => route.id === 'profile'),
      },
    ];

    // Filter out empty groups
    return groups.filter(group => group.routes.length > 0);
  }, [routes]);
}

/**
 * Hook to get the current active route
 */
export function useActiveRoute(): NavigationRoute | null {
  const routes = useNavigationRoutes({
    includeExtended: true,
    includeSecondary: true,
  });

  return useMemo(() => {
    return routes.find(route => route.isActive) || null;
  }, [routes]);
}

/**
 * Hook to get breadcrumb items for the current route
 */
export function useBreadcrumbs(): Array<{ label: string; href?: string }> {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href?: string }> = [];

    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });

    // Map segments to labels
    const segmentLabels: Record<string, string> = {
      water: 'Water Intake',
      food: 'Food Intake',
      workout: 'Workouts',
      profile: 'Profile',
      settings: 'Settings',
      analytics: 'Analytics',
      goals: 'Goals',
      history: 'History',
      achievements: 'Achievements',
    };

    // Build breadcrumb path
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip dashboard since we already added it
      if (segment === 'dashboard' && index === 0) return;

      const label =
        segmentLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);

      // Last segment is current page (no link)
      if (index === segments.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    });

    return breadcrumbs;
  }, [pathname]);
}

/**
 * Hook to check if a route is active
 */
export function useIsRouteActive(href: string): boolean {
  const pathname = usePathname();

  return useMemo(() => {
    return (
      pathname === href || (href === '/dashboard' && pathname === '/dashboard')
    );
  }, [pathname, href]);
}

/**
 * Utility to get route by ID
 */
export function getRouteById(id: string): NavigationRoute | null {
  const allRoutes = [...MAIN_ROUTES, ...EXTENDED_ROUTES, ...SECONDARY_ROUTES];
  return allRoutes.find(route => route.id === id) || null;
}

/**
 * Utility to check if a route exists
 */
export function routeExists(href: string): boolean {
  const allRoutes = [...MAIN_ROUTES, ...EXTENDED_ROUTES, ...SECONDARY_ROUTES];
  return allRoutes.some(route => route.href === href);
}

/**
 * Utility to get the canonical dashboard path for any path
 */
export function getCanonicalDashboardPath(path: string): string {
  // Handle /home to /dashboard redirects
  if (path.startsWith('/home')) {
    return path.replace('/home', '/dashboard');
  }

  return path;
}

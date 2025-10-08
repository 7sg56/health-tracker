import {
  Home,
  Droplets,
  Utensils,
  Dumbbell,
  User,
  Heart,
  Settings,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  BarChart3,
  Clock,
  Award,
} from 'lucide-react';

import type {
  NavigationItem,
  NavigationConfig,
  UserProfile,
  HealthSummary,
  NavigationGroup,
} from '@/lib/types/navigation';

/**
 * Default navigation items for the health tracker application
 */
export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
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
 * Secondary navigation items (typically in footer or settings)
 */
export const SECONDARY_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure app preferences and account settings',
  },
];

/**
 * Navigation groups for organized sidebar display
 */
export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'main',
    label: 'Main Navigation',
    items: DEFAULT_NAVIGATION_ITEMS.slice(0, 2), // Dashboard and Water
  },
  {
    id: 'tracking',
    label: 'Health Tracking',
    items: DEFAULT_NAVIGATION_ITEMS.slice(2, 4), // Food, Workout
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'account',
    label: 'Account',
    items: [DEFAULT_NAVIGATION_ITEMS[5]], // Profile
  },
];

/**
 * Extended navigation items with additional features
 */
export const EXTENDED_NAVIGATION_ITEMS: NavigationItem[] = [
  ...DEFAULT_NAVIGATION_ITEMS,
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
 * Creates a navigation configuration for a specific base path
 * Always ensures routes use /dashboard as the canonical base
 */
export function createNavigationConfig(
  basePath: string = '/dashboard',
  options: {
    extended?: boolean;
    userProfile?: UserProfile;
    healthSummary?: HealthSummary;
  } = {}
): NavigationConfig {
  const { extended = false, userProfile, healthSummary } = options;

  // Choose navigation items based on extended option
  const baseItems = extended
    ? EXTENDED_NAVIGATION_ITEMS
    : DEFAULT_NAVIGATION_ITEMS;

  // Always use /dashboard as the canonical base path for consistency
  const canonicalBasePath = '/dashboard';

  // Ensure all items use the canonical dashboard path
  const items = baseItems.map(item => ({
    ...item,
    href: item.href.startsWith('/dashboard')
      ? item.href
      : `${canonicalBasePath}${item.href.replace(basePath, '')}`,
  }));

  return {
    items,
    groups: NAVIGATION_GROUPS.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        href: item.href.startsWith('/dashboard')
          ? item.href
          : `${canonicalBasePath}${item.href.replace(basePath, '')}`,
      })),
    })),
    userProfile,
    healthSummary,
    basePath: canonicalBasePath, // Always use dashboard as base
  };
}

/**
 * Default user profile for development/testing
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '1',
  name: 'Sourish Ghosh',
  email: 'sourish@example.com',
  avatar: '/avatar-placeholder.png',
  healthGoal: 'Stay Fit & Healthy',
  initials: 'SG',
};

/**
 * Default health summary for development/testing
 */
export const DEFAULT_HEALTH_SUMMARY: HealthSummary = {
  healthScore: 85,
  waterIntake: {
    current: 1.2,
    goal: 2.5,
    unit: 'L',
  },
  calories: {
    current: 1450,
    goal: 2000,
    unit: 'kcal',
  },
  exercise: {
    current: 25,
    goal: 60,
    unit: 'min',
  },
  lastUpdated: new Date(),
};

/**
 * Badge configurations for different navigation contexts
 */
export const NAVIGATION_BADGES = {
  daily: 'Daily',
  track: 'Track',
  fit: 'Fit',
  new: 'New',
  pro: 'Pro',
  beta: 'Beta',
  updated: 'Updated',
} as const;

/**
 * Navigation item priorities for sorting and display
 */
export const NAVIGATION_PRIORITIES = {
  dashboard: 1,
  water: 2,
  food: 3,
  workout: 4,
  profile: 6,
  analytics: 7,
  goals: 8,
  history: 9,
  achievements: 10,
  settings: 99,
} as const;

/**
 * Keyboard shortcuts mapping
 */
export const NAVIGATION_SHORTCUTS = {
  dashboard: '⌘D',
  water: '⌘W',
  food: '⌘F',
  workout: '⌘E',
  profile: '⌘P',
  settings: '⌘,',
} as const;

// Navigation types
export type {
  NavigationItem,
  NavigationGroup,
  NavigationConfig,
  UserProfile,
  HealthSummary,
  NavigationState,
  BreadcrumbItem,
  NavigationTheme,
  NavigationHandlers,
} from '@/lib/types/navigation';

// Navigation configuration
export {
  DEFAULT_NAVIGATION_ITEMS,
  SECONDARY_NAVIGATION_ITEMS,
  NAVIGATION_GROUPS,
  EXTENDED_NAVIGATION_ITEMS,
  createNavigationConfig,
  DEFAULT_USER_PROFILE,
  DEFAULT_HEALTH_SUMMARY,
  NAVIGATION_BADGES,
  NAVIGATION_PRIORITIES,
  NAVIGATION_SHORTCUTS,
} from '@/lib/config/navigation';

// Navigation utilities
export {
  isNavigationItemActive,
  updateNavigationActiveStates,
  updateNavigationGroupActiveStates,
  findActiveNavigationItem,
  generateBreadcrumbs,
  useNavigationState,
  useNavigationItems,
  useNavigationGroups,
  filterNavigationItems,
  sortNavigationItems,
  groupNavigationItems,
  validateNavigationConfig,
  createNavigationItem,
  mergeNavigationConfigs,
} from '@/lib/utils/navigation';

// Navigation hooks
export {
  useNavigation,
  useNavigationShortcuts,
  useNavigationAnalytics,
  useNavigationPreferences,
} from '@/hooks/use-navigation';
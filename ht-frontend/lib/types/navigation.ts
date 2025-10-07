import { LucideIcon } from 'lucide-react';

/**
 * Navigation item interface for sidebar and navigation components
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  /** Display label for the navigation item */
  label: string;
  /** Route path for navigation */
  href: string;
  /** Lucide icon component for the navigation item */
  icon: LucideIcon;
  /** Optional badge text or number to display */
  badge?: string | number;
  /** Whether this navigation item is currently active */
  isActive?: boolean;
  /** Optional description for accessibility */
  description?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional keyboard shortcut */
  shortcut?: string;
}

/**
 * Navigation group interface for organizing navigation items
 */
export interface NavigationGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display label for the group */
  label: string;
  /** Navigation items in this group */
  items: NavigationItem[];
  /** Whether the group is collapsible */
  collapsible?: boolean;
  /** Whether the group is initially collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** Primary navigation items */
  items: NavigationItem[];
  /** Optional grouped navigation items */
  groups?: NavigationGroup[];
  /** User profile information */
  userProfile?: UserProfile;
  /** Health summary data */
  healthSummary?: HealthSummary;
  /** Base path for navigation (e.g., '/dashboard') */
  basePath: string;
}

/**
 * User profile interface for navigation display
 */
export interface UserProfile {
  /** User ID */
  id: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Optional avatar image URL */
  avatar?: string;
  /** User's health goal or status */
  healthGoal?: string;
  /** User's initials for fallback display */
  initials?: string;
}

/**
 * Health summary interface for sidebar widget
 */
export interface HealthSummary {
  /** Overall health score (0-100) */
  healthScore: number;
  /** Water intake progress */
  waterIntake: {
    current: number;
    goal: number;
    unit?: string;
  };
  /** Calorie intake progress */
  calories: {
    current: number;
    goal: number;
    unit?: string;
  };
  /** Exercise progress */
  exercise: {
    current: number;
    goal: number;
    unit?: string;
  };
  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Navigation state interface for managing active states
 */
export interface NavigationState {
  /** Currently active navigation item ID */
  activeItemId?: string;
  /** Currently active path */
  activePath: string;
  /** Whether mobile navigation is open */
  mobileOpen: boolean;
  /** Navigation history for breadcrumbs */
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Whether this is the current page */
  isCurrentPage?: boolean;
}

/**
 * Navigation theme configuration
 */
export interface NavigationTheme {
  /** Primary color scheme */
  variant: 'default' | 'sidebar' | 'compact';
  /** Whether to show badges */
  showBadges: boolean;
  /** Whether to show icons */
  showIcons: boolean;
  /** Whether to show user profile section */
  showUserProfile: boolean;
  /** Whether to show health summary */
  showHealthSummary: boolean;
}

/**
 * Navigation event handlers
 */
export interface NavigationHandlers {
  /** Called when a navigation item is clicked */
  onNavigate?: (item: NavigationItem) => void;
  /** Called when mobile navigation is toggled */
  onMobileToggle?: (open: boolean) => void;
  /** Called when user profile is clicked */
  onProfileClick?: (profile: UserProfile) => void;
  /** Called when logout is triggered */
  onLogout?: () => void;
}
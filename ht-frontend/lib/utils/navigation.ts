import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type {
  NavigationItem,
  NavigationConfig,
  NavigationState,
  BreadcrumbItem,
  NavigationGroup,
} from '@/lib/types/navigation';

/**
 * Determines if a navigation item is active based on the current pathname
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
  exact: boolean = false
): boolean {
  if (exact) {
    return pathname === item.href;
  }

  // For dashboard root, only match exact path to avoid always being active
  if (item.href.endsWith('/dashboard') && !item.href.includes('/dashboard/')) {
    return pathname === item.href || pathname === item.href + '/';
  }

  // For other paths, match if pathname starts with item href
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

/**
 * Updates navigation items with active states based on current pathname
 */
export function updateNavigationActiveStates(
  items: NavigationItem[],
  pathname: string
): NavigationItem[] {
  return items.map(item => ({
    ...item,
    isActive: isNavigationItemActive(item, pathname),
  }));
}

/**
 * Updates navigation groups with active states
 */
export function updateNavigationGroupActiveStates(
  groups: NavigationGroup[],
  pathname: string
): NavigationGroup[] {
  return groups.map(group => ({
    ...group,
    items: updateNavigationActiveStates(group.items, pathname),
  }));
}

/**
 * Finds the currently active navigation item
 */
export function findActiveNavigationItem(
  items: NavigationItem[],
  pathname: string
): NavigationItem | undefined {
  // First try exact match
  let activeItem = items.find(item =>
    isNavigationItemActive(item, pathname, true)
  );

  // If no exact match, find the best partial match (longest matching path)
  if (!activeItem) {
    const matches = items
      .filter(item => isNavigationItemActive(item, pathname, false))
      .sort((a, b) => b.href.length - a.href.length);

    activeItem = matches[0];
  }

  return activeItem;
}

/**
 * Generates breadcrumb items from navigation config and current path
 */
export function generateBreadcrumbs(
  navigationConfig: NavigationConfig,
  pathname: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with dashboard/home
  const basePath = navigationConfig.basePath;
  if (pathname !== basePath) {
    breadcrumbs.push({
      label: 'Dashboard',
      href: basePath,
      isCurrentPage: false,
    });
  }

  // Find the active navigation item
  const activeItem = findActiveNavigationItem(navigationConfig.items, pathname);

  if (activeItem && activeItem.href !== basePath) {
    breadcrumbs.push({
      label: activeItem.label,
      href: activeItem.href,
      isCurrentPage: true,
    });
  }

  // Handle sub-pages (e.g., /dashboard/water/add)
  if (pathname !== activeItem?.href && activeItem) {
    const pathSegments = pathname
      .replace(activeItem.href, '')
      .split('/')
      .filter(Boolean);

    pathSegments.forEach((segment, index) => {
      const segmentPath =
        activeItem.href + '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label: formatSegmentLabel(segment),
        href: segmentPath,
        isCurrentPage: isLast,
      });
    });
  }

  return breadcrumbs;
}

/**
 * Formats a URL segment into a readable label
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Hook for managing navigation state
 */
export function useNavigationState(
  navigationConfig: NavigationConfig
): NavigationState {
  const pathname = usePathname();

  return useMemo(() => {
    const updatedItems = updateNavigationActiveStates(
      navigationConfig.items,
      pathname
    );
    const activeItem = findActiveNavigationItem(updatedItems, pathname);
    const breadcrumbs = generateBreadcrumbs(navigationConfig, pathname);

    return {
      activeItemId: activeItem?.id,
      activePath: pathname,
      mobileOpen: false, // This would be managed by component state
      breadcrumbs,
    };
  }, [navigationConfig, pathname]);
}

/**
 * Hook for getting navigation items with active states
 */
export function useNavigationItems(items: NavigationItem[]): NavigationItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    return updateNavigationActiveStates(items, pathname);
  }, [items, pathname]);
}

/**
 * Hook for getting navigation groups with active states
 */
export function useNavigationGroups(
  groups: NavigationGroup[]
): NavigationGroup[] {
  const pathname = usePathname();

  return useMemo(() => {
    return updateNavigationGroupActiveStates(groups, pathname);
  }, [groups, pathname]);
}

/**
 * Filters navigation items based on user permissions or conditions
 */
export function filterNavigationItems(
  items: NavigationItem[],
  filter: (item: NavigationItem) => boolean
): NavigationItem[] {
  return items.filter(filter);
}

/**
 * Sorts navigation items by priority or custom sort function
 */
export function sortNavigationItems(
  items: NavigationItem[],
  sortFn?: (a: NavigationItem, b: NavigationItem) => number
): NavigationItem[] {
  if (sortFn) {
    return [...items].sort(sortFn);
  }

  // Default sort by priority (if available) or by label
  return [...items].sort((a, b) => {
    // You could implement priority-based sorting here
    return a.label.localeCompare(b.label);
  });
}

/**
 * Groups navigation items by category or custom grouping function
 */
export function groupNavigationItems(
  items: NavigationItem[],
  groupFn: (item: NavigationItem) => string
): Record<string, NavigationItem[]> {
  return items.reduce(
    (groups, item) => {
      const groupKey = groupFn(item);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, NavigationItem[]>
  );
}

/**
 * Validates navigation configuration
 */
export function validateNavigationConfig(config: NavigationConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate IDs
  const ids = config.items.map(item => item.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate navigation item IDs: ${duplicateIds.join(', ')}`);
  }

  // Check for duplicate hrefs
  const hrefs = config.items.map(item => item.href);
  const duplicateHrefs = hrefs.filter(
    (href, index) => hrefs.indexOf(href) !== index
  );
  if (duplicateHrefs.length > 0) {
    errors.push(
      `Duplicate navigation item hrefs: ${duplicateHrefs.join(', ')}`
    );
  }

  // Check for empty labels
  const emptyLabels = config.items.filter(item => !item.label.trim());
  if (emptyLabels.length > 0) {
    errors.push(
      `Navigation items with empty labels: ${emptyLabels.map(item => item.id).join(', ')}`
    );
  }

  // Check for invalid hrefs
  const invalidHrefs = config.items.filter(item => !item.href.startsWith('/'));
  if (invalidHrefs.length > 0) {
    errors.push(
      `Navigation items with invalid hrefs: ${invalidHrefs.map(item => item.id).join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a navigation item with default values
 */
export function createNavigationItem(
  partial: Partial<NavigationItem> &
    Pick<NavigationItem, 'id' | 'label' | 'href' | 'icon'>
): NavigationItem {
  return {
    isActive: false,
    disabled: false,
    ...partial,
  };
}

/**
 * Merges multiple navigation configurations
 */
export function mergeNavigationConfigs(
  ...configs: Partial<NavigationConfig>[]
): NavigationConfig {
  const merged: NavigationConfig = {
    items: [],
    groups: [],
    basePath: '/dashboard',
  };

  configs.forEach(config => {
    if (config.items) {
      merged.items.push(...config.items);
    }
    if (config.groups) {
      merged.groups?.push(...config.groups);
    }
    if (config.userProfile) {
      merged.userProfile = config.userProfile;
    }
    if (config.healthSummary) {
      merged.healthSummary = config.healthSummary;
    }
    if (config.basePath) {
      merged.basePath = config.basePath;
    }
  });

  return merged;
}

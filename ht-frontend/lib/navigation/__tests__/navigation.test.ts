import {
  isNavigationItemActive,
  updateNavigationActiveStates,
  findActiveNavigationItem,
  generateBreadcrumbs,
  validateNavigationConfig,
  createNavigationItem,
} from '../index';
import { Home, Droplets, Utensils } from 'lucide-react';
import type { NavigationItem, NavigationConfig } from '@/lib/types/navigation';

// Mock navigation items for testing
const mockNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'water',
    label: 'Water Intake',
    href: '/dashboard/water',
    icon: Droplets,
    badge: 'Daily',
  },
  {
    id: 'food',
    label: 'Food Intake',
    href: '/dashboard/food',
    icon: Utensils,
    badge: 'Track',
  },
];

const mockNavigationConfig: NavigationConfig = {
  items: mockNavigationItems,
  basePath: '/dashboard',
};

describe('Navigation Utilities', () => {
  describe('isNavigationItemActive', () => {
    it('should return true for exact path match', () => {
      const item = mockNavigationItems[0]; // dashboard
      expect(isNavigationItemActive(item, '/dashboard', true)).toBe(true);
      expect(isNavigationItemActive(item, '/dashboard/', true)).toBe(false);
    });

    it('should return true for partial path match when not exact', () => {
      const item = mockNavigationItems[1]; // water
      expect(isNavigationItemActive(item, '/dashboard/water', false)).toBe(true);
      expect(isNavigationItemActive(item, '/dashboard/water/add', false)).toBe(true);
      expect(isNavigationItemActive(item, '/dashboard/food', false)).toBe(false);
    });

    it('should handle dashboard root path correctly', () => {
      const item = mockNavigationItems[0]; // dashboard
      expect(isNavigationItemActive(item, '/dashboard', false)).toBe(true);
      expect(isNavigationItemActive(item, '/dashboard/', false)).toBe(true);
      expect(isNavigationItemActive(item, '/dashboard/water', false)).toBe(false);
    });
  });

  describe('updateNavigationActiveStates', () => {
    it('should update active states correctly', () => {
      const updatedItems = updateNavigationActiveStates(mockNavigationItems, '/dashboard/water');
      
      expect(updatedItems[0].isActive).toBe(false); // dashboard
      expect(updatedItems[1].isActive).toBe(true);  // water
      expect(updatedItems[2].isActive).toBe(false); // food
    });
  });

  describe('findActiveNavigationItem', () => {
    it('should find exact match first', () => {
      const activeItem = findActiveNavigationItem(mockNavigationItems, '/dashboard/water');
      expect(activeItem?.id).toBe('water');
    });

    it('should find partial match when no exact match', () => {
      const activeItem = findActiveNavigationItem(mockNavigationItems, '/dashboard/water/add');
      expect(activeItem?.id).toBe('water');
    });

    it('should return undefined when no match found', () => {
      const activeItem = findActiveNavigationItem(mockNavigationItems, '/settings');
      expect(activeItem).toBeUndefined();
    });
  });

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for dashboard root', () => {
      const breadcrumbs = generateBreadcrumbs(mockNavigationConfig, '/dashboard');
      expect(breadcrumbs).toHaveLength(0); // No breadcrumbs for root
    });

    it('should generate breadcrumbs for sub-page', () => {
      const breadcrumbs = generateBreadcrumbs(mockNavigationConfig, '/dashboard/water');
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[0].isCurrentPage).toBe(false);
      expect(breadcrumbs[1].label).toBe('Water Intake');
      expect(breadcrumbs[1].isCurrentPage).toBe(true);
    });

    it('should generate breadcrumbs for nested sub-page', () => {
      const breadcrumbs = generateBreadcrumbs(mockNavigationConfig, '/dashboard/water/add');
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2].label).toBe('Add');
      expect(breadcrumbs[2].isCurrentPage).toBe(true);
    });
  });

  describe('validateNavigationConfig', () => {
    it('should validate correct configuration', () => {
      const result = validateNavigationConfig(mockNavigationConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate IDs', () => {
      const invalidConfig: NavigationConfig = {
        ...mockNavigationConfig,
        items: [
          ...mockNavigationItems,
          { ...mockNavigationItems[0], href: '/different' }, // Duplicate ID
        ],
      };
      
      const result = validateNavigationConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Duplicate navigation item IDs'))).toBe(true);
    });

    it('should detect invalid hrefs', () => {
      const invalidConfig: NavigationConfig = {
        ...mockNavigationConfig,
        items: [
          {
            id: 'invalid',
            label: 'Invalid',
            href: 'invalid-href', // Should start with /
            icon: Home,
          },
        ],
      };
      
      const result = validateNavigationConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('invalid hrefs'))).toBe(true);
    });
  });

  describe('createNavigationItem', () => {
    it('should create navigation item with defaults', () => {
      const item = createNavigationItem({
        id: 'test',
        label: 'Test',
        href: '/test',
        icon: Home,
      });
      
      expect(item.isActive).toBe(false);
      expect(item.disabled).toBe(false);
      expect(item.id).toBe('test');
      expect(item.label).toBe('Test');
    });

    it('should override defaults with provided values', () => {
      const item = createNavigationItem({
        id: 'test',
        label: 'Test',
        href: '/test',
        icon: Home,
        isActive: true,
        disabled: true,
        badge: 'New',
      });
      
      expect(item.isActive).toBe(true);
      expect(item.disabled).toBe(true);
      expect(item.badge).toBe('New');
    });
  });
});
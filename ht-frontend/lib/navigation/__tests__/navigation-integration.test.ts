import {
  createNavigationConfig,
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_USER_PROFILE,
  DEFAULT_HEALTH_SUMMARY,
} from '../index';

describe('Navigation Integration', () => {
  describe('createNavigationConfig', () => {
    it('should create a complete navigation configuration with all required items', () => {
      const config = createNavigationConfig('/dashboard', {
        userProfile: DEFAULT_USER_PROFILE,
        healthSummary: DEFAULT_HEALTH_SUMMARY,
      });

      // Verify all required navigation items are present
      const requiredItems = ['dashboard', 'water', 'food', 'workout', 'profile'];
      const configItemIds = config.items.map(item => item.id);
      
      requiredItems.forEach(requiredId => {
        expect(configItemIds).toContain(requiredId);
      });

      // Verify navigation items have correct structure
      config.items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('icon');
        expect(item.href).toMatch(/^\/dashboard/);
      });

      // Verify user profile and health summary are included
      expect(config.userProfile).toEqual(DEFAULT_USER_PROFILE);
      expect(config.healthSummary).toEqual(DEFAULT_HEALTH_SUMMARY);
      expect(config.basePath).toBe('/dashboard');
    });

    it('should support custom base paths', () => {
      const config = createNavigationConfig('/app');
      
      config.items.forEach(item => {
        expect(item.href).toMatch(/^\/app/);
      });
      
      expect(config.basePath).toBe('/app');
    });

    it('should support extended navigation items', () => {
      const basicConfig = createNavigationConfig('/dashboard', { extended: false });
      const extendedConfig = createNavigationConfig('/dashboard', { extended: true });
      
      expect(extendedConfig.items.length).toBeGreaterThan(basicConfig.items.length);
      
      // Extended config should include additional items like analytics, goals, etc.
      const extendedItemIds = extendedConfig.items.map(item => item.id);
      expect(extendedItemIds).toContain('analytics');
      expect(extendedItemIds).toContain('goals');
      expect(extendedItemIds).toContain('history');
      expect(extendedItemIds).toContain('achievements');
    });
  });

  describe('Navigation Requirements Compliance', () => {
    it('should meet all requirement 4 acceptance criteria', () => {
      const config = createNavigationConfig('/dashboard');
      
      // 4.1: Display navigation items for Home, Water, Food, Workout, and Profile
      const requiredItems = [
        { id: 'dashboard', label: 'Dashboard' }, // Home
        { id: 'water', label: 'Water Intake' },
        { id: 'food', label: 'Food Intake' },
        { id: 'workout', label: 'Workouts' },
        { id: 'profile', label: 'Profile' },
      ];

      requiredItems.forEach(({ id, label }) => {
        const item = config.items.find(item => item.id === id);
        expect(item).toBeDefined();
        expect(item?.label).toContain(label.split(' ')[0]); // Partial match for flexibility
      });

      // 4.2-4.6: Navigation hrefs should point to correct pages
      const expectedRoutes = {
        dashboard: '/dashboard',
        water: '/dashboard/water',
        food: '/dashboard/food',
        workout: '/dashboard/workout',
        profile: '/dashboard/profile',
      };

      Object.entries(expectedRoutes).forEach(([id, expectedHref]) => {
        const item = config.items.find(item => item.id === id);
        expect(item?.href).toBe(expectedHref);
      });
    });

    it('should include proper icons and badges for navigation items', () => {
      const config = createNavigationConfig('/dashboard');
      
      // Verify that navigation items have icons
      config.items.forEach(item => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('object'); // Lucide icons are React components (objects)
      });

      // Verify that some items have badges
      const itemsWithBadges = config.items.filter(item => item.badge);
      expect(itemsWithBadges.length).toBeGreaterThan(0);
    });

    it('should support keyboard shortcuts', () => {
      const config = createNavigationConfig('/dashboard');
      
      // Verify that main navigation items have shortcuts
      const itemsWithShortcuts = config.items.filter(item => item.shortcut);
      expect(itemsWithShortcuts.length).toBeGreaterThan(0);
      
      // Verify shortcut format
      itemsWithShortcuts.forEach(item => {
        expect(item.shortcut).toMatch(/^⌘[A-Z]$/);
      });
    });
  });
});
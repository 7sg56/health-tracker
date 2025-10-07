# Navigation Configuration and Utilities

This module provides a comprehensive navigation system for the HealthTracker frontend application, including configuration, utilities, and hooks for managing sidebar navigation, active states, breadcrumbs, and user interactions.

## Features

- ✅ **Navigation item interfaces and types** - Complete TypeScript interfaces for navigation items, groups, and configurations
- ✅ **Navigation configuration with icons and badges** - Pre-configured navigation items with Lucide icons and status badges
- ✅ **Active state detection and highlighting logic** - Automatic detection of active navigation items based on current route
- ✅ **Navigation helper utilities for routing** - Utilities for breadcrumb generation, validation, and state management

## Quick Start

```typescript
import { 
  createNavigationConfig, 
  useNavigation,
  DEFAULT_USER_PROFILE,
  DEFAULT_HEALTH_SUMMARY 
} from '@/lib/navigation';

// Create navigation configuration
const navigationConfig = createNavigationConfig('/dashboard', {
  userProfile: DEFAULT_USER_PROFILE,
  healthSummary: DEFAULT_HEALTH_SUMMARY,
});

// Use in a component
function MyComponent() {
  const {
    navigationItems,
    activeItem,
    navigate,
    isActive
  } = useNavigation(navigationConfig);

  return (
    <nav>
      {navigationItems.map(item => (
        <button
          key={item.id}
          onClick={() => navigate(item)}
          className={isActive(item.id) ? 'active' : ''}
        >
          <item.icon />
          {item.label}
          {item.badge && <span>{item.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
```

## Navigation Items

The system includes all required navigation items for the HealthTracker application:

| Item | ID | Route | Icon | Badge | Shortcut |
|------|----|----|------|-------|----------|
| Dashboard | `dashboard` | `/dashboard` | Home | - | ⌘D |
| Water Intake | `water` | `/dashboard/water` | Droplets | Daily | ⌘W |
| Food Intake | `food` | `/dashboard/food` | Utensils | Track | ⌘F |
| Workouts | `workout` | `/dashboard/workout` | Dumbbell | Fit | ⌘E |
| Health Score | `health-score` | `/dashboard/health-score` | Heart | - | ⌘H |
| Profile | `profile` | `/dashboard/profile` | User | - | ⌘P |

## API Reference

### Types

#### NavigationItem
```typescript
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
  description?: string;
  disabled?: boolean;
  shortcut?: string;
}
```

#### NavigationConfig
```typescript
interface NavigationConfig {
  items: NavigationItem[];
  groups?: NavigationGroup[];
  userProfile?: UserProfile;
  healthSummary?: HealthSummary;
  basePath: string;
}
```

### Configuration Functions

#### createNavigationConfig(basePath, options)
Creates a complete navigation configuration.

```typescript
const config = createNavigationConfig('/dashboard', {
  extended: false, // Use basic or extended navigation items
  userProfile: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    healthGoal: 'Stay Fit',
  },
  healthSummary: {
    healthScore: 85,
    waterIntake: { current: 1.2, goal: 2.5, unit: 'L' },
    calories: { current: 1450, goal: 2000, unit: 'kcal' },
    exercise: { current: 25, goal: 60, unit: 'min' },
  }
});
```

### Utility Functions

#### isNavigationItemActive(item, pathname, exact?)
Determines if a navigation item is active based on the current pathname.

```typescript
const isActive = isNavigationItemActive(item, '/dashboard/water', false);
```

#### updateNavigationActiveStates(items, pathname)
Updates navigation items with active states.

```typescript
const updatedItems = updateNavigationActiveStates(navigationItems, pathname);
```

#### findActiveNavigationItem(items, pathname)
Finds the currently active navigation item.

```typescript
const activeItem = findActiveNavigationItem(navigationItems, pathname);
```

#### generateBreadcrumbs(config, pathname)
Generates breadcrumb items from navigation config and current path.

```typescript
const breadcrumbs = generateBreadcrumbs(navigationConfig, pathname);
```

#### validateNavigationConfig(config)
Validates navigation configuration for errors.

```typescript
const { isValid, errors } = validateNavigationConfig(config);
```

### Hooks

#### useNavigation(config, handlers?)
Main navigation hook for managing navigation state and interactions.

```typescript
const {
  state,
  navigationItems,
  activeItem,
  breadcrumbs,
  navigate,
  toggleMobile,
  isActive,
  getItemById
} = useNavigation(navigationConfig, {
  onNavigate: (item) => console.log('Navigating to:', item.label),
  onMobileToggle: (open) => console.log('Mobile nav:', open),
  onLogout: () => console.log('Logging out'),
});
```

#### useNavigationShortcuts(items, onNavigate)
Enables keyboard shortcuts for navigation.

```typescript
useNavigationShortcuts(navigationItems, navigate);
```

#### useNavigationPreferences()
Manages user navigation preferences.

```typescript
const {
  preferences,
  updatePreferences,
  toggleSidebar,
  toggleBadges
} = useNavigationPreferences();
```

## Requirements Compliance

This navigation system meets all requirements from the frontend sidebar redesign specification:

### Requirement 4.1-4.6: Navigation Items
- ✅ Displays navigation items for Home (Dashboard), Water, Food, Workout, and Profile
- ✅ Provides correct routing to each section
- ✅ Includes proper icons and badges
- ✅ Supports keyboard shortcuts

### Active State Detection
- ✅ Automatically detects and highlights active navigation items
- ✅ Supports exact and partial path matching
- ✅ Handles nested routes correctly

### Responsive Design
- ✅ Mobile navigation toggle support
- ✅ Responsive layout utilities
- ✅ Touch-friendly interactions

### Accessibility
- ✅ Proper ARIA labels and descriptions
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility

## Testing

The navigation system includes comprehensive tests:

```bash
# Run navigation tests
npm test -- lib/navigation/__tests__/

# Run specific test suites
npm test -- lib/navigation/__tests__/navigation.test.ts
npm test -- lib/navigation/__tests__/navigation-integration.test.ts
```

## Examples

See `lib/navigation/examples/usage-example.tsx` for complete implementation examples.

## Migration from AppSidebar

To migrate from the existing `AppSidebar` component:

1. Replace hardcoded navigation items with `createNavigationConfig()`
2. Use `useNavigation()` hook for state management
3. Implement active state detection with `isNavigationItemActive()`
4. Add breadcrumb support with `generateBreadcrumbs()`

```typescript
// Before (AppSidebar)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  // ... hardcoded items
];

// After (Enhanced Navigation)
const navigationConfig = createNavigationConfig('/dashboard');
const { navigationItems, navigate, isActive } = useNavigation(navigationConfig);
```
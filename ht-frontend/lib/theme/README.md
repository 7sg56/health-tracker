# Enhanced Theme System

The HealthTracker application features a comprehensive theme system built on top of shadcn/ui and next-themes, providing advanced theming capabilities, accessibility features, and user customization options.

## Features

### 🎨 Theme Modes

- **Light Mode**: Clean, bright interface for daytime use
- **Dark Mode**: Easy on the eyes for low-light environments
- **System Mode**: Automatically follows system preference

### ♿ Accessibility

- **High Contrast**: Enhanced contrast ratios for better visibility
- **Reduced Motion**: Minimizes animations for users with motion sensitivity
- **WCAG Compliance**: Meets accessibility standards for color contrast

### 🎯 Health-Specific Colors

- **Primary**: Main brand color for primary actions
- **Success**: Green tones for positive health metrics
- **Warning**: Amber tones for cautionary health data
- **Danger**: Red tones for concerning health metrics

### 🛠️ Customization

- **Border Radius**: Adjustable corner roundness (0-20px)
- **Animation Duration**: Configurable transition speeds
- **Theme Persistence**: Saves user preferences locally
- **Import/Export**: Share theme configurations

## Usage

### Basic Setup

```tsx
import { EnhancedThemeProvider } from '@/lib/theme';

function App() {
  return (
    <EnhancedThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="health-tracker-theme"
      enableHighContrast={true}
      enableReducedMotion={true}
    >
      {/* Your app content */}
    </EnhancedThemeProvider>
  );
}
```

### Using the Theme Hook

```tsx
import { useEnhancedTheme } from '@/lib/theme';

function MyComponent() {
  const {
    theme,
    themeConfig,
    toggleHighContrast,
    toggleReducedMotion,
    isHighContrast,
    isReducedMotion,
  } = useEnhancedTheme();

  return (
    <div className={isHighContrast ? 'high-contrast' : ''}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleHighContrast}>Toggle High Contrast</button>
    </div>
  );
}
```

### Theme-Aware Styling Hook

```tsx
import { useThemeAwareStyles } from '@/hooks/use-theme-aware-styles';

function HealthCard({ healthScore }: { healthScore: number }) {
  const { getHealthStatusStyle } = useThemeAwareStyles();

  const style = getHealthStatusStyle(healthScore, { good: 80, warning: 60 });

  return <div style={style}>Health Score: {healthScore}</div>;
}
```

### Health Metrics Styling

```tsx
import { useHealthMetricsStyles } from '@/hooks/use-theme-aware-styles';

function WaterIntakeCard({ current, goal }: { current: number; goal: number }) {
  const { getWaterIntakeStyle } = useHealthMetricsStyles();

  const style = getWaterIntakeStyle(current, goal);

  return (
    <div style={style}>
      Water: {current}ml / {goal}ml
    </div>
  );
}
```

## Components

### ThemeToggle

Basic theme switcher with light/dark/system options plus accessibility controls.

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />;
```

### ThemeSettings

Advanced theme customization dialog with full configuration options.

```tsx
import { ThemeSettings } from '@/components/ui/theme-settings';

<ThemeSettings />;
```

## Theme Configuration

### Default Light Theme

```typescript
{
  mode: 'light',
  colors: {
    primary: 'oklch(0.577 0.245 27.325)',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    // ... more colors
  },
  healthColors: {
    primary: 'rgb(14, 165, 233)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    danger: 'rgb(239, 68, 68)',
  },
  borderRadius: 10,
  animations: {
    enabled: true,
    duration: '0.2s',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
  },
}
```

### Custom Theme Creation

```typescript
import { ThemeConfig, applyThemeToDocument } from '@/lib/theme';

const customTheme: ThemeConfig = {
  // ... your custom configuration
};

applyThemeToDocument(customTheme);
```

## CSS Variables

The theme system automatically applies CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.577 0.245 27.325);
  --health-primary: rgb(14, 165, 233);
  --health-success: rgb(34, 197, 94);
  --health-warning: rgb(245, 158, 11);
  --health-danger: rgb(239, 68, 68);
  --radius: 10px;
  --animation-duration: 0.2s;
}
```

## Accessibility Features

### High Contrast Mode

Automatically adjusts colors for better visibility:

- Increases border contrast
- Enhances focus indicators
- Improves text readability

### Reduced Motion

Respects user motion preferences:

- Disables animations when enabled
- Reduces transition durations
- Maintains functionality without motion

### System Preferences

Automatically detects and respects:

- `prefers-color-scheme`
- `prefers-reduced-motion`
- `prefers-contrast`

## Health Status Colors

The theme system includes specialized colors for health metrics:

```typescript
// Water intake: 90% of goal = success (green)
const waterStyle = getHealthStatusStyle(90, { good: 80, warning: 50 });

// Exercise: 45 minutes = success (green)
const exerciseStyle = getHealthStatusStyle(45, { good: 30, warning: 15 });

// Health score: 75 = warning (amber)
const healthStyle = getHealthStatusStyle(75, { good: 80, warning: 60 });
```

## Testing

The theme system includes comprehensive tests:

```bash
npm test -- --testPathPatterns=theme-system.test.tsx
```

Tests cover:

- Theme provider functionality
- Accessibility toggles
- Configuration validation
- Health status colors
- CSS variable application
- Theme persistence

## Migration from Basic Theme

If upgrading from the basic next-themes setup:

1. Replace `ThemeProvider` with `EnhancedThemeProvider`
2. Update imports to use `@/lib/theme`
3. Replace `useTheme` with `useEnhancedTheme` for advanced features
4. Update CSS to use new health color variables
5. Add accessibility considerations to components

## Performance Considerations

- Theme changes are debounced to prevent excessive re-renders
- CSS variables are applied directly to avoid style recalculation
- Preferences are cached in localStorage for fast loading
- Reduced motion mode minimizes animation overhead

## Browser Support

- Modern browsers with CSS custom properties support
- Graceful degradation for older browsers
- OKLCH color space with RGB fallbacks
- System preference detection where available

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  EnhancedThemeProvider, 
  useEnhancedTheme,
  validateThemeConfig,
  getHealthStatusColor,
  defaultLightTheme,
  defaultDarkTheme,
} from '@/lib/theme';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}));

// Test component that uses the enhanced theme
function TestComponent() {
  const {
    theme,
    themeConfig,
    toggleHighContrast,
    toggleReducedMotion,
    isHighContrast,
    isReducedMotion,
    resetTheme,
  } = useEnhancedTheme();

  return (
    <div>
      <div data-testid="theme-mode">{theme}</div>
      <div data-testid="high-contrast">{isHighContrast.toString()}</div>
      <div data-testid="reduced-motion">{isReducedMotion.toString()}</div>
      <div data-testid="border-radius">{themeConfig.borderRadius}</div>
      <button onClick={toggleHighContrast} data-testid="toggle-contrast">
        Toggle Contrast
      </button>
      <button onClick={toggleReducedMotion} data-testid="toggle-motion">
        Toggle Motion
      </button>
      <button onClick={resetTheme} data-testid="reset-theme">
        Reset Theme
      </button>
    </div>
  );
}

function renderWithThemeProvider(children: React.ReactNode) {
  return render(
    <EnhancedThemeProvider>
      {children}
    </EnhancedThemeProvider>
  );
}

describe('Enhanced Theme System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any applied CSS classes
    document.documentElement.className = '';
  });

  describe('EnhancedThemeProvider', () => {
    it('provides theme context to children', () => {
      renderWithThemeProvider(<TestComponent />);
      
      expect(screen.getByTestId('theme-mode')).toBeInTheDocument();
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    });

    it('toggles high contrast mode', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      const toggleButton = screen.getByTestId('toggle-contrast');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
      });
    });

    it('toggles reduced motion mode', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      const toggleButton = screen.getByTestId('toggle-motion');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
      });
    });

    it('resets theme to default', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      // First toggle some settings
      fireEvent.click(screen.getByTestId('toggle-contrast'));
      fireEvent.click(screen.getByTestId('toggle-motion'));
      
      await waitFor(() => {
        expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
      });
      
      // Then reset
      fireEvent.click(screen.getByTestId('reset-theme'));
      
      await waitFor(() => {
        expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
      });
    });

    it('persists theme preferences in localStorage', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-contrast'));
      
      await waitFor(() => {
        expect(localStorage.getItem('health-tracker-theme-high-contrast')).toBe('true');
      });
    });
  });

  describe('Theme Configuration Validation', () => {
    it('validates valid theme configuration', () => {
      const errors = validateThemeConfig(defaultLightTheme);
      expect(errors).toHaveLength(0);
    });

    it('detects missing required colors', () => {
      const invalidConfig = {
        colors: {
          primary: 'oklch(0.5 0.2 180)',
          secondary: 'oklch(0.5 0.2 180)',
          accent: 'oklch(0.5 0.2 180)',
          muted: 'oklch(0.5 0.2 180)',
          border: 'oklch(0.5 0.2 180)',
          ring: 'oklch(0.5 0.2 180)',
          destructive: 'oklch(0.5 0.2 180)',
          // missing background and foreground
        },
      };
      
      const errors = validateThemeConfig(invalidConfig);
      expect(errors).toContain('Missing required color: background');
      expect(errors).toContain('Missing required color: foreground');
    });

    it('validates border radius range', () => {
      const invalidConfig = {
        borderRadius: 100, // too large
      };
      
      const errors = validateThemeConfig(invalidConfig);
      expect(errors).toContain('Border radius must be between 0 and 50 pixels');
    });
  });

  describe('Health Status Colors', () => {
    it('returns correct color for excellent health status', () => {
      const color = getHealthStatusColor(
        90,
        { good: 80, warning: 50 },
        defaultLightTheme.healthColors
      );
      expect(color).toBe(defaultLightTheme.healthColors.success);
    });

    it('returns correct color for warning health status', () => {
      const color = getHealthStatusColor(
        60,
        { good: 80, warning: 50 },
        defaultLightTheme.healthColors
      );
      expect(color).toBe(defaultLightTheme.healthColors.warning);
    });

    it('returns correct color for poor health status', () => {
      const color = getHealthStatusColor(
        30,
        { good: 80, warning: 50 },
        defaultLightTheme.healthColors
      );
      expect(color).toBe(defaultLightTheme.healthColors.danger);
    });
  });

  describe('CSS Variable Application', () => {
    it('applies CSS variables to document root', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      await waitFor(() => {
        const root = document.documentElement;
        expect(root.style.getPropertyValue('--background')).toBeTruthy();
        expect(root.style.getPropertyValue('--foreground')).toBeTruthy();
        expect(root.style.getPropertyValue('--primary')).toBeTruthy();
      });
    });

    it('applies accessibility classes when enabled', async () => {
      renderWithThemeProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('toggle-contrast'));
      fireEvent.click(screen.getByTestId('toggle-motion'));
      
      await waitFor(() => {
        const root = document.documentElement;
        expect(root.classList.contains('high-contrast')).toBe(true);
        expect(root.classList.contains('reduce-motion')).toBe(true);
      });
    });
  });

  describe('Theme Presets', () => {
    it('has consistent structure between light and dark themes', () => {
      const lightKeys = Object.keys(defaultLightTheme.colors);
      const darkKeys = Object.keys(defaultDarkTheme.colors);
      
      expect(lightKeys.sort()).toEqual(darkKeys.sort());
    });

    it('has all required health colors', () => {
      const requiredHealthColors = ['primary', 'success', 'warning', 'danger'];
      
      requiredHealthColors.forEach(color => {
        expect(defaultLightTheme.healthColors).toHaveProperty(color);
        expect(defaultDarkTheme.healthColors).toHaveProperty(color);
      });
    });
  });
});
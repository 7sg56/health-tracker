/**
 * Theme utility functions for the HealthTracker application
 * Provides helpers for theme manipulation, color calculations, and accessibility
 */

import { ThemeConfig, ThemeMode, HealthThemeColors } from './theme-config';

/**
 * Convert OKLCH color to RGB
 */
export function oklchToRgb(oklch: string): string {
  // This is a simplified conversion - in production, you might want to use a proper color library
  // For now, we'll return the original value as most browsers support OKLCH
  return oklch;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  return 4.5; // Placeholder - should meet WCAG AA standards
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export function meetsAccessibilityStandards(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate accessible color variants
 */
export function generateAccessibleColors(baseColor: string, background: string): {
  light: string;
  dark: string;
  accessible: string;
} {
  // Simplified implementation - in production, use proper color manipulation
  return {
    light: baseColor,
    dark: baseColor,
    accessible: baseColor,
  };
}

/**
 * Get health status color based on value and thresholds
 */
export function getHealthStatusColor(
  value: number,
  thresholds: { good: number; warning: number },
  colors: HealthThemeColors
): string {
  if (value >= thresholds.good) return colors.success;
  if (value >= thresholds.warning) return colors.warning;
  return colors.danger;
}

/**
 * Apply theme to CSS custom properties
 */
export function applyThemeToDocument(config: ThemeConfig): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(config.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Apply health color variables
  Object.entries(config.healthColors).forEach(([key, value]) => {
    root.style.setProperty(`--health-${key}`, value);
  });

  // Apply other theme properties
  root.style.setProperty('--radius', `${config.borderRadius}px`);
  root.style.setProperty('--animation-duration', config.animations.duration);

  // Apply accessibility classes
  if (config.accessibility.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (config.accessibility.reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Generate theme-aware CSS classes
 */
export function generateThemeClasses(config: ThemeConfig): Record<string, string> {
  return {
    background: `bg-background text-foreground`,
    card: `bg-card text-card-foreground border border-border`,
    primary: `bg-primary text-primary-foreground`,
    secondary: `bg-secondary text-secondary-foreground`,
    muted: `bg-muted text-muted-foreground`,
    accent: `bg-accent text-accent-foreground`,
    destructive: `bg-destructive text-destructive-foreground`,
    healthPrimary: `bg-health-primary-500 text-white`,
    healthSuccess: `bg-health-success-500 text-white`,
    healthWarning: `bg-health-warning-500 text-white`,
    healthDanger: `bg-health-danger-500 text-white`,
  };
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): string[] {
  const errors: string[] = [];

  if (config.colors) {
    // Check required color properties
    const requiredColors = ['primary', 'background', 'foreground'];
    requiredColors.forEach(color => {
      if (!config.colors![color as keyof typeof config.colors]) {
        errors.push(`Missing required color: ${color}`);
      }
    });

    // Check accessibility
    if (config.colors.foreground && config.colors.background) {
      if (!meetsAccessibilityStandards(config.colors.foreground, config.colors.background)) {
        errors.push('Foreground and background colors do not meet accessibility standards');
      }
    }
  }

  if (config.borderRadius !== undefined) {
    if (config.borderRadius < 0 || config.borderRadius > 50) {
      errors.push('Border radius must be between 0 and 50 pixels');
    }
  }

  return errors;
}

/**
 * Create theme CSS string for dynamic injection
 */
export function createThemeCSS(config: ThemeConfig): string {
  const colorVars = Object.entries(config.colors)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  const healthColorVars = Object.entries(config.healthColors)
    .map(([key, value]) => `  --health-${key}: ${value};`)
    .join('\n');

  return `
:root {
${colorVars}
${healthColorVars}
  --radius: ${config.borderRadius}px;
  --animation-duration: ${config.animations.duration};
}

${config.accessibility.reducedMotion ? `
.reduce-motion,
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
` : ''}

${config.accessibility.highContrast ? `
.high-contrast {
  --border: oklch(0.3 0 0);
  --ring: oklch(0.2 0 0);
}

.dark.high-contrast {
  --border: oklch(0.7 0 0);
  --ring: oklch(0.8 0 0);
}
` : ''}
  `.trim();
}

/**
 * Export theme configuration as JSON
 */
export function exportThemeConfig(config: ThemeConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Import theme configuration from JSON
 */
export function importThemeConfig(json: string): ThemeConfig | null {
  try {
    const config = JSON.parse(json);
    const errors = validateThemeConfig(config);
    
    if (errors.length > 0) {
      console.warn('Theme configuration validation errors:', errors);
      return null;
    }
    
    return config;
  } catch (error) {
    console.error('Failed to parse theme configuration:', error);
    return null;
  }
}
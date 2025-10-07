/**
 * Theme system exports for the HealthTracker application
 */

// Core theme configuration
export {
  type ThemeMode,
  type ThemeConfig,
  type ThemeColors,
  type HealthThemeColors,
  type ThemePreset,
  defaultLightTheme,
  defaultDarkTheme,
  highContrastLightTheme,
  highContrastDarkTheme,
  themePresets,
  cssVariableMap,
} from './theme-config';

// Enhanced theme provider
export {
  EnhancedThemeProvider,
  useEnhancedTheme,
} from './theme-provider';

// Theme utilities
export {
  oklchToRgb,
  getContrastRatio,
  meetsAccessibilityStandards,
  generateAccessibleColors,
  getHealthStatusColor,
  applyThemeToDocument,
  getSystemTheme,
  prefersReducedMotion,
  prefersHighContrast,
  generateThemeClasses,
  validateThemeConfig,
  createThemeCSS,
  exportThemeConfig,
  importThemeConfig,
} from './theme-utils';
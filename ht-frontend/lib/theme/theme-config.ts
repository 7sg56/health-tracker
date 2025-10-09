/**
 * Comprehensive theme configuration for the HealthTracker application
 * Integrates shadcn/ui theming with custom health tracker branding
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  ring: string;
  destructive: string;
}

export interface HealthThemeColors {
  primary: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  healthColors: HealthThemeColors;
  borderRadius: number;
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  animations: {
    enabled: boolean;
    duration: string;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

// Default theme configurations
export const defaultLightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: 'oklch(0.577 0.245 27.325)',
    secondary: 'oklch(0.97 0 0)',
    accent: 'oklch(0.97 0 0)',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    muted: 'oklch(0.97 0 0)',
    border: 'oklch(0.922 0 0)',
    ring: 'oklch(0.577 0.245 27.325)',
    destructive: 'oklch(0.577 0.245 27.325)',
  },
  healthColors: {
    primary: 'rgb(14, 165, 233)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    danger: 'rgb(239, 68, 68)',
  },
  borderRadius: 10,
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },
  animations: {
    enabled: true,
    duration: '0.2s',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
  },
};

export const defaultDarkTheme: ThemeConfig = {
  ...defaultLightTheme,
  mode: 'dark',
  colors: {
    primary: 'oklch(0.696 0.17 162.48)',
    secondary: 'oklch(0.269 0 0)',
    accent: 'oklch(0.269 0 0)',
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    border: 'oklch(1 0 0 / 10%)',
    ring: 'oklch(0.696 0.17 162.48)',
    destructive: 'oklch(0.704 0.191 22.216)',
  },
  healthColors: {
    primary: 'rgb(56, 189, 248)',
    success: 'rgb(74, 222, 128)',
    warning: 'rgb(251, 191, 36)',
    danger: 'rgb(248, 113, 113)',
  },
};

// High contrast theme variants
export const highContrastLightTheme: ThemeConfig = {
  ...defaultLightTheme,
  colors: {
    ...defaultLightTheme.colors,
    primary: 'oklch(0.2 0 0)',
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0 0 0)',
    border: 'oklch(0.3 0 0)',
  },
  accessibility: {
    ...defaultLightTheme.accessibility,
    highContrast: true,
  },
};

export const highContrastDarkTheme: ThemeConfig = {
  ...defaultDarkTheme,
  colors: {
    ...defaultDarkTheme.colors,
    primary: 'oklch(0.9 0 0)',
    background: 'oklch(0 0 0)',
    foreground: 'oklch(1 0 0)',
    border: 'oklch(0.7 0 0)',
  },
  accessibility: {
    ...defaultDarkTheme.accessibility,
    highContrast: true,
  },
};

// Theme presets
export const themePresets = {
  light: defaultLightTheme,
  dark: defaultDarkTheme,
  'light-high-contrast': highContrastLightTheme,
  'dark-high-contrast': highContrastDarkTheme,
} as const;

export type ThemePreset = keyof typeof themePresets;

// CSS custom properties mapping
export const cssVariableMap = {
  '--background': 'colors.background',
  '--foreground': 'colors.foreground',
  '--primary': 'colors.primary',
  '--primary-foreground': 'colors.foreground',
  '--secondary': 'colors.secondary',
  '--secondary-foreground': 'colors.foreground',
  '--accent': 'colors.accent',
  '--accent-foreground': 'colors.foreground',
  '--muted': 'colors.muted',
  '--muted-foreground': 'colors.foreground',
  '--border': 'colors.border',
  '--input': 'colors.border',
  '--ring': 'colors.ring',
  '--destructive': 'colors.destructive',
  '--destructive-foreground': 'colors.foreground',
  '--radius': 'borderRadius',
  '--health-primary': 'healthColors.primary',
  '--health-success': 'healthColors.success',
  '--health-warning': 'healthColors.warning',
  '--health-danger': 'healthColors.danger',
} as const;

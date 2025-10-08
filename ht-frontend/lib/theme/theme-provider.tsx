"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import { 
  ThemeConfig, 
  ThemeMode, 
  ThemePreset, 
  themePresets, 
  defaultLightTheme,
  defaultDarkTheme,
  cssVariableMap 
} from './theme-config';

interface ThemeContextType {
  theme: ThemeMode;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeMode) => void;
  setThemePreset: (preset: ThemePreset) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  applyTheme: (config: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface EnhancedThemeProviderProps extends Omit<ThemeProviderProps, 'children'> {
  children: React.ReactNode;
  storageKey?: string;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
}

export function EnhancedThemeProvider({
  children,
  storageKey = 'health-tracker-theme',
  enableHighContrast = true,
  enableReducedMotion = true,
  ...props
}: EnhancedThemeProviderProps) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultLightTheme);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Load high contrast preference
      const savedHighContrast = localStorage.getItem(`${storageKey}-high-contrast`);
      if (savedHighContrast) {
        setIsHighContrast(JSON.parse(savedHighContrast));
      }

      // Load reduced motion preference
      const savedReducedMotion = localStorage.getItem(`${storageKey}-reduced-motion`);
      if (savedReducedMotion) {
        setIsReducedMotion(JSON.parse(savedReducedMotion));
      } else {
        // Check system preference for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setIsReducedMotion(prefersReducedMotion);
      }

      // Load custom theme config
      const savedConfig = localStorage.getItem(`${storageKey}-config`);
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setThemeConfig(config);
        } catch (error) {
          console.warn('Failed to parse saved theme config:', error);
        }
      }
    }
  }, [storageKey]);

  // Apply CSS variables when theme config changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Apply theme variables
    Object.entries(cssVariableMap).forEach(([cssVar, configPath]) => {
      const value = getNestedValue(themeConfig, configPath);
      if (value !== undefined) {
        if (cssVar === '--radius') {
          root.style.setProperty(cssVar, `${value}px`);
        } else {
          root.style.setProperty(cssVar, String(value));
        }
      }
    });

    // Apply accessibility preferences
    if (isReducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.classList.add('reduce-motion');
    } else {
      root.style.setProperty('--animation-duration', themeConfig.animations.duration);
      root.classList.remove('reduce-motion');
    }

    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Save config to localStorage
    localStorage.setItem(`${storageKey}-config`, JSON.stringify(themeConfig));
    localStorage.setItem(`${storageKey}-high-contrast`, JSON.stringify(isHighContrast));
    localStorage.setItem(`${storageKey}-reduced-motion`, JSON.stringify(isReducedMotion));
  }, [themeConfig, isHighContrast, isReducedMotion, mounted, storageKey]);

  const setTheme = (theme: ThemeMode) => {
    const baseConfig = theme === 'dark' ? defaultDarkTheme : defaultLightTheme;
    const newConfig = {
      ...baseConfig,
      mode: theme,
      accessibility: {
        ...baseConfig.accessibility,
        highContrast: isHighContrast,
        reducedMotion: isReducedMotion,
      },
    };
    setThemeConfig(newConfig);
  };

  const setThemePreset = (preset: ThemePreset) => {
    const presetConfig = themePresets[preset];
    setThemeConfig({
      ...presetConfig,
      accessibility: {
        ...presetConfig.accessibility,
        highContrast: isHighContrast,
        reducedMotion: isReducedMotion,
      },
    });
  };

  const toggleHighContrast = () => {
    if (!enableHighContrast) return;
    
    const newHighContrast = !isHighContrast;
    setIsHighContrast(newHighContrast);
    
    // Update theme config with high contrast variant
    const baseMode = themeConfig.mode === 'dark' ? 'dark' : 'light';
    const presetKey = newHighContrast 
      ? `${baseMode}-high-contrast` as ThemePreset
      : baseMode as ThemePreset;
    
    setThemePreset(presetKey);
  };

  const toggleReducedMotion = () => {
    if (!enableReducedMotion) return;
    setIsReducedMotion(!isReducedMotion);
  };

  const applyTheme = (config: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({
      ...prev,
      ...config,
      colors: { ...prev.colors, ...config.colors },
      healthColors: { ...prev.healthColors, ...config.healthColors },
      accessibility: { ...prev.accessibility, ...config.accessibility },
    }));
  };

  const resetTheme = () => {
    const baseConfig = themeConfig.mode === 'dark' ? defaultDarkTheme : defaultLightTheme;
    setThemeConfig(baseConfig);
    setIsHighContrast(false);
    setIsReducedMotion(false);
  };

  const contextValue: ThemeContextType = {
    theme: themeConfig.mode,
    themeConfig,
    setTheme,
    setThemePreset,
    toggleHighContrast,
    toggleReducedMotion,
    isHighContrast,
    isReducedMotion,
    applyTheme,
    resetTheme,
  };

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider
      {...props}
      storageKey={storageKey}
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}

// Utility function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
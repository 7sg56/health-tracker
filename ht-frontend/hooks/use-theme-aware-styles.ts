"use client"

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useEnhancedTheme, generateThemeClasses, getHealthStatusColor } from '@/lib/theme';

/**
 * Hook for generating theme-aware CSS classes and styles
 */
export function useThemeAwareStyles() {
  const { theme, resolvedTheme } = useTheme();
  const { themeConfig, isHighContrast, isReducedMotion } = useEnhancedTheme();

  const themeClasses = useMemo(() => {
    return generateThemeClasses(themeConfig);
  }, [themeConfig]);

  const getHealthStatusStyle = useMemo(() => {
    return (value: number, thresholds: { good: number; warning: number }) => {
      const color = getHealthStatusColor(value, thresholds, themeConfig.healthColors);
      return {
        backgroundColor: color,
        color: 'white',
      };
    };
  }, [themeConfig.healthColors]);

  const getAnimationClass = useMemo(() => {
    return (baseClass: string) => {
      if (isReducedMotion) {
        return `${baseClass} reduce-motion`;
      }
      return baseClass;
    };
  }, [isReducedMotion]);

  const getContrastClass = useMemo(() => {
    return (baseClass: string) => {
      if (isHighContrast) {
        return `${baseClass} high-contrast`;
      }
      return baseClass;
    };
  }, [isHighContrast]);

  const isDarkMode = useMemo(() => {
    return resolvedTheme === 'dark';
  }, [resolvedTheme]);

  const cardStyles = useMemo(() => {
    return {
      base: themeClasses.card,
      elevated: `${themeClasses.card} shadow-lg`,
      interactive: `${themeClasses.card} hover:shadow-md transition-shadow ${getAnimationClass('')}`,
    };
  }, [themeClasses.card, getAnimationClass]);

  const buttonStyles = useMemo(() => {
    return {
      primary: themeClasses.primary,
      secondary: themeClasses.secondary,
      destructive: themeClasses.destructive,
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    };
  }, [themeClasses]);

  const healthStatusStyles = useMemo(() => {
    return {
      excellent: themeClasses.healthSuccess,
      good: themeClasses.healthPrimary,
      fair: themeClasses.healthWarning,
      poor: themeClasses.healthDanger,
    };
  }, [themeClasses]);

  return {
    theme,
    resolvedTheme,
    isDarkMode,
    isHighContrast,
    isReducedMotion,
    themeConfig,
    themeClasses,
    cardStyles,
    buttonStyles,
    healthStatusStyles,
    getHealthStatusStyle,
    getAnimationClass,
    getContrastClass,
  };
}

/**
 * Hook for theme-aware health metrics styling
 */
export function useHealthMetricsStyles() {
  const { getHealthStatusStyle, healthStatusStyles } = useThemeAwareStyles();

  const getWaterIntakeStyle = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    return getHealthStatusStyle(percentage, { good: 80, warning: 50 });
  };

  const getCalorieStyle = (current: number, goal: number) => {
    const percentage = Math.abs(current - goal) / goal * 100;
    // Lower percentage difference is better
    return getHealthStatusStyle(100 - percentage, { good: 90, warning: 70 });
  };

  const getExerciseStyle = (minutes: number) => {
    return getHealthStatusStyle(minutes, { good: 30, warning: 15 });
  };

  const getHealthScoreStyle = (score: number) => {
    return getHealthStatusStyle(score, { good: 80, warning: 60 });
  };

  return {
    healthStatusStyles,
    getWaterIntakeStyle,
    getCalorieStyle,
    getExerciseStyle,
    getHealthScoreStyle,
  };
}

/**
 * Hook for responsive theme-aware spacing and sizing
 */
export function useResponsiveThemeStyles() {
  const { themeConfig, isReducedMotion } = useThemeAwareStyles();

  const spacing = useMemo(() => {
    const base = 4; // 1rem = 16px, so 4px base unit
    return {
      xs: `${base}px`,
      sm: `${base * 2}px`,
      md: `${base * 4}px`,
      lg: `${base * 6}px`,
      xl: `${base * 8}px`,
    };
  }, []);

  const borderRadius = useMemo(() => {
    const base = themeConfig.borderRadius;
    return {
      sm: `${Math.max(0, base - 4)}px`,
      md: `${Math.max(0, base - 2)}px`,
      lg: `${base}px`,
      xl: `${base + 4}px`,
    };
  }, [themeConfig.borderRadius]);

  const transitions = useMemo(() => {
    const duration = isReducedMotion ? '0.01ms' : themeConfig.animations.duration;
    return {
      fast: `${duration}`,
      normal: `${duration}`,
      slow: isReducedMotion ? '0.01ms' : '0.3s',
    };
  }, [isReducedMotion, themeConfig.animations.duration]);

  return {
    spacing,
    borderRadius,
    transitions,
  };
}
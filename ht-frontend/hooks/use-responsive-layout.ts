"use client";

import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

interface ResponsiveLayoutState {
  breakpoints: ResponsiveBreakpoints;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

const breakpointValues = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useResponsiveLayout(): ResponsiveLayoutState {
  const [state, setState] = useState<ResponsiveLayoutState>(() => {
    // Initialize with default values for SSR
    const defaultState: ResponsiveLayoutState = {
      breakpoints: {
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        '2xl': false,
      },
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      screenWidth: 0,
      screenHeight: 0,
    };

    // Only access window on client side
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      return {
        breakpoints: {
          xs: width >= breakpointValues.xs,
          sm: width >= breakpointValues.sm,
          md: width >= breakpointValues.md,
          lg: width >= breakpointValues.lg,
          xl: width >= breakpointValues.xl,
          '2xl': width >= breakpointValues['2xl'],
        },
        isMobile: width < breakpointValues.md,
        isTablet: width >= breakpointValues.md && width < breakpointValues.lg,
        isDesktop: width >= breakpointValues.lg,
        screenWidth: width,
        screenHeight: height,
      };
    }

    return defaultState;
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        breakpoints: {
          xs: width >= breakpointValues.xs,
          sm: width >= breakpointValues.sm,
          md: width >= breakpointValues.md,
          lg: width >= breakpointValues.lg,
          xl: width >= breakpointValues.xl,
          '2xl': width >= breakpointValues['2xl'],
        },
        isMobile: width < breakpointValues.md,
        isTablet: width >= breakpointValues.md && width < breakpointValues.lg,
        isDesktop: width >= breakpointValues.lg,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Update state on mount
    updateState();

    // Add event listener for resize
    const handleResize = () => {
      // Debounce resize events for better performance
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(updateState, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  return state;
}

// Utility function to get current breakpoint name
export function getCurrentBreakpoint(width: number): keyof typeof breakpointValues | 'base' {
  if (width >= breakpointValues['2xl']) return '2xl';
  if (width >= breakpointValues.xl) return 'xl';
  if (width >= breakpointValues.lg) return 'lg';
  if (width >= breakpointValues.md) return 'md';
  if (width >= breakpointValues.sm) return 'sm';
  if (width >= breakpointValues.xs) return 'xs';
  return 'base';
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    resizeTimeout: NodeJS.Timeout;
  }
}
/**
 * Responsive utility functions and hooks for mobile-first design
 */

import { useEffect, useState } from 'react';

// Breakpoint definitions matching Tailwind CSS
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current screen size and breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);

      if (currentWidth >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (currentWidth >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (currentWidth >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (currentWidth >= breakpoints.md) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return { breakpoint, width };
}

/**
 * Hook to detect if current screen is mobile size
 */
export function useIsMobile() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'sm';
}

/**
 * Hook to detect if current screen is tablet size
 */
export function useIsTablet() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'md';
}

/**
 * Hook to detect if current screen is desktop size
 */
export function useIsDesktop() {
  const { breakpoint } = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}

/**
 * Utility function to get responsive grid columns based on screen size
 */
export function getResponsiveGridCols(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3
): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}

/**
 * Utility function to get responsive spacing classes
 */
export function getResponsiveSpacing(
  mobile: string = 'p-4',
  tablet: string = 'md:p-6',
  desktop: string = 'lg:p-8'
): string {
  return `${mobile} ${tablet} ${desktop}`;
}

/**
 * Utility function to get responsive text sizes
 */
export function getResponsiveTextSize(
  mobile: string = 'text-sm',
  tablet: string = 'md:text-base',
  desktop: string = 'lg:text-lg'
): string {
  return `${mobile} ${tablet} ${desktop}`;
}

/**
 * Touch-friendly button size utility
 */
export function getTouchFriendlySize(
  isMobile: boolean
): 'sm' | 'default' | 'lg' {
  return isMobile ? 'lg' : 'default';
}

/**
 * Get responsive container classes
 */
export function getResponsiveContainer(): string {
  return 'container mx-auto px-4 sm:px-6 lg:px-8';
}

/**
 * Get responsive card padding
 */
export function getResponsiveCardPadding(): string {
  return 'p-4 sm:p-6 lg:p-8';
}

/**
 * Get responsive form layout classes
 */
export function getResponsiveFormLayout(): string {
  return 'space-y-4 sm:space-y-6';
}

/**
 * Get responsive button group layout
 */
export function getResponsiveButtonGroup(): string {
  return 'flex flex-col sm:flex-row gap-2 sm:gap-3';
}

/**
 * Get responsive navigation classes
 */
export function getResponsiveNavigation(): string {
  return 'flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4';
}

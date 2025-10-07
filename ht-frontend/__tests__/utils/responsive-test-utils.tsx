/**
 * Responsive Testing Utilities
 * Helper functions and utilities for testing responsive design behavior
 */

import { act } from '@testing-library/react';

// Standard breakpoints matching Tailwind CSS defaults
export const RESPONSIVE_BREAKPOINTS = {
  xs: 320,      // Extra small devices
  sm: 640,      // Small devices (landscape phones)
  md: 768,      // Medium devices (tablets)
  lg: 1024,     // Large devices (laptops)
  xl: 1280,     // Extra large devices (desktops)
  '2xl': 1536,  // 2X large devices (large desktops)
} as const;

// Common device viewport sizes for testing
export const DEVICE_VIEWPORTS = {
  iphone5: { width: 320, height: 568 },
  iphoneSE: { width: 375, height: 667 },
  iphone12: { width: 390, height: 844 },
  iphone12Pro: { width: 393, height: 852 },
  ipadMini: { width: 768, height: 1024 },
  ipad: { width: 820, height: 1180 },
  ipadPro: { width: 1024, height: 1366 },
  laptopSmall: { width: 1366, height: 768 },
  laptop: { width: 1440, height: 900 },
  desktop: { width: 1920, height: 1080 },
  desktopLarge: { width: 2560, height: 1440 },
} as const;

// Touch event simulation helpers
export interface TouchPoint {
  clientX: number;
  clientY: number;
  target?: EventTarget;
}

export const createTouchEvent = (
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: TouchPoint[] = [],
  changedTouches: TouchPoint[] = []
): TouchEvent => {
  const touchList = touches.map(touch => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
    target: touch.target || document.body,
    identifier: Math.random(),
    pageX: touch.clientX,
    pageY: touch.clientY,
    screenX: touch.clientX,
    screenY: touch.clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  })) as Touch[];

  const changedTouchList = changedTouches.map(touch => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
    target: touch.target || document.body,
    identifier: Math.random(),
    pageX: touch.clientX,
    pageY: touch.clientY,
    screenX: touch.clientX,
    screenY: touch.clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  })) as Touch[];

  return new TouchEvent(type, {
    touches: touchList,
    changedTouches: changedTouchList,
    bubbles: true,
    cancelable: true,
  });
};

// Viewport manipulation utilities
export class ViewportController {
  private originalInnerWidth: number;
  private originalInnerHeight: number;
  private originalMatchMedia: typeof window.matchMedia;

  constructor() {
    this.originalInnerWidth = window.innerWidth;
    this.originalInnerHeight = window.innerHeight;
    this.originalMatchMedia = window.matchMedia;
  }

  /**
   * Set viewport size and trigger resize event
   */
  setViewport(width: number, height: number = 800): void {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Mock matchMedia for the new viewport
    this.mockMatchMedia(width);

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  /**
   * Set viewport to a predefined device size
   */
  setDevice(device: keyof typeof DEVICE_VIEWPORTS): void {
    const { width, height } = DEVICE_VIEWPORTS[device];
    this.setViewport(width, height);
  }

  /**
   * Set viewport to a breakpoint
   */
  setBreakpoint(breakpoint: keyof typeof RESPONSIVE_BREAKPOINTS): void {
    this.setViewport(RESPONSIVE_BREAKPOINTS[breakpoint]);
  }

  /**
   * Mock matchMedia for responsive queries
   */
  private mockMatchMedia(width: number): void {
    window.matchMedia = jest.fn().mockImplementation((query: string) => {
      // Parse common media queries
      const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);
      const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);

      let matches = false;

      if (minWidthMatch) {
        const minWidth = parseInt(minWidthMatch[1]);
        matches = width >= minWidth;
      } else if (maxWidthMatch) {
        const maxWidth = parseInt(maxWidthMatch[1]);
        matches = width <= maxWidth;
      }

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });
  }

  /**
   * Restore original viewport and matchMedia
   */
  restore(): void {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: this.originalInnerWidth,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: this.originalInnerHeight,
    });

    window.matchMedia = this.originalMatchMedia;
  }
}

// Touch gesture simulation
export class TouchGestureSimulator {
  /**
   * Simulate a tap gesture
   */
  static tap(element: HTMLElement, x: number = 0, y: number = 0): void {
    const touchPoint = { clientX: x, clientY: y, target: element };
    
    element.dispatchEvent(createTouchEvent('touchstart', [touchPoint], [touchPoint]));
    
    // Small delay to simulate real touch
    setTimeout(() => {
      element.dispatchEvent(createTouchEvent('touchend', [], [touchPoint]));
    }, 10);
  }

  /**
   * Simulate a swipe gesture
   */
  static swipe(
    element: HTMLElement,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 300
  ): void {
    const startPoint = { clientX: startX, clientY: startY, target: element };
    const endPoint = { clientX: endX, clientY: endY, target: element };

    // Start touch
    element.dispatchEvent(createTouchEvent('touchstart', [startPoint], [startPoint]));

    // Simulate movement
    const steps = 10;
    const stepX = (endX - startX) / steps;
    const stepY = (endY - startY) / steps;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const currentPoint = {
          clientX: startX + (stepX * i),
          clientY: startY + (stepY * i),
          target: element,
        };
        element.dispatchEvent(createTouchEvent('touchmove', [currentPoint], [currentPoint]));
      }, stepDuration * i);
    }

    // End touch
    setTimeout(() => {
      element.dispatchEvent(createTouchEvent('touchend', [], [endPoint]));
    }, duration);
  }

  /**
   * Simulate a pinch gesture (for zoom)
   */
  static pinch(
    element: HTMLElement,
    centerX: number,
    centerY: number,
    startDistance: number,
    endDistance: number,
    duration: number = 300
  ): void {
    const angle = Math.PI / 4; // 45 degrees
    
    const getPoints = (distance: number) => [
      {
        clientX: centerX - (distance * Math.cos(angle)) / 2,
        clientY: centerY - (distance * Math.sin(angle)) / 2,
        target: element,
      },
      {
        clientX: centerX + (distance * Math.cos(angle)) / 2,
        clientY: centerY + (distance * Math.sin(angle)) / 2,
        target: element,
      },
    ];

    const startPoints = getPoints(startDistance);
    const endPoints = getPoints(endDistance);

    // Start pinch
    element.dispatchEvent(createTouchEvent('touchstart', startPoints, startPoints));

    // Simulate pinch movement
    const steps = 10;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const progress = i / steps;
        const currentDistance = startDistance + (endDistance - startDistance) * progress;
        const currentPoints = getPoints(currentDistance);
        element.dispatchEvent(createTouchEvent('touchmove', currentPoints, currentPoints));
      }, stepDuration * i);
    }

    // End pinch
    setTimeout(() => {
      element.dispatchEvent(createTouchEvent('touchend', [], endPoints));
    }, duration);
  }
}

// Accessibility testing helpers for responsive design
export class ResponsiveAccessibilityTester {
  /**
   * Check if touch targets meet minimum size requirements
   */
  static checkTouchTargetSize(element: HTMLElement, minSize: number = 44): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= minSize && rect.height >= minSize;
  }

  /**
   * Check if text meets minimum contrast requirements
   */
  static checkTextContrast(element: HTMLElement): { ratio: number; passes: boolean } {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // This is a simplified contrast check
    // In a real implementation, you'd use a proper contrast calculation library
    const hasGoodContrast = color !== backgroundColor;
    
    return {
      ratio: hasGoodContrast ? 4.5 : 2.0, // Mock values
      passes: hasGoodContrast,
    };
  }

  /**
   * Check if element is properly focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const tabIndex = element.tabIndex;
    const tagName = element.tagName.toLowerCase();
    const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
    
    return tabIndex >= 0 || focusableTags.includes(tagName);
  }

  /**
   * Check if element has proper ARIA labels
   */
  static hasProperLabeling(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('aria-describedby') ||
      element.textContent?.trim()
    );
  }
}

// Performance testing utilities
export class ResponsivePerformanceTester {
  private static performanceEntries: PerformanceEntry[] = [];

  /**
   * Start performance monitoring
   */
  static startMonitoring(): void {
    this.performanceEntries = [];
    
    // Mock performance observer
    const observer = new PerformanceObserver((list) => {
      this.performanceEntries.push(...list.getEntries());
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  }

  /**
   * Measure layout thrashing during viewport changes
   */
  static measureLayoutThrashing(callback: () => void): number {
    const startTime = performance.now();
    let layoutCount = 0;

    // Mock layout measurement
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      layoutCount++;
      return originalGetBoundingClientRect.call(this);
    };

    callback();

    // Restore original method
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;

    const endTime = performance.now();
    const duration = endTime - startTime;

    return layoutCount / duration; // Layouts per millisecond
  }

  /**
   * Check for memory leaks during responsive changes
   */
  static checkMemoryUsage(): { used: number; total: number } {
    // Mock memory usage (in a real browser, you'd use performance.memory)
    return {
      used: Math.random() * 100,
      total: 100,
    };
  }
}

// Test data generators for responsive testing
export const generateResponsiveTestData = {
  /**
   * Generate test content with various lengths
   */
  textContent: {
    short: 'Short text',
    medium: 'This is a medium length text that should wrap nicely on mobile devices.',
    long: 'This is a very long text content that will definitely wrap across multiple lines on smaller screens and should maintain good readability and proper line spacing throughout different viewport sizes and breakpoints.',
  },

  /**
   * Generate test data for different screen densities
   */
  images: {
    lowRes: { src: '/test-image-1x.jpg', width: 100, height: 100 },
    highRes: { src: '/test-image-2x.jpg', width: 200, height: 200 },
    responsive: { 
      srcSet: '/test-image-1x.jpg 1x, /test-image-2x.jpg 2x',
      sizes: '(max-width: 768px) 100vw, 50vw',
    },
  },

  /**
   * Generate navigation items for testing
   */
  navigation: [
    { id: 'home', label: 'Home', href: '/dashboard', icon: 'Home' },
    { id: 'water', label: 'Water Intake', href: '/dashboard/water', icon: 'Droplets' },
    { id: 'food', label: 'Food Intake', href: '/dashboard/food', icon: 'Apple' },
    { id: 'workout', label: 'Workouts', href: '/dashboard/workout', icon: 'Dumbbell' },
    { id: 'profile', label: 'Profile', href: '/dashboard/profile', icon: 'User' },
  ],
};

// Export all utilities
export {
  ViewportController,
  TouchGestureSimulator,
  ResponsiveAccessibilityTester,
  ResponsivePerformanceTester,
};
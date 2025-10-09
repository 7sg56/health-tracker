/**
 * Enhanced keyboard navigation hook specifically for sidebar navigation
 * Provides arrow key navigation, focus management, and accessibility features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { announceToScreenReader } from '@/lib/utils/accessibility';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
  badge?: string | number;
}

interface UseSidebarKeyboardNavigationOptions {
  items: NavigationItem[];
  isActive?: boolean;
  onNavigate?: (item: NavigationItem) => void;
  announceNavigation?: boolean;
}

export function useSidebarKeyboardNavigation({
  items,
  isActive = true,
  onNavigate,
  announceNavigation = true,
}: UseSidebarKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const navigationRefs = useRef<(HTMLElement | null)[]>([]);

  // Find the currently active item index
  const activeIndex = items.findIndex(item => item.isActive);

  // Initialize focus on the active item or first item
  useEffect(() => {
    if (isActive && items.length > 0) {
      const initialIndex = activeIndex >= 0 ? activeIndex : 0;
      setFocusedIndex(initialIndex);
    }
  }, [isActive, activeIndex, items.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || items.length === 0 || !isNavigating) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const next = prev + 1;
            const newIndex = next >= items.length ? 0 : next;

            // Focus the element
            if (navigationRefs.current[newIndex]) {
              navigationRefs.current[newIndex]?.focus();
            }

            if (announceNavigation) {
              const item = items[newIndex];
              announceToScreenReader(
                `${item.label}${item.badge ? ` (${item.badge})` : ''}${item.isActive ? ' - current page' : ''}`,
                'polite'
              );
            }

            return newIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const next = prev - 1;
            const newIndex = next < 0 ? items.length - 1 : next;

            // Focus the element
            if (navigationRefs.current[newIndex]) {
              navigationRefs.current[newIndex]?.focus();
            }

            if (announceNavigation) {
              const item = items[newIndex];
              announceToScreenReader(
                `${item.label}${item.badge ? ` (${item.badge})` : ''}${item.isActive ? ' - current page' : ''}`,
                'polite'
              );
            }

            return newIndex;
          });
          break;

        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          if (navigationRefs.current[0]) {
            navigationRefs.current[0]?.focus();
          }
          if (announceNavigation) {
            const item = items[0];
            announceToScreenReader(`First item: ${item.label}`, 'polite');
          }
          break;

        case 'End':
          event.preventDefault();
          const lastIndex = items.length - 1;
          setFocusedIndex(lastIndex);
          if (navigationRefs.current[lastIndex]) {
            navigationRefs.current[lastIndex]?.focus();
          }
          if (announceNavigation) {
            const item = items[lastIndex];
            announceToScreenReader(`Last item: ${item.label}`, 'polite');
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            const item = items[focusedIndex];

            if (announceNavigation) {
              announceToScreenReader(`Navigating to ${item.label}`, 'polite');
            }

            onNavigate?.(item);
            router.push(item.href);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setIsNavigating(false);
          // Return focus to the sidebar toggle or main content
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
          }
          break;
      }
    },
    [
      isActive,
      items,
      focusedIndex,
      isNavigating,
      onNavigate,
      router,
      announceNavigation,
    ]
  );

  // Add keyboard event listener
  useEffect(() => {
    if (isNavigating) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isNavigating]);

  // Function to start keyboard navigation mode
  const startKeyboardNavigation = useCallback(() => {
    setIsNavigating(true);
    if (announceNavigation) {
      announceToScreenReader(
        'Keyboard navigation mode activated. Use arrow keys to navigate, Enter to select, Escape to exit.',
        'polite'
      );
    }
  }, [announceNavigation]);

  // Function to stop keyboard navigation mode
  const stopKeyboardNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  // Function to set ref for navigation items
  const setNavigationRef = useCallback((index: number) => {
    return (element: HTMLElement | null) => {
      navigationRefs.current[index] = element;
    };
  }, []);

  // Function to handle focus on navigation items
  const handleNavigationFocus = useCallback(
    (index: number) => {
      setFocusedIndex(index);
      if (!isNavigating) {
        startKeyboardNavigation();
      }
    },
    [isNavigating, startKeyboardNavigation]
  );

  // Function to handle blur on navigation items
  const handleNavigationBlur = useCallback(() => {
    // Small delay to check if focus moved to another navigation item
    setTimeout(() => {
      const focusedElement = document.activeElement;
      const isStillInNavigation = navigationRefs.current.some(
        ref => ref === focusedElement
      );

      if (!isStillInNavigation) {
        stopKeyboardNavigation();
      }
    }, 100);
  }, [stopKeyboardNavigation]);

  return {
    focusedIndex,
    isNavigating,
    setNavigationRef,
    handleNavigationFocus,
    handleNavigationBlur,
    startKeyboardNavigation,
    stopKeyboardNavigation,
  };
}

/**
 * Hook for managing focus within sidebar sections
 */
export function useSidebarFocusManagement() {
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const handleSectionFocus = useCallback((sectionId: string) => {
    setCurrentSection(sectionId);
    announceToScreenReader(`Focused on ${sectionId} section`, 'polite');
  }, []);

  const handleSectionBlur = useCallback(() => {
    setCurrentSection(null);
  }, []);

  return {
    currentSection,
    handleSectionFocus,
    handleSectionBlur,
  };
}

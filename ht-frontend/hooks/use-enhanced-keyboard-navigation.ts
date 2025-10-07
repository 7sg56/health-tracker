/**
 * Enhanced Keyboard Navigation Hook
 * Provides comprehensive keyboard navigation support with accessibility features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { announceToScreenReader, FocusManager, KeyboardKeys } from '@/lib/utils/accessibility';

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  isActive?: boolean;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

interface UseEnhancedKeyboardNavigationOptions {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  wrap?: boolean;
  typeahead?: boolean;
  announceNavigation?: boolean;
  onNavigate?: (item: NavigationItem, index: number) => void;
  onActivate?: (item: NavigationItem, index: number) => void;
  disabled?: boolean;
}

export function useEnhancedKeyboardNavigation({
  items,
  orientation = 'vertical',
  wrap = true,
  typeahead = true,
  announceNavigation = true,
  onNavigate,
  onActivate,
  disabled = false,
}: UseEnhancedKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [typeaheadString, setTypeaheadString] = useState('');
  const router = useRouter();
  
  const navigationRefs = useRef<(HTMLElement | null)[]>([]);
  const typeaheadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastKeyTimeRef = useRef<number>(0);

  // Filter out disabled items for navigation
  const navigableItems = items.filter(item => !item.disabled);
  const navigableIndices = items.map((item, index) => item.disabled ? -1 : index).filter(i => i !== -1);

  // Find the currently active item index
  const activeIndex = items.findIndex(item => item.isActive);

  // Initialize focus on the active item or first navigable item
  useEffect(() => {
    if (disabled || items.length === 0) return;
    
    const initialIndex = activeIndex >= 0 ? activeIndex : navigableIndices[0] ?? 0;
    setFocusedIndex(initialIndex);
  }, [disabled, activeIndex, items.length, navigableIndices]);

  // Typeahead functionality
  const handleTypeahead = useCallback((key: string) => {
    if (!typeahead || disabled) return false;

    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    
    // Reset typeahead string if too much time has passed
    if (timeSinceLastKey > 1000) {
      setTypeaheadString('');
    }
    
    const newTypeaheadString = typeaheadString + key.toLowerCase();
    setTypeaheadString(newTypeaheadString);
    lastKeyTimeRef.current = now;

    // Find matching item
    const matchingIndex = navigableItems.findIndex(item =>
      item.label.toLowerCase().startsWith(newTypeaheadString)
    );

    if (matchingIndex >= 0) {
      const actualIndex = navigableIndices[matchingIndex];
      setFocusedIndex(actualIndex);
      
      if (navigationRefs.current[actualIndex]) {
        navigationRefs.current[actualIndex]?.focus();
      }
      
      if (announceNavigation) {
        const item = items[actualIndex];
        announceToScreenReader(
          `${item.label}${item.badge ? ` (${item.badge})` : ''}${item.isActive ? ' - current page' : ''}`,
          'polite'
        );
      }
      
      onNavigate?.(items[actualIndex], actualIndex);
      
      // Clear typeahead string after successful match
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
      typeaheadTimeoutRef.current = setTimeout(() => {
        setTypeaheadString('');
      }, 1000);
      
      return true;
    }
    
    return false;
  }, [typeahead, disabled, typeaheadString, navigableItems, navigableIndices, items, announceNavigation, onNavigate]);

  // Navigation functions
  const navigateToIndex = useCallback((newIndex: number) => {
    if (disabled || newIndex < 0 || newIndex >= items.length || items[newIndex].disabled) {
      return false;
    }

    setFocusedIndex(newIndex);
    
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
    
    onNavigate?.(items[newIndex], newIndex);
    return true;
  }, [disabled, items, announceNavigation, onNavigate]);

  const navigateNext = useCallback(() => {
    const currentNavigableIndex = navigableIndices.indexOf(focusedIndex);
    if (currentNavigableIndex === -1) return false;
    
    let nextNavigableIndex = currentNavigableIndex + 1;
    if (nextNavigableIndex >= navigableIndices.length) {
      if (wrap) {
        nextNavigableIndex = 0;
      } else {
        return false;
      }
    }
    
    return navigateToIndex(navigableIndices[nextNavigableIndex]);
  }, [focusedIndex, navigableIndices, wrap, navigateToIndex]);

  const navigatePrevious = useCallback(() => {
    const currentNavigableIndex = navigableIndices.indexOf(focusedIndex);
    if (currentNavigableIndex === -1) return false;
    
    let prevNavigableIndex = currentNavigableIndex - 1;
    if (prevNavigableIndex < 0) {
      if (wrap) {
        prevNavigableIndex = navigableIndices.length - 1;
      } else {
        return false;
      }
    }
    
    return navigateToIndex(navigableIndices[prevNavigableIndex]);
  }, [focusedIndex, navigableIndices, wrap, navigateToIndex]);

  const navigateFirst = useCallback(() => {
    return navigableIndices.length > 0 ? navigateToIndex(navigableIndices[0]) : false;
  }, [navigableIndices, navigateToIndex]);

  const navigateLast = useCallback(() => {
    return navigableIndices.length > 0 ? navigateToIndex(navigableIndices[navigableIndices.length - 1]) : false;
  }, [navigableIndices, navigateToIndex]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled || !isNavigating || items.length === 0) return;

    const { key, ctrlKey, metaKey, altKey } = event;
    
    // Handle modifier keys
    if (ctrlKey || metaKey || altKey) return;

    // Handle navigation keys
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? KeyboardKeys.ARROW_DOWN : KeyboardKeys.ARROW_RIGHT;
    const prevKey = isVertical ? KeyboardKeys.ARROW_UP : KeyboardKeys.ARROW_LEFT;

    let handled = false;

    switch (key) {
      case nextKey:
        event.preventDefault();
        handled = navigateNext();
        break;

      case prevKey:
        event.preventDefault();
        handled = navigatePrevious();
        break;

      case KeyboardKeys.HOME:
        event.preventDefault();
        handled = navigateFirst();
        if (announceNavigation && handled) {
          announceToScreenReader('First item', 'polite');
        }
        break;

      case KeyboardKeys.END:
        event.preventDefault();
        handled = navigateLast();
        if (announceNavigation && handled) {
          announceToScreenReader('Last item', 'polite');
        }
        break;

      case KeyboardKeys.ENTER:
      case KeyboardKeys.SPACE:
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          
          if (announceNavigation) {
            announceToScreenReader(`Activating ${item.label}`, 'polite');
          }
          
          onActivate?.(item, focusedIndex);
          
          if (item.href) {
            router.push(item.href);
          }
          
          handled = true;
        }
        break;

      case KeyboardKeys.ESCAPE:
        event.preventDefault();
        setIsNavigating(false);
        FocusManager.restoreFocus();
        handled = true;
        break;

      default:
        // Handle typeahead
        if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
          event.preventDefault();
          handled = handleTypeahead(key);
        }
        break;
    }

    return handled;
  }, [
    disabled,
    isNavigating,
    items,
    orientation,
    focusedIndex,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    announceNavigation,
    onActivate,
    router,
    handleTypeahead
  ]);

  // Add keyboard event listener
  useEffect(() => {
    if (isNavigating && !disabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isNavigating, disabled]);

  // Clear typeahead timeout on unmount
  useEffect(() => {
    return () => {
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, []);

  // Functions to control navigation mode
  const startKeyboardNavigation = useCallback(() => {
    if (disabled) return;
    
    FocusManager.saveFocus();
    setIsNavigating(true);
    
    if (announceNavigation) {
      const instructions = [
        'Keyboard navigation activated.',
        orientation === 'vertical' ? 'Use arrow keys to navigate,' : 'Use left and right arrow keys to navigate,',
        'Enter or Space to select,',
        'Escape to exit.'
      ].join(' ');
      
      announceToScreenReader(instructions, 'polite');
    }
  }, [disabled, announceNavigation, orientation]);

  const stopKeyboardNavigation = useCallback(() => {
    setIsNavigating(false);
    setTypeaheadString('');
  }, []);

  // Function to set ref for navigation items
  const setNavigationRef = useCallback((index: number) => {
    return (element: HTMLElement | null) => {
      navigationRefs.current[index] = element;
    };
  }, []);

  // Function to handle focus on navigation items
  const handleNavigationFocus = useCallback((index: number) => {
    if (disabled) return;
    
    setFocusedIndex(index);
    if (!isNavigating) {
      startKeyboardNavigation();
    }
  }, [disabled, isNavigating, startKeyboardNavigation]);

  // Function to handle blur on navigation items
  const handleNavigationBlur = useCallback(() => {
    if (disabled) return;
    
    // Small delay to check if focus moved to another navigation item
    setTimeout(() => {
      const focusedElement = document.activeElement;
      const isStillInNavigation = navigationRefs.current.some(ref => ref === focusedElement);
      
      if (!isStillInNavigation) {
        stopKeyboardNavigation();
      }
    }, 100);
  }, [disabled, stopKeyboardNavigation]);

  return {
    // State
    focusedIndex,
    isNavigating,
    typeaheadString,
    
    // Navigation functions
    navigateToIndex,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    
    // Control functions
    startKeyboardNavigation,
    stopKeyboardNavigation,
    
    // Ref and event handlers
    setNavigationRef,
    handleNavigationFocus,
    handleNavigationBlur,
    
    // Utilities
    isItemFocused: (index: number) => index === focusedIndex,
    isItemNavigable: (index: number) => !items[index]?.disabled,
    getNavigationProps: (index: number) => ({
      ref: setNavigationRef(index),
      onFocus: () => handleNavigationFocus(index),
      onBlur: handleNavigationBlur,
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-current': items[index]?.isActive ? 'page' as const : undefined,
      'data-focused': index === focusedIndex,
      'data-navigating': isNavigating,
    }),
  };
}

/**
 * Hook for managing roving tabindex pattern
 */
export function useRovingTabindex(items: any[], activeIndex: number = 0) {
  const [focusedIndex, setFocusedIndex] = useState(activeIndex);

  const getTabIndex = useCallback((index: number) => {
    return index === focusedIndex ? 0 : -1;
  }, [focusedIndex]);

  const setFocusedIndex_ = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  }, [items.length]);

  return {
    focusedIndex,
    setFocusedIndex: setFocusedIndex_,
    getTabIndex,
    isItemFocused: (index: number) => index === focusedIndex,
  };
}

/**
 * Hook for managing focus within a container
 */
export function useContainerFocus() {
  const containerRef = useRef<HTMLElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  const handleFocusIn = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleFocusOut = useCallback((event: FocusEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Check if the new focus target is still within the container
    const newFocusTarget = event.relatedTarget as HTMLElement;
    if (!newFocusTarget || !container.contains(newFocusTarget)) {
      setHasFocus(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, [handleFocusIn, handleFocusOut]);

  return {
    containerRef,
    hasFocus,
    focusContainer: () => {
      if (containerRef.current) {
        FocusManager.focusFirst(containerRef.current);
      }
    },
  };
}
/**
 * Custom hook for keyboard navigation support
 * Provides arrow key navigation for lists and menus
 */

import { useEffect, useState, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  items: string[] | number;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  loop?: boolean;
  disabled?: boolean;
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onEscape,
  loop = true,
  disabled = false,
}: UseKeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemCount = Array.isArray(items) ? items.length : items;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || itemCount === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => {
            const next = prev + 1;
            return loop ? next % itemCount : Math.min(next, itemCount - 1);
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => {
            const next = prev - 1;
            return loop ? (next < 0 ? itemCount - 1 : next) : Math.max(next, 0);
          });
          break;

        case 'Home':
          event.preventDefault();
          setSelectedIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setSelectedIndex(itemCount - 1);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.(selectedIndex);
          break;

        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    },
    [selectedIndex, itemCount, onSelect, onEscape, loop, disabled]
  );

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, disabled]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [itemCount]);

  return {
    selectedIndex,
    setSelectedIndex,
    isSelected: (index: number) => index === selectedIndex,
  };
}

/**
 * Hook for managing focus trap within a container
 */
export function useFocusTrap(isActive: boolean = true) {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef) return;

    const focusableElements = containerRef.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement?.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);

  return setContainerRef;
}

/**
 * Hook for managing ARIA announcements
 */
export function useAnnouncer() {
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or find the announcer element
    let announcerElement = document.getElementById('aria-announcer');

    if (!announcerElement) {
      announcerElement = document.createElement('div');
      announcerElement.id = 'aria-announcer';
      announcerElement.setAttribute('aria-live', 'polite');
      announcerElement.setAttribute('aria-atomic', 'true');
      announcerElement.style.position = 'absolute';
      announcerElement.style.left = '-10000px';
      announcerElement.style.width = '1px';
      announcerElement.style.height = '1px';
      announcerElement.style.overflow = 'hidden';
      document.body.appendChild(announcerElement);
    }

    setAnnouncer(announcerElement);

    return () => {
      // Clean up on unmount
      const element = document.getElementById('aria-announcer');
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcer) return;

      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;

      // Clear the message after a short delay to allow for re-announcements
      setTimeout(() => {
        if (announcer) {
          announcer.textContent = '';
        }
      }, 1000);
    },
    [announcer]
  );

  return announce;
}

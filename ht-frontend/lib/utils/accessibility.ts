/**
 * Accessibility utilities and helpers
 */

/**
 * Generate a unique ID for form elements and ARIA relationships
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced ARIA live region manager
 */
class AriaLiveRegionManager {
  private static instance: AriaLiveRegionManager;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  static getInstance(): AriaLiveRegionManager {
    if (!AriaLiveRegionManager.instance) {
      AriaLiveRegionManager.instance = new AriaLiveRegionManager();
    }
    return AriaLiveRegionManager.instance;
  }

  private createRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.id = `aria-live-${priority}`;
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    region.style.clipPath = 'inset(50%)';
    document.body.appendChild(region);
    return region;
  }

  private getRegion(priority: 'polite' | 'assertive'): HTMLElement {
    if (priority === 'polite') {
      if (!this.politeRegion) {
        this.politeRegion = this.createRegion('polite');
      }
      return this.politeRegion;
    } else {
      if (!this.assertiveRegion) {
        this.assertiveRegion = this.createRegion('assertive');
      }
      return this.assertiveRegion;
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getRegion(priority);

    // Clear previous message
    region.textContent = '';

    // Use setTimeout to ensure screen readers pick up the change
    setTimeout(() => {
      region.textContent = message;

      // Clear after announcement to allow for re-announcements
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }, 100);
  }

  cleanup(): void {
    if (this.politeRegion?.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion?.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

/**
 * Enhanced screen reader announcement function
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const manager = AriaLiveRegionManager.getInstance();
  manager.announce(message, priority);
}

/**
 * Cleanup accessibility resources
 */
export function cleanupAccessibilityResources(): void {
  const manager = AriaLiveRegionManager.getInstance();
  manager.cleanup();
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

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

  // Focus the first element
  firstElement?.focus();

  document.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate ARIA role for a button based on its function
 */
export function getButtonRole(
  type: 'button' | 'submit' | 'menu' | 'menuitem'
): string {
  const roleMap = {
    button: 'button',
    submit: 'button',
    menu: 'button',
    menuitem: 'menuitem',
  };

  return roleMap[type] || 'button';
}

/**
 * Create ARIA describedby relationship
 */
export function createAriaDescribedBy(
  elementId: string,
  descriptionIds: string[]
): string {
  return descriptionIds.filter(id => id).join(' ');
}

/**
 * Validate color contrast ratio (simplified check)
 */
export function hasGoodContrast(
  foreground: string,
  background: string
): boolean {
  // This is a simplified implementation
  // In a real app, you'd use a proper color contrast library
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);

  const contrast =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  return contrast >= 4.5; // WCAG AA standard
}

/**
 * Calculate relative luminance (simplified)
 */
function getLuminance(color: string): number {
  // This is a very simplified implementation
  // In production, use a proper color library
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Skip link component helper
 */
export function createSkipLink(
  targetId: string,
  text: string = 'Skip to main content'
): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';

  return skipLink;
}

/**
 * Keyboard event helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
} as const;

/**
 * Check if a key event matches expected keys
 */
export function isKeyPressed(
  event: KeyboardEvent,
  keys: string | string[]
): boolean {
  const targetKeys = Array.isArray(keys) ? keys : [keys];
  return targetKeys.includes(event.key);
}

/**
 * ARIA attributes helpers
 */
export const AriaAttributes = {
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),
  checked: (isChecked: boolean) => ({ 'aria-checked': isChecked }),
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),
  hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
  label: (label: string) => ({ 'aria-label': label }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  controls: (id: string) => ({ 'aria-controls': id }),
  owns: (id: string) => ({ 'aria-owns': id }),
  live: (type: 'polite' | 'assertive' | 'off') => ({ 'aria-live': type }),
  atomic: (isAtomic: boolean) => ({ 'aria-atomic': isAtomic }),
  busy: (isBusy: boolean) => ({ 'aria-busy': isBusy }),
  invalid: (isInvalid: boolean) => ({ 'aria-invalid': isInvalid }),
  required: (isRequired: boolean) => ({ 'aria-required': isRequired }),
  current: (
    type: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  ) => ({ 'aria-current': type }),
  level: (level: number) => ({ 'aria-level': level }),
  setSize: (size: number) => ({ 'aria-setsize': size }),
  posInSet: (position: number) => ({ 'aria-posinset': position }),
  hasPopup: (
    type: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean
  ) => ({ 'aria-haspopup': type }),
  modal: (isModal: boolean) => ({ 'aria-modal': isModal }),
  multiline: (isMultiline: boolean) => ({ 'aria-multiline': isMultiline }),
  orientation: (orientation: 'horizontal' | 'vertical') => ({
    'aria-orientation': orientation,
  }),
  readonly: (isReadonly: boolean) => ({ 'aria-readonly': isReadonly }),
  sort: (sort: 'ascending' | 'descending' | 'none' | 'other') => ({
    'aria-sort': sort,
  }),
  valueNow: (value: number) => ({ 'aria-valuenow': value }),
  valueMin: (value: number) => ({ 'aria-valuemin': value }),
  valueMax: (value: number) => ({ 'aria-valuemax': value }),
  valueText: (text: string) => ({ 'aria-valuetext': text }),
} as const;

/**
 * Enhanced focus management utilities
 */
export class FocusManager {
  private static focusHistory: HTMLElement[] = [];
  private static maxHistoryLength = 10;

  /**
   * Save current focus to history
   */
  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.unshift(activeElement);
      if (this.focusHistory.length > this.maxHistoryLength) {
        this.focusHistory = this.focusHistory.slice(0, this.maxHistoryLength);
      }
    }
  }

  /**
   * Restore previous focus from history
   */
  static restoreFocus(): boolean {
    const previousElement = this.focusHistory.shift();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
      return true;
    }
    return false;
  }

  /**
   * Focus first focusable element in container
   */
  static focusFirst(container: HTMLElement): boolean {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }

  /**
   * Focus last focusable element in container
   */
  static focusLast(container: HTMLElement): boolean {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }

  /**
   * Move focus to next focusable element
   */
  static focusNext(container?: HTMLElement): boolean {
    const root = container || document.body;
    const focusableElements = getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
      return true;
    }
    return false;
  }

  /**
   * Move focus to previous focusable element
   */
  static focusPrevious(container?: HTMLElement): boolean {
    const root = container || document.body;
    const focusableElements = getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
      return true;
    }
    return false;
  }
}

/**
 * Screen reader testing utilities
 */
export const ScreenReaderUtils = {
  /**
   * Test if element has proper accessible name
   */
  hasAccessibleName(element: HTMLElement): boolean {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const textContent = element.textContent?.trim();

    return !!(ariaLabel || ariaLabelledBy || title || textContent);
  },

  /**
   * Get accessible name for element
   */
  getAccessibleName(element: HTMLElement): string {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent?.trim() || '';
    }

    const title = element.getAttribute('title');
    if (title) return title;

    return element.textContent?.trim() || '';
  },

  /**
   * Check if element has proper role
   */
  hasProperRole(element: HTMLElement): boolean {
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();

    // Elements that should have explicit roles
    const shouldHaveRole = ['div', 'span', 'section', 'article'];

    if (shouldHaveRole.includes(tagName)) {
      return !!role;
    }

    return true; // Semantic elements are fine without explicit roles
  },

  /**
   * Validate ARIA attributes
   */
  validateAriaAttributes(element: HTMLElement): string[] {
    const errors: string[] = [];
    const attributes = element.attributes;

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name.startsWith('aria-')) {
        // Check for common ARIA attribute errors
        if (
          attr.name === 'aria-labelledby' ||
          attr.name === 'aria-describedby'
        ) {
          const ids = attr.value.split(' ');
          for (const id of ids) {
            if (!document.getElementById(id.trim())) {
              errors.push(
                `Referenced element with id "${id}" not found for ${attr.name}`
              );
            }
          }
        }
      }
    }

    return errors;
  },

  /**
   * Check keyboard accessibility
   */
  isKeyboardAccessible(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = [
      'button',
      'a',
      'input',
      'select',
      'textarea',
    ].includes(element.tagName.toLowerCase());
    const hasRole = element.getAttribute('role');
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option'];

    if (isInteractive) return true;
    if (tabIndex === '0' || (tabIndex && parseInt(tabIndex) >= 0)) return true;
    if (hasRole && interactiveRoles.includes(hasRole)) return true;

    return false;
  },
};

/**
 * Accessibility testing suite
 */
export const AccessibilityTester = {
  /**
   * Run comprehensive accessibility audit on element
   */
  auditElement(element: HTMLElement): {
    passed: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check accessible name
    if (!ScreenReaderUtils.hasAccessibleName(element)) {
      errors.push('Element lacks accessible name');
    }

    // Check ARIA attributes
    const ariaErrors = ScreenReaderUtils.validateAriaAttributes(element);
    errors.push(...ariaErrors);

    // Check keyboard accessibility for interactive elements
    const isInteractive =
      element.onclick ||
      element.getAttribute('role') === 'button' ||
      ['button', 'a', 'input'].includes(element.tagName.toLowerCase());

    if (isInteractive && !ScreenReaderUtils.isKeyboardAccessible(element)) {
      errors.push('Interactive element is not keyboard accessible');
    }

    // Check color contrast (simplified)
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    if (
      color &&
      backgroundColor &&
      color !== 'rgba(0, 0, 0, 0)' &&
      backgroundColor !== 'rgba(0, 0, 0, 0)'
    ) {
      if (!hasGoodContrast(color, backgroundColor)) {
        warnings.push('Potential color contrast issue');
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Audit entire page
   */
  auditPage(): {
    passed: boolean;
    elementResults: Array<{
      element: HTMLElement;
      errors: string[];
      warnings: string[];
    }>;
    summary: {
      totalElements: number;
      elementsWithErrors: number;
      elementsWithWarnings: number;
    };
  } {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]'
    );

    const elementResults = Array.from(interactiveElements).map(element => {
      const result = this.auditElement(element as HTMLElement);
      return {
        element: element as HTMLElement,
        errors: result.errors,
        warnings: result.warnings,
      };
    });

    const elementsWithErrors = elementResults.filter(
      r => r.errors.length > 0
    ).length;
    const elementsWithWarnings = elementResults.filter(
      r => r.warnings.length > 0
    ).length;

    return {
      passed: elementsWithErrors === 0,
      elementResults,
      summary: {
        totalElements: elementResults.length,
        elementsWithErrors,
        elementsWithWarnings,
      },
    };
  },
};

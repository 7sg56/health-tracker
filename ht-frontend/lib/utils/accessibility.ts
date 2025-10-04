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
 * Announce a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  let announcer = document.getElementById('aria-live-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'aria-live-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = '';
    }
  }, 1000);
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
export function getButtonRole(type: 'button' | 'submit' | 'menu' | 'menuitem'): string {
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
export function createAriaDescribedBy(elementId: string, descriptionIds: string[]): string {
  return descriptionIds.filter(id => id).join(' ');
}

/**
 * Validate color contrast ratio (simplified check)
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  // This is a simplified implementation
  // In a real app, you'd use a proper color contrast library
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
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
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
  
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
export function isKeyPressed(event: KeyboardEvent, keys: string | string[]): boolean {
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
} as const;
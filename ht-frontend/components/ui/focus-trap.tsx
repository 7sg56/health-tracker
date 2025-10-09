/**
 * Focus Trap Component
 * Traps focus within a container for modal dialogs and dropdowns
 */

import * as React from 'react';
import { useFocusTrap } from '@/hooks/use-keyboard-navigation';
import {
  FocusManager,
  announceToScreenReader,
} from '@/lib/utils/accessibility';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function FocusTrap({
  children,
  isActive = true,
  restoreFocus = true,
  autoFocus = true,
  className,
  onActivate,
  onDeactivate,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: FocusTrapProps) {
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const setContainerRef = useFocusTrap(isActive);

  React.useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      if (restoreFocus) {
        previousActiveElement.current = document.activeElement as HTMLElement;
      }

      // Focus the first focusable element in the trap
      if (autoFocus && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }

      onActivate?.();

      // Announce to screen readers
      if (ariaLabel) {
        announceToScreenReader(`${ariaLabel} opened`, 'polite');
      }
    } else {
      // Restore focus when the trap is deactivated
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      onDeactivate?.();

      // Announce to screen readers
      if (ariaLabel) {
        announceToScreenReader(`${ariaLabel} closed`, 'polite');
      }
    }
  }, [isActive, restoreFocus, autoFocus, onActivate, onDeactivate, ariaLabel]);

  // Combine refs
  const combinedRef = React.useCallback(
    (node: HTMLDivElement) => {
      containerRef.current = node;
      setContainerRef(node);
    },
    [setContainerRef]
  );

  return (
    <div
      ref={combinedRef}
      className={className}
      data-focus-trap={isActive}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={ariaLabel ? 'dialog' : undefined}
      aria-modal={isActive}
    >
      {children}
    </div>
  );
}

/**
 * Modal Focus Trap
 * Specialized focus trap for modal dialogs
 */
interface ModalFocusTrapProps extends FocusTrapProps {
  onEscape?: () => void;
}

export function ModalFocusTrap({
  children,
  onEscape,
  ...props
}: ModalFocusTrapProps) {
  React.useEffect(() => {
    if (!props.isActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [props.isActive, onEscape]);

  return <FocusTrap {...props}>{children}</FocusTrap>;
}

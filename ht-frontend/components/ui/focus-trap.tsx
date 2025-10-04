/**
 * Focus Trap Component
 * Traps focus within a container for modal dialogs and dropdowns
 */

import * as React from "react";
import { useFocusTrap } from "@/hooks/use-keyboard-navigation";

interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export function FocusTrap({ 
  children, 
  isActive = true, 
  restoreFocus = true,
  className 
}: FocusTrapProps) {
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const setContainerRef = useFocusTrap(isActive);

  React.useEffect(() => {
    if (isActive && restoreFocus) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    return () => {
      // Restore focus when the trap is deactivated
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, restoreFocus]);

  return (
    <div
      ref={setContainerRef}
      className={className}
      data-focus-trap={isActive}
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

  return (
    <FocusTrap {...props}>
      {children}
    </FocusTrap>
  );
}
/**
 * Announcer Component
 * Provides screen reader announcements for dynamic content changes
 */

import * as React from 'react';
import { useAnnouncer } from '@/hooks/use-keyboard-navigation';

interface AnnouncerProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
}

export function Announcer({
  message,
  priority = 'polite',
  clearDelay = 1000,
}: AnnouncerProps) {
  const announce = useAnnouncer();

  React.useEffect(() => {
    if (message) {
      announce(message, priority);
    }
  }, [message, priority, announce]);

  return null; // This component doesn't render anything visible
}

/**
 * Live Region Component
 * Creates a live region for dynamic content announcements
 */
interface LiveRegionProps {
  children?: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  className,
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Status Message Component
 * Announces status messages to screen readers
 */
interface StatusMessageProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible?: boolean;
  className?: string;
}

export function StatusMessage({
  message,
  type = 'info',
  visible = false,
  className,
}: StatusMessageProps) {
  const priority = type === 'error' ? 'assertive' : 'polite';

  return (
    <>
      <Announcer message={message} priority={priority} />
      {visible && (
        <div role="status" aria-live={priority} className={className}>
          {message}
        </div>
      )}
    </>
  );
}

/**
 * Loading Announcer
 * Announces loading states to screen readers
 */
interface LoadingAnnouncerProps {
  isLoading: boolean;
  loadingMessage?: string;
  completeMessage?: string;
}

export function LoadingAnnouncer({
  isLoading,
  loadingMessage = 'Loading...',
  completeMessage = 'Loading complete',
}: LoadingAnnouncerProps) {
  const [previousLoading, setPreviousLoading] = React.useState(isLoading);

  React.useEffect(() => {
    if (isLoading !== previousLoading) {
      setPreviousLoading(isLoading);
    }
  }, [isLoading, previousLoading]);

  return (
    <>
      {isLoading && <Announcer message={loadingMessage} priority="polite" />}
      {!isLoading && previousLoading && (
        <Announcer message={completeMessage} priority="polite" />
      )}
    </>
  );
}

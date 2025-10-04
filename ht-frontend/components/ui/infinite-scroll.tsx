'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  threshold = 100,
  className,
  loadingComponent,
  endMessage,
  errorMessage,
  onRetry
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && !errorMessage) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore, errorMessage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-4 text-sm text-muted-foreground">
      No more items to load
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />
      
      {/* Loading state */}
      {isLoading && (loadingComponent || defaultLoadingComponent)}
      
      {/* Error state */}
      {errorMessage && (
        <div className="text-center py-4">
          <p className="text-sm text-destructive mb-2">{errorMessage}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      )}
      
      {/* End message */}
      {!hasMore && !isLoading && !errorMessage && (endMessage || defaultEndMessage)}
    </div>
  );
}

// Hook for infinite scroll functionality
interface UseInfiniteScrollOptions {
  threshold?: number;
  enabled?: boolean;
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 100, enabled = true } = options;
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      
      if (isNearBottom) {
        callback();
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [callback, threshold, enabled]);

  return elementRef;
}

// Manual load more button component
interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function LoadMoreButton({
  hasMore,
  isLoading,
  onLoadMore,
  className,
  children = 'Load More'
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
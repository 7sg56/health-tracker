/**
 * Lazy Page Wrapper Component
 * Provides loading states and error boundaries for lazy-loaded pages
 */

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Default loading skeleton for pages
const DefaultPageSkeleton = () => (
  <div className="container mx-auto space-y-6 px-4 py-8">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export function LazyPageWrapper({
  children,
  fallback = <DefaultPageSkeleton />,
  errorFallback,
}: LazyPageWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// Specific loading components for different page types
export const DashboardSkeleton = () => (
  <div className="container mx-auto space-y-6 px-4 py-8">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>

    {/* Chart area */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>

    {/* Recent activity */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-36" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 rounded border p-3"
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FormPageSkeleton = () => (
  <div className="container mx-auto space-y-6 px-4 py-8">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Form */}
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>

    {/* List */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded border p-3"
          >
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AuthPageSkeleton = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="w-full max-w-md space-y-6">
      {/* Logo/Header */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Footer links */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  </div>
);

// Higher-order component for lazy loading pages
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  LoadingSkeleton: React.ComponentType = DefaultPageSkeleton
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component })
  );

  return function WrappedComponent(props: P) {
    return (
      <LazyPageWrapper fallback={<LoadingSkeleton />}>
        <LazyComponent {...props} />
      </LazyPageWrapper>
    );
  };
}

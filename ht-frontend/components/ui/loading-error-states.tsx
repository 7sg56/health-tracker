'use client';

// Loading error states with proper fallbacks

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Wifi,
  Server,
  Database,
  FileX,
  Image as ImageIcon,
  Home,
} from 'lucide-react';
import { Button } from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { Skeleton } from './skeleton';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/errors/api-error';

interface LoadingErrorStateProps {
  isLoading?: boolean;
  error?: ApiError | Error | string;
  onRetry?: () => void;
  onCancel?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  showProgress?: boolean;
  progress?: number;
  timeout?: number;
  variant?: 'card' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Comprehensive loading error state component
 */
export function LoadingErrorState({
  isLoading = false,
  error,
  onRetry,
  onCancel,
  loadingMessage = 'Loading...',
  errorTitle,
  errorMessage,
  showProgress = false,
  progress,
  timeout,
  variant = 'card',
  size = 'md',
  className,
  children,
}: LoadingErrorStateProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [timeoutProgress, setTimeoutProgress] = useState(0);

  // Handle timeout
  useEffect(() => {
    if (isLoading && timeout) {
      setHasTimedOut(false);
      setTimeoutProgress(0);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min((elapsed / timeout) * 100, 100);
        setTimeoutProgress(progressPercent);

        if (elapsed >= timeout) {
          setHasTimedOut(true);
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, timeout]);

  const getErrorIcon = (error: ApiError | Error | string) => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 0:
          return <Wifi className="text-destructive h-5 w-5" />;
        case 404:
          return <FileX className="text-destructive h-5 w-5" />;
        case 500:
        case 502:
        case 503:
        case 504:
          return <Server className="text-destructive h-5 w-5" />;
        default:
          return <AlertTriangle className="text-destructive h-5 w-5" />;
      }
    }
    return <AlertTriangle className="text-destructive h-5 w-5" />;
  };

  const getErrorTitle = (error: ApiError | Error | string) => {
    if (errorTitle) return errorTitle;

    if (error instanceof ApiError) {
      switch (error.status) {
        case 0:
          return 'Connection Error';
        case 404:
          return 'Not Found';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server Error';
        default:
          return 'Error';
      }
    }

    return 'Error';
  };

  const getErrorMessage = (error: ApiError | Error | string) => {
    if (errorMessage) return errorMessage;

    if (typeof error === 'string') return error;
    if (error instanceof ApiError) return error.getUserMessage();
    if (error instanceof Error) return error.message;

    return 'An unexpected error occurred';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-6 w-6',
          title: 'text-base',
          description: 'text-sm',
          padding: 'p-4',
        };
      case 'lg':
        return {
          icon: 'h-8 w-8',
          title: 'text-xl',
          description: 'text-base',
          padding: 'p-8',
        };
      default:
        return {
          icon: 'h-6 w-6',
          title: 'text-lg',
          description: 'text-sm',
          padding: 'p-6',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Loading state
  if (isLoading && !error) {
    const loadingContent = (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeClasses.padding
        )}
      >
        <Loader2
          className={cn('text-primary mb-3 animate-spin', sizeClasses.icon)}
        />
        <p className={cn('mb-2 font-medium', sizeClasses.title)}>
          {loadingMessage}
        </p>

        {showProgress && progress !== undefined && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-muted-foreground text-xs">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {timeout && !hasTimedOut && (
          <div className="mt-4 w-full max-w-xs space-y-2">
            <Progress value={timeoutProgress} className="h-1" />
            <p className="text-muted-foreground text-xs">
              {Math.round((timeout - (timeoutProgress / 100) * timeout) / 1000)}
              s remaining
            </p>
          </div>
        )}

        {hasTimedOut && (
          <div className="mt-4 space-y-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Taking longer than expected
            </Badge>
            {onCancel && (
              <Button onClick={onCancel} variant="outline" size="sm">
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    );

    if (variant === 'overlay') {
      return (
        <div
          className={cn(
            'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
            className
          )}
        >
          <Card className="w-full max-w-sm">
            <CardContent className="p-0">{loadingContent}</CardContent>
          </Card>
        </div>
      );
    }

    if (variant === 'inline') {
      return (
        <div
          className={cn(
            'bg-muted/50 flex items-center gap-3 rounded-lg border p-4',
            className
          )}
        >
          <Loader2 className="text-primary h-4 w-4 flex-shrink-0 animate-spin" />
          <span className="text-sm">{loadingMessage}</span>
          {showProgress && progress !== undefined && (
            <div className="max-w-xs flex-1">
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      );
    }

    // Card variant
    return (
      <Card className={className}>
        <CardContent className="p-0">{loadingContent}</CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    const errorContent = (
      <>
        <div className="text-center">
          <div
            className={cn(
              'bg-destructive/10 mx-auto mb-3 flex items-center justify-center rounded-full',
              size === 'sm'
                ? 'h-8 w-8'
                : size === 'lg'
                  ? 'h-12 w-12'
                  : 'h-10 w-10'
            )}
          >
            {getErrorIcon(error)}
          </div>
          <h3 className={cn('mb-2 font-semibold', sizeClasses.title)}>
            {getErrorTitle(error)}
          </h3>
          <p
            className={cn(
              'text-muted-foreground mb-4',
              sizeClasses.description
            )}
          >
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry} size={size === 'sm' ? 'sm' : 'default'}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            size={size === 'sm' ? 'sm' : 'default'}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </>
    );

    if (variant === 'overlay') {
      return (
        <div
          className={cn(
            'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
            className
          )}
        >
          <Card className="w-full max-w-md">
            <CardContent className={sizeClasses.padding}>
              {errorContent}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (variant === 'inline') {
      return (
        <Alert variant="destructive" className={className}>
          {getErrorIcon(error)}
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{getErrorTitle(error)}</p>
                <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
              </div>
              <div className="flex gap-2">
                {onRetry && (
                  <Button onClick={onRetry} size="sm" variant="outline">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // Card variant
    return (
      <Card className={className}>
        <CardContent className={sizeClasses.padding}>
          {errorContent}
        </CardContent>
      </Card>
    );
  }

  // Success state - render children
  return <>{children}</>;
}

/**
 * Data loading wrapper with error handling
 */
interface DataLoaderProps<T> {
  data?: T;
  isLoading?: boolean;
  error?: ApiError | Error | string;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  children: (data: T) => React.ReactNode;
}

export function DataLoader<T>({
  data,
  isLoading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyMessage = 'No data available',
  className,
  children,
}: DataLoaderProps<T>) {
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || (
          <LoadingErrorState
            isLoading={true}
            loadingMessage="Loading data..."
            variant="card"
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <LoadingErrorState error={error} onRetry={onRetry} variant="card" />
        )}
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={className}>
        {emptyComponent || (
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
              <p className="text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return <div className={className}>{children(data)}</div>;
}

/**
 * Image loading with error fallback
 */
interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  fallback,
  showRetry = false,
  onRetry,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    onRetry?.();
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={cn(
          'border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center rounded-lg border border-dashed p-4',
          className
        )}
      >
        <ImageIcon className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground mb-2 text-sm">
          Failed to load image
        </p>
        {showRetry && (
          <Button onClick={handleRetry} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={cn(
            'bg-muted/50 absolute inset-0 flex items-center justify-center rounded',
            className
          )}
        >
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(isLoading && 'opacity-0', className)}
        {...props}
      />
    </div>
  );
}

/**
 * Suspense fallback with timeout
 */
interface SuspenseFallbackProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
  className?: string;
}

export function SuspenseFallback({
  message = 'Loading...',
  timeout = 10000,
  onTimeout,
  className,
}: SuspenseFallbackProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (hasTimedOut) {
    return (
      <LoadingErrorState
        error="Loading is taking longer than expected"
        errorTitle="Timeout"
        onRetry={() => window.location.reload()}
        variant="card"
        className={className}
      />
    );
  }

  return (
    <LoadingErrorState
      isLoading={true}
      loadingMessage={message}
      variant="card"
      className={className}
    />
  );
}

/**
 * Hook for managing loading error states
 */
export function useLoadingErrorState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | string | null>(null);

  const execute = async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const retry = (operation: () => Promise<T>) => {
    return execute(operation);
  };

  const reset = () => {
    setData(null);
    setIsLoading(false);
    setError(null);
  };

  return {
    data,
    isLoading,
    error,
    execute,
    retry,
    reset,
    hasData: data !== null,
    hasError: error !== null,
  };
}

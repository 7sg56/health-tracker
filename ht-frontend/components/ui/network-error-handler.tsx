'use client';

// Network error handling components with retry mechanisms

import React, { useState, useCallback, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
import { Badge } from './badge';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import { ApiError, NetworkError } from '@/lib/errors/api-error';
import { ErrorHandler } from '@/lib/errors/error-handler';

interface NetworkErrorHandlerProps {
  error: ApiError | Error;
  onRetry?: () => Promise<void> | void;
  onCancel?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  showProgress?: boolean;
  variant?: 'card' | 'alert' | 'inline';
  className?: string;
}

/**
 * Network error handler with automatic retry functionality
 */
export function NetworkErrorHandler({
  error,
  onRetry,
  onCancel,
  maxRetries = 3,
  retryDelay = 1000,
  showProgress = true,
  variant = 'card',
  className,
}: NetworkErrorHandlerProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const isNetworkError =
    error instanceof NetworkError ||
    (error instanceof ApiError && error.status === 0);

  const canRetry = retryCount < maxRetries && onRetry;
  const shouldAutoRetry = isNetworkError && canRetry;

  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryProgress(0);

    try {
      await onRetry();
      // Reset retry count on successful retry
      setRetryCount(0);
    } catch (retryError) {
      setRetryCount(prev => prev + 1);

      // If we can still retry, schedule next attempt
      if (retryCount + 1 < maxRetries) {
        const delay = ErrorHandler.getRetryDelay(retryCount);
        setNextRetryIn(Math.ceil(delay / 1000));

        // Start countdown
        const countdownInterval = setInterval(() => {
          setNextRetryIn(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Schedule retry
        setTimeout(() => {
          clearInterval(countdownInterval);
          handleRetry();
        }, delay);
      }
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, retryCount, maxRetries]);

  // Auto-retry for network errors
  useEffect(() => {
    if (shouldAutoRetry && retryCount === 0) {
      const timer = setTimeout(handleRetry, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoRetry, handleRetry, retryDelay, retryCount]);

  // Progress animation during retry
  useEffect(() => {
    if (isRetrying && showProgress) {
      const interval = setInterval(() => {
        setRetryProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isRetrying, showProgress]);

  const getErrorMessage = () => {
    if (error instanceof ApiError) {
      return error.getUserMessage();
    }
    return error.message || 'Network connection failed';
  };

  const getErrorIcon = () => {
    if (isNetworkError) {
      return <WifiOff className="text-destructive h-5 w-5" />;
    }
    return <AlertTriangle className="text-destructive h-5 w-5" />;
  };

  const renderRetryInfo = () => {
    if (!canRetry) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Retry attempts: {retryCount}/{maxRetries}
          </span>
          {nextRetryIn > 0 && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Next retry in {nextRetryIn}s
            </Badge>
          )}
        </div>

        {isRetrying && showProgress && (
          <div className="space-y-2">
            <Progress value={retryProgress} className="h-2" />
            <p className="text-muted-foreground text-center text-xs">
              Retrying connection...
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => (
    <div className="flex flex-wrap gap-2">
      {canRetry && !isRetrying && nextRetryIn === 0 && (
        <Button onClick={handleRetry} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Now
        </Button>
      )}
      {onCancel && (
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      )}
      <Button
        onClick={() => (window.location.href = '/')}
        variant="outline"
        size="sm"
      >
        <Home className="mr-2 h-4 w-4" />
        Go Home
      </Button>
    </div>
  );

  if (variant === 'alert') {
    return (
      <Alert className={cn('border-destructive/50', className)}>
        {getErrorIcon()}
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {getErrorMessage()}
              </p>
            </div>
            {renderRetryInfo()}
            {renderActions()}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'border-destructive/20 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4',
          className
        )}
      >
        {getErrorIcon()}
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium">Connection Error</p>
            <p className="text-muted-foreground text-sm">{getErrorMessage()}</p>
          </div>
          {renderRetryInfo()}
          {renderActions()}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="bg-destructive/10 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
          {getErrorIcon()}
        </div>
        <CardTitle className="text-lg">Connection Error</CardTitle>
        <CardDescription>{getErrorMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderRetryInfo()}
        <div className="flex justify-center">{renderActions()}</div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook for handling network operations with retry logic
 */
export function useNetworkRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: ApiError) => void;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onError, onSuccess } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(
    async (forceRetry = false) => {
      if (isLoading && !forceRetry) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        setData(result);
        setRetryCount(0);
        onSuccess?.(result);
      } catch (err) {
        const apiError = ErrorHandler.handleError(err);
        setError(apiError);
        onError?.(apiError);

        // Auto-retry for network errors
        if (
          ErrorHandler.shouldRetry(apiError, retryCount) &&
          retryCount < maxRetries
        ) {
          const delay = ErrorHandler.getRetryDelay(retryCount);
          setRetryCount(prev => prev + 1);

          setTimeout(() => {
            execute(true);
          }, delay);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [operation, isLoading, retryCount, maxRetries, onError, onSuccess]
  );

  const retry = useCallback(() => {
    setRetryCount(0);
    execute(true);
  }, [execute]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setRetryCount(0);
    setIsLoading(false);
  }, []);

  return {
    execute,
    retry,
    reset,
    isLoading,
    error,
    data,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
}

/**
 * Network status indicator component
 */
export function NetworkStatus({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection message briefly
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (isOnline && !wasOffline) return null;

  return (
    <Alert
      className={cn(
        'fixed top-4 right-4 z-50 w-auto max-w-sm',
        isOnline
          ? 'border-green-500 bg-green-50'
          : 'border-destructive bg-destructive/5',
        className
      )}
    >
      {isOnline ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <WifiOff className="text-destructive h-4 w-4" />
      )}
      <AlertDescription className="text-sm">
        {isOnline ? (
          <span className="text-green-800">Connection restored</span>
        ) : (
          <span>You're offline. Some features may not work.</span>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Offline fallback component
 */
export function OfflineFallback({
  message = "You're currently offline",
  description = 'Please check your internet connection and try again.',
  onRetry,
  className,
}: {
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('text-center', className)}>
      <CardHeader>
        <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <WifiOff className="text-muted-foreground h-6 w-6" />
        </div>
        <CardTitle>{message}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

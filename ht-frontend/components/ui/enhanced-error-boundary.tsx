'use client';

// Enhanced error boundary components with better user experience

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { GlobalErrorHandler } from '@/lib/utils/global-error-handler';
import { useToast } from '@/lib/utils/toast';

interface ErrorInfo {
  componentStack: string;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'section' | 'component';
}

/**
 * Enhanced error boundary with better UX and retry functionality
 */
export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle the error using global error handler
    GlobalErrorHandler.handleComponentError(error, 'ErrorBoundary', {
      showToast: false, // Don't show toast as we're showing the error boundary UI
      logError: true,
    });
    
    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState(
      (prevState) => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined,
        retryCount: prevState.retryCount + 1,
      })
    );
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorId } = this.state;
    const subject = encodeURIComponent(`Error Report - ${errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\nError Message: ${error?.message}\n\nStack Trace:\n${error?.stack}\n\nPlease describe what you were doing when this error occurred:`
    );
    
    window.open(`mailto:support@healthtracker.com?subject=${subject}&body=${body}`);
  };

  renderErrorUI() {
    const { level = 'component', showDetails = false, maxRetries = 3 } = this.props;
    const { error, errorId, retryCount } = this.state;

    // Different UI based on error level
    if (level === 'component') {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center border border-destructive/20 rounded-lg bg-destructive/5">
          <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
          <p className="text-sm font-medium mb-2">Component Error</p>
          <p className="text-xs text-muted-foreground mb-3">
            This component encountered an error
          </p>
          {retryCount < maxRetries && (
            <Button onClick={this.handleRetry} size="sm" variant="outline">
              <RefreshCw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      );
    }

    if (level === 'section') {
      return (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <CardTitle className="text-lg">Section Unavailable</CardTitle>
            <CardDescription>
              This section encountered an error and couldn&apos;t load properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {showDetails && error && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {retryCount < maxRetries && (
                <Button onClick={this.handleRetry} size="sm" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                size="sm"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Page level error
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <CardDescription>
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorId && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Error ID: {errorId}
                </Badge>
              </div>
            )}

            {showDetails && error && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Error Details:
                </p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
              </div>
            )}

            {retryCount > 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Retry attempts: {retryCount}/{maxRetries}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {retryCount < maxRetries && (
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReportError}
                  className="flex-1"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>

            <Separator />
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If this problem persists, please{' '}
                <button
                  onClick={this.handleReportError}
                  className="underline hover:no-underline"
                >
                  contact support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

/**
 * Hook-based error handler for functional components
 */
export function useErrorHandler() {
  const toast = useToast();

  return React.useCallback((error: Error, context?: string) => {
    GlobalErrorHandler.handleComponentError(error, context || 'Component', {
      showToast: true,
      logError: true,
    });
  }, [toast]);
}

/**
 * Higher-order component that wraps a component with an enhanced error boundary
 */
export function withEnhancedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<EnhancedErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withEnhancedErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Async error boundary for handling promise rejections in components
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback,
  onError 
}: { 
  children: ReactNode; 
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
}) {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    GlobalErrorHandler.handleComponentError(error, 'AsyncErrorBoundary', {
      showToast: false,
      logError: true,
    });
    onError?.(error);
  }, [onError]);

  const retry = React.useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  if (error) {
    if (fallback) {
      return <>{fallback(error, retry)}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border border-destructive/20 rounded-lg bg-destructive/5">
        <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
        <h3 className="text-lg font-semibold mb-2">Async Operation Failed</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {error.message}
        </p>
        <Button onClick={retry} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Suspense error boundary for handling loading errors
 */
export function SuspenseErrorBoundary({
  children,
  fallback = <div>Loading...</div>,
  errorFallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}) {
  return (
    <EnhancedErrorBoundary 
      level="section"
      fallback={errorFallback}
    >
      <React.Suspense fallback={fallback}>
        {children}
      </React.Suspense>
    </EnhancedErrorBoundary>
  );
}
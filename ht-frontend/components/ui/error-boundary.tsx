'use client';

// ErrorBoundary component for catching and displaying React errors

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { handleReactError, type ErrorInfo } from '@/lib/errors/error-handler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    handleReactError(error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
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
              {this.props.showDetails && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    if (errorInfo) {
      handleReactError(error, errorInfo);
    } else {
      console.error('Unhandled error:', error);
    }
  };
}

/**
 * Higher-order component that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Lightweight error fallback component for smaller sections
 */
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  showRetry?: boolean;
}

export function ErrorFallback({ 
  error, 
  resetError, 
  message = 'Something went wrong',
  showRetry = true 
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {error && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {error.message}
        </p>
      )}
      {showRetry && resetError && (
        <Button onClick={resetError} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Async error boundary for handling promise rejections
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: (error: Error) => ReactNode;
}) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    if (fallback) {
      return <>{fallback(error)}</>;
    }
    
    return (
      <ErrorFallback 
        error={error} 
        resetError={() => setError(null)}
        message="An async operation failed"
      />
    );
  }

  return <>{children}</>;
}
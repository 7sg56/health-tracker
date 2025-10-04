'use client';

/**
 * Enhanced App Layout with comprehensive error handling
 * Demonstrates integration of global error handling, toast notifications, and error boundaries
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedErrorBoundary, SuspenseErrorBoundary } from '../ui/enhanced-error-boundary';
import { NetworkError, AuthenticationError } from '../ui/error-messages';
import { GlobalErrorHandler } from '../../lib/utils/global-error-handler';
import { useToast } from '../../lib/utils/toast';
import { useAuth } from '../../contexts/AuthContext';

interface EnhancedAppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  showSidebar?: boolean;
  className?: string;
}

/**
 * Enhanced app layout with error boundaries and global error handling
 */
export function EnhancedAppLayout({
  children,
  requireAuth = false,
  showSidebar = true,
  className = '',
}: EnhancedAppLayoutProps) {
  const router = useRouter();
  const toast = useToast();
  const { state: authState } = useAuth();

  // Initialize global error handlers
  useEffect(() => {
    GlobalErrorHandler.initialize();
  }, []);

  // Handle authentication errors
  useEffect(() => {
    if (requireAuth && !authState.isAuthenticated && !authState.isLoading) {
      toast.warning('Please sign in to continue', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/auth/login'),
        },
      });
    }
  }, [requireAuth, authState.isAuthenticated, authState.isLoading, toast, router]);

  // Show authentication error if required
  if (requireAuth && !authState.isAuthenticated && !authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthenticationError
          onLogin={() => router.push('/auth/login')}
          onGoHome={() => router.push('/')}
        />
      </div>
    );
  }

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedErrorBoundary
      level="page"
      maxRetries={3}
      resetOnPropsChange={true}
      resetKeys={[authState.isAuthenticated]}
      onError={(error, errorInfo) => {
        // Custom error handling for layout errors
        console.error('Layout error:', error, errorInfo);
        
        // Send to error tracking service in production
        if (process.env.NODE_ENV === 'production') {
          // Example: errorTrackingService.captureError(error, { context: 'AppLayout', ...errorInfo });
        }
      }}
    >
      <div className={`min-h-screen bg-background ${className}`}>
        {/* Network error boundary for handling connection issues */}
        <SuspenseErrorBoundary
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          }
          errorFallback={
            <NetworkError
              onRetry={() => window.location.reload()}
              onGoHome={() => router.push('/')}
            />
          }
        >
          {/* Main content with section-level error boundary */}
          <EnhancedErrorBoundary
            level="section"
            maxRetries={2}
            onError={(error) => {
              toast.error('A section of the page failed to load', {
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload(),
                },
              });
            }}
          >
            <main className="flex-1">
              {children}
            </main>
          </EnhancedErrorBoundary>
        </SuspenseErrorBoundary>
      </div>
    </EnhancedErrorBoundary>
  );
}

/**
 * Error boundary wrapper for individual pages
 */
export function PageErrorBoundary({ 
  children, 
  pageName 
}: { 
  children: React.ReactNode; 
  pageName: string;
}) {
  const toast = useToast();

  return (
    <EnhancedErrorBoundary
      level="page"
      maxRetries={2}
      onError={(error, errorInfo) => {
        console.error(`${pageName} page error:`, error, errorInfo);
        
        toast.error(`Error loading ${pageName} page`, {
          action: {
            label: 'Reload',
            onClick: () => window.location.reload(),
          },
        });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Form error boundary wrapper
 */
export function FormErrorBoundary({ 
  children, 
  formName 
}: { 
  children: React.ReactNode; 
  formName: string;
}) {
  const toast = useToast();

  return (
    <EnhancedErrorBoundary
      level="component"
      maxRetries={1}
      onError={(error) => {
        console.error(`${formName} form error:`, error);
        
        toast.error(`Error in ${formName} form`, {
          action: {
            label: 'Reset',
            onClick: () => window.location.reload(),
          },
        });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Data loading error boundary wrapper
 */
export function DataErrorBoundary({ 
  children, 
  dataType,
  onRetry 
}: { 
  children: React.ReactNode; 
  dataType: string;
  onRetry?: () => void;
}) {
  const toast = useToast();

  return (
    <EnhancedErrorBoundary
      level="section"
      maxRetries={3}
      onError={(error) => {
        console.error(`${dataType} data loading error:`, error);
        
        toast.error(`Failed to load ${dataType}`, {
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry,
          } : undefined,
        });
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Hook for handling component-level errors
 */
export function useComponentErrorHandler(componentName: string) {
  const toast = useToast();

  return React.useCallback((error: Error, context?: string) => {
    const fullContext = context ? `${componentName}: ${context}` : componentName;
    
    GlobalErrorHandler.handleComponentError(error, fullContext, {
      showToast: false, // We'll handle the toast manually
      logError: true,
    });

    toast.error(`Error in ${componentName}`, {
      action: {
        label: 'Refresh',
        onClick: () => window.location.reload(),
      },
    });
  }, [componentName, toast]);
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncErrorHandler() {
  const toast = useToast();

  return React.useCallback(async <T,>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      showSuccessToast?: boolean;
      successMessage?: string;
      showErrorToast?: boolean;
      retryCount?: number;
    } = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      showErrorToast = true,
      retryCount = 0,
    } = options;

    try {
      const result = await operation();
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      const apiError = GlobalErrorHandler.handleApiOperation(
        error,
        operationName,
        undefined,
        { showToast: showErrorToast }
      );

      // Retry logic
      if (retryCount > 0 && GlobalErrorHandler.shouldRetry(apiError)) {
        const delay = GlobalErrorHandler.getRetryDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return useAsyncErrorHandler()(
          operation,
          operationName,
          { ...options, retryCount: retryCount - 1 }
        );
      }

      return null;
    }
  }, [toast]);
}

/**
 * Example usage component showing error handling patterns
 */
export function ErrorHandlingExample() {
  const handleError = useComponentErrorHandler('ErrorHandlingExample');
  const handleAsync = useAsyncErrorHandler();

  const simulateError = () => {
    throw new Error('This is a simulated error');
  };

  const simulateAsyncError = async () => {
    await handleAsync(
      async () => {
        throw new Error('This is a simulated async error');
      },
      'Simulate Async Error',
      {
        showErrorToast: true,
        retryCount: 2,
      }
    );
  };

  const simulateSuccess = async () => {
    await handleAsync(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'Success!';
      },
      'Simulate Success',
      {
        showSuccessToast: true,
        successMessage: 'Operation completed successfully!',
      }
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Error Handling Examples</h3>
      <div className="flex gap-2">
        <button
          onClick={() => {
            try {
              simulateError();
            } catch (error) {
              handleError(error as Error, 'Button click');
            }
          }}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded"
        >
          Simulate Error
        </button>
        <button
          onClick={simulateAsyncError}
          className="px-4 py-2 bg-warning text-warning-foreground rounded"
        >
          Simulate Async Error
        </button>
        <button
          onClick={simulateSuccess}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Simulate Success
        </button>
      </div>
    </div>
  );
}
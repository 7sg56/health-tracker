// Global error handling utilities for the application

import { ApiError } from '@/lib/errors/api-error';
import { ErrorHandler } from '@/lib/errors/error-handler';
import { ToastService } from './toast';

export interface GlobalErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: string;
  fallbackMessage?: string;
}

/**
 * Global error handler that provides consistent error handling across the application
 */
export class GlobalErrorHandler {
  private static isInitialized = false;

  /**
   * Initialize global error handlers
   */
  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = ErrorHandler.handleError(event.reason);
      this.handleError(error, {
        context: 'Unhandled Promise Rejection',
        showToast: true,
        logError: true,
      });

      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      
      const error = ErrorHandler.handleError(event.error);
      this.handleError(error, {
        context: 'Uncaught Error',
        showToast: true,
        logError: true,
      });
    });

    // Handle resource loading errors (images, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        const resourceType = target.tagName?.toLowerCase();
        const resourceSrc = (target as any).src || (target as any).href;
        
        console.warn(`Failed to load ${resourceType}:`, resourceSrc);
        
        // Don't show toast for resource errors as they're usually not critical
        // but log them for debugging
        ErrorHandler.logError(
          new ApiError(0, `Failed to load ${resourceType}: ${resourceSrc}`),
          'Resource Loading Error'
        );
      }
    }, true);

    this.isInitialized = true;
  }

  /**
   * Handle any error with consistent behavior
   */
  static handleError(
    error: unknown,
    options: GlobalErrorHandlerOptions = {}
  ): ApiError {
    const {
      showToast = false,
      logError = true,
      context,
      fallbackMessage = 'An unexpected error occurred',
    } = options;

    // Convert to ApiError
    const apiError = ErrorHandler.handleError(error);

    // Log the error if requested
    if (logError) {
      ErrorHandler.logError(apiError, context);
    }

    // Show toast notification if requested
    if (showToast) {
      ToastService.handleApiError(apiError, context);
    }

    return apiError;
  }

  /**
   * Handle API operation errors with user-friendly messages
   */
  static handleApiOperation(
    error: unknown,
    operation: string,
    resource?: string,
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): ApiError {
    const context = resource 
      ? `${operation} ${resource}`
      : operation;

    return this.handleError(error, {
      ...options,
      context,
      showToast: true,
    });
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(
    error: unknown,
    formName: string,
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): ApiError {
    const apiError = this.handleError(error, {
      ...options,
      context: `${formName} Form Submission`,
      showToast: false, // Forms usually handle their own error display
    });

    // For validation errors, don't show toast as forms will display field errors
    if (apiError.status !== 400) {
      ToastService.handleApiError(apiError, `Failed to submit ${formName.toLowerCase()}`);
    }

    return apiError;
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(
    error: unknown,
    operation: string = 'authenticate',
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): ApiError {
    const apiError = this.handleError(error, {
      ...options,
      context: `Authentication: ${operation}`,
      showToast: true,
    });

    // For 401 errors, redirect to login after a delay
    if (apiError.status === 401) {
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }, 2000);
    }

    return apiError;
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(
    error: unknown,
    operation?: string,
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): ApiError {
    const context = operation ? `Network Error: ${operation}` : 'Network Error';
    
    const apiError = this.handleError(error, {
      ...options,
      context,
      showToast: false, // We'll use a specific network error toast
    });

    // Show network-specific error message
    ToastService.networkError(
      operation 
        ? `Network error during ${operation.toLowerCase()}. Please check your connection.`
        : undefined
    );

    return apiError;
  }

  /**
   * Create an error handler function for async operations
   */
  static createAsyncHandler(
    operation: string,
    resource?: string,
    options: GlobalErrorHandlerOptions = {}
  ) {
    return (error: unknown) => {
      return this.handleApiOperation(error, operation, resource, {
        showToast: true,
        logError: true,
        ...options,
      });
    };
  }

  /**
   * Wrap an async function with error handling
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operation: string,
    resource?: string,
    options: GlobalErrorHandlerOptions = {}
  ): (...args: T) => Promise<R | null> {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleApiOperation(error, operation, resource, {
          showToast: true,
          logError: true,
          ...options,
        });
        return null;
      }
    };
  }

  /**
   * Handle errors in React components
   */
  static handleComponentError(
    error: Error,
    componentName: string,
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): void {
    this.handleError(error, {
      ...options,
      context: `Component Error: ${componentName}`,
      showToast: true,
      logError: true,
    });
  }

  /**
   * Handle errors in React hooks
   */
  static handleHookError(
    error: unknown,
    hookName: string,
    options: Omit<GlobalErrorHandlerOptions, 'context'> = {}
  ): ApiError {
    return this.handleError(error, {
      ...options,
      context: `Hook Error: ${hookName}`,
      showToast: false, // Hooks usually don't show toasts directly
      logError: true,
    });
  }

  /**
   * Get user-friendly error message for display
   */
  static getUserMessage(error: unknown, fallback: string = 'Something went wrong'): string {
    const apiError = ErrorHandler.handleError(error);
    return apiError.getUserMessage() || fallback;
  }

  /**
   * Check if an error should be retried
   */
  static shouldRetry(error: unknown, attemptCount: number = 0): boolean {
    const apiError = ErrorHandler.handleError(error);
    return ErrorHandler.shouldRetry(apiError, attemptCount);
  }

  /**
   * Get retry delay for an error
   */
  static getRetryDelay(attemptCount: number): number {
    return ErrorHandler.getRetryDelay(attemptCount);
  }
}

// Convenience functions for common error handling patterns
export const handleError = GlobalErrorHandler.handleError.bind(GlobalErrorHandler);
export const handleApiError = GlobalErrorHandler.handleApiOperation.bind(GlobalErrorHandler);
export const handleFormError = GlobalErrorHandler.handleFormError.bind(GlobalErrorHandler);
export const handleAuthError = GlobalErrorHandler.handleAuthError.bind(GlobalErrorHandler);
export const handleNetworkError = GlobalErrorHandler.handleNetworkError.bind(GlobalErrorHandler);
export const wrapAsync = GlobalErrorHandler.wrapAsync.bind(GlobalErrorHandler);
export const getUserMessage = GlobalErrorHandler.getUserMessage.bind(GlobalErrorHandler);

// Initialize global error handlers when this module is imported
if (typeof window !== 'undefined') {
  GlobalErrorHandler.initialize();
}
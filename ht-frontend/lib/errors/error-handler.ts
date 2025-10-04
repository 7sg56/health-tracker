// Error handling utilities for consistent error management

import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  ServerError, 
  NetworkError
} from './api-error';

/**
 * Handles and categorizes different types of errors
 */
export class ErrorHandler {
  /**
   * Processes any error and converts it to an ApiError
   */
  static handleError(error: unknown): ApiError {
    // If it's already an ApiError, return as-is
    if (ApiError.isApiError(error)) {
      return error;
    }

    // Handle fetch/network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Unable to connect to the server. Please check your internet connection.');
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      return ApiError.fromError(error);
    }

    // Handle unknown error types
    return new ServerError('An unexpected error occurred');
  }

  /**
   * Handles fetch response errors and converts them to appropriate ApiError types
   */
  static async handleFetchError(response: Response): Promise<ApiError> {
    const status = response.status;

    try {
      const errorData = await response.json();
      
      // Create specific error types based on status code
      switch (status) {
        case 400:
          return new ValidationError(errorData.message, errorData.details);
        case 401:
          return new AuthenticationError(errorData.message);
        case 403:
          return new AuthorizationError(errorData.message);
        case 404:
          return new NotFoundError(errorData.message);
        case 409:
          return new ConflictError(errorData.message, errorData.details);
        case 500:
        default:
          return new ServerError(errorData.message);
      }
    } catch {
      // If we can't parse the error response, create a generic error
      return new ServerError(`Server error (${status}): ${response.statusText}`);
    }
  }

  /**
   * Logs errors with appropriate level based on error type
   */
  static logError(error: ApiError, context?: string): void {
    const logData = {
      ...error.toJSON(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Log based on error severity
    if (error.status >= 500) {
      console.error('Server Error:', logData);
    } else if (error.status >= 400) {
      console.warn('Client Error:', logData);
    } else {
      console.info('Network Error:', logData);
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production' && error.status >= 500) {
      // Example: Send to error tracking service
      // errorTrackingService.captureError(error, logData);
    }
  }

  /**
   * Determines if an error should trigger a retry
   */
  static shouldRetry(error: ApiError, attemptCount: number = 0): boolean {
    const maxRetries = 3;
    
    if (attemptCount >= maxRetries) {
      return false;
    }

    // Retry on network errors or server errors (5xx)
    return error.status === 0 || error.status >= 500;
  }

  /**
   * Gets retry delay in milliseconds with exponential backoff
   */
  static getRetryDelay(attemptCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    
    const delay = Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    return delay + jitter;
  }
}

/**
 * Utility function to safely execute async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const apiError = ErrorHandler.handleError(error);
    ErrorHandler.logError(apiError, context);
    return { success: false, error: apiError };
  }
}

/**
 * Utility function to execute operations with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context?: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: ApiError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = ErrorHandler.handleError(error);
      
      if (attempt === maxRetries || !ErrorHandler.shouldRetry(lastError, attempt)) {
        ErrorHandler.logError(lastError, context);
        throw lastError;
      }
      
      // Wait before retrying
      const delay = ErrorHandler.getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Creates a timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new NetworkError(timeoutMessage));
      }, timeoutMs);
    }),
  ]);
}

/**
 * Error boundary helper for React components
 */
export interface ErrorInfo {
  componentStack: string;
}

export function handleReactError(error: Error, errorInfo: ErrorInfo): void {
  const apiError = ErrorHandler.handleError(error);
  
  ErrorHandler.logError(apiError, `React Error: ${errorInfo.componentStack}`);
  
  // In production, you might want to send React errors to a service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureReactError(error, errorInfo);
  }
}
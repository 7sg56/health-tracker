// Toast notification utilities for consistent user feedback

import { toast } from 'sonner';
import { ApiError } from '@/lib/errors/api-error';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast notification service for consistent user feedback
 */
export class ToastService {
  /**
   * Show a success toast notification
   */
  static success(message: string, options?: ToastOptions): void {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Show an error toast notification
   */
  static error(message: string, options?: ToastOptions): void {
    toast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Show a warning toast notification
   */
  static warning(message: string, options?: ToastOptions): void {
    toast.warning(message, {
      duration: options?.duration || 5000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Show an info toast notification
   */
  static info(message: string, options?: ToastOptions): void {
    toast.info(message, {
      duration: options?.duration || 4000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Show a loading toast notification
   */
  static loading(message: string, options?: Omit<ToastOptions, 'duration'>): string | number {
    return toast.loading(message, {
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Dismiss a specific toast by ID
   */
  static dismiss(toastId: string | number): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toast notifications
   */
  static dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Show a promise-based toast that updates based on promise state
   */
  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ): Promise<T> {
    return toast.promise(promise, messages, {
      duration: options?.duration,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  /**
   * Handle API errors with appropriate toast notifications
   */
  static handleApiError(error: ApiError, context?: string): void {
    const userMessage = error.getUserMessage();
    const contextMessage = context ? `${context}: ${userMessage}` : userMessage;

    // Show different toast types based on error status
    if (error.status === 401) {
      this.warning(contextMessage, {
        action: {
          label: 'Login',
          onClick: () => {
            window.location.href = '/auth/login';
          },
        },
      });
    } else if (error.status === 403) {
      this.warning(contextMessage);
    } else if (error.status === 404) {
      this.info(contextMessage);
    } else if (error.status >= 500) {
      this.error(contextMessage, {
        action: {
          label: 'Retry',
          onClick: () => {
            window.location.reload();
          },
        },
      });
    } else {
      this.error(contextMessage);
    }
  }

  /**
   * Show success message for common operations
   */
  static operationSuccess(operation: string, resource?: string): void {
    const message = resource 
      ? `${resource} ${operation} successfully`
      : `${operation} completed successfully`;
    
    this.success(message);
  }

  /**
   * Show error message for common operations
   */
  static operationError(operation: string, resource?: string, error?: ApiError): void {
    if (error) {
      this.handleApiError(error, `Failed to ${operation.toLowerCase()} ${resource || 'item'}`);
    } else {
      const message = resource 
        ? `Failed to ${operation.toLowerCase()} ${resource}`
        : `${operation} failed`;
      
      this.error(message);
    }
  }

  /**
   * Show validation error toast with field details
   */
  static validationError(message: string = 'Please check the form for errors', fieldErrors?: Record<string, string>): void {
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const firstError = Object.values(fieldErrors)[0];
      this.error(`${message}: ${firstError}`);
    } else {
      this.error(message);
    }
  }

  /**
   * Show network error toast
   */
  static networkError(message: string = 'Network error. Please check your connection.'): void {
    this.error(message, {
      action: {
        label: 'Retry',
        onClick: () => {
          window.location.reload();
        },
      },
    });
  }

  /**
   * Show custom toast with custom styling
   */
  static custom(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: ToastOptions
  ): void {
    switch (type) {
      case 'success':
        this.success(message, options);
        break;
      case 'error':
        this.error(message, options);
        break;
      case 'warning':
        this.warning(message, options);
        break;
      case 'info':
      default:
        this.info(message, options);
        break;
    }
  }
}

// Convenience functions for common operations
export const showSuccess = ToastService.success.bind(ToastService);
export const showError = ToastService.error.bind(ToastService);
export const showWarning = ToastService.warning.bind(ToastService);
export const showInfo = ToastService.info.bind(ToastService);
export const showLoading = ToastService.loading.bind(ToastService);
export const dismissToast = ToastService.dismiss.bind(ToastService);
export const dismissAllToasts = ToastService.dismissAll.bind(ToastService);
export const handleApiError = ToastService.handleApiError.bind(ToastService);
export const showOperationSuccess = ToastService.operationSuccess.bind(ToastService);
export const showOperationError = ToastService.operationError.bind(ToastService);
export const showValidationError = ToastService.validationError.bind(ToastService);
export const showNetworkError = ToastService.networkError.bind(ToastService);

// Hook for using toast in components
export function useToast() {
  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
    handleApiError,
    operationSuccess: showOperationSuccess,
    operationError: showOperationError,
    validationError: showValidationError,
    networkError: showNetworkError,
    promise: ToastService.promise.bind(ToastService),
  };
}
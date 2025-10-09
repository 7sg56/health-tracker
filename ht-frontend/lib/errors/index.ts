// Export all error handling utilities

// API Error classes
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServerError,
  NetworkError,
  type ApiErrorDetails,
  type ApiErrorResponse,
} from './api-error';

// Error handling utilities
export {
  ErrorHandler,
  safeAsync,
  withRetry,
  withTimeout,
  handleReactError,
  type ErrorInfo,
} from './error-handler';

// Form error hooks
export {
  useFormErrors,
  useFormSubmission,
  useFieldValidation,
  useValidatedForm,
  useOptimisticUpdate,
} from './form-error-hooks';

// Toast utilities
export {
  ToastService,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissToast,
  dismissAllToasts,
  handleApiError as handleApiErrorToast,
  showOperationSuccess,
  showOperationError,
  showValidationError,
  showNetworkError,
  useToast,
  type ToastOptions,
} from '../utils/toast';

// Global error handling
export {
  GlobalErrorHandler,
  handleError,
  handleApiError,
  handleFormError,
  handleAuthError,
  handleNetworkError,
  wrapAsync,
  getUserMessage,
  type GlobalErrorHandlerOptions,
} from '../utils/global-error-handler';

// Error boundary components are available in components/ui/error-boundary.tsx and components/ui/enhanced-error-boundary.tsx
// Import them directly from there when needed:
// import { ErrorBoundary, useErrorHandler, withErrorBoundary, ErrorFallback, AsyncErrorBoundary } from '@/components/ui/error-boundary';
// import { EnhancedErrorBoundary, useErrorHandler, withEnhancedErrorBoundary, AsyncErrorBoundary, SuspenseErrorBoundary } from '@/components/ui/enhanced-error-boundary';

// Error message components are available in components/ui/error-messages.tsx
// Import them directly from there when needed:
// import { ErrorMessage, NetworkError, AuthenticationError, AuthorizationError, NotFoundError, ServerError, ValidationError, useErrorComponent } from '@/components/ui/error-messages';

'use client';

// Comprehensive error handling components index

// Re-export all error handling components for easy access
export {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  ErrorFallback,
  AsyncErrorBoundary,
} from './error-boundary';

export {
  EnhancedErrorBoundary,
  useErrorHandler as useEnhancedErrorHandler,
  withEnhancedErrorBoundary,
  AsyncErrorBoundary as EnhancedAsyncErrorBoundary,
  SuspenseErrorBoundary,
} from './enhanced-error-boundary';

export {
  ErrorMessage,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  ValidationError,
  useErrorComponent,
} from './error-messages';

export {
  FormErrorDisplay,
  FieldError,
  FormSuccessDisplay,
  ValidationSummary,
  ApiErrorDisplay,
  FieldValidationStatus,
  FormSubmissionStatus,
  useFormErrorDisplay,
} from './form-error-display';

export {
  NetworkErrorHandler,
  useNetworkRetry,
  NetworkStatus,
  OfflineFallback,
} from './network-error-handler';

export {
  LoadingErrorState,
  DataLoader,
  ImageWithFallback,
  SuspenseFallback,
  useLoadingErrorState,
} from './loading-error-states';

// Enhanced form field components
export {
  EnhancedInputField,
  EnhancedTextareaField,
  EnhancedSelectField,
  useFieldValidation,
} from './enhanced-form-field';

// Form error hooks
export {
  useFormErrors,
  useFormSubmission,
  useFieldValidation as useFormFieldValidation,
  useValidatedForm,
  useOptimisticUpdate,
} from '../../lib/errors/form-error-hooks';

// Error handling utilities
export {
  ApiError,
  ValidationError as ApiValidationError,
} from '../../lib/errors/api-error';
export {
  ErrorHandler,
  safeAsync,
  withRetry,
  withTimeout,
} from '../../lib/errors/error-handler';
export { GlobalErrorHandler } from '../../lib/utils/global-error-handler';

// Common error handling patterns and utilities
import React from 'react';
import { EnhancedErrorBoundary } from './enhanced-error-boundary';
import { LoadingErrorState } from './loading-error-states';
import { FormErrorDisplay } from './form-error-display';
import { NetworkErrorHandler } from './network-error-handler';

/**
 * Higher-order component that wraps any component with comprehensive error handling
 */
export function withComprehensiveErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    level?: 'page' | 'section' | 'component';
    showDetails?: boolean;
    maxRetries?: number;
    fallback?: React.ReactNode;
  } = {}
) {
  const {
    level = 'component',
    showDetails = false,
    maxRetries = 3,
    fallback,
  } = options;

  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary
      level={level}
      showDetails={showDetails}
      maxRetries={maxRetries}
      fallback={fallback}
    >
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withComprehensiveErrorHandling(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for comprehensive error handling in functional components
 */
export function useComprehensiveErrorHandling() {
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleError = React.useCallback((error: unknown) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    setError(errorObj);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = React.useCallback(
    async function <T>(operation: () => Promise<T>): Promise<T | null> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        return result;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
    hasError: !!error,
  };
}

/**
 * Error boundary provider for app-wide error handling
 */
interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export function ErrorBoundaryProvider({
  children,
  fallback,
  onError,
}: ErrorBoundaryProviderProps) {
  return (
    <EnhancedErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === 'development'}
      maxRetries={3}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

/**
 * Async operation wrapper with comprehensive error handling
 */
interface AsyncOperationWrapperProps<T> {
  operation: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function AsyncOperationWrapper<T>({
  operation,
  onSuccess,
  onError,
  loadingComponent,
  errorComponent,
  children,
}: AsyncOperationWrapperProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const executeOperation = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [operation, onSuccess, onError]);

  React.useEffect(() => {
    executeOperation();
  }, [executeOperation]);

  if (isLoading) {
    return <>{loadingComponent || <LoadingErrorState isLoading={true} />}</>;
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <LoadingErrorState error={error} onRetry={executeOperation} />
        )}
      </>
    );
  }

  if (data) {
    return <>{children(data)}</>;
  }

  return null;
}

/**
 * Form wrapper with comprehensive error handling
 */
interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  className?: string;
}

export function FormWrapper({
  children,
  onSubmit,
  className,
}: FormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<Error | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await onSubmit(e);
        setSubmitSuccess(true);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setSubmitError(errorObj);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      {submitError && (
        <FormErrorDisplay
          errors={submitError.message}
          showRetry={true}
          onRetry={() => setSubmitError(null)}
          className="mb-4"
        />
      )}

      {submitSuccess && (
        <FormErrorDisplay
          errors="Form submitted successfully!"
          variant="default"
          showDismiss={true}
          onDismiss={() => setSubmitSuccess(false)}
          className="mb-4"
        />
      )}

      <fieldset disabled={isSubmitting}>{children}</fieldset>
    </form>
  );
}

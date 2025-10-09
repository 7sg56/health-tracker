'use client';

// Form error display components with shadcn Alert integration

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  RefreshCw,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/errors/api-error';

interface FormErrorDisplayProps {
  errors: Record<string, string> | string[] | string | ApiError;
  title?: string;
  variant?: 'destructive' | 'default';
  showDismiss?: boolean;
  showRetry?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Comprehensive form error display component
 */
export function FormErrorDisplay({
  errors,
  title,
  variant = 'destructive',
  showDismiss = false,
  showRetry = false,
  onDismiss,
  onRetry,
  className,
}: FormErrorDisplayProps) {
  const errorList = React.useMemo(() => {
    if (!errors) return [];

    if (typeof errors === 'string') {
      return [errors];
    }

    if (errors instanceof ApiError) {
      if (errors.hasFieldErrors()) {
        return Object.values(errors.getFieldErrors());
      }
      return [errors.getUserMessage()];
    }

    if (Array.isArray(errors)) {
      return errors;
    }

    return Object.values(errors);
  }, [errors]);

  if (errorList.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (variant) {
      case 'default':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    if (title) return title;

    switch (variant) {
      case 'default':
        return 'Information';
      default:
        return errorList.length === 1
          ? 'Error'
          : 'Please correct the following errors:';
    }
  };

  return (
    <Alert variant={variant} className={className}>
      {getIcon()}
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between">
          <span>{getTitle()}</span>
          <div className="flex items-center gap-2">
            {showRetry && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
        </AlertTitle>
        <AlertDescription>
          {errorList.length === 1 ? (
            <p>{errorList[0]}</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {errorList.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 text-current">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}

/**
 * Field-specific error display component
 */
interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function FieldError({
  error,
  touched = true,
  showIcon = true,
  className,
}: FieldErrorProps) {
  if (!error || !touched) {
    return null;
  }

  return (
    <div
      className={cn(
        'text-destructive mt-1 flex items-center gap-2 text-sm',
        className
      )}
    >
      {showIcon && <AlertCircle className="h-3 w-3 flex-shrink-0" />}
      <span>{error}</span>
    </div>
  );
}

/**
 * Success message display for forms
 */
interface FormSuccessDisplayProps {
  message: string;
  title?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function FormSuccessDisplay({
  message,
  title = 'Success',
  showDismiss = false,
  onDismiss,
  className,
}: FormSuccessDisplayProps) {
  return (
    <Alert className={cn('border-green-500 bg-green-50', className)}>
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <div className="flex-1">
        <AlertTitle className="flex items-center justify-between text-green-800">
          <span>{title}</span>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </AlertTitle>
        <AlertDescription className="text-green-700">
          {message}
        </AlertDescription>
      </div>
    </Alert>
  );
}

/**
 * Form validation summary component
 */
interface ValidationSummaryProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  fieldLabels?: Record<string, string>;
  showFieldNames?: boolean;
  className?: string;
}

export function ValidationSummary({
  errors,
  touched,
  fieldLabels = {},
  showFieldNames = true,
  className,
}: ValidationSummaryProps) {
  const visibleErrors = React.useMemo(() => {
    return Object.entries(errors)
      .filter(([field]) => touched[field])
      .map(([field, error]) => ({
        field,
        error,
        label:
          fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1),
      }));
  }, [errors, touched, fieldLabels]);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>
          Please correct the following{' '}
          {visibleErrors.length === 1 ? 'error' : 'errors'}:
        </AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1">
            {visibleErrors.map(({ field, error, label }) => (
              <li key={field} className="flex items-start gap-2">
                <span className="mt-0.5 text-current">•</span>
                <span>
                  {showFieldNames && (
                    <strong className="font-medium">{label}:</strong>
                  )}{' '}
                  {error}
                </span>
              </li>
            ))}
          </ul>
        </AlertDescription>
      </div>
    </Alert>
  );
}

/**
 * API error display with field mapping
 */
interface ApiErrorDisplayProps {
  error: ApiError;
  fieldLabels?: Record<string, string>;
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ApiErrorDisplay({
  error,
  fieldLabels = {},
  showRetry = false,
  onRetry,
  onDismiss,
  className,
}: ApiErrorDisplayProps) {
  if (error.hasFieldErrors()) {
    const fieldErrors = error.getFieldErrors();
    const mappedErrors = Object.entries(fieldErrors).map(
      ([field, message]) => ({
        field,
        message,
        label:
          fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1),
      })
    );

    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <div className="flex-1">
          <AlertTitle className="flex items-center justify-between">
            <span>Validation Errors</span>
            <div className="flex items-center gap-2">
              {showRetry && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {mappedErrors.map(({ field, message, label }) => (
                <li key={field} className="flex items-start gap-2">
                  <span className="mt-0.5 text-current">•</span>
                  <span>
                    <strong className="font-medium">{label}:</strong> {message}
                  </span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  // General API error
  return (
    <FormErrorDisplay
      errors={error}
      showRetry={showRetry}
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

/**
 * Inline field validation status indicator
 */
interface FieldValidationStatusProps {
  isValid?: boolean | null;
  isValidating?: boolean;
  error?: string;
  showSuccess?: boolean;
  className?: string;
}

export function FieldValidationStatus({
  isValid,
  isValidating,
  error,
  showSuccess = true,
  className,
}: FieldValidationStatusProps) {
  if (isValidating) {
    return (
      <div
        className={cn(
          'text-muted-foreground flex items-center gap-2 text-sm',
          className
        )}
      >
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Validating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'text-destructive flex items-center gap-2 text-sm',
          className
        )}
      >
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    );
  }

  if (isValid && showSuccess) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-green-600',
          className
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        <span>Valid</span>
      </div>
    );
  }

  return null;
}

/**
 * Form submission status display
 */
interface FormSubmissionStatusProps {
  isSubmitting?: boolean;
  submitError?: ApiError | string;
  submitSuccess?: boolean;
  successMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function FormSubmissionStatus({
  isSubmitting,
  submitError,
  submitSuccess,
  successMessage = 'Form submitted successfully',
  onRetry,
  onDismiss,
  className,
}: FormSubmissionStatusProps) {
  if (isSubmitting) {
    return (
      <Alert className={cn('border-blue-200 bg-blue-50', className)}>
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          Submitting form...
        </AlertDescription>
      </Alert>
    );
  }

  if (submitError) {
    if (submitError instanceof ApiError) {
      return (
        <ApiErrorDisplay
          error={submitError}
          showRetry={!!onRetry}
          onRetry={onRetry}
          onDismiss={onDismiss}
          className={className}
        />
      );
    }

    return (
      <FormErrorDisplay
        errors={submitError}
        showRetry={!!onRetry}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
      />
    );
  }

  if (submitSuccess) {
    return (
      <FormSuccessDisplay
        message={successMessage}
        showDismiss={!!onDismiss}
        onDismiss={onDismiss}
        className={className}
      />
    );
  }

  return null;
}

/**
 * Hook for managing form error display state
 */
export function useFormErrorDisplay() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = React.useState<
    ApiError | string | null
  >(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setFieldError = React.useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = React.useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldTouched = React.useCallback(
    (field: string, isTouched = true) => {
      setTouched(prev => ({ ...prev, [field]: isTouched }));
    },
    []
  );

  const clearAllErrors = React.useCallback(() => {
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  const handleApiError = React.useCallback((error: ApiError) => {
    if (error.hasFieldErrors()) {
      const fieldErrors = error.getFieldErrors();
      setErrors(prev => ({ ...prev, ...fieldErrors }));

      // Mark all error fields as touched
      Object.keys(fieldErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
    } else {
      setSubmitError(error);
    }
  }, []);

  const reset = React.useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    errors,
    touched,
    submitError,
    submitSuccess,
    isSubmitting,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    clearAllErrors,
    handleApiError,
    setSubmitError,
    setSubmitSuccess,
    setIsSubmitting,
    reset,
    hasErrors: Object.keys(errors).length > 0 || !!submitError,
    hasVisibleErrors:
      Object.entries(errors).some(([field]) => touched[field]) || !!submitError,
  };
}

// Form error hooks for mapping backend validation errors to form fields

import { useState, useCallback, useRef } from 'react';
import { ApiError } from './api-error';
import { clearFieldError, hasErrors } from '../validations/utils';

/**
 * Hook for managing form errors with backend integration
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const touchedFields = useRef<Set<string>>(new Set());

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => clearFieldError(prev, field));
  }, []);

  const setApiErrors = useCallback((error: ApiError) => {
    if (error.hasFieldErrors()) {
      const fieldErrors = error.getFieldErrors();
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    } else {
      // Set general error if no field-specific errors
      setErrors(prev => ({ ...prev, general: error.getUserMessage() }));
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const markFieldTouched = useCallback((field: string) => {
    touchedFields.current.add(field);
  }, []);

  const isFieldTouched = useCallback((field: string): boolean => {
    return touchedFields.current.has(field);
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  const hasFieldError = useCallback((field: string): boolean => {
    return Boolean(errors[field]);
  }, [errors]);

  const hasAnyErrors = useCallback((): boolean => {
    return hasErrors(errors);
  }, [errors]);

  const resetForm = useCallback(() => {
    setErrors({});
    setIsSubmitting(false);
    touchedFields.current.clear();
  }, []);

  return {
    errors,
    isSubmitting,
    setIsSubmitting,
    setFieldError,
    clearError,
    setApiErrors,
    clearAllErrors,
    markFieldTouched,
    isFieldTouched,
    getFieldError,
    hasFieldError,
    hasAnyErrors,
    resetForm,
  };
}

/**
 * Hook for handling form submission with error management
 */
export function useFormSubmission<TFormData, TResult = unknown>() {
  const formErrors = useFormErrors();
  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    data?: TResult;
    message?: string;
  } | null>(null);

  const handleSubmit = useCallback(
    async (
      formData: TFormData,
      submitFn: (data: TFormData) => Promise<TResult>
    ): Promise<{ success: boolean; data?: TResult }> => {
      formErrors.setIsSubmitting(true);
      formErrors.clearAllErrors();
      setSubmitResult(null);

      try {
        const result = await submitFn(formData);
        
        setSubmitResult({
          success: true,
          data: result,
          message: 'Operation completed successfully',
        });

        formErrors.setIsSubmitting(false);
        return { success: true, data: result };
      } catch (error) {
        const apiError = error instanceof ApiError ? error : new ApiError(500, 'An error occurred');
        
        formErrors.setApiErrors(apiError);
        setSubmitResult({
          success: false,
          message: apiError.getUserMessage(),
        });

        formErrors.setIsSubmitting(false);
        return { success: false };
      }
    },
    [formErrors]
  );

  return {
    ...formErrors,
    submitResult,
    handleSubmit,
    clearSubmitResult: () => setSubmitResult(null),
  };
}

/**
 * Hook for real-time field validation
 */
export function useFieldValidation<T>(
  validator: (value: T) => { isValid: boolean; error?: string },
  debounceMs: number = 300
) {
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateField = useCallback(
    (value: T, immediate: boolean = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (immediate) {
        const result = validator(value);
        setFieldError(result.error);
        setIsValidating(false);
        return result;
      }

      setIsValidating(true);
      timeoutRef.current = setTimeout(() => {
        const result = validator(value);
        setFieldError(result.error);
        setIsValidating(false);
      }, debounceMs);

      return { isValid: true }; // Return optimistic result for debounced validation
    },
    [validator, debounceMs]
  );

  const clearValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setFieldError(undefined);
    setIsValidating(false);
  }, []);

  return {
    fieldError,
    isValidating,
    validateField,
    clearValidation,
    hasError: Boolean(fieldError),
  };
}

/**
 * Hook for managing form state with validation
 */
export function useValidatedForm<T extends Record<string, unknown>>(
  initialData: T,
  validator?: (data: T) => { isValid: boolean; errors: Record<string, string> }
) {
  const [formData, setFormData] = useState<T>(initialData);
  const formErrors = useFormErrors();

  const updateField = useCallback(
    (field: keyof T, value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      formErrors.markFieldTouched(field as string);
      
      // Clear field error when user starts typing
      if (formErrors.hasFieldError(field as string)) {
        formErrors.clearError(field as string);
      }
    },
    [formErrors]
  );

  const validateForm = useCallback((): boolean => {
    if (!validator) return true;

    const result = validator(formData);
    
    if (!result.isValid) {
      Object.entries(result.errors).forEach(([field, error]) => {
        formErrors.setFieldError(field, error);
      });
    }

    return result.isValid;
  }, [formData, validator, formErrors]);

  const resetValidatedForm = useCallback(() => {
    setFormData(initialData);
    formErrors.resetForm();
  }, [initialData, formErrors]);

  const setFormData_ = useCallback((data: T) => {
    setFormData(data);
  }, []);

  const { resetForm: _, ...formErrorsWithoutReset } = formErrors;

  return {
    formData,
    setFormData: setFormData_,
    updateField,
    validateForm,
    resetForm: resetValidatedForm,
    ...formErrorsWithoutReset,
  };
}

/**
 * Hook for handling optimistic updates with error rollback
 */
export function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const previousDataRef = useRef<T | null>(null);

  const performOptimisticUpdate = useCallback(
    async (
      newData: T,
      updateFn: () => Promise<T>
    ): Promise<{ success: boolean; data?: T; error?: ApiError }> => {
      // Store previous data for rollback
      previousDataRef.current = optimisticData;
      
      // Apply optimistic update
      setOptimisticData(newData);
      setIsOptimistic(true);

      try {
        const result = await updateFn();
        
        // Update with actual result
        setOptimisticData(result);
        setIsOptimistic(false);
        
        return { success: true, data: result };
      } catch (error) {
        // Rollback on error
        setOptimisticData(previousDataRef.current);
        setIsOptimistic(false);
        
        const apiError = error instanceof ApiError ? error : new ApiError(500, 'Update failed');
        return { success: false, error: apiError };
      }
    },
    [optimisticData]
  );

  const clearOptimisticData = useCallback(() => {
    setOptimisticData(null);
    setIsOptimistic(false);
    previousDataRef.current = null;
  }, []);

  return {
    optimisticData,
    isOptimistic,
    performOptimisticUpdate,
    clearOptimisticData,
  };
}
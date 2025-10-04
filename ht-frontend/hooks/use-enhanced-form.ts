// Enhanced form hooks with real-time validation and error handling

import React, { useCallback, useEffect, useState } from 'react';
import { 
  useForm, 
  UseFormReturn, 
  FieldValues, 
  FieldPath, 
  DefaultValues,
  SubmitHandler,
  SubmitErrorHandler
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError } from '@/lib/errors/api-error';
import { useToast } from '@/lib/utils/toast';
import { GlobalErrorHandler } from '@/lib/utils/global-error-handler';

interface EnhancedFormOptions<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  shouldFocusError?: boolean;
  delayError?: number;
  criteriaMode?: 'firstError' | 'all';
  shouldUseNativeValidation?: boolean;
  shouldUnregister?: boolean;
}

interface SubmissionOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  resetOnSuccess?: boolean;
  focusOnError?: boolean;
}

/**
 * Enhanced form hook with comprehensive validation and error handling
 */
export function useEnhancedForm<T extends FieldValues>(
  options: EnhancedFormOptions<T> = {}
) {
  const {
    schema,
    defaultValues,
    mode = 'onBlur',
    reValidateMode = 'onChange',
    shouldFocusError = true,
    ...formOptions
  } = options;

  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
    reValidateMode,
    shouldFocusError,
    ...formOptions,
  });

  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid, isDirty, touchedFields },
    reset,
    watch,
  } = form;

  /**
   * Handle API errors and map them to form fields
   */
  const handleApiError = useCallback((error: ApiError) => {
    if (error.hasFieldErrors()) {
      const fieldErrors = error.getFieldErrors();
      Object.entries(fieldErrors).forEach(([field, message]) => {
        setError(field as FieldPath<T>, {
          type: 'server',
          message,
        });
      });
    } else {
      setSubmitError(error.getUserMessage());
    }
  }, [setError]);

  /**
   * Enhanced submit handler with error handling and user feedback
   */
  const createSubmitHandler = useCallback(
    <TResult = unknown>(
      onSubmit: (data: T) => Promise<TResult>,
      options: SubmissionOptions = {}
    ) => {
      const {
        showSuccessToast = true,
        successMessage = 'Operation completed successfully',
        showErrorToast = true,
        resetOnSuccess = false,
        focusOnError = true,
      } = options;

      const submitHandler: SubmitHandler<T> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        clearErrors();

        try {
          const result = await onSubmit(data);
          
          setSubmitSuccess(true);
          
          if (showSuccessToast) {
            toast.success(successMessage);
          }
          
          if (resetOnSuccess) {
            reset();
          }
          
          return result;
        } catch (error) {
          const apiError = GlobalErrorHandler.handleFormError(
            error,
            'Form Submission',
            { showToast: showErrorToast }
          );
          
          handleApiError(apiError);
          
          if (focusOnError && shouldFocusError) {
            // Focus on first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
              const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
              element?.focus();
            }
          }
          
          throw apiError;
        } finally {
          setIsSubmitting(false);
        }
      };

      const errorHandler: SubmitErrorHandler<T> = (errors) => {
        console.warn('Form validation errors:', errors);
        
        if (showErrorToast) {
          const firstError = Object.values(errors)[0];
          if (firstError?.message) {
            toast.error(`Validation error: ${firstError.message}`);
          } else {
            toast.validationError();
          }
        }
      };

      return handleSubmit(submitHandler, errorHandler);
    },
    [
      handleSubmit,
      setError,
      clearErrors,
      reset,
      errors,
      shouldFocusError,
      toast,
      handleApiError,
    ]
  );

  /**
   * Clear all form errors and reset submission state
   */
  const clearAllErrors = useCallback(() => {
    clearErrors();
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [clearErrors]);

  /**
   * Reset form with optional new default values
   */
  const resetForm = useCallback((newDefaultValues?: DefaultValues<T>) => {
    reset(newDefaultValues || defaultValues);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [reset, defaultValues]);

  /**
   * Set field error manually
   */
  const setFieldError = useCallback((
    field: FieldPath<T>,
    message: string,
    type: string = 'manual'
  ) => {
    setError(field, { type, message });
  }, [setError]);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((field: FieldPath<T>) => {
    clearErrors(field);
  }, [clearErrors]);

  /**
   * Check if a specific field has an error
   */
  const hasFieldError = useCallback((field: FieldPath<T>): boolean => {
    return !!errors[field];
  }, [errors]);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback((field: FieldPath<T>): string | undefined => {
    return errors[field]?.message;
  }, [errors]);

  /**
   * Check if field is touched
   */
  const isFieldTouched = useCallback((field: FieldPath<T>): boolean => {
    return !!touchedFields[field];
  }, [touchedFields]);

  /**
   * Validate specific field
   */
  const validateField = useCallback(async (field: FieldPath<T>): Promise<boolean> => {
    const result = await form.trigger(field);
    return result;
  }, [form]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    const result = await form.trigger();
    return result;
  }, [form]);

  return {
    // React Hook Form instance
    form,
    
    // Form state
    errors,
    isValid,
    isDirty,
    isSubmitting,
    submitError,
    submitSuccess,
    touchedFields,
    
    // Enhanced methods
    createSubmitHandler,
    clearAllErrors,
    resetForm,
    setFieldError,
    clearFieldError,
    hasFieldError,
    getFieldError,
    isFieldTouched,
    validateField,
    validateForm,
    handleApiError,
    
    // Utilities
    watch,
  };
}

/**
 * Hook for real-time field validation
 */
export function useRealTimeValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: FieldPath<T>,
  validator?: (value: any) => Promise<{ isValid: boolean; error?: string }> | { isValid: boolean; error?: string },
  debounceMs = 300
) {
  const [isValidating, setIsValidating] = useState(false);
  const [customError, setCustomError] = useState<string | undefined>();
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const fieldValue = form.watch(field);
  const fieldError = form.formState.errors[field];
  const isTouched = form.formState.touchedFields[field];

  const validate = useCallback(async (value: any, immediate = false) => {
    if (!validator || !isTouched) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const performValidation = async () => {
      setIsValidating(true);
      try {
        const result = await validator(value);
        
        if (result.isValid) {
          setCustomError(undefined);
          form.clearErrors(field);
        } else {
          setCustomError(result.error);
          form.setError(field, {
            type: 'custom',
            message: result.error,
          });
        }
      } catch (error) {
        const errorMessage = 'Validation error';
        setCustomError(errorMessage);
        form.setError(field, {
          type: 'custom',
          message: errorMessage,
        });
      } finally {
        setIsValidating(false);
      }
    };

    if (immediate) {
      await performValidation();
    } else {
      debounceRef.current = setTimeout(performValidation, debounceMs);
    }
  }, [validator, field, form, isTouched, debounceMs]);

  useEffect(() => {
    if (isTouched && fieldValue !== undefined) {
      validate(fieldValue);
    }
  }, [fieldValue, validate, isTouched]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    isValidating,
    customError,
    hasError: !!fieldError || !!customError,
    error: fieldError?.message || customError,
    validate: (immediate?: boolean) => validate(fieldValue, immediate),
  };
}

/**
 * Hook for form submission with optimistic updates
 */
export function useOptimisticFormSubmission<T extends FieldValues, TResult = unknown>() {
  const [optimisticData, setOptimisticData] = useState<TResult | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const previousDataRef = React.useRef<TResult | null>(null);

  const submitWithOptimisticUpdate = useCallback(
    async (
      formData: T,
      submitFn: (data: T) => Promise<TResult>,
      optimisticResult: TResult
    ): Promise<{ success: boolean; data?: TResult; error?: ApiError }> => {
      // Store previous data for rollback
      previousDataRef.current = optimisticData;
      
      // Apply optimistic update
      setOptimisticData(optimisticResult);
      setIsOptimistic(true);

      try {
        const result = await submitFn(formData);
        
        // Update with actual result
        setOptimisticData(result);
        setIsOptimistic(false);
        
        return { success: true, data: result };
      } catch (error) {
        // Rollback on error
        setOptimisticData(previousDataRef.current);
        setIsOptimistic(false);
        
        const apiError = error instanceof ApiError ? error : new ApiError(500, 'Submission failed');
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
    submitWithOptimisticUpdate,
    clearOptimisticData,
  };
}

/**
 * Hook for managing form arrays with validation
 */
export function useFormArray<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: FieldPath<T>
) {
  const { control } = form;
  
  // This would typically use useFieldArray from react-hook-form
  // but for now we'll provide a basic implementation
  
  const addItem = useCallback((item: any) => {
    const currentValue = form.getValues(name) || [];
    form.setValue(name, [...currentValue, item] as any);
  }, [form, name]);

  const removeItem = useCallback((index: number) => {
    const currentValue = form.getValues(name) || [];
    const newValue = currentValue.filter((_: any, i: number) => i !== index);
    form.setValue(name, newValue as any);
  }, [form, name]);

  const updateItem = useCallback((index: number, item: any) => {
    const currentValue = form.getValues(name) || [];
    const newValue = [...currentValue];
    newValue[index] = item;
    form.setValue(name, newValue as any);
  }, [form, name]);

  return {
    addItem,
    removeItem,
    updateItem,
  };
}
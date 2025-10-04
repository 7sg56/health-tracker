'use client';

// Enhanced form field components with real-time validation and error feedback

import React, { useState, useCallback, useEffect } from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './form';

interface BaseFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  showValidationState?: boolean;
  isValidating?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

interface EnhancedInputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  validator?: (value: string | number) => Promise<{ isValid: boolean; error?: string }> | { isValid: boolean; error?: string };
  debounceMs?: number;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Enhanced input field with real-time validation
 */
export function EnhancedInputField({
  type = 'text',
  label,
  description,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  value,
  onChange,
  onBlur,
  error: externalError,
  validator,
  debounceMs = 300,
  showValidationState = true,
  isValidating: externalIsValidating = false,
  onValidationChange,
  min,
  max,
  step,
}: EnhancedInputFieldProps) {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const error = externalError || internalError;
  const validationState = isValid === null ? null : isValid && !error;

  const validateValue = useCallback(async (val: string | number, immediate = false) => {
    if (!validator || !isTouched) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const performValidation = async () => {
      setIsValidating(true);
      try {
        const result = await validator(val);
        setInternalError(result.error);
        setIsValid(result.isValid);
        onValidationChange?.(result.isValid, result.error);
      } catch (err) {
        setInternalError('Validation error');
        setIsValid(false);
        onValidationChange?.(false, 'Validation error');
      } finally {
        setIsValidating(false);
      }
    };

    if (immediate) {
      await performValidation();
    } else {
      debounceRef.current = setTimeout(performValidation, debounceMs);
    }
  }, [validator, debounceMs, isTouched, onValidationChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
    
    if (isTouched && error) {
      setInternalError(undefined);
    }
    
    validateValue(newValue);
  }, [onChange, type, validateValue, isTouched, error]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    onBlur?.();
    validateValue(value, true);
  }, [onBlur, validateValue, value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getValidationIcon = () => {
    if (!showValidationState || !isTouched) return null;
    
    if (isValidating || externalIsValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (validationState === true) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </FormLabel>
      )}
      <FormControl>
        <div className="relative">
          <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              validationState === true && "border-green-500 focus-visible:ring-green-500",
              showValidationState && "pr-10"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
          {showValidationState && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
        </div>
      </FormControl>
      {description && (
        <FormDescription>{description}</FormDescription>
      )}
      {error && (
        <FormMessage id={`${label}-error`} className="text-destructive">
          {error}
        </FormMessage>
      )}
    </FormItem>
  );
}

interface EnhancedTextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validator?: (value: string) => Promise<{ isValid: boolean; error?: string }> | { isValid: boolean; error?: string };
  debounceMs?: number;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

/**
 * Enhanced textarea field with real-time validation
 */
export function EnhancedTextareaField({
  label,
  description,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  value,
  onChange,
  onBlur,
  error: externalError,
  validator,
  debounceMs = 300,
  showValidationState = true,
  isValidating: externalIsValidating = false,
  onValidationChange,
  rows = 3,
  maxLength,
  showCharCount = false,
}: EnhancedTextareaFieldProps) {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const error = externalError || internalError;
  const validationState = isValid === null ? null : isValid && !error;
  const charCount = value.length;
  const isOverLimit = maxLength ? charCount > maxLength : false;

  const validateValue = useCallback(async (val: string, immediate = false) => {
    if (!validator || !isTouched) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const performValidation = async () => {
      setIsValidating(true);
      try {
        const result = await validator(val);
        setInternalError(result.error);
        setIsValid(result.isValid);
        onValidationChange?.(result.isValid, result.error);
      } catch (err) {
        setInternalError('Validation error');
        setIsValid(false);
        onValidationChange?.(false, 'Validation error');
      } finally {
        setIsValidating(false);
      }
    };

    if (immediate) {
      await performValidation();
    } else {
      debounceRef.current = setTimeout(performValidation, debounceMs);
    }
  }, [validator, debounceMs, isTouched, onValidationChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Prevent input if over max length
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    onChange(newValue);
    
    if (isTouched && error) {
      setInternalError(undefined);
    }
    
    validateValue(newValue);
  }, [onChange, validateValue, isTouched, error, maxLength]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    onBlur?.();
    validateValue(value, true);
  }, [onBlur, validateValue, value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </FormLabel>
      )}
      <FormControl>
        <div className="relative">
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            rows={rows}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              validationState === true && "border-green-500 focus-visible:ring-green-500",
              isOverLimit && "border-destructive"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
          {showValidationState && (isValidating || externalIsValidating) && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </FormControl>
      <div className="flex justify-between items-center">
        <div>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          {error && (
            <FormMessage id={`${label}-error`} className="text-destructive">
              {error}
            </FormMessage>
          )}
        </div>
        {showCharCount && maxLength && (
          <div className={cn(
            "text-xs text-muted-foreground",
            isOverLimit && "text-destructive"
          )}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    </FormItem>
  );
}

interface EnhancedSelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  validator?: (value: string) => Promise<{ isValid: boolean; error?: string }> | { isValid: boolean; error?: string };
}

/**
 * Enhanced select field with validation
 */
export function EnhancedSelectField({
  label,
  description,
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  className = '',
  value,
  onChange,
  onBlur,
  error: externalError,
  validator,
  showValidationState = true,
  isValidating: externalIsValidating = false,
  onValidationChange,
  options,
}: EnhancedSelectFieldProps) {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const error = externalError || internalError;
  const validationState = isValid === null ? null : isValid && !error;

  const validateValue = useCallback(async (val: string) => {
    if (!validator || !isTouched) return;

    try {
      const result = await validator(val);
      setInternalError(result.error);
      setIsValid(result.isValid);
      onValidationChange?.(result.isValid, result.error);
    } catch (err) {
      setInternalError('Validation error');
      setIsValid(false);
      onValidationChange?.(false, 'Validation error');
    }
  }, [validator, isTouched, onValidationChange]);

  const handleValueChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    if (isTouched && error) {
      setInternalError(undefined);
    }
    
    validateValue(newValue);
  }, [onChange, validateValue, isTouched, error]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    onBlur?.();
    validateValue(value);
  }, [onBlur, validateValue, value]);

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </FormLabel>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger
            onBlur={handleBlur}
            className={cn(
              error && "border-destructive focus:ring-destructive",
              validationState === true && "border-green-500 focus:ring-green-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <FormDescription>{description}</FormDescription>
      )}
      {error && (
        <FormMessage id={`${label}-error`} className="text-destructive">
          {error}
        </FormMessage>
      )}
    </FormItem>
  );
}

/**
 * Hook for managing form field validation state
 */
export function useFieldValidation<T>(
  validator?: (value: T) => Promise<{ isValid: boolean; error?: string }> | { isValid: boolean; error?: string },
  debounceMs = 300
) {
  const [error, setError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const validate = useCallback(async (value: T, immediate = false) => {
    if (!validator || !isTouched) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const performValidation = async () => {
      setIsValidating(true);
      try {
        const result = await validator(value);
        setError(result.error);
        setIsValid(result.isValid);
      } catch (err) {
        setError('Validation error');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (immediate) {
      await performValidation();
    } else {
      debounceRef.current = setTimeout(performValidation, debounceMs);
    }
  }, [validator, debounceMs, isTouched]);

  const clearValidation = useCallback(() => {
    setError(undefined);
    setIsValid(null);
    setIsValidating(false);
    setIsTouched(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const markTouched = useCallback(() => {
    setIsTouched(true);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    error,
    isValidating,
    isValid,
    isTouched,
    validate,
    clearValidation,
    markTouched,
  };
}
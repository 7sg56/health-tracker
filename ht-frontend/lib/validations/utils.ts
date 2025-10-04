import { z } from 'zod';

// Validation utility functions and error formatting

/**
 * Formats Zod validation errors into a flat object structure
 * suitable for form field error display
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
}

/**
 * Safely parses data with a Zod schema and returns formatted errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Validates a single field with its schema
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): { isValid: boolean; error?: string } {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues.find(err => 
        err.path.length === 0 || err.path[0] === fieldName
      );
      return {
        isValid: false,
        error: fieldError?.message || 'Invalid value',
      };
    }
    return {
      isValid: false,
      error: 'Validation error',
    };
  }
}

/**
 * Creates a partial schema for validating individual fields
 * Useful for real-time validation during form input
 */
export function createFieldValidator<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  return {
    validateField: (fieldName: string, value: unknown) => {
      try {
        // Create a temporary object to validate just this field
        const tempData = { [fieldName]: value };
        const result = schema.pick({ [fieldName]: true } as Record<string, true>).safeParse(tempData);
        
        if (result.success) {
          return { isValid: true };
        } else {
          const error = result.error.issues[0];
          return { isValid: false, error: error?.message || 'Invalid value' };
        }
      } catch {
        return { isValid: false, error: 'Validation error' };
      }
    },
    
    validatePartial: (data: Partial<z.infer<z.ZodObject<T>>>) => {
      const partialSchema = schema.partial();
      return safeValidate(partialSchema, data);
    },
  };
}

/**
 * Transforms backend API validation errors to frontend format
 * Maps backend field error format to frontend form errors
 */
export interface BackendFieldError {
  field: string;
  message: string;
}

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: BackendFieldError[];
  path: string;
}

export function formatBackendErrors(
  backendError: BackendErrorResponse
): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  if (backendError.details && Array.isArray(backendError.details)) {
    backendError.details.forEach((detail) => {
      formattedErrors[detail.field] = detail.message;
    });
  } else if (backendError.message) {
    // If no field-specific errors, use general message
    formattedErrors.general = backendError.message;
  }
  
  return formattedErrors;
}

/**
 * Combines frontend validation errors with backend errors
 * Frontend errors take precedence over backend errors for the same field
 */
export function combineErrors(
  frontendErrors: Record<string, string>,
  backendErrors: Record<string, string>
): Record<string, string> {
  return {
    ...backendErrors,
    ...frontendErrors,
  };
}

/**
 * Clears specific field errors from an error object
 */
export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
}

/**
 * Checks if an error object has any errors
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Gets the first error message from an error object
 */
export function getFirstError(errors: Record<string, string>): string | null {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}

/**
 * Validates numeric input and converts string to number
 * Useful for form inputs that receive string values but need numeric validation
 */
export function validateNumericInput(
  value: string | number,
  schema: z.ZodNumber
): { isValid: boolean; value?: number; error?: string } {
  // Convert string to number if needed
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if conversion resulted in NaN
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: 'Must be a valid number',
    };
  }
  
  // Validate with schema
  const result = validateField(schema, 'value', numericValue);
  
  return {
    isValid: result.isValid,
    value: result.isValid ? numericValue : undefined,
    error: result.error,
  };
}

/**
 * Debounced validation function for real-time form validation
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => { isValid: boolean; error?: string },
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (
    value: T,
    callback: (result: { isValid: boolean; error?: string }) => void
  ) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
} as const;

// Common validation constraints
export const validationConstraints = {
  username: { min: 3, max: 50 },
  email: { max: 150 },
  password: { min: 8 },
  foodItem: { min: 1, max: 100 },
  activity: { min: 1, max: 100 },
  waterAmount: { min: 0.1, max: 10.0 },
  calories: { min: 1, max: 5000 },
  caloriesBurned: { min: 0, max: 2000 },
  duration: { min: 1, max: 600 },
  pageSize: { min: 1, max: 100 },
} as const;
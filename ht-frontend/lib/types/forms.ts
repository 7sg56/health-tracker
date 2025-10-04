// Form validation and handling types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
}

export type FormAction<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: any }
  | { type: 'SET_ERROR'; field: string; message: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_TOUCHED'; field: string; touched: boolean }
  | { type: 'RESET_FORM'; initialData: T };

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form submission result
export interface FormSubmissionResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
}

// Generic form props interface
export interface BaseFormProps<T> {
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<FormSubmissionResult<any>>;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Form mode for create/edit forms
export type FormMode = 'create' | 'edit';

// Form validation schema type (for Zod integration)
export type ValidationSchema<T> = {
  parse: (data: unknown) => T;
  safeParse: (data: unknown) => { success: boolean; data?: T; error?: any };
};
// Export all validation schemas and utilities

// Authentication schemas
export {
  loginSchema,
  registerSchema,
  authValidationMessages,
  type LoginFormData,
  type RegisterFormData,
} from './auth';

// Health tracking schemas
export {
  waterIntakeSchema,
  foodIntakeSchema,
  workoutSchema,
  dateSchema,
  dateRangeSchema,
  paginationSchema,
  healthDataFiltersSchema,
  healthValidationMessages,
  type WaterIntakeFormData,
  type FoodIntakeFormData,
  type WorkoutFormData,
  type DateRangeData,
  type PaginationData,
  type HealthDataFiltersData,
} from './health';

// Validation utilities
export {
  formatZodErrors,
  safeValidate,
  validateField,
  createFieldValidator,
  formatBackendErrors,
  combineErrors,
  clearFieldError,
  hasErrors,
  getFirstError,
  validateNumericInput,
  createDebouncedValidator,
  validationPatterns,
  validationConstraints,
  type BackendFieldError,
  type BackendErrorResponse,
} from './utils';

// Form validators
export {
  authValidators,
  healthValidators,
  asyncValidators,
  validationPresets,
  compositeValidators,
  formValidators,
} from './form-validators';

// Re-export zod for convenience
export { z } from 'zod';

// Form validation utilities for real-time validation

import { z } from 'zod';
import { 
  loginSchema, 
  registerSchema 
} from './auth';
import { 
  waterIntakeSchema, 
  foodIntakeSchema, 
  workoutSchema 
} from './health';
import { createFieldValidator, validateNumericInput } from './utils';

/**
 * Create real-time validators for authentication forms
 */
export const authValidators = {
  // Login form validators
  login: createFieldValidator(loginSchema),
  
  // Register form validators  
  register: createFieldValidator(registerSchema),
  
  // Individual field validators for real-time validation
  username: (value: string) => {
    try {
      registerSchema.shape.username.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0]?.message || 'Invalid username' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  },
  
  email: (value: string) => {
    try {
      registerSchema.shape.email.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0]?.message || 'Invalid email' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  },
  
  password: (value: string) => {
    try {
      registerSchema.shape.password.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0]?.message || 'Invalid password' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  },
};

/**
 * Create real-time validators for health tracking forms
 */
export const healthValidators = {
  // Water intake validators
  waterIntake: createFieldValidator(waterIntakeSchema),
  
  waterAmount: (value: string | number) => {
    return validateNumericInput(value, waterIntakeSchema.shape.amountLtr);
  },
  
  // Food intake validators
  foodIntake: createFieldValidator(foodIntakeSchema),
  
  foodItem: (value: string) => {
    try {
      foodIntakeSchema.shape.foodItem.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0]?.message || 'Invalid food item' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  },
  
  calories: (value: string | number) => {
    return validateNumericInput(value, foodIntakeSchema.shape.calories);
  },
  
  // Workout validators
  workout: createFieldValidator(workoutSchema),
  
  activity: (value: string) => {
    try {
      workoutSchema.shape.activity.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.issues[0]?.message || 'Invalid activity' };
      }
      return { isValid: false, error: 'Validation error' };
    }
  },
  
  duration: (value: string | number) => {
    return validateNumericInput(value, workoutSchema.shape.durationMin);
  },
  
  caloriesBurned: (value: string | number) => {
    if (!value || value === '') {
      return { isValid: true }; // Optional field
    }
    return validateNumericInput(value, workoutSchema.shape.caloriesBurned!);
  },
};

/**
 * Async validators for server-side validation
 */
export const asyncValidators = {
  /**
   * Check if username is available (mock implementation)
   */
  checkUsernameAvailability: async (username: string): Promise<{ isValid: boolean; error?: string }> => {
    // First validate format
    const formatResult = authValidators.username(username);
    if (!formatResult.isValid) {
      return formatResult;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock server validation - in real app, this would call the API
    const unavailableUsernames = ['admin', 'test', 'user', 'demo'];
    if (unavailableUsernames.includes(username.toLowerCase())) {
      return { isValid: false, error: 'Username is already taken' };
    }
    
    return { isValid: true };
  },
  
  /**
   * Check if email is available (mock implementation)
   */
  checkEmailAvailability: async (email: string): Promise<{ isValid: boolean; error?: string }> => {
    // First validate format
    const formatResult = authValidators.email(email);
    if (!formatResult.isValid) {
      return formatResult;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock server validation - in real app, this would call the API
    const unavailableEmails = ['admin@example.com', 'test@example.com'];
    if (unavailableEmails.includes(email.toLowerCase())) {
      return { isValid: false, error: 'Email is already registered' };
    }
    
    return { isValid: true };
  },
  
  /**
   * Validate food item against nutrition database (mock implementation)
   */
  validateFoodItem: async (foodItem: string): Promise<{ isValid: boolean; error?: string; suggestions?: string[] }> => {
    // First validate format
    const formatResult = healthValidators.foodItem(foodItem);
    if (!formatResult.isValid) {
      return formatResult;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock food database validation
    const commonFoods = [
      'apple', 'banana', 'chicken breast', 'rice', 'broccoli', 
      'salmon', 'eggs', 'oatmeal', 'yogurt', 'spinach'
    ];
    
    const isCommonFood = commonFoods.some(food => 
      foodItem.toLowerCase().includes(food) || food.includes(foodItem.toLowerCase())
    );
    
    if (!isCommonFood && foodItem.length > 3) {
      const suggestions = commonFoods.filter(food => 
        food.includes(foodItem.toLowerCase().substring(0, 3))
      ).slice(0, 3);
      
      return { 
        isValid: true, // Still valid, just providing suggestions
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
    }
    
    return { isValid: true };
  },
};

/**
 * Validation presets for common form patterns
 */
export const validationPresets = {
  /**
   * Required field validator
   */
  required: (fieldName: string = 'Field') => (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },
  
  /**
   * Minimum length validator
   */
  minLength: (min: number, fieldName: string = 'Field') => (value: string) => {
    if (!value || value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { isValid: true };
  },
  
  /**
   * Maximum length validator
   */
  maxLength: (max: number, fieldName: string = 'Field') => (value: string) => {
    if (value && value.length > max) {
      return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
    }
    return { isValid: true };
  },
  
  /**
   * Numeric range validator
   */
  numericRange: (min: number, max: number, fieldName: string = 'Value') => (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (numValue < min || numValue > max) {
      return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }
    
    return { isValid: true };
  },
  
  /**
   * Pattern validator
   */
  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value || !regex.test(value)) {
      return { isValid: false, error: message };
    }
    return { isValid: true };
  },
  
  /**
   * Confirmation field validator (e.g., password confirmation)
   */
  confirmation: (originalValue: string, fieldName: string = 'Field') => (value: string) => {
    if (value !== originalValue) {
      return { isValid: false, error: `${fieldName} confirmation does not match` };
    }
    return { isValid: true };
  },
};

/**
 * Composite validators that combine multiple validation rules
 */
export const compositeValidators = {
  /**
   * Create a validator that runs multiple validators in sequence
   */
  combine: (...validators: Array<(value: any) => { isValid: boolean; error?: string }>) => {
    return (value: any) => {
      for (const validator of validators) {
        const result = validator(value);
        if (!result.isValid) {
          return result;
        }
      }
      return { isValid: true };
    };
  },
  
  /**
   * Create an async validator that runs multiple async validators in sequence
   */
  combineAsync: (...validators: Array<(value: any) => Promise<{ isValid: boolean; error?: string }>>) => {
    return async (value: any) => {
      for (const validator of validators) {
        const result = await validator(value);
        if (!result.isValid) {
          return result;
        }
      }
      return { isValid: true };
    };
  },
  
  /**
   * Create a conditional validator
   */
  conditional: (
    condition: (value: any) => boolean,
    validator: (value: any) => { isValid: boolean; error?: string }
  ) => {
    return (value: any) => {
      if (condition(value)) {
        return validator(value);
      }
      return { isValid: true };
    };
  },
};

/**
 * Form-level validators for complex validation scenarios
 */
export const formValidators = {
  /**
   * Validate registration form with cross-field validation
   */
  registrationForm: (formData: { username: string; email: string; password: string; confirmPassword?: string }) => {
    const errors: Record<string, string> = {};
    
    // Validate individual fields
    const usernameResult = authValidators.username(formData.username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error!;
    }
    
    const emailResult = authValidators.email(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    }
    
    const passwordResult = authValidators.password(formData.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error!;
    }
    
    // Cross-field validation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  
  /**
   * Validate workout form with conditional validation
   */
  workoutForm: (formData: { activity: string; durationMin: number; caloriesBurned?: number }) => {
    const errors: Record<string, string> = {};
    
    const activityResult = healthValidators.activity(formData.activity);
    if (!activityResult.isValid) {
      errors.activity = activityResult.error!;
    }
    
    const durationResult = healthValidators.duration(formData.durationMin);
    if (!durationResult.isValid) {
      errors.durationMin = durationResult.error!;
    }
    
    if (formData.caloriesBurned !== undefined) {
      const caloriesResult = healthValidators.caloriesBurned(formData.caloriesBurned);
      if (!caloriesResult.isValid) {
        errors.caloriesBurned = caloriesResult.error!;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
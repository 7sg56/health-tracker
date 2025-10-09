import { z } from 'zod';

// Authentication validation schemas matching backend constraints

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .max(150, 'Email must be less than 150 characters')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Custom validation messages
export const authValidationMessages = {
  username: {
    required: 'Username is required',
    minLength: 'Username must be at least 3 characters',
    maxLength: 'Username must be less than 50 characters',
    pattern: 'Username can only contain letters, numbers, and underscores',
  },
  email: {
    required: 'Email is required',
    invalid: 'Invalid email format',
    maxLength: 'Email must be less than 150 characters',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    pattern:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  },
} as const;

import { z } from 'zod';

// Profile form validation schema
export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  email: z
    .string()
    .email('Invalid email format')
    .max(150, 'Email must be less than 150 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  healthGoal: z.string().min(1, 'Please select a health goal'),
});

// Settings form validation schema
export const settingsFormSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    reminders: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private']),
    dataSharing: z.boolean(),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    timezone: z.string(),
  }),
});

// Type inference from schemas
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type SettingsFormData = z.infer<typeof settingsFormSchema>;

// Health goal options
export const healthGoalOptions = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_weight', label: 'Gain Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'improve_fitness', label: 'Improve Fitness' },
  { value: 'general_health', label: 'General Health' },
] as const;

// Language options
export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
] as const;

// Timezone options
export const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
] as const;

// Custom validation messages
export const profileValidationMessages = {
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
  bio: {
    maxLength: 'Bio must be less than 500 characters',
  },
  healthGoal: {
    required: 'Please select a health goal',
  },
} as const;

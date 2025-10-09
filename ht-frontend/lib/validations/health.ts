import { z } from 'zod';

// Health tracking validation schemas matching backend constraints

export const waterIntakeSchema = z.object({
  amountLtr: z
    .number({
      message: 'Water amount must be a number',
    })
    .min(0.1, 'Amount must be at least 0.1 liters')
    .max(10.0, 'Amount must be less than 10.0 liters')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
});

export const foodIntakeSchema = z.object({
  foodItem: z
    .string()
    .min(1, 'Food item is required')
    .max(100, 'Food item must be less than 100 characters')
    .trim(),
  calories: z
    .number({
      message: 'Calories must be a number',
    })
    .int('Calories must be a whole number')
    .min(1, 'Calories must be at least 1')
    .max(5000, 'Calories must be less than 5000'),
});

export const workoutSchema = z.object({
  activity: z
    .string()
    .min(1, 'Activity is required')
    .max(100, 'Activity must be less than 100 characters')
    .trim(),
  durationMin: z
    .number({
      message: 'Duration must be a number',
    })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration must be less than 600 minutes'),
  caloriesBurned: z
    .number({
      message: 'Calories burned must be a number',
    })
    .int('Calories burned must be a whole number')
    .min(0, 'Calories burned cannot be negative')
    .max(2000, 'Calories burned must be less than 2000')
    .optional(),
});

// Date validation schema for filtering
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(date => {
    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return parsedDate <= today;
  }, 'Date cannot be in the future');

export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    data => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Page must be a whole number')
    .min(0, 'Page must be 0 or greater')
    .default(0),
  size: z
    .number()
    .int('Size must be a whole number')
    .min(1, 'Size must be at least 1')
    .max(100, 'Size must be 100 or less')
    .default(10),
  sort: z.enum(['date', 'amount', 'calories', 'duration']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Combined filter schemas for health data
export const healthDataFiltersSchema = z
  .object({
    ...paginationSchema.shape,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

// Type inference from schemas
export type WaterIntakeFormData = z.infer<typeof waterIntakeSchema>;
export type FoodIntakeFormData = z.infer<typeof foodIntakeSchema>;
export type WorkoutFormData = z.infer<typeof workoutSchema>;
export type DateRangeData = z.infer<typeof dateRangeSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type HealthDataFiltersData = z.infer<typeof healthDataFiltersSchema>;

// Custom validation messages
export const healthValidationMessages = {
  water: {
    amountRequired: 'Water amount is required',
    amountType: 'Water amount must be a number',
    amountMin: 'Amount must be at least 0.1 liters',
    amountMax: 'Amount must be less than 10.0 liters',
    amountPrecision: 'Amount can have at most 2 decimal places',
  },
  food: {
    itemRequired: 'Food item is required',
    itemMaxLength: 'Food item must be less than 100 characters',
    caloriesRequired: 'Calories are required',
    caloriesType: 'Calories must be a number',
    caloriesInt: 'Calories must be a whole number',
    caloriesMin: 'Calories must be at least 1',
    caloriesMax: 'Calories must be less than 5000',
  },
  workout: {
    activityRequired: 'Activity is required',
    activityMaxLength: 'Activity must be less than 100 characters',
    durationRequired: 'Duration is required',
    durationType: 'Duration must be a number',
    durationInt: 'Duration must be a whole number',
    durationMin: 'Duration must be at least 1 minute',
    durationMax: 'Duration must be less than 600 minutes',
    caloriesType: 'Calories burned must be a number',
    caloriesInt: 'Calories burned must be a whole number',
    caloriesMin: 'Calories burned cannot be negative',
    caloriesMax: 'Calories burned must be less than 2000',
  },
  date: {
    format: 'Date must be in YYYY-MM-DD format',
    future: 'Date cannot be in the future',
    range: 'Start date must be before or equal to end date',
  },
  pagination: {
    pageType: 'Page must be a whole number',
    pageMin: 'Page must be 0 or greater',
    sizeType: 'Size must be a whole number',
    sizeMin: 'Size must be at least 1',
    sizeMax: 'Size must be 100 or less',
  },
} as const;

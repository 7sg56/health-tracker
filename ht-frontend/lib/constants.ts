// Application Constants

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Health Tracker',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  description: 'Track your daily health metrics including water intake, food consumption, and workouts.',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile',
    },
    water: '/api/water',
    food: '/api/food',
    workouts: '/api/workouts',
    healthIndex: '/api/health-index',
  },
} as const;

export const VALIDATION_LIMITS = {
  water: {
    min: 0.1,
    max: 10.0,
  },
  food: {
    itemLength: { min: 1, max: 100 },
    calories: { min: 1, max: 5000 },
  },
  workout: {
    activityLength: { min: 1, max: 100 },
    duration: { min: 1, max: 600 },
    calories: { min: 0, max: 2000 },
  },
  auth: {
    username: { min: 3, max: 50 },
    email: { max: 150 },
    password: { min: 8 },
  },
} as const;

export const PAGINATION_DEFAULTS = {
  pageSize: 10,
  maxPageSize: 100,
} as const;

export const HEALTH_SCORE_RANGES = {
  excellent: { min: 80, max: 100, color: 'health-success' },
  good: { min: 60, max: 79, color: 'health-primary' },
  fair: { min: 40, max: 59, color: 'health-warning' },
  poor: { min: 0, max: 39, color: 'health-danger' },
} as const;
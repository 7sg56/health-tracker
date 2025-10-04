// Health Tracking Types
export interface WaterIntake {
  id: number;
  amountLtr: number;
  date: string;
  createdAt: string;
}

export interface WaterIntakeRequest {
  amountLtr: number;
}

export interface FoodIntake {
  id: number;
  foodItem: string;
  calories: number;
  date: string;
  createdAt: string;
}

export interface FoodIntakeRequest {
  foodItem: string;
  calories: number;
}

export interface Workout {
  id: number;
  activity: string;
  durationMin: number;
  caloriesBurned?: number;
  date: string;
  createdAt: string;
}

export interface WorkoutRequest {
  activity: string;
  durationMin: number;
  caloriesBurned?: number;
}

export interface DailyHealthIndex {
  id: number;
  date: string;
  healthScore: number;
  createdAt: string;
}

// Health data state management types
export interface HealthState {
  waterIntakes: WaterIntake[];
  foodIntakes: FoodIntake[];
  workouts: Workout[];
  healthScore: DailyHealthIndex | null;
  isLoading: boolean;
  error: string | null;
}

export type HealthAction =
  | { type: 'HEALTH_LOADING'; payload: boolean }
  | { type: 'HEALTH_ERROR'; payload: string }
  | { type: 'HEALTH_RESET_ERROR' }
  | { type: 'SET_WATER_INTAKES'; payload: WaterIntake[] }
  | { type: 'ADD_WATER_INTAKE'; payload: WaterIntake }
  | { type: 'REMOVE_WATER_INTAKE'; payload: number }
  | { type: 'SET_FOOD_INTAKES'; payload: FoodIntake[] }
  | { type: 'ADD_FOOD_INTAKE'; payload: FoodIntake }
  | { type: 'UPDATE_FOOD_INTAKE'; payload: FoodIntake }
  | { type: 'REMOVE_FOOD_INTAKE'; payload: number }
  | { type: 'SET_WORKOUTS'; payload: Workout[] }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'UPDATE_WORKOUT'; payload: Workout }
  | { type: 'REMOVE_WORKOUT'; payload: number }
  | { type: 'SET_HEALTH_SCORE'; payload: DailyHealthIndex | null };

// Health score breakdown interface
export interface HealthScoreBreakdown {
  water: number;
  food: number;
  exercise: number;
  total: number;
}

// Date range filtering
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Health data filters
export interface HealthDataFilters {
  dateRange?: DateRange;
  sortBy?: 'date' | 'amount' | 'calories' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

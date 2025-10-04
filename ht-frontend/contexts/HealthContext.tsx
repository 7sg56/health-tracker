'use client';

/**
 * Health Data Context
 * Provides health tracking state management and actions throughout the app
 * Includes data synchronization, caching, and optimistic updates
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { HealthService } from '../lib/api/health';
import { HealthScoreService } from '../lib/api/health-score';
import { 
  HealthState, 
  HealthAction,
  WaterIntake,
  WaterIntakeRequest,
  FoodIntake,
  FoodIntakeRequest,
  Workout,
  WorkoutRequest,
  DailyHealthIndex
} from '../lib/types/health';
import { useAuth } from './AuthContext';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

// Enhanced health state with caching
interface EnhancedHealthState extends HealthState {
  cache: {
    waterIntakes: CacheEntry<WaterIntake[]> | null;
    foodIntakes: CacheEntry<FoodIntake[]> | null;
    workouts: CacheEntry<Workout[]> | null;
    healthScore: CacheEntry<DailyHealthIndex | null> | null;
  };
  lastSyncTime: number | null;
  syncInProgress: boolean;
  optimisticUpdates: {
    waterIntakes: WaterIntake[];
    foodIntakes: FoodIntake[];
    workouts: Workout[];
  };
}

// Initial health state
const initialHealthState: EnhancedHealthState = {
  waterIntakes: [],
  foodIntakes: [],
  workouts: [],
  healthScore: null,
  isLoading: false,
  error: null,
  cache: {
    waterIntakes: null,
    foodIntakes: null,
    workouts: null,
    healthScore: null,
  },
  lastSyncTime: null,
  syncInProgress: false,
  optimisticUpdates: {
    waterIntakes: [],
    foodIntakes: [],
    workouts: [],
  },
};

// Enhanced health actions
type EnhancedHealthAction = HealthAction 
  | { type: 'SET_CACHE'; payload: { key: keyof EnhancedHealthState['cache']; data: any } }
  | { type: 'INVALIDATE_CACHE'; payload?: keyof EnhancedHealthState['cache'] }
  | { type: 'SET_SYNC_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC_TIME'; payload: number }
  | { type: 'ADD_OPTIMISTIC_UPDATE'; payload: { type: 'water' | 'food' | 'workout'; data: any } }
  | { type: 'REMOVE_OPTIMISTIC_UPDATE'; payload: { type: 'water' | 'food' | 'workout'; id: number } }
  | { type: 'CLEAR_OPTIMISTIC_UPDATES' };

// Helper function to create cache entry
function createCacheEntry<T>(data: T): CacheEntry<T> {
  return {
    data,
    timestamp: Date.now(),
    isStale: false,
  };
}

// Helper function to check if cache is valid
function isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
  if (!cache) return false;
  const age = Date.now() - cache.timestamp;
  return age < CACHE_DURATION && !cache.isStale;
}

// Health reducer
function healthReducer(state: EnhancedHealthState, action: EnhancedHealthAction): EnhancedHealthState {
  switch (action.type) {
    case 'HEALTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'HEALTH_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'HEALTH_RESET_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_WATER_INTAKES':
      return {
        ...state,
        waterIntakes: action.payload,
        cache: {
          ...state.cache,
          waterIntakes: createCacheEntry(action.payload),
        },
      };

    case 'ADD_WATER_INTAKE':
      const newWaterIntakes = [action.payload, ...state.waterIntakes];
      return {
        ...state,
        waterIntakes: newWaterIntakes,
        cache: {
          ...state.cache,
          waterIntakes: createCacheEntry(newWaterIntakes),
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          waterIntakes: state.optimisticUpdates.waterIntakes.filter(item => item.id !== action.payload.id),
        },
      };

    case 'REMOVE_WATER_INTAKE':
      const filteredWaterIntakes = state.waterIntakes.filter(item => item.id !== action.payload);
      return {
        ...state,
        waterIntakes: filteredWaterIntakes,
        cache: {
          ...state.cache,
          waterIntakes: createCacheEntry(filteredWaterIntakes),
        },
      };

    case 'SET_FOOD_INTAKES':
      return {
        ...state,
        foodIntakes: action.payload,
        cache: {
          ...state.cache,
          foodIntakes: createCacheEntry(action.payload),
        },
      };

    case 'ADD_FOOD_INTAKE':
      const newFoodIntakes = [action.payload, ...state.foodIntakes];
      return {
        ...state,
        foodIntakes: newFoodIntakes,
        cache: {
          ...state.cache,
          foodIntakes: createCacheEntry(newFoodIntakes),
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          foodIntakes: state.optimisticUpdates.foodIntakes.filter(item => item.id !== action.payload.id),
        },
      };

    case 'UPDATE_FOOD_INTAKE':
      const updatedFoodIntakes = state.foodIntakes.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      return {
        ...state,
        foodIntakes: updatedFoodIntakes,
        cache: {
          ...state.cache,
          foodIntakes: createCacheEntry(updatedFoodIntakes),
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          foodIntakes: state.optimisticUpdates.foodIntakes.filter(item => item.id !== action.payload.id),
        },
      };

    case 'REMOVE_FOOD_INTAKE':
      const filteredFoodIntakes = state.foodIntakes.filter(item => item.id !== action.payload);
      return {
        ...state,
        foodIntakes: filteredFoodIntakes,
        cache: {
          ...state.cache,
          foodIntakes: createCacheEntry(filteredFoodIntakes),
        },
      };

    case 'SET_WORKOUTS':
      return {
        ...state,
        workouts: action.payload,
        cache: {
          ...state.cache,
          workouts: createCacheEntry(action.payload),
        },
      };

    case 'ADD_WORKOUT':
      const newWorkouts = [action.payload, ...state.workouts];
      return {
        ...state,
        workouts: newWorkouts,
        cache: {
          ...state.cache,
          workouts: createCacheEntry(newWorkouts),
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          workouts: state.optimisticUpdates.workouts.filter(item => item.id !== action.payload.id),
        },
      };

    case 'UPDATE_WORKOUT':
      const updatedWorkouts = state.workouts.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      return {
        ...state,
        workouts: updatedWorkouts,
        cache: {
          ...state.cache,
          workouts: createCacheEntry(updatedWorkouts),
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          workouts: state.optimisticUpdates.workouts.filter(item => item.id !== action.payload.id),
        },
      };

    case 'REMOVE_WORKOUT':
      const filteredWorkouts = state.workouts.filter(item => item.id !== action.payload);
      return {
        ...state,
        workouts: filteredWorkouts,
        cache: {
          ...state.cache,
          workouts: createCacheEntry(filteredWorkouts),
        },
      };

    case 'SET_HEALTH_SCORE':
      return {
        ...state,
        healthScore: action.payload,
        cache: {
          ...state.cache,
          healthScore: createCacheEntry(action.payload),
        },
      };

    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: createCacheEntry(action.payload.data),
        },
      };

    case 'INVALIDATE_CACHE':
      if (action.payload) {
        return {
          ...state,
          cache: {
            ...state.cache,
            [action.payload]: state.cache[action.payload] ? 
              { ...state.cache[action.payload]!, isStale: true } : null,
          },
        };
      } else {
        // Invalidate all cache
        return {
          ...state,
          cache: {
            waterIntakes: state.cache.waterIntakes ? { ...state.cache.waterIntakes, isStale: true } : null,
            foodIntakes: state.cache.foodIntakes ? { ...state.cache.foodIntakes, isStale: true } : null,
            workouts: state.cache.workouts ? { ...state.cache.workouts, isStale: true } : null,
            healthScore: state.cache.healthScore ? { ...state.cache.healthScore, isStale: true } : null,
          },
        };
      }

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncInProgress: action.payload,
      };

    case 'SET_LAST_SYNC_TIME':
      return {
        ...state,
        lastSyncTime: action.payload,
      };

    case 'ADD_OPTIMISTIC_UPDATE':
      const { type, data } = action.payload;
      return {
        ...state,
        optimisticUpdates: {
          ...state.optimisticUpdates,
          [type === 'water' ? 'waterIntakes' : type === 'food' ? 'foodIntakes' : 'workouts']: [
            ...state.optimisticUpdates[type === 'water' ? 'waterIntakes' : type === 'food' ? 'foodIntakes' : 'workouts'],
            data
          ],
        },
      };

    case 'REMOVE_OPTIMISTIC_UPDATE':
      const { type: removeType, id } = action.payload;
      const key = removeType === 'water' ? 'waterIntakes' : removeType === 'food' ? 'foodIntakes' : 'workouts';
      return {
        ...state,
        optimisticUpdates: {
          ...state.optimisticUpdates,
          [key]: state.optimisticUpdates[key].filter(item => item.id !== id),
        },
      };

    case 'CLEAR_OPTIMISTIC_UPDATES':
      return {
        ...state,
        optimisticUpdates: {
          waterIntakes: [],
          foodIntakes: [],
          workouts: [],
        },
      };

    default:
      return state;
  }
}

// Health context type
interface HealthContextType {
  state: EnhancedHealthState;
  
  // Water intake methods
  addWaterIntake: (data: WaterIntakeRequest, optimistic?: boolean) => Promise<void>;
  deleteWaterIntake: (id: number, optimistic?: boolean) => Promise<void>;
  loadWaterIntakes: (forceRefresh?: boolean) => Promise<void>;
  
  // Food intake methods
  addFoodIntake: (data: FoodIntakeRequest, optimistic?: boolean) => Promise<void>;
  updateFoodIntake: (id: number, data: FoodIntakeRequest, optimistic?: boolean) => Promise<void>;
  deleteFoodIntake: (id: number, optimistic?: boolean) => Promise<void>;
  loadFoodIntakes: (forceRefresh?: boolean) => Promise<void>;
  
  // Workout methods
  addWorkout: (data: WorkoutRequest, optimistic?: boolean) => Promise<void>;
  updateWorkout: (id: number, data: WorkoutRequest, optimistic?: boolean) => Promise<void>;
  deleteWorkout: (id: number, optimistic?: boolean) => Promise<void>;
  loadWorkouts: (forceRefresh?: boolean) => Promise<void>;
  
  // Health score methods
  refreshHealthScore: () => Promise<void>;
  loadHealthScore: (date?: string, forceRefresh?: boolean) => Promise<void>;
  
  // General methods
  loadAllHealthData: (forceRefresh?: boolean) => Promise<void>;
  syncAllData: () => Promise<void>;
  invalidateCache: (key?: keyof EnhancedHealthState['cache']) => void;
  clearError: () => void;
  clearAllData: () => void;
  
  // Cache and sync status
  isCacheValid: (key: keyof EnhancedHealthState['cache']) => boolean;
  getLastSyncTime: () => number | null;
  isSyncInProgress: () => boolean;
}

// Create context
const HealthContext = createContext<HealthContextType | undefined>(undefined);

// Health provider component
export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(healthReducer, initialHealthState);
  const { state: authState } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // Helper function to handle API errors with retry logic
  const handleApiError = useCallback((error: unknown, operation: string, shouldRetry: boolean = false) => {
    console.error(`Health API error during ${operation}:`, error);
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
    
    if (shouldRetry && retryCountRef.current < maxRetries) {
      retryCountRef.current += 1;
      console.log(`Retrying ${operation} (attempt ${retryCountRef.current}/${maxRetries})`);
      
      // Retry after a delay
      setTimeout(() => {
        if (operation.includes('sync')) {
          syncAllData();
        }
      }, 1000 * retryCountRef.current); // Exponential backoff
    } else {
      dispatch({ type: 'HEALTH_ERROR', payload: errorMessage });
      retryCountRef.current = 0; // Reset retry count
    }
  }, []);

  // Helper function to generate optimistic ID
  const generateOptimisticId = useCallback(() => {
    return -Date.now(); // Negative ID to distinguish from real IDs
  }, []);

  // Helper function to create optimistic update
  const createOptimisticUpdate = useCallback((type: 'water' | 'food' | 'workout', data: any) => {
    const optimisticId = generateOptimisticId();
    const optimisticData = {
      ...data,
      id: optimisticId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ 
      type: 'ADD_OPTIMISTIC_UPDATE', 
      payload: { type, data: optimisticData } 
    });
    
    return optimisticData;
  }, [generateOptimisticId]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'HEALTH_RESET_ERROR' });
  }, []);

  // Clear all data (useful for logout)
  const clearAllData = useCallback(() => {
    dispatch({ type: 'SET_WATER_INTAKES', payload: [] });
    dispatch({ type: 'SET_FOOD_INTAKES', payload: [] });
    dispatch({ type: 'SET_WORKOUTS', payload: [] });
    dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
    dispatch({ type: 'HEALTH_RESET_ERROR' });
    dispatch({ type: 'CLEAR_OPTIMISTIC_UPDATES' });
    dispatch({ type: 'INVALIDATE_CACHE' });
    
    // Clear any pending sync operations
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // Cache management functions
  const invalidateCache = useCallback((key?: keyof EnhancedHealthState['cache']) => {
    dispatch({ type: 'INVALIDATE_CACHE', payload: key });
  }, []);

  const isCacheValidForKey = useCallback((key: keyof EnhancedHealthState['cache']) => {
    const cacheEntry = state.cache[key];
    return cacheEntry ? isCacheValid(cacheEntry) : false;
  }, [state.cache]);

  const getLastSyncTime = useCallback(() => {
    return state.lastSyncTime;
  }, [state.lastSyncTime]);

  const isSyncInProgress = useCallback(() => {
    return state.syncInProgress;
  }, [state.syncInProgress]);

  // Auto-refresh health score after data changes (defined early for use in CRUD methods)
  const scheduleHealthScoreRefresh = useCallback(() => {
    // Debounce health score refresh to avoid too many calls
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      // refreshHealthScore will be defined later, so we'll call it via a promise
      Promise.resolve().then(async () => {
        try {
          // Invalidate cache first
          invalidateCache('healthScore');
          
          // Try to recalculate health score first
          const response = await HealthScoreService.recalculateHealthScore();
          
          if (response.data) {
            dispatch({ type: 'SET_HEALTH_SCORE', payload: response.data });
          } else {
            // Fallback to loading current score
            const fallbackResponse = await HealthScoreService.getCurrentHealthScore();
            if (fallbackResponse.data) {
              dispatch({ type: 'SET_HEALTH_SCORE', payload: fallbackResponse.data });
            } else {
              dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
            }
          }
        } catch (error) {
          console.warn('Failed to refresh health score:', error);
          // Fallback to loading current score
          try {
            const fallbackResponse = await HealthScoreService.getCurrentHealthScore();
            if (fallbackResponse.data) {
              dispatch({ type: 'SET_HEALTH_SCORE', payload: fallbackResponse.data });
            } else {
              dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
            }
          } catch (fallbackError) {
            console.warn('Failed to load fallback health score:', fallbackError);
            dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
          }
        }
      });
    }, 500); // 500ms debounce
  }, [invalidateCache]);

  // ==================== Water Intake Methods ====================
  
  const loadWaterIntakes = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid(state.cache.waterIntakes)) {
        dispatch({ type: 'SET_WATER_INTAKES', payload: state.cache.waterIntakes!.data });
        return;
      }

      dispatch({ type: 'HEALTH_LOADING', payload: true });
      
      const response = await HealthService.getWaterIntakes({ size: 100 });
      
      if (response.data) {
        dispatch({ type: 'SET_WATER_INTAKES', payload: response.data.content });
      } else {
        throw new Error(response.error || 'Failed to load water intakes');
      }
    } catch (error) {
      handleApiError(error, 'load water intakes', true);
    } finally {
      dispatch({ type: 'HEALTH_LOADING', payload: false });
    }
  }, [handleApiError, state.cache.waterIntakes]);

  const addWaterIntake = useCallback(async (data: WaterIntakeRequest, optimistic: boolean = true) => {
    let optimisticData: WaterIntake | null = null;
    
    try {
      // Add optimistic update if enabled
      if (optimistic) {
        optimisticData = createOptimisticUpdate('water', data);
        dispatch({ type: 'ADD_WATER_INTAKE', payload: optimisticData });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.createWaterIntake(data);
      
      if (response.data) {
        // Remove optimistic update and add real data
        if (optimisticData) {
          dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: { type: 'water', id: optimisticData.id } });
        }
        dispatch({ type: 'ADD_WATER_INTAKE', payload: response.data });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to add water intake');
      }
    } catch (error) {
      // Remove optimistic update on error
      if (optimisticData) {
        dispatch({ type: 'REMOVE_WATER_INTAKE', payload: optimisticData.id });
      }
      handleApiError(error, 'add water intake');
      throw error; // Re-throw for form handling
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, createOptimisticUpdate, invalidateCache, scheduleHealthScoreRefresh]);

  const deleteWaterIntake = useCallback(async (id: number, optimistic: boolean = true) => {
    let originalItem: WaterIntake | null = null;
    
    try {
      // Store original item for rollback
      originalItem = state.waterIntakes.find(item => item.id === id) || null;
      
      // Optimistically remove item if enabled
      if (optimistic && originalItem) {
        dispatch({ type: 'REMOVE_WATER_INTAKE', payload: id });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.deleteWaterIntake(id);
      
      if (response.status === 200 || response.status === 204) {
        // Ensure item is removed (in case optimistic update wasn't used)
        dispatch({ type: 'REMOVE_WATER_INTAKE', payload: id });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to delete water intake');
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (optimistic && originalItem) {
        dispatch({ type: 'ADD_WATER_INTAKE', payload: originalItem });
      }
      handleApiError(error, 'delete water intake');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, state.waterIntakes, invalidateCache, scheduleHealthScoreRefresh]);

  // ==================== Food Intake Methods ====================
  
  const loadFoodIntakes = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid(state.cache.foodIntakes)) {
        dispatch({ type: 'SET_FOOD_INTAKES', payload: state.cache.foodIntakes!.data });
        return;
      }

      dispatch({ type: 'HEALTH_LOADING', payload: true });
      
      const response = await HealthService.getFoodIntakes({ size: 100 });
      
      if (response.data) {
        dispatch({ type: 'SET_FOOD_INTAKES', payload: response.data.content });
      } else {
        throw new Error(response.error || 'Failed to load food intakes');
      }
    } catch (error) {
      handleApiError(error, 'load food intakes', true);
    } finally {
      dispatch({ type: 'HEALTH_LOADING', payload: false });
    }
  }, [handleApiError, state.cache.foodIntakes]);

  const addFoodIntake = useCallback(async (data: FoodIntakeRequest, optimistic: boolean = true) => {
    let optimisticData: FoodIntake | null = null;
    
    try {
      // Add optimistic update if enabled
      if (optimistic) {
        optimisticData = createOptimisticUpdate('food', data);
        dispatch({ type: 'ADD_FOOD_INTAKE', payload: optimisticData });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.createFoodIntake(data);
      
      if (response.data) {
        // Remove optimistic update and add real data
        if (optimisticData) {
          dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: { type: 'food', id: optimisticData.id } });
        }
        dispatch({ type: 'ADD_FOOD_INTAKE', payload: response.data });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to add food intake');
      }
    } catch (error) {
      // Remove optimistic update on error
      if (optimisticData) {
        dispatch({ type: 'REMOVE_FOOD_INTAKE', payload: optimisticData.id });
      }
      handleApiError(error, 'add food intake');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, createOptimisticUpdate, invalidateCache, scheduleHealthScoreRefresh]);

  const updateFoodIntake = useCallback(async (id: number, data: FoodIntakeRequest, optimistic: boolean = true) => {
    let originalItem: FoodIntake | null = null;
    
    try {
      // Store original item for rollback
      originalItem = state.foodIntakes.find(item => item.id === id) || null;
      
      // Optimistically update item if enabled
      if (optimistic && originalItem) {
        const optimisticUpdate = { ...originalItem, ...data };
        dispatch({ type: 'UPDATE_FOOD_INTAKE', payload: optimisticUpdate });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.updateFoodIntake(id, data);
      
      if (response.data) {
        dispatch({ type: 'UPDATE_FOOD_INTAKE', payload: response.data });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to update food intake');
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (optimistic && originalItem) {
        dispatch({ type: 'UPDATE_FOOD_INTAKE', payload: originalItem });
      }
      handleApiError(error, 'update food intake');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, state.foodIntakes, invalidateCache, scheduleHealthScoreRefresh]);

  const deleteFoodIntake = useCallback(async (id: number, optimistic: boolean = true) => {
    let originalItem: FoodIntake | null = null;
    
    try {
      // Store original item for rollback
      originalItem = state.foodIntakes.find(item => item.id === id) || null;
      
      // Optimistically remove item if enabled
      if (optimistic && originalItem) {
        dispatch({ type: 'REMOVE_FOOD_INTAKE', payload: id });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.deleteFoodIntake(id);
      
      if (response.status === 200 || response.status === 204) {
        dispatch({ type: 'REMOVE_FOOD_INTAKE', payload: id });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to delete food intake');
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (optimistic && originalItem) {
        dispatch({ type: 'ADD_FOOD_INTAKE', payload: originalItem });
      }
      handleApiError(error, 'delete food intake');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, state.foodIntakes, invalidateCache, scheduleHealthScoreRefresh]);

  // ==================== Workout Methods ====================
  
  const loadWorkouts = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid(state.cache.workouts)) {
        dispatch({ type: 'SET_WORKOUTS', payload: state.cache.workouts!.data });
        return;
      }

      dispatch({ type: 'HEALTH_LOADING', payload: true });
      
      const response = await HealthService.getWorkouts({ size: 100 });
      
      if (response.data) {
        dispatch({ type: 'SET_WORKOUTS', payload: response.data.content });
      } else {
        throw new Error(response.error || 'Failed to load workouts');
      }
    } catch (error) {
      handleApiError(error, 'load workouts', true);
    } finally {
      dispatch({ type: 'HEALTH_LOADING', payload: false });
    }
  }, [handleApiError, state.cache.workouts]);

  const addWorkout = useCallback(async (data: WorkoutRequest, optimistic: boolean = true) => {
    let optimisticData: Workout | null = null;
    
    try {
      // Add optimistic update if enabled
      if (optimistic) {
        optimisticData = createOptimisticUpdate('workout', data);
        dispatch({ type: 'ADD_WORKOUT', payload: optimisticData });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.createWorkout(data);
      
      if (response.data) {
        // Remove optimistic update and add real data
        if (optimisticData) {
          dispatch({ type: 'REMOVE_OPTIMISTIC_UPDATE', payload: { type: 'workout', id: optimisticData.id } });
        }
        dispatch({ type: 'ADD_WORKOUT', payload: response.data });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to add workout');
      }
    } catch (error) {
      // Remove optimistic update on error
      if (optimisticData) {
        dispatch({ type: 'REMOVE_WORKOUT', payload: optimisticData.id });
      }
      handleApiError(error, 'add workout');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, createOptimisticUpdate, invalidateCache, scheduleHealthScoreRefresh]);

  const updateWorkout = useCallback(async (id: number, data: WorkoutRequest, optimistic: boolean = true) => {
    let originalItem: Workout | null = null;
    
    try {
      // Store original item for rollback
      originalItem = state.workouts.find(item => item.id === id) || null;
      
      // Optimistically update item if enabled
      if (optimistic && originalItem) {
        const optimisticUpdate = { ...originalItem, ...data };
        dispatch({ type: 'UPDATE_WORKOUT', payload: optimisticUpdate });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.updateWorkout(id, data);
      
      if (response.data) {
        dispatch({ type: 'UPDATE_WORKOUT', payload: response.data });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to update workout');
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (optimistic && originalItem) {
        dispatch({ type: 'UPDATE_WORKOUT', payload: originalItem });
      }
      handleApiError(error, 'update workout');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, state.workouts, invalidateCache, scheduleHealthScoreRefresh]);

  const deleteWorkout = useCallback(async (id: number, optimistic: boolean = true) => {
    let originalItem: Workout | null = null;
    
    try {
      // Store original item for rollback
      originalItem = state.workouts.find(item => item.id === id) || null;
      
      // Optimistically remove item if enabled
      if (optimistic && originalItem) {
        dispatch({ type: 'REMOVE_WORKOUT', payload: id });
      } else {
        dispatch({ type: 'HEALTH_LOADING', payload: true });
      }
      
      const response = await HealthService.deleteWorkout(id);
      
      if (response.status === 200 || response.status === 204) {
        dispatch({ type: 'REMOVE_WORKOUT', payload: id });
        
        // Invalidate health score cache and schedule refresh
        invalidateCache('healthScore');
        scheduleHealthScoreRefresh();
      } else {
        throw new Error(response.error || 'Failed to delete workout');
      }
    } catch (error) {
      // Rollback optimistic update on error
      if (optimistic && originalItem) {
        dispatch({ type: 'ADD_WORKOUT', payload: originalItem });
      }
      handleApiError(error, 'delete workout');
      throw error;
    } finally {
      if (!optimistic) {
        dispatch({ type: 'HEALTH_LOADING', payload: false });
      }
    }
  }, [handleApiError, state.workouts, invalidateCache, scheduleHealthScoreRefresh]);

  // ==================== Health Score Methods ====================
  
  const loadHealthScore = useCallback(async (date?: string, forceRefresh: boolean = false) => {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && !date && isCacheValid(state.cache.healthScore)) {
        dispatch({ type: 'SET_HEALTH_SCORE', payload: state.cache.healthScore!.data });
        return;
      }

      const response = date 
        ? await HealthScoreService.getHealthScoreByDate(date)
        : await HealthScoreService.getCurrentHealthScore();
      
      if (response.data) {
        dispatch({ type: 'SET_HEALTH_SCORE', payload: response.data });
      } else {
        // No health score found, set to null
        dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
      }
    } catch (error) {
      console.warn('Failed to load health score:', error);
      // Don't treat this as a critical error, just set to null
      dispatch({ type: 'SET_HEALTH_SCORE', payload: null });
    }
  }, [state.cache.healthScore]);

  const refreshHealthScore = useCallback(async () => {
    try {
      // Invalidate cache first
      invalidateCache('healthScore');
      
      // Try to recalculate health score first
      const response = await HealthScoreService.recalculateHealthScore();
      
      if (response.data) {
        dispatch({ type: 'SET_HEALTH_SCORE', payload: response.data });
      } else {
        // Fallback to loading current score
        await loadHealthScore(undefined, true);
      }
    } catch (error) {
      console.warn('Failed to refresh health score:', error);
      // Fallback to loading current score
      await loadHealthScore(undefined, true);
    }
  }, [loadHealthScore, invalidateCache]);



  // ==================== Sync and General Methods ====================
  
  const syncAllData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: true });
      
      // Load all data in parallel with force refresh
      await Promise.all([
        loadWaterIntakes(true),
        loadFoodIntakes(true),
        loadWorkouts(true),
        loadHealthScore(undefined, true)
      ]);
      
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
      retryCountRef.current = 0; // Reset retry count on successful sync
    } catch (error) {
      handleApiError(error, 'sync health data', true);
    } finally {
      dispatch({ type: 'SET_SYNC_STATUS', payload: false });
    }
  }, [loadWaterIntakes, loadFoodIntakes, loadWorkouts, loadHealthScore, handleApiError]);

  const loadAllHealthData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      dispatch({ type: 'HEALTH_LOADING', payload: true });
      
      // Load all data in parallel
      await Promise.all([
        loadWaterIntakes(forceRefresh),
        loadFoodIntakes(forceRefresh),
        loadWorkouts(forceRefresh),
        loadHealthScore(undefined, forceRefresh)
      ]);
      
      if (forceRefresh) {
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
      }
    } catch (error) {
      handleApiError(error, 'load health data', true);
    } finally {
      dispatch({ type: 'HEALTH_LOADING', payload: false });
    }
  }, [loadWaterIntakes, loadFoodIntakes, loadWorkouts, loadHealthScore, handleApiError]);

  // ==================== Effects ====================
  
  // Load health data when user becomes authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Load data from cache first, then sync in background
      loadAllHealthData(false).then(() => {
        // Schedule a background sync if cache is stale
        const needsSync = !isCacheValid(state.cache.waterIntakes) ||
                         !isCacheValid(state.cache.foodIntakes) ||
                         !isCacheValid(state.cache.workouts) ||
                         !isCacheValid(state.cache.healthScore);
        
        if (needsSync) {
          syncTimeoutRef.current = setTimeout(() => {
            syncAllData();
          }, 1000); // Delay to avoid blocking initial load
        }
      });
    } else {
      // Clear data when user logs out
      clearAllData();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Auto-refresh health data periodically when authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      // Only sync if not already in progress
      if (!state.syncInProgress) {
        syncAllData();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, state.syncInProgress, syncAllData]);

  // Handle page visibility change to sync when page becomes visible
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !state.syncInProgress) {
        // Check if data is stale and sync if needed
        const lastSync = state.lastSyncTime;
        const now = Date.now();
        
        if (!lastSync || (now - lastSync) > CACHE_DURATION) {
          syncAllData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authState.isAuthenticated, state.syncInProgress, state.lastSyncTime, syncAllData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: HealthContextType = {
    state,
    
    // Water intake methods
    addWaterIntake,
    deleteWaterIntake,
    loadWaterIntakes,
    
    // Food intake methods
    addFoodIntake,
    updateFoodIntake,
    deleteFoodIntake,
    loadFoodIntakes,
    
    // Workout methods
    addWorkout,
    updateWorkout,
    deleteWorkout,
    loadWorkouts,
    
    // Health score methods
    refreshHealthScore,
    loadHealthScore,
    
    // General methods
    loadAllHealthData,
    syncAllData,
    invalidateCache,
    clearError,
    clearAllData,
    
    // Cache and sync status
    isCacheValid: isCacheValidForKey,
    getLastSyncTime,
    isSyncInProgress,
  };

  return (
    <HealthContext.Provider value={contextValue}>
      {children}
    </HealthContext.Provider>
  );
}

// Custom hook to use health context
export function useHealth(): HealthContextType {
  const context = useContext(HealthContext);
  
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  
  return context;
}

// Helper hook for health data state
export function useHealthData() {
  const { state } = useHealth();
  
  return {
    waterIntakes: state.waterIntakes,
    foodIntakes: state.foodIntakes,
    workouts: state.workouts,
    healthScore: state.healthScore,
    isLoading: state.isLoading,
    error: state.error,
    lastSyncTime: state.lastSyncTime,
    syncInProgress: state.syncInProgress,
  };
}

// Helper hook for health actions
export function useHealthActions() {
  const { 
    addWaterIntake,
    deleteWaterIntake,
    loadWaterIntakes,
    addFoodIntake,
    updateFoodIntake,
    deleteFoodIntake,
    loadFoodIntakes,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    loadWorkouts,
    refreshHealthScore,
    loadHealthScore,
    loadAllHealthData,
    syncAllData,
    invalidateCache,
    clearError,
    clearAllData
  } = useHealth();
  
  return {
    // Water intake actions
    addWaterIntake,
    deleteWaterIntake,
    loadWaterIntakes,
    
    // Food intake actions
    addFoodIntake,
    updateFoodIntake,
    deleteFoodIntake,
    loadFoodIntakes,
    
    // Workout actions
    addWorkout,
    updateWorkout,
    deleteWorkout,
    loadWorkouts,
    
    // Health score actions
    refreshHealthScore,
    loadHealthScore,
    
    // General actions
    loadAllHealthData,
    syncAllData,
    invalidateCache,
    clearError,
    clearAllData,
  };
}

// Helper hook for cache status
export function useHealthCache() {
  const { state, isCacheValid, getLastSyncTime, isSyncInProgress } = useHealth();
  
  return {
    isCacheValid,
    getLastSyncTime,
    isSyncInProgress,
    cacheStatus: {
      waterIntakes: isCacheValid('waterIntakes'),
      foodIntakes: isCacheValid('foodIntakes'),
      workouts: isCacheValid('workouts'),
      healthScore: isCacheValid('healthScore'),
    },
  };
}
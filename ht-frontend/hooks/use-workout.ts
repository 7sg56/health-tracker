'use client';

import { useState, useCallback } from 'react';
import { Workout, WorkoutRequest } from '@/lib/types/health';
import { HealthService } from '@/lib/api/health';
import { useHealthData } from './use-paginated-data';

interface UseWorkoutOptions {
  pageSize?: number;
  infiniteScroll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWorkoutReturn {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;

  // Actions
  addWorkout: (data: WorkoutRequest) => Promise<void>;
  updateWorkout: (id: number, data: WorkoutRequest) => Promise<void>;
  deleteWorkout: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  clearError: () => void;
}

export function useWorkout(options: UseWorkoutOptions = {}): UseWorkoutReturn {
  const {
    pageSize = 10,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  // Use the paginated data hook
  const [state, actions] = useHealthData(
    HealthService.getWorkouts,
    (item: Workout) => item.id,
    { pageSize, infiniteScroll, autoRefresh, refreshInterval }
  );

  const [optimisticError, setOptimisticError] = useState<string | null>(null);

  // Add workout with optimistic update
  const addWorkout = useCallback(
    async (data: WorkoutRequest) => {
      try {
        setOptimisticError(null);

        // Create optimistic entry
        const optimisticEntry: Workout = {
          id: Date.now(), // Temporary ID
          activity: data.activity,
          durationMin: data.durationMin,
          caloriesBurned: data.caloriesBurned,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        actions.addItem(optimisticEntry);

        // Make API call
        const response = await HealthService.createWorkout(data);

        if (response.error) {
          // Revert optimistic update on error
          actions.removeItem(optimisticEntry.id);
          throw new Error(response.error);
        }

        if (response.data) {
          // Replace optimistic entry with real data
          actions.updateItem(optimisticEntry.id, () => response.data!);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add workout';
        setOptimisticError(errorMessage);
        throw err; // Re-throw for form handling
      }
    },
    [actions]
  );

  // Update workout with optimistic update
  const updateWorkout = useCallback(
    async (id: number, data: WorkoutRequest) => {
      try {
        setOptimisticError(null);

        // Find the item to update for potential rollback
        const originalItem = state.items.find(item => item.id === id);
        if (!originalItem) {
          throw new Error('Workout entry not found');
        }

        // Create optimistic updated entry
        const optimisticEntry: Workout = {
          ...originalItem,
          activity: data.activity,
          durationMin: data.durationMin,
          caloriesBurned: data.caloriesBurned,
        };

        // Optimistic update
        actions.updateItem(id, () => optimisticEntry);

        // Make API call
        const response = await HealthService.updateWorkout(id, data);

        if (response.error) {
          // Revert optimistic update on error
          actions.updateItem(id, () => originalItem);
          throw new Error(response.error);
        }

        if (response.data) {
          // Replace optimistic entry with real data
          actions.updateItem(id, () => response.data!);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update workout';
        setOptimisticError(errorMessage);
        throw err; // Re-throw for form handling
      }
    },
    [actions, state.items]
  );

  // Delete workout with optimistic update
  const deleteWorkout = useCallback(
    async (id: number) => {
      try {
        setOptimisticError(null);

        // Find the item to delete for potential rollback
        const itemToDelete = state.items.find(item => item.id === id);
        if (!itemToDelete) {
          throw new Error('Workout entry not found');
        }

        // Optimistic update
        actions.removeItem(id);

        // Make API call
        const response = await HealthService.deleteWorkout(id);

        if (response.error) {
          // Revert optimistic update on error
          actions.addItem(itemToDelete);
          throw new Error(response.error);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete workout';
        setOptimisticError(errorMessage);
        throw err; // Re-throw for component handling
      }
    },
    [actions, state.items]
  );

  // Clear error
  const clearError = useCallback(() => {
    actions.clearError();
    setOptimisticError(null);
  }, [actions]);

  return {
    workouts: state.items,
    isLoading: state.isLoading,
    error: state.error || optimisticError,
    hasMore: state.hasMore,
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    refreshData: actions.refresh,
    loadMore: actions.loadMore,
    loadPage: actions.loadPage,
    clearError,
  };
}

'use client';

import { useState, useCallback } from 'react';
import { WaterIntake, WaterIntakeRequest } from '@/lib/types/health';
import { HealthService } from '@/lib/api/health';
import { useHealthData } from './use-paginated-data';

interface UseWaterIntakeOptions {
  pageSize?: number;
  infiniteScroll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWaterIntakeReturn {
  waterIntakes: WaterIntake[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;

  // Actions
  addWaterIntake: (data: WaterIntakeRequest) => Promise<void>;
  deleteWaterIntake: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  clearError: () => void;
}

export function useWaterIntake(
  options: UseWaterIntakeOptions = {}
): UseWaterIntakeReturn {
  const {
    pageSize = 10,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  // Use the paginated data hook
  const [state, actions] = useHealthData(
    HealthService.getWaterIntakes,
    (item: WaterIntake) => item.id,
    { pageSize, infiniteScroll, autoRefresh, refreshInterval }
  );

  const [optimisticError, setOptimisticError] = useState<string | null>(null);

  // Add water intake with optimistic update
  const addWaterIntake = useCallback(
    async (data: WaterIntakeRequest) => {
      try {
        setOptimisticError(null);

        // Create optimistic entry
        const optimisticEntry: WaterIntake = {
          id: Date.now(), // Temporary ID
          amountLtr: data.amountLtr,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        actions.addItem(optimisticEntry);

        // Make API call
        const response = await HealthService.createWaterIntake(data);

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
          err instanceof Error ? err.message : 'Failed to add water intake';
        setOptimisticError(errorMessage);
        throw err; // Re-throw for form handling
      }
    },
    [actions]
  );

  // Delete water intake with optimistic update
  const deleteWaterIntake = useCallback(
    async (id: number) => {
      try {
        setOptimisticError(null);

        // Find the item to delete for potential rollback
        const itemToDelete = state.items.find(item => item.id === id);
        if (!itemToDelete) {
          throw new Error('Water intake entry not found');
        }

        // Optimistic update
        actions.removeItem(id);

        // Make API call
        const response = await HealthService.deleteWaterIntake(id);

        if (response.error) {
          // Revert optimistic update on error
          actions.addItem(itemToDelete);
          throw new Error(response.error);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete water intake';
        setOptimisticError(errorMessage);
        throw err; // Re-throw for component handling
      }
    },
    [state.items, actions]
  );

  // Clear error (both state error and optimistic error)
  const clearError = useCallback(() => {
    actions.clearError();
    setOptimisticError(null);
  }, [actions]);

  return {
    waterIntakes: state.items,
    isLoading: state.isLoading,
    error: state.error || optimisticError,
    hasMore: state.hasMore,
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    addWaterIntake,
    deleteWaterIntake,
    refreshData: actions.refresh,
    loadMore: actions.loadMore,
    loadPage: actions.loadPage,
    clearError,
  };
}

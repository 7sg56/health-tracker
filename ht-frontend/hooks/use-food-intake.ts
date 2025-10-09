'use client';

import { useState, useCallback, useMemo } from 'react';
import { FoodIntake, FoodIntakeRequest } from '@/lib/types/health';
import { HealthService } from '@/lib/api/health';
import { useHealthData } from './use-paginated-data';

// Extended food database with more items and nutritional info
export const FOOD_DATABASE = [
  // Fruits
  { name: 'Apple', calories: 95, category: 'Fruits' },
  { name: 'Banana', calories: 105, category: 'Fruits' },
  { name: 'Orange', calories: 62, category: 'Fruits' },
  { name: 'Grapes (1 cup)', calories: 104, category: 'Fruits' },
  { name: 'Strawberries (1 cup)', calories: 49, category: 'Fruits' },
  { name: 'Blueberries (1 cup)', calories: 84, category: 'Fruits' },

  // Vegetables
  { name: 'Broccoli (1 cup)', calories: 25, category: 'Vegetables' },
  { name: 'Carrots (1 cup)', calories: 52, category: 'Vegetables' },
  { name: 'Spinach (1 cup)', calories: 7, category: 'Vegetables' },
  { name: 'Bell Pepper (1 cup)', calories: 30, category: 'Vegetables' },
  { name: 'Tomato (medium)', calories: 22, category: 'Vegetables' },
  { name: 'Cucumber (1 cup)', calories: 16, category: 'Vegetables' },

  // Proteins
  { name: 'Chicken Breast (100g)', calories: 165, category: 'Proteins' },
  { name: 'Salmon (100g)', calories: 208, category: 'Proteins' },
  { name: 'Tuna (100g)', calories: 144, category: 'Proteins' },
  { name: 'Egg (large)', calories: 70, category: 'Proteins' },
  { name: 'Greek Yogurt (1 cup)', calories: 130, category: 'Proteins' },
  { name: 'Tofu (100g)', calories: 76, category: 'Proteins' },
  { name: 'Lean Beef (100g)', calories: 250, category: 'Proteins' },

  // Grains & Carbs
  { name: 'Rice (1 cup cooked)', calories: 205, category: 'Grains' },
  { name: 'Pasta (1 cup cooked)', calories: 220, category: 'Grains' },
  { name: 'Bread Slice', calories: 80, category: 'Grains' },
  { name: 'Oatmeal (1 cup)', calories: 150, category: 'Grains' },
  { name: 'Quinoa (1 cup cooked)', calories: 222, category: 'Grains' },
  { name: 'Sweet Potato (medium)', calories: 112, category: 'Grains' },

  // Dairy
  { name: 'Milk (1 cup)', calories: 150, category: 'Dairy' },
  { name: 'Cheese (1 oz)', calories: 113, category: 'Dairy' },
  { name: 'Yogurt (1 cup)', calories: 150, category: 'Dairy' },
  { name: 'Butter (1 tbsp)', calories: 102, category: 'Dairy' },

  // Nuts & Seeds
  { name: 'Almonds (28g)', calories: 164, category: 'Nuts & Seeds' },
  { name: 'Walnuts (28g)', calories: 185, category: 'Nuts & Seeds' },
  { name: 'Peanut Butter (2 tbsp)', calories: 188, category: 'Nuts & Seeds' },
  { name: 'Sunflower Seeds (28g)', calories: 165, category: 'Nuts & Seeds' },

  // Snacks & Others
  { name: 'Granola Bar', calories: 150, category: 'Snacks' },
  { name: 'Potato Chips (28g)', calories: 152, category: 'Snacks' },
  { name: 'Dark Chocolate (28g)', calories: 155, category: 'Snacks' },
  { name: 'Avocado (medium)', calories: 234, category: 'Healthy Fats' },
  { name: 'Olive Oil (1 tbsp)', calories: 119, category: 'Healthy Fats' },
];

interface UseFoodIntakeOptions {
  pageSize?: number;
  infiniteScroll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface FoodSuggestion {
  name: string;
  calories: number;
  category: string;
}

export function useFoodIntake(options: UseFoodIntakeOptions = {}) {
  const {
    pageSize = 10,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  // Use the paginated data hook
  const [state, actions] = useHealthData(
    HealthService.getFoodIntakes,
    (item: FoodIntake) => item.id,
    { pageSize, infiniteScroll, autoRefresh, refreshInterval }
  );

  const [optimisticError, setOptimisticError] = useState<string | null>(null);

  // Food suggestion functionality
  const searchFoodSuggestions = useCallback(
    (query: string, limit: number = 10): FoodSuggestion[] => {
      if (!query.trim()) {
        return FOOD_DATABASE.slice(0, limit);
      }

      const lowercaseQuery = query.toLowerCase();
      const filtered = FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(lowercaseQuery)
      );

      // Sort by relevance (exact matches first, then starts with, then contains)
      const sorted = filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        if (aName === lowercaseQuery) return -1;
        if (bName === lowercaseQuery) return 1;
        if (
          aName.startsWith(lowercaseQuery) &&
          !bName.startsWith(lowercaseQuery)
        )
          return -1;
        if (
          bName.startsWith(lowercaseQuery) &&
          !aName.startsWith(lowercaseQuery)
        )
          return 1;

        return aName.localeCompare(bName);
      });

      return sorted.slice(0, limit);
    },
    []
  );

  const getFoodSuggestionsByCategory = useCallback(
    (category: string): FoodSuggestion[] => {
      return FOOD_DATABASE.filter(food => food.category === category);
    },
    []
  );

  const estimateCalories = useCallback((foodItem: string): number | null => {
    const lowercaseItem = foodItem.toLowerCase();
    const match = FOOD_DATABASE.find(
      food =>
        food.name.toLowerCase() === lowercaseItem ||
        food.name.toLowerCase().includes(lowercaseItem)
    );
    return match ? match.calories : null;
  }, []);

  const addFoodIntake = useCallback(
    async (data: FoodIntakeRequest): Promise<FoodIntake> => {
      setOptimisticError(null);

      try {
        // Create optimistic entry
        const optimisticEntry: FoodIntake = {
          id: Date.now(), // Temporary ID
          foodItem: data.foodItem,
          calories: data.calories,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        actions.addItem(optimisticEntry);

        const response = await HealthService.createFoodIntake(data);

        if (response.data) {
          // Replace optimistic entry with real data
          actions.updateItem(optimisticEntry.id, () => response.data!);
          return response.data;
        } else {
          // Revert optimistic update
          actions.removeItem(optimisticEntry.id);
          throw new Error('No data returned from server');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add food intake';
        setOptimisticError(errorMessage);
        throw err;
      }
    },
    [actions]
  );

  const updateFoodIntake = useCallback(
    async (id: number, data: FoodIntakeRequest): Promise<FoodIntake> => {
      setOptimisticError(null);

      try {
        // Find original item for rollback
        const originalItem = state.items.find(item => item.id === id);
        if (!originalItem) {
          throw new Error('Food intake entry not found');
        }

        // Optimistic update
        const optimisticEntry: FoodIntake = {
          ...originalItem,
          foodItem: data.foodItem,
          calories: data.calories,
        };
        actions.updateItem(id, () => optimisticEntry);

        const response = await HealthService.updateFoodIntake(id, data);

        if (response.data) {
          // Replace with real data
          actions.updateItem(id, () => response.data!);
          return response.data;
        } else {
          // Revert optimistic update
          actions.updateItem(id, () => originalItem);
          throw new Error('No data returned from server');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update food intake';
        setOptimisticError(errorMessage);
        throw err;
      }
    },
    [actions, state.items]
  );

  const deleteFoodIntake = useCallback(
    async (id: number): Promise<void> => {
      setOptimisticError(null);

      try {
        // Find the item to delete for potential rollback
        const itemToDelete = state.items.find(item => item.id === id);
        if (!itemToDelete) {
          throw new Error('Food intake entry not found');
        }

        // Optimistic update
        actions.removeItem(id);

        const response = await HealthService.deleteFoodIntake(id);

        if (response.error) {
          // Revert optimistic update on error
          actions.addItem(itemToDelete);
          throw new Error(response.error);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete food intake';
        setOptimisticError(errorMessage);
        throw err;
      }
    },
    [actions, state.items]
  );

  // Computed values
  const totalCalories = useMemo(() => {
    return state.items.reduce((sum, intake) => sum + intake.calories, 0);
  }, [state.items]);

  const averageCaloriesPerMeal = useMemo(() => {
    return state.items.length > 0
      ? Math.round(totalCalories / state.items.length)
      : 0;
  }, [totalCalories, state.items.length]);

  const foodCategories = useMemo(() => {
    const categories = [...new Set(FOOD_DATABASE.map(food => food.category))];
    return categories.sort();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    actions.clearError();
    setOptimisticError(null);
  }, [actions]);

  return {
    // Data
    foodIntakes: state.items,
    isLoading: state.isLoading,
    error: state.error || optimisticError,
    totalCalories,
    averageCaloriesPerMeal,
    hasMore: state.hasMore,

    // Pagination
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalElements: state.totalElements,
    pageSize: state.pageSize,

    // Food suggestions
    searchFoodSuggestions,
    getFoodSuggestionsByCategory,
    estimateCalories,
    foodCategories,

    // Actions
    addFoodIntake,
    updateFoodIntake,
    deleteFoodIntake,
    loadPage: actions.loadPage,
    loadMore: actions.loadMore,
    refresh: actions.refresh,
    clearError,
  };
}

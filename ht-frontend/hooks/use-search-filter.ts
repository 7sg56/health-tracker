'use client';

import { useState, useMemo, useCallback } from 'react';
import { SearchFilterState, DateRange } from '@/components/ui/search-filter';

export interface UseSearchFilterOptions<T> {
  searchFields?: (keyof T)[];
  dateField?: keyof T;
  initialState?: Partial<SearchFilterState>;
}

export interface UseSearchFilterReturn<T> {
  filteredData: T[];
  searchState: SearchFilterState;
  updateSearchState: (state: SearchFilterState) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

export function useSearchFilter<T extends Record<string, any>>(
  data: T[],
  options: UseSearchFilterOptions<T> = {}
): UseSearchFilterReturn<T> {
  const {
    searchFields = [],
    dateField,
    initialState = {}
  } = options;

  const [searchState, setSearchState] = useState<SearchFilterState>({
    searchQuery: '',
    dateRange: null,
    sortBy: '',
    filters: {},
    ...initialState
  });

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search query
    if (searchState.searchQuery && searchFields.length > 0) {
      const query = searchState.searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === 'number') {
            return value.toString().includes(query);
          }
          return false;
        })
      );
    }

    // Apply date range filter
    if (searchState.dateRange && dateField) {
      const { from, to } = searchState.dateRange;
      result = result.filter(item => {
        const itemDate = new Date(item[dateField] as string);
        return itemDate >= from && itemDate <= to;
      });
    }

    // Apply custom filters
    Object.entries(searchState.filters).forEach(([filterKey, filterValues]) => {
      if (filterValues.length > 0) {
        result = result.filter(item => {
          const itemValue = item[filterKey as keyof T];
          return filterValues.includes(String(itemValue));
        });
      }
    });

    // Apply sorting
    if (searchState.sortBy) {
      const [field, direction] = searchState.sortBy.split(':');
      result.sort((a, b) => {
        const aValue = a[field as keyof T];
        const bValue = b[field as keyof T];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchState, searchFields, dateField]);

  // Update search state
  const updateSearchState = useCallback((newState: SearchFilterState) => {
    setSearchState(newState);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchState({
      searchQuery: '',
      dateRange: null,
      sortBy: searchState.sortBy, // Keep sort
      filters: {}
    });
  }, [searchState.sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchState.searchQuery) count++;
    if (searchState.dateRange) count++;
    Object.values(searchState.filters).forEach(values => {
      count += values.length;
    });
    return count;
  }, [searchState]);

  return {
    filteredData,
    searchState,
    updateSearchState,
    clearFilters,
    activeFilterCount
  };
}

// Specialized hook for health data filtering
export interface HealthDataFilterOptions {
  enableCalorieFilter?: boolean;
  enableDurationFilter?: boolean;
  enableAmountFilter?: boolean;
}

export function useHealthDataFilter<T extends Record<string, any>>(
  data: T[],
  type: 'water' | 'food' | 'workout',
  options: HealthDataFilterOptions = {}
) {
  const searchFields = useMemo(() => {
    switch (type) {
      case 'water':
        return ['amountLtr'] as (keyof T)[];
      case 'food':
        return ['foodItem', 'calories'] as (keyof T)[];
      case 'workout':
        return ['activity', 'durationMin', 'caloriesBurned'] as (keyof T)[];
      default:
        return [];
    }
  }, [type]);

  const filterResult = useSearchFilter(data, {
    searchFields,
    dateField: 'createdAt' as keyof T
  });

  // Generate filter groups based on data type
  const filterGroups = useMemo(() => {
    const groups = [];

    if (type === 'food' && options.enableCalorieFilter) {
      // Calorie ranges for food
      groups.push({
        key: 'calorieRange',
        label: 'Calorie Range',
        options: [
          { value: 'low', label: 'Low (< 200)', count: 0 },
          { value: 'medium', label: 'Medium (200-500)', count: 0 },
          { value: 'high', label: 'High (> 500)', count: 0 }
        ],
        multiple: true
      });
    }

    if (type === 'workout' && options.enableDurationFilter) {
      // Duration ranges for workouts
      groups.push({
        key: 'durationRange',
        label: 'Duration Range',
        options: [
          { value: 'short', label: 'Short (< 30 min)', count: 0 },
          { value: 'medium', label: 'Medium (30-60 min)', count: 0 },
          { value: 'long', label: 'Long (> 60 min)', count: 0 }
        ],
        multiple: true
      });
    }

    if (type === 'water' && options.enableAmountFilter) {
      // Amount ranges for water
      groups.push({
        key: 'amountRange',
        label: 'Amount Range',
        options: [
          { value: 'small', label: 'Small (< 0.5L)', count: 0 },
          { value: 'medium', label: 'Medium (0.5-1L)', count: 0 },
          { value: 'large', label: 'Large (> 1L)', count: 0 }
        ],
        multiple: true
      });
    }

    return groups;
  }, [type, options]);

  return {
    ...filterResult,
    filterGroups
  };
}

// Hook for generating sort options based on data type
export function useSortOptions(type: 'water' | 'food' | 'workout') {
  return useMemo(() => {
    const baseOptions = [
      { value: 'createdAt:desc', label: 'Newest First', field: 'createdAt', direction: 'desc' as const },
      { value: 'createdAt:asc', label: 'Oldest First', field: 'createdAt', direction: 'asc' as const },
      { value: 'date:desc', label: 'Date (Newest)', field: 'date', direction: 'desc' as const },
      { value: 'date:asc', label: 'Date (Oldest)', field: 'date', direction: 'asc' as const }
    ];

    switch (type) {
      case 'water':
        return [
          ...baseOptions,
          { value: 'amountLtr:desc', label: 'Amount (High to Low)', field: 'amountLtr', direction: 'desc' as const },
          { value: 'amountLtr:asc', label: 'Amount (Low to High)', field: 'amountLtr', direction: 'asc' as const }
        ];
      case 'food':
        return [
          ...baseOptions,
          { value: 'calories:desc', label: 'Calories (High to Low)', field: 'calories', direction: 'desc' as const },
          { value: 'calories:asc', label: 'Calories (Low to High)', field: 'calories', direction: 'asc' as const },
          { value: 'foodItem:asc', label: 'Food Name (A-Z)', field: 'foodItem', direction: 'asc' as const },
          { value: 'foodItem:desc', label: 'Food Name (Z-A)', field: 'foodItem', direction: 'desc' as const }
        ];
      case 'workout':
        return [
          ...baseOptions,
          { value: 'durationMin:desc', label: 'Duration (Long to Short)', field: 'durationMin', direction: 'desc' as const },
          { value: 'durationMin:asc', label: 'Duration (Short to Long)', field: 'durationMin', direction: 'asc' as const },
          { value: 'caloriesBurned:desc', label: 'Calories Burned (High to Low)', field: 'caloriesBurned', direction: 'desc' as const },
          { value: 'caloriesBurned:asc', label: 'Calories Burned (Low to High)', field: 'caloriesBurned', direction: 'asc' as const },
          { value: 'activity:asc', label: 'Activity (A-Z)', field: 'activity', direction: 'asc' as const },
          { value: 'activity:desc', label: 'Activity (Z-A)', field: 'activity', direction: 'desc' as const }
        ];
      default:
        return baseOptions;
    }
  }, [type]);
}
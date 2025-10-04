'use client';

import { useState, useCallback, useEffect } from 'react';
import { PaginationParams, PaginatedResponse } from '@/lib/types/api';

export interface PaginatedDataState<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface PaginatedDataActions<T> {
  loadPage: (page: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPageSize: (size: number) => void;
  clearError: () => void;
  addItem: (item: T) => void;
  updateItem: (id: number | string, updater: (item: T) => T) => void;
  removeItem: (id: number | string) => void;
}

export interface UsePaginatedDataOptions<T> {
  initialPage?: number;
  initialPageSize?: number;
  fetchFunction: (params: PaginationParams) => Promise<{ data?: PaginatedResponse<T>; error?: string }>;
  getItemId: (item: T) => number | string;
  infiniteScroll?: boolean;
  autoLoad?: boolean;
}

export function usePaginatedData<T>({
  initialPage = 0,
  initialPageSize = 10,
  fetchFunction,
  getItemId,
  infiniteScroll = false,
  autoLoad = true
}: UsePaginatedDataOptions<T>): [PaginatedDataState<T>, PaginatedDataActions<T>] {
  const [state, setState] = useState<PaginatedDataState<T>>({
    items: [],
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    pageSize: initialPageSize,
    isLoading: false,
    error: null,
    hasMore: true
  });

  // Load a specific page
  const loadPage = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchFunction({
        page,
        size: state.pageSize,
        sort: 'createdAt,desc'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const { content, page: pageInfo } = response.data;
        
        setState(prev => ({
          ...prev,
          items: infiniteScroll && page > 0 ? [...prev.items, ...content] : content,
          currentPage: pageInfo.number,
          totalPages: pageInfo.totalPages,
          totalElements: pageInfo.totalElements,
          hasMore: pageInfo.number < pageInfo.totalPages - 1,
          isLoading: false
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  }, [fetchFunction, state.pageSize, infiniteScroll]);

  // Load more items (for infinite scroll)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await loadPage(state.currentPage + 1);
  }, [state.hasMore, state.isLoading, state.currentPage, loadPage]);

  // Refresh current data
  const refresh = useCallback(async () => {
    if (infiniteScroll) {
      // For infinite scroll, reload from the beginning
      setState(prev => ({ ...prev, items: [], currentPage: initialPage }));
      await loadPage(initialPage);
    } else {
      // For pagination, reload current page
      await loadPage(state.currentPage);
    }
  }, [infiniteScroll, initialPage, loadPage, state.currentPage]);

  // Set page size and reload
  const setPageSize = useCallback((size: number) => {
    setState(prev => ({ 
      ...prev, 
      pageSize: size, 
      currentPage: initialPage,
      items: infiniteScroll ? [] : prev.items
    }));
  }, [initialPage, infiniteScroll]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Optimistic updates
  const addItem = useCallback((item: T) => {
    setState(prev => ({
      ...prev,
      items: [item, ...prev.items],
      totalElements: prev.totalElements + 1
    }));
  }, []);

  const updateItem = useCallback((id: number | string, updater: (item: T) => T) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        getItemId(item) === id ? updater(item) : item
      )
    }));
  }, [getItemId]);

  const removeItem = useCallback((id: number | string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => getItemId(item) !== id),
      totalElements: Math.max(0, prev.totalElements - 1)
    }));
  }, [getItemId]);

  // Auto-load initial data
  useEffect(() => {
    if (autoLoad) {
      loadPage(initialPage);
    }
  }, [autoLoad, initialPage, loadPage]);

  // Reload when page size changes
  useEffect(() => {
    if (state.pageSize !== initialPageSize) {
      loadPage(initialPage);
    }
  }, [state.pageSize, initialPageSize, initialPage, loadPage]);

  return [
    state,
    {
      loadPage,
      loadMore,
      refresh,
      setPageSize,
      clearError,
      addItem,
      updateItem,
      removeItem
    }
  ];
}

// Specialized hook for health data with common patterns
export interface UseHealthDataOptions<T> {
  pageSize?: number;
  infiniteScroll?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useHealthData<T>(
  fetchFunction: (params: PaginationParams) => Promise<{ data?: PaginatedResponse<T>; error?: string }>,
  getItemId: (item: T) => number | string,
  options: UseHealthDataOptions<T> = {}
) {
  const {
    pageSize = 10,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  const [state, actions] = usePaginatedData({
    initialPageSize: pageSize,
    fetchFunction,
    getItemId,
    infiniteScroll
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      actions.refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, actions]);

  return [state, actions] as const;
}
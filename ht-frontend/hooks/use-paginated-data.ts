import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PaginationParams, ApiResponse, PaginatedResponse } from '@/lib/types/api'

export interface UseHealthDataOptions {
  pageSize?: number
  infiniteScroll?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  sort?: string
}

interface HealthDataState<T> {
  items: T[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

interface HealthDataActions<T> {
  loadPage: (page: number) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  addItem: (item: T) => void
  updateItem: (id: number, updater: (prev: T) => T) => void
  removeItem: (id: number) => void
  clearError: () => void
}

export function useHealthData<T>(
  fetcher: (params: PaginationParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  idSelector: (item: T) => number,
  options: UseHealthDataOptions = {}
): [HealthDataState<T>, HealthDataActions<T>] {
  const {
    pageSize = 10,
    infiniteScroll = false,
    autoRefresh = false,
    refreshInterval = 30000,
    sort,
  } = options

  const [state, setState] = useState<HealthDataState<T>>({
    items: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize,
  })

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const doFetch = useCallback(
    async (page: number, append: boolean) => {
      setState((s) => ({ ...s, isLoading: true, error: null }))
      try {
        const params: PaginationParams = { page, size: state.pageSize }
        if (sort) params.sort = sort
        const resp = await fetcher(params)
        if (!mountedRef.current) return
        if (resp.error) {
          setState((s) => ({ ...s, isLoading: false, error: resp.error ?? 'Request failed' }))
          return
        }
        const data = resp.data!
        const nextItems = append ? [...state.items, ...data.content] : data.content
        const hasMore = page + 1 < data.page.totalPages
        setState((s) => ({
          ...s,
          items: nextItems,
          isLoading: false,
          error: null,
          hasMore,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages,
          currentPage: page,
        }))
      } catch (e) {
        if (!mountedRef.current) return
        const message = e instanceof Error ? e.message : 'Failed to load data'
        setState((s) => ({ ...s, isLoading: false, error: message }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetcher, sort, state.pageSize, state.items]
  )

  const loadPage = useCallback(async (page: number) => {
    await doFetch(page, false)
  }, [doFetch])

  const loadMore = useCallback(async () => {
    const nextPage = state.currentPage + 1
    if (state.hasMore || infiniteScroll) {
      await doFetch(nextPage, true)
    }
  }, [doFetch, state.currentPage, state.hasMore, infiniteScroll])

  const refresh = useCallback(async () => {
    await doFetch(0, false)
  }, [doFetch])

  useEffect(() => {
    // initial load
    doFetch(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => {
      doFetch(state.currentPage, false)
    }, refreshInterval)
    return () => clearInterval(id)
  }, [autoRefresh, refreshInterval, doFetch, state.currentPage])

  const addItem = useCallback((item: T) => {
    setState((s) => ({ ...s, items: [item, ...s.items] }))
  }, [])

  const updateItem = useCallback((id: number, updater: (prev: T) => T) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (idSelector(it) === id ? updater(it) : it)),
    }))
  }, [idSelector])

  const removeItem = useCallback((id: number) => {
    setState((s) => ({ ...s, items: s.items.filter((it) => idSelector(it) !== id) }))
  }, [idSelector])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  const actions: HealthDataActions<T> = useMemo(
    () => ({ loadPage, loadMore, refresh, addItem, updateItem, removeItem, clearError }),
    [loadPage, loadMore, refresh, addItem, updateItem, removeItem, clearError]
  )

  return [state, actions]
}

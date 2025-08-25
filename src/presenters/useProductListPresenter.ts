import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { debounce } from 'lodash-es'
import type { SearchOptions } from '@/usecases/ProductSearchUseCase'
import { useProducts } from '@/hooks/useSupabase'
import { ProductSearchUseCase } from '@/usecases/ProductSearchUseCase'
import { SupabaseProductRepository } from '@/models/productsRepository'
import { supabase } from '@/lib/supabase'

export interface ProductListPresenterState {
  readonly products: Array<any>
  readonly loading: boolean
  readonly error: string | null
  readonly totalCount: number
  readonly hasMore: boolean
  readonly query: string
  readonly filters: Record<string, any>
  readonly sortBy: string
  readonly sortOrder: 'asc' | 'desc'
  readonly page: number
  readonly pageSize: number
  readonly suggestions: Array<string>
}

export interface ProductListPresenterActions {
  readonly setQuery: (query: string) => void
  readonly setFilter: (key: string, value: any) => void
  readonly clearFilters: () => void
  readonly setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  readonly setPage: (page: number) => void
  readonly setPageSize: (pageSize: number) => void
  readonly refresh: () => void
  readonly loadMore: () => void
}

export interface ProductListPresenterReturn
  extends ProductListPresenterState,
    ProductListPresenterActions {}

/**
 * Presenter for Product List functionality
 *
 * Orchestrates product search, filtering, and pagination using ProductSearchUseCase
 */
export function useProductListPresenter(initialOptions?: {
  query?: string
  filters?: Record<string, any>
  pageSize?: number
}): ProductListPresenterReturn {
  // State
  const [query, setQueryState] = useState(initialOptions?.query || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [filters, setFilters] = useState(initialOptions?.filters || {})
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialOptions?.pageSize || 20)

  // Use cases and repositories
  const [productRepository] = useState(
    () => new SupabaseProductRepository(supabase),
  )
  const [searchUseCase] = useState(
    () => new ProductSearchUseCase(productRepository),
  )

  // Debounce query input
  const debouncedSetQuery = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 300),
    [],
  )

  useEffect(() => {
    debouncedSetQuery(query)
  }, [query, debouncedSetQuery])

  // Build search options
  const searchOptions: SearchOptions = useMemo(
    () => ({
      query: debouncedQuery,
      filters,
      sortBy: sortBy as any,
      sortOrder,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [debouncedQuery, filters, sortBy, sortOrder, page, pageSize],
  )

  // Fetch products using TanStack Query
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products-search', searchOptions],
    queryFn: async () => {
      return await searchUseCase.searchProducts(searchOptions)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Fetch suggestions separately with debounced query
  const { data: suggestions = [] } = useQuery({
    queryKey: ['product-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return []
      return await searchUseCase.getSearchSuggestions(debouncedQuery, 5)
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Actions
  const setQuery = (newQuery: string) => {
    setQueryState(newQuery)
    setPage(1) // Reset to first page when query changes
  }

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const setSorting = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPage(1) // Reset to first page when sorting changes
  }

  const setPageWrapper = (newPage: number) => {
    if (newPage > 0) {
      setPage(newPage)
    }
  }

  const setPageSizeWrapper = (newPageSize: number) => {
    if (newPageSize > 0 && newPageSize <= 100) {
      setPageSize(newPageSize)
      setPage(1) // Reset to first page when page size changes
    }
  }

  const refresh = () => {
    refetch()
  }

  const loadMore = () => {
    if (searchResult?.hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  // Error handling
  const errorMessage = error instanceof Error ? error.message : null

  return {
    // State
    products: searchResult?.products || [],
    loading: isLoading,
    error: errorMessage,
    totalCount: searchResult?.totalCount || 0,
    hasMore: searchResult?.hasMore || false,
    query,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize,
    suggestions,

    // Actions
    setQuery,
    setFilter,
    clearFilters,
    setSorting,
    setPage: setPageWrapper,
    setPageSize: setPageSizeWrapper,
    refresh,
    loadMore,
  }
}

/**
 * Simplified presenter for basic product listing (backward compatibility)
 */
export function useSimpleProductListPresenter(options?: {
  page?: number
  pageSize?: number
  category?: string
}) {
  const {
    data: products = [],
    isLoading,
    error,
  } = useProducts({
    page: options?.page || 1,
    pageSize: options?.pageSize || 20,
    categoryId: options?.category ? Number(options.category) : undefined,
  })

  return {
    products,
    loading: isLoading,
    error: error ? 'Failed to load products' : null,
    totalCount: products.length,
    hasMore: false,
  }
}

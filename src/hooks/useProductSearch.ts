import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { debounce } from 'lodash-es'
// TODO: Replace with real Product type from '@/types/product'
interface Product {
  id: string
  name: string
  category?: string
  brand?: string
  [key: string]: unknown
}

interface UseProductSearchOptions {
  readonly initialQuery?: string
  readonly initialFilters?: Record<string, string | number | boolean>
}

export function useProductSearch({
  initialQuery = '',
  initialFilters = {},
}: UseProductSearchOptions = {}) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState(initialFilters)

  // Debounced query state for suggestions
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce input for suggestions
  const debouncedSetQuery = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 300),
    [],
  )

  function handleQueryChange(val: string) {
    setQuery(val)
    debouncedSetQuery(val)
  }

  function handleFilterChange(key: string, value: string | number | boolean) {
    console.log('Filter change:', key, '=', value)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    console.log('Clearing all filters')
    setFilters({})
  }

  // Fetch products (replace with real API or TanStack Query logic)
  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Array<Product>>({
    queryKey: ['products', { query, filters }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== '') {
          params.append(k, String(v))
        }
      })

      const url = `/api/products?${params.toString()}`
      console.log('Fetching products from:', url)
      console.log('Current filters:', filters)

      const res = await fetch(url)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('API error:', res.status, errorText)
        throw new Error(`Failed to fetch products: ${res.status}`)
      }

      const data = await res.json()
      console.log('Received products:', data?.length || 0, 'items')

      // Log first product for debugging
      if (data?.length > 0) {
        console.log('Sample product:', data[0])
      } else {
        console.log('No products returned for filters:', filters)
      }

      return data
    },
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute for testing
    refetchOnWindowFocus: false,
    // Ensure we refetch when filters change
    refetchOnMount: true,
  })

  // Suggestions (debounced)
  const suggestions = useMemo(() => {
    if (!products || !debouncedQuery) return []
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
      .slice(0, 5)
      .map((p) => p.name)
  }, [products, debouncedQuery])

  return {
    query,
    setQuery: handleQueryChange,
    filters,
    setFilter: handleFilterChange,
    clearFilters,
    products,
    isLoading,
    error,
    suggestions,
  }
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Category } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Legacy products function - removed to avoid conflicts
// Use the enhanced useProducts function below instead

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(id, name, parent_id)
        `,
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Categories
export function useCategories(parentId?: number | null, level?: number) {
  return useQuery({
    queryKey: ['categories', parentId, level],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name')

      if (parentId === undefined && level === undefined) {
        // Get all categories
      } else if (parentId === null || level === 1) {
        // Get top-level categories (departments)
        query = query.is('parent_id', null).eq('level', 1)
      } else if (parentId !== undefined) {
        // Get subcategories
        query = query.eq('parent_id', parentId)
      } else if (level !== undefined) {
        // Get categories by level
        query = query.eq('level', level)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Array<Category>
    },
  })
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['category-tree'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('level')
        .order('sort_order')
        .order('name')

      if (error) throw error

      // Build tree structure
      const categories = data as Array<Category>
      const categoryMap = new Map<
        number,
        Category & { children: Array<Category> }
      >()
      const rootCategories: Array<Category & { children: Array<Category> }> = []

      // Initialize map
      categories.forEach((cat) => {
        categoryMap.set(cat.category_id, { ...cat, children: [] })
      })

      // Build tree
      categories.forEach((cat) => {
        const categoryWithChildren = categoryMap.get(cat.category_id)!
        if (!cat.parent_id) {
          rootCategories.push(categoryWithChildren)
        } else {
          const parent = categoryMap.get(cat.parent_id)
          if (parent) {
            parent.children.push(categoryWithChildren)
          }
        }
      })

      return rootCategories
    },
  })
}

// Get category hierarchy with full paths
export function useCategoryHierarchy() {
  return useQuery({
    queryKey: ['category-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_hierarchy')
        .select('*')
        .order('level')
        .order('full_path')

      if (error) throw error
      return data
    },
  })
}

// Enhanced product queries
export function useProducts(options?: {
  categoryId?: number
  searchTerm?: string
  brandFilter?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
}) {
  const {
    categoryId,
    searchTerm,
    brandFilter,
    minPrice,
    maxPrice,
    page = 1,
    pageSize = 20,
  } = options || {}

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      if (searchTerm) {
        // Use the search function for text search
        const { data, error } = await supabase.rpc('search_products', {
          search_term: searchTerm,
          category_filter: categoryId || null,
          brand_filter: brandFilter || null,
          min_price: minPrice || null,
          max_price: maxPrice || null,
          page_size: pageSize,
          page_offset: (page - 1) * pageSize,
        })

        if (error) throw error
        return data
      } else {
        // Use regular query for category browsing
        let query = supabase
          .from('product_search')
          .select('*')
          .eq('is_active', true)

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
        if (brandFilter) {
          query = query.eq('brand', brandFilter)
        }
        if (minPrice !== undefined) {
          query = query.gte('effective_price', minPrice)
        }
        if (maxPrice !== undefined) {
          query = query.lte('effective_price', maxPrice)
        }

        query = query
          .order('is_featured', { ascending: false })
          .order('name')
          .range((page - 1) * pageSize, page * pageSize - 1)

        const { data, error } = await query

        if (error) throw error
        return data
      }
    },
  })
}

export function useProductsByCategory(
  categoryId: number,
  options?: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: 'ASC' | 'DESC'
  },
) {
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'name',
    sortDirection = 'ASC',
  } = options || {}

  return useQuery({
    queryKey: ['products-by-category', categoryId, options],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_products_by_category', {
        cat_id: categoryId,
        page_size: pageSize,
        page_offset: (page - 1) * pageSize,
        sort_by: sortBy,
        sort_direction: sortDirection,
      })

      if (error) throw error
      return data
    },
    enabled: !!categoryId,
  })
}

// Cart functionality
export function useCart(userId: string) {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(
          `
          *,
          product:products(product_id, name, price, brand)
        `,
        )
        .eq('cart_id', userId) // Assuming cart_id is used instead of user_id

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      cartId: string
      productId: string
      quantity: number
    }) => {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: params.cartId,
          product_id: params.productId,
          quantity: params.quantity,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.cartId] })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      quantity: number
      cartId: string
    }) => {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: params.quantity })
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.cartId] })
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; cartId: string }) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', params.id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.cartId] })
    },
  })
}

// Search functionality
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['product-search', query],
    queryFn: async () => {
      if (!query.trim()) return []

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          description,
          price,
          image_url,
          category:categories(name)
        `,
        )
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: query.length >= 2,
  })
}

// Test connection
export function useTestConnection() {
  return useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      const { error } = await supabase
        .from('categories')
        .select('count')
        .limit(1)

      if (error) throw error
      return { connected: true, timestamp: new Date().toISOString() }
    },
  })
}

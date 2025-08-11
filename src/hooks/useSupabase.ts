import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Category, Product } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Products
export function useProducts(params?: {
  categoryId?: string | null
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(
          `
          *,
          category:categories(id, name)
        `,
        )
        .order('name')

      if (params?.categoryId) {
        query = query.eq('category_id', params.categoryId)
      }

      if (params?.search) {
        query = query.or(
          `name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
        )
      }

      if (params?.limit) {
        query = query.limit(params.limit)
      }

      if (params?.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 10) - 1,
        )
      }

      const { data, error } = await query

      if (error) throw error
      return data as Array<Product & { category: Category }>
    },
  })
}

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
export function useCategories(parentId?: string | null) {
  return useQuery({
    queryKey: ['categories', parentId],
    queryFn: async () => {
      let query = supabase.from('categories').select('*').order('name')

      if (parentId === undefined) {
        // Get all categories
      } else if (parentId === null) {
        // Get top-level categories
        query = query.is('parent_id', null)
      } else {
        // Get subcategories
        query = query.eq('parent_id', parentId)
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
        .order('name')

      if (error) throw error

      // Build tree structure
      const categories = data as Array<Category>
      const categoryMap = new Map<
        string,
        Category & { children: Array<Category> }
      >()
      const rootCategories: Array<Category & { children: Array<Category> }> = []

      // Initialize map
      categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] })
      })

      // Build tree
      categories.forEach((cat) => {
        const categoryWithChildren = categoryMap.get(cat.id)!
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
          product:products(id, name, price, image_url)
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

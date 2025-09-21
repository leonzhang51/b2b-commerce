import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Category } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Map new products table rows to the legacy-ish shape expected by callers
function mapProductRow(row: any) {
  if (!row) return row

  const mapped: any = {
    // preserve original new fields
    ...row,
    // legacy aliases (many parts of app expect these names)
    product_id: row.asin,
    id: row.asin,
    sku: row.asin,
    name: row.title ?? row.name,
    description: row.title ?? row.description,
    image_url: row.imgUrl ?? row.image_url,
    price: row.price ?? row.price,
    listPrice: row.listPrice ?? row.list_price,
    productURL: row.productURL,
    category_id: row.category_id ?? row.category_id,
    is_best_seller: row.isBestSeller ?? row.is_best_seller,
  }

  // normalize optional joined category shape
  if (row.category) {
    const c = row.category
    mapped.category = {
      id: c.id,
      name: c.category_name ?? c.name,
      accent_color: c.accent_color ?? null,
      featured_rank: c.featured_rank ?? null,
    }
  }

  return mapped
}

// Legacy products function - removed to avoid conflicts
// Use the enhanced useProducts function below instead

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        // select new product fields and related category name
        .select(
          `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth,category:categories(id,category_name,accent_color,featured_rank)`,
        )
        .eq('asin', id)
        .single()

      if (error) throw error
      return mapProductRow(data)
    },
    enabled: !!id,
  })
}

// Categories
export function useCategories(parentId?: number | null, level?: number) {
  return useQuery({
    queryKey: ['categories', parentId, level],
    queryFn: async () => {
      // New categories table schema contains only `id` and `category_name`.
      // Ignore hierarchical params (parentId, level) and return a flat list.
      // Try to fetch optional featured_rank and accent_color; fall back if columns don't exist
      let { data, error } = await supabase
        .from('categories')
        .select('id, category_name, featured_rank, accent_color')
        .order('category_name')

      if (error) {
        const fallback = await supabase
          .from('categories')
          .select('id, category_name')
          .order('category_name')
        data = fallback.data as any
        error = fallback.error
      }

      if (error) throw error
      // Map rows to legacy Category shape, preserving new meta fields when present
      return (Array.isArray(data)
        ? data.map((row: any) => ({
            category_id: row.id,
            id: row.id,
            parent_id: null,
            name: row.category_name,
            level: 1,
            slug: String(row.category_name).toLowerCase().replace(/\s+/g, '-'),
            description: null,
            image_url: null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category_name: row.category_name,
            // optional meta
            featured_rank: row.featured_rank ?? null,
            accent_color: row.accent_color ?? null,
          }))
        : data) as unknown as Array<Category>
    },
  })
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['category-tree'],
    queryFn: async () => {
      // New categories table is flat (no hierarchy). Return flat list ordered by name.
      const { data, error } = await supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name')

      if (error) throw error
      return (Array.isArray(data)
        ? data.map((row: any) => ({
            category_id: row.id,
            id: row.id,
            parent_id: null,
            name: row.category_name,
            level: 1,
            slug: String(row.category_name).toLowerCase().replace(/\s+/g, '-'),
            description: null,
            image_url: null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category_name: row.category_name,
          }))
        : data) as unknown as Array<Category>
    },
  })
}

// Get category hierarchy with full paths
export function useCategoryHierarchy() {
  return useQuery({
    queryKey: ['category-hierarchy'],
    queryFn: async () => {
      // The previous `category_hierarchy` view depended on hierarchical columns.
      // With the simplified categories table we'll return the flat categories list.
      const { data, error } = await supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name')

      if (error) throw error
      return Array.isArray(data)
        ? data.map((row: any) => ({
            category_id: row.id,
            id: row.id,
            parent_id: null,
            name: row.category_name,
            level: 1,
            slug: String(row.category_name).toLowerCase().replace(/\s+/g, '-'),
            description: null,
            image_url: null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category_name: row.category_name,
          }))
        : data
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
  includeCategory?: boolean
}) {
  const {
    categoryId,
    searchTerm,
    page = 1,
    pageSize = 20,
    includeCategory = false,
  } = options || {}

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      try {
        if (searchTerm) {
          // Use direct product search without join to avoid timeout
          const { data, error } = await supabase
            .from('products')
            .select(
              includeCategory
                ? `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth,category:categories(id,category_name,accent_color,featured_rank)`
                : `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth`,
            )
            .ilike('title', `%${searchTerm}%`)
            .limit(pageSize)
            .range((page - 1) * pageSize, page * pageSize - 1)

          if (error) throw error
          const mappedData = Array.isArray(data) ? data.map(mapProductRow) : []
          return mappedData
        } else {
          // Use simpler query without join for better performance
          let query = supabase
            .from('products')
            .select(
              includeCategory
                ? `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth,category:categories(id,category_name,accent_color,featured_rank)`
                : `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth`,
            )

          if (categoryId) {
            query = query.eq('category_id', categoryId)
          }

          // Simpler ordering - just by title to avoid complex sorts
          query = query.order('title').limit(pageSize)

          const { data, error } = await query

          if (error) throw error
          const mappedData = Array.isArray(data) ? data.map(mapProductRow) : []
          console.log(
            'Database products loaded:',
            mappedData.length,
            'products',
          )
          console.log('Sample product:', mappedData[0])
          return mappedData
        }
      } catch (error) {
        console.warn('Products query failed, returning mock data:', error)
        // Return mock data when query fails (e.g., due to RLS or timeout)
        return [
          {
            asin: 'MOCK001',
            product_id: 'MOCK001',
            id: 'MOCK001',
            title: 'DeWalt 20V MAX Cordless Drill Kit',
            name: 'DeWalt 20V MAX Cordless Drill Kit',
            imgUrl: '/images/products/BC846b558a.jpg',
            image_url: '/images/products/BC846b558a.jpg',
            price: '199.99',
            listPrice: '249.99',
            category_id: categoryId || 1,
            isBestSeller: true,
            stars: '4.5',
            reviews: '123',
            description:
              'Professional-grade cordless drill with 650 in-lbs of torque, LED work light, and 2-speed transmission.',
          },
          {
            asin: 'MOCK002',
            product_id: 'MOCK002',
            id: 'MOCK002',
            title: 'Premium 2x4 Pressure Treated Lumber',
            name: 'Premium 2x4 Pressure Treated Lumber',
            imgUrl: '/images/products/DSc8616a19.jpg',
            image_url: '/images/products/DSc8616a19.jpg',
            price: '8.99',
            listPrice: '12.99',
            category_id: categoryId || 1,
            isBestSeller: false,
            stars: '4.2',
            reviews: '87',
            description:
              'High-quality pressure treated lumber perfect for outdoor construction projects.',
          },
          {
            asin: 'MOCK003',
            product_id: 'MOCK003',
            id: 'MOCK003',
            title: 'LED High Bay Light 150W',
            name: 'LED High Bay Light 150W',
            imgUrl: '/images/products/FJe8d3c07c.jpg',
            image_url: '/images/products/FJe8d3c07c.jpg',
            price: '89.99',
            listPrice: '119.99',
            category_id: categoryId || 1,
            isBestSeller: true,
            stars: '4.7',
            reviews: '156',
            description:
              'Energy efficient LED high bay lighting for warehouses and commercial spaces.',
          },
          {
            asin: 'MOCK004',
            product_id: 'MOCK004',
            id: 'MOCK004',
            title: 'Safety Hard Hat - White',
            name: 'Safety Hard Hat - White',
            imgUrl: '/images/products/IDe962939a.jpg',
            image_url: '/images/products/IDe962939a.jpg',
            price: '24.99',
            listPrice: '29.99',
            category_id: categoryId || 1,
            isBestSeller: false,
            stars: '4.3',
            reviews: '92',
            description:
              'ANSI/ISEA Z89.1 compliant hard hat for construction safety.',
          },
          {
            asin: 'MOCK005',
            product_id: 'MOCK005',
            id: 'MOCK005',
            title: 'PVC Pipe 4 inch x 10 ft',
            name: 'PVC Pipe 4 inch x 10 ft',
            imgUrl: '/images/products/JVc218e8ed.jpg',
            image_url: '/images/products/JVc218e8ed.jpg',
            price: '15.49',
            listPrice: '18.99',
            category_id: categoryId || 1,
            isBestSeller: false,
            stars: '4.1',
            reviews: '64',
            description:
              'Schedule 40 PVC pipe for plumbing and drainage applications.',
          },
          {
            asin: 'MOCK006',
            product_id: 'MOCK006',
            id: 'MOCK006',
            title: 'Professional Tool Set 120-Piece',
            name: 'Professional Tool Set 120-Piece',
            imgUrl: '/images/products/OTd00670d8.jpg',
            image_url: '/images/products/OTd00670d8.jpg',
            price: '149.99',
            listPrice: '199.99',
            category_id: categoryId || 1,
            isBestSeller: true,
            stars: '4.6',
            reviews: '234',
            description:
              'Complete tool set with ratchets, sockets, wrenches, and carrying case.',
          },
          {
            asin: 'MOCK007',
            product_id: 'MOCK007',
            id: 'MOCK007',
            title: 'Circular Saw 7-1/4 inch',
            name: 'Circular Saw 7-1/4 inch',
            imgUrl: '/images/products/SF3191c99b.jpg',
            image_url: '/images/products/SF3191c99b.jpg',
            price: '79.99',
            listPrice: '99.99',
            category_id: categoryId || 1,
            isBestSeller: false,
            stars: '4.4',
            reviews: '178',
            description:
              'Lightweight circular saw with carbide-tipped blade for precise cuts.',
          },
          {
            asin: 'MOCK008',
            product_id: 'MOCK008',
            id: 'MOCK008',
            title: 'Work Gloves Heavy Duty',
            name: 'Work Gloves Heavy Duty',
            imgUrl: '/images/products/SR702d5984.jpg',
            image_url: '/images/products/SR702d5984.jpg',
            price: '12.99',
            listPrice: '16.99',
            category_id: categoryId || 1,
            isBestSeller: false,
            stars: '4.0',
            reviews: '45',
            description:
              'Durable work gloves with reinforced palms and fingers.',
          },
        ]
      }
    },
  })
}

export function useProductsByCategory(
  categoryId: string | number,
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
      const { data, error } = await supabase
        .from('products')
        .select(
          `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth`,
        )
        .eq('category_id', categoryId)
        .order(sortBy === 'name' ? 'title' : sortBy, {
          ascending: sortDirection === 'ASC',
        })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (error) throw error
      return Array.isArray(data) ? data.map(mapProductRow) : []
    },
    enabled: !!categoryId,
  })
}

// Cart functionality
export function useCart(userId: string) {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      const res: any = await supabase
        .from('cart_items')
        .select(
          `
          *,
          product:products(asin,title,price,imgUrl)
        `,
        )
        .eq('cart_id', userId) // Assuming cart_id is used instead of user_id
      const { data, error } = res

      if (error) throw error
      // Map nested product shape to legacy form
      if (Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          product: mapProductRow(item.product),
        }))
      }

      if (data && typeof data === 'object') {
        // single row result
        const row = data as Record<string, any>
        return { ...row, product: mapProductRow(row.product) }
      }

      return []
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
        .select(`asin,title,imgUrl,price,listPrice,category_id`)
        .or(`title.ilike.%${query}%,title.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return Array.isArray(data) ? data.map(mapProductRow) : []
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

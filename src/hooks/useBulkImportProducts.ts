import { useMutation, useQueryClient } from '@tanstack/react-query'
import type CanonicalProduct from '@/types/product'
import { supabase } from '@/lib/supabase'

// Bulk import products
export function useBulkImportProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    // Accept canonical Product shapes and map to our DB payload.
    // We upsert on `sku` to avoid needing numeric ids from the frontend.
    mutationFn: async (products: Array<CanonicalProduct>) => {
      const payload = products.map((p) => {
        const priceNum =
          typeof p.price === 'number' ? p.price : Number(p.price ?? 0)
        // Try to resolve category_id from category object or category_id field
        const categoryId = (() => {
          if (p.category_id && typeof p.category_id === 'number')
            return p.category_id
          if (p.category && typeof (p.category as any).id === 'number')
            return (p.category as any).id
          return undefined
        })()

        return {
          sku: p.sku ?? null,
          name: p.name,
          description: p.description ?? null,
          short_description: p.title ?? p.name,
          price: priceNum,
          sale_price: null,
          cost_price: null,
          brand: (p as any).brand ?? '',
          stock_quantity: (p as any).stock ?? 0,
          min_stock_level: 0,
          max_stock_level: 0,
          is_active: true,
          is_featured: false,
          warranty_years: 0,
          category_id: categoryId,
        }
      })

      const { error } = await supabase
        .from('products')
        .upsert(payload, { onConflict: 'sku' })
      if (error) throw error
      return products.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Bulk import products
export function useBulkImportProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (products: Array<Product>) => {
      // Upsert to avoid duplicates by id
      const { error } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' })
      if (error) throw error
      return products.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

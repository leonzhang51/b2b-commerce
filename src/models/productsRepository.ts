import type { SupabaseClient } from '@supabase/supabase-js'

export type Product = {
  asin: string
  title?: string
  price?: number | null
  listPrice?: number | null
}

export type ProductsRepository = {
  getByAsins: (asins: Array<string>) => Promise<Array<Product>>
}

export function makeProductsRepository(
  client: SupabaseClient,
): ProductsRepository {
  return {
    async getByAsins(asins: Array<string>) {
      if (asins.length === 0) return []
      const { data, error } = await client
        .from('products')
        .select('asin, title, price, listPrice')
        .in('asin', asins)

      if (error) throw error
      return data as Array<Product>
    },
  }
}

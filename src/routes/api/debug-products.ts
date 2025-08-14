import { createServerFileRoute } from '@tanstack/react-start/server'
import { supabase } from '@/lib/supabase'

export const ServerRoute = createServerFileRoute('/api/debug-products').methods(
  {
    GET: async () => {
      try {
        // Check if products table exists and has data
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, category_id, price')
          .limit(5)

        // Also check categories table
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, parent_id')
          .limit(10)

        // Check products with category names
        const { data: productsWithCategories, error: joinError } =
          await supabase
            .from('products')
            .select(
              `
          id, 
          name, 
          category_id,
          price,
          categories!inner(id, name)
        `,
            )
            .limit(5)

        return new Response(
          JSON.stringify(
            {
              products: {
                data: products,
                error: productsError?.message,
                count: products?.length || 0,
              },
              categories: {
                data: categories,
                error: categoriesError?.message,
                count: categories?.length || 0,
              },
              productsWithCategories: {
                data: productsWithCategories,
                error: joinError?.message,
                count: productsWithCategories?.length || 0,
              },
              summary: {
                hasProducts: (products?.length || 0) > 0,
                hasCategories: (categories?.length || 0) > 0,
                categoriesLinked: (productsWithCategories?.length || 0) > 0,
              },
            },
            null,
            2,
          ),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (err) {
        return new Response(
          JSON.stringify(
            {
              error: 'Debug failed',
              details: err instanceof Error ? err.message : 'Unknown error',
            },
            null,
            2,
          ),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    },
  },
)

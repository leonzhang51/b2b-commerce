import { createServerFileRoute } from '@tanstack/react-start/server'
import { supabase } from '@/lib/supabase'

export const ServerRoute = createServerFileRoute('/api/products').methods({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const q = url.searchParams.get('q') ?? undefined
      const categoryId = url.searchParams.get('categoryId') ?? undefined
      const brand = url.searchParams.get('brand') ?? undefined
      const minPrice = url.searchParams.get('minPrice') ?? undefined
      const maxPrice = url.searchParams.get('maxPrice') ?? undefined
      const stock = url.searchParams.get('stock') ?? undefined
      const tag = url.searchParams.get('tag') ?? undefined

      console.log('API /products called with params:', {
        q,
        categoryId,
        brand,
        minPrice,
        maxPrice,
        stock,
        tag,
      })

      // Build query with filters from the start
      let supa = supabase.from('products').select('*')

      // Apply filters
      if (q) {
        supa = supa.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        console.log('Applied search filter:', q)
      }
      if (categoryId) {
        supa = supa.eq('category_id', categoryId)
        console.log('Applied category filter:', categoryId)
      }
      if (brand) {
        supa = supa.eq('brand', brand)
        console.log('Applied brand filter:', brand)
      }
      if (minPrice) {
        supa = supa.gte('price', Number(minPrice))
        console.log('Applied min price filter:', minPrice)
      }
      if (maxPrice) {
        supa = supa.lte('price', Number(maxPrice))
        console.log('Applied max price filter:', maxPrice)
      }
      if (stock === 'in') {
        supa = supa.gt('stock', 0)
        console.log('Applied in-stock filter')
      } else if (stock === 'out') {
        supa = supa.eq('stock', 0)
        console.log('Applied out-of-stock filter')
      }
      if (tag) {
        supa = supa.contains('tags', [tag])
        console.log('Applied tag filter:', tag)
      }

      const { data, error } = await supa.limit(20)

      if (error) {
        console.error('Query error:', error)

        // If table doesn't exist, return empty array with helpful message
        if (
          error.message.includes('relation') &&
          error.message.includes('does not exist')
        ) {
          return new Response(
            JSON.stringify({
              data: [],
              message:
                'Products table not found. Please run database setup scripts.',
              error: error.message,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        return new Response(
          JSON.stringify({
            error: 'Database query failed',
            details: error.message,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }

      console.log(`Returning ${data.length} products for query`)

      // If no products found, log helpful debug info
      if (data.length === 0) {
        console.log(
          'No products found with current filters. Checking if any products exist...',
        )
        const { data: allProducts, error: countError } = await supabase
          .from('products')
          .select('id, name, category_id')
          .limit(5)

        if (!countError) {
          console.log('Sample products in database:', allProducts)
        }
      } else {
        // Log sample of returned products
        console.log('Sample returned products:', data.slice(0, 2))
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('API error:', err)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          details: err instanceof Error ? err.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  },
})

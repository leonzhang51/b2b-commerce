import { createServerFileRoute } from '@tanstack/react-start/server'
import { supabase } from '@/lib/supabase'

export const ServerRoute = createServerFileRoute('/api/products').methods({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? undefined
    const category = url.searchParams.get('category') ?? undefined
    const brand = url.searchParams.get('brand') ?? undefined
    const minPrice = url.searchParams.get('minPrice') ?? undefined
    const maxPrice = url.searchParams.get('maxPrice') ?? undefined
    const stock = url.searchParams.get('stock') ?? undefined
    const tag = url.searchParams.get('tag') ?? undefined

    let supa = supabase.from('products').select('*')
    if (q) {
      supa = supa.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    }
    if (category) {
      supa = supa.eq('category_id', category)
    }
    if (brand) {
      supa = supa.eq('brand', brand)
    }
    if (minPrice) {
      supa = supa.gte('price', Number(minPrice))
    }
    if (maxPrice) {
      supa = supa.lte('price', Number(maxPrice))
    }
    if (stock === 'in') {
      supa = supa.gt('stock', 0)
    } else if (stock === 'out') {
      supa = supa.eq('stock', 0)
    }
    if (tag) {
      supa = supa.contains('tags', [tag])
    }
    const { data, error } = await supa
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})

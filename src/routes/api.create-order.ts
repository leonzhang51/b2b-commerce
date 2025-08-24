import { createServerFileRoute } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const _SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const _SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

type OrderItemInput = {
  asin: string
  name?: string
  unit_price: number
  quantity: number
}

const POST = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json()
    const {
      userId: payloadUserId,
      items,
      currency,
    } = body as {
      userId?: string
      items: Array<OrderItemInput>
      currency?: string
    }

    // Derive authenticated user from Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Create a request-scoped Supabase client with the provided token
    const serverSupabase = createClient(
      _SUPABASE_URL as string,
      _SUPABASE_ANON_KEY as string,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      },
    )

    const { data, error } = await serverSupabase.auth.getUser()
    if (error) {
      return new Response(JSON.stringify({ error: 'Invalid auth token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userId = data.user.id
    // If client supplied a userId, ensure it matches authenticated user
    if (payloadUserId && payloadUserId !== userId) {
      return new Response(JSON.stringify({ error: 'userId mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate products and compute totals
    const asins = items.map((i) => i.asin)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('asin, title, price, listPrice')
      .in('asin', asins)

    if (prodError) throw prodError

    // Map product prices by asin
    const priceMap = new Map<string, number>()
    const prods = Array.isArray(products) ? products : []
    for (const p of prods) {
      priceMap.set(p.asin, p.price || p.listPrice || 0)
    }

    let total = 0
    // compute totals locally for validation/feedback (DB will authoritative price)
    for (const it of items) {
      const unit = priceMap.get(it.asin) || it.unit_price || 0
      const quantity = Math.max(1, it.quantity || 1)
      const lineTotal = Number((unit * quantity).toFixed(2))
      total += lineTotal
    }

    // Use DB-side RPC for transactional insert to avoid partial writes
    const rpcPayload = items.map((it) => ({
      asin: it.asin,
      name: it.name ?? null,
      unit_price: it.unit_price,
      quantity: it.quantity,
      metadata: null,
    }))

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'create_order',
      {
        p_user_id: userId,
        p_items: rpcPayload,
        p_currency: currency ?? 'USD',
      },
    )

    if (rpcError) throw rpcError

    // rpc returns an array of rows (table result), take first
    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData
    return new Response(
      JSON.stringify({
        orderId: result?.order_id,
        total: Number(result?.total || 0),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const createOrderHandler = POST

export const ServerRoute = createServerFileRoute(
  '/api/create-order' as any,
).methods({ POST })

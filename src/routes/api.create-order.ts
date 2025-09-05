import { createServerFileRoute } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'

const _SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const _SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

type OrderItemInput = {
  asin: string
  name?: string
  unit_price: number
  quantity: number
  sku?: string
  metadata?: Record<string, any>
}

type Address = {
  name?: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

const POST = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json()
    const {
      user_id: payloadUserId,
      items,
      currency,
      shipping_address,
      billing_address,
      metadata,
    } = body as {
      user_id?: string
      items: Array<OrderItemInput>
      currency?: string
      shipping_address?: Address
      billing_address?: Address
      metadata?: Record<string, any>
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

    // Calculate total from items
    const total = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    )

    // Create order in database
    const { data: orderData, error: orderError } = await serverSupabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        currency: currency || 'USD',
        status: 'placed',
        shipping_address,
        billing_address,
        metadata,
      })
      .select('id')
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const orderId = orderData.id

    // Insert order items into order_items table
    const orderItemsPayload = items.map((item) => ({
      order_id: orderId,
      product_asin: item.asin,
      sku: item.sku ?? null,
      name: item.name ?? '',
      unit_price: item.unit_price,
      quantity: item.quantity,
      metadata: item.metadata ?? {},
    }))

    const { error: itemsError } = await serverSupabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    return new Response(JSON.stringify({ orderId, total }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
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

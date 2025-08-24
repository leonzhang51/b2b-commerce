import { createServerFileRoute } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { makeProductsRepository } from '@/models/productsRepository'
import { makeOrdersRepository } from '@/models/ordersRepository'
import { makeCheckoutUseCase } from '@/usecases/CheckoutUseCase'

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

    // Delegate business logic to CheckoutUseCase (MVP)
    const productsRepo = makeProductsRepository(supabase)
    const ordersRepo = makeOrdersRepository(supabase)
    const checkout = makeCheckoutUseCase({ productsRepo, ordersRepo })

    const { orderId, total } = await checkout.checkout(userId, items, currency)

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

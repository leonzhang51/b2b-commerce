import type { SupabaseClient } from '@supabase/supabase-js'

export type OrderResult = {
  order_id: string
  total: number
}

export type OrdersRepository = {
  createOrderRpc: (
    userId: string,
    items: Array<any>,
    currency?: string,
    idempotencyKey?: string,
  ) => Promise<OrderResult>
  findByIdempotencyKey: (
    userId: string,
    idempotencyKey: string,
  ) => Promise<OrderResult | null>
  recordIdempotencyKey: (
    orderId: string,
    idempotencyKey: string,
  ) => Promise<void>
}

export function makeOrdersRepository(client: SupabaseClient): OrdersRepository {
  return {
    async createOrderRpc(
      userId: string,
      items: Array<any>,
      currency = 'USD',
      idempotencyKey?: string,
    ) {
      const { data, error } = await client.rpc('create_order', {
        p_user_id: userId,
        p_items: items,
        p_currency: currency,
        p_idempotency_key: idempotencyKey ?? null,
      })

      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      return {
        order_id: row?.order_id,
        total: Number(row?.total ?? 0),
      }
    },
    async findByIdempotencyKey(userId: string, idempotencyKey: string) {
      // Look for an order with matching metadata->>'idempotency_key'
      const { data, error } = await client
        .from('orders')
        .select('id, total, metadata')
        .eq('user_id', userId)
        .eq('metadata->>idempotency_key', idempotencyKey)
        .limit(1)

      if (error) throw error
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!row) return null
      return { order_id: row.id, total: Number(row.total ?? 0) }
    },
    async recordIdempotencyKey(orderId: string, idempotencyKey: string) {
      const { error } = await client
        .from('orders')
        .update({ metadata: { idempotency_key: idempotencyKey } })
        .eq('id', orderId)

      if (error) throw error
    },
  }
}

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
  ) => Promise<OrderResult>
}

export function makeOrdersRepository(client: SupabaseClient): OrdersRepository {
  return {
    async createOrderRpc(userId: string, items: Array<any>, currency = 'USD') {
      const { data, error } = await client.rpc('create_order', {
        p_user_id: userId,
        p_items: items,
        p_currency: currency,
      })

      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      return {
        order_id: row?.order_id,
        total: Number(row?.total ?? 0),
      }
    },
  }
}

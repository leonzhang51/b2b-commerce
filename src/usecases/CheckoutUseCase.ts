import type { ProductsRepository } from '@/models/productsRepository'
import type { OrdersRepository } from '@/models/ordersRepository'
import { recordMetric } from '@/lib/metrics'

export type OrderItemInput = {
  asin: string
  name?: string | null
  unit_price: number
  quantity: number
  metadata?: any
}

export type CheckoutResult = {
  orderId: string
  total: number
}

export function makeCheckoutUseCase(deps: {
  productsRepo: ProductsRepository
  ordersRepo: OrdersRepository
}) {
  const { productsRepo, ordersRepo } = deps

  return {
    async checkout(
      userId: string,
      items: Array<OrderItemInput>,
      currency?: string,
      idempotencyKey?: string,
    ): Promise<CheckoutResult> {
      if (!userId) throw new Error('missing userId')
      if (!Array.isArray(items) || items.length === 0)
        throw new Error('no items')

      const asins = items.map((i) => i.asin)
      const products = await productsRepo.getByAsins(asins)
      const priceMap = new Map<string, number>()
      for (const p of products) {
        // Normalize price: prefer explicit numeric price, fall back to listPrice or 0
        const price = typeof p.price === 'number' ? p.price : (p.listPrice ?? 0)
        priceMap.set(p.asin, price)
      }

      const rpcPayload = items.map((it) => ({
        asin: it.asin,
        name: it.name ?? null,
        unit_price: it.unit_price,
        quantity: it.quantity,
        metadata: it.metadata ?? null,
      }))

      // Basic server-side validation: ensure prices exist
      for (const it of items) {
        const serverPrice = priceMap.get(it.asin) ?? 0
        if (serverPrice === 0)
          throw new Error(`unknown product price for ${it.asin}`)
      }

      // Idempotency: if key provided, check for existing order
      if (idempotencyKey) {
        const existing = await ordersRepo.findByIdempotencyKey(
          userId,
          idempotencyKey,
        )
        if (existing) {
          recordMetric('idempotency.hit', { userId, idempotencyKey })
          return { orderId: existing.order_id, total: existing.total }
        }
        recordMetric('idempotency.miss', { userId, idempotencyKey })
      }

      const created = await ordersRepo.createOrderRpc(
        userId,
        rpcPayload,
        currency,
        idempotencyKey,
      )

      // Persist idempotency key in orders.metadata for future lookups
      if (idempotencyKey) {
        try {
          await ordersRepo.recordIdempotencyKey(
            created.order_id,
            idempotencyKey,
          )
          recordMetric('idempotency.recorded', { userId, idempotencyKey })
        } catch (err) {
          // Non-fatal: order created successfully; record failure metric and continue
          recordMetric('idempotency.record_failed', { userId, idempotencyKey })
        }
      }

      return { orderId: created.order_id, total: created.total }
    },
  }
}

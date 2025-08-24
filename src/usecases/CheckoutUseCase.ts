import type { ProductsRepository } from '@/models/productsRepository'
import type { OrdersRepository } from '@/models/ordersRepository'

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
    ): Promise<CheckoutResult> {
      if (!userId) throw new Error('missing userId')
      if (!Array.isArray(items) || items.length === 0)
        throw new Error('no items')

      const asins = items.map((i) => i.asin)
      const products = await productsRepo.getByAsins(asins)
      const priceMap = new Map<string, number>()
      for (const p of products) {
        priceMap.set(p.asin, p.price ?? p.listPrice ?? 0)
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

      const created = await ordersRepo.createOrderRpc(
        userId,
        rpcPayload,
        currency,
      )
      return { orderId: created.order_id, total: created.total }
    },
  }
}

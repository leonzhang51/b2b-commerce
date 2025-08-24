import { describe, expect, it } from 'vitest'
import { makeCheckoutUseCase } from '@/usecases/CheckoutUseCase'

describe('CheckoutUseCase', () => {
  it('creates order when products have prices', async () => {
    const productsRepo = {
      getByAsins: (asins: Array<string>) =>
        asins.map((a) => ({ asin: a, price: 10 })) as any,
    }

    const ordersRepo = {
      createOrderRpc: (_userId: string, _items: Array<any>) =>
        ({ order_id: 'o-1', total: 20 }) as any,
    }

    const usecase = makeCheckoutUseCase({
      productsRepo: productsRepo as any,
      ordersRepo: ordersRepo as any,
    })
    const res = await usecase.checkout('u-1', [
      { asin: 'A1', unit_price: 10, quantity: 2 },
    ])
    expect(res.orderId).toBe('o-1')
    expect(res.total).toBe(20)
  })

  it('throws when product price missing', async () => {
    const productsRepo = { getByAsins: () => [] }
    const ordersRepo = { createOrderRpc: () => ({ order_id: 'x', total: 0 }) }
    const usecase = makeCheckoutUseCase({
      productsRepo: productsRepo as any,
      ordersRepo: ordersRepo as any,
    })
    await expect(() =>
      usecase.checkout('u-1', [{ asin: 'A1', unit_price: 10, quantity: 1 }]),
    ).rejects.toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import { makeCheckoutUseCase } from '@/usecases/CheckoutUseCase'

describe('Idempotency behavior', () => {
  it('returns existing order when idempotency key present', async () => {
    const productsRepo = { getByAsins: () => [{ asin: 'A1', price: 10 }] }
    const ordersRepo = {
      findByIdempotencyKey: () => ({ order_id: 'existing-1', total: 10 }),
      createOrderRpc: () => ({ order_id: 'new-1', total: 20 }),
      recordIdempotencyKey: () => {},
    }

    const usecase = makeCheckoutUseCase({
      productsRepo: productsRepo as any,
      ordersRepo: ordersRepo as any,
    })
    const res = await usecase.checkout(
      'u-1',
      [{ asin: 'A1', unit_price: 10, quantity: 1 }],
      'USD',
      'idem-123',
    )
    expect(res.orderId).toBe('existing-1')
  })

  it('creates order and records idempotency key when not present', async () => {
    let recordedKey: string | null = null
    const productsRepo = { getByAsins: () => [{ asin: 'A1', price: 10 }] }
    const ordersRepo = {
      findByIdempotencyKey: () => null,
      createOrderRpc: () => ({ order_id: 'new-1', total: 20 }),
      recordIdempotencyKey: (_id: string, key: string) => {
        recordedKey = key
      },
    }

    const usecase = makeCheckoutUseCase({
      productsRepo: productsRepo as any,
      ordersRepo: ordersRepo as any,
    })
    const res = await usecase.checkout(
      'u-1',
      [{ asin: 'A1', unit_price: 10, quantity: 1 }],
      'USD',
      'idem-456',
    )
    expect(res.orderId).toBe('new-1')
    expect(recordedKey).toBe('idem-456')
  })
})

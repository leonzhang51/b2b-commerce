/* eslint-disable import/first */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock createClient before importing the route to ensure the module uses the mock
vi.mock('@supabase/supabase-js', () => {
  const mockUser = { id: 'user-1' }
  const mockServerSupabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
    },
    rpc: () =>
      Promise.resolve({
        data: [{ order_id: 'order-1', total: 123.45 }],
        error: null,
      }),
    from: (_tableName: string) => {
      return {
        select: (_cols: string) => ({
          in: (_col: string, asins: Array<string>) => ({
            data: asins.map((a: string) => ({
              asin: a,
              title: `P-${a}`,
              price: 10,
              listPrice: null,
            })),
            error: null,
          }),
        }),
      }
    },
  }
  return { createClient: () => mockServerSupabase }
})

import { createOrderHandler } from '@/routes/api.create-order'

// Simple Request mock helper
function makeReq(body: any, token?: string) {
  return {
    json: () => Promise.resolve(body),
    headers: new Map([['authorization', token ? `Bearer ${token}` : '']]),
  } as any as Request
}

describe('api.create-order route', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 401 when missing token', async () => {
    const res = await createOrderHandler({
      request: makeReq({ items: [] }),
    } as any)
    const body = await res.text()
    expect(res.status).toBe(401)
    expect(body).toContain('Missing Authorization token')
  })

  it('calls RPC and returns 201 on success', async () => {
    // Re-import the route after module-scoped mocking
    const { createOrderHandler: handler } = await import(
      '@/routes/api.create-order'
    )
    const body = {
      items: [{ asin: 'ASIN1', unit_price: 10, quantity: 2 }],
    }

    const res: any = await handler({
      request: makeReq(body, 'token-123'),
    } as any)
    const text = await res.text()
    expect(res.status).toBe(201)
    expect(text).toContain('order-1')
    expect(text).toContain('123.45')
  })
})

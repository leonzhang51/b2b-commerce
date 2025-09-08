import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { AuthUser } from '@/types/auth'
import type { CartItem } from '@/types/cart'
import { useCheckout } from '@/hooks/useCheckout'
import { useUserStore } from '@/store/userStore'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

const mockUser: AuthUser = {
  id: '123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  role: 'admin',
  permissions: ['read', 'write'],
}

const mockCartItems: Array<CartItem> = [
  {
    id: '1',
    productId: 'prod-1',
    name: 'Test Product',
    price: 29.99,
    quantity: 1,
    imageUrl: 'https://example.com/image.jpg',
    totalPrice: 29.99 * 1,
  },
]

const mockFormData = {
  shipping_address: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US',
    phone: '555-1234',
  },
  billing_address: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US',
    phone: '555-1234',
  },
  same_as_shipping: true,
  payment_method: 'credit_card',
  notes: 'Test order',
}

describe('useCheckout Authentication', () => {
  beforeEach(() => {
    // Clear all mocks and store state
    vi.clearAllMocks()
    useUserStore.getState().clearUser()
    useCartStore.getState().clearCart()

    // Reset mocks
    vi.mocked(fetch).mockClear()
    vi.mocked(supabase.auth.getSession).mockClear()
  })

  it('should include Authorization header with Bearer token in API call', async () => {
    // Mock successful session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-access-token-123',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: { id: '123' },
        },
      },
      error: null,
    } as any)

    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: 'order-123', total: 29.99 }),
    } as Response)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    const { result } = renderHook(() => useCheckout())

    // Call createOrder
    await result.current.createOrder(mockFormData)

    // Verify that fetch was called with Authorization header
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token-123',
        },
        body: expect.any(String),
      })
    })

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('should handle missing session token', async () => {
    // Mock session without token
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    const { result } = renderHook(() => useCheckout())

    // Call createOrder
    await result.current.createOrder(mockFormData)

    // Verify that fetch was NOT called
    expect(fetch).not.toHaveBeenCalled()

    // Verify error was set
    expect(result.current.error).toBe(
      'No valid session found. Please sign in again.',
    )

    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should handle session error', async () => {
    // Mock session error
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: { message: 'Session expired' },
    } as any)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    const { result } = renderHook(() => useCheckout())

    // Call createOrder
    await result.current.createOrder(mockFormData)

    // Verify that fetch was NOT called
    expect(fetch).not.toHaveBeenCalled()

    // Verify error was set
    expect(result.current.error).toBe(
      'No valid session found. Please sign in again.',
    )

    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should handle API authentication error (401)', async () => {
    // Mock successful session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'invalid-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: { id: '123' },
        },
      },
      error: null,
    } as any)

    // Mock 401 API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid auth token' }),
    } as Response)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    const { result } = renderHook(() => useCheckout())

    // Call createOrder
    await result.current.createOrder(mockFormData)

    // Verify that fetch was called with the invalid token
    expect(fetch).toHaveBeenCalledWith('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token',
      },
      body: expect.any(String),
    })

    // Verify error was set
    expect(result.current.error).toBe('Invalid auth token')

    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled()

    // Verify cart was NOT cleared
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { convertToCartItems, useShoppingList } from '@/hooks/useShoppingList'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Mock dependencies
vi.mock('@/hooks/useAuth')
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))

const mockUseAuth = vi.mocked(useAuth)
const mockSupabase = vi.mocked(supabase)

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useShoppingList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      loginAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    })

    const { result } = renderHook(() => useShoppingList(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.suggestion).toBeUndefined()
    expect(result.current.hasData).toBe(false)
  })

  it('should fetch shopping list suggestions for authenticated user', async () => {
    const mockUser: any = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'buyer',
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      loginAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    })

    // Mock order items response
    const mockOrderItems = [
      {
        product_asin: 'ASIN123',
        name: 'Test Product 1',
        unit_price: 10.99,
        quantity: 2,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        product_asin: 'ASIN123',
        name: 'Test Product 1',
        unit_price: 10.99,
        quantity: 1,
        created_at: '2024-01-10T10:00:00Z',
      },
    ]

    // Mock products response
    const mockProducts = [
      {
        asin: 'ASIN123',
        title: 'Test Product 1',
        imgUrl: '/test-image.jpg',
        price: '10.99',
        category_id: 1,
      },
    ]

    // Setup mock chain for order items
    const mockOrderSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve({ data: mockOrderItems, error: null }),
          ),
        })),
      })),
    }))

    // Setup mock chain for products
    const mockProductSelect = vi.fn(() => ({
      in: vi.fn(() => Promise.resolve({ data: mockProducts, error: null })),
    }))

    ;(mockSupabase as unknown as any).from = vi
      .fn()
      .mockImplementation((table: string) => {
        if (table === 'order_items') {
          return { select: mockOrderSelect }
        } else if (table === 'products') {
          return { select: mockProductSelect }
        }
        return { select: vi.fn() }
      })

    const { result } = renderHook(() => useShoppingList(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.suggestion).toBeDefined()
    expect(result.current.hasData).toBe(true)
    expect(result.current.suggestion?.items).toHaveLength(1)
    expect(result.current.suggestion?.items[0]).toMatchObject({
      productId: 'ASIN123',
      name: 'Test Product 1',
      price: 10.99,
      orderFrequency: 2,
    })
  })

  it('should handle errors gracefully', async () => {
    const mockUser: any = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'buyer',
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      loginAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    })

    // Mock error response
    const mockOrderSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            }),
          ),
        })),
      })),
    }))

    ;(mockSupabase as unknown as any).from = vi.fn().mockImplementation(() => ({
      select: mockOrderSelect,
    }))

    const { result } = renderHook(() => useShoppingList(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.suggestion).toBeUndefined()
    expect(result.current.hasData).toBe(false)
  })
})

describe('convertToCartItems', () => {
  it('should convert shopping list items to cart items format', () => {
    const shoppingListItems = [
      {
        productId: 'ASIN123',
        name: 'Test Product 1',
        price: 10.99,
        imageUrl: '/test-image.jpg',
        suggestedQuantity: 2,
        lastOrderedDate: '2024-01-15T10:00:00Z',
        orderFrequency: 3,
        category: '1',
      },
      {
        productId: 'ASIN456',
        name: 'Test Product 2',
        price: 25.5,
        imageUrl: '/test-image2.jpg',
        suggestedQuantity: 1,
        lastOrderedDate: '2024-01-10T10:00:00Z',
        orderFrequency: 1,
        category: '2',
      },
    ]

    const quantities = {
      ASIN123: 3,
      ASIN456: 0, // This should be filtered out
    }

    const result = convertToCartItems(shoppingListItems, quantities)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'shopping-list-ASIN123',
      productId: 'ASIN123',
      name: 'Test Product 1',
      price: 10.99,
      imageUrl: '/test-image.jpg',
      quantity: 3,
    })
  })

  it('should filter out items with zero quantity', () => {
    const shoppingListItems = [
      {
        productId: 'ASIN123',
        name: 'Test Product 1',
        price: 10.99,
        suggestedQuantity: 2,
        lastOrderedDate: '2024-01-15T10:00:00Z',
        orderFrequency: 3,
      },
    ]

    const quantities = {
      ASIN123: 0,
    }

    const result = convertToCartItems(shoppingListItems, quantities)

    expect(result).toHaveLength(0)
  })

  it('should handle empty shopping list', () => {
    const result = convertToCartItems([], {})
    expect(result).toHaveLength(0)
  })
})

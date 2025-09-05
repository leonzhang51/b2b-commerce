import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { AuthUser } from '@/types/auth'
import type { CartItem } from '@/types/cart'
import { useUserStore } from '@/store/userStore'
import { useCartStore } from '@/store/cartStore'
import CheckoutPage from '@/routes/checkout'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock Supabase auth
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

const mockUser: AuthUser = {
  id: '123',
  email: 'john.doe@example.com',
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
    name: 'Test Product 1',
    price: 29.99,
    quantity: 1,
    imageUrl: 'https://example.com/image1.jpg',
  },
]

describe('CheckoutPage User Data Integration', () => {
  beforeEach(() => {
    // Clear all mocks and store state
    vi.clearAllMocks()
    useUserStore.getState().clearUser()
    useCartStore.getState().clearCart()

    // Reset fetch mock
    vi.mocked(fetch).mockClear()
  })

  it('should pre-fill form with user data when user is available', async () => {
    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item)
    })

    render(<CheckoutPage />)

    // Wait for the form to be populated with user data
    await waitFor(
      () => {
        const nameInputs = screen.getAllByDisplayValue('John Doe')
        expect(nameInputs.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )

    // Verify the debug info shows user data
    expect(screen.getByText(/User:/)).toBeInTheDocument()
    expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument()
  })

  it('should show empty form when no user is available', () => {
    // Add cart items but no user
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item)
    })

    render(<CheckoutPage />)

    // Should show debug info with no user
    expect(screen.getByText(/User: No user/)).toBeInTheDocument()
    expect(screen.getByText(/Form name: Empty/)).toBeInTheDocument()
  })

  it('should update form when user data becomes available later', async () => {
    // Add cart items but no user initially
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item)
    })

    render(<CheckoutPage />)

    // Initially should show no user
    expect(screen.getByText(/User: No user/)).toBeInTheDocument()

    // Add user data
    useUserStore.getState().setUser(mockUser)

    // Wait for the form to be updated with user data
    await waitFor(
      () => {
        const nameInputs = screen.getAllByDisplayValue('John Doe')
        expect(nameInputs.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )

    // Verify the debug info shows user data
    expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument()
  })

  it('should handle user with only first and last name', async () => {
    const userWithoutFullName: AuthUser = {
      id: '456',
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'buyer',
    }

    // Set up user and cart
    useUserStore.getState().setUser(userWithoutFullName)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item)
    })

    render(<CheckoutPage />)

    // Wait for the form to be populated with computed name
    await waitFor(
      () => {
        const nameInputs = screen.getAllByDisplayValue('Jane Smith')
        expect(nameInputs.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

  it('should handle user with only first name', async () => {
    const userWithOnlyFirstName: AuthUser = {
      id: '789',
      email: 'bob@example.com',
      first_name: 'Bob',
      role: 'buyer',
    }

    // Set up user and cart
    useUserStore.getState().setUser(userWithOnlyFirstName)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item)
    })

    render(<CheckoutPage />)

    // Wait for the form to be populated with first name only
    await waitFor(
      () => {
        const nameInputs = screen.getAllByDisplayValue('Bob')
        expect(nameInputs.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })
})

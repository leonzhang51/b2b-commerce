import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { AuthUser } from '@/types/auth'
import type { CartItem } from '@/types/cart'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'
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
    name: 'Test Product 1',
    price: 29.99,
    quantity: 2,
    imageUrl: 'https://example.com/image1.jpg',
    totalPrice: 29.99 * 2,
  },
  {
    id: '2',
    productId: 'prod-2',
    name: 'Test Product 2',
    price: 49.99,
    quantity: 1,
    imageUrl: 'https://example.com/image2.jpg',
    totalPrice: 49.99 * 1,
  },
]

describe('CheckoutPage', () => {
  beforeEach(() => {
    // Clear all mocks and store state
    vi.clearAllMocks()
    useUserStore.getState().clearUser()
    useCartStore.getState().clearCart()

    // Reset fetch mock
    vi.mocked(fetch).mockClear()
  })

  it('should show empty cart message when cart is empty', () => {
    render(<CheckoutPage />)

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(
      screen.getByText('Add some items to your cart before checking out.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
  })

  it('should display checkout form when cart has items', () => {
    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Shipping Address')).toBeInTheDocument()
    expect(screen.getByText('Billing Address')).toBeInTheDocument()
    expect(screen.getByText('Order Summary')).toBeInTheDocument()

    // Check if cart items are displayed
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('should pre-fill user information in form', () => {
    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    // Check if user's name is pre-filled
    const nameInputs = screen.getAllByDisplayValue('John Doe')
    expect(nameInputs.length).toBeGreaterThan(0)
  })

  it('should handle same as shipping checkbox', () => {
    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    const sameAsShippingCheckbox = screen.getByRole('checkbox', {
      name: /same as shipping/i,
    })
    expect(sameAsShippingCheckbox).toBeChecked()

    // Uncheck the checkbox
    fireEvent.click(sameAsShippingCheckbox)
    expect(sameAsShippingCheckbox).not.toBeChecked()

    // Should show billing address fields
    const billingNameInputs = screen.getAllByDisplayValue('John Doe')
    expect(billingNameInputs.length).toBeGreaterThan(1) // Both shipping and billing
  })

  it('should calculate and display correct totals', () => {
    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    // Check subtotal calculation (29.99 * 2 + 49.99 * 1 = 109.97)
    const totalElements = screen.getAllByText('$109.97')
    expect(totalElements.length).toBeGreaterThan(0)

    // Check individual item totals
    expect(screen.getByText('$59.98')).toBeInTheDocument() // 29.99 * 2
    expect(screen.getByText('$49.99')).toBeInTheDocument() // 49.99 * 1
  })

  it('should submit order successfully', async () => {
    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orderId: 'order-123', total: 109.97 }),
    } as Response)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    // Fill in required fields using placeholder text or other methods
    const streetInput = screen.getByDisplayValue('')
    const inputs = screen.getAllByDisplayValue('')
    const cityInput = inputs[1] // Second empty input should be city
    const stateInput = inputs[2] // Third empty input should be state
    const postalCodeInput = inputs[3] // Fourth empty input should be postal code

    fireEvent.change(streetInput, { target: { value: '123 Main St' } })
    fireEvent.change(cityInput, { target: { value: 'Anytown' } })
    fireEvent.change(stateInput, { target: { value: 'CA' } })
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(submitButton)

    // Wait for API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/create-order',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('123 Main St'),
        }),
      )
    })

    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })

    // Check if cart was cleared
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should handle API errors', async () => {
    // Mock API error response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Payment failed' }),
    } as Response)

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    // Fill in required fields using placeholder text or other methods
    const inputs = screen.getAllByDisplayValue('')
    const streetInput = inputs[0] // First empty input should be street
    const cityInput = inputs[1] // Second empty input should be city
    const stateInput = inputs[2] // Third empty input should be state
    const postalCodeInput = inputs[3] // Fourth empty input should be postal code

    fireEvent.change(streetInput, { target: { value: '123 Main St' } })
    fireEvent.change(cityInput, { target: { value: 'Anytown' } })
    fireEvent.change(stateInput, { target: { value: 'CA' } })
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument()
    })

    // Check that navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled()

    // Check that cart was NOT cleared
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('should show loading state during submission', async () => {
    // Mock delayed API response
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ orderId: 'order-123', total: 109.97 }),
              } as Response),
            100,
          ),
        ),
    )

    // Set up user and cart
    useUserStore.getState().setUser(mockUser)
    mockCartItems.forEach((item) => {
      useCartStore.getState().addItem(item, 'buyer')
    })

    render(<CheckoutPage />)

    // Fill in required fields using placeholder text or other methods
    const inputs = screen.getAllByDisplayValue('')
    const streetInput = inputs[0] // First empty input should be street
    fireEvent.change(streetInput, { target: { value: '123 Main St' } })

    const cityInput = screen.getByLabelText(/city/i)
    fireEvent.change(cityInput, { target: { value: 'Anytown' } })

    const stateInput = screen.getByLabelText(/state/i)
    fireEvent.change(stateInput, { target: { value: 'CA' } })

    const postalCodeInput = screen.getByLabelText(/postal code/i)
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(submitButton)

    // Check loading state
    expect(screen.getByText('Placing Order...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})

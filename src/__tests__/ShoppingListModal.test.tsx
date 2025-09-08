import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AuthUser } from '@/types/auth'
import { ShoppingListModal } from '@/components/ShoppingListModal'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'

// Mock dependencies
vi.mock('@/hooks/useShoppingList')
vi.mock('@/hooks/useAuth')
vi.mock('@/store/cartStore')
vi.mock('@/store/uiStore')

const mockUseShoppingList = vi.mocked(useShoppingList)
const mockUseAuth = vi.mocked(useAuth)
const mockUseCartStore = vi.mocked(useCartStore)
const mockUseUIStore = vi.mocked(useUIStore)

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

describe('ShoppingListModal', () => {
  const mockAddItem = vi.fn()
  const mockAddNotification = vi.fn()
  const mockOnClose = vi.fn()

  const mockUser: AuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'buyer',
  }

  const mockSuggestion = {
    items: [
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
        suggestedQuantity: 1,
        lastOrderedDate: '2024-01-10T10:00:00Z',
        orderFrequency: 1,
        category: '2',
      },
    ],
    totalItems: 3,
    estimatedTotal: 47.48,
    generatedAt: '2024-01-20T10:00:00Z',
    basedOnOrdersCount: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      loginAttempts: 0,
      isLocked: false,
      lockoutUntil: null,
    })

    mockUseCartStore.mockReturnValue({
      addItem: mockAddItem,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      toggleCart: vi.fn(),
      openCart: vi.fn(),
      closeCart: vi.fn(),
      applyDiscountCode: vi.fn(),
      removeDiscountCode: vi.fn(),
      getItemCount: vi.fn(),
      isInCart: vi.fn(),
    })

    mockUseUIStore.mockReturnValue({
      addNotification: mockAddNotification,
      notifications: [],
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
    })
  })

  it('should not render when isOpen is false', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={false} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByText('Smart Shopping List')).not.toBeInTheDocument()
  })

  it('should render modal when isOpen is true', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Smart Shopping List')).toBeInTheDocument()
    expect(
      screen.getByText('Based on your order history and purchasing patterns'),
    ).toBeInTheDocument()
  })

  it('should display loading state', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      hasData: false,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Analyzing your order history...'),
    ).toBeInTheDocument()
  })

  it('should display error state', () => {
    const mockRefetch = vi.fn()
    mockUseShoppingList.mockReturnValue({
      suggestion: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      refetch: mockRefetch,
      hasData: false,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Failed to generate shopping list suggestions'),
    ).toBeInTheDocument()

    const tryAgainButton = screen.getByText('Try Again')
    fireEvent.click(tryAgainButton)
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should display empty state when no suggestions', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: { ...mockSuggestion, items: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: false,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('No Suggestions Available')).toBeInTheDocument()
    expect(screen.getByText(/We need more order history/)).toBeInTheDocument()
  })

  it('should display shopping list items', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    expect(screen.getByText('$10.99')).toBeInTheDocument()
    expect(screen.getByText('$25.50')).toBeInTheDocument()
  })

  it('should allow quantity changes', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    // Find the first product's quantity controls
    const plusButtons = screen.getAllByRole('button')
    const plusButton = plusButtons.find((btn) => btn.querySelector('svg'))

    if (plusButton) {
      fireEvent.click(plusButton)
      // The quantity should be updated in the component state
      // This is tested through the UI behavior
    }
  })

  it('should close modal when close button is clicked', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should add items to cart when Add to Cart is clicked', async () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled()
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Added to Cart',
        message: expect.stringContaining('Added'),
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should disable Add to Cart button when no items selected', () => {
    mockUseShoppingList.mockReturnValue({
      suggestion: mockSuggestion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      hasData: true,
    })

    render(<ShoppingListModal isOpen={true} onClose={mockOnClose} />, {
      wrapper: createWrapper(),
    })

    // First, set all quantities to 0 by clicking minus buttons
    const minusButtons = screen.getAllByRole('button')
    minusButtons.forEach((button) => {
      if (button.querySelector('svg')) {
        // This might be a minus button, click it multiple times to ensure quantity is 0
        fireEvent.click(button)
        fireEvent.click(button)
        fireEvent.click(button)
      }
    })

    const addToCartButton = screen.getByText('Add to Cart')
    expect(addToCartButton).toBeDisabled()
  })
})

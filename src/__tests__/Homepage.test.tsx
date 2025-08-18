import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryNavigation } from '@/components/CategoryNavigation'
import { ProductGrid } from '@/components/ProductGrid'

// Mock the useSupabase hooks
vi.mock('@/hooks/useSupabase', () => ({
  useCategories: vi.fn(() => ({
    data: [
      { category_id: 1, id: 1, name: 'Tools', category_name: 'Tools' },
      { category_id: 2, id: 2, name: 'Hardware', category_name: 'Hardware' },
    ],
    isLoading: false,
    error: null,
  })),
  useProducts: vi.fn(() => ({
    data: [
      {
        id: '1',
        asin: '1',
        name: 'Test Product',
        title: 'Test Product',
        price: '29.99',
        imgUrl: '/test-image.jpg',
        category: { name: 'Tools' },
      },
    ],
    isLoading: false,
    error: null,
  })),
}))

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { role: 'buyer' },
  })),
}))

// Mock ProductImage component
vi.mock('@/components/ProductImage', () => ({
  ProductImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} />
  ),
}))

// Mock router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Homepage Components Integration', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  it('renders CategoryNavigation with flat categories', () => {
    const mockOnCategorySelect = vi.fn()

    render(
      <Wrapper>
        <CategoryNavigation
          onCategorySelect={mockOnCategorySelect}
          selectedCategoryId={null}
        />
      </Wrapper>,
    )

    expect(screen.getByText('All Products')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Hardware')).toBeInTheDocument()
  })

  it('renders ProductGrid with mapped product data', () => {
    render(
      <Wrapper>
        <ProductGrid selectedCategoryId={null} searchQuery="" />
      </Wrapper>,
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  it('handles product data mapping correctly', () => {
    render(
      <Wrapper>
        <ProductGrid selectedCategoryId={1} searchQuery="" />
      </Wrapper>,
    )

    // Verify the product displays correctly with mapped fields
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument() // category name
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg')
  })
})

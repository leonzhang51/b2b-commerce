/**
 * Unit Tests for ProductDetailsView
 *
 * These tests demonstrate how to test pure presentational components
 * without any business logic or external dependencies.
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ProductDetailsView } from '@/views/ProductDetailsView'

// Mock ProductImage component
vi.mock('@/components/ProductImage', () => ({
  ProductImage: ({ src, alt, className, onError }: any) => (
    <img src={src} alt={alt} className={className} onError={onError} />
  ),
}))

describe('ProductDetailsView', () => {
  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    description: 'A great test product',
    image_url: 'https://example.com/image.jpg',
    stock: 10,
    sku: 'TEST-001',
    category: { name: 'Test Category' },
    brand: 'Test Brand',
    weight: '1.5',
    dimensions: '10x10x10',
    material: 'Plastic',
    color: 'Blue',
    manufacturer: 'Test Manufacturer',
    warranty: '1 year',
  }

  const mockPricing = {
    basePrice: 100,
    finalPrice: 90,
    discount: 0.1,
    discountReason: 'admin discount',
    showRoleDiscount: true,
    formattedPrice: '$90.00',
  }

  const defaultProps = {
    product: mockProduct,
    loading: false,
    error: null,
    pricing: mockPricing,
    canAddToCart: true,
    isInCart: false,
    itemCount: 0,
    onAddToCart: vi.fn(),
    onImageError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      render(
        <ProductDetailsView {...defaultProps} loading={true} product={null} />,
      )

      expect(screen.getByText('Loading product...')).toBeInTheDocument()
      // Check for loading spinner by class instead of role
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error message when error occurs', () => {
      render(
        <ProductDetailsView
          {...defaultProps}
          error="Product not found"
          product={null}
        />,
      )

      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })

    it('should show default error when product is null', () => {
      render(<ProductDetailsView {...defaultProps} product={null} />)

      expect(screen.getByText('Product not found.')).toBeInTheDocument()
    })
  })

  describe('product display', () => {
    it('should render product information correctly', () => {
      render(<ProductDetailsView {...defaultProps} />)

      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('A great test product')).toBeInTheDocument()
      expect(screen.getByText('$90.00')).toBeInTheDocument()
      expect(screen.getByText('Stock: 10')).toBeInTheDocument()
      expect(screen.getByText('admin discount')).toBeInTheDocument()
    })

    it('should render product image', () => {
      render(<ProductDetailsView {...defaultProps} />)

      const image = screen.getByAltText('Test Product')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should handle missing optional fields gracefully', () => {
      const productWithoutOptionals = {
        id: 'product-1',
        name: 'Minimal Product',
      }

      render(
        <ProductDetailsView
          {...defaultProps}
          product={productWithoutOptionals}
        />,
      )

      expect(screen.getByText('Minimal Product')).toBeInTheDocument()
      // Should not crash when optional fields are missing
    })
  })

  describe('add to cart functionality', () => {
    it('should show "Add to Cart" button when not in cart', () => {
      render(<ProductDetailsView {...defaultProps} />)

      const button = screen.getByRole('button', { name: /add to cart/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toHaveClass('bg-green-100')
    })

    it('should show "In Cart" button when item is in cart', () => {
      render(
        <ProductDetailsView {...defaultProps} isInCart={true} itemCount={2} />,
      )

      const button = screen.getByRole('button', { name: /in cart \(2\)/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-green-100')
    })

    it('should call onAddToCart when button is clicked', () => {
      const mockOnAddToCart = vi.fn()
      render(
        <ProductDetailsView {...defaultProps} onAddToCart={mockOnAddToCart} />,
      )

      const button = screen.getByRole('button', { name: /add to cart/i })
      fireEvent.click(button)

      expect(mockOnAddToCart).toHaveBeenCalledTimes(1)
    })

    it('should not show add to cart button when canAddToCart is false', () => {
      render(<ProductDetailsView {...defaultProps} canAddToCart={false} />)

      expect(
        screen.queryByRole('button', { name: /add to cart/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('product details section', () => {
    it('should render all product details', () => {
      render(<ProductDetailsView {...defaultProps} />)

      expect(screen.getByText('SKU: TEST-001')).toBeInTheDocument()
      expect(screen.getByText('Category: Test Category')).toBeInTheDocument()
      expect(screen.getByText('Brand: Test Brand')).toBeInTheDocument()
      expect(screen.getByText('Weight: 1.5 kg')).toBeInTheDocument()
      expect(screen.getByText('Dimensions: 10x10x10')).toBeInTheDocument()
      expect(screen.getByText('Material: Plastic')).toBeInTheDocument()
      expect(screen.getByText('Color: Blue')).toBeInTheDocument()
      expect(
        screen.getByText('Manufacturer: Test Manufacturer'),
      ).toBeInTheDocument()
      expect(screen.getByText('Warranty: 1 year')).toBeInTheDocument()
    })

    it('should only show available product details', () => {
      const minimalProduct = {
        id: 'product-1',
        name: 'Minimal Product',
        sku: 'MIN-001',
      }

      render(<ProductDetailsView {...defaultProps} product={minimalProduct} />)

      expect(screen.getByText('SKU: MIN-001')).toBeInTheDocument()
      expect(screen.queryByText(/Category:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Brand:/)).not.toBeInTheDocument()
    })
  })

  describe('image error handling', () => {
    it('should call onImageError when image fails to load', () => {
      const mockOnImageError = vi.fn()
      render(
        <ProductDetailsView
          {...defaultProps}
          onImageError={mockOnImageError}
        />,
      )

      const image = screen.getByAltText('Test Product')
      fireEvent.error(image)

      expect(mockOnImageError).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ProductDetailsView {...defaultProps} />)

      expect(
        screen.getByRole('heading', { level: 1, name: 'Test Product' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 2, name: 'Product Details' }),
      ).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(<ProductDetailsView {...defaultProps} />)

      const button = screen.getByRole('button', { name: /add to cart/i })
      expect(button).toBeInTheDocument()
    })
  })
})

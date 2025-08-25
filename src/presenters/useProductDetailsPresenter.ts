import { useState } from 'react'
import type { PricingContext } from '@/usecases/ProductPricingUseCase'
import { useProduct } from '@/hooks/useSupabase'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import { ProductPricingUseCase } from '@/usecases/ProductPricingUseCase'

export interface ProductDetailsPresenterState {
  readonly product: any | null
  readonly loading: boolean
  readonly error: string | null
  readonly pricing: {
    readonly basePrice: number
    readonly finalPrice: number
    readonly discount: number
    readonly discountReason: string
    readonly showRoleDiscount: boolean
    readonly formattedPrice: string
  } | null
  readonly canAddToCart: boolean
  readonly isInCart: boolean
  readonly itemCount: number
}

export interface ProductDetailsPresenterActions {
  readonly handleAddToCart: () => void
  readonly handleImageError: () => void
}

export interface ProductDetailsPresenterReturn
  extends ProductDetailsPresenterState,
    ProductDetailsPresenterActions {}

/**
 * Presenter for Product Details
 *
 * Orchestrates product data fetching, pricing calculations, and cart interactions
 */
export function useProductDetailsPresenter(
  productId: string,
): ProductDetailsPresenterReturn {
  const { user } = useAuth()
  const { data: product, isLoading, error } = useProduct(productId)
  const addItem = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.isInCart(productId))
  const getItemCount = useCartStore((state) => state.getItemCount(productId))
  const addNotification = useUIStore((state) => state.addNotification)

  const [pricingUseCase] = useState(() => new ProductPricingUseCase())

  // Calculate pricing when product or user changes
  const pricing = product
    ? (() => {
        const context: PricingContext = {
          userRole: user?.role,
          companyId: (user as any)?.company_id,
        }

        const pricingResult = pricingUseCase.calculatePrice(
          product.price || 0,
          context,
        )

        return {
          ...pricingResult,
          formattedPrice: pricingUseCase.formatPrice(pricingResult.finalPrice),
        }
      })()
    : null

  const handleAddToCart = () => {
    if (!product || !pricing) return

    const validRole = getValidRole(user?.role)

    addItem(
      {
        id: `${productId}-${Date.now()}`,
        productId,
        name: product.name || 'Unknown Product',
        price: pricing.finalPrice,
        imageUrl: product.image_url,
      },
      validRole,
    )

    addNotification({
      type: 'success',
      message: `Added "${product.name}" to cart!`,
    })
  }

  const handleImageError = () => {
    // Handle image error - could set state or show fallback
  }

  // Helper function to ensure valid role
  const getValidRole = (role: any): 'admin' | 'manager' | 'buyer' => {
    if (role === 'admin' || role === 'manager' || role === 'buyer') return role
    return 'buyer'
  }

  return {
    // State
    product,
    loading: isLoading,
    error: error ? 'Product not found.' : null,
    pricing,
    canAddToCart: !!product && !!pricing,
    isInCart: isInCart,
    itemCount: getItemCount,

    // Actions
    handleAddToCart,
    handleImageError,
  }
}

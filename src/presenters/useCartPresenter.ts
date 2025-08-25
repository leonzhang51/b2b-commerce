import { useEffect, useState } from 'react'
import type { Role } from '@/lib/rolePricing'
import type { AddToCartInput } from '@/usecases/CartUseCase'
import { useCartStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { useStoreWithHydration } from '@/hooks/useHydration'
import { CartUseCase } from '@/usecases/CartUseCase'

export interface CartPresenterState {
  readonly items: Array<any>
  readonly totalItems: number
  readonly totalPrice: number
  readonly discountedTotal: number
  readonly discountCode?: string
  readonly discountPercent?: number
  readonly isOpen: boolean
  readonly loading: boolean
  readonly error: string | null
}

export interface CartPresenterActions {
  readonly addItem: (item: AddToCartInput) => void
  readonly removeItem: (itemId: string) => void
  readonly updateQuantity: (itemId: string, quantity: number) => void
  readonly clearCart: () => void
  readonly toggleCart: () => void
  readonly openCart: () => void
  readonly closeCart: () => void
  readonly applyDiscountCode: (code: string) => Promise<boolean>
  readonly removeDiscountCode: () => void
  readonly getItemCount: (productId: string) => number
  readonly isInCart: (productId: string) => boolean
}

export interface CartPresenterReturn
  extends CartPresenterState,
    CartPresenterActions {}

/**
 * Presenter for Cart functionality
 *
 * Orchestrates cart operations using CartUseCase and manages UI state
 */
export function useCartPresenter(): CartPresenterReturn {
  const { user } = useAuth()
  const addNotification = useUIStore((state) => state.addNotification)

  // Zustand store state (with SSR safety)
  const items = useStoreWithHydration(
    () => useCartStore((state) => state.items),
    [],
  )
  const totalItems = useStoreWithHydration(
    () => useCartStore((state) => state.totalItems),
    0,
  )
  const totalPrice = useStoreWithHydration(
    () => useCartStore((state) => state.totalPrice),
    0,
  )
  const discountedTotal = useStoreWithHydration(
    () => useCartStore((state) => state.discountedTotal),
    0,
  )
  const discountCode = useStoreWithHydration(
    () => useCartStore((state) => state.discountCode),
    undefined,
  )
  const discountPercent = useStoreWithHydration(
    () => useCartStore((state) => state.discountPercent),
    0,
  )
  const isOpen = useStoreWithHydration(
    () => useCartStore((state) => state.isOpen),
    false,
  )

  // Zustand store actions
  const storeAddItem = useCartStore((state) => state.addItem)
  const storeRemoveItem = useCartStore((state) => state.removeItem)
  const storeUpdateQuantity = useCartStore((state) => state.updateQuantity)
  const storeClearCart = useCartStore((state) => state.clearCart)
  const storeToggleCart = useCartStore((state) => state.toggleCart)
  const storeOpenCart = useCartStore((state) => state.openCart)
  const storeCloseCart = useCartStore((state) => state.closeCart)
  const storeApplyDiscountCode = useCartStore(
    (state) => state.applyDiscountCode,
  )
  const storeRemoveDiscountCode = useCartStore(
    (state) => state.removeDiscountCode,
  )
  const storeGetItemCount = useCartStore((state) => state.getItemCount)
  const storeIsInCart = useCartStore((state) => state.isInCart)

  // Local state
  const [cartUseCase] = useState(() => new CartUseCase())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to get valid user role
  const getValidRole = (role: any): Role => {
    if (role === 'admin' || role === 'manager' || role === 'buyer') return role
    return 'buyer'
  }

  // Actions that use the use case for business logic
  const addItem = (item: AddToCartInput) => {
    try {
      setError(null)
      const userRole = getValidRole(user?.role)

      // Use the store action (which already has the business logic)
      // In a full MVP refactor, we'd move this logic to the use case
      storeAddItem(item, userRole)

      addNotification({
        type: 'success',
        message: `Added "${item.name}" to cart!`,
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add item to cart'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
    }
  }

  const removeItem = (itemId: string) => {
    try {
      setError(null)
      storeRemoveItem(itemId)

      addNotification({
        type: 'info',
        message: 'Item removed from cart',
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove item'
      setError(errorMessage)
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    try {
      setError(null)

      if (quantity < 0) {
        setError('Quantity cannot be negative')
        return
      }

      storeUpdateQuantity(itemId, quantity)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update quantity'
      setError(errorMessage)
    }
  }

  const clearCart = () => {
    try {
      setError(null)
      storeClearCart()

      addNotification({
        type: 'info',
        message: 'Cart cleared',
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear cart'
      setError(errorMessage)
    }
  }

  const applyDiscountCode = async (code: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Use the use case to validate the discount
      const result = cartUseCase.applyDiscountCode(totalPrice, code)

      if (result.isValid) {
        storeApplyDiscountCode(code)
        addNotification({
          type: 'success',
          message: `Discount code "${code}" applied!`,
        })
        return true
      } else {
        setError(result.error || 'Invalid discount code')
        addNotification({
          type: 'error',
          message: result.error || 'Invalid discount code',
        })
        return false
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to apply discount code'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const removeDiscountCode = () => {
    try {
      setError(null)
      storeRemoveDiscountCode()

      addNotification({
        type: 'info',
        message: 'Discount code removed',
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove discount code'
      setError(errorMessage)
    }
  }

  // Validation using use case
  useEffect(() => {
    if (items.length > 0) {
      const validation = cartUseCase.validateCart(items)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
      } else {
        setError(null)
      }
    }
  }, [items, cartUseCase])

  return {
    // State
    items,
    totalItems,
    totalPrice,
    discountedTotal: discountedTotal || totalPrice,
    discountCode,
    discountPercent,
    isOpen,
    loading,
    error,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart: storeToggleCart,
    openCart: storeOpenCart,
    closeCart: storeCloseCart,
    applyDiscountCode,
    removeDiscountCode,
    getItemCount: storeGetItemCount,
    isInCart: storeIsInCart,
  }
}

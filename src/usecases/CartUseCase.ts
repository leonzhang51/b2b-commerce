/**
 * CartUseCase
 *
 * Handles all business logic related to shopping cart operations,
 * including item management, pricing calculations, and discount application.
 */

import type { Role } from '@/lib/rolePricing'
import { calculateRoleBasedPrice } from '@/lib/rolePricing'
import {
  applyDiscount,
  findDiscountCode,
  isDiscountCodeValid,
} from '@/lib/discountCodes'

export interface CartItem {
  readonly id: string
  readonly productId: string
  readonly name: string
  readonly price: number
  readonly quantity: number
  readonly totalPrice: number
  readonly imageUrl?: string
}

export interface AddToCartInput {
  readonly id: string
  readonly productId: string
  readonly name: string
  readonly price: number
  readonly imageUrl?: string
  readonly quantity?: number
}

export interface CartState {
  readonly items: Array<CartItem>
  readonly totalItems: number
  readonly totalPrice: number
  readonly discountCode?: string
  readonly discountPercent?: number
  readonly discountedTotal?: number
}

export interface CartCalculation {
  readonly totalItems: number
  readonly totalPrice: number
  readonly discountedTotal: number
}

export class CartUseCase {
  /**
   * Add an item to the cart with role-based pricing
   */
  addItemToCart(
    currentItems: Array<CartItem>,
    newItem: AddToCartInput,
    userRole: Role,
  ): { items: Array<CartItem>; calculation: CartCalculation } {
    const adjustedPrice = calculateRoleBasedPrice(newItem.price, userRole)
    const existingItemIndex = currentItems.findIndex(
      (item) => item.productId === newItem.productId,
    )

    let updatedItems: Array<CartItem>

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = currentItems[existingItemIndex]
      const newQuantity = existingItem.quantity + (newItem.quantity ?? 1)

      updatedItems = currentItems.map((item, index) =>
        index === existingItemIndex
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * adjustedPrice,
            }
          : item,
      )
    } else {
      // Add new item
      const quantity = newItem.quantity ?? 1
      const cartItem: CartItem = {
        id: newItem.id,
        productId: newItem.productId,
        name: newItem.name,
        price: adjustedPrice,
        quantity,
        totalPrice: adjustedPrice * quantity,
        imageUrl: newItem.imageUrl,
      }
      updatedItems = [...currentItems, cartItem]
    }

    return {
      items: updatedItems,
      calculation: this.calculateCartTotals(updatedItems),
    }
  }

  /**
   * Remove an item from the cart
   */
  removeItemFromCart(
    currentItems: Array<CartItem>,
    itemId: string,
  ): { items: Array<CartItem>; calculation: CartCalculation } {
    const updatedItems = currentItems.filter((item) => item.id !== itemId)

    return {
      items: updatedItems,
      calculation: this.calculateCartTotals(updatedItems),
    }
  }

  /**
   * Update item quantity in cart
   */
  updateItemQuantity(
    currentItems: Array<CartItem>,
    itemId: string,
    newQuantity: number,
  ): { items: Array<CartItem>; calculation: CartCalculation } {
    if (newQuantity <= 0) {
      return this.removeItemFromCart(currentItems, itemId)
    }

    const updatedItems = currentItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: newQuantity,
            totalPrice: item.price * newQuantity,
          }
        : item,
    )

    return {
      items: updatedItems,
      calculation: this.calculateCartTotals(updatedItems),
    }
  }

  /**
   * Apply discount code to cart
   */
  applyDiscountCode(
    totalPrice: number,
    discountCode: string,
  ): {
    isValid: boolean
    discountPercent: number
    discountedTotal: number
    error?: string
  } {
    const discount = findDiscountCode(discountCode)

    if (!discount) {
      return {
        isValid: false,
        discountPercent: 0,
        discountedTotal: totalPrice,
        error: 'Invalid discount code',
      }
    }

    if (!isDiscountCodeValid(discount)) {
      return {
        isValid: false,
        discountPercent: 0,
        discountedTotal: totalPrice,
        error: 'Discount code has expired',
      }
    }

    const discountedTotal = applyDiscount(totalPrice, discount)
    const discountPercent = discount.type === 'percent' ? discount.value : 0

    return {
      isValid: true,
      discountPercent,
      discountedTotal,
    }
  }

  /**
   * Calculate cart totals
   */
  calculateCartTotals(items: Array<CartItem>): CartCalculation {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0)

    return {
      totalItems,
      totalPrice,
      discountedTotal: totalPrice, // Will be updated when discount is applied
    }
  }

  /**
   * Calculate cart totals with discount
   */
  calculateCartTotalsWithDiscount(
    items: Array<CartItem>,
    discountPercent: number,
  ): CartCalculation {
    const baseTotals = this.calculateCartTotals(items)
    const discountedTotal = baseTotals.totalPrice * (1 - discountPercent / 100)

    return {
      ...baseTotals,
      discountedTotal,
    }
  }

  /**
   * Get item count for a specific product
   */
  getItemCount(items: Array<CartItem>, productId: string): number {
    const item = items.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(items: Array<CartItem>, productId: string): boolean {
    return items.some((item) => item.productId === productId)
  }

  /**
   * Clear all items from cart
   */
  clearCart(): { items: Array<CartItem>; calculation: CartCalculation } {
    return {
      items: [],
      calculation: {
        totalItems: 0,
        totalPrice: 0,
        discountedTotal: 0,
      },
    }
  }

  /**
   * Validate cart before checkout
   */
  validateCart(items: Array<CartItem>): {
    isValid: boolean
    errors: Array<string>
  } {
    const errors: Array<string> = []

    if (items.length === 0) {
      errors.push('Cart is empty')
    }

    // Check for invalid quantities
    const invalidItems = items.filter((item) => item.quantity <= 0)
    if (invalidItems.length > 0) {
      errors.push('Some items have invalid quantities')
    }

    // Check for invalid prices
    const invalidPrices = items.filter((item) => item.price <= 0)
    if (invalidPrices.length > 0) {
      errors.push('Some items have invalid prices')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

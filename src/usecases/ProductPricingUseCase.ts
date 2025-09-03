/**
 * ProductPricingUseCase
 *
 * Handles business logic for calculating product prices based on user roles,
 * discounts, and other pricing rules.
 */

export interface PricingContext {
  readonly userRole?: string
  readonly companyId?: string
  readonly discountCodes?: Array<string>
}

export interface ProductPricing {
  readonly basePrice: number
  readonly finalPrice: number
  readonly discount: number
  readonly discountReason: string
  readonly showRoleDiscount: boolean
}

export class ProductPricingUseCase {
  /**
   * Calculate the final price for a product based on user context
   */
  calculatePrice(basePrice: number, context: PricingContext): ProductPricing {
    let finalPrice = basePrice
    let discount = 0
    let discountReason = ''
    let showRoleDiscount = false

    // Apply role-based pricing
    if (context.userRole) {
      const roleDiscount = this.getRoleDiscount(context.userRole)
      if (roleDiscount > 0) {
        discount = roleDiscount
        finalPrice = basePrice * (1 - roleDiscount)
        discountReason = `${context.userRole} discount`
        showRoleDiscount = true
      }
    }

    // TODO: Add more pricing rules
    // - Volume discounts
    // - Company-specific pricing
    // - Promotional codes
    // - Seasonal discounts

    return {
      basePrice,
      finalPrice,
      discount,
      discountReason,
      showRoleDiscount,
    }
  }

  /**
   * Get discount percentage for a user role
   */
  private getRoleDiscount(role: string): number {
    switch (role) {
      case 'admin':
        return 0.1 // 10% discount
      case 'manager':
        return 0.05 // 5% discount
      case 'buyer':
        return 0 // No discount
      default:
        return 0
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price: number | string): string {
    const num = typeof price === 'number' ? price : Number(price)
    if (isNaN(num)) return '$0.00'
    return `$${num.toFixed(2)}`
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'manager':
        return 'Manager'
      case 'buyer':
        return 'Buyer'
      default:
        return 'Standard'
    }
  }
}

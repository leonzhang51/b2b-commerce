// Discount code logic and types

export type DiscountType = 'percent' | 'fixed'

export interface DiscountCode {
  code: string
  type: DiscountType
  value: number
  expiresAt?: string // ISO date string
  usageLimit?: number
  used?: number
}

// Example discount codes
export const discountCodes: Array<DiscountCode> = [
  { code: 'SAVE10', type: 'percent', value: 10 },
  { code: 'SAVE20', type: 'percent', value: 20 },
  { code: 'WELCOME5', type: 'fixed', value: 5, expiresAt: '2099-12-31' },
]

export function findDiscountCode(code: string): DiscountCode | undefined {
  return discountCodes.find((d) => d.code.toUpperCase() === code.toUpperCase())
}

export function isDiscountCodeValid(discount: DiscountCode): boolean {
  if (discount.expiresAt && new Date() > new Date(discount.expiresAt))
    return false
  if (
    discount.usageLimit &&
    discount.used &&
    discount.used >= discount.usageLimit
  )
    return false
  return true
}

export function applyDiscount(total: number, discount: DiscountCode): number {
  if (discount.type === 'percent') {
    return total * (1 - discount.value / 100)
  }
  // Only 'fixed' type remains
  return Math.max(0, total - discount.value)
}

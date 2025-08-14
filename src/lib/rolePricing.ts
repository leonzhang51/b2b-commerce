// Role-based pricing configuration and logic

export type Role = 'admin' | 'manager' | 'buyer'

// Define pricing tiers for each role
const rolePricingTiers: Record<Role, number> = {
  admin: 0.9, // Admins get a 10% discount
  manager: 1.0, // Managers pay full price
  buyer: 1.2, // Buyers pay 20% more
}

/**
 * Get the pricing multiplier for a given role.
 * @param role - The user's role
 * @returns The pricing multiplier
 */
export function getPricingMultiplier(role: Role): number {
  return rolePricingTiers[role] || 1.0 // Default to no adjustment
}

/**
 * Calculate the price for a product based on the user's role.
 * @param basePrice - The base price of the product
 * @param role - The user's role
 * @returns The adjusted price
 */
export function calculateRoleBasedPrice(basePrice: number, role: Role): number {
  const multiplier = getPricingMultiplier(role)
  return basePrice * multiplier
}

// Re-export all stores for easy importing
export { useCartStore } from './cartStore'
export { useUIStore } from './uiStore'
export {
  useUserStore,
  useCurrentUser,
  useIsAuthenticated,
  useUserRole,
  useUserPermissions,
} from './userStore'

// Re-export types
export type { CartItem, CartState } from '@/types/cart'
export type { UIState, Notification } from '@/types/ui'
export type {
  Order,
  OrderItem,
  Address,
  CheckoutFormData,
  OrderStatus,
} from '@/types/order'

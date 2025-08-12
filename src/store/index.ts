// Re-export all stores for easy importing
export { useTodoStore } from './todoStore'
export { useCartStore } from './cartStore'
export { useUIStore } from './uiStore'

// Re-export types
export type { Todo, TodoFilters } from '@/types/todo'
export type { CartItem, CartState } from '@/types/cart'
export type { UIState, Notification } from '@/types/ui'

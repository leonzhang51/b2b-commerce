import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState } from '@/types/cart'

interface CartStore extends CartState {
  // Cart actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed properties
  getItemCount: (productId: string) => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (newItem) => {
        const { items } = get()
        const existingItem = items.find(
          (item) => item.productId === newItem.productId,
        )

        if (existingItem) {
          // Update quantity if item already exists
          set((state) => {
            const updatedItems = state.items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                : item,
            )
            return {
              items: updatedItems,
              totalItems: updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
              totalPrice: updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              ),
            }
          })
        } else {
          // Add new item
          const itemToAdd: CartItem = {
            ...newItem,
            quantity: newItem.quantity || 1,
          }
          set((state) => {
            const updatedItems = [...state.items, itemToAdd]
            return {
              items: updatedItems,
              totalItems: updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
              totalPrice: updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              ),
            }
          })
        }
      },

      removeItem: (id) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id)
          return {
            items: updatedItems,
            totalItems: updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            ),
            totalPrice: updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          }
        }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          )
          return {
            items: updatedItems,
            totalItems: updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            ),
            totalPrice: updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
          }
        })
      },

      clearCart: () =>
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        }),

      toggleCart: () =>
        set((state) => ({
          isOpen: !state.isOpen,
        })),

      openCart: () =>
        set({
          isOpen: true,
        }),

      closeCart: () =>
        set({
          isOpen: false,
        }),

      getItemCount: (productId) => {
        const { items } = get()
        const foundItem = items.find((item) => item.productId === productId)
        return foundItem ? foundItem.quantity : 0
      },

      isInCart: (productId) => {
        const { items } = get()
        return items.some((item) => item.productId === productId)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    },
  ),
)

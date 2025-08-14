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
  applyDiscountCode: (code: string) => void
  removeDiscountCode: () => void

  // Computed properties
  getItemCount: (productId: string) => number
  isInCart: (productId: string) => boolean
  discountCode?: string
  discountPercent?: number
  discountedTotal?: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,
      discountCode: undefined,
      discountPercent: 0,
      discountedTotal: 0,

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
            let discountedTotal = updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            )
            if (state.discountPercent) {
              discountedTotal =
                discountedTotal * (1 - state.discountPercent / 100)
            }
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
              discountedTotal,
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
            let discountedTotal = updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            )
            if (state.discountPercent) {
              discountedTotal =
                discountedTotal * (1 - state.discountPercent / 100)
            }
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
              discountedTotal,
            }
          })
        }
      },

      removeItem: (id) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id)
          let discountedTotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          )
          if (state.discountPercent) {
            discountedTotal =
              discountedTotal * (1 - state.discountPercent / 100)
          }
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
            discountedTotal,
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
          let discountedTotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          )
          if (state.discountPercent) {
            discountedTotal =
              discountedTotal * (1 - state.discountPercent / 100)
          }
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
            discountedTotal,
          }
        })
      },

      clearCart: () =>
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          discountedTotal: 0,
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

      applyDiscountCode: (code) => {
        // Simple mock: 'SAVE10' = 10%, 'SAVE20' = 20%
        let percent = 0
        if (code === 'SAVE10') percent = 10
        if (code === 'SAVE20') percent = 20
        set((state) => {
          const discountedTotal = state.totalPrice * (1 - percent / 100)
          return {
            discountCode: code,
            discountPercent: percent,
            discountedTotal,
          }
        })
      },
      removeDiscountCode: () => {
        set({ discountCode: undefined, discountPercent: 0, discountedTotal: 0 })
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

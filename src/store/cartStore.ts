import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState } from '@/types/cart'
import type { Role } from '@/lib/rolePricing'
import { calculateRoleBasedPrice } from '@/lib/rolePricing'
import {
  applyDiscount,
  findDiscountCode,
  isDiscountCodeValid,
} from '@/lib/discountCodes'

interface AddToCartInput {
  id: string
  productId: string
  name: string
  price: number
  imageUrl?: string
  quantity?: number
}

interface CartStore extends CartState {
  // Cart actions
  addItem: (item: AddToCartInput, role: Role) => void
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

      addItem: (product, role) => {
        const { items } = get()
        const existingItem = items.find(
          (item) => item.productId === product.productId,
        )
        const price = calculateRoleBasedPrice(product.price, role)
        if (existingItem) {
          set((state) => {
            const updatedItems = state.items.map((item) =>
              item.productId === product.productId
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    totalPrice: (item.quantity + 1) * price,
                  }
                : item,
            )
            const totalItems = updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            )
            const totalPrice = updatedItems.reduce(
              (sum, item) => sum + item.totalPrice,
              0,
            )
            return { items: updatedItems, totalItems, totalPrice }
          })
        } else {
          set((state) => {
            const newItem = {
              id: product.id,
              productId: product.productId,
              name: product.name,
              price,
              quantity: product.quantity ?? 1,
              totalPrice: price * (product.quantity ?? 1),
              imageUrl: product.imageUrl,
            }
            const updatedItems = [...state.items, newItem]
            const totalItems = updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            )
            const totalPrice = updatedItems.reduce(
              (sum, item) => sum + item.totalPrice,
              0,
            )
            return { items: updatedItems, totalItems, totalPrice }
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

      applyDiscountCode: (code: string) => {
        const discount = findDiscountCode(code)
        if (!discount || !isDiscountCodeValid(discount)) {
          set({
            discountCode: undefined,
            discountPercent: 0,
            discountedTotal: 0,
          })
          return
        }
        set((state) => {
          const discountedTotal = applyDiscount(state.totalPrice, discount)
          return {
            discountCode: code,
            discountPercent:
              discount.type === 'percent' ? discount.value : undefined,
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

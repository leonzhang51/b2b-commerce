import { act } from 'react-dom/test-utils'
import { useCartStore } from '@/store/cartStore'

// Fix product object to include required properties
const product = {
  id: '1',
  productId: '1',
  name: 'Test Product',
  price: 100,
  totalPrice: 100, // Default totalPrice for initialization
}

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useCartStore.setState({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      })
    })
  })

  it('should add an item with role-based pricing', () => {
    const role = 'admin' // Admin gets a 10% discount

    act(() => {
      useCartStore.getState().addItem(product, role)
    })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].price).toBe(90) // 10% discount applied
    expect(state.totalItems).toBe(1)
    expect(state.totalPrice).toBe(90)
  })

  it('should update quantity and total price for an existing item', () => {
    const role = 'manager' // Manager pays full price

    act(() => {
      useCartStore.getState().addItem(product, role)
      useCartStore.getState().addItem(product, role)
    })

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
    expect(state.items[0].totalPrice).toBe(200) // 2 * 100
    expect(state.totalItems).toBe(2)
    expect(state.totalPrice).toBe(200)
  })

  it('should handle different roles correctly', () => {
    act(() => {
      useCartStore.getState().addItem(product, 'buyer') // Buyer pays 20% more
    })

    const state = useCartStore.getState()
    expect(state.items[0].price).toBe(120) // 20% increase applied
    expect(state.totalPrice).toBe(120)
  })

  it('should remove an item from the cart', () => {
    const role = 'manager'
    let addedId = ''
    act(() => {
      useCartStore.getState().addItem(product, role)
      const state = useCartStore.getState()
      addedId = state.items[0].id
      useCartStore.getState().removeItem(addedId)
    })
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.totalItems).toBe(0)
    expect(state.totalPrice).toBe(0)
  })

  it('should clear the cart', () => {
    const role = 'manager'
    act(() => {
      useCartStore.getState().addItem(product, role)
      useCartStore.getState().addItem(product, role)
      useCartStore.getState().clearCart()
    })
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.totalItems).toBe(0)
    expect(state.totalPrice).toBe(0)
  })

  it('should apply a discount code', () => {
    const role = 'manager'
    act(() => {
      useCartStore.getState().addItem(product, role)
      useCartStore.getState().applyDiscountCode('SAVE10')
    })
    const state = useCartStore.getState()
    expect(state.discountCode).toBe('SAVE10')
    expect(state.discountPercent).toBe(10)
    expect(state.discountedTotal).toBe(90) // 10% off 100
  })

  it('should remove a discount code', () => {
    const role = 'manager'
    act(() => {
      useCartStore.getState().addItem(product, role)
      useCartStore.getState().applyDiscountCode('SAVE10')
      useCartStore.getState().removeDiscountCode()
    })
    const state = useCartStore.getState()
    expect(state.discountCode).toBeUndefined()
    expect(state.discountPercent).toBe(0)
    expect(state.discountedTotal).toBe(0)
  })
})

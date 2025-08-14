import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/store'
import { useStoreWithHydration } from '@/hooks/useHydration'

import { useAuth } from '@/hooks/useAuth'

import { useUIStore } from '@/store/uiStore'

export function CartButton() {
  const totalItems = useStoreWithHydration(
    () => useCartStore((state) => state.totalItems),
    0,
  )
  const toggleCart = useCartStore((state) => state.toggleCart)

  return (
    <button
      onClick={toggleCart}
      className="relative inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Open cart"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full border-2 border-white">
          {totalItems}
        </span>
      )}
    </button>
  )
}

export function CartSidebar() {
  const { user } = useAuth()
  const isOpen = useStoreWithHydration(
    () => useCartStore((state) => state.isOpen),
    false,
  )
  const items = useStoreWithHydration(
    () => useCartStore((state) => state.items),
    [],
  )
  const totalPrice = useStoreWithHydration(
    () => useCartStore((state) => state.totalPrice),
    0,
  )
  const discountCode = useStoreWithHydration(
    () => useCartStore((state) => state.discountCode),
    undefined,
  )
  const discountPercent = useStoreWithHydration(
    () => useCartStore((state) => state.discountPercent),
    0,
  )
  const discountedTotal = useStoreWithHydration(
    () => useCartStore((state) => state.discountedTotal),
    0,
  )
  const closeCart = useCartStore((state) => state.closeCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode)
  const removeDiscountCode = useCartStore((state) => state.removeDiscountCode)
  const [codeInput, setCodeInput] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeCart}
      />
      <div
        className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out transform translate-x-0 focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                <svg
                  className="w-12 h-12 mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
                  />
                </svg>
                <p>Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">
                  Browse products and add them to your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  // Role-based price display
                  let price = item.price
                  if (user?.role === 'admin') price = item.price * 0.9
                  else if (user?.role === 'manager') price = item.price * 0.95

                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-600">
                          ${price.toFixed(2)}
                          {user?.role && user.role !== 'buyer' && (
                            <span className="ml-2 text-xs text-blue-600 font-semibold">
                              {user.role} price
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(0, item.quantity - 1),
                              )
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between items-center font-semibold border-b pb-2 mb-2">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              {/* Discount code UI */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Discount code"
                  className="border rounded px-2 py-1 text-sm flex-1"
                  disabled={!!discountCode}
                />
                {!discountCode ? (
                  <button
                    onClick={() => {
                      applyDiscountCode(codeInput.trim())
                      setCodeInput('')
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Apply
                  </button>
                ) : (
                  <button
                    onClick={removeDiscountCode}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              {discountCode && discountPercent ? (
                <div className="flex justify-between items-center text-green-700 font-semibold border-b pb-2 mb-2">
                  <span>Discount ({discountCode}):</span>
                  <span>-{discountPercent}%</span>
                </div>
              ) : null}
              {discountCode && discountPercent ? (
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${(discountedTotal ?? totalPrice).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
}: {
  productId: string
  name: string
  price: number
  imageUrl?: string
}) {
  const addItem = useCartStore((state) => state.addItem)
  const { user } = useAuth()
  const isInCart = useStoreWithHydration(
    () => useCartStore((state) => state.isInCart(productId)),
    false,
  )
  const itemCount = useStoreWithHydration(
    () => useCartStore((state) => state.getItemCount(productId)),
    0,
  )
  const addNotification = useUIStore((state) => state.addNotification)

  const getValidRole = (role: any): 'admin' | 'manager' | 'buyer' => {
    if (role === 'admin' || role === 'manager' || role === 'buyer') return role
    return 'buyer'
  }
  const handleAddToCart = () => {
    addItem(
      {
        id: `${productId}-${Date.now()}`,
        productId,
        name,
        price,
        imageUrl,
      },
      getValidRole(user?.role),
    )
    addNotification({
      type: 'success',
      message: `Added "${name}" to cart!`,
    })
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isInCart
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isInCart ? `In Cart (${itemCount})` : 'Add to Cart'}
    </button>
  )
}

export function MiniCartDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const items = useStoreWithHydration(
    () => useCartStore((state) => state.items),
    [],
  )
  const totalItems = useStoreWithHydration(
    () => useCartStore((state) => state.totalItems),
    0,
  )
  const totalPrice = useStoreWithHydration(
    () => useCartStore((state) => state.totalPrice),
    0,
  )

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="relative inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open minicart"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Cart Preview</h3>
            {items.length === 0 ? (
              <div className="text-gray-500 text-sm">Your cart is empty.</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {items.slice(0, 3).map((item) => (
                  <li key={item.id} className="py-2 flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${item.price.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <a
              href="/cart"
              className="block mt-4 w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              tabIndex={0}
            >
              View Full Cart
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

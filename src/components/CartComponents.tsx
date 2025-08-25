/**
 * MVP-compliant Cart Components
 *
 * These components follow the MVP pattern:
 * - Use Presenters for business logic and state management
 * - Use Views for pure presentation
 * - Act as thin containers connecting presenters and views
 */

import { useEffect, useRef, useState } from 'react'
import { useCartPresenter } from '@/presenters/useCartPresenter'
import { useCartStore } from '@/store'
import { useStoreWithHydration } from '@/hooks/useHydration'
import { AddToCartButtonView, CartButtonView } from '@/views/CartButtonView'
import { CartView } from '@/views/CartView'

/**
 * MVP-compliant Cart Button
 */
export function CartButton() {
  const presenter = useCartPresenter()

  return (
    <CartButtonView
      totalItems={presenter.totalItems}
      loading={presenter.loading}
      onClick={presenter.toggleCart}
    />
  )
}

/**
 * MVP-compliant Cart Sidebar
 */
export function CartSidebar() {
  const presenter = useCartPresenter()

  return (
    <CartView
      isOpen={presenter.isOpen}
      items={presenter.items}
      totalItems={presenter.totalItems}
      totalPrice={presenter.totalPrice}
      discountedTotal={presenter.discountedTotal}
      discountCode={presenter.discountCode}
      discountPercent={presenter.discountPercent}
      loading={presenter.loading}
      error={presenter.error}
      onClose={presenter.closeCart}
      onUpdateQuantity={presenter.updateQuantity}
      onRemoveItem={presenter.removeItem}
      onClearCart={presenter.clearCart}
      onApplyDiscountCode={presenter.applyDiscountCode}
      onRemoveDiscountCode={presenter.removeDiscountCode}
    />
  )
}

/**
 * MVP-compliant Add to Cart Button
 */

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
  const presenter = useCartPresenter()

  return (
    <AddToCartButtonView
      name={name}
      price={price}
      isInCart={presenter.isInCart(productId)}
      itemCount={presenter.getItemCount(productId)}
      loading={presenter.loading}
      onAddToCart={() =>
        presenter.addItem({
          id: `${productId}-${Date.now()}`,
          productId,
          name,
          price,
          imageUrl,
        })
      }
    />
  )
}

/**
 * MiniCartDropdown - Legacy component (to be refactored to MVP later)
 */
export function MiniCartDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const items = useStoreWithHydration(
    () => useCartStore((state: any) => state.items),
    [],
  )
  const totalItems = useStoreWithHydration(
    () => useCartStore((state: any) => state.totalItems),
    0,
  )
  const totalPrice = useStoreWithHydration(
    () => useCartStore((state: any) => state.totalPrice),
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
        onClick={() => setOpen((v: boolean) => !v)}
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 6M7 13l-2.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
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
                {items.slice(0, 3).map((item: any) => (
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

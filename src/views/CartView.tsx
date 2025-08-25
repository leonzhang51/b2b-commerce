import { useState } from 'react'

export interface CartItem {
  readonly id: string
  readonly productId: string
  readonly name: string
  readonly price: number
  readonly quantity: number
  readonly totalPrice: number
  readonly imageUrl?: string
}

export interface CartViewProps {
  readonly isOpen: boolean
  readonly items: Array<CartItem>
  readonly totalItems: number
  readonly totalPrice: number
  readonly discountedTotal: number
  readonly discountCode?: string
  readonly discountPercent?: number
  readonly loading: boolean
  readonly error: string | null
  readonly onClose: () => void
  readonly onUpdateQuantity: (itemId: string, quantity: number) => void
  readonly onRemoveItem: (itemId: string) => void
  readonly onClearCart: () => void
  readonly onApplyDiscountCode: (code: string) => Promise<boolean>
  readonly onRemoveDiscountCode: () => void
  readonly onCheckout?: () => void
}

/**
 * Pure presentational component for Cart
 *
 * Receives all data via props and emits user events via callbacks
 */
export function CartView({
  isOpen,
  items,
  totalItems,
  totalPrice,
  discountedTotal,
  discountCode,
  discountPercent,
  loading,
  error,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyDiscountCode,
  onRemoveDiscountCode,
  onCheckout,
}: CartViewProps) {
  const [codeInput, setCodeInput] = useState('')
  const [applyingCode, setApplyingCode] = useState(false)

  if (!isOpen) return null

  const handleApplyCode = async () => {
    if (!codeInput.trim() || applyingCode) return

    setApplyingCode(true)
    const success = await onApplyDiscountCode(codeInput.trim())
    if (success) {
      setCodeInput('')
    }
    setApplyingCode(false)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(itemId, newQuantity)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <svg
                className="h-5 w-5"
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
              {error}
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 border-b pb-4"
                  >
                    {/* Product Image */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                          disabled={loading}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>

                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                          disabled={loading}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm mt-1"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Discount Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Discount Code
                </label>
                {discountCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                    <span className="text-sm text-green-700">
                      {discountCode} ({discountPercent}% off)
                    </span>
                    <button
                      onClick={onRemoveDiscountCode}
                      className="text-red-500 hover:text-red-700 text-sm"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Enter discount code"
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                      disabled={loading || applyingCode}
                    />
                    <button
                      onClick={handleApplyCode}
                      disabled={!codeInput.trim() || loading || applyingCode}
                      className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {applyingCode ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {discountCode && discountedTotal < totalPrice && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-${(totalPrice - discountedTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {onCheckout && (
                  <button
                    onClick={onCheckout}
                    disabled={loading}
                    className="w-full rounded bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Checkout'}
                  </button>
                )}

                <button
                  onClick={onClearCart}
                  disabled={loading}
                  className="w-full rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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

export interface CartButtonViewProps {
  readonly totalItems: number
  readonly loading?: boolean
  readonly onClick: () => void
  readonly className?: string
}

/**
 * Pure presentational component for Cart Button
 *
 * Simple button that shows cart item count and triggers cart open
 */
export function CartButtonView({
  totalItems,
  loading = false,
  onClick,
  className = '',
}: CartButtonViewProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`relative inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${className}`}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      {/* Cart Icon */}
      <svg
        className="h-5 w-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>

      {/* Cart Text */}
      <span>Cart</span>

      {/* Item Count Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.25rem] h-5">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-75 rounded-lg">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}
    </button>
  )
}

export interface AddToCartButtonViewProps {
  readonly name: string
  readonly price: number
  readonly isInCart: boolean
  readonly itemCount: number
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly onAddToCart: () => void
  readonly className?: string
}

/**
 * Pure presentational component for Add to Cart Button
 *
 * Shows different states based on whether item is in cart
 */
export function AddToCartButtonView({
  name,
  price,
  isInCart,
  itemCount,
  loading = false,
  disabled = false,
  onAddToCart,
  className = '',
}: AddToCartButtonViewProps) {
  const isDisabled = loading || disabled

  return (
    <button
      onClick={onAddToCart}
      disabled={isDisabled}
      className={`relative px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
        isInCart
          ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 focus:ring-green-500'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      } ${className}`}
      aria-label={
        isInCart
          ? `${name} is in cart (${itemCount} items)`
          : `Add ${name} to cart for $${price.toFixed(2)}`
      }
    >
      {/* Button Content */}
      <span className="flex items-center space-x-2">
        {/* Icon */}
        {isInCart ? (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
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
        )}

        {/* Text */}
        <span>{isInCart ? `In Cart (${itemCount})` : 'Add to Cart'}</span>
      </span>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-current bg-opacity-20 rounded-lg">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        </div>
      )}
    </button>
  )
}

import type CanonicalProduct from '@/types/product'

export interface ProductDetailsViewProps {
  readonly product: CanonicalProduct | null
  readonly loading: boolean
  readonly error: string | null
  readonly pricing: {
    readonly basePrice: number
    readonly finalPrice: number
    readonly discount: number
    readonly discountReason: string
    readonly showRoleDiscount: boolean
    readonly formattedPrice: string
  } | null
  readonly canAddToCart: boolean
  readonly isInCart: boolean
  readonly itemCount: number
  readonly onAddToCart: () => void
  readonly onImageError: () => void
}

/**
 * Pure presentational component for Product Details
 *
 * Receives all data via props and emits user events via callbacks
 */
export function ProductDetailsView({
  product,
  loading,
  error,
  pricing,
  canAddToCart,
  isInCart,
  itemCount,
  onAddToCart,
  onImageError,
}: ProductDetailsViewProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error || 'Product not found.'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          <img
            src={product.image_url ?? '/placeholder-product.svg'}
            alt={product.name || 'Product image'}
            className="w-full h-auto object-cover rounded"
            onError={onImageError}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 mb-4">{String(product.description)}</p>
          )}

          {/* Pricing */}
          {pricing && (
            <div className="mb-4">
              <span className="text-lg font-bold text-gray-900">
                {pricing.formattedPrice}
              </span>
              {typeof product.stock === 'number' && (
                <span className="ml-4 text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              )}
              {pricing.showRoleDiscount && (
                <span className="ml-2 text-xs text-blue-600 font-semibold">
                  {pricing.discountReason}
                </span>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          {canAddToCart && (
            <button
              onClick={onAddToCart}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isInCart
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isInCart ? `In Cart (${itemCount})` : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Product Details</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.sku && <li>SKU: {String(product.sku)}</li>}
          {product.category?.name && <li>Category: {product.category.name}</li>}
          {product.brand && <li>Brand: {String(product.brand)}</li>}
          {product.weight && <li>Weight: {String(product.weight)} kg</li>}
          {product.dimensions && (
            <li>Dimensions: {String(product.dimensions)}</li>
          )}
          {product.material && <li>Material: {String(product.material)}</li>}
          {product.color && <li>Color: {String(product.color)}</li>}
          {product.manufacturer && (
            <li>Manufacturer: {String(product.manufacturer)}</li>
          )}
          {product.warranty && <li>Warranty: {String(product.warranty)}</li>}
        </ul>
      </div>
    </div>
  )
}

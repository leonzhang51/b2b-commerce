import { useEffect, useState } from 'react'
import { Clock, Minus, Plus, ShoppingCart, TrendingUp, X } from 'lucide-react'
import type { Role } from '@/lib/rolePricing'
import type { ShoppingListItem } from '@/hooks/useShoppingList'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ProductImage'
import { convertToCartItems, useShoppingList } from '@/hooks/useShoppingList'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

interface ShoppingListModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingListModal({ isOpen, onClose }: ShoppingListModalProps) {
  const { user } = useAuth()
  const { suggestion, isLoading, error, refetch } = useShoppingList()
  const { addItem } = useCartStore()
  const { addNotification } = useUIStore()

  // Track quantities for each item
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Initialize quantities when suggestion loads
  useEffect(() => {
    if (suggestion?.items) {
      const initialQuantities: Record<string, number> = {}
      suggestion.items.forEach((item) => {
        initialQuantities[item.productId] = item.suggestedQuantity
      })
      setQuantities(initialQuantities)
    }
  }, [suggestion])

  const updateQuantity = (productId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, newQuantity),
    }))
  }

  const handleAddAllToCart = async () => {
    if (!suggestion?.items || !user) return

    setIsAddingToCart(true)
    try {
      const cartItems = await convertToCartItems(suggestion.items, quantities)
      const userRole = user.role as Role

      // Add each item to cart
      cartItems.forEach((item) => {
        addItem(item, userRole)
      })

      const addedCount = cartItems.length
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      addNotification({
        type: 'success',
        message: `Added ${addedCount} items (${totalQuantity} total) to your cart`,
      })

      onClose()
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to add items to cart',
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const selectedItemsCount = Object.values(quantities).filter(
    (q) => q > 0,
  ).length
  const totalSelectedQuantity = Object.values(quantities).reduce(
    (sum, q) => sum + q,
    0,
  )
  const estimatedTotal =
    suggestion?.items.reduce((sum, item) => {
      const quantity = quantities[item.productId] || 0
      return sum + item.price * quantity
    }, 0) || 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Smart Shopping List
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on your order history and purchasing patterns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="ml-3 text-gray-600">
                Analyzing your order history...
              </span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">
                Failed to generate shopping list suggestions
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {suggestion && suggestion.items.length === 0 && (
            <div className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Suggestions Available
              </h3>
              <p className="text-gray-600">
                We need more order history to generate personalized shopping
                suggestions.
                <br />
                Place a few orders and come back to see smart recommendations!
              </p>
            </div>
          )}

          {suggestion && suggestion.items.length > 0 && (
            <div className="p-6">
              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-blue-700">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Based on {suggestion.basedOnOrdersCount} past orders
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <Clock className="w-4 h-4 mr-1" />
                      Generated{' '}
                      {new Date(suggestion.generatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {suggestion.items.map((item) => (
                  <ShoppingListItemRow
                    key={item.productId}
                    item={item}
                    quantity={quantities[item.productId] || 0}
                    onQuantityChange={(newQuantity) =>
                      updateQuantity(item.productId, newQuantity)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestion && suggestion.items.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedItemsCount}</span> items
                selected
                {totalSelectedQuantity > 0 && (
                  <span>
                    {' '}
                    •{' '}
                    <span className="font-medium">
                      {totalSelectedQuantity}
                    </span>{' '}
                    total quantity
                  </span>
                )}
                {estimatedTotal > 0 && (
                  <span>
                    {' '}
                    • Estimated total:{' '}
                    <span className="font-medium">
                      ${estimatedTotal.toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAllToCart}
                  disabled={selectedItemsCount === 0 || isAddingToCart}
                  className="min-w-[120px]"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Adding...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ShoppingListItemRowProps {
  item: ShoppingListItem
  quantity: number
  onQuantityChange: (quantity: number) => void
}

function ShoppingListItemRow({
  item,
  quantity,
  onQuantityChange,
}: ShoppingListItemRowProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      {/* Product Image */}
      <div className="w-16 h-16 flex-shrink-0">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
          <span>${item.price.toFixed(2)}</span>
          <span>Ordered {item.orderFrequency}x</span>
          <span>Last: {formatDate(item.lastOrderedDate)}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onQuantityChange(quantity - 1)}
          disabled={quantity <= 0}
          className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() => onQuantityChange(quantity + 1)}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[80px]">
        <div className="font-medium text-gray-900">
          ${(item.price * quantity).toFixed(2)}
        </div>
      </div>
    </div>
  )
}

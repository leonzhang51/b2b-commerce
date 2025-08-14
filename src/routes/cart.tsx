import { Link } from '@tanstack/react-router'
import { useCartStore } from '@/store'
import { useStoreWithHydration } from '@/hooks/useHydration'
import { useAuth } from '@/hooks/useAuth'

export default function CartPage() {
  const { user } = useAuth()
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
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          <p>Your cart is empty.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            let price = item.price
            if (user?.role === 'admin') price = item.price * 0.9
            else if (user?.role === 'manager') price = item.price * 0.95
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-gray-600">${price.toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )
          })}
          <div className="flex justify-between items-center font-bold text-lg mt-6">
            <span>Subtotal:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          {discountCode && discountPercent ? (
            <div className="flex justify-between items-center text-green-700 font-semibold">
              <span>Discount ({discountCode}):</span>
              <span>-{discountPercent}%</span>
            </div>
          ) : null}
          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total:</span>
            <span>${(discountedTotal ?? totalPrice).toFixed(2)}</span>
          </div>
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Checkout
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Address, CheckoutFormData } from '@/types/order'
import { useCartStore } from '@/store/cartStore'
import { useCurrentUser } from '@/store/userStore'
import { useCheckout } from '@/hooks/useCheckout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CheckoutPage() {
  const user = useCurrentUser()
  const cartItems = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const discountedTotal = useCartStore((state) => state.discountedTotal)
  const { createOrder, loading, error } = useCheckout()

  // Initialize form data with empty values first
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_address: {
      name: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
    },
    billing_address: {
      name: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
    },
    same_as_shipping: true,
    payment_method: 'credit_card',
    notes: '',
  })

  // Update form data when user data becomes available
  useEffect(() => {
    if (user) {
      const userName =
        user.full_name ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        ''
      console.log('current user', user)
      setFormData((prev) => ({
        ...prev,
        shipping_address: {
          street: user.Street || '',
          city: user.City || '',
          state: user.State || '',
          postal_code: user.PostalCode || '',
          country: user.Country || 'US',
          phone: user.phone || '',
          name: userName,
        },
        billing_address: {
          street: user.Street || '',
          city: user.City || '',
          state: user.State || '',
          postal_code: user.PostalCode || '',
          country: user.Country || 'US',
          phone: user.phone || '',
          name: userName,
        },
      }))
    }
  }, [user])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      // Could redirect to cart page or show empty state
    }
  }, [cartItems])

  const handleAddressChange = (
    type: 'shipping_address' | 'billing_address',
    field: keyof Address,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleSameAsShippingChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      same_as_shipping: checked,
      billing_address: checked ? prev.shipping_address : prev.billing_address,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createOrder(formData)
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const finalTotal = discountedTotal || totalPrice

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <Input
                    value={formData.shipping_address.name || ''}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'name',
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.shipping_address.phone || ''}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'phone',
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Street Address
                  </label>
                  <Input
                    value={formData.shipping_address.street}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'street',
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    value={formData.shipping_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'city',
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input
                    value={formData.shipping_address.state}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'state',
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <Input
                    value={formData.shipping_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'postal_code',
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <select
                    value={formData.shipping_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        'shipping_address',
                        'country',
                        e.target.value,
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-9"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Billing Address</h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.same_as_shipping}
                    onChange={(e) =>
                      handleSameAsShippingChange(e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Same as shipping</span>
                </label>
              </div>

              {!formData.same_as_shipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      value={formData.billing_address.name || ''}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'name',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={formData.billing_address.phone || ''}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'phone',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Street Address
                    </label>
                    <Input
                      value={formData.billing_address.street}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'street',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <Input
                      value={formData.billing_address.city}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'city',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <Input
                      value={formData.billing_address.state}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'state',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Postal Code
                    </label>
                    <Input
                      value={formData.billing_address.postal_code}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'postal_code',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <select
                      value={formData.billing_address.country}
                      onChange={(e) =>
                        handleAddressChange(
                          'billing_address',
                          'country',
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-9"
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                Order Notes (Optional)
              </h2>
              <textarea
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any special instructions for your order..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {loading
                ? 'Placing Order...'
                : `Place Order - $${finalTotal.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg border h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {discountedTotal && discountedTotal !== totalPrice && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${(totalPrice - discountedTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

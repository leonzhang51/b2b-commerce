import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { CheckoutFormData, CreateOrderRequest } from '@/types/order'
import { useCartStore } from '@/store/cartStore'
import { useCurrentUser } from '@/store/userStore'
import { supabase } from '@/lib/supabase'

export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const clearCart = useCartStore((state) => state.clearCart)
  const user = useCurrentUser()

  const createOrder = async (formData: CheckoutFormData) => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Get current session token
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError || !sessionData.session?.access_token) {
        throw new Error('No valid session found. Please sign in again.')
      }

      const accessToken = sessionData.session.access_token

      // Get cart items
      const cartItems = useCartStore.getState().items

      if (cartItems.length === 0) {
        throw new Error('Cart is empty')
      }

      // Prepare order items for API
      const orderItems = cartItems.map((item) => ({
        asin: item.productId, // Using productId as asin for now
        name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      }))

      // Prepare order request
      const orderRequest: CreateOrderRequest = {
        user_id: user.id,
        company_id: undefined, // Will be set by the backend based on user profile
        items: orderItems,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address,
        currency: 'USD',
        metadata: {
          notes: formData.notes,
          payment_method: formData.payment_method,
          same_as_shipping: formData.same_as_shipping,
        },
      }

      // Call the create order API with Authorization header
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const result = await response.json()

      // Clear cart on successful order
      clearCart()

      // Navigate to home page
      navigate({ to: '/' })

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createOrder,
    loading,
    error,
  }
}

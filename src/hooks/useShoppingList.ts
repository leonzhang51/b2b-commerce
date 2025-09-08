import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export interface ShoppingListItem {
  readonly productId: string
  readonly name: string
  readonly price: number
  readonly imageUrl?: string
  readonly suggestedQuantity: number
  readonly lastOrderedDate?: string
  readonly orderFrequency: number
  readonly category?: string
}

export interface ShoppingListSuggestion {
  readonly items: Array<ShoppingListItem>
  readonly totalItems: number
  readonly estimatedTotal: number
  readonly generatedAt: string
  readonly basedOnOrdersCount: number
}

// Order history shape is read dynamically from Supabase; keep as implicit any to
// avoid unused-type diagnostics during triage.

/**
 * Hook for generating shopping list suggestions based on user order history and role
 */
export function useShoppingList() {
  const { user } = useAuth()

  const {
    data: suggestion,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shopping-list', user?.id],
    queryFn: async (): Promise<ShoppingListSuggestion> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Fetch user's order history with product details
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select(
          `
          product_asin,
          name,
          unit_price,
          quantity,
          created_at,
          order:orders!inner(user_id, created_at)
        `,
        )
        .eq('order.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100) // Last 100 order items

      if (orderError) {
        throw new Error(`Failed to fetch order history: ${orderError.message}`)
      }

      // Fetch product details for the ordered items
      const productAsins = [
        ...new Set(orderItems.map((item: any) => item.product_asin)),
      ]
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('asin, title, imgUrl, price, category_id')
        .in('asin', productAsins)

      if (productError) {
        console.warn('Failed to fetch product details:', productError.message)
      }

      // Create a map of products for easy lookup
      const productMap = new Map(products?.map((p) => [p.asin, p]) || [])

      // Analyze order history to generate suggestions
      const itemFrequency = new Map<
        string,
        {
          count: number
          totalQuantity: number
          lastOrderDate: string
          avgPrice: number
          name: string
          product?: any
        }
      >()

      orderItems.forEach((item: any) => {
        const existing = itemFrequency.get(item.product_asin)
        const product = productMap.get(item.product_asin)

        if (existing) {
          existing.count += 1
          existing.totalQuantity += item.quantity
          existing.avgPrice = (existing.avgPrice + item.unit_price) / 2
          if (new Date(item.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = item.created_at
          }
        } else {
          itemFrequency.set(item.product_asin, {
            count: 1,
            totalQuantity: item.quantity,
            lastOrderDate: item.created_at,
            avgPrice: item.unit_price,
            name: item.name || product?.title || 'Unknown Product',
            product,
          })
        }
      })

      // Generate suggestions based on frequency and recency
      const suggestions: Array<ShoppingListItem> = []
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      itemFrequency.forEach((data, productId) => {
        const lastOrderDate = new Date(data.lastOrderDate)
        const daysSinceLastOrder = Math.floor(
          (now.getTime() - lastOrderDate.getTime()) / (24 * 60 * 60 * 1000),
        )

        // Suggest items that:
        // 1. Have been ordered multiple times, OR
        // 2. Were ordered recently (within 30 days) and might need reordering
        const shouldSuggest =
          data.count >= 2 ||
          (data.count >= 1 &&
            lastOrderDate > thirtyDaysAgo &&
            daysSinceLastOrder >= 7)

        if (shouldSuggest) {
          // Calculate suggested quantity based on average order quantity
          const avgQuantity = Math.ceil(data.totalQuantity / data.count)
          const suggestedQuantity = Math.max(1, Math.min(avgQuantity, 10)) // Cap at 10

          suggestions.push({
            productId,
            name: data.name,
            price: data.product?.price
              ? parseFloat(data.product.price)
              : data.avgPrice,
            imageUrl: data.product?.imgUrl,
            suggestedQuantity,
            lastOrderedDate: data.lastOrderDate,
            orderFrequency: data.count,
            category: data.product?.category_id?.toString(),
          })
        }
      })

      // Sort suggestions by frequency and recency
      suggestions.sort((a, b) => {
        const aRecency = new Date(a.lastOrderedDate || 0).getTime()
        const bRecency = new Date(b.lastOrderedDate || 0).getTime()
        const aScore = a.orderFrequency * 100 + aRecency / 1000000 // Frequency weighted more than recency
        const bScore = b.orderFrequency * 100 + bRecency / 1000000
        return bScore - aScore
      })

      // Limit to top 20 suggestions
      const topSuggestions = suggestions.slice(0, 20)

      return {
        items: topSuggestions,
        totalItems: topSuggestions.reduce(
          (sum, item) => sum + item.suggestedQuantity,
          0,
        ),
        estimatedTotal: topSuggestions.reduce(
          (sum, item) => sum + item.price * item.suggestedQuantity,
          0,
        ),
        generatedAt: new Date().toISOString(),
        basedOnOrdersCount: orderItems.length || 0,
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    suggestion,
    isLoading,
    error,
    refetch,
    hasData: !!suggestion && suggestion.items.length > 0,
  }
}

/**
 * Convert shopping list items to cart items format
 */
export function convertToCartItems(
  shoppingListItems: Array<ShoppingListItem>,
  quantities: Record<string, number>,
): Array<{
  id: string
  productId: string
  name: string
  price: number
  imageUrl?: string
  quantity: number
}> {
  return shoppingListItems
    .filter((item) => quantities[item.productId] > 0)
    .map((item) => ({
      id: `shopping-list-${item.productId}`,
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: quantities[item.productId],
    }))
}

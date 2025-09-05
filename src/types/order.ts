export interface Address {
  readonly street: string
  readonly city: string
  readonly state: string
  readonly postal_code: string
  readonly country: string
  readonly name?: string
  readonly phone?: string
}

export interface OrderItem {
  readonly product_id: string
  readonly name: string
  readonly quantity: number
  readonly unit_price: number
  readonly total_price: number
}

export interface Order {
  readonly id: string
  readonly user_id: string
  readonly company_id?: string
  readonly total: number
  readonly currency: string
  readonly status: OrderStatus
  readonly shipping_address: Address
  readonly billing_address: Address
  readonly items: Array<OrderItem>
  readonly metadata?: Record<string, any>
  readonly created_at: string
  readonly updated_at: string
}

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'placed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface CheckoutFormData {
  readonly shipping_address: Address
  readonly billing_address: Address
  readonly same_as_shipping: boolean
  readonly payment_method?: string
  readonly notes?: string
}

export interface CreateOrderRequest {
  readonly user_id: string
  readonly company_id?: string
  readonly items: Array<{
    readonly asin: string
    readonly name: string
    readonly unit_price: number
    readonly quantity: number
  }>
  readonly shipping_address: Address
  readonly billing_address: Address
  readonly currency?: string
  readonly metadata?: Record<string, any>
}

export interface CreateOrderResponse {
  readonly orderId: string
  readonly total: number
}

export interface CartItem {
  readonly id: string
  readonly productId: string
  readonly name: string
  readonly price: number
  readonly quantity: number
  readonly imageUrl?: string
}

export interface CartState {
  readonly items: Array<CartItem>
  readonly isOpen: boolean
  readonly totalItems: number
  readonly totalPrice: number
}

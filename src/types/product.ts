export interface Product {
  readonly id: string
  readonly product_id?: string
  readonly asin?: string
  readonly sku?: string
  readonly name: string
  readonly title?: string
  readonly description?: string | null
  readonly category_id?: number | string | null
  readonly category?: {
    readonly id?: number | string
    readonly name?: string
  } | null
  readonly price?: number | string | null
  readonly listPrice?: number | string | null
  readonly imgUrl?: string | null
  readonly image_url?: string | null
  readonly img_urls?: Array<string> | null
  readonly brand?: string
  readonly weight?: string | number
  readonly dimensions?: string
  readonly material?: string
  readonly color?: string
  readonly manufacturer?: string
  readonly warranty?: string
  readonly [key: string]: unknown
}

export default Product

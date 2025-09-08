import type Product from '@/types/product'

export function csvToProduct(csv: {
  name: string
  description?: string
  price: number
  category?: string
  brand?: string
  sku?: string
  image_url?: string
  stock_quantity?: number
}): Product {
  const id = csv.sku ?? `${csv.name}-${Date.now()}`
  return {
    id: String(id),
    product_id: String(id),
    sku: csv.sku,
    name: csv.name,
    title: csv.name,
    description: csv.description ?? null,
    price: csv.price,
    listPrice: csv.price,
    imgUrl: csv.image_url ?? null,
    image_url: csv.image_url ?? null,
    img_urls: csv.image_url ? [csv.image_url] : null,
    category: csv.category ? { name: csv.category } : null,
    stock: csv.stock_quantity ?? undefined,
  } as unknown as Product
}

export function freeToProduct(free: {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  brand?: string
  rating?: number
}): Product {
  return {
    id: String(free.id),
    product_id: String(free.id),
    name: free.title,
    title: free.title,
    description: free.description,
    price: free.price,
    listPrice: free.price,
    imgUrl: free.image,
    image_url: free.image,
    img_urls: free.image ? [free.image] : null,
    category: { name: free.category },
    brand: free.brand,
  } as unknown as Product
}

export default { csvToProduct, freeToProduct }

import { useProduct } from '@/hooks/useSupabase'
import { ProductImage } from '@/components/ProductImage'
import { AddToCartButton } from '@/components/CartComponents'
import { useAuth } from '@/hooks/useAuth'

interface ProductDetailsProps {
  productId: string
}

function getRolePrice(product: any, role: string | undefined): number {
  if (role === 'admin') return product.price * 0.9
  if (role === 'manager') return product.price * 0.95
  if (role === 'buyer') return product.price
  return product.price
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const { user } = useAuth()
  const { data: product, isLoading, error } = useProduct(productId)

  if (isLoading) {
    return <div className="p-8 text-center">Loading product...</div>
  }
  if (error || !product) {
    return (
      <div className="p-8 text-center text-red-500">Product not found.</div>
    )
  }

  const price = getRolePrice(product, user?.role)

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-1/2">
          <ProductImage
            src={product.image_url}
            alt={product.name || 'Product image'}
            className="w-full h-auto object-cover rounded"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="mb-4">
            <span className="text-lg font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Stock: {product.stock}
            </span>
            {user?.role && user.role !== 'buyer' && (
              <span className="ml-2 text-xs text-blue-600 font-semibold">
                {user.role} price
              </span>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={price}
            imageUrl={product.image_url}
          />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Product Details</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.sku && <li>SKU: {product.sku}</li>}
          {product.category?.name && <li>Category: {product.category.name}</li>}
          {product.brand && <li>Brand: {product.brand}</li>}
          {product.weight && <li>Weight: {product.weight} kg</li>}
          {product.dimensions && <li>Dimensions: {product.dimensions}</li>}
          {product.material && <li>Material: {product.material}</li>}
          {product.color && <li>Color: {product.color}</li>}
          {product.manufacturer && (
            <li>Manufacturer: {product.manufacturer}</li>
          )}
          {product.warranty && <li>Warranty: {product.warranty}</li>}
          {/* Add more fields as needed */}
        </ul>
      </div>
    </div>
  )
}

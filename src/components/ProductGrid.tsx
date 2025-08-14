import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ProductImage'
import { useAuth } from '@/hooks/useAuth'
import { ProductSearchBar } from '@/components/ProductSearchBar'
import { ProductFacetedFilters } from '@/components/ProductFacetedFilters'
import { ProductFilterChips } from '@/components/ProductFilterChips'
import { useProductSearch } from '@/hooks/useProductSearch'

// Product type for price logic
interface Product {
  id: string
  name: string
  price: number
  category?: { name?: string }
  brand?: string
  image_url?: string
  description?: string
  sku?: string
  stock?: number
  [key: string]: unknown
}

function getRolePrice(product: Product, role: string | undefined): number {
  if (role === 'admin') return product.price * 0.9
  if (role === 'manager') return product.price * 0.95
  if (role === 'buyer') return product.price
  return product.price
}

export function ProductGrid() {
  const { products = [], isLoading, error, query } = useProductSearch()

  // Debug logging
  console.log('ProductGrid render:', {
    productsCount: products.length,
    isLoading,
    hasError: !!error,
    query,
    sampleProduct: products[0],
  })

  function ProductCard({ product }: { product: Product }) {
    const { user } = useAuth()
    const price = getRolePrice(product, user?.role)
    return (
      <Link to={`/product/${product.id}` as any} className="block">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100">
            <ProductImage
              src={product.image_url}
              alt={product.name || 'Product image'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category?.name}
              </p>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h3>
            </div>
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  ${price.toFixed(2)}
                </span>
                {user?.role && user.role !== 'buyer' && (
                  <span className="ml-2 text-xs text-blue-600 font-semibold">
                    {user.role} price
                  </span>
                )}
              </div>
              <Button size="sm" className="shrink-0">
                Add to Cart
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              {product.sku && (
                <p className="text-xs text-gray-400">SKU: {product.sku}</p>
              )}
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  function ProductCardSkeleton() {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="aspect-square bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProductSearchBar />
      <ProductFacetedFilters />
      <ProductFilterChips />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load products</p>
          <p className="text-sm text-gray-500">{String(error)}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">No products found</p>
          {query && (
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or browse by category
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            let category: { name?: string } | undefined = undefined
            if (typeof product.category === 'string') {
              category = { name: product.category }
            }
            return (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: typeof product.price === 'number' ? product.price : 0,
                  category,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
// Removed unreachable duplicate return and pagination UI
// Removed unreachable duplicate return and pagination UI

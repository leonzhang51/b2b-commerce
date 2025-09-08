import { Link } from '@tanstack/react-router'
import type Product from '@/types/product'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useSupabase'

function getRolePrice(product: Product, role: string | undefined): number {
  const raw = product.price ?? product.listPrice ?? 0
  const basePrice =
    typeof raw === 'string'
      ? parseFloat(raw) || 0
      : typeof raw === 'number'
        ? raw
        : 0
  if (role === 'admin') return basePrice * 0.9
  if (role === 'manager') return basePrice * 0.95
  return basePrice
}

interface ProductGridProps {
  readonly selectedCategoryId?: number | null
  readonly searchQuery?: string
}

export function ProductGrid({
  selectedCategoryId,
  searchQuery,
}: ProductGridProps) {
  const {
    data: products = [],
    isLoading,
    error,
  } = useProducts({
    categoryId: selectedCategoryId || undefined,
    searchTerm: searchQuery || undefined,
  })

  // Debug logging
  console.log('ProductGrid render:', {
    productsCount: products.length,
    isLoading,
    hasError: !!error,
    selectedCategoryId,
    searchQuery,
    sampleProduct: products[0],
  })

  function ProductCard({ product }: { product: Product }) {
    const { user } = useAuth()
    const price = getRolePrice(product, user?.role)

    // Use the mapped fields from our new product schema
    const productName = product.name || product.title || 'Unnamed Product'
    const productImage = product.image_url || product.imgUrl
    const productId = product.id || product.asin
    const categoryName = product.category?.name ?? ''

    return (
      <Link to={`/product/${productId}` as any} className="block">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.log('Image failed to load:', productImage)
                  e.currentTarget.src = '/placeholder-product.svg'
                }}
              />
            ) : (
              <img
                src="/placeholder-product.svg"
                alt={productName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {categoryName}
              </p>
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {productName}
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
                  $
                  {typeof price === 'number' ? price.toFixed(2) : String(price)}
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
              <p className="text-xs text-gray-500">
                Stock: {String(product.stock ?? 'N/A')}
              </p>
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
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or browse by category
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => {
            return (
              <ProductCard key={product.id || product.asin} product={product} />
            )
          })}
        </div>
      )}
    </div>
  )
}

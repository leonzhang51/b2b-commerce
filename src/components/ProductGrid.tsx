import { useState } from 'react'
import { useProducts } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ProductImage'

interface ProductGridProps {
  readonly categoryId?: string | null
  readonly searchQuery?: string
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [page, setPage] = useState(0)
  const limit = 12
  const offset = page * limit

  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    categoryId,
    search: searchQuery,
    limit,
    offset,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load products</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No products found</p>
        {searchQuery && (
          <p className="text-sm text-gray-500">
            Try adjusting your search terms or browse by category
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === limit && (
        <div className="flex justify-center">
          <Button onClick={() => setPage((p) => p + 1)} variant="outline">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  readonly product: any // We'll type this properly later
}

function ProductCard({ product }: ProductCardProps) {
  return (
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
              ${product.price.toFixed(2)}
            </span>
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

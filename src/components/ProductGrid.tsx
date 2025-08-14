import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Product } from '@/lib/supabase'
import { useProducts } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ProductImage'
import { useAuth } from '@/hooks/useAuth'

interface ProductGridProps {
  readonly categoryId?: string | null
  readonly searchQuery?: string
}

function getRolePrice(product: Product, role: string | undefined): number {
  // Example: price tiers by role
  if (role === 'admin') return product.price * 0.9 // 10% off for admin
  if (role === 'manager') return product.price * 0.95 // 5% off for manager
  if (role === 'buyer') return product.price // base price
  return product.price // guest or unknown
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const offset = (page - 1) * pageSize

  const {
    data: products = [],
    isLoading,
    error,
  } = useProducts({
    categoryId,
    search: searchQuery,
    limit: pageSize,
    offset,
  })

  // For total count, fetch first page with count
  // (Assume useProducts can be extended to return count, or fetch separately if needed)
  // For now, estimate if next page exists by products.length === pageSize

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: pageSize }).map((_, i) => (
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

  if (products.length === 0) {
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
      {/* Page size selector */}
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="page-size" className="text-sm text-gray-600">
          Products per page:
        </label>
        <select
          id="page-size"
          className="border rounded px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setPage(1)
          }}
        >
          {[6, 12, 24, 48].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={products.length < pageSize}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

interface ProductCardProps {
  readonly product: any // We'll type this properly later
}

function ProductCard({ product }: ProductCardProps) {
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

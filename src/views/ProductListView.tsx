export interface Product {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly price: number
  readonly imageUrl?: string
  readonly category?: string
  readonly brand?: string
  readonly stock?: number
  readonly rating?: number
  readonly reviews?: number
}

export interface ProductListViewProps {
  readonly products: Array<Product>
  readonly loading: boolean
  readonly error: string | null
  readonly totalCount: number
  readonly hasMore: boolean
  readonly query: string
  readonly filters: Record<string, any>
  readonly sortBy: string
  readonly sortOrder: 'asc' | 'desc'
  readonly page: number
  readonly pageSize: number
  readonly suggestions: Array<string>
  readonly onQueryChange: (query: string) => void
  readonly onFilterChange: (key: string, value: any) => void
  readonly onClearFilters: () => void
  readonly onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  readonly onPageChange: (page: number) => void
  readonly onLoadMore: () => void
  readonly onProductClick: (productId: string) => void
  readonly onAddToCart?: (product: Product) => void
}

/**
 * Pure presentational component for Product List
 *
 * Displays products in a grid with search, filters, and pagination
 */
export function ProductListView({
  products,
  loading,
  error,
  totalCount,
  hasMore,
  query,
  filters,
  sortBy,
  sortOrder,
  page,
  pageSize,
  suggestions,
  onQueryChange,
  onFilterChange,
  onClearFilters,
  onSortChange,
  onPageChange,
  onLoadMore,
  onProductClick,
  onAddToCart,
}: ProductListViewProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Products
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search for products..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && query && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onQueryChange(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) =>
                onFilterChange('category', e.target.value || undefined)
              }
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="tools">Tools</option>
              <option value="hardware">Hardware</option>
              <option value="lumber">Lumber</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Any"
              className="w-24 rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* In Stock Filter */}
          <div className="flex items-center">
            <input
              id="inStock"
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) =>
                onFilterChange('inStock', e.target.checked || undefined)
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
              In Stock Only
            </label>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                onSortChange(newSortBy, newSortOrder as 'asc' | 'desc')
              }}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="relevance-asc">Relevance</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          {Object.keys(filters).length > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          {loading ? 'Loading...' : `${totalCount} products found`}
        </p>
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-12">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
            />
          </svg>
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onProductClick(product.id)}
            >
              {/* Product Image */}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>

                  {product.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating} ({product.reviews || 0})
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                {product.stock !== undefined && (
                  <p
                    className={`text-sm mb-3 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : 'Out of stock'}
                  </p>
                )}

                {/* Add to Cart Button */}
                {onAddToCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToCart(product)
                    }}
                    disabled={product.stock === 0}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className={`px-3 py-2 rounded text-sm ${
                  pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

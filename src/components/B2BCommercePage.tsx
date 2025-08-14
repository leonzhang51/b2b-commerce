import { useState } from 'react'
import { ConnectionTest } from '@/components/ConnectionTest'
import { CategoryNavigation } from '@/components/CategoryNavigation'
import { ProductGrid } from '@/components/ProductGrid'
import { CartSidebar } from '@/components/CartComponents'

export function B2BCommercePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when selecting a category
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Test */}
        <div className="mb-8">
          <ConnectionTest />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h2>
              <CategoryNavigation
                selectedCategoryId={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Page Header */}
              <div className="mb-6">
                {searchQuery ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Search Results
                    </h2>
                    <p className="text-gray-600">
                      Showing results for <strong>"{searchQuery}"</strong>
                    </p>
                  </div>
                ) : selectedCategory ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Category Products
                    </h2>
                    <p className="text-gray-600">
                      Showing products in selected category
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      All Products
                    </h2>
                    <p className="text-gray-600">
                      Professional tools and materials for contractors,
                      plumbers, and construction professionals
                    </p>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <ProductGrid
                categoryId={selectedCategory}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </div>
      <CartSidebar />
    </div>
  )
}

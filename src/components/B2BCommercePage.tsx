import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { ConnectionTest } from '@/components/ConnectionTest'
import { CategoryNavigation } from '@/components/CategoryNavigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductSearch } from '@/components/ProductSearch'

export function B2BCommercePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when selecting a category
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      setSelectedCategory(null) // Clear category when searching
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                B2B Commerce Platform
              </h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Beta
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <ProductSearch
                onSearch={handleSearch}
                placeholder="Search tools, materials, equipment..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Cart (0)
              </button>
              {(() => {
                const { user, signOut } = useAuth()
                if (user) {
                  return (
                    <button
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                      onClick={signOut}
                    >
                      Sign Out
                    </button>
                  )
                }
                return (
                  <>
                    <Link
                      to="/login"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Sign Up
                    </Link>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </header>

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
    </div>
  )
}

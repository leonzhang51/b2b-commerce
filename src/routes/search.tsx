import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CategoryNavigation } from '@/components/CategoryNavigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ConnectionTest } from '@/components/ConnectionTest'

export const Route = createFileRoute('/search')({
  component: SearchResultsPage,
})

function SearchResultsPage() {
  // Access search params (q, categoryId)
  const navigate = useNavigate()
  // Using generic any to avoid adding zod validation here; this is safe and keeps things simple
  const search: any = Route.useSearch()
  const q: string = typeof search.q === 'string' ? search.q : ''
  const categoryId: number | null =
    typeof search.categoryId === 'number' ? search.categoryId : null

  const onCategorySelect = (id: number | null) => {
    navigate({
      to: '/search',
      search: { q: q || undefined, categoryId: id ?? undefined },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <ConnectionTest />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h2>
              <CategoryNavigation
                selectedCategoryId={categoryId}
                onCategorySelect={onCategorySelect}
              />
            </div>
          </aside>

          {/* Main Content - Search Results */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                {q ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Search Results
                    </h2>
                    <p className="text-gray-600">
                      Showing results for <strong>"{q}"</strong>
                    </p>
                  </div>
                ) : categoryId ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Category Products
                    </h2>
                    <p className="text-gray-600">
                      Filtered by selected category
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      All Products
                    </h2>
                    <p className="text-gray-600">
                      Browse the full catalog or select a category
                    </p>
                  </div>
                )}
              </div>

              <ProductGrid selectedCategoryId={categoryId} searchQuery={q} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

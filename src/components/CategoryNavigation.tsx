import { useCategories } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'

interface CategoryNavigationProps {
  readonly onCategorySelect: (categoryId: number | null) => void
  readonly selectedCategoryId?: number | null
}

export function CategoryNavigation({
  onCategorySelect,
  selectedCategoryId,
}: CategoryNavigationProps) {
  const { data: categories, isLoading, error } = useCategories()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Failed to load categories</p>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 text-sm">No categories available</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Button
        variant={selectedCategoryId === null ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => onCategorySelect(null)}
      >
        All Products
      </Button>

      {categories.map((category) => (
        <Button
          key={category.category_id}
          variant={
            selectedCategoryId === category.category_id ? 'default' : 'ghost'
          }
          className="w-full justify-start text-sm"
          onClick={() => onCategorySelect(category.category_id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}

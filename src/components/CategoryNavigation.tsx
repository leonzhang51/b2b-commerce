import { useCategories } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { categoryAccent } from '@/config/categories'
import { categoryIcon } from '@/utils/categoryIcon'

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

  // Prefer DB-driven ordering: featured_rank first (ascending), then the rest in original order
  const ranked = (categories as Array<any>).filter(
    (c) => typeof c.featured_rank === 'number',
  )
  const ordered = ranked.length
    ? [...ranked]
        .sort((a: any, b: any) => a.featured_rank - b.featured_rank)
        .concat(
          (categories as Array<any>).filter(
            (c) => typeof c.featured_rank !== 'number',
          ),
        )
    : categories

  return (
    <div className="space-y-1">
      <Button
        variant={selectedCategoryId === null ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => onCategorySelect(null)}
      >
        All Products
      </Button>

      {ordered.map((category) => (
        <Button
          key={category.category_id}
          variant={
            selectedCategoryId === category.category_id ? 'default' : 'ghost'
          }
          className="w-full justify-start text-sm text-black h-auto min-h-[2.5rem] py-2 whitespace-normal break-words text-left leading-snug flex items-start gap-2"
          onClick={() => onCategorySelect(category.category_id)}
        >
          <span
            className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ${categoryAccent(String(category.name || ''), category.accent_color)}`}
          >
            {categoryIcon(String(category.name || ''), 'h-4 w-4')}
          </span>
          <span className="block flex-1 min-w-0 break-words whitespace-normal text-left">
            {category.name}
          </span>
        </Button>
      ))}
    </div>
  )
}

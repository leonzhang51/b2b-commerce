import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { useCategoryTree } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'

interface CategoryNavigationProps {
  readonly onCategorySelect: (categoryId: number | null) => void
  readonly selectedCategoryId?: number | null
}

export function CategoryNavigation({
  onCategorySelect,
  selectedCategoryId,
}: CategoryNavigationProps) {
  const { data: categories, isLoading, error } = useCategoryTree()
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  )

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

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
        <CategoryItem
          key={category.category_id}
          category={category}
          selectedCategoryId={selectedCategoryId}
          expandedCategories={expandedCategories}
          onCategorySelect={onCategorySelect}
          onToggleExpanded={toggleExpanded}
          level={0}
        />
      ))}
    </div>
  )
}

interface CategoryItemProps {
  readonly category: any // We'll type this properly later
  readonly selectedCategoryId?: number | null
  readonly expandedCategories: Set<number>
  readonly onCategorySelect: (categoryId: number) => void
  readonly onToggleExpanded: (categoryId: number) => void
  readonly level: number
}

function CategoryItem({
  category,
  selectedCategoryId,
  expandedCategories,
  onCategorySelect,
  onToggleExpanded,
  level,
}: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.category_id)
  const isSelected = selectedCategoryId === category.category_id
  const indent = level * 16

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => onToggleExpanded(category.category_id)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <Button
          variant={isSelected ? 'default' : 'ghost'}
          className="flex-1 justify-start text-sm"
          style={{ paddingLeft: indent + 8 }}
          onClick={() => onCategorySelect(category.category_id)}
        >
          {category.name}
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-1">
          {category.children.map((child: any) => (
            <CategoryItem
              key={child.category_id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              expandedCategories={expandedCategories}
              onCategorySelect={onCategorySelect}
              onToggleExpanded={onToggleExpanded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

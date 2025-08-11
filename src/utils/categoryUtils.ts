import type { Category } from '@/lib/supabase'

export interface CategoryWithHierarchy extends Category {
  children?: Array<CategoryWithHierarchy>
  path?: string
  breadcrumb?: Array<string>
}

/**
 * Build a hierarchical tree structure from flat category array
 */
export function buildCategoryTree(
  categories: Array<Category>,
): Array<CategoryWithHierarchy> {
  const categoryMap = new Map<string, CategoryWithHierarchy>()
  const rootCategories: Array<CategoryWithHierarchy> = []

  // First pass: create map of all categories with mutable properties
  categories.forEach((category) => {
    const categoryWithHierarchy: CategoryWithHierarchy = {
      ...category,
      children: [],
      breadcrumb: [],
    }
    categoryMap.set(category.id, categoryWithHierarchy)
  })

  // Second pass: build tree structure and paths
  categories.forEach((category) => {
    const categoryWithHierarchy = categoryMap.get(category.id)!

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(categoryWithHierarchy)

        // Build breadcrumb path
        categoryWithHierarchy.breadcrumb = [
          ...(parent.breadcrumb || []),
          parent.name,
        ]
        categoryWithHierarchy.path = [
          ...(parent.breadcrumb || []),
          parent.name,
          category.name,
        ].join(' > ')
      }
    } else {
      // Root level category
      categoryWithHierarchy.breadcrumb = []
      categoryWithHierarchy.path = category.name
      rootCategories.push(categoryWithHierarchy)
    }
  })

  return rootCategories
}

/**
 * Get all categories at a specific level
 */
export function getCategoriesByLevel(
  categories: Array<Category>,
  level: 1 | 2 | 3 | 4,
): Array<Category> {
  return categories.filter((cat) =>
    level === 1
      ? !cat.parent_id
      : getAncestorCount(categories, cat.id) === level - 1,
  )
}

/**
 * Get the ancestor count for a category (to determine its level)
 */
function getAncestorCount(
  categories: Array<Category>,
  categoryId: string,
): number {
  const category = categories.find((c) => c.id === categoryId)
  if (!category || !category.parent_id) return 0

  return 1 + getAncestorCount(categories, category.parent_id)
}

/**
 * Get the full breadcrumb path for a category
 */
export function getCategoryBreadcrumb(
  categories: Array<Category>,
  categoryId: string,
): Array<string> {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return []

  if (!category.parent_id) return [category.name]

  return [
    ...getCategoryBreadcrumb(categories, category.parent_id),
    category.name,
  ]
}

/**
 * Get all descendant categories for a given category
 */
export function getDescendantCategories(
  categories: Array<Category>,
  parentId: string,
): Array<Category> {
  const directChildren = categories.filter((c) => c.parent_id === parentId)
  const allDescendants = [...directChildren]

  directChildren.forEach((child) => {
    allDescendants.push(...getDescendantCategories(categories, child.id))
  })

  return allDescendants
}

/**
 * Find categories by name (fuzzy search)
 */
export function findCategoriesByName(
  categories: Array<Category>,
  searchTerm: string,
): Array<CategoryWithHierarchy> {
  const matchingCategories = categories
    .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((cat) => ({
      ...cat,
      breadcrumb: getCategoryBreadcrumb(categories, cat.id),
      path: getCategoryBreadcrumb(categories, cat.id).join(' > '),
    }))

  return matchingCategories
}

/**
 * Category level names for B2B commerce
 */
export const CATEGORY_LEVELS = {
  1: 'Division',
  2: 'Department',
  3: 'Category',
  4: 'Subcategory',
} as const

/**
 * Get level name for a category
 */
export function getCategoryLevelName(
  categories: Array<Category>,
  categoryId: string,
): string {
  const level = getAncestorCount(categories, categoryId) + 1
  const levelKey = level as 1 | 2 | 3 | 4
  return levelKey in CATEGORY_LEVELS ? CATEGORY_LEVELS[levelKey] : 'Unknown'
}

/**
 * Validate category hierarchy (check for orphans, circular references, etc.)
 */
export function validateCategoryHierarchy(categories: Array<Category>): {
  isValid: boolean
  errors: Array<string>
} {
  const errors: Array<string> = []
  const categoryIds = new Set(categories.map((c) => c.id))

  // Check for orphaned categories
  categories.forEach((category) => {
    if (category.parent_id && !categoryIds.has(category.parent_id)) {
      errors.push(
        `Category "${category.name}" (${category.id}) has non-existent parent: ${category.parent_id}`,
      )
    }
  })

  // Check for circular references
  categories.forEach((category) => {
    if (hasCircularReference(categories, category.id)) {
      errors.push(
        `Category "${category.name}" (${category.id}) has circular reference`,
      )
    }
  })

  // Check for categories beyond 4 levels
  categories.forEach((category) => {
    const level = getAncestorCount(categories, category.id) + 1
    if (level > 4) {
      errors.push(
        `Category "${category.name}" (${category.id}) exceeds 4-level limit (level ${level})`,
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a category has circular reference
 */
function hasCircularReference(
  categories: Array<Category>,
  categoryId: string,
  visited: Set<string> = new Set(),
): boolean {
  if (visited.has(categoryId)) return true

  const category = categories.find((c) => c.id === categoryId)
  if (!category || !category.parent_id) return false

  visited.add(categoryId)
  return hasCircularReference(categories, category.parent_id, visited)
}

/**
 * Get category statistics
 */
export function getCategoryStats(categories: Array<Category>): {
  totalCategories: number
  byLevel: Record<number, number>
  maxDepth: number
  orphanedCategories: number
} {
  const byLevel: Record<number, number> = {}
  let maxDepth = 0
  let orphanedCategories = 0
  const categoryIds = new Set(categories.map((c) => c.id))

  categories.forEach((category) => {
    const level = getAncestorCount(categories, category.id) + 1
    byLevel[level] = (byLevel[level] || 0) + 1
    maxDepth = Math.max(maxDepth, level)

    if (category.parent_id && !categoryIds.has(category.parent_id)) {
      orphanedCategories++
    }
  })

  return {
    totalCategories: categories.length,
    byLevel,
    maxDepth,
    orphanedCategories,
  }
}

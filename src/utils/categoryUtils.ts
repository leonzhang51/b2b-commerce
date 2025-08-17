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
  const categoryMap = new Map<number, CategoryWithHierarchy>()
  const rootCategories: Array<CategoryWithHierarchy> = []

  // First pass: create map of all categories with mutable properties
  categories.forEach((category) => {
    const categoryWithHierarchy: CategoryWithHierarchy = {
      ...category,
      children: [],
      breadcrumb: [],
    }
    categoryMap.set(category.category_id, categoryWithHierarchy)
  })

  // Second pass: build tree structure and paths
  categories.forEach((category) => {
    const categoryWithHierarchy = categoryMap.get(category.category_id)!

    if (category.parent_id != null) {
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
  return categories.filter((cat) => cat.level === level)
}

/**
 * Get the ancestor count for a category (to determine its level)
 */
function getAncestorCount(
  categories: Array<Category>,
  categoryId: number,
): number {
  const category = categories.find((c) => c.category_id === categoryId)
  if (!category || category.parent_id == null) return 0

  return 1 + getAncestorCount(categories, category.parent_id)
}

/**
 * Get the full breadcrumb path for a category
 */
export function getCategoryBreadcrumb(
  categories: Array<Category>,
  categoryId: number,
): Array<string> {
  const category = categories.find((c) => c.category_id === categoryId)
  if (!category) return []

  if (category.parent_id == null) return [category.name]

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
  parentId: number,
): Array<Category> {
  const directChildren = categories.filter((c) => c.parent_id === parentId)
  const allDescendants = [...directChildren]

  directChildren.forEach((child) => {
    allDescendants.push(
      ...getDescendantCategories(categories, child.category_id),
    )
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
      breadcrumb: getCategoryBreadcrumb(categories, cat.category_id),
      path: getCategoryBreadcrumb(categories, cat.category_id).join(' > '),
    }))

  return matchingCategories
}

/**
 * Category level names for B2B commerce (Home Depot style)
 */
export const CATEGORY_LEVELS = {
  1: 'Department', // e.g., "Appliances", "Tools"
  2: 'Subcategory', // e.g., "Major Appliances", "Power Tools"
  3: 'Product Type', // e.g., "Refrigerators", "Drills & Drivers"
  4: 'Product Group', // e.g., "French Door", "Cordless Drills"
} as const

/**
 * Get level name for a category
 */
export function getCategoryLevelName(
  categories: Array<Category>,
  categoryId: number,
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
  const categoryIds = new Set(categories.map((c) => c.category_id))

  // Check for orphaned categories
  categories.forEach((category) => {
    if (category.parent_id != null && !categoryIds.has(category.parent_id)) {
      errors.push(
        `Category "${category.name}" (${category.category_id}) has non-existent parent: ${category.parent_id}`,
      )
    }
  })

  // Check for circular references
  categories.forEach((category) => {
    if (hasCircularReference(categories, category.category_id)) {
      errors.push(
        `Category "${category.name}" (${category.category_id}) has circular reference`,
      )
    }
  })

  // Check for categories beyond 4 levels
  categories.forEach((category) => {
    const level = getAncestorCount(categories, category.category_id) + 1
    if (level > 4) {
      errors.push(
        `Category "${category.name}" (${category.category_id}) exceeds 4-level limit (level ${level})`,
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
  categoryId: number,
  visited: Set<number> = new Set(),
): boolean {
  if (visited.has(categoryId)) return true

  const category = categories.find((c) => c.category_id === categoryId)
  if (!category || category.parent_id == null) return false

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
  const categoryIds = new Set(categories.map((c) => c.category_id))

  categories.forEach((category) => {
    const level = getAncestorCount(categories, category.category_id) + 1
    byLevel[level] = (byLevel[level] || 0) + 1
    maxDepth = Math.max(maxDepth, level)

    if (category.parent_id != null && !categoryIds.has(category.parent_id)) {
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

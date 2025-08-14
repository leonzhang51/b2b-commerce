import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Category } from '@/lib/supabase'
import type { CategoryWithHierarchy } from '@/utils/categoryUtils'

import { useCategories } from '@/hooks/useSupabase'
import { useAuth } from '@/hooks/useAuth'
import {
  CATEGORY_LEVELS,
  buildCategoryTree,
  getCategoryStats,
  validateCategoryHierarchy,
} from '@/utils/categoryUtils'

export function CategoryManager() {
  const { data: categories = [], isLoading, error } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'flat' | 'stats'>('tree')

  // --- Category-level role restrictions state ---
  const [categoryRoles, setCategoryRoles] = useState<
    Record<string, Array<string>>
  >({})
  const [showAllCategories, setShowAllCategories] = useState(false)

  if (isLoading) return <div className="p-4">Loading categories...</div>
  if (error)
    return <div className="p-4 text-red-500">Error loading categories</div>

  const [treeOrder, setTreeOrder] = useState<Array<string>>([])
  const categoryTree = buildCategoryTree(categories)
  // Keep a flat order of top-level category IDs for drag-and-drop
  const topLevelIds = categoryTree.map((cat) => cat.id)
  // If treeOrder is empty or out of sync, update it
  if (
    treeOrder.length !== topLevelIds.length ||
    treeOrder.some((id, i) => id !== topLevelIds[i])
  ) {
    setTreeOrder(topLevelIds)
  }

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = treeOrder.indexOf(active.id)
      const newIndex = treeOrder.indexOf(over.id)
      const newOrder = arrayMove(treeOrder, oldIndex, newIndex)
      setTreeOrder(newOrder)
      // TODO: Persist new order to backend
    }
  }
  const validation = validateCategoryHierarchy(categories)
  const stats = getCategoryStats(categories)

  // Helper to get breadcrumb path for selected category
  function getSelectedBreadcrumb(): Array<{ id: string; name: string }> {
    if (!selectedCategory) return []
    // Find the selected node in the tree
    function findPath(
      node: CategoryWithHierarchy,
      path: Array<{ id: string; name: string }>,
    ): Array<{ id: string; name: string }> {
      if (node.id === selectedCategory)
        return [...path, { id: node.id, name: node.name }]
      if (node.children) {
        for (const child of node.children) {
          const res = findPath(child, [
            ...path,
            { id: node.id, name: node.name },
          ])
          if (res.length) return res
        }
      }
      return []
    }
    for (const root of categoryTree) {
      const res = findPath(root, [])
      if (res.length) return res
    }
    return []
  }

  const selectedBreadcrumb = getSelectedBreadcrumb()

  // Helper to filter categories by role
  function getVisibleCategories(
    allCategories: Array<Category>,
    userRoles: Array<string>,
    showAll: boolean,
  ): Array<Category> {
    if (showAll) return allCategories
    // Only show categories where at least one allowed role matches userRoles
    return allCategories.filter((cat) => {
      const allowed = categoryRoles[cat.id]
      if (allowed.length === 0) return true // If no restriction, show
      return allowed.some((role) => userRoles.includes(role))
    })
  }

  // Get user roles from auth
  const { user } = useAuth()
  let userRoles: Array<string> = []
  if (user) {
    if (user.role) userRoles.push(user.role)
    if (user.permissions && Array.isArray(user.permissions))
      userRoles = userRoles.concat(user.permissions)
  }

  // Use getVisibleCategories to filter categories for display
  const visibleCategories = getVisibleCategories(
    categories,
    userRoles,
    showAllCategories,
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Category Management</h1>

        {/* Breadcrumbs */}
        {selectedBreadcrumb.length > 0 && (
          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <ol className="flex flex-wrap gap-1 items-center">
              {selectedBreadcrumb.map((crumb, idx) => (
                <li key={crumb.id} className="flex items-center">
                  <button
                    className={`hover:underline ${idx === selectedBreadcrumb.length - 1 ? 'font-semibold text-blue-700' : ''}`}
                    onClick={() => setSelectedCategory(crumb.id)}
                    disabled={idx === selectedBreadcrumb.length - 1}
                  >
                    {crumb.name}
                  </button>
                  {idx < selectedBreadcrumb.length - 1 && (
                    <span className="mx-1">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded ${
              viewMode === 'tree'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-4 py-2 rounded ${
              viewMode === 'flat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Flat List
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded ${
              viewMode === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Validation Status */}
        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-red-800 mb-2">
              Category Issues Found:
            </h3>
            <ul className="list-disc list-inside text-red-700">
              {validation.errors.map((validationError, index) => (
                <li key={index}>{validationError}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Show All Categories Switch */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={showAllCategories}
              onChange={() => setShowAllCategories((v) => !v)}
              className="accent-blue-500"
            />
            Show all categories
          </label>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Category Hierarchy</h2>
            <div className="bg-white border rounded-lg p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={treeOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {treeOrder.map((id) => {
                    const division = categoryTree.find((cat) => cat.id === id)
                    if (!division) return null
                    return (
                      <SortableCategoryTreeNode
                        key={division.id}
                        id={division.id}
                        category={division}
                        level={1}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                      />
                    )
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Category Details</h2>
            {selectedCategory && (
              <CategoryDetails
                category={categories.find((c) => c.id === selectedCategory)!}
                categories={categories}
                categoryRoles={categoryRoles}
                setCategoryRoles={setCategoryRoles}
              />
            )}
          </div>
        </div>
      )}

      {viewMode === 'flat' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Categories</h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Path</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories
                  .sort((a, b) => {
                    const aLevel = a.parent_id ? 2 : 1 // Simplified level calculation
                    const bLevel = b.parent_id ? 2 : 1
                    if (aLevel !== bLevel) return aLevel - bLevel
                    return a.name.localeCompare(b.name)
                  })
                  .map((category) => {
                    const level = category.parent_id ? 2 : 1 // Simplified
                    const levelName =
                      CATEGORY_LEVELS[level as keyof typeof CATEGORY_LEVELS]

                    return (
                      <tr
                        key={category.id}
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <td className="px-4 py-3 font-medium">
                          {category.name}
                        </td>
                        <td className="px-4 py-3">{level}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getLevelColor(level)}`}
                          >
                            {levelName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getBreadcrumb(categories, category.id)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Categories:</span>
                <span className="font-medium">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Depth:</span>
                <span className="font-medium">{stats.maxDepth} levels</span>
              </div>
              <div className="flex justify-between">
                <span>Orphaned:</span>
                <span
                  className={`font-medium ${stats.orphanedCategories > 0 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {stats.orphanedCategories}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">By Level</h3>
            <div className="space-y-2">
              {Object.entries(stats.byLevel).map(([level, count]) => {
                const levelName =
                  CATEGORY_LEVELS[Number(level) as keyof typeof CATEGORY_LEVELS]
                return (
                  <div key={level} className="flex justify-between">
                    <span>
                      {levelName} (L{level}):
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Validation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-medium ${validation.isValid ? 'text-green-500' : 'text-red-500'}`}
                >
                  {validation.isValid ? 'Valid' : 'Issues Found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <span className="font-medium">{validation.errors.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryTreeNode({
  category,
  level,
  selectedCategory,
  onSelect,
}: {
  category: CategoryWithHierarchy
  level: number
  selectedCategory: string | null
  onSelect: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = category.children && category.children.length > 0

  return (
    <div className={`ml-${(level - 1) * 4}`}>
      <div
        className={`flex items-center py-2 px-3 rounded cursor-pointer hover:bg-gray-50 ${
          selectedCategory === category.id
            ? 'bg-blue-50 border-l-4 border-blue-500'
            : ''
        }`}
        onClick={() => onSelect(category.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <span
          className={`mr-2 px-2 py-1 rounded text-xs ${getLevelColor(level)}`}
        >
          L{level}
        </span>
        <span className="font-medium">{category.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoryDetailsProps {
  readonly category: Category
  readonly categories: Array<Category>
  readonly categoryRoles: Record<string, Array<string>>
  readonly setCategoryRoles: React.Dispatch<
    React.SetStateAction<Record<string, Array<string>>>
  >
}

function CategoryDetails({
  category,
  categories,
  categoryRoles,
  setCategoryRoles,
}: CategoryDetailsProps) {
  const children = categories.filter((c) => c.parent_id === category.id)
  const parent = category.parent_id
    ? categories.find((c) => c.id === category.parent_id)
    : null

  // --- Role restriction UI ---
  const roles = categoryRoles[category.id]
  const ALL_ROLES = ['admin', 'manager', 'user'] as const

  const handleRoleChange = (role: string) => {
    const newRoles = roles.includes(role)
      ? roles.filter((r) => r !== role)
      : [...roles, role]
    setCategoryRoles((prev) => ({ ...prev, [category.id]: newRoles }))
  }

  return (
    <div className="space-y-2">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">{category.name}</h3>

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">ID:</span>
            <span className="ml-2 font-mono">{category.id}</span>
          </div>

          {parent && (
            <div>
              <span className="text-gray-600">Parent:</span>
              <span className="ml-2">{parent.name}</span>
            </div>
          )}

          <div>
            <span className="text-gray-600">Children:</span>
            <span className="ml-2">{children.length}</span>
          </div>

          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2">
              {new Date(category.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {children.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Child Categories:</h4>
            <ul className="space-y-1">
              {children.map((child) => (
                <li key={child.id} className="text-sm text-gray-600">
                  • {child.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <div className="font-semibold text-sm mb-1">Allowed Roles</div>
        <div className="flex gap-3">
          {ALL_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => handleRoleChange(role)}
                className="accent-blue-500"
              />
              <span className="capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sortable wrapper for top-level categories
function SortableCategoryTreeNode(props: any) {
  const { id } = props
  const sortable = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.5 : 1,
    background: sortable.isDragging ? '#e0e7ff' : undefined,
  }
  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <CategoryTreeNode {...props} />
    </div>
  )
}

function getLevelColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-purple-100 text-purple-800'
    case 2:
      return 'bg-blue-100 text-blue-800'
    case 3:
      return 'bg-green-100 text-green-800'
    case 4:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getBreadcrumb(
  categories: Array<Category>,
  categoryId: string,
): string {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return ''

  if (!category.parent_id) return category.name

  const parentBreadcrumb = getBreadcrumb(categories, category.parent_id)
  return `${parentBreadcrumb} > ${category.name}`
}

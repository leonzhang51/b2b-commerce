import { createFileRoute } from '@tanstack/react-router'

import { CategoryManager } from '@/components/CategoryManager'

export const Route = createFileRoute('/categories')({
  component: CategoryManagerPage,
})

function CategoryManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryManager />
    </div>
  )
}

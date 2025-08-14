// Minimal stub for BulkOperations to fix build
import type { User } from '@/lib/supabase'

interface BulkOperationsProps {
  items: Array<User>
  selectedItems: Array<string>
  onSelectionChange: (selectedIds: Array<string>) => void
  entityType: 'user' | 'company' | 'product' | 'category'
}

export function BulkOperations({
  items,
  selectedItems,
  entityType,
}: BulkOperationsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">
        Bulk operations for {selectedItems.length} selected {entityType}(s) -
        functionality being restored...
      </p>
    </div>
  )
}

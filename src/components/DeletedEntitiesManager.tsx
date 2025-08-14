// Minimal stub for DeletedEntitiesManager to fix build
interface DeletedEntitiesManagerProps {
  entityType: 'user' | 'company' | 'product' | 'category'
  title?: string
}

export function DeletedEntitiesManager({
  entityType,
  title,
}: DeletedEntitiesManagerProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        {title || `Deleted ${entityType}s`}
      </h3>
      <p className="text-gray-600">
        Deleted entities management is being restored...
      </p>
    </div>
  )
}

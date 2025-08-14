import { useProductSearch } from '@/hooks/useProductSearch'

export function ProductFilterChips() {
  const { filters, setFilter } = useProductSearch()
  const active = Object.entries(filters).filter(([_, v]) => v && v !== '')

  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {active.map(([key, value]) => (
        <button
          key={key}
          className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs hover:bg-gray-200 border border-gray-200"
          onClick={() => setFilter(key, '')}
          aria-label={`Remove filter ${key}`}
        >
          <span className="mr-1 font-medium capitalize">{key}:</span>
          <span>{String(value)}</span>
          <span className="ml-2 text-gray-400 hover:text-red-500">&times;</span>
        </button>
      ))}
      <button
        className="ml-2 px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
        onClick={() => {
          active.forEach(([key]) => setFilter(key, ''))
        }}
      >
        Clear All
      </button>
    </div>
  )
}

import { useRef, useState } from 'react'
import { useProductSearch } from '@/hooks/useProductSearch'

export function ProductSearchBar() {
  const { query, setQuery, products, isLoading } = useProductSearch()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState<number>(-1)
  const listRef = useRef<HTMLUListElement>(null)
  // Build suggestions: name, SKU, tags
  type Suggestion = { type: 'name' | 'sku' | 'tag'; value: string }
  const lowerQuery = query.toLowerCase()
  const suggestions: Array<Suggestion> = (products ?? [])
    .flatMap((p) => [
      { type: 'name', value: String(p.name) } as const,
      ...(p.sku ? [{ type: 'sku', value: String(p.sku) } as const] : []),
      ...(Array.isArray(p.tags)
        ? (p.tags as Array<string>).map(
            (tag) => ({ type: 'tag', value: tag }) as const,
          )
        : []),
    ])
    .filter((s) => s.value.toLowerCase().includes(lowerQuery))
    .slice(0, 7)

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlighted(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          onKeyDown={(e) => {
            if (!showSuggestions || suggestions.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlighted((h) => (h + 1) % suggestions.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlighted(
                (h) => (h - 1 + suggestions.length) % suggestions.length,
              )
            } else if (e.key === 'Enter') {
              if (highlighted >= 0 && highlighted < suggestions.length) {
                setQuery(suggestions[highlighted].value)
                setShowSuggestions(false)
              }
            } else if (e.key === 'Escape') {
              setShowSuggestions(false)
            }
          }}
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring pr-10"
          aria-label="Search products"
          autoComplete="off"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-10"
          role="listbox"
        >
          {suggestions.map((s, i) => {
            const idx = s.value.toLowerCase().indexOf(lowerQuery)
            const isActive = i === highlighted
            return (
              <li
                key={s.type + '-' + s.value + '-' + i}
                className={
                  'px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 items-center' +
                  (isActive ? ' bg-blue-100' : '')
                }
                tabIndex={-1}
                role="option"
                aria-selected={isActive}
                onMouseDown={() => setQuery(s.value)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="text-xs text-gray-400 uppercase">
                  {s.type}
                </span>
                <span>
                  {idx >= 0 ? (
                    <>
                      {s.value.slice(0, idx)}
                      <mark className="bg-yellow-200 px-0.5 rounded">
                        {s.value.slice(idx, idx + query.length)}
                      </mark>
                      {s.value.slice(idx + query.length)}
                    </>
                  ) : (
                    s.value
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {isLoading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">
          Loading...
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { useProductSearch } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductImage } from '@/components/ProductImage'

interface ProductSearchProps {
  readonly onSearch: (query: string) => void
  readonly placeholder?: string
}

export function ProductSearch({
  onSearch,
  placeholder = 'Search products...',
}: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debounceQuery, setDebounceQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Search results for autocomplete
  const { data: searchResults, isLoading } = useProductSearch(debounceQuery)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    onSearch(searchQuery)
    setIsOpen(false)
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(value.length >= 2)
  }

  const clearSearch = () => {
    setQuery('')
    setDebounceQuery('')
    onSearch('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Products ({searchResults.length})
              </div>
              {searchResults.map((product) => (
                <SearchResultItem
                  key={product.id}
                  product={product}
                  onClick={() => handleSearch(product.name)}
                />
              ))}
              {debounceQuery && (
                <div className="border-t">
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onClick={() => handleSearch(debounceQuery)}
                  >
                    <div className="flex items-center">
                      <SearchIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        Search for <strong>"{debounceQuery}"</strong>
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : debounceQuery ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No products found</p>
              <button
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => handleSearch(debounceQuery)}
              >
                Search anyway
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

interface SearchResultItemProps {
  readonly product: any // We'll type this properly later
  readonly onClick: () => void
}

function SearchResultItem({ product, onClick }: SearchResultItemProps) {
  return (
    <button
      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
          <ProductImage
            src={product.image_url}
            alt={product.name || 'Product image'}
            className="w-full h-full object-cover"
            loading="lazy"
            showLoader={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {product.name}
          </h4>
          <p className="text-xs text-gray-500">{product.category?.name}</p>
          {product.description && (
            <p className="text-xs text-gray-600 truncate mt-1">
              {product.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  )
}

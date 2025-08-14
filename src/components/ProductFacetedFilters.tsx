import { useMemo, useState } from 'react'
import { useProductSearch } from '@/hooks/useProductSearch'

export function ProductFacetedFilters() {
  const { filters, setFilter, products } = useProductSearch()
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Example: extract unique categories and brands from products
  const categories = useMemo(
    () => Array.from(new Set(products?.map((p) => p.category) ?? [])),
    [products],
  )
  const brands = useMemo(
    () => Array.from(new Set(products?.map((p) => p.brand) ?? [])),
    [products],
  )

  // Extract unique tags
  const tags = useMemo(() => {
    const allTags = (products ?? []).flatMap((p) => p.tags ?? [])
    return Array.from(new Set(allTags))
  }, [products])

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <label htmlFor="price-min" className="block text-sm font-medium">
          Min Price
        </label>
        <input
          id="price-min"
          type="number"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value)
            setFilter('minPrice', e.target.value)
          }}
          className="mt-1 block w-24 border rounded-md px-2 py-1"
          placeholder="0"
        />
      </div>
      <div>
        <label htmlFor="price-max" className="block text-sm font-medium">
          Max Price
        </label>
        <input
          id="price-max"
          type="number"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value)
            setFilter('maxPrice', e.target.value)
          }}
          className="mt-1 block w-24 border rounded-md px-2 py-1"
          placeholder="1000"
        />
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-medium">
          Stock
        </label>
        <select
          id="stock"
          value={
            typeof filters.stock === 'string' ||
            typeof filters.stock === 'number'
              ? filters.stock
              : ''
          }
          onChange={(e) => setFilter('stock', e.target.value)}
          className="mt-1 block w-28 border rounded-md px-2 py-1"
        >
          <option value="">All</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      <div>
        <label htmlFor="tag" className="block text-sm font-medium">
          Tag
        </label>
        <select
          id="tag"
          value={
            typeof filters.tag === 'string' || typeof filters.tag === 'number'
              ? filters.tag
              : ''
          }
          onChange={(e) => setFilter('tag', e.target.value)}
          className="mt-1 block w-40 border rounded-md px-2 py-1"
        >
          <option value="">All</option>
          {tags.map((tag) =>
            typeof tag === 'string' ? (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ) : null,
          )}
        </select>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={
            typeof filters.category === 'string' ||
            typeof filters.category === 'number'
              ? filters.category
              : ''
          }
          onChange={(e) => setFilter('category', e.target.value)}
          className="mt-1 block w-40 border rounded-md px-2 py-1"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="brand" className="block text-sm font-medium">
          Brand
        </label>
        <select
          id="brand"
          value={
            typeof filters.brand === 'string' ||
            typeof filters.brand === 'number'
              ? filters.brand
              : ''
          }
          onChange={(e) => setFilter('brand', e.target.value)}
          className="mt-1 block w-40 border rounded-md px-2 py-1"
        >
          <option value="">All</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      {/* Add more facets as needed */}
    </div>
  )
}

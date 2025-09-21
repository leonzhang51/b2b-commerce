import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ProductSearch } from '@/components/ProductSearch'
import { useCategories, useProducts } from '@/hooks/useSupabase'
import { ConnectionTest } from '@/components/ConnectionTest'
import { categoryAccent } from '@/config/categories'
import { categoryIcon } from '@/utils/categoryIcon'

export function HomePage() {
  const navigate = useNavigate()

  const handleSearch = (q: string) => {
    navigate({ to: '/search', search: { q } })
  }

  const handleCategorySelect = (categoryId: number | null) => {
    navigate({ to: '/search', search: { categoryId: categoryId ?? undefined } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Pro-grade supplies for builders, contractors, and facilities
              </h1>
              <p className="mt-4 text-lg text-blue-100">
                Shop bulk pricing on tools, materials, and MRO from one trusted
                B2B platform.
              </p>
              <div className="mt-6 max-w-xl">
                <ProductSearch
                  onSearch={handleSearch}
                  placeholder="Search tools, materials, equipment..."
                />
              </div>
              <div className="mt-4 text-sm text-blue-100">
                Popular: concrete mix, PEX pipe, safety gloves, LED fixtures
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/categories"
                  className="inline-block bg-white text-blue-700 font-semibold px-4 py-2 rounded-md hover:bg-blue-50"
                >
                  Browse Categories
                </Link>
                <Link
                  to="/cart"
                  className="inline-block bg-transparent border border-white/70 text-white px-4 py-2 rounded-md hover:bg-white/10"
                >
                  View Cart
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Quick Category Access
                </h3>
                <div className="bg-white rounded-md p-4">
                  <HeroCategories onSelect={handleCategorySelect} limit={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-5 border rounded-lg">
            <span className="text-blue-600 font-bold">Bulk</span>
            <div>
              <h3 className="font-semibold">Volume Discounts</h3>
              <p className="text-sm text-gray-600">
                Automatic tiered pricing for business accounts.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5 border rounded-lg">
            <span className="text-green-600 font-bold">Net</span>
            <div>
              <h3 className="font-semibold">Flexible Terms</h3>
              <p className="text-sm text-gray-600">
                Eligible customers can request net payment terms.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5 border rounded-lg">
            <span className="text-amber-600 font-bold">Fast</span>
            <div>
              <h3 className="font-semibold">Reliable Fulfillment</h3>
              <p className="text-sm text-gray-600">
                Tracked shipping and on-time delivery SLAs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <div className="text-sm text-blue-900">
              <ConnectionTest />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <ShopByCategory />

      {/* Suggested / Featured Products */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link to="/search" className="text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <FeaturedCarousel />
        </div>
      </section>
    </div>
  )
}

function HeroCategories({
  onSelect,
  limit,
}: {
  onSelect: (categoryId: number | null) => void
  limit?: number
}) {
  const { data: categories, isLoading } = useCategories()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  if (isLoading) {
    return (
      <div className="flex md:grid md:grid-cols-2 gap-2 overflow-x-auto md:overflow-visible pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 h-8 rounded-full bg-gray-100 animate-pulse w-28"
          />
        ))}
      </div>
    )
  }
  if (!categories || categories.length === 0) {
    return <div className="text-sm text-gray-500">No categories available</div>
  }

  const dedup = (arr: Array<any>) =>
    Array.from(new Map(arr.map((c) => [c.category_id, c])).values())

  // Prefer DB-driven featured_rank when available; otherwise fall back to alphabetical
  const ranked = (categories as Array<any>).filter(
    (c) => typeof c?.featured_rank === 'number',
  )
  const prioritized: Array<any> = ranked.length
    ? dedup([
        ...[...ranked].sort(
          (a, b) => (a.featured_rank as number) - (b.featured_rank as number),
        ),
        ...(categories as Array<any>),
      ])
    : [...categories].sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || '')),
      )

  const featured = prioritized.slice(0, limit ?? 12)

  return (
    <>
      <div
        ref={scrollRef}
        className="flex md:grid md:grid-cols-2 gap-2 overflow-x-auto md:overflow-visible snap-x"
      >
        {featured.map((c) => (
          <button
            key={c.category_id}
            onClick={() => onSelect(c.category_id)}
            className="shrink-0 snap-start inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${categoryAccent(String(c.name || ''), c.accent_color)}`}
            >
              {categoryIcon(String(c.name || ''), 'h-4 w-4')}
            </span>
            <span className="whitespace-nowrap">{c.name}</span>
          </button>
        ))}
        <button
          onClick={() => onSelect(null)}
          className="shrink-0 snap-start inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          aria-label="View all products"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M13 5l7 7-7 7"
              />
            </svg>
          </span>
          <span className="whitespace-nowrap">View all</span>
        </button>
      </div>
      <div className="mt-2 flex justify-end gap-4 md:hidden">
        <button
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
          }
          className="text-xs inline-flex items-center gap-1 text-blue-700 hover:underline"
        >
          <span>More</span>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button
          onClick={() =>
            scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
          }
          className="text-xs inline-flex items-center gap-1 text-blue-700 hover:underline"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Show less</span>
        </button>
      </div>
    </>
  )
}

function ShopByCategory() {
  const { data: categories, isLoading } = useCategories()
  const navigate = useNavigate()

  if (isLoading) return null
  if (!categories || categories.length === 0) return null

  // Prefer featured_rank if present
  const ranked = (categories as Array<any>).filter(
    (c) => typeof c?.featured_rank === 'number',
  )
  const featured = ranked.length
    ? [...ranked]
        .sort(
          (a, b) => (a.featured_rank as number) - (b.featured_rank as number),
        )
        .slice(0, 8)
    : categories.slice(0, 8)

  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <button
            className="text-blue-600 hover:text-blue-700"
            onClick={() => navigate({ to: '/search' })}
          >
            Browse all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((c) => (
            <button
              key={c.category_id}
              onClick={() =>
                navigate({
                  to: '/search',
                  search: { categoryId: c.category_id },
                })
              }
              className="group p-5 border rounded-lg bg-white hover:shadow-md transition-shadow text-left"
            >
              <div
                className={`h-12 w-12 flex items-center justify-center rounded mb-3 ${categoryAccent(String(c.name || ''), c.accent_color)}`}
              >
                {categoryIcon(String(c.name || ''))}
              </div>
              <div className="font-medium text-gray-900 group-hover:text-blue-700">
                {c.name}
              </div>
              <div className="text-sm text-gray-500">Explore products</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCarousel() {
  const {
    data: products = [],
    isLoading,
    error,
  } = useProducts({ pageSize: 16, includeCategory: true })
  const ref = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)

  const scroll = (dir: 'left' | 'right') => {
    const el = ref.current
    if (!el) return
    const amt = el.clientWidth * 0.9 * (dir === 'left' ? -1 : 1)
    el.scrollBy({ left: amt, behavior: 'smooth' })
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        Failed to load featured products
      </div>
    )
  }

  const items = products.slice(0, 16)

  useEffect(() => {
    if (paused || isLoading || items.length < 2) return
    const id = setInterval(() => scroll('right'), 5000)
    return () => clearInterval(id)
  }, [paused, isLoading, items.length])

  const Card = ({ p }: { p: any }) => {
    const id = p.id || p.asin
    const name = p.name || p.title || 'Unnamed Product'
    const image = p.image_url || p.imgUrl || '/placeholder-product.svg'
    const priceVal = typeof p.price === 'number' ? p.price : undefined
    const price = typeof priceVal === 'number' ? `$${priceVal.toFixed(2)}` : ''
    return (
      <Link
        to={`/product/${id}` as any}
        className="shrink-0 w-56 sm:w-60 md:w-64 lg:w-72 xl:w-80 snap-center"
      >
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square bg-gray-100">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.svg'
              }}
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900 line-clamp-2">{name}</h3>
            {p.category?.name && (
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${categoryAccent(String(p.category.name), p.category.accent_color)}`}
                >
                  {categoryIcon(String(p.category.name), 'h-3 w-3')}
                </span>
                <span className="truncate max-w-[10rem]">
                  {p.category.name}
                </span>
              </div>
            )}
            {price && (
              <div className="mt-2 text-sm font-semibold text-gray-900">
                {price}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div
      className="relative"
      role="region"
      aria-label="Featured products carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          scroll('left')
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          scroll('right')
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="sr-only" aria-live="polite">
        {paused ? 'Carousel paused' : 'Carousel playing'}
      </div>
      <div className="flex justify-end gap-2 mb-3">
        <button
          onClick={() => scroll('left')}
          className="inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white hover:bg-blue-50 hover:text-blue-700"
          aria-label="Previous"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className="inline-flex items-center justify-center h-8 w-8 rounded-full border bg-white hover:bg-blue-50 hover:text-blue-700"
          aria-label="Next"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-56 snap-start">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/5" />
                  </div>
                </div>
              </div>
            ))
          : items.map((p: any) => <Card key={p.id || p.asin} p={p} />)}
      </div>
    </div>
  )
}

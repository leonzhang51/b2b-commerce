/**
 * ProductSearchUseCase
 *
 * Handles business logic for product search, filtering, and suggestions.
 * This use case is framework-agnostic and can be tested independently.
 */

import type Product from '@/types/product'

export interface SearchFilters {
  readonly category?: string
  readonly brand?: string
  readonly minPrice?: number
  readonly maxPrice?: number
  readonly inStock?: boolean
  readonly [key: string]: string | number | boolean | undefined
}

export interface SearchOptions {
  readonly query?: string
  readonly filters?: SearchFilters
  readonly sortBy?: 'name' | 'price' | 'category' | 'relevance'
  readonly sortOrder?: 'asc' | 'desc'
  readonly limit?: number
  readonly offset?: number
}

export interface SearchResult {
  readonly products: Array<Product>
  readonly totalCount: number
  readonly hasMore: boolean
  readonly suggestions: Array<string>
}

export interface ProductRepository {
  searchProducts: (options: SearchOptions) => Promise<SearchResult>
  getProductSuggestions: (
    query: string,
    limit?: number,
  ) => Promise<Array<string>>
}

export class ProductSearchUseCase {
  constructor(private productRepository: ProductRepository) {}

  /**
   * Search for products with filters and sorting
   */
  async searchProducts(options: SearchOptions): Promise<SearchResult> {
    // Validate search options
    const validatedOptions = this.validateSearchOptions(options)

    // Delegate to repository
    const result = await this.productRepository.searchProducts(validatedOptions)

    // Apply business rules to results
    return this.processSearchResults(result, validatedOptions)
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit = 5): Promise<Array<string>> {
    if (!query || query.length < 2) {
      return []
    }

    const suggestions = await this.productRepository.getProductSuggestions(
      query.trim(),
      limit,
    )

    return this.processSuggestions(suggestions, query)
  }

  /**
   * Build search query parameters for API
   */
  buildSearchParams(options: SearchOptions): URLSearchParams {
    const params = new URLSearchParams()

    if (options.query) {
      params.append('q', options.query.trim())
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        // Only append defined, non-empty filter values. Cast to unknown to narrow reliably.
        const v = value as unknown
        if (v === undefined || v === null) return
        if (typeof v === 'string' && v.trim() === '') return
        params.append(key, String(v))
      })
    }

    if (options.sortBy) {
      params.append('sortBy', options.sortBy)
    }

    if (options.sortOrder) {
      params.append('sortOrder', options.sortOrder)
    }

    if (options.limit) {
      params.append('limit', String(options.limit))
    }

    if (options.offset) {
      params.append('offset', String(options.offset))
    }

    return params
  }

  /**
   * Filter products by availability and business rules
   */
  filterProductsByBusinessRules(products: Array<Product>): Array<Product> {
    return products.filter((product) => {
      // Hide products with invalid data
      const priceNum =
        typeof (product as any).price === 'number'
          ? (product as any).price
          : Number((product as any).price ?? 0)
      if (!product.name || priceNum < 0) {
        return false
      }

      // Hide discontinued products (if we have that field)
      if ('discontinued' in product && product.discontinued) {
        return false
      }

      // Add more business rules as needed
      return true
    })
  }

  /**
   * Sort products by specified criteria
   */
  sortProducts(
    products: Array<Product>,
    sortBy: SearchOptions['sortBy'] = 'relevance',
    sortOrder: SearchOptions['sortOrder'] = 'asc',
  ): Array<Product> {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison =
            Number((a as any).price ?? 0) - Number((b as any).price ?? 0)
          break
        case 'category':
          comparison = String(
            (a as any).category?.name ?? a.category ?? '',
          ).localeCompare(String((b as any).category?.name ?? b.category ?? ''))
          break
          break
        case 'relevance':
        default:
          // For relevance, we could implement a scoring algorithm
          // For now, just maintain original order
          comparison = 0
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return sorted
  }

  /**
   * Calculate search relevance score
   */
  calculateRelevanceScore(product: Product, query: string): number {
    if (!query) return 0

    const searchTerm = query.toLowerCase()
    let score = 0

    // Exact name match gets highest score
    if (product.name.toLowerCase() === searchTerm) {
      score += 100
    }

    // Name starts with query gets high score
    if (product.name.toLowerCase().startsWith(searchTerm)) {
      score += 50
    }

    // Name contains query gets medium score
    if (product.name.toLowerCase().includes(searchTerm)) {
      score += 25
    }

    // Description contains query gets low score
    if (product.description?.toLowerCase().includes(searchTerm)) {
      score += 10
    }

    // Category or brand match gets bonus
    const catName = (product as any).category
      ? ((product as any).category.name ?? String((product as any).category))
      : ''
    if (catName.toLowerCase().includes(searchTerm)) {
      score += 15
    }

    if (
      (product as any).brand &&
      String((product as any).brand)
        .toLowerCase()
        .includes(searchTerm)
    ) {
      score += 15
    }

    return score
  }

  /**
   * Validate and normalize search options
   */
  private validateSearchOptions(options: SearchOptions): SearchOptions {
    return {
      ...options,
      query: options.query?.trim(),
      limit: Math.min(options.limit || 20, 100), // Max 100 results
      offset: Math.max(options.offset || 0, 0), // No negative offset
      sortBy: options.sortBy || 'relevance',
      sortOrder: options.sortOrder || 'asc',
    }
  }

  /**
   * Process and enhance search results
   */
  private processSearchResults(
    result: SearchResult,
    options: SearchOptions,
  ): SearchResult {
    let products = result.products

    // Apply business rules
    products = this.filterProductsByBusinessRules(products)

    // Sort if needed (repository might not handle all sorting)
    if (options.sortBy && options.sortBy !== 'relevance') {
      products = this.sortProducts(products, options.sortBy, options.sortOrder)
    }

    return {
      ...result,
      products,
    }
  }

  /**
   * Process and clean suggestions
   */
  private processSuggestions(
    suggestions: Array<string>,
    query: string,
  ): Array<string> {
    const queryLower = query.toLowerCase()

    return suggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(queryLower))
      .slice(0, 5) // Limit to 5 suggestions
      .map((suggestion) => suggestion.trim())
      .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index) // Remove duplicates
  }
}

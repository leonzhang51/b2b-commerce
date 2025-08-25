import {
  AbstractSupabaseRepository,
  RepositoryErrorFactory,
} from './BaseRepository'
import type { BaseEntity } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ProductRepository,
  SearchOptions,
  SearchResult,
} from '@/usecases/ProductSearchUseCase'

export interface Product extends BaseEntity {
  readonly asin: string
  readonly title: string
  readonly description?: string
  readonly price: number
  readonly listPrice?: number
  readonly imgUrl?: string
  readonly productURL?: string
  readonly stars?: number
  readonly reviews?: number
  readonly category_id?: string
  readonly isBestSeller?: boolean
  readonly boughtInLastMonth?: number
  readonly stock?: number
  readonly sku?: string
  readonly brand?: string
  readonly weight?: string
  readonly dimensions?: string
  readonly material?: string
  readonly color?: string
  readonly manufacturer?: string
  readonly warranty?: string
  readonly tags?: Array<string>
  readonly category?: {
    readonly id: string
    readonly category_name: string
  }
}

export interface ProductFilters {
  readonly category_id?: string
  readonly brand?: string
  readonly minPrice?: number
  readonly maxPrice?: number
  readonly inStock?: boolean
  readonly isBestSeller?: boolean
}

/**
 * Enhanced ProductRepository implementing MVP pattern
 */
export class SupabaseProductRepository
  extends AbstractSupabaseRepository<Product>
  implements ProductRepository
{
  constructor(client: SupabaseClient) {
    super(client, 'products')
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select(
        `
        *,
        category:categories(id, category_name)
      `,
      )
      .eq('asin', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw RepositoryErrorFactory.databaseError(
        'Failed to find product',
        error,
      )
    }

    return this.mapProductRow(data)
  }

  async create(
    data: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Product> {
    const { data: result, error } = await this.client
      .from('products')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to create product',
        error,
      )
    }

    return this.mapProductRow(result)
  }

  async update(
    id: string,
    data: Partial<Omit<Product, 'id' | 'created_at'>>,
  ): Promise<Product> {
    const { data: result, error } = await this.client
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('asin', id)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to update product',
        error,
      )
    }

    if (!result) {
      throw RepositoryErrorFactory.notFound('Product', id)
    }

    return this.mapProductRow(result)
  }

  /**
   * Search products with filters and pagination
   */
  async searchProducts(options: SearchOptions): Promise<SearchResult> {
    let query = this.client
      .from('products')
      .select(
        `
        *,
        category:categories(id, category_name)
      `,
      )
      .is('deleted_at', null)

    // Apply search query
    if (options.query) {
      query = query.ilike('title', `%${options.query}%`)
    }

    // Apply filters
    if (options.filters) {
      if (options.filters.category) {
        query = query.eq('category_id', options.filters.category)
      }
      if (options.filters.brand) {
        query = query.ilike('brand', `%${options.filters.brand}%`)
      }
      if (options.filters.minPrice) {
        query = query.gte('price', options.filters.minPrice)
      }
      if (options.filters.maxPrice) {
        query = query.lte('price', options.filters.maxPrice)
      }
      if (options.filters.inStock) {
        query = query.gt('stock', 0)
      }
    }

    // Apply sorting
    if (options.sortBy) {
      const ascending = options.sortOrder !== 'desc'
      query = query.order(options.sortBy, { ascending })
    }

    // Apply pagination
    const limit = Math.min(options.limit || 20, 100)
    const offset = options.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to search products',
        error,
      )
    }

    const products = (data || []).map(this.mapProductRow)

    // Get total count for pagination
    const totalCount = await this.getSearchCount(options)

    return {
      products,
      totalCount,
      hasMore: offset + limit < totalCount,
      suggestions: [], // Will be populated by use case
    }
  }

  /**
   * Get product suggestions for search
   */
  async getProductSuggestions(
    query: string,
    limit = 5,
  ): Promise<Array<string>> {
    const { data, error } = await this.client
      .from('products')
      .select('title')
      .ilike('title', `%${query}%`)
      .is('deleted_at', null)
      .limit(limit)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get suggestions',
        error,
      )
    }

    return (data || []).map((item: any) => item.title).filter(Boolean)
  }

  /**
   * Get products by ASINs (legacy method for backward compatibility)
   */
  async getByAsins(asins: Array<string>): Promise<Array<Product>> {
    if (asins.length === 0) return []

    const { data, error } = await this.client
      .from('products')
      .select(
        `
        *,
        category:categories(id, category_name)
      `,
      )
      .in('asin', asins)
      .is('deleted_at', null)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get products by ASINs',
        error,
      )
    }

    return (data || []).map(this.mapProductRow)
  }

  /**
   * Get search count for pagination
   */
  private async getSearchCount(options: SearchOptions): Promise<number> {
    let query = this.client
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (options.query) {
      query = query.ilike('title', `%${options.query}%`)
    }

    if (options.filters) {
      if (options.filters.category) {
        query = query.eq('category_id', options.filters.category)
      }
      if (options.filters.brand) {
        query = query.ilike('brand', `%${options.filters.brand}%`)
      }
      if (options.filters.minPrice) {
        query = query.gte('price', options.filters.minPrice)
      }
      if (options.filters.maxPrice) {
        query = query.lte('price', options.filters.maxPrice)
      }
      if (options.filters.inStock) {
        query = query.gt('stock', 0)
      }
    }

    const { count, error } = await query

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to count search results',
        error,
      )
    }

    return count || 0
  }

  /**
   * Map database row to Product entity
   */
  private mapProductRow(row: any): Product {
    return {
      id: row.asin,
      asin: row.asin,
      title: row.title || '',
      description: row.description,
      price: row.price || 0,
      listPrice: row.listPrice,
      imgUrl: row.imgUrl,
      productURL: row.productURL,
      stars: row.stars,
      reviews: row.reviews,
      category_id: row.category_id,
      isBestSeller: row.isBestSeller,
      boughtInLastMonth: row.boughtInLastMonth,
      stock: row.stock,
      sku: row.sku,
      brand: row.brand,
      weight: row.weight,
      dimensions: row.dimensions,
      material: row.material,
      color: row.color,
      manufacturer: row.manufacturer,
      warranty: row.warranty,
      tags: row.tags,
      category: row.category,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }
  }

  /**
   * Apply custom search logic
   */
  protected applySearch(query: any, search: string): any {
    return query.ilike('title', `%${search}%`)
  }
}

/**
 * Factory function for backward compatibility
 */
export function makeProductsRepository(
  client: SupabaseClient,
): SupabaseProductRepository {
  return new SupabaseProductRepository(client)
}

// Legacy type alias for backward compatibility
export type ProductsRepository = SupabaseProductRepository

/**
 * Base Repository Interface
 *
 * Defines common patterns for all repositories in the MVP architecture.
 * All repositories should extend this interface for consistency.
 */

export interface BaseEntity {
  readonly id: string
  readonly created_at?: string
  readonly updated_at?: string
  readonly deleted_at?: string | null
}

export interface PaginationOptions {
  readonly page?: number
  readonly pageSize?: number
  readonly offset?: number
  readonly limit?: number
}

export interface SortOptions {
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
}

export interface FilterOptions {
  readonly [key: string]: string | number | boolean | null | undefined
}

export interface QueryOptions extends PaginationOptions, SortOptions {
  readonly filters?: FilterOptions
  readonly search?: string
}

export interface PaginatedResult<T> {
  readonly data: Array<T>
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly hasMore: boolean
}

export interface RepositoryError extends Error {
  code: string
  details?: unknown
}

/**
 * Base Repository Interface
 *
 * All repositories should implement this interface for CRUD operations
 */
export interface BaseRepository<T extends BaseEntity> {
  /**
   * Find entity by ID
   */
  findById: (id: string) => Promise<T | null>

  /**
   * Find multiple entities by IDs
   */
  findByIds: (ids: Array<string>) => Promise<Array<T>>

  /**
   * Find entities with query options
   */
  find: (options?: QueryOptions) => Promise<PaginatedResult<T>>

  /**
   * Find all entities (use with caution)
   */
  findAll: () => Promise<Array<T>>

  /**
   * Create a new entity
   */
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>

  /**
   * Update an existing entity
   */
  update: (
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at'>>,
  ) => Promise<T>

  /**
   * Delete an entity (hard delete)
   */
  delete: (id: string) => Promise<void>

  /**
   * Soft delete an entity (set deleted_at)
   */
  softDelete: (id: string) => Promise<T>

  /**
   * Restore a soft-deleted entity
   */
  restore: (id: string) => Promise<T>

  /**
   * Count entities matching criteria
   */
  count: (
    options?: Omit<QueryOptions, 'page' | 'pageSize' | 'offset' | 'limit'>,
  ) => Promise<number>

  /**
   * Check if entity exists
   */
  exists: (id: string) => Promise<boolean>
}

/**
 * Repository Error Factory
 */
export class RepositoryErrorFactory {
  static notFound(entityType: string, id: string): RepositoryError {
    const error = new Error(
      `${entityType} with ID ${id} not found`,
    ) as RepositoryError
    error.code = 'NOT_FOUND'
    error.name = 'RepositoryError'
    return error
  }

  static validationError(message: string, details?: unknown): RepositoryError {
    const error = new Error(message) as RepositoryError
    error.code = 'VALIDATION_ERROR'
    error.name = 'RepositoryError'
    error.details = details
    return error
  }

  static databaseError(message: string, details?: unknown): RepositoryError {
    const error = new Error(message) as RepositoryError
    error.code = 'DATABASE_ERROR'
    error.name = 'RepositoryError'
    error.details = details
    return error
  }

  static unauthorized(
    message: string = 'Unauthorized access',
  ): RepositoryError {
    const error = new Error(message) as RepositoryError
    error.code = 'UNAUTHORIZED'
    error.name = 'RepositoryError'
    return error
  }

  static forbidden(message: string = 'Forbidden operation'): RepositoryError {
    const error = new Error(message) as RepositoryError
    error.code = 'FORBIDDEN'
    error.name = 'RepositoryError'
    return error
  }
}

/**
 * Abstract Base Repository Implementation
 *
 * Provides common functionality for Supabase-based repositories
 */
export abstract class AbstractSupabaseRepository<T extends BaseEntity>
  implements BaseRepository<T>
{
  constructor(
    protected client: any, // SupabaseClient type
    protected tableName: string,
  ) {}

  abstract findById(id: string): Promise<T | null>
  abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>
  abstract update(
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at'>>,
  ): Promise<T>

  async findByIds(ids: Array<string>): Promise<Array<T>> {
    if (ids.length === 0) return []

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .in('id', ids)
      .is('deleted_at', null)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to find ${this.tableName}`,
        error,
      )
    }

    return data || []
  }

  async findAll(): Promise<Array<T>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .is('deleted_at', null)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to find all ${this.tableName}`,
        error,
      )
    }

    return data || []
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to delete ${this.tableName}`,
        error,
      )
    }
  }

  async softDelete(id: string): Promise<T> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to soft delete ${this.tableName}`,
        error,
      )
    }

    if (!data) {
      throw RepositoryErrorFactory.notFound(this.tableName, id)
    }

    return data
  }

  async restore(id: string): Promise<T> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to restore ${this.tableName}`,
        error,
      )
    }

    if (!data) {
      throw RepositoryErrorFactory.notFound(this.tableName, id)
    }

    return data
  }

  async count(
    options?: Omit<QueryOptions, 'page' | 'pageSize' | 'offset' | 'limit'>,
  ): Promise<number> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (options?.filters) {
      query = this.applyFilters(query, options.filters)
    }

    if (options?.search) {
      query = this.applySearch(query, options.search)
    }

    const { count, error } = await query

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to count ${this.tableName}`,
        error,
      )
    }

    return count || 0
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      throw RepositoryErrorFactory.databaseError(
        `Failed to check existence in ${this.tableName}`,
        error,
      )
    }

    return !!data
  }

  async find(options?: QueryOptions): Promise<PaginatedResult<T>> {
    const page = options?.page || 1
    const pageSize = Math.min(options?.pageSize || 20, 100) // Max 100 items per page
    const offset = options?.offset || (page - 1) * pageSize

    let query = this.client
      .from(this.tableName)
      .select('*')
      .is('deleted_at', null)

    if (options?.filters) {
      query = this.applyFilters(query, options.filters)
    }

    if (options?.search) {
      query = this.applySearch(query, options.search)
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, {
        ascending: options.sortOrder !== 'desc',
      })
    }

    query = query.range(offset, offset + pageSize - 1)

    const { data, error } = await query

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        `Failed to find ${this.tableName}`,
        error,
      )
    }

    const totalCount = await this.count(options)

    return {
      data: data || [],
      totalCount,
      page,
      pageSize,
      hasMore: offset + pageSize < totalCount,
    }
  }

  /**
   * Apply filters to query (override in subclasses for custom filtering)
   */
  protected applyFilters(query: any, filters: FilterOptions): any {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    return query
  }

  /**
   * Apply search to query (override in subclasses for custom search)
   */
  protected applySearch(query: any, _search: string): any {
    // Default implementation - override in subclasses
    return query
  }
}

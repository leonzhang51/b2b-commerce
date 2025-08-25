/**
 * CategoryRepository
 *
 * Handles all database operations for product categories in the MVP architecture.
 */

import {
  AbstractSupabaseRepository,
  RepositoryErrorFactory,
} from './BaseRepository'
import type { BaseEntity } from './BaseRepository'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface Category extends BaseEntity {
  readonly category_name: string
  readonly parent_id?: string | null
  readonly description?: string
  readonly image_url?: string
  readonly is_active?: boolean
  readonly sort_order?: number
  readonly product_count?: number
  readonly children?: Array<Category>
  readonly parent?: Category
}

export interface CategoryTree extends Category {
  readonly children: Array<CategoryTree>
  readonly level: number
}

/**
 * Supabase implementation of CategoryRepository
 */
export class SupabaseCategoryRepository extends AbstractSupabaseRepository<Category> {
  constructor(client: SupabaseClient) {
    super(client, 'categories')
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select(
        `
        *,
        parent:categories!parent_id(id, category_name),
        children:categories!parent_id(id, category_name, is_active)
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw RepositoryErrorFactory.databaseError(
        'Failed to find category',
        error,
      )
    }

    return this.mapCategoryRow(data)
  }

  async create(
    data: Omit<Category, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Category> {
    const { data: result, error } = await this.client
      .from('categories')
      .insert({
        ...data,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to create category',
        error,
      )
    }

    return this.mapCategoryRow(result)
  }

  async update(
    id: string,
    data: Partial<Omit<Category, 'id' | 'created_at'>>,
  ): Promise<Category> {
    const { data: result, error } = await this.client
      .from('categories')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to update category',
        error,
      )
    }

    if (!result) {
      throw RepositoryErrorFactory.notFound('Category', id)
    }

    return this.mapCategoryRow(result)
  }

  /**
   * Get all categories as a flat list
   */
  async getAllCategories(): Promise<Array<Category>> {
    const { data, error } = await this.client
      .from('categories')
      .select(
        `
        *,
        parent:categories!parent_id(id, category_name)
      `,
      )
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('category_name', { ascending: true })

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get categories',
        error,
      )
    }

    return (data || []).map(this.mapCategoryRow)
  }

  /**
   * Get categories organized as a tree structure
   */
  async getCategoryTree(): Promise<Array<CategoryTree>> {
    const categories = await this.getAllCategories()
    return this.buildCategoryTree(categories)
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories(): Promise<Array<Category>> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('category_name', { ascending: true })

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get root categories',
        error,
      )
    }

    return (data || []).map(this.mapCategoryRow)
  }

  /**
   * Get child categories of a parent
   */
  async getChildCategories(parentId: string): Promise<Array<Category>> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('category_name', { ascending: true })

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get child categories',
        error,
      )
    }

    return (data || []).map(this.mapCategoryRow)
  }

  /**
   * Get category path (breadcrumb) from root to category
   */
  async getCategoryPath(categoryId: string): Promise<Array<Category>> {
    const path: Array<Category> = []
    let currentId: string | null = categoryId

    while (currentId) {
      const category = await this.findById(currentId)
      if (!category) break

      path.unshift(category)
      currentId = category.parent_id || null
    }

    return path
  }

  /**
   * Update category sort order
   */
  async updateSortOrder(
    categoryId: string,
    sortOrder: number,
  ): Promise<Category> {
    return this.update(categoryId, { sort_order: sortOrder })
  }

  /**
   * Move category to different parent
   */
  async moveCategory(
    categoryId: string,
    newParentId: string | null,
  ): Promise<Category> {
    // Validate that we're not creating a circular reference
    if (newParentId) {
      const isCircular = await this.wouldCreateCircularReference(
        categoryId,
        newParentId,
      )
      if (isCircular) {
        throw RepositoryErrorFactory.validationError(
          'Cannot move category: would create circular reference',
        )
      }
    }

    return this.update(categoryId, { parent_id: newParentId })
  }

  /**
   * Get categories with product counts
   */
  async getCategoriesWithProductCounts(): Promise<Array<Category>> {
    const { data, error } = await this.client
      .from('categories')
      .select(
        `
        *,
        product_count:products(count)
      `,
      )
      .is('deleted_at', null)
      .order('category_name', { ascending: true })

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to get categories with counts',
        error,
      )
    }

    return (data || []).map((row: any) => ({
      ...this.mapCategoryRow(row),
      product_count: row.product_count?.[0]?.count || 0,
    }))
  }

  /**
   * Search categories by name
   */
  async searchCategories(query: string): Promise<Array<Category>> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .ilike('category_name', `%${query}%`)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('category_name', { ascending: true })
      .limit(20)

    if (error) {
      throw RepositoryErrorFactory.databaseError(
        'Failed to search categories',
        error,
      )
    }

    return (data || []).map(this.mapCategoryRow)
  }

  /**
   * Build category tree from flat list
   */
  private buildCategoryTree(
    categories: Array<Category>,
    parentId: string | null = null,
    level = 0,
  ): Array<CategoryTree> {
    return categories
      .filter((cat) => cat.parent_id === parentId)
      .map((cat) => ({
        ...cat,
        level,
        children: this.buildCategoryTree(categories, cat.id, level + 1),
      }))
  }

  /**
   * Check if moving a category would create circular reference
   */
  private async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = newParentId

    while (currentId) {
      if (currentId === categoryId) {
        return true // Circular reference detected
      }

      const category = await this.findById(currentId)
      if (!category) break

      currentId = category.parent_id || null
    }

    return false
  }

  /**
   * Map database row to Category entity
   */
  private mapCategoryRow(row: any): Category {
    return {
      id: row.id,
      category_name: row.category_name,
      parent_id: row.parent_id,
      description: row.description,
      image_url: row.image_url,
      is_active: row.is_active,
      sort_order: row.sort_order,
      product_count: row.product_count,
      children: row.children,
      parent: row.parent,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }
  }

  /**
   * Apply custom search logic for categories
   */
  protected applySearch(query: any, search: string): any {
    return query.ilike('category_name', `%${search}%`)
  }
}

/**
 * Factory function for creating CategoryRepository
 */
export function makeCategoryRepository(
  client: SupabaseClient,
): SupabaseCategoryRepository {
  return new SupabaseCategoryRepository(client)
}

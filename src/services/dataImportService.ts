// Data Import Service for Home Depot Integration
import homeDepotAPI from '../services/homeDepotAPI'
import { supabase } from '@/lib/supabase'

interface ImportProgress {
  stage: string
  current: number
  total: number
  message: string
}

export class DataImportService {
  private progressCallback?: (progress: ImportProgress) => void

  constructor(progressCallback?: (progress: ImportProgress) => void) {
    this.progressCallback = progressCallback
  }

  private updateProgress(
    stage: string,
    current: number,
    total: number,
    message: string,
  ) {
    if (this.progressCallback) {
      this.progressCallback({ stage, current, total, message })
    }
    console.log(`[${stage}] ${current}/${total}: ${message}`)
  }

  // Clear existing data
  async clearExistingData() {
    this.updateProgress('cleanup', 0, 4, 'Clearing existing data...')

    // Clear in correct order due to foreign key constraints
    await supabase.from('product_attributes').delete().neq('attribute_id', 0)
    this.updateProgress('cleanup', 1, 4, 'Cleared product attributes')

    await supabase.from('product_images').delete().neq('image_id', 0)
    this.updateProgress('cleanup', 2, 4, 'Cleared product images')

    await supabase.from('products').delete().neq('product_id', 0)
    this.updateProgress('cleanup', 3, 4, 'Cleared products')

    await supabase.from('categories').delete().neq('category_id', 0)
    this.updateProgress('cleanup', 4, 4, 'Cleared categories')
  }

  // Import categories from Home Depot
  async importCategories() {
    this.updateProgress(
      'categories',
      0,
      1,
      'Fetching categories from Home Depot...',
    )

    const hdCategories = await homeDepotAPI.getCategories()
    if (!hdCategories.length) {
      throw new Error('No categories received from Home Depot API')
    }

    this.updateProgress(
      'categories',
      0,
      hdCategories.length,
      'Processing categories...',
    )

    // Build category hierarchy
    const categoryMap = new Map<string, any>()
    const rootCategories: Array<any> = []

    // First pass: create all categories
    hdCategories.forEach((hdCat: any, index: number) => {
      const category = homeDepotAPI.transformCategory(hdCat, 1) // We'll adjust levels later
      categoryMap.set(hdCat.categoryId, {
        ...category,
        hdCategory: hdCat,
        children: [],
      })

      if (!hdCat.parentCategoryId) {
        rootCategories.push(categoryMap.get(hdCat.categoryId))
      }

      this.updateProgress(
        'categories',
        index + 1,
        hdCategories.length,
        `Processed ${hdCat.categoryName}`,
      )
    })

    // Second pass: build hierarchy
    hdCategories.forEach((hdCat: any) => {
      if (hdCat.parentCategoryId) {
        const parent = categoryMap.get(hdCat.parentCategoryId)
        const child = categoryMap.get(hdCat.categoryId)
        if (parent && child) {
          parent.children.push(child)
        }
      }
    })

    // Third pass: assign levels and insert into database
    const insertCategories = async (
      categories: Array<any>,
      level: number,
      parentId?: number,
    ) => {
      for (const category of categories) {
        category.level = level
        category.parent_id = parentId

        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            level: category.level,
            slug: category.slug,
            description: category.description,
            parent_id: category.parent_id,
            is_active: category.is_active,
            sort_order: category.sort_order,
          })
          .select()
          .single()

        if (error) {
          console.error(`Error inserting category ${category.name}:`, error)
          continue
        }

        // Store the database ID for children
        category.category_id = data.category_id
        categoryMap.set(category.hdCategory.categoryId, category)

        // Recursively insert children
        if (category.children.length > 0) {
          await insertCategories(category.children, level + 1, data.category_id)
        }
      }
    }

    await insertCategories(rootCategories, 1)

    this.updateProgress(
      'categories',
      hdCategories.length,
      hdCategories.length,
      'Categories imported successfully',
    )
    return categoryMap
  }

  // Import products for a specific category
  async importProductsForCategory(
    _categoryId: number,
    hdCategoryId: string,
    limit: number = 50,
  ) {
    this.updateProgress(
      'products',
      0,
      limit,
      `Fetching products for category ${hdCategoryId}...`,
    )

    const hdProducts = await homeDepotAPI.getProductsByCategory(hdCategoryId, {
      limit,
    })

    if (!hdProducts.length) {
      this.updateProgress(
        'products',
        0,
        0,
        `No products found for category ${hdCategoryId}`,
      )
      return []
    }

    const importedProducts = []

    for (let i = 0; i < hdProducts.length; i++) {
      const hdProduct = hdProducts[i]

      try {
        const transformedData = homeDepotAPI.transformProduct(hdProduct)

        // Insert product
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert(transformedData.product)
          .select()
          .single()

        if (productError) {
          console.error(
            `Error inserting product ${hdProduct.productLabel}:`,
            productError,
          )
          continue
        }

        // Insert product images
        if (transformedData.images.length > 0) {
          const imagesWithProductId = transformedData.images.map(
            (img: any) => ({
              ...img,
              product_id: product.product_id,
            }),
          )

          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(imagesWithProductId)

          if (imagesError) {
            console.error(
              `Error inserting images for product ${hdProduct.productLabel}:`,
              imagesError,
            )
          }
        }

        // Insert product attributes
        if (transformedData.attributes.length > 0) {
          const attributesWithProductId = transformedData.attributes.map(
            (attr: any) => ({
              ...attr,
              product_id: product.product_id,
              attribute_name: attr.name,
              attribute_value: attr.value,
              attribute_type: attr.type,
              is_filterable: attr.is_filterable,
            }),
          )

          const { error: attributesError } = await supabase
            .from('product_attributes')
            .insert(attributesWithProductId)

          if (attributesError) {
            console.error(
              `Error inserting attributes for product ${hdProduct.productLabel}:`,
              attributesError,
            )
          }
        }

        importedProducts.push(product)
        this.updateProgress(
          'products',
          i + 1,
          hdProducts.length,
          `Imported ${hdProduct.productLabel}`,
        )
      } catch (error) {
        console.error(
          `Error processing product ${hdProduct.productLabel}:`,
          error,
        )
        continue
      }
    }

    return importedProducts
  }

  // Full import process
  async performFullImport(
    options: {
      clearExisting?: boolean
      maxProductsPerCategory?: number
      selectedCategories?: Array<string> // HD category IDs
    } = {},
  ) {
    const {
      clearExisting = true,
      maxProductsPerCategory = 25,
      selectedCategories,
    } = options

    try {
      // Step 1: Clear existing data
      if (clearExisting) {
        await this.clearExistingData()
      }

      // Step 2: Import categories
      const categoryMap = await this.importCategories()

      // Step 3: Import products for each category
      const categories = Array.from(categoryMap.values())
      const leafCategories = categories.filter(
        (cat) => cat.children.length === 0,
      )

      let totalProducts = 0

      for (let i = 0; i < leafCategories.length; i++) {
        const category = leafCategories[i]

        // Skip if we have selected categories and this isn't one of them
        if (
          selectedCategories &&
          !selectedCategories.includes(category.hdCategory.categoryId)
        ) {
          continue
        }

        this.updateProgress(
          'import',
          i + 1,
          leafCategories.length,
          `Importing products for ${category.name}...`,
        )

        const products = await this.importProductsForCategory(
          category.category_id,
          category.hdCategory.categoryId,
          maxProductsPerCategory,
        )

        totalProducts += products.length
      }

      // Step 4: Refresh materialized views
      this.updateProgress('finalize', 0, 1, 'Refreshing database views...')
      await supabase.rpc('refresh_category_counts')
      this.updateProgress('finalize', 1, 1, 'Import completed successfully!')

      return {
        success: true,
        categoriesImported: categories.length,
        productsImported: totalProducts,
      }
    } catch (error) {
      console.error('Import failed:', error)
      throw error
    }
  }
}

// DataImportService is already exported above as a class declaration

// CSV Import Service - Import products from CSV files
import { supabase } from '@/lib/supabase'
import { csvToProduct } from '@/lib/transformers/product'

interface CSVProduct {
  name: string
  description?: string
  price: number
  category: string
  brand?: string
  sku?: string
  image_url?: string
  stock_quantity?: number
}

export class CSVImportService {
  // Parse CSV content
  parseCSV(csvContent: string): Array<CSVProduct> {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const products: Array<CSVProduct> = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
      // use a mutable plain object for parsing CSV rows
      const product: Record<string, any> = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''

        switch (header) {
          case 'name':
          case 'title':
          case 'product_name':
            product.name = value
            break
          case 'description':
          case 'desc':
            product.description = value
            break
          case 'price':
          case 'cost':
          case 'amount':
            product.price = parseFloat(value) || 0
            break
          case 'category':
          case 'cat':
          case 'type':
            product.category = value
            break
          case 'brand':
          case 'manufacturer':
            product.brand = value
            break
          case 'sku':
          case 'id':
          case 'product_id':
            product.sku = value
            break
          case 'image':
          case 'image_url':
          case 'photo':
            product.image_url = value
            break
          case 'stock':
          case 'quantity':
          case 'inventory':
            product.stock_quantity = parseInt(value) || 0
            break
        }
      })

      if (product.name && product.price) {
        const csvRow: CSVProduct = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          brand: product.brand,
          sku: product.sku,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
        }
        products.push(csvRow)
      }
    }

    return products
  }

  // Preview parsed CSV rows as canonical Product shapes
  previewCSVProducts(csvContent: string) {
    const rows = this.parseCSV(csvContent)
    return rows.map((r) => csvToProduct(r))
  }

  // Import products from CSV
  async importFromCSV(csvContent: string, defaultCategoryId: number = 1) {
    const products = this.parseCSV(csvContent)
    const importedProducts = []

    for (const csvProduct of products) {
      try {
        // Find or create category
        let categoryId = defaultCategoryId
        if (csvProduct.category) {
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('category_id')
            .eq('name', csvProduct.category)
            .single()

          if (existingCategory) {
            categoryId = existingCategory.category_id
          } else {
            // Create new category
            const { data: newCategory } = await supabase
              .from('categories')
              .insert({
                name: csvProduct.category,
                level: 1,
                slug: csvProduct.category
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-'),
                is_active: true,
                sort_order: 0,
              })
              .select()
              .single()

            if (newCategory) {
              categoryId = newCategory.category_id
            }
          }
        }

        // Insert product
        const productData = {
          category_id: categoryId,
          sku:
            csvProduct.sku ||
            `CSV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: csvProduct.name,
          description: csvProduct.description || '',
          price: csvProduct.price,
          brand: csvProduct.brand || 'Generic',
          stock_quantity: csvProduct.stock_quantity || 10,
          is_active: true,
          is_featured: false,
          warranty_years: 1,
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (productError) {
          console.error(
            `Error inserting product ${csvProduct.name}:`,
            productError,
          )
          continue
        }

        // Add product image if provided
        if (csvProduct.image_url && product) {
          await supabase.from('product_images').insert({
            product_id: product.product_id,
            image_url: csvProduct.image_url,
            alt_text: csvProduct.name,
            is_primary: true,
            sort_order: 1,
          })
        }

        // Add basic attributes
        if (product) {
          const attributes = [
            {
              name: 'Brand',
              value: csvProduct.brand || 'Generic',
              type: 'text',
              is_filterable: true,
            },
            {
              name: 'Category',
              value: csvProduct.category || 'General',
              type: 'text',
              is_filterable: true,
            },
          ]

          for (const attr of attributes) {
            await supabase.from('product_attributes').insert({
              product_id: product.product_id,
              attribute_name: attr.name,
              attribute_value: attr.value,
              attribute_type: attr.type,
              is_filterable: attr.is_filterable,
              sort_order: 1,
            })
          }
        }

        importedProducts.push(product)
      } catch (error) {
        console.error(`Error processing product ${csvProduct.name}:`, error)
      }
    }

    return {
      success: true,
      imported: importedProducts.length,
      total: products.length,
    }
  }

  // Generate sample CSV template for home improvement
  generateSampleCSV(): string {
    const sampleData = [
      [
        'name',
        'description',
        'price',
        'category',
        'brand',
        'sku',
        'image_url',
        'stock_quantity',
      ],
      [
        '20V Cordless Drill Kit',
        'Professional cordless drill with 2 batteries and charger',
        '199.99',
        'Tools',
        'ProTech',
        'PT-CD-20V-001',
        'https://picsum.photos/400/400?random=1',
        '25',
      ],
      [
        'Pressure Treated 2x4x8',
        'Premium pressure-treated lumber for outdoor construction',
        '8.97',
        'Building Materials',
        'ForestPro',
        'FP-PT-2X4X8',
        'https://picsum.photos/400/400?random=2',
        '150',
      ],
      [
        'Kitchen Faucet Pull-Down',
        'Single handle kitchen faucet with pull-down sprayer',
        '189.99',
        'Plumbing',
        'AquaFlow',
        'AF-KF-PD-001',
        'https://picsum.photos/400/400?random=3',
        '12',
      ],
      [
        'GFCI Outlet 15-Amp',
        'Tamper-resistant GFCI outlet with LED indicator',
        '24.99',
        'Electrical',
        'SafeGuard Electric',
        'SGE-GFCI-15A',
        'https://picsum.photos/400/400?random=4',
        '75',
      ],
      [
        'Interior Paint Eggshell',
        'Premium acrylic latex paint with excellent coverage',
        '54.99',
        'Paint & Supplies',
        'ColorMaster',
        'CM-IP-EG-001',
        'https://picsum.photos/400/400?random=5',
        '40',
      ],
      [
        'Circular Saw 7-1/4"',
        'Heavy-duty circular saw with electric brake and LED guide',
        '149.99',
        'Tools',
        'BuildMaster',
        'BM-CS-714',
        'https://picsum.photos/400/400?random=6',
        '18',
      ],
      [
        'Architectural Shingles',
        'Premium shingles with 30-year warranty and wind resistance',
        '98.50',
        'Building Materials',
        'RoofGuard',
        'RG-AS-WW-001',
        'https://picsum.photos/400/400?random=7',
        '200',
      ],
      [
        'French Door Refrigerator',
        'Energy Star 25 cu ft refrigerator with ice maker',
        '1899.99',
        'Appliances',
        'CoolTech',
        'CT-FD-25-001',
        'https://picsum.photos/400/400?random=8',
        '5',
      ],
    ]

    return sampleData.map((row) => row.join(',')).join('\n')
  }
}

export const csvImportService = new CSVImportService()

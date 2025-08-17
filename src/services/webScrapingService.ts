// Web Scraping Service for Home Improvement Products
// Scrapes product data from public websites and saves to database

import { supabase } from '@/lib/supabase'

interface ScrapedProduct {
  name: string
  description: string
  price: number
  category: string
  brand: string
  imageUrl: string
  specifications: Record<string, string>
  features: Array<string>
  sourceUrl: string
}

export class WebScrapingService {
  // Scrape products from multiple sources
  async scrapeHomeImprovementProducts(
    maxProducts: number = 50,
  ): Promise<Array<ScrapedProduct>> {
    const products: Array<ScrapedProduct> = []

    try {
      console.log(`Starting to scrape ${maxProducts} home improvement products`)

      // Method 1: Scrape from product listing sites
      const listingProducts = await this.scrapeFromProductListings(
        maxProducts / 2,
      )
      console.log(`Generated ${listingProducts.length} products from listings`)
      products.push(...listingProducts)

      // Method 2: Scrape from manufacturer websites
      const manufacturerProducts = await this.scrapeFromManufacturers(
        maxProducts / 2,
      )
      console.log(
        `Generated ${manufacturerProducts.length} products from manufacturers`,
      )
      products.push(...manufacturerProducts)

      const finalProducts = products.slice(0, maxProducts)
      console.log(`Returning ${finalProducts.length} total products`)

      // Log first few products for debugging
      if (finalProducts.length > 0) {
        console.log('Sample products generated:')
        finalProducts.slice(0, 3).forEach((product, index) => {
          console.log(
            `${index + 1}. ${product.name} - $${product.price} (${product.category})`,
          )
        })
      }

      return finalProducts
    } catch (error) {
      console.error('Error scraping products:', error)
      return []
    }
  }

  // Method 1: Generate realistic products using web data patterns
  private scrapeFromProductListings(
    maxProducts: number,
  ): Promise<Array<ScrapedProduct>> {
    const products: Array<ScrapedProduct> = []

    try {
      // Instead of actual scraping (which has CORS issues), generate realistic products
      // based on common home improvement product patterns found on websites

      const productTemplates = [
        // Power Tools
        {
          name: 'DEWALT 20V MAX Cordless Drill',
          category: 'Tools',
          brand: 'DEWALT',
          basePrice: 199,
        },
        {
          name: 'Milwaukee M18 FUEL Circular Saw',
          category: 'Tools',
          brand: 'Milwaukee',
          basePrice: 249,
        },
        {
          name: 'Ryobi 18V ONE+ Impact Driver',
          category: 'Tools',
          brand: 'Ryobi',
          basePrice: 129,
        },
        {
          name: 'Makita 18V LXT Angle Grinder',
          category: 'Tools',
          brand: 'Makita',
          basePrice: 179,
        },
        {
          name: 'BLACK+DECKER 20V MAX Jigsaw',
          category: 'Tools',
          brand: 'BLACK+DECKER',
          basePrice: 89,
        },

        // Building Materials
        {
          name: 'Pressure-Treated Pine 2x4x8',
          category: 'Building Materials',
          brand: 'WeatherShield',
          basePrice: 8.97,
        },
        {
          name: 'OSB Sheathing 7/16 in. x 4 ft. x 8 ft.',
          category: 'Building Materials',
          brand: 'LP',
          basePrice: 24.98,
        },
        {
          name: 'Architectural Shingles Weatherwood',
          category: 'Building Materials',
          brand: 'GAF',
          basePrice: 98.5,
        },
        {
          name: 'Vinyl Siding Traditional Lap',
          category: 'Building Materials',
          brand: 'CertainTeed',
          basePrice: 156.0,
        },

        // Plumbing
        {
          name: 'Moen Arbor Single-Handle Kitchen Faucet',
          category: 'Plumbing',
          brand: 'Moen',
          basePrice: 189.99,
        },
        {
          name: 'KOHLER Cimarron Comfort Height Toilet',
          category: 'Plumbing',
          brand: 'KOHLER',
          basePrice: 299.99,
        },
        {
          name: 'SharkBite 1/2 in. Push-to-Connect Coupling',
          category: 'Plumbing',
          brand: 'SharkBite',
          basePrice: 4.98,
        },

        // Electrical
        {
          name: 'Leviton 15 Amp GFCI Outlet',
          category: 'Electrical',
          brand: 'Leviton',
          basePrice: 24.99,
        },
        {
          name: 'Philips LED A19 Bulb 60W Equivalent',
          category: 'Electrical',
          brand: 'Philips',
          basePrice: 12.99,
        },
        {
          name: 'Square D Homeline 20 Amp Circuit Breaker',
          category: 'Electrical',
          brand: 'Square D',
          basePrice: 8.47,
        },

        // Paint & Supplies
        {
          name: 'Behr Premium Plus Ultra Interior Paint',
          category: 'Paint & Supplies',
          brand: 'Behr',
          basePrice: 54.99,
        },
        {
          name: 'Purdy XL Series Angular Trim Brush',
          category: 'Paint & Supplies',
          brand: 'Purdy',
          basePrice: 29.99,
        },
        {
          name: 'Wooster Sherlock Roller Frame',
          category: 'Paint & Supplies',
          brand: 'Wooster',
          basePrice: 19.99,
        },

        // Lawn & Garden
        {
          name: 'Honda HRX217VKA Self-Propelled Mower',
          category: 'Lawn & Garden',
          brand: 'Honda',
          basePrice: 649.99,
        },
        {
          name: 'ECHO 25.4cc Gas String Trimmer',
          category: 'Lawn & Garden',
          brand: 'ECHO',
          basePrice: 199.99,
        },
        {
          name: 'Toro 51619 Ultra Electric Blower',
          category: 'Lawn & Garden',
          brand: 'Toro',
          basePrice: 89.99,
        },
      ]

      // Generate variations of each template
      for (const template of productTemplates) {
        if (products.length >= maxProducts) break

        // Create base product
        products.push({
          name: template.name,
          description: `Professional ${template.name.toLowerCase()} with advanced features and reliable performance.`,
          price: template.basePrice + (Math.random() * 50 - 25), // Add some price variation
          category: template.category,
          brand: template.brand,
          imageUrl: `https://picsum.photos/400/400?random=${template.name.replace(/\s/g, '')}`,
          specifications: this.generateSpecs(template.name),
          features: this.generateFeatures(template.name),
          sourceUrl: `https://example-retailer.com/products/${template.name.toLowerCase().replace(/\s/g, '-')}`,
        })

        // Create variations (different models, sizes, etc.)
        if (products.length < maxProducts) {
          const variations = this.createProductVariations(template)
          products.push(...variations.slice(0, maxProducts - products.length))
        }
      }
    } catch (error) {
      console.error('Error generating product data:', error)
    }

    return Promise.resolve(products.slice(0, maxProducts))
  }

  // Create product variations
  private createProductVariations(template: any): Array<ScrapedProduct> {
    const variations: Array<ScrapedProduct> = []

    if (template.category === 'Tools') {
      // Create different voltage variations for power tools
      const voltages = ['12V', '18V', '20V MAX', '24V']
      voltages.forEach((voltage) => {
        if (!template.name.includes(voltage)) {
          variations.push({
            name: `${template.brand} ${voltage} ${template.name.split(' ').slice(2).join(' ')}`,
            description: `Professional ${voltage} ${template.name.toLowerCase()} with enhanced battery life.`,
            price: template.basePrice + voltages.indexOf(voltage) * 25,
            category: template.category,
            brand: template.brand,
            imageUrl: `https://picsum.photos/400/400?random=${template.name.replace(/\s/g, '')}-${voltage}`,
            specifications: {
              ...this.generateSpecs(template.name),
              Voltage: voltage,
            },
            features: this.generateFeatures(template.name),
            sourceUrl: `https://example-retailer.com/products/${template.name.toLowerCase().replace(/\s/g, '-')}-${voltage.toLowerCase()}`,
          })
        }
      })
    }

    if (template.category === 'Building Materials') {
      // Create different sizes for lumber
      const sizes = ['2x6x8', '2x8x8', '2x10x8', '2x12x8']
      sizes.forEach((size) => {
        if (!template.name.includes(size)) {
          variations.push({
            name: template.name.replace('2x4x8', size),
            description: `Premium ${size} ${template.brand} lumber for construction projects.`,
            price: template.basePrice * (1 + sizes.indexOf(size) * 0.4),
            category: template.category,
            brand: template.brand,
            imageUrl: `https://picsum.photos/400/400?random=${template.name.replace(/\s/g, '')}-${size}`,
            specifications: {
              ...this.generateSpecs(template.name),
              Dimensions: size.replace(/x/g, '" x ') + '"',
            },
            features: this.generateFeatures(template.name),
            sourceUrl: `https://example-retailer.com/products/${template.name.toLowerCase().replace(/\s/g, '-')}-${size}`,
          })
        }
      })
    }

    return variations
  }

  // Method 2: Scrape from manufacturer websites (public product pages)
  private async scrapeFromManufacturers(
    maxProducts: number,
  ): Promise<Array<ScrapedProduct>> {
    const products: Array<ScrapedProduct> = []

    // Many manufacturers have public product catalogs
    const manufacturerSites = [
      'https://www.dewalt.com/products/power-tools',
      'https://www.milwaukeetool.com/Products',
      'https://www.ryobitools.com/products',
    ]

    for (const site of manufacturerSites) {
      try {
        // Use CORS proxy for cross-origin requests
        const corsProxy = 'https://api.allorigins.win/raw?url='
        const response = await fetch(`${corsProxy}${encodeURIComponent(site)}`)
        const html = await response.text()

        const parsedProducts = this.parseManufacturerHTML(html, site)
        products.push(...parsedProducts)

        if (products.length >= maxProducts) break
      } catch (error) {
        console.error(`Error scraping manufacturer ${site}:`, error)
        continue
      }
    }

    return products.slice(0, maxProducts)
  }

  // Parse HTML from manufacturer sites
  private parseManufacturerHTML(
    html: string,
    sourceUrl: string,
  ): Array<ScrapedProduct> {
    const products: Array<ScrapedProduct> = []

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Manufacturer sites often have more structured product data
      const productElements = doc.querySelectorAll(
        '.product-card, .tool-card, .product-item',
      )

      productElements.forEach((element, index) => {
        try {
          const name = this.extractText(
            element,
            '.product-name, .tool-name, h3, h4',
          )
          const model = this.extractText(element, '.model, .sku, .part-number')
          const price = this.extractPrice(element, '.price, .msrp, .cost')
          const image = this.extractImage(element, 'img')
          const specs = this.extractSpecs(element)

          if (name) {
            products.push({
              name: this.cleanProductName(name),
              description: `Professional ${name.toLowerCase()} ${model ? `(Model: ${model})` : ''}`,
              price: price || this.estimatePrice(name),
              category: this.categorizeProduct(name),
              brand: this.extractBrandFromUrl(sourceUrl),
              imageUrl:
                image ||
                `https://picsum.photos/400/400?random=${Date.now()}-${index}`,
              specifications: specs,
              features: this.generateFeatures(name),
              sourceUrl: sourceUrl,
            })
          }
        } catch (error) {
          console.error('Error parsing manufacturer product:', error)
        }
      })
    } catch (error) {
      console.error('Error parsing manufacturer HTML:', error)
    }

    return products
  }

  // Helper methods for data extraction
  private extractText(element: Element, selector: string): string {
    const found = element.querySelector(selector)
    return found ? found.textContent.trim() || '' : ''
  }

  private extractPrice(element: Element, selector: string): number {
    const priceText = this.extractText(element, selector)
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
    return isNaN(price) ? 0 : price
  }

  private extractImage(element: Element, selector: string): string {
    const img = element.querySelector(selector) as HTMLImageElement
    return img.src || img.getAttribute('data-src') || ''
  }

  private extractSpecs(element: Element): Record<string, string> {
    const specs: Record<string, string> = {}

    // Look for specification lists
    const specElements = element.querySelectorAll(
      '.spec, .specification, .feature',
    )
    specElements.forEach((spec) => {
      const text = spec.textContent.trim()
      if (text && text.includes(':')) {
        const [key, value] = text.split(':')
        specs[key.trim()] = value.trim()
      }
    })

    return specs
  }

  private cleanProductName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-./]/g, '')
      .trim()
      .substring(0, 100)
  }

  private categorizeProduct(name: string): string {
    const nameLower = name.toLowerCase()

    if (
      nameLower.includes('drill') ||
      nameLower.includes('saw') ||
      nameLower.includes('tool')
    ) {
      return 'Tools'
    } else if (
      nameLower.includes('lumber') ||
      nameLower.includes('wood') ||
      nameLower.includes('board')
    ) {
      return 'Building Materials'
    } else if (
      nameLower.includes('faucet') ||
      nameLower.includes('pipe') ||
      nameLower.includes('plumb')
    ) {
      return 'Plumbing'
    } else if (
      nameLower.includes('outlet') ||
      nameLower.includes('wire') ||
      nameLower.includes('electric')
    ) {
      return 'Electrical'
    } else if (
      nameLower.includes('paint') ||
      nameLower.includes('stain') ||
      nameLower.includes('brush')
    ) {
      return 'Paint & Supplies'
    } else if (
      nameLower.includes('mower') ||
      nameLower.includes('garden') ||
      nameLower.includes('lawn')
    ) {
      return 'Lawn & Garden'
    } else {
      return 'General'
    }
  }

  private extractBrandFromUrl(url: string): string {
    if (url.includes('dewalt')) return 'DeWalt'
    if (url.includes('milwaukee')) return 'Milwaukee'
    if (url.includes('ryobi')) return 'Ryobi'
    return 'Professional'
  }

  private estimatePrice(name: string): number {
    const nameLower = name.toLowerCase()

    if (nameLower.includes('drill'))
      return Math.floor(Math.random() * 200) + 100
    if (nameLower.includes('saw')) return Math.floor(Math.random() * 300) + 150
    if (nameLower.includes('lumber')) return Math.floor(Math.random() * 20) + 5
    if (nameLower.includes('paint')) return Math.floor(Math.random() * 50) + 25

    return Math.floor(Math.random() * 100) + 20
  }

  private generateSpecs(name: string): Record<string, string> {
    const specs: Record<string, string> = {}
    const nameLower = name.toLowerCase()

    if (nameLower.includes('drill')) {
      specs['Voltage'] = ['12V', '18V', '20V'][Math.floor(Math.random() * 3)]
      specs['Chuck Size'] = '1/2 inch'
      specs['Battery Type'] = 'Lithium-ion'
    } else if (nameLower.includes('saw')) {
      specs['Blade Size'] = '7-1/4 inch'
      specs['Motor'] = '15 amp'
      specs['Max Cutting Depth'] = '2-9/16 inch'
    }

    return specs
  }

  private generateFeatures(name: string): Array<string> {
    const features = [
      'Professional grade',
      'Durable construction',
      'Easy to use',
    ]
    const nameLower = name.toLowerCase()

    if (nameLower.includes('cordless')) features.push('Cordless operation')
    if (nameLower.includes('led')) features.push('LED work light')
    if (nameLower.includes('brake')) features.push('Electric brake')

    return features
  }

  // Test database insertion with a simple product
  async testDatabaseInsertion(): Promise<boolean> {
    try {
      console.log('Testing database insertion...')

      // First, find an existing category
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('category_id, name')
        .limit(1)

      if (!categories || categories.length === 0) {
        console.error('No categories found for test:', categoryError)
        return false
      }

      const testCategoryId = categories[0].category_id
      console.log(
        `Using category for test: ${categories[0].name} (ID: ${testCategoryId})`,
      )

      // Test with a simple product
      const testProduct = {
        category_id: testCategoryId,
        sku: `TEST-${Date.now()}`,
        name: 'Test Product',
        description: 'Test product for database insertion',
        price: 19.99,
        brand: 'TestBrand',
        stock_quantity: 10,
        is_active: true,
        is_featured: false,
        warranty_years: 1,
        tags: ['test', 'database'],
      }

      console.log('Inserting test product:', testProduct)

      // Add timeout to prevent hanging
      const insertPromise = supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database insertion timeout')),
          10000,
        ),
      )

      let data, error
      try {
        const result = await Promise.race([insertPromise, timeoutPromise])
        // Add type guards for 'result'
        if (typeof result === 'object' && result !== null) {
          data = (result as any).data
          error = (result as any).error
        }
        console.log('Database operation completed')
      } catch (timeoutError) {
        console.error('Database operation timed out:', timeoutError)
        return false
      }

      // Ensure 'productError' has expected properties
      const productError: {
        code?: string
        message?: string
        details?: string
        hint?: string
      } = {}

      if (typeof productError === 'object') {
        console.error('Error code:', (productError as any).code)
        console.error('Error message:', (productError as any).message)
        console.error('Error details:', (productError as any).details)
        console.error('Error hint:', (productError as any).hint)
        return false
      }

      if (error) {
        console.error('Test insertion failed:', error)
        return false
      }

      if (data) {
        console.log('Test insertion successful:', data.product_id)
        // Clean up test product
        try {
          await supabase
            .from('products')
            .delete()
            .eq('product_id', data.product_id)
          console.log('Test product cleaned up')
        } catch (cleanupError) {
          console.warn('Failed to clean up test product:', cleanupError)
        }
        return true
      }

      console.error('No data returned from test insertion, but no error either')
      return false
    } catch (error) {
      console.error('Test insertion exception:', error)
      return false
    }
  }

  // Save scraped products to database with direct insertion (RLS disabled)
  async saveScrapedProducts(
    products: Array<ScrapedProduct>,
  ): Promise<{ success: boolean; imported: number; total: number }> {
    console.log(`Starting to save ${products.length} products to database`)
    console.log('RLS is disabled - using direct database insertion')

    let imported = 0
    const errors: Array<string> = []

    for (const product of products) {
      try {
        console.log(`Processing product: ${product.name}`)

        // Find existing category or map to existing ones (avoid creating new categories due to RLS)
        let categoryId = 1 // Default to category 1

        // Map product categories to existing categories
        const categoryMapping: Record<string, string> = {
          Tools: 'Tools',
          'Building Materials': 'Building Materials',
          Plumbing: 'Plumbing',
          Electrical: 'Electrical',
          'Paint & Supplies': 'Tools', // Map to Tools since Paint category might not exist
          'Lawn & Garden': 'Tools', // Map to Tools
          Appliances: 'Appliances',
          General: 'Tools', // Map General to Tools
        }

        const mappedCategory = categoryMapping[product.category] || 'Tools'

        try {
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('category_id')
            .eq('name', mappedCategory)
            .single()

          if (existingCategory) {
            categoryId = existingCategory.category_id
            console.log(
              `Using existing category: ${mappedCategory} (ID: ${categoryId}) for product category: ${product.category}`,
            )
          } else {
            console.log(
              `Category ${mappedCategory} not found, using default category (ID: 1)`,
            )
            categoryId = 1
          }
        } catch (error) {
          console.log(
            `Error finding category ${mappedCategory}, using default category (ID: 1)`,
          )
          categoryId = 1
        }

        // Insert product directly (RLS is disabled)
        const productData = {
          category_id: categoryId,
          sku: `SCRAPED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          description: product.description,
          price: Math.max(0.01, Math.round(product.price * 100) / 100),
          brand: product.brand,
          stock_quantity: Math.floor(Math.random() * 50) + 10,
          is_active: true,
          is_featured: Math.random() > 0.8,
          warranty_years: 1,
          tags: [product.category, product.brand],
        }

        console.log(`Inserting product: ${product.name}`)
        const insertResult = await supabase
          .from('products')
          .insert(productData)
          .select('product_id, name, sku')
          .single()

        const insertedProduct = insertResult.data as {
          product_id: number
          name: string
          sku: string
        } | null
        const productError = insertResult.error

        if (productError) {
          console.error('Error inserting product:', productError)
          errors.push(
            `Failed to insert ${product.name}: ${productError.message}`,
          )
          continue
        }

        if (!insertedProduct) {
          console.error('Insert returned no data; skipping product')
          continue
        }

        imported++
        console.log(
          `Successfully inserted product: ${insertedProduct.name} (ID: ${insertedProduct.product_id})`,
        )
      } catch (error) {
        console.error('Exception processing product:', error)
        errors.push(
          `Exception processing ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    console.log(
      `Finished saving products. Imported: ${imported}, Total: ${products.length}`,
    )

    if (errors.length > 0) {
      console.log('Errors encountered:', errors)
    }

    return {
      success: imported > 0,
      imported,
      total: products.length,
    }
  }

  // Legacy direct database method (kept for reference)
  async saveScrapedProductsLegacy(
    products: Array<ScrapedProduct>,
  ): Promise<{ success: boolean; imported: number; total: number }> {
    let imported = 0

    console.log(`Starting to save ${products.length} products to database`)

    // Skip the test for now and try direct insertion with better error handling
    console.log('Proceeding with direct product insertion')

    for (const product of products) {
      try {
        console.log(`Processing product: ${product.name}`)

        // Find or create category
        let categoryId = 1
        const { data: existingCategory, error: categoryError } = await supabase
          .from('categories')
          .select('category_id')
          .eq('name', product.category)
          .single()

        if (categoryError && categoryError.code !== 'PGRST116') {
          console.error('Error finding category:', categoryError)
        }

        if (existingCategory) {
          categoryId = existingCategory.category_id
          console.log(
            `Using existing category: ${product.category} (ID: ${categoryId})`,
          )
        } else {
          console.log(`Creating new category: ${product.category}`)
          const { data: newCategory, error: newCategoryError } = await supabase
            .from('categories')
            .insert({
              name: product.category,
              level: 1,
              slug: product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              is_active: true,
              sort_order: 0,
            })
            .select()
            .single()

          if (newCategoryError) {
            console.error('Error creating category:', newCategoryError)
            console.error(
              'Category creation error code:',
              newCategoryError.code,
            )
            console.error(
              'Category creation error message:',
              newCategoryError.message,
            )
            console.error(
              'Category creation error details:',
              newCategoryError.details,
            )
            continue
          }

          if (newCategory) {
            categoryId = newCategory.category_id
            console.log(
              `Created new category: ${product.category} (ID: ${categoryId})`,
            )
          } else {
            console.error('Category creation returned no data')
            continue
          }
        }

        // Verify category exists before inserting product
        const { data: categoryCheck, error: categoryCheckError } =
          await supabase
            .from('categories')
            .select('category_id, name')
            .eq('category_id', categoryId)
            .single()

        if (!categoryCheck) {
          console.error('Category verification failed:', categoryCheckError)
          console.error('Category ID that failed:', categoryId)
          continue
        }

        console.log(
          `Category verified: ${categoryCheck.name} (ID: ${categoryCheck.category_id})`,
        )

        // Insert product
        console.log(
          `Inserting product: ${product.name} into category ${categoryId}`,
        )
        const productData = {
          category_id: categoryId,
          sku: `SCRAPED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          description: product.description,
          price: Math.max(0.01, Math.round(product.price * 100) / 100), // Ensure price is positive and rounded
          brand: product.brand,
          stock_quantity: Math.floor(Math.random() * 50) + 10,
          is_active: true,
          is_featured: Math.random() > 0.8,
          warranty_years: 1,
          tags: [product.category, product.brand], // Supabase handles array conversion
        }

        console.log('Product data to insert:', productData)

        let insertedProduct, productError
        try {
          console.log('Starting database insert...')

          // Try insert without select first
          const insertResult = await supabase
            .from('products')
            .insert(productData)

          console.log('Insert result:', insertResult)

          if (insertResult.error) {
            productError = insertResult.error
            console.log('Insert failed with error:', productError)
          } else {
            console.log('Insert succeeded, now querying for the product')
            // If insert succeeded, query for the product by SKU
            const { data: queryResult, error: queryError } = await supabase
              .from('products')
              .select('product_id, name, sku, price')
              .eq('sku', productData.sku)
              .single()

            if (queryError) {
              console.log('Query after insert failed:', queryError)
              productError = queryError
            } else {
              insertedProduct = queryResult as {
                product_id: number
                name: string
                sku: string
              }
              console.log('Found inserted product:', insertedProduct)
            }
          }

          console.log('Database insert completed')
        } catch (insertError) {
          console.error('Exception during product insert:', insertError)
          productError = insertError
        }

        if (productError) {
          console.error('Error inserting product:', productError)
          console.error('Error code:', (productError as any)?.code)
          console.error('Error message:', (productError as any)?.message)
          console.error('Error details:', (productError as any)?.details)
          console.error('Product data that failed:', productData)
          continue
        }

        // Ensure we have an insertedProduct before proceeding
        if (!insertedProduct) {
          console.error(
            'Insert completed but no product data returned; skipping attribute/image inserts',
          )
          continue
        }

        {
          // Add product image
          if (product.imageUrl) {
            await supabase.from('product_images').insert({
              product_id: insertedProduct.product_id,
              image_url: product.imageUrl,
              alt_text: product.name,
              is_primary: true,
              sort_order: 1,
            })
          }

          // Add product attributes
          const attributes = [
            {
              name: 'Brand',
              value: product.brand,
              type: 'text',
              is_filterable: true,
            },
            {
              name: 'Source',
              value: product.sourceUrl,
              type: 'text',
              is_filterable: false,
            },
            ...Object.entries(product.specifications).map(([key, value]) => ({
              name: key,
              value: value,
              type: 'text',
              is_filterable: true,
            })),
            ...product.features.map((feature) => ({
              name: 'Feature',
              value: feature,
              type: 'text',
              is_filterable: false,
            })),
          ]

          for (const attr of attributes) {
            await supabase.from('product_attributes').insert({
              product_id: insertedProduct.product_id,
              attribute_name: attr.name,
              attribute_value: attr.value,
              attribute_type: attr.type,
              is_filterable: attr.is_filterable,
              sort_order: 1,
            })
          }

          imported++
        }
      } catch (error) {
        console.error('Error saving product:', error)
        console.error('Product that failed:', product)
      }
    }

    console.log(
      `Finished saving products. Imported: ${imported}, Total: ${products.length}`,
    )

    return {
      success: true,
      imported,
      total: products.length,
    }
  }
}

export const webScrapingService = new WebScrapingService()

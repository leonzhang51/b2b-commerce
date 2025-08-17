// Free Product Data Sources - No API Keys Required!

interface FreeProduct {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  brand?: string
  rating?: number
}

export class FreeDataSourceService {
  // Option 1: Fake Store API (Free, No API Key)
  async getFakeStoreProducts(): Promise<Array<FreeProduct>> {
    try {
      const response = await fetch('https://fakestoreapi.com/products')
      const products = await response.json()

      return products.map((product: any) => ({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating?.rate || 0,
      }))
    } catch (error) {
      console.error('Error fetching from Fake Store API:', error)
      return []
    }
  }

  // Option 2: DummyJSON API (Free, No API Key)
  async getDummyJSONProducts(): Promise<Array<FreeProduct>> {
    try {
      const response = await fetch('https://dummyjson.com/products?limit=100')
      const data = await response.json()

      return data.products.map((product: any) => ({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.thumbnail,
        brand: product.brand,
        rating: product.rating || 0,
      }))
    } catch (error) {
      console.error('Error fetching from DummyJSON:', error)
      return []
    }
  }

  // Option 3: JSONPlaceholder + Picsum (Free, No API Key)
  async getPlaceholderProducts(): Promise<Array<FreeProduct>> {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts?_limit=50',
      )
      const posts = await response.json()

      const categories = [
        'Electronics',
        'Clothing',
        'Home & Garden',
        'Sports',
        'Books',
      ]
      const brands = [
        'Samsung',
        'Apple',
        'Nike',
        'Adidas',
        'Sony',
        'LG',
        'Canon',
      ]

      return posts.map((post: any, index: number) => ({
        id: post.id.toString(),
        title: this.generateProductTitle(post.title),
        description: post.body,
        price: Math.floor(Math.random() * 500) + 10,
        category: categories[index % categories.length],
        image: `https://picsum.photos/400/400?random=${post.id}`,
        brand: brands[index % brands.length],
        rating: Math.floor(Math.random() * 5) + 1,
      }))
    } catch (error) {
      console.error('Error creating placeholder products:', error)
      return []
    }
  }

  // Option 4: Product Hunt API (Free tier available)
  async getProductHuntProducts(): Promise<Array<FreeProduct>> {
    try {
      // This is a simplified version - you can expand it
      const sampleProducts = [
        {
          id: '1',
          title: 'Wireless Bluetooth Headphones',
          description:
            'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          category: 'Electronics',
          image: 'https://picsum.photos/400/400?random=1',
          brand: 'TechBrand',
          rating: 4.5,
        },
        {
          id: '2',
          title: 'Smart Home Security Camera',
          description:
            '1080p HD security camera with night vision and mobile app',
          price: 89.99,
          category: 'Home & Security',
          image: 'https://picsum.photos/400/400?random=2',
          brand: 'SecureTech',
          rating: 4.2,
        },
        // Add more sample products...
      ]

      return sampleProducts
    } catch (error) {
      console.error('Error fetching sample products:', error)
      return []
    }
  }

  // Transform free data to your database schema
  transformToYourSchema(freeProduct: FreeProduct, categoryId: number) {
    return {
      product: {
        category_id: categoryId,
        sku: `FREE-${freeProduct.id}`,
        name: freeProduct.title,
        description: freeProduct.description,
        price: freeProduct.price,
        brand: freeProduct.brand || 'Generic',
        stock_quantity: Math.floor(Math.random() * 100) + 10,
        is_active: true,
        is_featured: Math.random() > 0.8, // 20% chance of being featured
        warranty_years: 1,
        tags: [freeProduct.category],
      },
      images: [
        {
          image_url: freeProduct.image,
          alt_text: freeProduct.title,
          is_primary: true,
          sort_order: 1,
        },
      ],
      attributes: [
        {
          name: 'Brand',
          value: freeProduct.brand || 'Generic',
          type: 'text',
          is_filterable: true,
        },
        {
          name: 'Rating',
          value: freeProduct.rating?.toString() || '0',
          type: 'number',
          is_filterable: true,
        },
        {
          name: 'Category',
          value: freeProduct.category,
          type: 'text',
          is_filterable: true,
        },
      ].filter((attr) => attr.value && attr.value.trim() !== ''),
    }
  }

  // Helper function to generate realistic product titles
  private generateProductTitle(_title: string): string {
    const productPrefixes = [
      'Professional',
      'Premium',
      'Deluxe',
      'Ultra',
      'Smart',
      'Wireless',
      'Portable',
      'Heavy-Duty',
      'Eco-Friendly',
      'Advanced',
    ]

    const productTypes = [
      'Tool Set',
      'Power Drill',
      'Garden Hose',
      'LED Light',
      'Storage Box',
      'Kitchen Appliance',
      'Outdoor Furniture',
      'Safety Equipment',
      'Paint Brush',
    ]

    const prefix =
      productPrefixes[Math.floor(Math.random() * productPrefixes.length)]
    const type = productTypes[Math.floor(Math.random() * productTypes.length)]

    return `${prefix} ${type}`
  }

  // Combine all free sources
  async getAllFreeProducts(): Promise<Array<FreeProduct>> {
    const [fakeStore, dummyJSON, placeholder] = await Promise.all([
      this.getFakeStoreProducts(),
      this.getDummyJSONProducts(),
      this.getPlaceholderProducts(),
    ])

    return [...fakeStore, ...dummyJSON, ...placeholder]
  }
}

// Export singleton
export const freeDataService = new FreeDataSourceService()

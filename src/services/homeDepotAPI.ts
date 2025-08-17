// Placeholder for Home Depot API integration
export const homeDepotAPI = {
  // Placeholder methods for API integration
  fetchCategories: () => Promise.resolve([]),
  fetchProducts: () => Promise.resolve([]),
  getCategories: () => Promise.resolve([]),
  getProductsByCategory: (_categoryId: any, _options: any) =>
    Promise.resolve([
      {
        productLabel: 'placeholder product',
      },
    ]),
  transformCategory: (_hdCat: any, _level: number) => ({
    categoryId: 0,
    categoryName: 'placeholder',
    parentCategoryId: null,
  }),
  transformProduct: (_product: any) => ({
    product: {
      name: 'placeholder',
      description: 'placeholder',
      price: 0,
      category_id: 0,
    },
    images: [],
    attributes: [],
  }),
  // Add other necessary methods as needed
}

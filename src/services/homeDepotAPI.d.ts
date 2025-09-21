declare const homeDepotAPI: {
  getCategories: () => Promise<Array<any>>
  transformCategory: (hdCategory: any, level?: number) => any
  getProductsByCategory: (
    hdCategoryId: string,
    options?: { limit?: number },
  ) => Promise<Array<any>>
  transformProduct: (hdProduct: any) => {
    product: any
    images: Array<any>
    attributes: Array<any>
  }
}
export default homeDepotAPI

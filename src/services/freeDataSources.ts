const freeDataSources = {
  async fetchDataSource() {
    await Promise.resolve() // Ensure async signature is valid
    return [] as Array<any>
  },
  transformDataSource(data: any) {
    return {
      id: data.id || 'unknown',
      name: data.name || 'Unnamed Source',
      description: data.description || null,
      isActive: data.isActive ?? true,
    }
  },
  async getFakeStoreProducts() {
    await Promise.resolve()
    return [] as Array<any>
  },
  async getDummyJSONProducts() {
    await Promise.resolve()
    return [] as Array<any>
  },
  async getAllFreeProducts() {
    await Promise.resolve()
    return [] as Array<any>
  },
}

export default freeDataSources

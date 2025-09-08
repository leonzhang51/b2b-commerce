import { useRef, useState } from 'react'
import type Product from '@/types/product'
import { Button } from '@/components/ui/button'
import {
  parseProductsCSVAsync,
  parseProductsJSONAsync,
  productsToCSV,
  productsToJSON,
} from '@/lib/utils'
import { compressImageFileAsync } from '@/utils/imageUtils'
import { useBulkImportProducts } from '@/hooks/useBulkImportProducts'
import { useProducts } from '@/hooks/useSupabase'
import { supabase } from '@/lib/supabase'

export function ProductManager() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importedProducts, setImportedProducts] = useState<Array<Product>>([])
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(
    null,
  )
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  const bulkImport = useBulkImportProducts()
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  // Fetch all products (no pagination for export)
  const { data: products = [], isLoading } = useProducts({
    page: 1,
    pageSize: 1000,
  })

  // Handler for image upload with compression and Supabase Storage
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedProductId) {
      setImageUploadStatus('Please select a product first')
      return
    }

    setImageUploadStatus('Compressing image...')
    try {
      // Compress the image
      const compressedFile = await compressImageFileAsync(file, 800, 800, 0.8)

      setImageUploadStatus('Uploading to storage...')

      // Generate a unique filename
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `products/${selectedProductId}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      setImageUploadStatus('Updating product record...')

      // Update the product record with the new image URL
      const { error: updateError } = await supabase
        .from('products')
        .update({ imgUrl: publicUrl })
        .eq('asin', selectedProductId)

      if (updateError) {
        throw new Error(`Failed to update product: ${updateError.message}`)
      }

      setUploadedImageUrl(publicUrl)
      setImageUploadStatus('Image uploaded successfully!')

      // Clear the status after 3 seconds
      setTimeout(() => {
        setImageUploadStatus(null)
      }, 3000)
    } catch (err: any) {
      setImageUploadStatus(`Upload failed: ${err.message}`)
      setTimeout(() => {
        setImageUploadStatus(null)
      }, 5000)
    }
  }

  // Handler for import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportStatus('Importing...')
    try {
      let imported: Array<any> = []
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        imported = await parseProductsJSONAsync(file)
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        imported = await parseProductsCSVAsync(file)
      } else {
        setImportStatus('Unsupported file type')
        return
      }
      setImportedProducts(imported)
      setImportStatus(
        `Imported ${imported.length} products (preview only, not saved)`,
      )
    } catch (err: any) {
      setImportStatus('Import failed: ' + err.message)
    }
  }

  // Handler for saving imported products
  const handleSaveImported = async () => {
    if (!importedProducts.length) return
    setSaveStatus('Saving...')
    try {
      // bulkImport now accepts canonical Product shapes and will map to DB payload
      await bulkImport.mutateAsync(importedProducts)
      setSaveStatus(`Saved ${importedProducts.length} products to database`)
      setImportedProducts([])
    } catch (err: any) {
      setSaveStatus('Save failed: ' + err.message)
    }
  }

  // Handler for export
  const handleExport = (format: 'csv' | 'json') => {
    if (!products.length) {
      setExportStatus('No products to export')
      return
    }
    let dataStr = ''
    let mime = ''
    let ext = ''
    if (format === 'csv') {
      dataStr = productsToCSV(products)
      mime = 'text/csv'
      ext = 'csv'
    } else {
      dataStr = productsToJSON(products)
      mime = 'application/json'
      ext = 'json'
    }
    const blob = new Blob([dataStr], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-export.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setExportStatus(
      `Exported ${products.length} products as ${format.toUpperCase()}`,
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Catalog Management</h1>

      {/* Image Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Product Image Upload</h2>
        <div className="space-y-4">
          {/* Product Selection */}
          <div>
            <label
              htmlFor="product-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Product to Update
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a product...</option>
              {products.map((product: Product) => (
                <option
                  key={product.asin ?? product.id}
                  value={product.asin ?? product.id}
                >
                  {product.title ?? product.name} (ID:{' '}
                  {product.asin ?? product.id})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => imageInputRef.current?.click()}
              variant="outline"
              disabled={!selectedProductId || !!imageUploadStatus}
            >
              {imageUploadStatus ? 'Uploading...' : 'Choose Image File'}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Status and Preview */}
          {imageUploadStatus && (
            <div
              className={`p-3 rounded-md ${
                imageUploadStatus.includes('failed') ||
                imageUploadStatus.includes('error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : imageUploadStatus.includes('successfully')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {imageUploadStatus}
            </div>
          )}

          {uploadedImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Image Preview:
              </p>
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="w-32 h-32 object-cover rounded border shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bulk Operations Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bulk Operations</h2>
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Import Products
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            disabled={isLoading}
          >
            Export as CSV
          </Button>
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            disabled={isLoading}
          >
            Export as JSON
          </Button>
        </div>

        {/* Status Messages */}
        {importStatus && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            {importStatus}
          </div>
        )}
        {exportStatus && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
            {exportStatus}
          </div>
        )}
      </div>

      {/* Import Preview Section */}
      {importedProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Imported Products Preview
          </h2>
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <pre className="overflow-x-auto text-xs max-h-64 whitespace-pre-wrap">
              {JSON.stringify(importedProducts.slice(0, 5), null, 2)}
              {importedProducts.length > 5
                ? `\n...and ${importedProducts.length - 5} more`
                : ''}
            </pre>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSaveImported}
              disabled={bulkImport.status === 'pending'}
            >
              {bulkImport.status === 'pending'
                ? 'Saving...'
                : 'Save Imported Products'}
            </Button>
            {saveStatus && (
              <div className="text-sm text-blue-700">{saveStatus}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

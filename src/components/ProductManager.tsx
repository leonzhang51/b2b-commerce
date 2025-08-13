import { useRef, useState } from 'react'
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
// Image upload state
const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null)
const imageInputRef = useRef<HTMLInputElement>(null)
const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
// Handler for image upload with compression
const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
) => {
  const file = event.target.files?.[0]
  if (!file) return
  setImageUploadStatus('Compressing...')
  try {
    const compressedFile = await compressImageFileAsync(file, 800, 800, 0.8)
    setImageUploadStatus('Uploading...')
    // TODO: Integrate with real image upload logic (e.g., Supabase Storage, S3, etc.)
    // For demo, just create a local URL
    // --- TODO: Replace this block with actual upload and URL assignment ---
    const url = URL.createObjectURL(compressedFile)
    setUploadedImageUrl(url)
    setImageUploadStatus('Upload complete (demo only, not persisted)')
  } catch (err: any) {
    setImageUploadStatus('Image upload failed: ' + err.message)
  }
}

export function ProductManager() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importedProducts, setImportedProducts] = useState<Array<any>>([])
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const bulkImport = useBulkImportProducts()
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  // Fetch all products (no pagination for export)
  const { data: products = [], isLoading } = useProducts({
    limit: 1000,
    offset: 0,
  })

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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product Catalog Management</h1>
      <div className="flex gap-4 mb-6">
        {/* Image upload demo */}
        <Button
          onClick={() => imageInputRef.current?.click()}
          variant="outline"
        >
          Upload Product Image
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {imageUploadStatus && (
          <div className="mb-4 text-blue-700">{imageUploadStatus}</div>
        )}
        {uploadedImageUrl && (
          <div className="mb-4">
            <img
              src={uploadedImageUrl}
              alt="Uploaded preview"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
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
      {importStatus && <div className="mb-4 text-blue-700">{importStatus}</div>}
      {exportStatus && (
        <div className="mb-4 text-green-700">{exportStatus}</div>
      )}
      {importedProducts.length > 0 && (
        <div className="bg-gray-50 border rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Imported Products Preview</h2>
          <pre className="overflow-x-auto text-xs max-h-64">
            {JSON.stringify(importedProducts.slice(0, 5), null, 2)}
            {importedProducts.length > 5
              ? `\n...and ${importedProducts.length - 5} more`
              : ''}
          </pre>
          <Button
            onClick={handleSaveImported}
            className="mt-2"
            disabled={bulkImport.status === 'pending'}
          >
            {bulkImport.status === 'pending'
              ? 'Saving...'
              : 'Save Imported Products'}
          </Button>
          {saveStatus && <div className="mt-2 text-blue-700">{saveStatus}</div>}
        </div>
      )}
    </div>
  )
}

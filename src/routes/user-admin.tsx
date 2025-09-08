import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, User as UserIcon } from 'lucide-react'
import type { User } from '@/lib/supabase'
import type { HomeImprovementProduct } from '@/services/homeImprovementData'
import { RequireRole } from '@/components/RequireRole'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { EditUser } from '@/components/EditUser'
import { AuditLogViewer } from '@/components/AuditLogViewer'
import { ImpersonationControls } from '@/components/ImpersonationControls'
import { DeletedEntitiesManager } from '@/components/DeletedEntitiesManager'
import { AdminDashboard } from '@/components/AdminDashboard'
import { BulkOperations } from '@/components/BulkOperations'
import { SecurityDashboard } from '@/components/SecurityDashboard'
// import HomeDepotImport from '@/components/admin/HomeDepotImport'
import freeDataService from '@/services/freeDataSources'
import { csvImportService } from '@/services/csvImportService'
import { homeImprovementData } from '@/services/homeImprovementData'
import { webScrapingService } from '@/services/webScrapingService'
import { supabase } from '@/lib/supabase'
import { useCompaniesWithUsers, useCompanyUsers } from '@/hooks/useCompanyUsers'
import { useUpdateUser } from '@/hooks/useUpdateUser'
import { useSoftDelete } from '@/hooks/useSoftDelete'

export const Route = createFileRoute('/user-admin')({
  component: () => (
    <RequireRole allowedRoles={['admin']}>
      <UserAdminPage />
    </RequireRole>
  ),
})

function UserAdminPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Array<string>>([])
  const [importStatus, setImportStatus] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)

  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useCompaniesWithUsers()
  const {
    users,
    loading: usersLoading,
    error: usersError,
    updateUserInList,
    updateUserRole,
  } = useCompanyUsers(selectedCompany)
  const { updateUserRole: updateRole, loading: roleUpdating } = useUpdateUser()
  const softDeleteMutation = useSoftDelete()

  const loading = companiesLoading || usersLoading
  const error = companiesError || usersError

  // Import handler functions
  const handleWebScrapingImport = async (maxProducts: number) => {
    setImportStatus({
      success: false,
      message: 'Starting web scraping...',
      details: 'Extracting product data from web sources',
    })

    try {
      console.log('Starting web scraping import...')

      // First, test database connection
      const { data: testData, error: testError } = await supabase
        .from('categories')
        .select('category_id, name')
        .limit(1)

      if (testError) {
        console.error('Database connection test failed:', testError)
        setImportStatus({
          success: false,
          message: 'Database connection failed',
          details: testError.message,
        })
        return
      }

      console.log('Database connection test passed:', testData)

      // Scrape products from web sources
      const scrapedProducts =
        await webScrapingService.scrapeHomeImprovementProducts(maxProducts)
      console.log('Scraped products:', scrapedProducts.length)

      if (scrapedProducts.length === 0) {
        setImportStatus({
          success: false,
          message: 'No products found',
          details:
            'Web scraping did not return any products. Check console for details.',
        })
        return
      }

      setImportStatus({
        success: false,
        message: `Scraped ${scrapedProducts.length} products, saving to database...`,
        details: 'Processing and storing product data',
      })

      // Save scraped products to database
      console.log('Starting to save products to database...')
      const result =
        await webScrapingService.saveScrapedProducts(scrapedProducts)
      console.log('Save result:', result)

      setImportStatus({
        success: result.imported > 0,
        message:
          result.imported > 0
            ? `Successfully scraped and imported ${result.imported} products!`
            : `Scraping completed but no products were saved. Check console for details.`,
        details:
          result.imported > 0
            ? `Real brands: DEWALT, Milwaukee, Ryobi, Makita, Moen, KOHLER, Behr, Honda, and more`
            : `${result.total} products were processed but ${result.imported} were saved. Check console logs for errors.`,
      })
    } catch (error) {
      console.error('Web scraping error:', error)
      setImportStatus({
        success: false,
        message: 'Web scraping failed',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during scraping',
      })
    }
  }

  const handleHomeImprovementImport = async (
    category: 'all' | 'tools' | 'materials',
  ) => {
    setImportStatus({
      success: false,
      message: 'Importing home improvement products...',
      details: 'Generating realistic product data',
    })

    try {
      let products: Array<HomeImprovementProduct> = []

      if (category === 'all') {
        products = homeImprovementData.getAllProducts()
      } else if (category === 'tools') {
        products = homeImprovementData.getProductsByCategory('Tools')
      } else {
        products =
          homeImprovementData.getProductsByCategory('Building Materials')
      }

      // Import products to database
      let imported = 0
      for (const product of products) {
        try {
          // Find or create category
          let categoryId = 1 // Default category
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('category_id')
            .eq('name', product.category)
            .single()

          if (existingCategory) {
            categoryId = existingCategory.category_id
          } else {
            // Create new category
            const { data: newCategory } = await supabase
              .from('categories')
              .insert({
                name: product.category,
                level: 1,
                slug: product.category
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

          const transformed = homeImprovementData.transformToSchema(
            product,
            categoryId,
          )

          // Insert product
          const { data } = await supabase
            .from('products')
            .insert(transformed.product)
            .select()
            .single()

          if (!error && data) {
            imported++

            // Add image
            if (transformed.images.length > 0) {
              await supabase.from('product_images').insert({
                ...transformed.images[0],
                product_id: data.product_id,
              })
            }

            // Add attributes
            if (transformed.attributes.length > 0) {
              const attributesWithProductId = transformed.attributes.map(
                (attr) => ({
                  product_id: data.product_id,
                  attribute_name: attr.name,
                  attribute_value: attr.value,
                  attribute_type: attr.type,
                  is_filterable: attr.is_filterable,
                  sort_order: 1,
                }),
              )

              await supabase
                .from('product_attributes')
                .insert(attributesWithProductId)
            }
          }
        } catch (err) {
          console.error(err)
        }
      }

      setImportStatus({
        success: true,
        message: `Successfully imported ${imported} home improvement products!`,
        details: `Categories: ${category === 'all' ? 'Tools, Building Materials, Plumbing, Electrical, Paint, Appliances' : category}`,
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Home improvement import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleFreeAPIImport = async (
    source: 'fakestore' | 'dummyjson' | 'all',
  ) => {
    setImportStatus({
      success: false,
      message: 'Starting import...',
      details: 'Fetching data from free APIs',
    })

    try {
      let products = []

      if (source === 'fakestore') {
        products = await freeDataService.getFakeStoreProducts()
      } else if (source === 'dummyjson') {
        products = await freeDataService.getDummyJSONProducts()
      } else {
        products = await freeDataService.getAllFreeProducts()
      }

      setImportStatus({
        success: true,
        message: `Successfully fetched ${products.length} products!`,
        details: `Source: ${source.toUpperCase()} API - Ready to import to database`,
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus({
      success: false,
      message: 'Processing CSV file...',
      details: 'Reading and parsing data',
    })

    try {
      const csvContent = await file.text()
      const products = csvImportService.parseCSV(csvContent)

      setImportStatus({
        success: true,
        message: `Successfully parsed ${products.length} products from CSV!`,
        details: 'CSV parsing completed - Ready to import to database',
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'CSV parsing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = csvImportService.generateSampleCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-products.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSampleDataImport = async (count: number) => {
    setImportStatus({
      success: false,
      message: `Generating ${count} sample products...`,
      details: 'Creating realistic test data',
    })

    try {
      // Use the existing populate function
      const productsPerCategory = Math.ceil(count / 10)
      const { error } = await supabase.rpc('populate_all_products', {
        products_per_category: productsPerCategory,
      })

      if (error) throw error

      setImportStatus({
        success: true,
        message: `Successfully generated sample products!`,
        details: `Created ${productsPerCategory} products per category with realistic data`,
      })
    } catch (error) {
      setImportStatus({
        success: false,
        message: 'Sample data generation failed',
        details:
          error instanceof Error
            ? error.message
            : 'Make sure the populate_all_products function exists in your database',
      })
    }
  }

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    const success = await updateRole(userId, newRole)
    if (success) {
      updateUserRole(userId, newRole)
    } else {
      alert('Failed to update role')
    }
  }

  const handleSoftDelete = async (user: User) => {
    try {
      await softDeleteMutation.mutateAsync({
        entityType: 'user',
        entityId: user.id,
      })
      setConfirmDelete(null)
      // Refresh the user list
      // The user will be filtered out automatically since we query active users
    } catch (deleteError) {
      console.error('Failed to delete user:', deleteError)
      alert('Failed to delete user. Please try again.')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Show dashboard overview or specific section content */}
      {activeSection === 'overview' ? (
        <AdminDashboard
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      ) : (
        <div className="space-y-6">
          {/* Back to Dashboard */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSection === 'users' && 'User Management'}
              {activeSection === 'audit' && 'Audit Logs'}
              {activeSection === 'deleted' && 'Deleted Users'}
              {activeSection === 'import' && 'Data Import'}
              {activeSection === 'security' && 'Security Dashboard'}
            </h1>
          </div>
          {/* User Management Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Select Company</label>
                <select
                  className="w-full max-w-md border rounded px-2 py-1"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">-- Choose a company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Operations */}
              {selectedCompany && users.length > 0 && (
                <BulkOperations
                  items={users}
                  selectedItems={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  entityType="user"
                />
              )}
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {selectedCompany && users.length === 0 && !loading && (
                <div>No users found for this company.</div>
              )}
              {users.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length}
                            onChange={() => {
                              if (selectedUsers.length === users.length) {
                                setSelectedUsers([])
                              } else {
                                setSelectedUsers(users.map((u) => u.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Active
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className={`hover:bg-gray-50 ${selectedUsers.includes(u.id) ? 'bg-blue-50' : ''}`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, u.id])
                                } else {
                                  setSelectedUsers(
                                    selectedUsers.filter((id) => id !== u.id),
                                  )
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-900">
                            {u.full_name}
                          </td>
                          <td className="p-3 text-sm text-gray-900">
                            {u.email}
                          </td>
                          <td className="p-3">
                            <select
                              className="border rounded px-2 py-1 text-sm capitalize"
                              value={u.role}
                              disabled={roleUpdating}
                              onChange={async (e) => {
                                const newRole = e.target.value as User['role']
                                await handleRoleChange(u.id, newRole)
                              }}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="buyer">Buyer</option>
                              <option value="guest">Guest</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-gray-900">
                            {u.is_active ? 'Yes' : 'No'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                onClick={() => setEditUser(u)}
                              >
                                Edit
                              </button>
                              <ImpersonationControls user={u} />
                              <button
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                onClick={() => setConfirmDelete(u)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs Section */}
          {activeSection === 'audit' && (
            <div>
              <AuditLogViewer />
            </div>
          )}

          {/* Deleted Users Section */}
          {activeSection === 'deleted' && (
            <div>
              <DeletedEntitiesManager entityType="user" title="Deleted Users" />
            </div>
          )}

          {/* Data Import Section */}
          {activeSection === 'import' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Web Scraping - NEW FEATURED */}
                <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg relative">
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    NEW!
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-red-800">
                    🕷️ Web Scraping
                  </h3>
                  <p className="text-red-700 mb-4 text-sm">
                    Extract real product data from web sources with authentic
                    brands and specifications
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                      onClick={() => handleWebScrapingImport(50)}
                    >
                      Scrape 50 Products
                    </button>
                    <button
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                      onClick={() => handleWebScrapingImport(100)}
                    >
                      Scrape 100 Products
                    </button>
                  </div>
                </div>

                {/* Home Improvement Products - FEATURED */}
                <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                    RECOMMENDED
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-orange-800">
                    🏠 Home Improvement Products
                  </h3>
                  <p className="text-orange-700 mb-4 text-sm">
                    Realistic home improvement products: tools, building
                    materials, plumbing, electrical, paint, appliances
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm font-medium"
                      onClick={() => handleHomeImprovementImport('all')}
                    >
                      Import Home Improvement Catalog (100+ products)
                    </button>
                    <button
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
                      onClick={() => handleHomeImprovementImport('tools')}
                    >
                      Tools Only (25+ products)
                    </button>
                    <button
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
                      onClick={() => handleHomeImprovementImport('materials')}
                    >
                      Building Materials (20+ products)
                    </button>
                  </div>
                </div>

                {/* Free API Sources */}
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-green-800">
                    🆓 General Products
                  </h3>
                  <p className="text-green-700 mb-4 text-sm">
                    Mixed product categories from free APIs (electronics,
                    clothing, etc.)
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      onClick={() => handleFreeAPIImport('fakestore')}
                    >
                      Import from Fake Store API (20 products)
                    </button>
                    <button
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      onClick={() => handleFreeAPIImport('dummyjson')}
                    >
                      Import from DummyJSON (100 products)
                    </button>
                  </div>
                </div>

                {/* CSV Import */}
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-blue-800">
                    📄 CSV Import
                  </h3>
                  <p className="text-blue-700 mb-4 text-sm">
                    Upload your own product data from CSV files
                  </p>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="w-full text-sm"
                    />
                    <button
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      onClick={downloadSampleCSV}
                    >
                      Download Sample CSV Template
                    </button>
                  </div>
                </div>

                {/* Sample Data */}
                <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-purple-800">
                    🎯 Sample Data
                  </h3>
                  <p className="text-purple-700 mb-4 text-sm">
                    Generate realistic sample products for testing
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                      onClick={() => handleSampleDataImport(25)}
                    >
                      Generate 25 Sample Products
                    </button>
                    <button
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                      onClick={() => handleSampleDataImport(100)}
                    >
                      Generate 100 Sample Products
                    </button>
                  </div>
                </div>
              </div>

              {/* Import Status */}
              {importStatus && (
                <div
                  className={`p-4 rounded-lg ${importStatus.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}
                >
                  <p
                    className={
                      importStatus.success ? 'text-green-800' : 'text-red-800'
                    }
                  >
                    {importStatus.message}
                  </p>
                  {importStatus.details && (
                    <p className="text-sm mt-2 opacity-75">
                      {importStatus.details}
                    </p>
                  )}
                </div>
              )}

              {/* Home Depot Option (Disabled) */}
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
                <h3 className="text-lg font-semibold mb-2 text-gray-600">
                  🏠 Home Depot API (Premium)
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Requires API key registration - use free options above instead
                </p>
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed text-sm"
                  disabled
                >
                  Requires API Key
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div>
              <SecurityDashboard />
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!editUser}
        onOpenChange={(open) => setEditUser(open ? editUser : null)}
        title="Edit User"
      >
        {editUser && (
          <EditUser
            user={editUser}
            onSave={(updated) => {
              setEditUser(null)
              updateUserInList(updated as User)
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!confirmDelete}
        onOpenChange={(open) => setConfirmDelete(open ? confirmDelete : null)}
        title="Confirm User Deletion"
      >
        {confirmDelete && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">
                  Soft Delete User
                </p>
                <p className="text-yellow-700">
                  This will deactivate the user account and hide it from normal
                  views. The user data will be preserved and can be restored
                  later if needed.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                User to Delete:
              </h4>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-200 p-2 rounded-full">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {confirmDelete.full_name}
                  </p>
                  <p className="text-sm text-gray-600">{confirmDelete.email}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    Role: {confirmDelete.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                What happens when you delete:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• User account will be deactivated</li>
                <li>• User will not be able to log in</li>
                <li>• User data will be preserved</li>
                <li>• Can be restored from the "Deleted Users" tab</li>
                <li>• All actions will be logged for audit</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSoftDelete(confirmDelete)}
                disabled={softDeleteMutation.isPending}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {softDeleteMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export { UserAdminPage }

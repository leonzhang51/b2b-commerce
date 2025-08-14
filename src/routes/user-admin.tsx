import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, User as UserIcon } from 'lucide-react'
import type { User } from '@/lib/supabase'
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

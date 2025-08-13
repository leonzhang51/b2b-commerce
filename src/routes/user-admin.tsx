import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { User } from '@/lib/supabase'
import { RequireRole } from '@/components/RequireRole'
import { Modal } from '@/components/ui/Modal'
import { EditUser } from '@/components/EditUser'
import { useCompaniesWithUsers, useCompanyUsers } from '@/hooks/useCompanyUsers'
import { useUpdateUser } from '@/hooks/useUpdateUser'

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <label className="block mb-2 font-medium">Select Company</label>
      <select
        className="w-full border rounded px-2 py-1 mb-6"
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
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {selectedCompany && users.length === 0 && !loading && (
        <div>No users found for this company.</div>
      )}
      {users.length > 0 && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    className="border rounded px-2 py-1 capitalize"
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
                <td className="p-2">{u.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setEditUser(u)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  )
}

export { UserAdminPage }

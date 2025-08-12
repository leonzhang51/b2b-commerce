import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import type { Company, User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/user-admin')({
  component: UserAdminPage,
})

function UserAdminPage() {
  const [companies, setCompanies] = useState<Array<Company>>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
      if (error) setError(error.message)
      else setCompanies(data)
      setLoading(false)
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (!selectedCompany) {
      setUsers([])
      return
    }
    async function fetchUsers() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', selectedCompany)
        .order('last_name')
      if (error) setError(error.message)
      else setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [selectedCompany])

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
              <th className="p-2 text-left">Role(s)</th>
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">
                  {u.first_name} {u.last_name}
                </td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  {Array.isArray(u.permissions) ? u.permissions.join(', ') : ''}
                </td>
                <td className="p-2">{u.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <Link
                    to="/edit-user/$id"
                    params={{ id: u.id }}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

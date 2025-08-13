import { useEffect, useState } from 'react'
import type { Company, User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export function useCompaniesWithUsers() {
  const [companies, setCompanies] = useState<Array<Company>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      setError(null)

      try {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*, users:users(id)')
          .order('name')

        if (companiesError) {
          setError(companiesError.message)
        } else {
          // Only keep companies with at least one user
          setCompanies(
            companiesData.filter((c) => c.users && c.users.length > 0),
          )
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch companies',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return { companies, loading, error }
}

export function useCompanyUsers(companyId: string | undefined) {
  const [users, setUsers] = useState<Array<User>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) {
      setUsers([])
      return
    }

    async function fetchUsers() {
      setLoading(true)
      setError(null)

      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('company_id', companyId)
          .order('full_name')

        if (usersError) {
          setError(usersError.message)
        } else {
          setUsers(usersData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [companyId])

  const updateUserInList = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    )
  }

  const updateUserRole = (userId: string, newRole: User['role']) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    )
  }

  return { users, loading, error, updateUserInList, updateUserRole }
}

import { useState } from 'react'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useAuditLogger } from '@/hooks/useAuditLog'

export function useUpdateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { logUserUpdate, logUserRoleChange } = useAuditLogger()

  const updateUser = async (user: any): Promise<any | null> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get the current user data for audit logging
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          company_id: user.company_id,
          phone: user.phone,
          job_title: user.job_title,
          department: user.department,
          trade_type: user.trade_type,
          permissions: user.permissions,
          is_active: user.is_active,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return null
      }

      // Log the user update
      if (currentUser) {
        logUserUpdate(user.id, currentUser, data, {
          action_description: 'User profile updated via admin panel',
        })
      }

      setSuccess(true)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (
    userId: string,
    role: User['role'],
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get the current user data for audit logging
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      const { error: updateError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        return false
      }

      // Log the role change
      if (currentUser && currentUser.role !== role) {
        logUserRoleChange(userId, currentUser.role, role, {
          action_description: 'Role changed via admin panel',
        })
      }

      setSuccess(true)
      return true
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update user role',
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateUser, updateUserRole, loading, error, success }
}

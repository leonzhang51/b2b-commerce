import { useState } from 'react'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export function useUpdateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateUser = async (user: any): Promise<any | null> => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
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
      const { error: updateError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        return false
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

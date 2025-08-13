import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useResetPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await supabase.auth.resetPasswordForEmail(email)
      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { resetPassword, loading, error, success }
}

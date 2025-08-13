import { useEffect, useState } from 'react'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export function useUserData(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setLoading(false)
      return
    }

    async function fetchUser() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError) {
          setError(fetchError.message)
          setUser(null)
        } else {
          setUser(data as User)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, loading, error }
}

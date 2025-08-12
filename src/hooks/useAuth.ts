import { useCallback, useEffect, useState } from 'react'

import type { AuthUser } from '@/types/auth'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      // Fetch user profile from public.users
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profile && !error) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          ...data.user.user_metadata,
          ...profile,
        })
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          ...data.user.user_metadata,
        })
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUser()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [fetchUser])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    await fetchUser()
    setLoading(false)
    return error
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }

  return { user, loading, signIn, signOut }
}

import { useCallback, useEffect, useState } from 'react'

import type { AuthUser } from '@/types/auth'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

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

    // Check if account is locked
    if (isLocked && lockoutUntil && Date.now() < lockoutUntil) {
      setLoading(false)
      return new Error(
        `Account is locked. Try again after ${new Date(lockoutUntil).toLocaleTimeString()}`,
      )
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Increment login attempts on failure
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)

      // Lock account after max attempts
      if (newAttempts >= 5) {
        // Max attempts from config
        const lockUntil = Date.now() + 15 * 60 * 1000 // 15 minutes
        setIsLocked(true)
        setLockoutUntil(lockUntil)

        // Store lockout in localStorage for persistence
        localStorage.setItem(
          'auth_lockout',
          JSON.stringify({
            email,
            lockoutUntil: lockUntil,
            attempts: newAttempts,
          }),
        )
      }
    } else {
      // Reset attempts on successful login
      setLoginAttempts(0)
      setIsLocked(false)
      setLockoutUntil(null)
      localStorage.removeItem('auth_lockout')
    }

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

  // Check for existing lockout on component mount
  useEffect(() => {
    const lockoutData = localStorage.getItem('auth_lockout')
    if (lockoutData) {
      try {
        const { lockoutUntil: storedLockout, attempts } =
          JSON.parse(lockoutData)
        if (Date.now() < storedLockout) {
          setIsLocked(true)
          setLockoutUntil(storedLockout)
          setLoginAttempts(attempts)
        } else {
          // Lockout expired, clean up
          localStorage.removeItem('auth_lockout')
        }
      } catch {
        // Invalid lockout data, clean up
        localStorage.removeItem('auth_lockout')
      }
    }
  }, [])

  return {
    user,
    loading,
    signIn,
    signOut,
    loginAttempts,
    isLocked,
    lockoutUntil: lockoutUntil ? new Date(lockoutUntil) : null,
  }
}

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface RegisterInput {
  readonly email: string
  readonly password: string
  readonly firstName: string
  readonly lastName: string
  readonly company: string
  readonly phone: string
  readonly jobTitle: string
  readonly department: string
  readonly tradeType: string
}

export function useRegisterUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (input: RegisterInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const user_metadata = {
      first_name: input.firstName,
      last_name: input.lastName,
      company: input.company,
      phone: input.phone,
      job_title: input.jobTitle,
      department: input.department,
      trade_type: input.tradeType,
      role: 'buyer',
    }

    try {
      const result = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: user_metadata },
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      // Insert user profile into public.users if user is returned
      const user = result.data.user
      if (user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            first_name: input.firstName,
            last_name: input.lastName,
            company: input.company,
            phone: input.phone,
            job_title: input.jobTitle,
            department: input.department,
            trade_type: input.tradeType,
            role: 'buyer',
            created_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          setError(
            'Registered, but failed to save profile: ' + profileError.message,
          )
          return
        }
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error, success }
}

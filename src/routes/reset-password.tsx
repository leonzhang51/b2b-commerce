import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const result = await supabase.auth.resetPasswordForEmail(email)
    if (result.error) setError(result.error.message)
    else setSuccess(true)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xs w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && (
          <div className="text-green-600 text-sm">
            Check your email for a password reset link.
          </div>
        )}
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>
      <div className="mt-4 text-sm">
        Remembered your password?{' '}
        <Link to="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </div>
    </main>
  )
}

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useResetPassword } from '@/hooks/useResetPassword'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const { resetPassword, loading, error, success } = useResetPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await resetPassword(email)
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
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

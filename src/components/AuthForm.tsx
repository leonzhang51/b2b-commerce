import { useState } from 'react'
import type { AuthFormProps } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AuthForm(_: AuthFormProps) {
  const { user, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const err = await signIn(email, password)
    if (err) setError(err.message || 'Login failed')
  }

  if (loading) return <div>Loading...</div>
  if (user) {
    return (
      <div className="space-y-2">
        <div>Welcome, {user.email}</div>
        <Button onClick={signOut}>Sign out</Button>
      </div>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  )
}

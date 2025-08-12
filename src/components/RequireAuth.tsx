import { Navigate } from '@tanstack/react-router'
import type { RequireAuthProps } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({
  children,
  redirectTo = '/login',
}: RequireAuthProps) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to={redirectTo} />
  return <>{children}</>
}

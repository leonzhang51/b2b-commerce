import { Navigate } from '@tanstack/react-router'
import type { RoleProtectedRouteProps, UserRole } from '@/types/roles'
import { useAuth } from '@/hooks/useAuth'

export function RequireRole({
  children,
  allowedRoles,
  redirectTo = '/login',
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth()
  // Assume user.permissions includes roles, or adapt as needed
  const userRoles: Array<UserRole> =
    user && Array.isArray(user.permissions)
      ? (user.permissions as Array<UserRole>)
      : []

  if (loading) return <div>Loading...</div>
  if (!user || !userRoles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to={redirectTo} />
  }
  return <>{children}</>
}

export type UserRole = 'admin' | 'manager' | 'buyer' | 'guest'

export interface RoleProtectedRouteProps {
  readonly children: React.ReactNode
  readonly allowedRoles: Array<UserRole>
  readonly redirectTo?: string
}

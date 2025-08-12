export interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  permissions?: Array<string>
  role?: 'admin' | 'manager' | 'buyer' | 'guest'
}

export interface AuthFormProps {
  // Extend for future props (e.g., onSuccess, onError)
}

export interface RequireAuthProps {
  readonly children: React.ReactNode
  readonly redirectTo?: string
}

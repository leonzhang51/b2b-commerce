export interface AuthUser {
  id: string
  email: string
  email_verified?: boolean
  company_id?: string
  full_name?: string
  first_name?: string
  last_name?: string
  role?: 'admin' | 'manager' | 'buyer' | 'guest'
  trade_type?: string
  location?: string
  preferences?: {
    language?: string
    newsletter?: boolean
  }
  created_at?: string
  permissions?: Array<string>
  phone?: string
  job_title?: string
  department?: string
  is_active?: boolean
  deleted_at?: string | null
  deleted_by?: string | null
  Street?: string
  City?: string
  State?: string
  PostalCode?: string
  Country?: string
}

export interface AuthFormProps {
  // Extend for future props (e.g., onSuccess, onError)
}

export interface RequireAuthProps {
  readonly children: React.ReactNode
  readonly redirectTo?: string
}

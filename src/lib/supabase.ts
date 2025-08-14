import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface Company {
  readonly id: string
  readonly name: string
  readonly trade_type:
    | 'contractor'
    | 'plumber'
    | 'electrician'
    | 'hvac'
    | 'general'
  readonly business_license?: string
  readonly tax_id?: string
  readonly address?: string
  readonly city?: string
  readonly state?: string
  readonly zip_code?: string
  readonly phone?: string
  readonly email?: string
  readonly website?: string
  readonly credit_limit?: number
  readonly payment_terms?: number
  readonly is_active: boolean
  readonly created_at: string
  readonly updated_at: string
  readonly deleted_at?: string | null
  readonly deleted_by?: string | null
}

export interface User {
  readonly id: string
  readonly company_id: string
  readonly email: string
  readonly full_name: string
  readonly phone?: string
  readonly job_title?: string
  readonly department?: string
  readonly trade_type:
    | 'contractor'
    | 'plumber'
    | 'electrician'
    | 'hvac'
    | 'general'
  readonly permissions: ReadonlyArray<string>
  readonly is_active: boolean
  readonly role: 'admin' | 'manager' | 'buyer' | 'guest'
  readonly last_login?: string
  readonly created_at: string
  readonly updated_at: string
  readonly deleted_at?: string | null
  readonly deleted_by?: string | null
}

export interface Category {
  readonly id: string // UUID
  readonly name: string
  readonly parent_id?: string | null // UUID
  readonly created_at: string
}

export interface Product {
  readonly id: string // UUID
  readonly category_id: string // UUID
  readonly name: string
  readonly description?: string
  readonly price: number
  readonly sku: string
  readonly image_url?: string
  readonly stock: number
  readonly tags?: ReadonlyArray<string>
  readonly search_vector?: string
  readonly popularity_score?: number
  readonly personalization_score?: number
  readonly created_at: string
}

export interface CartItem {
  readonly id: string
  readonly user_id: string
  readonly product_id: number
  readonly quantity: number
  readonly price_at_time: number
  readonly notes?: string
  readonly created_at: string
  readonly updated_at: string
}

export interface ShoppingList {
  readonly id: string
  readonly user_id: string
  readonly name: string
  readonly description?: string
  readonly is_shared: boolean
  readonly shared_with?: ReadonlyArray<string>
  readonly created_at: string
  readonly updated_at: string
}

export interface AuditLog {
  readonly id: string
  readonly user_id: string // Who performed the action
  readonly target_user_id?: string // User being acted upon (for user management actions)
  readonly action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'role_change'
    | 'impersonate_start'
    | 'impersonate_end'
  readonly entity_type:
    | 'user'
    | 'company'
    | 'product'
    | 'category'
    | 'order'
    | 'system'
  readonly entity_id?: string // ID of the entity being acted upon
  readonly old_values?: Record<string, any> // Previous values (for updates)
  readonly new_values?: Record<string, any> // New values (for creates/updates)
  readonly metadata?: Record<string, any> // Additional context (IP, user agent, etc.)
  readonly created_at: string
}

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
}

export interface User {
  readonly id: string
  readonly company_id: string
  readonly email: string
  readonly first_name: string
  readonly last_name: string
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
  readonly last_login?: string
  readonly created_at: string
  readonly updated_at: string
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

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
  readonly email_confirmed_at?: string | null
  readonly created_at: string
  readonly updated_at: string
  readonly deleted_at?: string | null
  readonly deleted_by?: string | null
}

export interface Category {
  readonly category_id: number
  // For legacy code that uses `id` instead of `category_id`
  readonly id: number
  readonly parent_id?: number | null
  readonly name: string
  readonly level: number
  readonly slug: string
  readonly description?: string | null
  readonly image_url?: string | null
  readonly is_active: boolean
  readonly sort_order: number
  readonly created_at: string
  readonly updated_at: string
}

export interface Product {
  readonly product_id: number
  // For legacy code that uses `id` instead of `product_id`
  readonly id: number
  readonly category_id: number
  readonly sku: string
  readonly name: string
  readonly description?: string | null
  readonly short_description?: string | null
  readonly price: number
  readonly sale_price?: number | null
  readonly cost_price?: number | null
  readonly brand: string
  readonly model?: string | null
  readonly stock_quantity: number
  readonly min_stock_level: number
  readonly max_stock_level: number
  readonly weight_lbs?: number | null
  readonly dimensions_length?: number | null
  readonly dimensions_width?: number | null
  readonly dimensions_height?: number | null
  readonly color?: string | null
  readonly material?: string | null
  readonly power_source?: string | null
  readonly voltage?: string | null
  readonly wattage?: number | null
  readonly amperage?: number | null
  readonly is_active: boolean
  readonly is_featured: boolean
  readonly warranty_years: number
  readonly country_of_origin?: string | null
  readonly meta_title?: string | null
  readonly meta_description?: string | null
  readonly tags?: ReadonlyArray<string> | null
  readonly created_at: string
  readonly updated_at: string

  // Relations
  readonly category?: Category
  readonly images?: ReadonlyArray<ProductImage>
  readonly attributes?: ReadonlyArray<ProductAttribute>
}

export interface ProductImage {
  readonly image_id: number
  readonly product_id: number
  readonly image_url: string
  readonly alt_text?: string | null
  readonly is_primary: boolean
  readonly sort_order: number
  readonly created_at: string
}

export interface ProductAttribute {
  readonly attribute_id: number
  readonly product_id: number
  readonly attribute_name: string
  readonly attribute_value: string
  readonly attribute_type: string
  readonly is_filterable: boolean
  readonly sort_order: number
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

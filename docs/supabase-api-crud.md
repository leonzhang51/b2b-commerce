# Using Supabase API in B2B Commerce

This guide explains how to use Supabase as your backend API for CRUD (Create, Read, Update, Delete) operations in the B2B Commerce project. Supabase provides a RESTful and real-time API for your PostgreSQL database, as well as an official JavaScript client.

## Setup

1. **Install Supabase Client**

```
pnpm add @supabase/supabase-js
```

2. **Initialize Supabase Client**

Create a file at `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## CRUD Examples

Below are CRUD examples for `users` and `orders` tables. These are especially relevant for authentication and checkout flows.

---

## User CRUD Examples

Assume your `users` table has: `id`, `email`, `name`, `role`.

### Create User

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function createUserAsync(user: {
  email: string
  name: string
  role?: string
}) {
  const { data, error } = await supabase.from('users').insert([user]).select()
  if (error) throw error
  return data
}
```

### Get Users

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function getUsersAsync() {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return data
}
```

---

## Order CRUD Examples (for Checkout)

### Order Table Structure

| Name             | Format                   | Type   | Description                |
| ---------------- | ------------------------ | ------ | -------------------------- |
| id               | uuid                     | string | Order ID                   |
| user_id          | uuid                     | string | User ID (FK)               |
| company_id       | uuid                     | string | Company ID (FK)            |
| total            | numeric                  | number | Order total                |
| currency         | text                     | string | Currency code (e.g. 'USD') |
| status           | text                     | string | Order status               |
| shipping_address | jsonb                    | json   | Shipping address           |
| billing_address  | jsonb                    | json   | Billing address            |
| metadata         | jsonb                    | json   | Extra metadata             |
| created_at       | timestamp with time zone | string | Created at                 |
| updated_at       | timestamp with time zone | string | Updated at                 |

### Create Order (Checkout)

```typescript
import { supabase } from '@/lib/supabaseClient'

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  [key: string]: any // for flexibility
}

export async function createOrderAsync(order: {
  user_id: string
  company_id: string
  total: number
  currency: string
  status?: string
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  metadata?: Record<string, any>
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: order.user_id,
        company_id: order.company_id,
        total: order.total,
        currency: order.currency,
        status: order.status ?? 'pending',
        items: JSON.stringify(order.items), // If you have an items column (jsonb), otherwise store in metadata
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        metadata: order.metadata ?? {},
      },
    ])
    .select()
  if (error) throw error
  return data
}
```

### Get Orders for a User

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function getOrdersByUserAsync(user_id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
```

### Update Order Status

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function updateOrderStatusAsync(order_id: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', order_id)
    .select()
  if (error) throw error
  return data
}
```

### Delete Order

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function deleteOrderAsync(order_id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', order_id)
  if (error) throw error
  return true
}
```

---

## Notes

- Always handle errors with try/catch in your UI or presenter layer.
- Use environment variables for your Supabase URL and anon key.
- For more advanced queries, see the [Supabase JS docs](https://supabase.com/docs/reference/javascript/select).

---

**See also:**

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase REST API Docs](https://supabase.com/docs/reference/api)

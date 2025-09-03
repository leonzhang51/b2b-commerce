# Supabase Orders Table: Advanced Query & Realtime Examples

This document provides practical code snippets for querying, filtering, and subscribing to changes in the `orders` table using Supabase JavaScript client.

---

## Reading Orders

### Read All Orders

```typescript
const { data: orders, error } = await supabase.from('orders').select('*')
```

### Read Specific Columns

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('id, user_id, total, status')
```

### Read Referenced Tables (Join with users)

```typescript
const { data: orders, error } = await supabase.from('orders').select(`
    id,
    user_id,
    users (
      email, name
    )
  `)
```

### Pagination

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .range(0, 9) // first 10 orders
```

## Filtering Orders

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'pending')
  .gte('total', 100)
  .like('currency', '%USD%')
```

## Insert, Update, Delete

### Insert a Row

```typescript
const { data, error } = await supabase
  .from('orders')
  .insert([
    {
      user_id: '...',
      company_id: '...',
      total: 100,
      currency: 'USD',
      status: 'pending',
    },
  ])
  .select()
```

### Update a Row

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('id', 'order-id')
  .select()
```

### Delete a Row

```typescript
const { error } = await supabase.from('orders').delete().eq('id', 'order-id')
```

## Realtime Subscriptions

### Subscribe to All Order Changes

```typescript
const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order change received!', payload)
    },
  )
  .subscribe()
```

### Subscribe to Inserts Only

```typescript
const channel = supabase
  .channel('orders-inserts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order inserted!', payload)
    },
  )
  .subscribe()
```

### Subscribe to Updates Only

```typescript
const channel = supabase
  .channel('orders-updates')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order updated!', payload)
    },
  )
  .subscribe()
```

### Subscribe to Deletes Only

```typescript
const channel = supabase
  .channel('orders-deletes')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order deleted!', payload)
    },
  )
  .subscribe()
```

---

For more, see the [Supabase JS docs](https://supabase.com/docs/reference/javascript/select) and [Realtime docs](https://supabase.com/docs/guides/realtime).

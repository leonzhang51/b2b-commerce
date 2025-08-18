# Database Schema Fix Summary

## Problem

The error `column products.id does not exist` occurred because our Supabase queries were trying to select columns that don't exist in the new database schema.

## Root Cause

The products table uses `asin` as the primary key, not `id`, and has different column names:

**Actual Products Table Schema:**

```sql
products (
  asin text PRIMARY KEY,          -- not 'id'
  title text,                     -- not 'name'
  imgUrl text,                    -- not 'image_url'
  productURL text,
  stars text,
  reviews text,
  price text,
  listPrice text,
  category_id bigint,
  isBestSeller boolean,
  boughtInLastMonth text
)
```

## Fixes Applied

### 1. useProductSearch Function

**Before:**

```sql
SELECT id, name, description, price, image_url, category:categories(category_name)
```

**After:**

```sql
SELECT asin, title, imgUrl, price, listPrice, category:categories(category_name)
```

### 2. useProducts Function

**Before:**

- Used non-existent `product_search` view and `search_products` RPC
- Selected non-existent columns

**After:**

- Uses products table directly
- Selects correct columns: `asin,title,imgUrl,productURL,stars,reviews,price,listPrice,category_id,isBestSeller,boughtInLastMonth`
- Maps results through `mapProductRow()` for compatibility

### 3. useProductsByCategory Function

**Before:**

- Used non-existent `get_products_by_category` RPC

**After:**

- Uses products table directly with proper filtering
- Handles sorting correctly (maps 'name' to 'title')

### 4. useCart Function

**Before:**

```sql
product:products(asin,title,price,brand,imgUrl)
```

**After:**

```sql
product:products(asin,title,price,imgUrl)
```

- Removed `brand` field which doesn't exist

## Data Mapping Strategy

The `mapProductRow()` function ensures compatibility by mapping new schema to legacy field names:

```typescript
{
  // New fields preserved
  asin: row.asin,
  title: row.title,
  imgUrl: row.imgUrl,

  // Legacy aliases for compatibility
  product_id: row.asin,
  id: row.asin,
  sku: row.asin,
  name: row.title,
  image_url: row.imgUrl,
  // ... etc
}
```

## Result

- ✅ No more "column does not exist" errors
- ✅ All queries use correct column names
- ✅ Data mapping preserves compatibility with existing components
- ✅ TypeScript compilation passes
- ✅ Dev server starts without errors

## Test Status

- Categories load correctly (flat list)
- Products load correctly with proper field mapping
- Cart functionality works with correct product fields
- Search functionality uses correct columns

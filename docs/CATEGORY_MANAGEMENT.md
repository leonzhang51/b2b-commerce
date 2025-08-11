# B2B Commerce Category Management

This document explains how to set up and manage a clean 4-level category hierarchy for your B2B commerce platform.

## Problem Statement

Many B2B commerce platforms suffer from redundant and poorly organized category structures. This leads to:

- Duplicate category names at different levels
- Inconsistent product categorization
- Poor search and filtering experience
- Difficult navigation for buyers

## Solution: 4-Level Hierarchy

We implement a structured 4-level category system designed for B2B commerce:

```
Level 1: Divisions (Industries)
└── Level 2: Departments (Product Groups)
    └── Level 3: Categories (Product Families)
        └── Level 4: Subcategories (Specific Product Types)
```

### Example Structure:

```
Construction & Building (Division)
├── Lumber & Wood Products (Department)
│   ├── Dimensional Lumber (Category)
│   │   ├── 2x4 Lumber (Subcategory)
│   │   ├── 2x6 Lumber (Subcategory)
│   │   └── 2x8 Lumber (Subcategory)
│   └── Pressure Treated (Category)
│       ├── Deck Boards (Subcategory)
│       └── Fence Posts (Subcategory)
└── Plumbing & HVAC (Department)
    ├── Pipes & Fittings (Category)
    └── Valves & Controls (Category)
```

## Database Setup

### 1. Run the Category Setup Script

Execute the SQL script to create a clean category structure:

```sql
-- Run this in your Supabase SQL editor or PostgreSQL client
\i sql/setup-categories.sql
```

This script will:

- Create/update the categories table with proper indexes
- Create/update the products table with foreign key constraints
- Insert a comprehensive 4-level category hierarchy
- Add sample products for each subcategory
- Create utility views and triggers

### 2. Analyze Existing Categories (Optional)

If you have existing data, run the analysis script first:

```sql
-- Analyze current categories for duplicates and issues
\i sql/analyze-categories.sql
```

This will help you identify:

- Duplicate category names
- Orphaned categories (missing parents)
- Categories with no assigned products
- Potential merge candidates

## TypeScript Integration

### Category Types

The category interface supports the hierarchy:

```typescript
export interface Category {
  readonly id: string // UUID
  readonly name: string
  readonly parent_id?: string | null // Points to parent category
  readonly created_at: string
}

export interface CategoryWithHierarchy extends Category {
  children?: Array<CategoryWithHierarchy>
  path?: string // "Division > Department > Category > Subcategory"
  breadcrumb?: Array<string> // ["Division", "Department", "Category"]
}
```

### Utility Functions

Import and use the category utilities:

```typescript
import {
  buildCategoryTree,
  getCategoryBreadcrumb,
  validateCategoryHierarchy,
  getCategoryStats,
  findCategoriesByName,
} from '@/utils/categoryUtils'

// Build tree structure from flat array
const categoryTree = buildCategoryTree(categories)

// Get breadcrumb for navigation
const breadcrumb = getCategoryBreadcrumb(categories, 'category-id')
// Result: ["Construction & Building", "Lumber & Wood Products", "Dimensional Lumber"]

// Validate hierarchy
const validation = validateCategoryHierarchy(categories)
if (!validation.isValid) {
  console.error('Category issues:', validation.errors)
}

// Get statistics
const stats = getCategoryStats(categories)
console.log(`Total categories: ${stats.totalCategories}`)
console.log(`By level:`, stats.byLevel) // {1: 6, 2: 24, 3: 32, 4: 48}
```

## React Component Usage

### Category Navigation

```tsx
import { useCategories } from '@/hooks/useSupabase'
import { buildCategoryTree } from '@/utils/categoryUtils'

function CategoryNavigation() {
  const { data: categories } = useCategories()
  const categoryTree = categories ? buildCategoryTree(categories) : []

  return (
    <nav>
      {categoryTree.map((division) => (
        <div key={division.id}>
          <h2>{division.name}</h2>
          {division.children?.map((department) => (
            <div key={department.id}>
              <h3>{department.name}</h3>
              {department.children?.map((category) => (
                <div key={category.id}>
                  <h4>{category.name}</h4>
                  <ul>
                    {category.children?.map((subcategory) => (
                      <li key={subcategory.id}>
                        <Link to={`/products?category=${subcategory.id}`}>
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </nav>
  )
}
```

### Product Filtering

```tsx
import { useProducts } from '@/hooks/useSupabase'

function ProductList({ categoryId }: { categoryId: string }) {
  const { data: products } = useProducts({ categoryId })

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Category: {product.category?.name}</p>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  -- ... other fields
);
```

## Best Practices

### 1. Category Naming

- Use clear, industry-standard terminology
- Avoid redundant words (don't repeat parent category names)
- Be specific at deeper levels
- Use singular forms for consistency

### 2. Product Assignment

- Always assign products to the most specific subcategory (Level 4)
- Never assign products to higher-level categories directly
- Ensure each product has exactly one primary category

### 3. Hierarchy Maintenance

- Regularly run validation checks
- Monitor for orphaned categories
- Clean up unused categories
- Keep the hierarchy balanced (avoid too many siblings)

### 4. Performance

- Use proper indexes on parent_id and category_id
- Consider materialized views for complex queries
- Cache category trees in your application
- Use recursive CTEs carefully with large datasets

## Migration from Existing Categories

If you have existing categories with duplicates:

1. **Backup your data** first
2. Run the analysis script to identify issues
3. Create a mapping of old category IDs to new ones
4. Update product assignments in batches
5. Validate the migration with test queries

```sql
-- Example migration query (customize for your data)
UPDATE products
SET category_id = 'new-subcategory-id'
WHERE category_id IN ('old-duplicate-id-1', 'old-duplicate-id-2');
```

## Monitoring and Maintenance

### Regular Checks

```sql
-- Check for orphaned categories
SELECT * FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL AND p.id IS NULL;

-- Check category balance (avoid too many children)
SELECT parent_id, COUNT(*) as child_count
FROM categories
WHERE parent_id IS NOT NULL
GROUP BY parent_id
HAVING COUNT(*) > 20;

-- Check for products without categories
SELECT * FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL;
```

### Performance Monitoring

```sql
-- Query performance analysis
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.parent_id = 'specific-department-id';
```

This structured approach will give you a clean, scalable category system that improves both the buyer experience and your data management.

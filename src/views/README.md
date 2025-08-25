# Views Directory

This directory contains **View** components following the MVP (Model-View-Presenter) pattern.

## What are Views?

Views are **pure presentational React components** that:

- **Receive props** - All data comes from props (no hooks for data fetching)
- **Emit events** - Use callback props to communicate user actions
- **Focus on UI** - Handle rendering, styling, and user interactions only
- **Stay stateless** - Minimal local state (only UI-specific like form inputs)

## View Patterns

### 1. Pure Functional Views

```typescript
// src/views/ProductListView.tsx
interface ProductListViewProps {
  readonly products: Product[]
  readonly loading: boolean
  readonly error: string | null
  readonly onSearch: (query: string) => void
  readonly onProductClick: (productId: string) => void
}

export function ProductListView({
  products,
  loading,
  error,
  onSearch,
  onProductClick
}: ProductListViewProps) {
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product.id)}
        />
      ))}
    </div>
  )
}
```

### 2. Composed with Presenters

```typescript
// src/components/ProductList.tsx (Container)
import { ProductListView } from '@/views/ProductListView'
import { useProductListPresenter } from '@/presenters/useProductListPresenter'

export function ProductList() {
  const presenter = useProductListPresenter()

  return (
    <ProductListView
      products={presenter.products}
      loading={presenter.loading}
      error={presenter.error}
      onSearch={presenter.handleSearch}
      onProductClick={presenter.handleProductClick}
    />
  )
}
```

## Rules for Views

✅ **DO:**

- Use props for all data and callbacks
- Focus on rendering and styling
- Use local state for form inputs and UI state
- Emit user events via callback props
- Use shared UI components from `src/components/ui/`

❌ **DON'T:**

- Import hooks that fetch data (useSupabase, useQuery, etc.)
- Import use cases or repositories directly
- Contain business logic or data transformation
- Access Zustand stores directly (get data via props)
- Make API calls or database queries

## Example Structure

```
src/views/
├── ProductListView.tsx
├── ProductDetailsView.tsx
├── CartView.tsx
├── CheckoutView.tsx
├── UserManagementView.tsx
└── README.md
```

## Testing Views

Views are easy to test because they're pure functions:

```typescript
// ProductListView.test.tsx
test('renders products correctly', () => {
  const mockProducts = [{ id: '1', name: 'Test Product' }]
  const mockOnSearch = jest.fn()

  render(
    <ProductListView
      products={mockProducts}
      loading={false}
      error={null}
      onSearch={mockOnSearch}
      onProductClick={jest.fn()}
    />
  )

  expect(screen.getByText('Test Product')).toBeInTheDocument()
})
```

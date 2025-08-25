# Presenters Directory

This directory contains **Presenter** components following the MVP (Model-View-Presenter) pattern.

## What are Presenters?

Presenters are the "glue" between Views and Use Cases. They:

- **Orchestrate UI state** - Handle loading, error, and success states
- **Call use cases** - Invoke business logic from `src/usecases/`
- **Adapt data** - Transform Model data for Views to consume
- **Subscribe to stores** - Connect to Zustand stores for shared state
- **Handle user events** - Process user interactions and delegate to use cases

## Presenter Patterns

### 1. Hook-based Presenters

```typescript
// src/presenters/useProductListPresenter.ts
export function useProductListPresenter() {
  const productSearchUseCase = new ProductSearchUseCase()
  const [loading, setLoading] = useState(false)

  const searchProducts = async (query: string) => {
    setLoading(true)
    try {
      const results = await productSearchUseCase.search(query)
      return results
    } finally {
      setLoading(false)
    }
  }

  return { searchProducts, loading }
}
```

### 2. Component-based Presenters

```typescript
// src/presenters/ProductListPresenter.tsx
export function ProductListPresenter({
  children,
}: {
  children: (props: any) => React.ReactNode
}) {
  const presenter = useProductListPresenter()
  return children(presenter)
}
```

## Rules for Presenters

✅ **DO:**

- Import and use use cases from `src/usecases/`
- Import repositories from `src/models/`
- Handle UI state (loading, errors)
- Transform data for Views
- Use Zustand stores for shared state

❌ **DON'T:**

- Contain JSX/rendering logic (that's for Views)
- Access Supabase directly (use repositories)
- Implement business logic (use use cases)
- Have complex styling or layout logic

## Example Structure

```
src/presenters/
├── useProductListPresenter.ts
├── useCartPresenter.ts
├── useCheckoutPresenter.ts
├── useUserManagementPresenter.ts
└── README.md
```

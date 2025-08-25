# MVP Refactoring Example: ProductDetails

This document shows how we refactored the `ProductDetails` component to follow the MVP (Model-View-Presenter) pattern.

## Before: Monolithic Component ❌

The original `ProductDetails.tsx` had several MVP violations:

```typescript
// ❌ BAD: Business logic mixed with presentation
function getRolePrice(product: any, role: string | undefined): number {
  if (role === 'admin') return product.price * 0.9
  if (role === 'manager') return product.price * 0.95
  if (role === 'buyer') return product.price
  return product.price
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  // ❌ BAD: Direct data access in component
  const { user } = useAuth()
  const { data: product, isLoading, error } = useProduct(productId)

  // ❌ BAD: Business logic in component
  const price = getRolePrice(product, user?.role)

  // ❌ BAD: Complex JSX with business logic
  return (
    <div>
      {/* Lots of JSX with embedded business logic */}
    </div>
  )
}
```

**Problems:**

- Business logic (`getRolePrice`) mixed with presentation
- Direct data fetching in component
- Complex component doing too many things
- Hard to test business logic separately
- Violates single responsibility principle

## After: MVP Pattern ✅

We split this into three clean layers:

### 1. Use Case Layer (`src/usecases/ProductPricingUseCase.ts`)

```typescript
// ✅ GOOD: Pure business logic, framework-agnostic
export class ProductPricingUseCase {
  calculatePrice(basePrice: number, context: PricingContext): ProductPricing {
    // Business logic here
  }

  private getRoleDiscount(role: string): number {
    // Pricing rules here
  }
}
```

**Benefits:**

- Pure business logic
- Framework-agnostic (no React dependencies)
- Easy to unit test
- Reusable across different components

### 2. Presenter Layer (`src/presenters/useProductDetailsPresenter.ts`)

```typescript
// ✅ GOOD: Orchestrates data and business logic
export function useProductDetailsPresenter(productId: string) {
  const { user } = useAuth()
  const { data: product, isLoading, error } = useProduct(productId)
  const [pricingUseCase] = useState(() => new ProductPricingUseCase())

  // Orchestrate business logic
  const pricing = product
    ? pricingUseCase.calculatePrice(product.price, { userRole: user?.role })
    : null

  const handleAddToCart = () => {
    // Handle user actions
  }

  return {
    product,
    loading: isLoading,
    error,
    pricing,
    handleAddToCart,
    // ... other state and actions
  }
}
```

**Benefits:**

- Separates data orchestration from presentation
- Handles UI state and user interactions
- Calls use cases for business logic
- Returns clean interface for views

### 3. View Layer (`src/views/ProductDetailsView.tsx`)

```typescript
// ✅ GOOD: Pure presentational component
export function ProductDetailsView({
  product,
  loading,
  error,
  pricing,
  onAddToCart,
}: ProductDetailsViewProps) {
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  return (
    <div>
      {/* Pure JSX with no business logic */}
    </div>
  )
}
```

**Benefits:**

- Pure function (easy to test)
- No business logic
- Receives all data via props
- Emits events via callbacks

### 4. Container Component (`src/components/ProductDetails.tsx`)

```typescript
// ✅ GOOD: Thin container connecting presenter and view
export function ProductDetails({ productId }: ProductDetailsProps) {
  const presenter = useProductDetailsPresenter(productId)

  return (
    <ProductDetailsView
      product={presenter.product}
      loading={presenter.loading}
      error={presenter.error}
      pricing={presenter.pricing}
      onAddToCart={presenter.handleAddToCart}
    />
  )
}
```

**Benefits:**

- Thin container (just connects presenter to view)
- Clear separation of concerns
- Easy to understand and maintain

## Testing Benefits

### Before: Hard to Test ❌

```typescript
// Hard to test business logic mixed with React component
test('calculates admin price correctly', () => {
  // Need to render entire component, mock hooks, etc.
  render(<ProductDetails productId="123" />)
  // Complex setup and assertions
})
```

### After: Easy to Test ✅

**Test Use Case (Pure Logic):**

```typescript
test('calculates admin price correctly', () => {
  const useCase = new ProductPricingUseCase()
  const result = useCase.calculatePrice(100, { userRole: 'admin' })
  expect(result.finalPrice).toBe(90) // 10% discount
})
```

**Test View (Pure Component):**

```typescript
test('renders product correctly', () => {
  render(
    <ProductDetailsView
      product={mockProduct}
      loading={false}
      error={null}
      pricing={mockPricing}
      onAddToCart={jest.fn()}
    />
  )
  expect(screen.getByText('Test Product')).toBeInTheDocument()
})
```

**Test Presenter (Integration):**

```typescript
test('presenter handles add to cart', () => {
  const { result } = renderHook(() => useProductDetailsPresenter('123'))
  act(() => {
    result.current.handleAddToCart()
  })
  // Assert side effects
})
```

## Key Takeaways

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Business logic can be tested without React
3. **Reusability**: Use cases can be shared across components
4. **Maintainability**: Changes to business logic don't affect UI
5. **Type Safety**: Clear interfaces between layers

This is the pattern we should follow for all components in the codebase!

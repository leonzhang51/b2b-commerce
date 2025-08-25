# MVP Architecture Guide

This guide explains how to implement features following the Model-View-Presenter (MVP) pattern in this codebase.

## 🏗️ Architecture Overview

The MVP pattern separates concerns into three distinct layers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      VIEW       │    │   PRESENTER     │    │     MODEL       │
│                 │    │                 │    │                 │
│ • Pure UI       │◄──►│ • Orchestrates  │◄──►│ • Business      │
│ • No logic      │    │ • UI State      │    │   Logic         │
│ • Props only    │    │ • User Events   │    │ • Data Access   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Layer Responsibilities

#### 📱 **Views** (`src/views/`)

- **Pure presentational components**
- Receive all data via props
- Emit user events via callbacks
- No business logic or data fetching
- Easy to test and reuse

#### 🎭 **Presenters** (`src/presenters/`)

- **Orchestrate between Views and Models**
- Handle UI state (loading, errors)
- Process user interactions
- Call Use Cases for business logic
- Transform data for Views

#### 🏢 **Models** (`src/models/`, `src/usecases/`)

- **Business logic and data access**
- Use Cases: Framework-agnostic business rules
- Repositories: Data access abstraction
- No UI dependencies

## 📁 Directory Structure

```
src/
├── views/              # Pure presentational components
│   ├── ProductListView.tsx
│   ├── ProductDetailsView.tsx
│   ├── CartView.tsx
│   └── README.md
├── presenters/         # UI orchestration hooks
│   ├── useProductListPresenter.ts
│   ├── useProductDetailsPresenter.ts
│   ├── useCartPresenter.ts
│   └── README.md
├── usecases/          # Business logic
│   ├── ProductSearchUseCase.ts
│   ├── ProductPricingUseCase.ts
│   ├── CartUseCase.ts
│   └── UserManagementUseCase.ts
├── models/            # Data access layer
│   ├── BaseRepository.ts
│   ├── ProductRepository.ts
│   ├── UserRepository.ts
│   └── CategoryRepository.ts
├── components/        # Container components
│   ├── ProductList.tsx      # Connects presenter + view
│   ├── ProductDetails.tsx   # Connects presenter + view
│   └── CartComponents.tsx   # Connects presenter + view
└── __tests__/         # Layer-specific tests
    ├── views/         # Pure component tests
    ├── presenters/    # Integration tests
    └── usecases/      # Business logic tests
```

## 🚀 How to Implement New Features

### Step 1: Create Use Case (Business Logic)

```typescript
// src/usecases/OrderManagementUseCase.ts
export class OrderManagementUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(orderData: CreateOrderInput): Promise<Order> {
    // Validate order data
    const validation = this.validateOrder(orderData)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Apply business rules
    const processedOrder = this.applyBusinessRules(orderData)

    // Save to repository
    return await this.orderRepository.create(processedOrder)
  }

  private validateOrder(data: CreateOrderInput): ValidationResult {
    // Business validation logic
  }

  private applyBusinessRules(data: CreateOrderInput): ProcessedOrder {
    // Business rules (discounts, taxes, etc.)
  }
}
```

### Step 2: Create Repository (Data Access)

```typescript
// src/models/OrderRepository.ts
export class SupabaseOrderRepository extends AbstractSupabaseRepository<Order> {
  constructor(client: SupabaseClient) {
    super(client, 'orders')
  }

  async findById(id: string): Promise<Order | null> {
    // Implement data access
  }

  async create(data: CreateOrderData): Promise<Order> {
    // Implement data creation
  }

  async findByUserId(userId: string): Promise<Order[]> {
    // Custom query methods
  }
}
```

### Step 3: Create Presenter (Orchestration)

```typescript
// src/presenters/useOrderManagementPresenter.ts
export function useOrderManagementPresenter() {
  const [orderUseCase] = useState(
    () => new OrderManagementUseCase(orderRepository),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async (orderData: CreateOrderInput) => {
    try {
      setLoading(true)
      setError(null)

      const order = await orderUseCase.createOrder(orderData)

      // Handle success (notifications, navigation, etc.)
      return order
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    loading,
    error,

    // Actions
    createOrder,
  }
}
```

### Step 4: Create View (Presentation)

```typescript
// src/views/OrderFormView.tsx
export interface OrderFormViewProps {
  readonly loading: boolean
  readonly error: string | null
  readonly onSubmit: (orderData: CreateOrderInput) => void
  readonly onCancel: () => void
}

export function OrderFormView({ loading, error, onSubmit, onCancel }: OrderFormViewProps) {
  const [formData, setFormData] = useState<CreateOrderInput>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      {/* Form fields */}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Order'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}
```

### Step 5: Create Container Component

```typescript
// src/components/OrderForm.tsx
export function OrderForm() {
  const presenter = useOrderManagementPresenter()
  const navigate = useNavigate()

  const handleSubmit = async (orderData: CreateOrderInput) => {
    try {
      await presenter.createOrder(orderData)
      navigate('/orders')
    } catch (err) {
      // Error handled by presenter
    }
  }

  return (
    <OrderFormView
      loading={presenter.loading}
      error={presenter.error}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/orders')}
    />
  )
}
```

## 🧪 Testing Strategy

### Test Use Cases (Business Logic)

```typescript
// Pure business logic - no React dependencies
describe('OrderManagementUseCase', () => {
  it('should validate order data', () => {
    const useCase = new OrderManagementUseCase(mockRepository)
    const result = useCase.validateOrder(invalidData)
    expect(result.isValid).toBe(false)
  })
})
```

### Test Views (Pure Components)

```typescript
// Test props and user interactions
describe('OrderFormView', () => {
  it('should call onSubmit with form data', () => {
    const mockOnSubmit = jest.fn()
    render(<OrderFormView onSubmit={mockOnSubmit} />)

    fireEvent.click(screen.getByText('Create Order'))
    expect(mockOnSubmit).toHaveBeenCalled()
  })
})
```

### Test Presenters (Integration)

```typescript
// Test orchestration between layers
describe('useOrderManagementPresenter', () => {
  it('should handle order creation flow', async () => {
    const { result } = renderHook(() => useOrderManagementPresenter())

    await act(async () => {
      await result.current.createOrder(validOrderData)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })
})
```

## ✅ Best Practices

### DO ✅

- Keep Views pure and stateless
- Put business logic in Use Cases
- Use Presenters for UI orchestration
- Test each layer independently
- Use TypeScript interfaces for contracts
- Handle errors at the Presenter level
- Use dependency injection for Use Cases

### DON'T ❌

- Put business logic in Views
- Access Supabase directly from components
- Mix data fetching with presentation
- Skip error handling in Presenters
- Create circular dependencies between layers
- Test implementation details

## 🔄 Migration Strategy

When refactoring existing components:

1. **Extract Business Logic** → Move to Use Cases
2. **Create Repository** → Abstract data access
3. **Build Presenter** → Orchestrate UI state
4. **Create Pure View** → Extract JSX to props-based component
5. **Update Container** → Connect presenter and view
6. **Add Tests** → Test each layer separately

## 📚 Examples in Codebase

- **ProductDetails**: Complete MVP implementation
- **CartComponents**: Presenter + View pattern
- **ProductPricingUseCase**: Pure business logic
- **ProductRepository**: Data access abstraction

## 🎯 Benefits Achieved

- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Reusability**: Views can be reused with different presenters
- **Scalability**: Easy to add new features following the pattern
- **Type Safety**: Strong TypeScript contracts between layers

## 🚨 Common Pitfalls to Avoid

### 1. **Mixing Concerns**

```typescript
// ❌ BAD: Business logic in View
function ProductView({ productId }) {
  const [price, setPrice] = useState(0)

  useEffect(() => {
    // Business logic in view!
    if (user.role === 'admin') {
      setPrice(basePrice * 0.9)
    }
  }, [user, basePrice])
}

// ✅ GOOD: Business logic in Use Case
function ProductView({ price, discountReason }) {
  return <div>${price} {discountReason}</div>
}
```

### 2. **Direct Data Access in Components**

```typescript
// ❌ BAD: Direct Supabase access
function ProductList() {
  const { data } = useQuery('products', () =>
    supabase.from('products').select('*'),
  )
}

// ✅ GOOD: Through Repository and Use Case
function useProductListPresenter() {
  const searchUseCase = new ProductSearchUseCase(productRepository)
  // Use case handles the complexity
}
```

### 3. **Fat Presenters**

```typescript
// ❌ BAD: Too much logic in presenter
function useProductPresenter() {
  // 200+ lines of complex business logic
  const calculateComplexPricing = () => {
    // This should be in a Use Case!
  }
}

// ✅ GOOD: Delegate to Use Cases
function useProductPresenter() {
  const pricingUseCase = new ProductPricingUseCase()
  const pricing = pricingUseCase.calculatePrice(basePrice, context)
}
```

## 📋 Quick Checklist

When implementing a new feature, ask:

- [ ] Is business logic in Use Cases?
- [ ] Are Views pure and props-based?
- [ ] Do Presenters only orchestrate?
- [ ] Are repositories the only data access point?
- [ ] Can each layer be tested independently?
- [ ] Are TypeScript interfaces defined for contracts?
- [ ] Is error handling done at the Presenter level?

## 🔗 Related Documentation

- [Presenter README](./presenters/README.md)
- [Views README](./views/README.md)
- [MVP Refactoring Example](./MVP_REFACTORING_EXAMPLE.md)
- [Testing Examples](../__tests__/)

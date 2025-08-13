# State Management with Zustand in B2B Commerce

This document provides a comprehensive guide on how state management is implemented in the B2B Commerce codebase using Zustand.

## Overview

The B2B Commerce application uses a hybrid approach for state management:

- **Zustand**: For client-side, shared state (cart, UI state, todos, etc.)
- **TanStack Query**: For server state (data from APIs/Supabase)
- **Custom Hooks**: For encapsulating business logic and Supabase operations
- **React State**: For local component state (`useState`, `useReducer`)

## Architecture

### State Management Layers

1. **Server State (TanStack Query + Custom Hooks)**
   - User authentication data
   - Product catalog
   - Order history
   - User management operations
   - Any data that comes from or needs to be synced with the server

2. **Global Client State (Zustand)**
   - Shopping cart contents
   - UI state (modals, sidebar, theme)
   - User preferences
   - Temporary data that needs to be shared across components

3. **Local Component State (React)**
   - Form inputs
   - Component-specific UI state
   - Temporary values that don't need to be shared

## Custom Hooks for Business Logic

### Pattern: Separation of Concerns

To maintain clean architecture, we use custom hooks to encapsulate business logic and keep components focused on presentation. This pattern ensures:

- **Single Responsibility**: Components handle UI, hooks handle business logic
- **Testability**: Business logic can be tested independently
- **Reusability**: Hooks can be shared across components
- **Maintainability**: Changes to business logic don't affect component structure

### Available Business Logic Hooks

#### User Management

- `useUserData(userId)`: Fetch single user data
- `useUpdateUser()`: Update user information and roles
- `useRegisterUser()`: Handle user registration
- `useResetPassword()`: Handle password reset functionality

#### Company Management

- `useCompaniesWithUsers()`: Fetch companies that have users
- `useCompanyUsers(companyId)`: Fetch users for a specific company

#### Authentication

- `useAuth()`: Handle authentication state and operations

### Example Usage

```typescript
// ❌ Anti-pattern: Direct Supabase usage in component
function EditUserComponent({ user }) {
  const [loading, setLoading] = useState(false)

  const handleSave = async (userData) => {
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', user.id)
    setLoading(false)
    // Handle error, success, etc.
  }

  return <form onSubmit={handleSave}>...</form>
}

// ✅ Correct pattern: Using custom hook
function EditUserComponent({ user }) {
  const { updateUser, loading, error, success } = useUpdateUser()

  const handleSave = async (userData) => {
    await updateUser(userData)
  }

  return <form onSubmit={handleSave}>...</form>
}
```

## Available Stores

### 1. Todo Store (`useTodoStore`)

Located in `src/store/todoStore.ts`

```typescript
import { useTodoStore } from '@/store'

// Usage in components
function TodoComponent() {
  const todos = useTodoStore((state) => state.todos)
  const addTodo = useTodoStore((state) => state.addTodo)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)

  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          {todo.title}
        </div>
      ))}
    </div>
  )
}
```

**Available Actions:**

- `addTodo(title: string)`: Add a new todo
- `toggleTodo(id: number)`: Toggle completion status
- `removeTodo(id: number)`: Remove a todo
- `clearCompleted()`: Remove all completed todos
- `setShowCompleted(show: boolean)`: Filter visibility
- `setSearchTerm(term: string)`: Search filter
- `getFilteredTodos()`: Get filtered todos
- `getTodoCount()`: Get count statistics

### 2. Cart Store (`useCartStore`)

Located in `src/store/cartStore.ts`

```typescript
import { useCartStore } from '@/store'

// Usage in components
function CartButton() {
  const totalItems = useCartStore((state) => state.totalItems)
  const toggleCart = useCartStore((state) => state.toggleCart)

  return (
    <button onClick={toggleCart}>
      Cart ({totalItems})
    </button>
  )
}

function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
```

**Available Actions:**

- `addItem(item)`: Add item to cart
- `removeItem(id: string)`: Remove item from cart
- `updateQuantity(id: string, quantity: number)`: Update item quantity
- `clearCart()`: Empty the cart
- `toggleCart()`: Toggle cart sidebar
- `openCart()` / `closeCart()`: Control cart visibility
- `getItemCount(productId: string)`: Get quantity of specific product
- `isInCart(productId: string)`: Check if product is in cart

### 3. UI Store (`useUIStore`)

Located in `src/store/uiStore.ts`

```typescript
import { useUIStore } from '@/store'

// Usage in components
function Header() {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const addNotification = useUIStore((state) => state.addNotification)

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Operation completed successfully!'
    })
  }

  return (
    <header className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </header>
  )
}
```

**Available Actions:**

- `toggleSidebar()` / `openSidebar()` / `closeSidebar()`: Control sidebar
- `setTheme(theme)` / `toggleTheme()`: Theme management
- `setLoading(loading: boolean)`: Global loading state
- `addNotification(notification)`: Add notification
- `removeNotification(id: string)`: Remove notification
- `clearNotifications()`: Clear all notifications

## Best Practices

### 1. Handling SSR/Hydration

Use the `useStoreWithHydration` hook to prevent hydration mismatches:

```typescript
import { useStoreWithHydration } from '@/hooks/useHydration'
import { useCartStore } from '@/store'

function CartButton() {
  // Safe for SSR - provides fallback until hydrated
  const totalItems = useStoreWithHydration(
    () => useCartStore((state) => state.totalItems),
    0 // fallback value
  )

  return <button>Cart ({totalItems})</button>
}
```

### 2. Selector Optimization

Use specific selectors to minimize re-renders:

```typescript
// ❌ Bad - component re-renders on any store change
const store = useCartStore()

// ✅ Good - component only re-renders when totalItems changes
const totalItems = useCartStore((state) => state.totalItems)

// ✅ Good - using a selector function for computed values
const cartSummary = useCartStore((state) => ({
  totalItems: state.totalItems,
  totalPrice: state.totalPrice,
  isEmpty: state.items.length === 0,
}))
```

### 3. Persistence

Stores automatically persist important data to localStorage:

- **Todo Store**: Persists todos
- **Cart Store**: Persists cart items and totals
- **UI Store**: Persists theme and sidebar preferences

### 4. Working with TanStack Query

Sync local state with server state when needed:

```typescript
import { useMutation } from '@tanstack/react-query'
import { useCartStore } from '@/store'

function useCheckout() {
  const clearCart = useCartStore((state) => state.clearCart)

  return useMutation({
    mutationFn: async (cartItems) => {
      // Send cart to server
      return await api.checkout(cartItems)
    },
    onSuccess: () => {
      // Clear local cart after successful checkout
      clearCart()
    },
  })
}
```

## File Structure

```
src/
├── store/
│   ├── index.ts          # Re-exports all stores
│   ├── todoStore.ts      # Todo management
│   ├── cartStore.ts      # Shopping cart
│   └── uiStore.ts        # UI state
├── types/
│   ├── todo.ts           # Todo types
│   ├── cart.ts           # Cart types
│   └── ui.ts             # UI types
├── hooks/
│   └── useHydration.ts   # SSR-safe store usage
└── components/
    ├── TodoComponents.tsx # Todo UI components
    └── CartComponents.tsx # Cart UI components
```

## Migration from Legacy MCP Pattern

The `src/mcp-todos.ts` file serves as a compatibility layer for legacy code. New features should use Zustand stores directly:

```typescript
// ❌ Legacy pattern (still works but deprecated)
import { getTodos, addTodo } from '@/mcp-todos'

// ✅ New pattern (recommended)
import { useTodoStore } from '@/store'
const todos = useTodoStore((state) => state.todos)
const addTodo = useTodoStore((state) => state.addTodo)
```

## Testing Stores

Zustand stores can be easily tested:

```typescript
import { useTodoStore } from '@/store/todoStore'

// Test store actions
test('should add todo', () => {
  const store = useTodoStore.getState()
  store.addTodo('Test todo')

  const todos = useTodoStore.getState().todos
  expect(todos).toHaveLength(2) // includes initial todo
  expect(todos[1].title).toBe('Test todo')
})
```

## Performance Considerations

1. **Selective subscriptions**: Only subscribe to the state you need
2. **Computed values**: Use getter functions for derived state
3. **Persistence**: Only persist essential data
4. **Hydration**: Use hydration hooks for SSR compatibility

## Additional Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React State Management Best Practices](https://react.dev/learn/managing-state)

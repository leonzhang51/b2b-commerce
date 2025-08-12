# State Management Instructions

## Overview

The B2B Commerce application uses Zustand for client-side state management alongside TanStack Query for server state management.

## State Management Architecture

### Client State (Zustand)

- Shopping cart contents and state
- UI state (modals, sidebar, theme preferences)
- User preferences and settings
- Temporary data shared across components
- Todo/task management (demo feature)

### Server State (TanStack Query)

- User authentication and profile data
- Product catalog and inventory
- Order history and transactions
- Category management
- Any data that comes from or syncs with the database

## Available Stores

### 1. Todo Store (`useTodoStore`)

```typescript
import { useTodoStore } from '@/store'

const todos = useTodoStore((state) => state.todos)
const addTodo = useTodoStore((state) => state.addTodo)
```

### 2. Cart Store (`useCartStore`)

```typescript
import { useCartStore } from '@/store'

const cartItems = useCartStore((state) => state.items)
const addItem = useCartStore((state) => state.addItem)
```

### 3. UI Store (`useUIStore`)

```typescript
import { useUIStore } from '@/store'

const theme = useUIStore((state) => state.theme)
const toggleTheme = useUIStore((state) => state.toggleTheme)
```

## Best Practices

### SSR/Hydration Safety

```typescript
import { useStoreWithHydration } from '@/hooks/useHydration'

const totalItems = useStoreWithHydration(
  () => useCartStore((state) => state.totalItems),
  0, // fallback value
)
```

### Selective Subscriptions

```typescript
// ❌ Bad - subscribes to entire store
const store = useCartStore()

// ✅ Good - subscribes only to specific value
const totalItems = useCartStore((state) => state.totalItems)
```

### Working with TanStack Query

```typescript
const checkout = useMutation({
  mutationFn: api.checkout,
  onSuccess: () => {
    useCartStore.getState().clearCart()
  },
})
```

## File Structure

```
src/
├── store/
│   ├── index.ts          # Re-exports
│   ├── todoStore.ts      # Todo management
│   ├── cartStore.ts      # Shopping cart
│   └── uiStore.ts        # UI state
├── types/
│   ├── todo.ts           # Todo types
│   ├── cart.ts           # Cart types
│   └── ui.ts             # UI types
└── hooks/
    └── useHydration.ts   # SSR-safe hooks
```

## When to Use Each Pattern

### Use Zustand When:

- State needs to be shared across multiple components
- State should persist across page navigation
- You need optimistic updates before server sync
- Managing UI state (modals, forms, preferences)

### Use TanStack Query When:

- Fetching data from APIs or Supabase
- Caching server responses
- Background refetching and synchronization
- Server state mutations

### Use React State When:

- Local component state only
- Form inputs and validation
- Temporary UI state that doesn't need sharing

## Migration Notes

The legacy `src/mcp-todos.ts` file has been updated to use Zustand internally while maintaining backward compatibility. New features should use Zustand stores directly.

---
applyTo: '**/*.js,**/*.jsx,**/*.ts,**/*.tsx,**/*.json,**/*.md'
---

# TanStack React SPA Copilot Instructions (now MVP-oriented)

> This project follows the latest TanStack ecosystem for React SPA development. See [tanstack.com](https://tanstack.com/) for updates.

**Stack**: React 19 (SPA, no Next.js), TypeScript (strict), TanStack (Query, Table, Virtual, Router, Form, Devtools), Tailwind CSS v4, Radix UI

## 🎯 Code Generation Priorities

1. **TypeScript-first**: Always use TypeScript with strict mode enabled
2. **Server-first**: Default to React Server Components (RSC) unless client interactivity is needed
3. **Performance-first**: Optimize for Core Web Vitals and bundle size
4. **Accessibility-first**: Use semantic HTML and ARIA best practices

src/

## 📁 Project Structure (MVP)

This repository follows Model-View-Presenter (MVP) patterns layered on top of the existing TanStack stack. Map the current directories to MVP responsibilities:

```
src/
├── presenters/       # Presenters: orchestrate view logic, call use-cases, mediate between Model and View
├── views/            # Views: presentational React components (stateless where possible)
├── models/           # Models: data types, persistence adapters (DB access, API clients)
├── usecases/         # Application business logic (interactors/service layer)
├── components/       # Shared UI atoms/molecules (can be used by Views)
├── lib/              # Utilities and infra (supabase client, feature flags)
├── hooks/            # Custom React hooks (only view-focused hooks)
├── types/            # TypeScript types
└── __tests__/        # Tests (unit + integration)
```

**Import Alias**: Use `@/*` for all imports from `src/` directory.

## ⚛️ React & TanStack Patterns

### Component & Type Reuse Guidelines

- When defining a new type or interface in a component, first evaluate if the type is only relevant to that component or if it could be reused by other components.
- If the type is reusable, define it in the `src/types/` folder for easy reuse and import it where needed.
- Before creating a new type, always check the `src/types/` folder for an existing type that can be reused or extended.
- Only define types locally in a component if they are truly component-specific and not shared elsewhere.

### Component Architecture

```typescript
// ✅ Functional components with explicit props
interface ComponentProps {
  readonly children: React.ReactNode
  readonly title: string
  readonly onAction?: () => void
}

export function Component({ children, title, onAction }: ComponentProps) {
  // Component logic here
}
```

### Model-View-Presenter pattern guidance

High-level rules:

- Views are pure presentational React components. They receive props and emit user events via callbacks. No data fetching or side effects in Views.
- Presenters are the glue: they implement UI state, call use-cases, adapt Model data for Views, and subscribe to stores. Presenters can be React components or custom hooks named `useXPresenter`.
- Use-cases (interactors) hold business logic and orchestration (e.g., `CheckoutUseCase`, `CartUseCase`). They are pure classes/functions, testable without React.
- Models encapsulate data access (Supabase/REST) and expose repository-style interfaces (e.g., `ProductsRepository`, `OrdersRepository`). Models are the only code that imports `@supabase/supabase-js`.

Example flow:

View -> Presenter -> Use-case -> Model -> DB/External

This keeps UI code thin and puts business rules in testable, framework-agnostic modules.

#### ❌ Bad Pattern - Direct Supabase Access

```typescript
function RegisterForm() {
  const supabase = useSupabase()

  const handleSubmit = async (data) => {
    // ❌ Business logic in component
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    // ❌ Complex error handling in component
  }
}
```

#### ✅ Good Pattern - Custom Hook for Business Logic

```typescript
// Custom hook handles all business logic
function useRegisterUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // All Supabase operations in hook
      const supabase = useSupabase()
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error, success }
}

// Component only handles UI and calls hook
function RegisterForm() {
  const { register, loading, error, success } = useRegisterUser()

  const handleSubmit = async (data) => {
    await register(data) // Simple delegation to hook
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Success!</div>}
      <button disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

#### Presenter / Use-case / Model responsibilities

- Presenters: `src/presenters/` or `src/hooks/presenters/`. Minimal side-effects; call use-cases. Example export `useProductListPresenter()`.
- Use-cases: `src/usecases/`. Expose small methods for interactive flows. Keep side-effects encapsulated here.
- Models/Repositories: `src/models/` or `src/lib/repositories`. Single responsibility: data access. Examples: `ProductsRepository`, `OrdersRepository`.

Contracts:

- Use-cases accept plain data objects and return results or throw errors; use `Result<T, E>` style where helpful.
- Repositories expose async methods like `findProductByAsin(asin: string): Promise<Product | null>`.

Testing:

- Unit test use-cases in isolation with mocked repositories.
- Test presenters by rendering Views with mocked use-cases or by testing `useXPresenter` hooks.

### Data Fetching & State Management Patterns

#### Server State (TanStack Query)

Use for data that comes from or syncs with APIs/Supabase:

```typescript
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// ✅ Fetch data with TanStack Query
function useUserData(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })
}

// ✅ Mutations
function useUpdateUser() {
  return useMutation({
    mutationFn: async (user: User) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      })
      if (!res.ok) throw new Error('Failed to update user')
      return res.json()
    },
  })
}
```

#### Client State (Zustand)

Use for shared application state (cart, UI state, preferences):

```typescript
import { useCartStore, useUIStore } from '@/store'

// ✅ Using Zustand stores
function CartButton() {
  const totalItems = useCartStore((state) => state.totalItems)
  const addItem = useCartStore((state) => state.addItem)

  return <button>Cart ({totalItems})</button>
}

// ✅ SSR-safe store usage
import { useStoreWithHydration } from '@/hooks/useHydration'

function SafeCartButton() {
  const totalItems = useStoreWithHydration(
    () => useCartStore((state) => state.totalItems),
    0 // fallback value
  )

  return <button>Cart ({totalItems})</button>
}
```

#### Available Stores:

- `useTodoStore`: Todo/task management
- `useCartStore`: Shopping cart state
- `useUIStore`: UI state (theme, sidebar, notifications)

#### Local State (React)

Use for component-specific state only:

```typescript
function Component() {
  const [localValue, setLocalValue] = useState('')
  // ...
}
```

### Navigation

- Use [TanStack Router](https://tanstack.com/router) for SPA routing.
- Use `<Link />` from TanStack Router for navigation.

## 🧾 Forms

- Use [TanStack Form](https://tanstack.com/form) for type-safe, performant forms.

## 🛠️ Devtools

- Use [TanStack Devtools](https://tanstack.com/devtools) for debugging Query, Router, Table, and Form state.

## 🎨 Styling Guidelines

### Table & Virtualization

- Use [TanStack Table](https://tanstack.com/table) for all tabular data and datagrids. Compose with [TanStack Virtual](https://tanstack.com/virtual) for large datasets.

### Tailwind CSS v4

- **Utility-first**: Use Tailwind classes directly in components
- **Mobile-first**: Start with base styles, add responsive variants
- **Class composition**: Use `clsx` or `tailwind-merge` for conditional classes

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...classes: (string | undefined)[]) => twMerge(clsx(classes));

// Usage
<div
  className={cn(
    "base-classes",
    variant === "primary" && "primary-classes",
    className,
  )}
/>;
```

### Component Styling

```typescript
// ✅ Preferred: Inline utility classes
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors">
  Click me
</button>

// ✅ When needed: CSS variables in globals.css
:root {
  --color-primary: theme(colors.blue.500);
}
```

## 🧩 UI Components

### Radix UI Integration

```typescript
// ✅ Create composed components with Radix primitives
import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  readonly children: React.ReactNode;
  readonly trigger: React.ReactNode;
}

export function Modal({ children, trigger, ...props }: ModalProps) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## 📝 TypeScript Best Practices

### Naming Conventions

```typescript
// ✅ Components: PascalCase
export function UserProfile() {}
export function Modal() {}

// ✅ Hooks: camelCase starting with 'use'
export function useLocalStorage() {}
export function useApi() {}

// ✅ Custom hooks for component logic
export function useUserProfile(userId: string) {}
export function useToggle(initialValue: boolean = false) {}

// ✅ Utilities: camelCase
export function formatCurrency() {}
export function debounce() {}

// ✅ Async functions: suffix with 'Async'
export async function fetchUserDataAsync(id: string) {}
export async function saveUserAsync(user: User) {}

// ✅ Constants: SCREAMING_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com'
export const MAX_RETRY_ATTEMPTS = 3
```

### Type Definitions

```typescript
// ✅ Use interface for object shapes and component props
interface UserProfile {
  readonly id: string
  readonly name: string
  readonly email: string
}

// ✅ Use type for unions and computed types
type Status = 'idle' | 'loading' | 'success' | 'error'
type UserWithStatus = UserProfile & { status: Status }

// ✅ Use const assertions for immutable data
const STATUSES = ['idle', 'loading', 'success', 'error'] as const
type Status = (typeof STATUSES)[number]

// ✅ Prefer immutable data structures
interface AppState {
  readonly users: readonly User[]
  readonly currentUser: User | null
  readonly settings: Readonly<{
    theme: 'light' | 'dark'
    language: string
  }>
}
```

### Props and Component Types

```typescript
// ✅ Explicit props interface with readonly properties
interface ButtonProps {
  readonly children: React.ReactNode
  readonly variant?: 'primary' | 'secondary'
  readonly disabled?: boolean
  readonly onClick?: () => void
}

// ✅ Extend HTML props when needed
interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  readonly label: string
  readonly onChange: (value: string) => void
}
```

## 🚀 Performance Optimization

### Image Optimization

```typescript
// ✅ Use SVGs directly for icons and illustrations
<img src="/icon.svg" alt="Icon" className="w-6 h-6" />
```

### Bundle Optimization

```typescript
// ✅ Dynamic imports for heavy components
const HeavyComponent = lazy(() => import("@/components/HeavyComponent"));

// ✅ Lazy load with Suspense
<Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}>
  <HeavyComponent />
</Suspense>;
```

## 🌐 API Layer

- Use REST endpoints or your preferred backend (Node.js, Express, tRPC, etc.)
- Use TanStack Query for all data fetching and mutations.

## 🎮 Three.js Integration

### Client-Only WebGL Components

```typescript
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WebGLScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === "undefined") return;

    // Three.js initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer();

    // Cleanup function
    return () => {
      renderer.dispose();
      // Clean up geometries, materials, textures
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full">
      <noscript>
        <p>This component requires JavaScript to display 3D content.</p>
      </noscript>
    </div>
  );
}
```

## 🧪 Testing Patterns

### Component Testing

```typescript
// src/__tests__/Button.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "@/components/Button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", async () => {
    const asyncHandler = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(
      <Button onClick={asyncHandler} loading>
        Click me
      </Button>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### Mock Heavy Dependencies (ESM Modules)

```typescript
// For Three.js components (ESM module)
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn(), remove: jest.fn() })),
  WebGLRenderer: jest.fn(() => ({
    render: jest.fn(),
    dispose: jest.fn(),
    setSize: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(),
}))

// For three/examples (handled by transformIgnorePatterns in jest.config.js)
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn(() => ({
    enableDamping: true,
    update: jest.fn(),
    dispose: jest.fn(),
  })),
}))
```

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useToggle } from '@/hooks/useToggle'

describe('useToggle', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current[0]).toBe(false)
  })

  it('toggles value when called', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current[1]() // toggle function
    })

    expect(result.current[0]).toBe(true)
  })
})
```

## ♿ Accessibility Guidelines

### Semantic HTML

```typescript
// ✅ Use semantic elements
<main>
  <section aria-labelledby="products-heading">
    <h2 id="products-heading">Our Products</h2>
    {/* Content */}
  </section>
</main>

// ✅ Proper form accessibility
<form>
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    required
    aria-describedby="email-error"
    className="block w-full"
  />
  <p id="email-error" className="text-red-500 text-sm">
    {error}
  </p>
</form>
```

## 📦 State Management

```typescript
// ✅ Use React state for simple cases
const [state, setState] = useState(initialState)

// ✅ Use useReducer for complex state
const [state, dispatch] = useReducer(reducer, initialState)

// ✅ For server state, consider using built-in fetch with caching
const data = await fetch('/api/data', {
  next: { revalidate: 60 },
})
```

## 📐 Style & Code Standards

### Formatting

- **Code formatting**: Enforced with Prettier
- **Style guide**: Follow the AirBnB JavaScript/TypeScript Style Guide for higher-level conventions not covered by Prettier
- **Functional programming**: Use functional programming principles where possible
- **Immutability**: Prefer immutable data (`const`, `readonly`, `as const`)
- **Modern JavaScript**: Use optional chaining (`?.`) and nullish coalescing (`??`) operators

### Component Guidelines

- **Functional components**: Use functional components with hooks only
- **Hook rules**: Follow the React hooks rules (no conditional hooks)
- **Component props**: Prefer explicit `children: React.ReactNode` in props over `React.FC`
- **Component size**: Keep components small and focused
- **Styling**: Use Tailwind utility classes; use CSS modules only if necessary

## 🔧 Development Workflow

### Code Quality & Configuration

- **ESLint**: Uses Flat config (`eslint.config.js`) with Next.js and TypeScript rules
- **Prettier**: Auto-formatting via lint-staged (see `.prettierrc` for custom rules)
- **TypeScript**: Strict mode enabled in `tsconfig.json`
- **Tests**: Jest + Testing Library for unit tests

### Jest Configuration for ESM Modules

```javascript
// jest.config.js - Handle ESM-only packages like three/examples
module.exports = {
  transformIgnorePatterns: ['node_modules/(?!(three/examples)/)'],
  // Other Jest config...
}
```

### Editor Setup (VSCode)

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Git Hooks

- **Pre-commit**: ESLint + Prettier via Husky + lint-staged
- **Quality gates**: All code must pass lint and format checks before commit
- **Type checking**: Ensure all code passes TypeScript compilation

## ✅ Code Review Checklist

- [ ] Code passes Prettier and ESLint with no errors or warnings
- [ ] No re-implementation of common utilities—prefer well-known libraries
- [ ] No magic numbers or raw strings—use constants or enums
- [ ] All async methods are suffixed with `Async`
- [ ] Error handling uses try/catch/finally where appropriate
- [ ] Unit tests are present and follow Arrange/Act/Assert pattern
- [ ] No secrets or credentials in code
- [ ] Logging is minimal and uses appropriate levels
- [ ] TypeScript code compiles without errors
- [ ] Loading and error states are properly handled
- [ ] Accessibility requirements are met (semantic HTML, ARIA labels)
- [ ] Performance considerations addressed (lazy loading, memoization)

## 🚨 Common Anti-Patterns to Avoid

- ❌ Don't use Next.js-specific APIs (getServerSideProps, getStaticProps, etc.)
- ❌ Don't use `any` type; use `unknown` or proper types
- ❌ Don't use `React.FC` type; prefer explicit props interfaces
- ❌ Don't use `div` when semantic HTML exists (`button`, `main`, `section`, etc.)
- ❌ Don't forget to handle loading and error states (see examples above)
- ❌ Don't skip TypeScript prop interfaces
- ❌ Don't use inconsistent naming conventions (follow the patterns above)
- ❌ Don't forget cleanup functions in useEffect for subscriptions/timers
- ❌ Don't test implementation details; test behavior and user interactions
- ❌ Don't mutate props or state directly; use immutable patterns

---

**Remember**: Always prioritize user experience, performance, and accessibility in your code generation. When in doubt, choose the more explicit, type-safe approach.

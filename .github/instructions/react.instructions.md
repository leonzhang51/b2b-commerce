# React Component Guidelines

## Component Structure

- Use functional components with explicit props interfaces (no `React.FC`).
- Always type props as `readonly`.
- Keep components small and focused; prefer composition over inheritance.
- Use hooks for state and side effects; follow the rules of hooks.
- Prefer colocating component logic, styles, and tests.

## Separation of Concerns

- **Components should focus only on UI rendering and user interactions**.
- **Never access Supabase directly in components** - use custom hooks instead.
- Extract data fetching, business logic, and side effects into custom hooks.
- Custom hooks should handle loading states, error handling, and success states.
- Components should receive data and callbacks from hooks, not implement business logic.

### Example Pattern:

```tsx
// ❌ Bad: Direct Supabase access in component
function LoginForm() {
  const handleSubmit = async (email, password) => {
    const supabase = useSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    // ... handle error
  }
}

// ✅ Good: Use custom hook for business logic
function LoginForm() {
  const { login, loading, error } = useAuth()

  const handleSubmit = async (email, password) => {
    await login(email, password)
  }
}
```

## Naming

- Components: PascalCase (e.g., `ProductCard`)
- Hooks: camelCase, start with `use` (e.g., `useProductList`)
- Props: camelCase

## Props

- Use explicit interfaces for props.
- Prefer `children: React.ReactNode` for composability.
- Extend HTML props when needed (e.g., `extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

## State & Effects

- Use `useState` for simple state, `useReducer` for complex state.
- Clean up side effects in `useEffect`.
- Avoid unnecessary re-renders with `React.memo` and `useCallback`.

## Custom Hooks Pattern

Custom hooks should:

- Return consistent interface: `{ action, loading, error, success }`
- Handle all async operations and state management
- Provide clear function names for actions (e.g., `register`, `resetPassword`)
- Include comprehensive error handling
- Reset state appropriately between operations

Example:

```tsx
interface UseRegisterUser {
  register: (data: RegisterInput) => Promise<void>
  loading: boolean
  error: string | null
  success: boolean
}

export function useRegisterUser(): UseRegisterUser {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Business logic here
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error, success }
}
```

## Accessibility

- Use semantic HTML elements.
- Add ARIA attributes where appropriate.
- Ensure keyboard navigation and focus management.

## Styling

- Use Tailwind CSS utility classes.
- Use `clsx` or `tailwind-merge` for conditional classes.
- Avoid inline styles except for dynamic values.

## Testing

- Use React Testing Library for component tests.
- Test user interactions and behavior, not implementation details.
- **Mock custom hooks using mutable mock state objects** for better test control.
- Focus component tests on UI rendering and user interactions.
- Test business logic separately in hook-specific tests.

### Example Hook Testing Pattern:

```tsx
// Create mutable mock state that tests can modify
const mockHookState = {
  loading: false,
  error: null as string | null,
  success: false,
}

const mockAction = vi.fn()

vi.mock('@/hooks/useCustomHook', () => ({
  useCustomHook: () => ({
    action: mockAction,
    loading: mockHookState.loading,
    error: mockHookState.error,
    success: mockHookState.success,
  }),
}))

beforeEach(() => {
  // Reset to defaults
  mockHookState.loading = false
  mockHookState.error = null
  mockHookState.success = false
  vi.resetAllMocks()
})

it('shows loading state', () => {
  mockHookState.loading = true
  render(<Component />)
  expect(screen.getByText(/loading.../i)).toBeInTheDocument()
})
```

## Performance

- Lazy load heavy components with `React.lazy` and `Suspense`.
- Memoize expensive calculations and components.

## Example

```tsx
interface ButtonProps {
  readonly children: React.ReactNode
  readonly onClick?: () => void
  readonly disabled?: boolean
}

export function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

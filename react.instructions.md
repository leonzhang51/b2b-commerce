# React Component Guidelines

## Component Structure

- Use functional components with explicit props interfaces (no `React.FC`).
- Always type props as `readonly`.
- Keep components small and focused; prefer composition over inheritance.
- Use hooks for state and side effects; follow the rules of hooks.
- Prefer colocating component logic, styles, and tests.

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

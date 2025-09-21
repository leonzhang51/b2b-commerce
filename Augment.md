# Augment Code Instructions for This Repository

Purpose: Help Augment Code (the agent) understand this codebase and generate safe, idiomatic changes.

Stack: React 19 (SPA, no Next.js), TypeScript (strict), TanStack (Query, Table, Virtual, Router, Form, Devtools), Tailwind CSS v4, Radix UI

Import alias: Use `@/*` for imports from `src/`.

## Project Structure (MVP)

This repository follows a Model-View-Presenter (MVP) layering atop the TanStack ecosystem.

src/

- presenters/ — Presenters orchestrate view logic, call use-cases, mediate between Model and View
- views/ — Presentational React components (stateless where possible). No data fetching/side effects
- models/ — Data types and persistence adapters (DB access, API clients)
- usecases/ — Application business logic (interactors/service layer)
- components/ — Shared UI atoms/molecules used by Views
- lib/ — Utilities and infra (e.g., clients, feature flags)
- hooks/ — Custom React hooks (only view-focused and presenter hooks)
- types/ — Shared TypeScript types
- **tests**/ — Unit and integration tests

Rule of thumb data flow:

View -> Presenter -> Use-case -> Model -> External (API/DB)

## Code Generation Priorities

1. TypeScript-first: strict typing; avoid `any`
2. Performance-first: Core Web Vitals and bundle size
3. Accessibility-first: semantic HTML + ARIA
4. Architecture-first: MVP layering and TanStack patterns

## React & Architecture

Views (src/views):

- Pure presentational components; receive props, emit callbacks
- No data fetching, no direct repository/supabase imports

Presenters (src/presenters or presenter hooks in src/hooks):

- Implement UI state, call use-cases, adapt model data for views
- Export components or hooks like `useXPresenter()`

Use-cases (src/usecases):

- Business logic and orchestration
- Accept plain data objects, return results or throw; consider Result<T, E> patterns

Models/Repositories (src/models or src/lib/repositories):

- Single responsibility: data access (Supabase/REST/etc.)
- Only layer that imports external data clients

Types (src/types):

- Shared, reusable TypeScript types and interfaces

Import alias:

- Use `@/*` for all imports from `src/` to keep paths stable during refactors

## TypeScript Best Practices

Naming:

- Components: PascalCase (e.g., `UserProfile`)
- Hooks: camelCase starting with `use` (e.g., `useToggle`)
- Utilities: camelCase (e.g., `formatCurrency`)
- Async functions: suffix with `Async`
- Constants: SCREAMING_SNAKE_CASE

Types:

- Prefer `interface` for object shapes and component props
- Prefer `type` for unions and computed types
- Prefer immutable data: `readonly`, `as const`, Readonly<>

Props:

- Explicit props interfaces with `readonly` fields
- Extend DOM props via Omit when needed

## Data Fetching & State Management

Server state — TanStack Query:

- Use `useQuery` for reads and `useMutation` for writes
- Always specify stable `queryKey`; throw on non-OK responses

Client/app state — Zustand:

- Use app-level stores for cross-cutting UI/cart/preferences
- For SSR-safety, prefer hydration helpers when applicable

Local state — React:

- Use component state only for component-local concerns

## Navigation

- Use TanStack Router for SPA routing
- Use `<Link />` from TanStack Router for navigation

## Styling

Tailwind CSS v4:

- Utility-first, mobile-first
- Compose with `clsx` and `tailwind-merge` as needed

Radix UI:

- Compose accessible components from Radix primitives

Component styling:

- Prefer inline utility classes
- Use CSS variables in globals only when necessary

## Performance

- Prefer dynamic imports for heavy components and third-party packages
- Use React.lazy and Suspense for code-splitting
- Optimize images and prefer SVGs for icons/illustrations

## Accessibility

- Use semantic HTML elements (main, section, button, etc.)
- Proper labels/ids for form controls; meaningful alt text
- Manage focus and keyboard interactions for interactive components

## Testing

- Testing stack: Jest + Testing Library (if present)
- Unit test use-cases with mocked repositories
- Test presenters by rendering views with mocked use-cases or via `useXPresenter` hooks
- When mocking ESM-only packages (e.g., three/examples), ensure Jest config handles transforms

Patterns:

- Arrange/Act/Assert
- Prefer behavior tests over implementation details
- Mock heavy dependencies; assert visible/user-facing outcomes

## Dev Workflow & Quality Gates

- ESLint (flat config) and Prettier for formatting and linting
- TypeScript strict mode enabled
- Git hooks (if configured): lint + format + typecheck before commit
- Editor settings (VSCode): formatOnSave, eslint fixAll on save

## Code Review Checklist

- [ ] Passes ESLint and Prettier (no errors/warnings)
- [ ] No reinvention of common utilities; use well-known libs where appropriate
- [ ] No magic numbers/strings; use constants/enums
- [ ] Async methods suffixed with `Async`
- [ ] Error handling with try/catch/finally where appropriate
- [ ] Unit/integration tests updated/added; follow AAA pattern
- [ ] No secrets/credentials in code
- [ ] Logging is minimal and uses appropriate levels
- [ ] TypeScript compiles with no errors
- [ ] Loading and error states handled explicitly
- [ ] Accessibility (semantic HTML, ARIA, keyboard)
- [ ] Performance (lazy loading, memoization, stable keys)

## Anti-Patterns to Avoid

- Using Next.js-specific APIs (not a Next.js app)
- Using `any` instead of proper types (prefer `unknown` if needed)
- Using `React.FC`; prefer explicit props interfaces and named functions
- Using generic `div` where semantic elements exist
- Skipping loading/error states
- Inconsistent naming conventions
- Forgetting cleanup in effects for subscriptions/timers
- Testing implementation details instead of behavior
- Mutating props or state directly; avoid in-place mutations
- Accessing external data (e.g., Supabase) directly in Views or Presenters; restrict to Models/Use-cases

## Placement & Refactor Guidelines (for Augment Code)

When adding or editing code, follow these rules:

- Place code in the correct layer:
  - View logic/UI -> src/views or src/components
  - Presenter logic -> src/presenters or presenter hooks under src/hooks
  - Business logic -> src/usecases
  - Data access -> src/models or src/lib/repositories
  - Shared types -> src/types
  - Utilities/infra -> src/lib

- Prefer minimal, surgical edits; avoid large refactors unless required
- Reuse existing patterns/types; add to src/types for shared/reusable types
- Keep public function signatures small and explicit; avoid leaky abstractions
- Preserve API/backward compatibility unless explicitly changing behavior
- Add/adjust tests alongside code changes; cover success, error, and edge cases
- Maintain strict TypeScript; eliminate `any`
- Use the `@/*` import alias consistently

## Safe Execution & Automation Notes (for Augment Code)

- Use existing package manager scripts to run tests/linters/builds
- If unsure about scripts, inspect package.json before running
- Avoid installing/removing dependencies without explicit user permission
- Prefer smallest verification runs first: single test file -> package tests -> full suite
- Consider success only with exit code 0 and clean logs; iterate on failures with minimal fixes

## Quick Snippets

Type-safe component props:

- Components should define explicit props with readonly fields and clear handlers
- Hooks should start with `use` and return stable references when possible

Presenter signature example (conceptual):

- `export function useProductListPresenter(params): { data, isLoading, onSelect }`

Repository method example (conceptual):

- `findProductByAsin(asin: string): Promise<Product | null>`

---

Remember: Prioritize user experience, performance, and accessibility. Choose explicit, type-safe designs. Follow MVP layering and TanStack patterns to keep UI thin and business logic testable.

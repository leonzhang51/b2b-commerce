# TypeScript Coding Conventions

## General

- Always use `strict` mode.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `readonly` for props and immutable data.
- Avoid `any`; use `unknown` or proper types.
- Use PascalCase for types/interfaces, camelCase for variables/functions.

## Functions

- Use explicit return types for all exported functions.
- Suffix async functions with `Async`.
- Prefer arrow functions for inline callbacks.

## Imports

- Use absolute imports with `@/` alias for `src/`.
- Group imports: external, then internal, then styles.

## Enums & Constants

- Use `as const` for literal unions.
- Use SCREAMING_SNAKE_CASE for constants.

## Example

```ts
interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export const API_BASE_URL = 'https://api.example.com'
```

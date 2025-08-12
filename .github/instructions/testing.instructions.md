# Testing Best Practices

## General Principles

- Write tests for all business logic, components, and API endpoints.
- Use Arrange/Act/Assert pattern in all tests.
- Prefer behavior-driven tests over implementation details.

## Unit Testing

- Use Jest for unit tests.
- Mock dependencies and isolate units.
- Test edge cases and error handling.

## Component Testing

- Use React Testing Library for UI components.
- Test user interactions, accessibility, and state changes.
- Avoid testing internal implementation details.

## Integration Testing

- Test interactions between modules (e.g., API + DB).
- Use test databases or mocks for external services.

## End-to-End (E2E) Testing

- Use Playwright or Cypress for E2E tests.
- Test critical user flows and edge cases.

## Coverage

- Aim for high coverage, but prioritize meaningful tests over 100% coverage.

## Continuous Integration

- Run tests on every pull request and before deployment.
- Fail builds on test failures.

## Example

```ts
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

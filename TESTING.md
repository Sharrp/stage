# Testing Documentation

## Test Infrastructure

This project uses [Vitest](https://vitest.dev/) with React Testing Library for testing.

### Test Stack

- **Vitest** - Fast unit test framework with TypeScript support
- **React Testing Library** - Testing library for React components
- **jsdom** - Browser environment simulation
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Files

### Component Tests
- `app/page.test.tsx` - Homepage component tests
  - Renders without crashing
  - Displays correct content
  - Applies correct styling
  - Has accessible heading structure

### API Tests
- `app/api/health/route.test.ts` - Health check endpoint tests
  - Returns 200 status code
  - Returns valid JSON structure
  - Includes timestamp and uptime
  - Validates response format

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### API Route Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('API Route', () => {
  it('returns correct response', async () => {
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('result')
  })
})
```

## Test Coverage

Current test coverage:
- ✓ 2 test files
- ✓ 9 tests passing
- ✓ 100% of existing components tested

## CI/CD Integration

Tests should be run as part of your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what users see and do
2. **Use accessible queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep tests simple** - One assertion per test when possible
4. **Mock external dependencies** - Use `vi.mock()` for API calls, etc.
5. **Test edge cases** - Empty states, errors, loading states

# Socialise App - Comprehensive Test Guide

This guide covers the complete test suite for the Socialise App, including setup, running tests, writing new tests, and best practices.

---

## Quick Start

### 1. Install Test Dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### 2. Install Backend Test Dependencies

```bash
cd server
npm install --save-dev vitest supertest
cd ..
```

### 3. Update package.json Scripts

Add these scripts to `/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:frontend": "vitest --run src/",
    "test:backend": "vitest --run server/"
  }
}
```

Add these scripts to `/server/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

### 4. Run Tests

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run only frontend tests
npm run test:frontend

# Run only backend tests
npm run test:backend
```

---

## Test Structure

### Generated Test Files

#### Frontend Tests

1. **`src/api.test.js`** - API client tests
   - Auth endpoints (login, register, getMe)
   - Event CRUD operations
   - Community operations
   - Feed operations
   - User profile operations
   - Chat message operations

2. **`src/components/AuthScreen.test.jsx`** - Auth component tests
   - Login/register form validation
   - Form submission
   - Error handling
   - Testimonial carousel
   - Input trimming
   - Loading states

3. **`src/components/EventCard.test.jsx`** - Event card component tests
   - Event data display
   - Micro-meet badge and scoring
   - User interactions (join/save)
   - Price and capacity display
   - Category variants
   - Accessibility features

#### Backend Tests

1. **`server/routes/auth.test.js`** - Auth route utilities
   - User data transformation (toPublicUser)
   - JWT authentication middleware
   - User ID extraction
   - Password hashing and validation
   - Email validation
   - Rate limiting configuration

2. **`server/matching.test.js`** - Micro-meet matching algorithm
   - Match score calculation
   - Interest matching
   - Location proximity
   - Group size preferences
   - Price compatibility
   - Event filtering and sorting
   - Edge cases and error handling

---

## Test Coverage

### Target Coverage

```
Frontend:
  - api.js: 85%+
  - Components: 70%+
  - Utility functions: 90%+

Backend:
  - Auth routes: 80%+
  - Matching algorithm: 90%+
  - Business logic: 85%+
```

### Current Coverage

Run `npm run test:coverage` to generate a coverage report.

---

## Testing Conventions

### Frontend (React Components)

#### Setup

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<Component />);
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });
});
```

#### Key Patterns

**User Interactions:**
```javascript
const user = userEvent.setup({ delay: null });
await user.click(element);
await user.type(input, 'text');
```

**Async Operations:**
```javascript
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

**Mocking Modules:**
```javascript
vi.mock('module-name', () => ({
  exportName: vi.fn(),
}));
```

**localStorage:**
```javascript
localStorage.setItem('key', 'value');
expect(localStorage.getItem('key')).toBe('value');
localStorage.clear();
```

### Backend (Node.js / Express)

#### Setup

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('auth.js utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hash password', async () => {
    const hash = await bcrypt.hash('password', 10);
    const match = await bcrypt.compare('password', hash);
    expect(match).toBe(true);
  });
});
```

#### Key Patterns

**JWT Verification:**
```javascript
const token = jwt.sign({ id: '123' }, SECRET_KEY);
const decoded = jwt.verify(token, SECRET_KEY);
expect(decoded.id).toBe('123');
```

**Mocking Supabase:**
```javascript
vi.mock('../supabase', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));
```

---

## Writing New Tests

### Step 1: Create Test File

Place test files next to the source file:

```
src/
  components/
    MyComponent.jsx
    MyComponent.test.jsx      ← Test file
```

### Step 2: Import Testing Utilities

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Step 3: Structure Tests

```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('Feature area', () => {
    it('should do something', () => {
      // Arrange
      const component = render(<Component />);

      // Act
      fireEvent.click(element);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Step 4: Run Tests

```bash
npm test -- MyComponent.test.jsx
npm run test:watch -- MyComponent.test.jsx
```

---

## Common Testing Scenarios

### Testing API Calls

```javascript
it('should fetch data', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify({ data: 'test' }),
  });

  const result = await api.getData();
  expect(result.data).toBe('test');
});
```

### Testing Form Submission

```javascript
it('should submit form', async () => {
  const user = userEvent.setup({ delay: null });
  render(<LoginForm onSubmit={mockFn} />);

  await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
  await user.type(screen.getByPlaceholderText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(mockFn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testing Conditional Rendering

```javascript
it('should show content when condition is true', () => {
  render(<Component showContent={true} />);
  expect(screen.getByText(/content/i)).toBeInTheDocument();
});

it('should hide content when condition is false', () => {
  render(<Component showContent={false} />);
  expect(screen.queryByText(/content/i)).not.toBeInTheDocument();
});
```

### Testing Error Handling

```javascript
it('should display error message', async () => {
  const mockFn = vi.fn().mockRejectedValueOnce(
    new Error('Network error')
  );

  render(<Component onAction={mockFn} />);
  await user.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});
```

---

## Debugging Tests

### Print Component Tree

```javascript
const { debug } = render(<Component />);
debug();
```

### Log Screen Queries

```javascript
screen.debug(); // Print all elements
screen.logTestingPlaygroundURL(); // Get Testing Library URL
```

### Use test.only

```javascript
it.only('this test runs alone', () => {
  // Only this test runs
});
```

### Use test.skip

```javascript
it.skip('skip this test', () => {
  // This test is skipped
});
```

---

## Best Practices

### Do's

- ✅ Test user behavior, not implementation details
- ✅ Use semantic queries: `getByRole`, `getByLabelText`, `getByPlaceholderText`
- ✅ Write descriptive test names that explain the behavior
- ✅ Mock external dependencies (APIs, localStorage)
- ✅ Use `waitFor` for async operations
- ✅ Test error paths and edge cases
- ✅ Keep tests focused and isolated
- ✅ Use `beforeEach` to avoid repetition

### Don'ts

- ❌ Test implementation details (internal state)
- ❌ Use `getByTestId` unless necessary
- ❌ Create deep test hierarchies
- ❌ Mock too aggressively (test real behavior when possible)
- ❌ Write overlapping tests
- ❌ Make tests dependent on each other
- ❌ Test unrelated concerns in one test

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm install
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Troubleshooting

### Common Issues

**Issue:** `Cannot find module '@testing-library/react'`
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Issue:** `localStorage is not defined`
```javascript
// Already mocked in src/test/setup.js
// Make sure vitest.config.js includes setupFiles
```

**Issue:** `Framer Motion animations slow down tests`
```javascript
vi.mock('framer-motion', () => ({
  motion: { div: ({ children }) => <div>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));
```

**Issue:** `fetch is not defined in backend tests`
```javascript
// Vitest automatically provides fetch in jsdom environment
// For backend tests without jsdom, use 'node' environment
```

---

## Test Metrics and Goals

### Current State

- **Frontend Components:** ~3 test files covering critical auth and event flows
- **Backend Routes:** ~2 test files covering auth and matching algorithm
- **API Client:** Comprehensive fetch wrapper testing

### Roadmap

1. **Phase 1 (Priority):** Test auth flow, event creation, event joining
2. **Phase 2:** Test community operations, feed interactions
3. **Phase 3:** Test user profile, recommendations
4. **Phase 4:** E2E tests with Playwright

### Coverage Goals

```
Phase 1: 40% overall coverage
Phase 2: 60% overall coverage
Phase 3: 75% overall coverage
Phase 4: 85%+ overall coverage with E2E
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Support

For test-related questions or issues:

1. Check the test files for examples
2. Review the Testing Library docs
3. Run `npm run test:ui` for interactive debugging
4. Check console output for helpful error messages

---

**Last Updated:** February 21, 2025
**Test Suite Version:** 1.0.0

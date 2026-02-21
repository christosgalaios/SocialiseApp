---
name: gen-test
description: Generate unit tests for React components and Express routes
disable-model-invocation: false
context: fork
---

# Test Generator for Socialise

Generates comprehensive unit tests for React components and Express routes, following the project conventions.

## Usage

### For React Components
```
/gen-test src/components/EventCard.jsx
```

### For Express Routes
```
/gen-test server/routes/events.js
```

### For Backend Middleware/Utils
```
/gen-test server/matching.js
```

## Testing Framework

- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest or Vitest
- **Coverage**: Aim for 80%+ coverage on new code

## Conventions to Follow

1. **File naming**: `{FileName}.test.jsx` or `{fileName}.test.js`
2. **Test placement**: Same directory as source file
3. **Component tests**: Focus on user interactions and rendered output
4. **Route tests**: Test request/response handling, auth, error cases
5. **Mock patterns**:
   - Mock API calls with `vi.mock()`
   - Mock `useLocalStorage` for state tests
   - Mock Supabase client for backend routes

## What Gets Generated

### React Component Tests
- Component renders without errors
- Props validation (required props, defaults)
- User interactions (clicks, form inputs)
- Conditional rendering
- Error states

### Express Route Tests
- Happy path (success response)
- Authentication failures
- Invalid input handling
- Database errors
- CORS headers

## Key Test Patterns

**Component test example:**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from './EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Coffee Meetup',
    date: '2025-03-01',
    location: 'Downtown Cafe',
  };

  it('renders event card with title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Coffee Meetup')).toBeInTheDocument();
  });
});
```

**Route test example:**
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /api/events', () => {
  it('returns events list', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

## Setup Instructions

After generating tests:

1. Install dev dependencies:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom supertest
```

2. Update `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

3. Run tests:
```bash
npm test
```

## Notes

- Skip tests for UI-only components (Mango SVG, pure presentational)
- Focus on critical paths: auth, RSVP, event creation, notifications
- Mock external APIs (Google Maps, Supabase) consistently
- Use data builders/factories for test data

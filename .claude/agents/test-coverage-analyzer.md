# Test Coverage Analyzer Subagent

**Type**: Coverage analysis and test recommendations
**Context**: fork (runs in isolated context)
**When to use**: After setting up test infrastructure, regularly during development

## Responsibilities

Analyzes code and identifies:

1. **Untested Critical Paths**
   - Auth flows (login, register, token refresh)
   - RSVP/event join logic
   - Event creation workflow
   - Chat message sending
   - Feed reactions

2. **Coverage Gaps**
   - Error handling not tested
   - Edge cases (empty states, null data)
   - User role enforcement (host vs guest)
   - localStorage interactions
   - API error responses

3. **Test Quality Issues**
   - Brittle tests (too tightly coupled)
   - Missing assertions
   - Inadequate mock setup
   - Tests that don't verify behavior

4. **Recommendations**
   - Which files need tests first (priority)
   - Test patterns to follow
   - How to improve existing test coverage

## Invocation

```bash
# Analyze frontend components
claude test-coverage-analyzer --path=src/components

# Analyze backend routes
claude test-coverage-analyzer --path=server/routes

# Full project analysis
claude test-coverage-analyzer --all

# Compare coverage before/after changes
claude test-coverage-analyzer --compare
```

## Priority Test Matrix

| Component | Priority | Why | Est. Lines |
|-----------|----------|-----|-----------|
| `api.js` | 🔴 Critical | Error handling, API contract | 50-100 |
| `App.jsx` handlers | 🔴 Critical | All state logic | 200+ |
| `EventDetailSheet` | 🟡 High | User interaction, chat | 100+ |
| `OnboardingFlow` | 🟡 High | User flow, preferences | 80+ |
| `server/routes/auth.js` | 🔴 Critical | Auth critical | 60+ |
| `server/routes/events.js` | 🟡 High | Main API | 100+ |
| `LocationPicker` | 🟢 Medium | UI component, Google Maps | 40+ |
| `EventCard` | 🟢 Low | Pure UI, no logic | 20+ |
| `MangoSVG` | 🟢 Low | Pure presentation | Skip |

## Test Coverage Targets

**By release:**
- **v0.33**: Auth routes + api.js (30% overall)
- **v0.34**: App state handlers + critical components (50% overall)
- **v0.35**: Full event creation flow (70% overall)
- **v1.0**: 80%+ critical paths covered

## Coverage Report Format

```
Overall Coverage: X%
├── src/
│   ├── App.jsx: X% (Y untested functions)
│   ├── api.js: X% (Critical!)
│   ├── components/
│   │   ├── EventDetailSheet: X%
│   │   ├── OnboardingFlow: X%
│   │   └── ...
│   └── contexts/: X%
├── server/
│   ├── routes/
│   │   ├── auth.js: X% (CRITICAL!)
│   │   ├── events.js: X%
│   │   └── ...
│   └── matching.js: X%

🔴 Critical (0% coverage): auth.js, api.js
🟡 High (0-50% coverage): App.jsx, EventDetailSheet
🟢 Medium (50-80% coverage): LocationPicker
```

## Recommended Test Templates

### React Component Test
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Happy path
  it('renders correctly with props', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  // User interaction
  it('handles user click', async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<Component onClick={handler} />);

    await user.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalled();
  });

  // Edge cases
  it('handles null props gracefully', () => {
    render(<Component event={null} />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
```

### Express Route Test
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('POST /api/events/:id/rsvp', () => {
  // Happy path
  it('RSVP succeeds with valid token', async () => {
    const res = await request(app)
      .post('/api/events/123/rsvp')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(res.body.attended).toBe(true);
  });

  // Auth failure
  it('rejects without token', async () => {
    const res = await request(app)
      .post('/api/events/123/rsvp')
      .expect(401);
  });

  // Error case
  it('returns 404 if event not found', async () => {
    const res = await request(app)
      .post('/api/events/nonexistent/rsvp')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });
});
```

## Known Test Gaps

- Zero tests exist currently
- No testing infrastructure (Vitest, RTL, Supertest not installed)
- No test utilities or mocks set up
- No fixtures or factory data

## Setup Checklist

Before running analyzer:
- [ ] `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom supertest`
- [ ] Create `vitest.config.js`
- [ ] Update `package.json` with test scripts
- [ ] Create test utilities directory

## Integration with CI/CD

**Recommended GitHub Actions:**
```yaml
- name: Test Coverage
  run: npm test -- --coverage

- name: Coverage Report
  run: npm test -- --coverage.reporter=text-summary
```

**Fail CI if coverage below 70% for critical files:**
```yaml
- name: Check Coverage Thresholds
  run: npm test -- --coverage.lines.100 src/api.js server/routes/auth.js
```

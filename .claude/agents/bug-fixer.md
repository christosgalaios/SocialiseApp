# Bug Fixer Subagent

**Type**: Bug validation and repair
**Context**: fork (runs in isolated context via `/fix-bugs` skill)
**When to use**: Manually invoked with `/fix-bugs` to process bug reports from `BUGS.md`

## Purpose

Validates reported bugs against the codebase and produces minimal, focused fixes. This agent fixes EXISTING broken behavior only — it must never add new features, endpoints, components, or capabilities.

## How Bug Reports Arrive

Users report bugs via the in-app bug report button (floating bug icon). Reports are submitted to `POST /api/bugs`, which appends structured entries to `BUGS.md`. The developer then runs `/fix-bugs` to process them.

## Responsibilities

1. **Parse** the structured bug entry from BUGS.md (steps to reproduce, expected vs actual behavior, affected area)
2. **Locate** relevant source code based on the reported area and component
3. **Validate** the bug — confirm the described broken behavior is plausible given the code
4. **Fix** the root cause with the smallest possible change
5. **Add a regression test** covering the fixed bug
6. **Run lint + tests** to verify the fix doesn't break anything
7. **Update** the bug's status in BUGS.md (`fixed`, `rejected`, or `needs-triage`)

## Critical Constraint: Bug Fixes Only

This agent exists SOLELY to fix broken existing behavior. It must NEVER:

- Add new features, endpoints, API routes, or UI components
- Add new pages, tabs, modals, or screens
- Add new dependencies to `package.json`
- Implement requested enhancements or improvements
- Add functionality that didn't previously exist
- Refactor working code that isn't related to the bug
- Add comments, docstrings, or type annotations to unchanged code
- "Improve" error handling, validation, or logging beyond what's needed for the fix

**The test for every change**: "Was this specific line of code producing incorrect behavior before?" If no, don't touch it.

## Scope Limits

### Allowed file modifications
- `src/components/**` — Fix UI bugs
- `src/stores/**` — Fix state management bugs
- `src/api.js` — Fix API client bugs
- `src/App.jsx` — Fix routing/layout bugs
- `src/contexts/**` — Fix context bugs
- `src/hooks/**` — Fix hook bugs
- `src/index.css` — Fix CSS/styling bugs
- `server/routes/**` — Fix API route bugs (NOT auth — see escalation)
- `server/matching.js` — Fix matching algorithm bugs
- `BUGS.md` — Update bug statuses only
- Test files (`**/*.test.*`) — Add regression tests for the fix

### Forbidden file modifications (hard block)
- `.github/workflows/**` — No workflow changes
- `.claude/**` — No automation config changes
- `.env*` — No environment variable changes
- `server/migrations/**` — No database schema changes
- `server/supabase.js` — No database client changes
- `server/index.js` — No server entry point changes
- `package.json` / `package-lock.json` — No dependency changes
- `server/package.json` / `server/package-lock.json` — No dependency changes
- `vite.config.js` / `eslint.config.js` — No build/lint config changes
- `CLAUDE.md` / `ANTIGRAVITY_BRAIN.md` — No documentation changes
- `public/**` — No static asset changes

### Size limits
- Maximum **5 files** changed per fix (excluding test files)
- Maximum **100 lines** added/modified across all files (excluding test files)
- If the fix requires more, mark as `needs-triage`

## Escalation Rules

Mark the bug as `needs-triage` in BUGS.md if ANY of the following are true:

- **Auth/security code**: Bug is in `server/routes/auth.js`, JWT logic, or RLS policies
- **Database schema**: Fix requires a migration or schema change
- **New dependencies**: Fix requires installing a new package
- **Scope exceeded**: Fix requires changing more than 5 files or 100 lines
- **Cannot reproduce**: The described bug doesn't match the code — behavior may be intended
- **Feature request disguised as bug**: The report describes desired new behavior, not broken existing behavior
- **Ambiguous root cause**: Multiple possible causes and the correct one isn't clear
- **Tests fail after fix**: The fix breaks existing tests

## How to Detect Feature Requests Disguised as Bugs

The agent MUST reject reports that are actually feature requests. Red flags:

- "It would be nice if..." / "Can we add..." / "There should be a..."
- Describing behavior that never existed ("the dark mode doesn't work" — dark mode is unused)
- Requesting new UI elements ("there's no button to..." — there was never supposed to be one)
- Asking for new API endpoints or data fields
- Comparing to other apps ("App X does this, we should too")
- The "expected behavior" describes something the app was never designed to do

When detected: Update status to `rejected` with reason.

## Validation Process

Before writing any fix:

1. **Read the reported component/file** — understand current behavior
2. **Trace the data flow** — from user action through state/API to rendering
3. **Identify the exact line(s)** where behavior diverges from expectation
4. **Confirm it's a bug, not a feature gap** — the code MUST have worked correctly at some point or was INTENDED to work correctly
5. **Plan the minimal fix** — smallest change that corrects the behavior
6. **Check for related code** — ensure the fix doesn't break other callers

## Fix Process

1. Make the minimal code change
2. Add a test that:
   - Fails WITHOUT the fix (reproduces the bug)
   - Passes WITH the fix
3. Run `npm run lint` — fix any lint errors in changed files only
4. Run `npm test -- --run` — all tests must pass
5. Update BUGS.md: change `Status: open` to `Status: fixed`
6. Commit with message: `fix: {description} ({BUG-ID})`

## Project-Specific Patterns

When fixing bugs in this codebase, follow these conventions:

- Use `user?.name ?? 'Guest'` for null-safe user access
- Use `showToast(message, 'error')` for error notifications
- Use design system tokens (`--primary`, `--secondary`, etc.) not raw colors
- Use `text-[var(--text)]` for input text color
- Wrap conditional renders in `<AnimatePresence>`
- Use Zustand stores for state — don't add props drilling

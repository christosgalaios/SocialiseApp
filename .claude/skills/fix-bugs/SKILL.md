---
name: fix-bugs
description: Process bug reports from BUGS.md — validate, fix, and push to development
disable-model-invocation: false
context: fork
---

# Bug Fixer — Process BUGS.md Reports

Reads `BUGS.md`, processes each `open` bug report, validates it against the codebase, applies minimal fixes, and marks entries as resolved.

## Usage

```
/fix-bugs           # Process all open bugs (P1 first, then P2, then P3)
/fix-bugs P1        # Only process P1 (critical) bugs
/fix-bugs BUG-123   # Process a specific bug by ID
```

## How It Works

1. **Read** `BUGS.md` and parse all entries with `Status: open`
2. **Sort** by severity: P1 → P2 → P3
3. **For each bug:**
   a. Read the bug-fixer agent definition at `.claude/agents/bug-fixer.md` for full rules
   b. Validate: is this a real bug in existing behavior, or a feature request / invalid report?
   c. If invalid: update status to `rejected` with reason, skip
   d. If valid: locate the root cause, apply the minimal fix, add a regression test
   e. Run `npm run lint` and `npm test -- --run` to verify
   f. If fix works: update bug status to `fixed` in BUGS.md, commit the fix
   g. If fix fails or is out of scope: update status to `needs-triage` with reason
4. **Push** all fix commits to `development` branch

## Critical Rules

Read `.claude/agents/bug-fixer.md` for the full constraint set. Key rules:

- **Bug fixes ONLY** — never add new features, endpoints, or components
- **Minimal changes** — max 5 files, max 100 lines per bug (excluding tests)
- **Forbidden files** — no touching workflows, .env, migrations, package.json, config files
- **Auth escalation** — bugs in auth/security code get marked `needs-triage`, not fixed
- **Feature request detection** — if the "bug" describes desired new behavior, mark as `rejected`
- **Test required** — every fix must include a regression test
- **Lint + tests must pass** — run both before committing each fix

## BUGS.md Format

Each bug entry looks like:

```markdown
## BUG-1234567890

- **Status:** open
- **Severity:** P1 - Critical
- **Area:** Frontend - UI/Components
- **Reported:** 2025-01-15T10:30:00Z
- **Reporter:** user-abc123
- **Component:** EventDetailSheet

### Steps to Reproduce

1. Open an event detail
2. Click the chat tab
3. Send a message

### Expected Behavior

Message appears in the chat

### Actual Behavior

Message disappears and error shown

---
```

## Status Values

| Status | Meaning |
|--------|---------|
| `open` | Not yet processed — ready for fixing |
| `fixed` | Bug validated and fix committed |
| `rejected` | Not a bug (feature request, invalid, or cannot reproduce) |
| `needs-triage` | Valid bug but out of scope for automated fixing (auth, migrations, etc.) |

## Commit Format

Each fix gets its own commit:
```
fix: {description} ({BUG-ID})
```

## After Processing

The skill updates `BUGS.md` in place, changing the status of each processed entry. Fixed bugs stay in the file as a record. You can periodically clean up old `fixed` entries.

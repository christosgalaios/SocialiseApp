# Claude Code Automation Setup Guide

This document explains all the automations configured for Socialise development.

## 📋 What's Installed

| Component | Type | Status | How to Use |
|-----------|------|--------|-----------|
| **GitHub MCP** | MCP Server | ✅ Configured | `claude` auto-enables via `settings.json` |
| **Supabase MCP** | MCP Server | ✅ Configured | `claude` auto-enables via `settings.json` |
| **Auto-lint hook** | Hook | ✅ Active | Runs automatically on file edits |
| **Block .env hook** | Hook | ✅ Active | Prevents accidental credential edits |
| **gen-test skill** | Skill | ✅ Ready | `/gen-test path/to/component.jsx` |
| **create-migration skill** | Skill | ✅ Ready | `/create-migration "description"` |
| **code-reviewer** | Subagent | ✅ Ready | Use before merging to production |
| **test-coverage-analyzer** | Subagent | ✅ Ready | Use after test infrastructure setup |
| **bug-fixer** | Subagent + Workflow | ✅ Ready | Auto-triggered on `bug`-labeled issues |

---

## 🔌 MCP Servers

### GitHub MCP
Lets Claude interact with your GitHub repository directly.

**Commands Claude can run:**
- Check PR status and CI workflow runs
- View issues and pull requests
- Get deployment logs
- Manage branch protection rules

**Example use:**
```
"Check if the development → production deploy succeeded"
```

**Enable/Disable:**
```bash
claude mcp add github      # Enable
claude mcp remove github   # Disable
```

### Supabase MCP
Direct database operations without going through the API layer.

**Commands Claude can run:**
- Query events, communities, feed tables
- Inspect database schema
- Check RLS policies
- Monitor query performance

**Example use:**
```
"Show me all events created in the last 7 days"
"Query the users table to see who hasn't verified their email"
```

**Enable/Disable:**
```bash
claude mcp add supabase      # Enable
claude mcp remove supabase   # Disable
```

---

## ⚡ Hooks

Hooks run automatically in response to tool usage events.

### Auto-lint Hook (PostToolUse)
**When it runs:** After you edit or write any `.jsx` or `.js` file

**What it does:**
- Runs `npm run lint -- --fix`
- Auto-formats code to match ESLint rules
- Prevents style errors from reaching CI

**To disable temporarily:**
```json
// In .claude/settings.json, set:
"enabled": false
```

**Example:**
You edit `src/App.jsx` with improper spacing → Hook auto-fixes → CI passes

### Block .env Hook (PreToolUse)
**When it runs:** Before you try to edit `.env`, `.env.*.local`, or `server/.env*`

**What it does:**
- Blocks the edit with warning message
- Prevents accidental commits of secrets
- Requires manual environment variable setup in production

**Example:**
```
You try: "Edit .env to add JWT_SECRET"
Claude: ⚠️ Cannot edit .env files. Set variables in production environment.
```

---

## 🎯 Skills

Skills are reusable workflows you invoke with `/skill-name`. They run in isolated context (fork mode) to prevent side effects.

### /gen-test — Test Generator

**Purpose:** Generate comprehensive unit tests for components and routes

**How to use:**

```bash
# Generate tests for a React component
/gen-test src/components/EventCard.jsx

# Generate tests for an Express route
/gen-test server/routes/events.js

# Generate tests for a utility
/gen-test server/matching.js
```

**What it generates:**
- Unit tests with proper mocking
- Happy path + error case coverage
- Follows project testing conventions
- Includes setup instructions

**Files created:**
```
src/components/EventCard.test.jsx
server/routes/events.test.js
```

**Next steps after generation:**
```bash
npm test  # Run the generated tests
```

### /create-migration — Database Migration Creator

**Purpose:** Create Supabase database migrations safely

**How to use:**

```bash
/create-migration "Add email verification to users table"
/create-migration "Create notifications table"
/create-migration "Migrate users from JSON to Supabase"
```

**What it generates:**
- SQL migration file with proper syntax
- RLS policies for security
- Pre-migration checklist
- Rollback strategy

**Files created:**
```
server/migrations/NNN_description.sql
```

**Next steps:**
```bash
node server/migrate.js  # Apply migration to development
# Test thoroughly, then merge to production
```

**Important:** This is **user-only** (you must invoke it, Claude cannot). This prevents accidental destructive migrations.

---

## 🤖 Subagents

Subagents are specialized agents for complex analysis tasks. They run in fork context and handle deep analysis autonomously.

### code-reviewer — Pull Request Review

**Purpose:** Security, quality, and design system compliance review

**When to use:**
- Before merging feature branches to `development`
- Before merging `development` → `production`
- When you want expert code review

**How to invoke:**

```bash
# Option 1: Ask Claude directly
"Review this PR for security and design issues before I merge"

# Option 2: Use subagent context tag
@code-reviewer review the changes in src/components/EventDetailSheet.jsx
```

**What it checks:**
- ✅ Security (auth, XSS, CORS, secrets)
- ✅ Best practices (optional chaining, error handling)
- ✅ Design system compliance (colors, typography, spacing)
- ✅ Performance (re-renders, N+1 queries)
- ✅ Project conventions (naming, state management)

**Output:**
```
Security Issues: None ✅
Best Practices: 1 warning (missing optional chaining)
Design System: Compliant ✅
Performance: OK ✅
Ready to Merge: YES, fix 1 warning first
```

### test-coverage-analyzer — Coverage Analysis

**Purpose:** Identify untested code and recommend test priorities

**When to use:**
- Before each release
- When adding new features
- To establish coverage targets

**How to invoke:**

```bash
# Option 1: Ask Claude
"Analyze test coverage for the components I just modified"

# Option 2: Use subagent
@test-coverage-analyzer show me coverage gaps in src/components/
```

**What it analyzes:**
- Which files have no tests
- Which critical paths are untested
- Coverage by component/route
- Test quality issues

**Output:**
```
Critical (0% coverage):
- src/api.js (50 lines) — Must test
- server/routes/auth.js (60 lines) — Must test

High (0-50% coverage):
- src/App.jsx (200 lines) — Test state handlers

Medium (50-80%):
- src/components/EventDetailSheet.jsx

Recommendations:
1. Start with api.js (highest impact, smallest scope)
2. Then auth.js (security critical)
3. Then App.jsx handlers
```

### bug-fixer — Automated Bug Validation and Repair

**Purpose:** Validates bug reports and produces minimal, focused fixes automatically

**How it works:**

1. A user files a bug report using the structured issue template (GitHub Issues)
2. The `bug` label triggers the `bug-fixer.yml` GitHub Actions workflow
3. The workflow validates the issue structure and rejects feature requests
4. Claude Code analyzes the codebase, validates the bug, and produces a fix
5. A PR is created targeting `development` — it flows through `auto-approve.yml`
6. If the agent can't fix it, the issue is labeled `needs-triage` for human attention

**Safety guardrails:**
- **Bug-only scope:** Agent cannot add new features, endpoints, or components. It can only fix existing broken behavior.
- **File restrictions:** Cannot touch workflows, `.env`, migrations, `package.json`, or config files.
- **Size limits:** Max 5 files changed, max 100 lines modified (excluding tests).
- **Auth escalation:** Any bug touching auth or security code is auto-escalated to human.
- **Feature request detection:** Issues that describe new behavior (not broken existing behavior) are rejected with `not-a-bug` label.
- **Validation pipeline:** Fix PRs go through the same lint + test + build pipeline as all other PRs.
- **Forbidden file enforcement:** The workflow double-checks changed files against a blocklist before creating the PR.

**Triggering:**
- Automatic: Add the `bug` label to any issue filed with the bug report template
- The agent runs once per issue. Re-labeling an issue that was already processed won't re-trigger (the `bug` label is removed on failure).

**Labels used:**
| Label | Meaning |
|-------|---------|
| `bug` | Triggers the agent (removed after processing) |
| `automated-fix` | Applied to PRs created by the agent |
| `needs-triage` | Agent couldn't fix — needs human attention |
| `not-a-bug` | Issue was a feature request, not a bug |

---

## 🚀 Workflows

### Daily Development

1. **Edit files** → auto-lint hook runs → code stays clean
2. **Create migration** → `/create-migration "description"` → manually run on dev
3. **Generate tests** → `/gen-test src/components/Foo.jsx` → commit tests
4. **Before merging** → code-reviewer analyzes → fix issues

### Release Process

1. **Code freeze** on development branch
2. **code-reviewer** audits all changes
3. **test-coverage-analyzer** identifies gaps
4. **Generate missing tests** with `/gen-test`
5. **Merge** development → production
6. **GitHub MCP** monitors CI/CD workflow

### Bug Fix Workflow

**Automated (via bug-fixer agent):**
1. File a bug report using the issue template → add `bug` label
2. Agent validates, fixes, adds regression test, creates PR
3. PR goes through auto-approve (lint + test + build)
4. Issue auto-closes on merge via `Fixes #N`

**Manual (for complex bugs or agent escalations):**
1. Create feature branch from development
2. Fix the bug
3. Edit files → auto-lint keeps code clean
4. `/gen-test path/to/file` → add test for the bug
5. Merge to development → CI tests run
6. code-reviewer checks for regressions
7. Merge to production

### Database Schema Changes

1. **Plan changes** in `.claude` note
2. `/create-migration "Add new_column to users"` → generates SQL
3. Test on local Supabase: `supabase start`
4. `node server/migrate.js` → apply migration
5. Run API tests to verify no breaking changes
6. Merge to production → auto-runs on deploy

---

## ⚙️ Configuration Files

### .claude/settings.json
Main configuration file. Controls MCP servers and hooks.

```json
{
  "mcpServers": [
    { "name": "github", "enabled": true },
    { "name": "supabase", "enabled": true }
  ],
  "hooks": {
    "PostToolUse": [
      { "name": "auto-lint", "enabled": true }
    ],
    "PreToolUse": [
      { "name": "block-env", "enabled": true }
    ]
  }
}
```

### .claude/skills/
Skill definitions live here.
```
.claude/skills/
├── gen-test/SKILL.md
└── create-migration/SKILL.md
```

### .claude/agents/
Subagent definitions.
```
.claude/agents/
├── code-reviewer.md
└── test-coverage-analyzer.md
```

---

## 🔧 Troubleshooting

### Auto-lint hook not running?
- Check: `npm run lint` works manually
- Enable in settings.json: `"enabled": true`
- Verify files match pattern: `src/**/*.jsx`, `server/**/*.js`

### .env hook blocking me?
- This is intentional! Use production environment variables instead
- For local development: copy `.env.example` → `.env` (in gitignore)
- Never edit .env in Claude — set manually

### Skill not appearing?
- Ensure `.claude/skills/{name}/SKILL.md` exists
- Reload Claude Code: `/reload`
- Check SKILL.md has valid YAML frontmatter

### Subagent not responding?
- Subagents may take longer (they fork context)
- Be specific: "Review this file for security issues"
- Use `@subagent-name` tag for routing

### MCP Server connection issues?
- Check: `gh auth status` (for GitHub MCP)
- Check: Supabase credentials in environment
- Restart Claude Code: `/restart`

---

## 📊 Best Practices

### Code Review Before Merge
Always run code-reviewer before merging to production:
```bash
# Tell Claude:
"Run code-reviewer on changes from development → production"
# This ensures security, design, and quality checks pass
```

### Test Coverage Before Release
Before each release, check coverage:
```bash
/gen-test src/components/NewComponent.jsx  # Add missing tests
npm test -- --coverage  # View overall coverage
```

### Secure .env Handling
Never ask Claude to edit `.env` files:
- ✅ `Claude, help me understand what JWT_SECRET should be`
- ❌ `Claude, edit .env to set JWT_SECRET=abc123`

### Use Supabase MCP for Debugging
When debugging database issues:
```
Claude, query the users table to see if the migration worked
```

Instead of:
```
Tell me how to query Supabase
```

---

## 📞 Getting Help

- **Setup issues**: Check this file (AUTOMATION_SETUP.md)
- **Claude Code help**: Type `/help`
- **Project questions**: Read CLAUDE.md (project brain)
- **Design system**: See ANTIGRAVITY_BRAIN.md
- **Bug tracking**: GitHub Issues

---

## ✅ Checklist: Setup Complete

- [x] MCP servers configured (GitHub, Supabase)
- [x] Hooks active (auto-lint, block-env)
- [x] Skills ready (gen-test, create-migration)
- [x] Subagents available (code-reviewer, test-coverage-analyzer)
- [x] Documentation created (this file)

**You're ready to go!** Start with:
1. Try `/gen-test src/components/EventCard.jsx` to see test generation
2. Ask code-reviewer to audit a component
3. Commit `.claude/` directory to version control

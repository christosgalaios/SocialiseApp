# Claude Code Automation Setup Guide

This document explains all the automations configured for Socialise development.

## 📋 What's Installed

| Component | Type | Status | How to Use |
|-----------|------|--------|-----------|
| **GitHub MCP** | MCP Server | ✅ Configured | `claude` auto-enables via `settings.json` |
| **Supabase MCP** | MCP Server | ✅ Configured | `claude` auto-enables via `settings.json` |
| **Session start hook** | Hook | ✅ Active | Creates server/.env + starts backend on session start |
| **Auto-lint hook** | Hook | ✅ Active | Runs automatically on file edits |
| **Block .env hook** | Hook | ✅ Active | Prevents accidental credential edits |
| **gen-test skill** | Skill | ✅ Ready | `/gen-test path/to/component.jsx` |
| **create-migration skill** | Skill | ✅ Ready | `/create-migration "description"` |
| **code-reviewer** | Subagent | ✅ Ready | Use before merging to production |
| **test-coverage-analyzer** | Subagent | ✅ Ready | Use after test infrastructure setup |
| **fix-bugs skill** | Skill | ✅ Ready | `/fix-bugs` to process bug reports from Google Sheet |
| **bug-fixer** | Subagent | ✅ Ready | Used by `/fix-bugs` skill |

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

### Session Start Hook (SessionStart)
**When it runs:** At the start of every new Claude Code web session

**What it does:**
- Checks for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET` environment variables
- Creates `server/.env` from those variables (so the backend can connect to Supabase)
- Installs server dependencies if missing
- Starts the Express backend server in the background (port 3001)
- Persists env vars for subsequent Bash commands in the session

**Setup (one time):**
Set these environment variables in your Claude Code web environment settings:
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key from Supabase Dashboard → Project Settings → API
- `JWT_SECRET` — Same value as in your Railway deployment

**Script:** `.claude/hooks/session-start.sh`

**Why it exists:** The `/fix-bugs` skill needs a running backend to push status/priority updates to Supabase (which auto-syncs to the Google Sheet). Without this hook, you'd need to manually set up credentials every session.

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

### bug-fixer — Bug Validation and Repair

**Purpose:** Validates bug reports from the Google Sheet and produces minimal, focused fixes

**How it works:**

1. Users report bugs via the in-app bug button → reports are stored in Supabase + synced to Google Sheet
2. Developer runs `/fix-bugs` when ready to process reports
3. The skill fetches all bugs from the Google Sheet CSV export (single data source)
4. Auto-prioritizes any `auto` priority bugs, deduplicates, and pushes updates to the sheet — before asking the user anything
5. Displays summary table, then asks user what to fix (all open / P1 only / specific bug)
6. For each selected bug: validates against codebase, fixes if valid, adds regression test
7. Updates bug status via `PUT /api/bugs/:bugId`: `fixed`, `rejected`, or `needs-triage`
8. Each fix is committed separately

**Safety guardrails:**
- **Bug-only scope:** Cannot add new features, endpoints, or components. Only fixes existing broken behavior.
- **Feature request detection:** Reports describing new behavior are marked `rejected`.
- **File restrictions:** Cannot touch workflows, `.env`, migrations, `package.json`, or config files.
- **Size limits:** Max 5 files changed, max 100 lines modified (excluding tests).
- **Auth escalation:** Bugs in auth/security code are marked `needs-triage` for human review.
- **Manual trigger only:** You choose when to run `/fix-bugs` — nothing runs automatically.

**Bug report statuses:**
| Status | Meaning |
|--------|---------|
| `open` | Not yet processed — ready for fixing |
| `fixed` | Bug validated and fix committed |
| `rejected` | Not a bug (feature request, invalid, cannot reproduce) |
| `needs-triage` | Valid bug but out of scope for automated fixing |

**Google Sheet sync (optional — enables cloud Claude access):**

New bug reports are synced to a Google Sheet in real time so you can paste the sheet URL to any Claude session (web or local) and it can read the bugs without needing API credentials.

Setup (one time):
1. Create a new Google Sheet with columns: `bug_id | description | status | priority | environment | created_at`
2. Set sharing to "Anyone with the link can view"
3. In the sheet, open Extensions → Apps Script and paste:
   ```js
   function doPost(e) {
     const data = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([
       data.bug_id, data.description, data.status,
       data.priority, data.environment, data.created_at
     ]);
     return ContentService.createTextOutput('ok');
   }
   ```
4. Deploy as web app: Execute as "Me", access "Anyone" → copy the `/exec` URL
5. Add to Railway env vars: `BUGS_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec`

Once set up, paste the sheet's view URL to any Claude session and ask it to read your bugs.

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

**Via /fix-bugs (recommended):**
1. Users report bugs via the in-app bug icon → stored in Supabase + synced to Google Sheet
2. Run `/fix-bugs` — fetches from Google Sheet, auto-prioritizes, updates sheet, then asks what to fix
3. Agent validates each selected bug, fixes, adds regression test, commits
4. Push to development → auto-approve (lint + test + build) → merge

**Manual (for complex bugs or `needs-triage` items):**
1. Create feature branch from development
2. Fix the bug
3. Edit files → auto-lint keeps code clean
4. `/gen-test path/to/file` → add test for the bug
5. Update bug status via `PUT /api/bugs/:bugId` with `{"status": "fixed"}`
6. Merge to development → CI tests run
7. code-reviewer checks for regressions
8. Merge to production

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
    "SessionStart": [
      { "matcher": "startup", "hooks": [{ "type": "command", "command": "..." }] }
    ],
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
├── create-migration/SKILL.md
└── fix-bugs/SKILL.md
```

### .claude/agents/
Subagent definitions.
```
.claude/agents/
├── code-reviewer.md
├── test-coverage-analyzer.md
└── bug-fixer.md
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
- **Design system**: See CLAUDE.md (Design System section)
- **Bug tracking**: Google Sheet dashboard (read by `/fix-bugs`) + Supabase `bug_reports` table (storage) + `/fix-bugs` skill

---

## ✅ Checklist: Setup Complete

- [x] MCP servers configured (GitHub, Supabase)
- [x] Hooks active (auto-lint, block-env)
- [x] Skills ready (gen-test, create-migration, fix-bugs)
- [x] Subagents available (code-reviewer, test-coverage-analyzer, bug-fixer)
- [x] Documentation created (this file)

**You're ready to go!** Start with:
1. Try `/gen-test src/components/EventCard.jsx` to see test generation
2. Ask code-reviewer to audit a component
3. Commit `.claude/` directory to version control

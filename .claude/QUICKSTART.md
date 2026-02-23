# Claude Automation Quickstart

5-minute guide to using your new automations. (Full docs: `AUTOMATION_SETUP.md`)

---

## 🚀 Try These First

### 1. Generate Tests (90 seconds)
```bash
/gen-test src/components/EventCard.jsx
```

**What happens:**
- Claude generates unit tests with React Testing Library
- Tests cover happy path + error cases
- You get a `.test.jsx` file ready to run

**Then:**
```bash
npm install --save-dev vitest @testing-library/react
npm test  # Run the generated tests
```

---

### 2. Get a Code Review (2 minutes)
Ask Claude:
```
"Review src/components/AuthScreen.jsx for security issues using code-reviewer"
```

**What happens:**
- Subagent audits code for: security bugs, design compliance, performance
- Returns structured review with ✅/⚠️/🔴 findings
- Ready-to-fix recommendations

---

### 3. Create a Database Migration (90 seconds)
```bash
/create-migration "Add email_verified_at column to users"
```

**What happens:**
- Generates SQL migration with RLS policies
- Creates file in `server/migrations/`
- Includes checklist and rollback strategy

**Then:**
```bash
node server/migrate.js  # Test locally
# After review, merge to production (auto-deploys)
```

---

## 💡 Common Workflows

### Writing a Feature
```bash
# 1. Plan with architecture analysis
/feature-dev "Add email verification to signup"

# 2. Create components
/component-design "EmailVerificationModal"

# 3. Generate tests
/gen-test src/components/EmailVerificationModal.jsx

# 4. Before merging
code-reviewer audits your changes
```

### Fixing a Bug
```bash
# 1. Edit code
# auto-lint hook runs automatically ✨

# 2. Add test for the bug
/gen-test src/components/BuggyComponent.jsx

# 3. Review for regressions
code-reviewer checks your fix
```

### Deploying Code
```bash
# 1. development branch ready
# 2. Audit all changes
code-reviewer reviews PR

# 3. Check coverage
test-coverage-analyzer finds gaps

# 4. Fill gaps with tests
/gen-test src/components/UntestCriticalComponent.jsx

# 5. Merge to production
# GitHub MCP can check CI status
```

### Database Schema Changes
```bash
# 1. Plan the migration
/create-migration "Rename column x to y"

# 2. Test locally
supabase start
node server/migrate.js

# 3. Review SQL
code-reviewer audits the migration

# 4. Deploy
# Merge to production (auto-runs on Railway)
```

---

## 🎯 What Runs Automatically

### Auto-lint (whenever you edit code)
```
You edit: src/App.jsx
↓
Hook runs: npm run lint -- --fix
↓
Result: Code auto-formatted ✨
```

### Block .env (whenever you try to edit .env)
```
You try: "Edit .env to set JWT_SECRET"
↓
Hook blocks: ⚠️ Cannot edit .env
↓
You set: Manually in Railway/production
```

---

## 📚 Full Documentation

| Doc | For What |
|-----|----------|
| `AUTOMATION_SETUP.md` | How everything works, troubleshooting |
| `PLUGINS_AND_EXTENSIONS.md` | Optional plugins to install |
| `CLAUDE.md` | Project architecture, conventions, design system |

---

## ❓ Quick Troubleshooting

**Skill not showing?**
- Type `/help` and search "skills"
- Reload: close Claude and reopen

**Hook not running?**
- Check: `npm run lint` works manually
- Verify file matches pattern in settings.json

**.env hook blocking me?**
- This is intentional (security)
- Set env vars in Railway dashboard instead

**Tests won't run?**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm test
```

---

## 🎓 Next Steps

1. **Try `/gen-test`** to see test generation
2. **Ask code-reviewer** to audit a component
3. **Read AUTOMATION_SETUP.md** for full reference
4. **Commit `.claude/` directory** to git

```bash
git add .claude/
git commit -m "feat: add Claude Code automations (MCP, skills, hooks, subagents)"
```

---

## 💬 Key Commands

| Command | What it does |
|---------|------------|
| `/gen-test file.jsx` | Generate tests |
| `/create-migration "name"` | Create DB migration |
| `code-reviewer` | PR review subagent |
| `test-coverage-analyzer` | Find untested code |
| `@github` | Query GitHub API |
| `@supabase` | Query database directly |

---

## 🔥 Pro Tips

1. **MCP servers are always available** — just ask Claude:
   - "Show me the last 10 commits"
   - "Query events created today"

2. **Subagents handle complex tasks** — use for major reviews:
   - "Audit this PR for security"
   - "Find untested critical paths"

3. **Skills are user-friendly workflows**:
   - `/gen-test` for readable test generation
   - `/create-migration` for safe database changes

4. **Hooks keep code clean automatically**:
   - No need to remember linting
   - No risk of committing .env secrets

---

## 📊 Recommended Release Checklist

Before merging `development` → `production`:

- [ ] `/gen-test` added for new components
- [ ] `code-reviewer` approved all changes
- [ ] `test-coverage-analyzer` identified gaps
- [ ] GitHub MCP shows CI passing ✅
- [ ] No `.env` files in commits

---

**You're ready!** Start with `/gen-test src/components/EventCard.jsx`

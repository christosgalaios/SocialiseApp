# Claude Code Automation Suite for Socialise

Complete automation setup for development, testing, security, and deployment.

## 📁 What's Here

```
.claude/
├── settings.json                 # MCP servers + hooks config
├── README.md                     # This file
├── QUICKSTART.md                 # 5-minute getting started
├── AUTOMATION_SETUP.md           # Full documentation
├── PLUGINS_AND_EXTENSIONS.md     # Optional enhancements
│
├── skills/                       # Reusable workflows
│   ├── gen-test/
│   │   └── SKILL.md              # Generate unit tests
│   └── create-migration/
│       └── SKILL.md              # Create DB migrations
│
└── agents/                       # Specialized analyzers
    ├── code-reviewer.md          # PR review subagent
    └── test-coverage-analyzer.md # Coverage analysis
```

---

## 🎯 What's Installed (7 Components)

| Component | Type | Purpose | Status |
|-----------|------|---------|--------|
| **GitHub MCP** | Server | PR/CI/workflow management | ✅ Ready |
| **Supabase MCP** | Server | Direct database queries | ✅ Ready |
| **Auto-lint** | Hook | Format code on edit | ✅ Active |
| **Block .env** | Hook | Prevent credential commits | ✅ Active |
| **gen-test** | Skill | Generate unit tests | ✅ Ready |
| **create-migration** | Skill | Create DB migrations | ✅ Ready |
| **code-reviewer** | Subagent | Security & quality review | ✅ Ready |
| **test-coverage-analyzer** | Subagent | Find untested code | ✅ Ready |

---

## 🚀 Getting Started (1 minute)

1. **Read quickstart:**
   ```bash
   cat QUICKSTART.md
   ```

2. **Try a skill:**
   ```bash
   /gen-test src/components/EventCard.jsx
   ```

3. **Ask for a review:**
   ```
   "Review EventDetailSheet.jsx for security"
   ```

4. **Create a migration:**
   ```bash
   /create-migration "Add notification preferences to users"
   ```

---

## 📋 Quick Reference

### Hooks (Run Automatically)
- **auto-lint**: Runs on `.jsx`/`.js` edit → `npm run lint --fix`
- **block-env**: Blocks `.env` edits → prompts to use production env

### Skills (Invoke with `/skill-name`)
- **`/gen-test`** → Generate tests for components/routes
- **`/create-migration`** → Create Supabase migrations

### Subagents (Deep Analysis)
- **`code-reviewer`** → Audit code for security, design, quality
- **`test-coverage-analyzer`** → Find untested code, recommend tests

### MCP Servers (Always Available)
- **`@github`** → Check PR status, CI logs, deployment status
- **`@supabase`** → Query database, inspect schema

---

## 💻 Example Workflows

### Generate Tests for New Component
```bash
/gen-test src/components/EventCard.jsx
npm install --save-dev vitest @testing-library/react
npm test
```

### Review Before Production Merge
```
Ask Claude: "Review all changes for security using code-reviewer"
→ Claude analyzes: security, design compliance, performance
→ You fix issues from report
```

### Create Database Migration
```bash
/create-migration "Add email verification to auth"
node server/migrate.js  # Test locally
# Merge to production (auto-deploys)
```

### Check Deployment Status
```
Ask Claude: "Check GitHub Actions workflow status using @github"
→ Claude shows: CI results, deployment logs
```

---

## 📚 Full Documentation

- **`QUICKSTART.md`** — 5-minute getting started guide
- **`AUTOMATION_SETUP.md`** — Complete reference documentation
- **`PLUGINS_AND_EXTENSIONS.md`** — Optional plugins to install
- **`skills/gen-test/SKILL.md`** — Test generator documentation
- **`skills/create-migration/SKILL.md`** — Migration creator documentation
- **`agents/code-reviewer.md`** — Code reviewer subagent details
- **`agents/test-coverage-analyzer.md`** — Coverage analyzer details

---

## ⚙️ Configuration

All settings in `settings.json`:
- MCP server enablement
- Hook configuration
- Skill/agent directories

To disable a hook temporarily:
```json
{
  "hooks": {
    "PostToolUse": [
      { "name": "auto-lint", "enabled": false }  // Toggle here
    ]
  }
}
```

---

## 🔐 Security

- ✅ `.env` hook prevents credential commits
- ✅ MCP servers require proper auth
- ✅ Skills run in isolated fork context
- ✅ Subagents don't modify code without confirmation
- ✅ Code reviewer checks for XSS, CORS, SQL injection

---

## 🎓 Learning Path

1. **Start**: `QUICKSTART.md` (5 min)
2. **Try**: `/gen-test src/components/EventCard.jsx` (10 min)
3. **Review**: Ask code-reviewer to audit a file (5 min)
4. **Reference**: `AUTOMATION_SETUP.md` (as needed)
5. **Extend**: `PLUGINS_AND_EXTENSIONS.md` (optional)

---

## 📞 Support

- **Claude Code help**: Type `/help` in Claude
- **Setup questions**: See `AUTOMATION_SETUP.md`
- **Project context**: See `../CLAUDE.md`
- **Design system**: See `../ANTIGRAVITY_BRAIN.md`

---

## ✅ Installation Checklist

- [x] MCP servers configured
- [x] Hooks active
- [x] Skills created
- [x] Subagents ready
- [x] Documentation written
- [ ] **Next**: Commit to git

```bash
git add .claude/
git commit -m "feat: add Claude Code automations (MCP, skills, hooks, subagents)"
```

---

## 🎯 Recommended Next Steps

1. **Install testing framework**:
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom supertest
   npm test
   ```

2. **Try test generation**:
   ```bash
   /gen-test src/components/OnboardingFlow.jsx
   ```

3. **Get code review**:
   ```
   "Review the auth flow for security issues"
   ```

4. **Create database migration**:
   ```bash
   /create-migration "Migrate users table to Supabase"
   ```

5. **Optional plugins**:
   ```bash
   claude plugin install feature-dev
   ```

---

## 🚀 You're All Set!

All automations are configured and ready to use. Start with:

```bash
/gen-test src/components/EventCard.jsx
```

See `QUICKSTART.md` for common workflows.

---

**Questions?** Read the full docs or ask Claude directly.

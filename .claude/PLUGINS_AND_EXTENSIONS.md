# Recommended Plugins & Extensions for Socialise

Optional enhancements you can install to extend Claude Code capabilities.

---

## 🎨 Recommended Plugins

### 1. **feature-dev** Plugin
**What it does:** Guided feature development with architecture analysis

**Install:**
```bash
claude plugin install feature-dev
```

**Skills included:**
- `/feature-dev` — Plan and implement features
- Architecture analysis
- Component generation templates
- Data flow planning

**When to use:**
- Starting a new feature (auth migration, event creation, etc.)
- Need to understand codebase architecture first
- Planning complex multi-component features

**Example:**
```
/feature-dev "Migrate auth from users.json to Supabase"
# Outputs: architecture plan, affected files, implementation steps
```

**Cost:** Included in standard Claude Code

---

### 2. **anthropic-agent-skills** Plugin
**What it does:** Core productivity skills for any project

**Install:**
```bash
claude plugin install anthropic-agent-skills
```

**Skills included:**
- `/commit` — Generate semantic commit messages
- `/pr` — Create pull request templates
- `/review` — Document review checklist
- `/release` — Release notes generation

**When to use:**
- Writing commit messages
- Creating PRs with proper documentation
- Release management

**Example:**
```
/commit "Add tests for EventCard component"
# Generates: conventional commit message with context
```

**Cost:** Included in standard Claude Code

---

### 3. **frontend-design** Plugin
**What it does:** Frontend component design and review

**Install:**
```bash
claude plugin install frontend-design
```

**Skills included:**
- `/component-design` — Design new components
- `/design-review` — Review component design
- Design system validation
- Responsive layout testing

**When to use:**
- Creating new UI components
- Reviewing design compliance
- Testing mobile/responsive layouts

**Example:**
```
/component-design "EventCard for the explore tab"
# Outputs: Tailwind/CSS design, accessibility, responsive
```

**Cost:** Included in standard Claude Code

---

### 4. **mcp-builder** Plugin
**What it does:** Build custom MCP servers for Socialise

**Install:**
```bash
claude plugin install mcp-builder
```

**When to consider:**
- Need custom integrations (Stripe for payments, Twilio for SMS)
- Want to expose internal APIs to Claude

**Example:**
- Create MCP server for Socialise API
- Enables: `"Query all events created by user X"`

**Cost:** Advanced feature

---

## 📦 Optional Tool Integrations

### Email/Communication
- **Slack MCP** — Post deployment status to Slack
- **Gmail MCP** — Monitor error notifications

### Infrastructure
- **AWS MCP** — Manage Railway infrastructure
- **Docker MCP** — Container management

### Monitoring
- **Sentry MCP** — Real-time error tracking
- **LogRocket MCP** — Session replay debugging

---

## 🚀 Feature Requests for Future Setup

### After Test Infrastructure
```bash
# When you have Vitest + RTL set up:
/gen-test  # Already ready, just need npm install

# CI/CD integration:
# Automatically run code-reviewer on GitHub PRs
```

### After Scaling Beyond 1000 LOC
Consider migrating state management:
```bash
/feature-dev "Migrate state to Zustand store"
# Recommended at ~1500+ LOC in App.jsx
```

### After Real-time Features
```bash
# Add Supabase Realtime MCP:
claude mcp add supabase-realtime
# Enables: "Subscribe to new events in real-time"
```

---

## 📚 Learning Resources

### Skills Documentation
- `/help` — Built-in Claude Code help
- `AUTOMATION_SETUP.md` — This setup guide
- `CLAUDE.md` — Project brain (conventions, architecture)
- `ANTIGRAVITY_BRAIN.md` — Design system philosophy

### Official Docs
- [Claude Code Documentation](https://claude.com/claude-code)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [React 19 Docs](https://react.dev)

---

## ⚙️ Installation Checklist

**Configured & Ready:**
- [x] GitHub MCP
- [x] Supabase MCP
- [x] gen-test skill
- [x] create-migration skill
- [x] code-reviewer subagent
- [x] test-coverage-analyzer subagent
- [x] auto-lint hook
- [x] block-env hook

**Optional (Install as Needed):**
- [ ] feature-dev plugin
- [ ] anthropic-agent-skills plugin
- [ ] frontend-design plugin
- [ ] mcp-builder plugin

**To Install Optional Plugins:**
```bash
claude plugin install feature-dev
# Then reload Claude Code
```

---

## 🎯 Usage Recommendations by Role

### Frontend Developer
- Always use: `/gen-test` after component work
- Use: code-reviewer before merging
- Optional: frontend-design plugin

### Backend Developer
- Always use: `/create-migration` for schema changes
- Use: `/gen-test` for route testing
- Optional: mcp-builder for API extensions

### DevOps/Release Engineer
- Use: `/create-migration` for deployments
- Use: code-reviewer before production
- Optional: AWS MCP for infrastructure

### Project Lead
- Use: test-coverage-analyzer before releases
- Use: code-reviewer for quality gates
- Optional: anthropic-agent-skills for release notes

---

## 💡 Pro Tips

1. **Commit Template**: After installing anthropic-agent-skills:
   ```bash
   /commit "Describe what you did in plain English"
   ```

2. **Design Review**: Use frontend-design before component PR:
   ```bash
   /component-design "New EventFilters component"
   ```

3. **Feature Planning**: Start big features with feature-dev:
   ```bash
   /feature-dev "Add dark mode support"
   ```

4. **Release Management**: Generate release notes:
   ```bash
   /release v0.33.0
   ```

---

## ❌ Plugins NOT Recommended for This Project

- **Database schema generator** — Use `/create-migration` instead
- **Code formatter** — ESLint hook handles this
- **Generic code reviewer** — Use our custom code-reviewer
- **Auto-deployment** — Use GitHub Actions workflows

These are covered by existing tools or not needed.

---

## 🔐 Security & Permissions

All plugins respect your project's security rules:
- ✅ `.env` hook still blocks environment edits
- ✅ MCP servers require proper authentication
- ✅ Subagents don't modify code without confirmation
- ✅ Skills run in fork context (isolated)

---

## 📞 Support

- Plugin issues: `/help` → search "plugin installation"
- Feature questions: Ask in AUTOMATION_SETUP.md
- Project questions: See CLAUDE.md
- Design questions: See ANTIGRAVITY_BRAIN.md

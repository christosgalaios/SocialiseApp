# Socialise App — Claude Brain

> Fast-reference context for Claude Code. Read this before touching anything.

---

## What This App Is

**Socialise** is a community-driven social event discovery and micro-meet matchmaking platform. The pitch: warm, local, human connection — not cold tech. Think Meetup meets Hinge, with AI-curated small dinners (4-6 people) called "Micro-Meets".

**Current state:** Fully wired end-to-end. Backend uses Supabase Postgres for all routes (events, communities, feed, users, auth). Frontend calls real API endpoints via `src/api.js` — no mock data for events, communities, or feed. Row Level Security (RLS) enabled on all tables. UI constants (categories, XP levels, tags) live in `src/data/constants.js`.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion 12 |
| Icons | Lucide React |
| Maps | @react-google-maps/api + use-places-autocomplete |
| Backend | Node.js + Express 4, deployed on Railway |
| Database | Supabase (Postgres) — events, communities, feed, users tables |
| Auth | JWT (jsonwebtoken) + bcryptjs — users stored in Supabase |
| Persistence | localStorage (frontend), Supabase (all backend data) |
| Deployment | GitHub Pages (frontend), Railway (backend) |
| Fonts | Outfit (headings), Quicksand (body) |

No Redux, no Zustand. Frontend state lives in `App.jsx` + localStorage. Backend uses Supabase (Postgres) for all persistence including auth.

---

## Directory Layout

```
/src
  App.jsx              # Main app — all state lives here
  api.js               # API client — all endpoints (auth, events, communities, feed, users)
  main.jsx             # Entry point + MangoContext provider
  index.css            # Design tokens, global styles, Tailwind overrides
  /components          # 38 UI components
  /contexts            # MangoContext (kitten assistant global state)
  /data
    constants.js       # UI constants: categories, tags, XP levels, advertised events
/server
  index.js             # Express entry — mounts all routers
  supabase.js          # Supabase client (service role, server-side only)
  matching.js          # Micro-Meet matching algorithm
  migrate.js           # DB migration runner (runs /migrations/*.sql)
  seed.js              # Seed data for Supabase tables
  package.json         # Server-specific deps (CommonJS)
  /migrations
    001_initial_schema.sql    # Tables, indexes, triggers
    002_seed_data.sql         # Demo communities and events
    003_users_table.sql       # Users table migration from JSON
    004_enable_rls.sql        # RLS policies on all tables
    005_fix_function_search_path.sql  # Security hardening
  /routes
    auth.js            # Login/register/me — Supabase
    events.js          # CRUD + RSVP/save/chat — Supabase
    communities.js     # CRUD + join/leave/feed — Supabase
    feed.js            # Global feed + reactions — Supabase
    users.js           # Profiles + recommendations — Supabase
/.claude
  settings.json        # MCP servers, hooks, skills config
  AUTOMATION_SETUP.md  # Full automation reference guide
  QUICKSTART.md        # 5-minute onboarding guide
  /agents              # Subagent definitions (code-reviewer, test-coverage-analyzer)
  /skills              # Skill definitions (gen-test, create-migration)
/public                # PWA icons, logos
/docs                  # QA notes, dev task docs
package.json           # Frontend deps (ESM) — v0.35.0
ANTIGRAVITY_BRAIN.md   # Design philosophy doc (read before UI changes)
```

---

## Architecture Patterns

**State management:** Everything in `App.jsx`. No store. Custom `useLocalStorage(key, initialValue)` hook handles persistence. Props drilled to components.

**Navigation:** Tab-based (`home` | `hub` | `explore` | `profile`). `setActiveTab` is the router. Mobile = BottomNav, Desktop = Sidebar.

**Modals/Sheets:** Controlled by boolean state in `App.jsx`. All wrapped in `<AnimatePresence>`.

**Auth flow:** Splash → (token in localStorage?) → App or AuthScreen. Session check runs `api.getMe(token)` on mount with 8s timeout. On failure, auto-logout.

**API client (`src/api.js`):** Wraps `fetch` with `parseJson()` helper — handles non-JSON responses, checks `response.ok`, throws descriptive `Error` objects. Callers show errors via `showToast`.

---

## Design System — "Warm Hearth"

**Full doc:** `ANTIGRAVITY_BRAIN.md` — read it before any UI changes.

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#E2725B` | Terracotta — actions, CTAs |
| `--secondary` | `#2D5F5D` | Teal — nav, text, calm sections |
| `--accent` | `#F4B942` | Gold — highlights, delight |
| `--bg-paper` | `#F9F7F2` | Background (never pure white) |
| `--text` | `#1A1C1C` | Main text |
| `--text-muted` | `#5C6363` | Secondary text |

**Critical rules:**
- Light mode only. Dark mode CSS vars exist but are unused.
- Never white text on light background.
- Inputs must use `text-[var(--text)]` — not Tailwind text utilities.
- Heavy roundness: `rounded-[24px]` / `rounded-[32px]` for cards/modals.
- Scrollbars hidden globally (`no-scrollbar`).
- Card class: `.premium-card`. Frosted glass: `.glass-2`. Glow: `.glow-primary`.

---

## Key Components

| Component | File | Notes |
|---|---|---|
| App | `src/App.jsx` | All state, all handlers. ~1500 lines. |
| Mango | `src/components/Mango.jsx` | Interactive kitten SVG, 44kb. Physics, poses, drag. |
| MangoSVG | `src/components/MangoSVG.jsx` | 74kb SVG definition. Don't touch unless working on Mango. |
| MangoContext | `src/contexts/MangoContext.jsx` | Global state: pose, visibility, chat, notifications. |
| EventDetailSheet | `src/components/EventDetailSheet.jsx` | Bottom sheet: info + chat tabs. |
| LocationPicker | `src/components/LocationPicker.jsx` | Google Maps + Places autocomplete. Has value-sync useEffect. |
| FeedItem | `src/components/FeedItem.jsx` | Threaded feed posts with emoji reactions. |
| OnboardingFlow | `src/components/OnboardingFlow.jsx` | 3-step: interests → location → group size. |
| CreateEventModal | `src/components/CreateEventModal.jsx` | Event creation form. |
| VideoWall | `src/components/VideoWall.jsx` | Auto-playing video showcase. |
| AuthScreen | `src/components/AuthScreen.jsx` | Login/register form. Demo: ben@demo.com / password. |
| Skeleton | `src/components/Skeleton.jsx` | Loading skeletons for each tab. |

---

## Data Models

**Event:**
```js
{ id, title, date, time, location, price, spots, image, category, attendees, host,
  isMicroMeet, matchScore?, matchTags?, theme? }
```

**User (localStorage + server):**
```js
{ id, email, name, location, avatar, bio, interests, tribe, isPro }
```

**Community/Tribe:**
```js
{ id, name, members, avatar, description, memberAvatars, category, isJoined }
```

**Chat Message:**
```js
{ id, user, avatar, message, time, isMe, isHost?, isSystem? }
```

**localStorage keys:**
| Key | Type | Content |
|---|---|---|
| `socialise_user` | Object | Authenticated user |
| `socialise_token` | String | JWT (set manually, not via useLocalStorage) |
| `socialise_pro` | Boolean | Pro subscription |
| `socialise_tribes` | Array | Joined tribe IDs (synced from API) |
| `socialise_onboarding_shown` | Boolean | Onboarding complete |
| `socialise_preferences` | Object | User onboarding prefs |
| `socialise_experimental` | Boolean | Experimental features toggle |
| `socialise_xp` | Number | User XP points (gamification) |
| `socialise_unlocked_titles` | Array | Unlocked achievement title IDs |

---

## Backend API

Base (local): `http://localhost:3001/api`
Base (production): `https://socialise-app-production.up.railway.app/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | None | Email + password → `{ token, user }` |
| POST | `/auth/register` | None | Email + password + name → `{ token, user }` |
| GET | `/auth/me` | Bearer token | Returns current user |
| GET | `/events` | Optional | List events from Supabase (filterable) |
| POST | `/events` | Required | Create event |
| GET | `/events/:id` | Optional | Single event detail |
| PUT | `/events/:id` | Required | Update event (host only) |
| DELETE | `/events/:id` | Required | Cancel event (host only) |
| POST | `/events/:id/join` | Required | Join event (RSVP) |
| POST | `/events/:id/leave` | Required | Leave event (Un-RSVP) |
| POST | `/events/:id/save` | Required | Save event |
| POST | `/events/:id/unsave` | Required | Unsave event |
| GET | `/events/:id/chat` | Optional | Get event chat messages |
| POST | `/events/:id/chat` | Required | Post chat message |
| GET | `/communities` | Optional | List communities from Supabase |
| GET | `/communities/:id` | Optional | Single community detail |
| POST | `/communities` | Required | Create community |
| POST | `/communities/:id/join` | Required | Join community |
| POST | `/communities/:id/leave` | Required | Leave community |
| GET | `/communities/:id/members` | Optional | Community members |
| GET | `/communities/:id/chat` | Optional | Community chat messages |
| POST | `/communities/:id/chat` | Required | Post to community chat |
| GET | `/feed` | Optional | Global feed from Supabase |
| POST | `/feed` | Required | Create feed post |
| DELETE | `/feed/:id` | Required | Delete own post |
| POST | `/feed/:id/react` | Required | Toggle emoji reaction |
| PUT | `/users/me` | Required | Update own profile |
| GET | `/users/me/events` | Required | My hosted + attending events |
| GET | `/users/me/saved` | Required | My saved events |
| GET | `/users/me/communities` | Required | My communities |
| GET | `/events/recommendations/for-you` | Required | Micro-Meet recommendations (by match score) |

**Demo credentials:** `ben@demo.com` / `password`

**User storage:** Supabase `users` table. Auth routes read/write Supabase directly via service role client.

**Environment variables (see `server/.env.example`):**
- `JWT_SECRET` — Secret for signing JWTs. Required in production.
- `PORT` — Server port. Defaults to 3001.
- `ALLOWED_ORIGINS` — Comma-separated CORS origins. Defaults to localhost dev origins.
- `SUPABASE_URL` — Supabase project URL. Required.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only, bypasses RLS). Required.

---

## What's Mock vs Real

| Thing | Status |
|---|---|
| Auth (login/register/JWT) | Real — users stored in Supabase `users` table |
| User data | Real (Supabase) |
| Events (backend + frontend) | Real — API + frontend wired via `api.getEvents()` |
| Communities (backend + frontend) | Real — API + frontend wired via `api.getCommunities()` |
| Feed (backend + frontend) | Real — API + frontend wired via `api.getFeed()` |
| Users API | Real (Supabase via `/api/users`) |
| Event join/leave | Real — optimistic UI + API calls |
| Event save/unsave | Real — optimistic UI + API calls |
| Community join/leave | Real — optimistic UI + API calls |
| Event chat messages | Real — fetched from API, sent via API |
| Micro-Meet recommendations | Real — matching algorithm in `server/matching.js` |
| Row Level Security | Real — RLS enabled and enforced on all tables |
| UI constants (categories, XP, tags) | Frontend-only — defined in `src/data/constants.js` |
| Realtime pings | Simulated with setTimeout |
| Pro subscription | UI only — no payment, no enforcement |
| Google login | Simulated — just loads DEMO_USER |

## Migration Status

**Goal:** Replace all mock data with real Supabase-backed API calls. **Status: Complete.**

**Completed (backend):**
- Supabase client configured in `server/supabase.js`
- Events, Communities, Feed, Users routes all wired to Supabase
- Auth migrated to Supabase `users` table — registration and login persist correctly on Railway
- Row Level Security (RLS) enabled and enforced on all tables (migration 004)
- Sensitive columns (password, verification codes) revoked from anon/authenticated Supabase roles
- `update_updated_at` trigger function secured with `search_path = ''` (migration 005)
- JWT_SECRET now throws in production if not set (no more insecure fallback)
- Duplicate JWT verification in communities.js replaced with shared `extractUserId` helper
- Micro-Meet matching algorithm (`server/matching.js`)
- Seed data script (`server/seed.js`)
- Migration runner (`server/migrate.js`) + 5 migration files in `server/migrations/`
- Railway deployment configured for production + development environments
- API URL now reads from `VITE_API_URL` env var (not hardcoded)
- GitHub Pages deploys to `/dev/` and `/prod/` subfolders via separate workflows

**Completed (frontend):**
- `src/api.js` has full API client: auth, events (CRUD + join/leave/save/unsave/chat), communities (CRUD + join/leave/chat), feed (CRUD + reactions), users (profile + my events/saved/communities)
- `App.jsx` calls real API via `fetchAllData()` on login — populates events, communities, feed from Supabase
- All mutations (join/leave/save/unsave/create/chat) use optimistic UI + API calls with error rollback
- Pull-to-refresh on home tab re-fetches all data from API
- `mockData.js` renamed to `constants.js` — only contains UI config (categories, XP levels, tags), not mock data
- Legacy `server/users.json` deleted
- Unused `resend` dependency removed from `server/package.json`

---

## What's Already Fixed (do not re-fix)

These bugs from the original issue list have been resolved in the codebase:

- `sendMessage` and `createNewEvent` use `user?.name ?? 'Guest'` / `user?.name ?? 'Host'` ✓
- `FeedItem` receives `currentUser={{ name: user?.name ?? 'Guest', avatar: user?.avatar ?? '' }}` ✓
- `LocationPicker.MapSearch` has a `useEffect` syncing `value` prop changes ✓
- `MatchAnalysisModal` uses `event.matchTags?.slice(0, 2).join(' & ') ?? 'this event'` ✓
- `EventDetailSheet` chat input uses `text-[var(--text)]` ✓
- `OnboardingFlow` receives `userName={user?.name ?? 'there'}` ✓
- `api.js` uses `parseJson()` wrapper + checks `response.ok` before throwing ✓
- `handleLogout` uses a stable `handleLogoutRef` to avoid dependency array issue ✓
- `deploy-develop.yml` no longer bumps the patch version — fixes `package.json` merge conflicts when promoting `development` → `production` ✓
- Auth migrated from `users.json` to Supabase `users` table — fixes ephemeral filesystem issue on Railway ✓
- Row Level Security (RLS) enabled on all Supabase tables with appropriate policies ✓
- `update_updated_at` function secured with immutable `search_path` ✓
- Email verification added then intentionally removed; unused `resend` dependency removed from `server/package.json` ✓
- GitHub Pages deploys to `/dev/` and `/prod/` subfolders — no more root-level conflicts ✓
- Frontend wired to real API — `mockData.js` renamed to `constants.js` (UI config only, no mock data) ✓
- Legacy `server/users.json` deleted (was already empty) ✓
- JWT_SECRET hardcoded fallback removed — now throws in production if env var not set ✓
- Duplicate inline JWT verification in `communities.js` replaced with shared `extractUserId` helper ✓
- Rate limiting added to `/auth/login` and `/auth/register` via `express-rate-limit` (15 requests per 15 min per IP) ✓
- ESLint config split into frontend (`src/`) and server (`server/`) blocks — 0 errors, 0 warnings ✓
- Unused `motion` import removed from `Sidebar.jsx`; remaining `motion` imports whitelisted (JSX member expression false positives) ✓
- CORS origin list logged on server startup for production verification ✓
- Native `loading="lazy"` added to all `<img>` tags in list/feed/modal components for deferred off-screen image loading ✓

---

## Known Gaps (to be addressed when scaling to production)

### Structural
- `App.jsx` is large with all state centralized. Needs breaking into feature slices or a proper store (Zustand recommended) when complexity grows further.
- No test coverage. Zero tests. Needs Vitest + React Testing Library for unit tests, Playwright or Cypress for E2E. (Use `/gen-test` skill to start.)
- No real-time. Supabase Realtime could replace the current `setTimeout` simulation for live feed/chat.

### Security
- CORS defaults to dev origins — set `ALLOWED_ORIGINS` env var in production. Server logs active origins on startup for verification.
- localStorage token storage is XSS-vulnerable. For production: HttpOnly cookies.
- No email verification on registration.
- RLS policies are permissive (allow all via service role) — consider tightening if frontend ever talks to Supabase directly.

### UX
- Pro features (Socialise Pass, Go Pro, PRO badges, Sidebar Go Premium) are behind the experimental features toggle. Not enforced on backend (isPro not checked in logic).
- No offline support / service worker.
- No accessibility audit — limited ARIA, no keyboard nav testing.

### ESLint

ESLint passes clean (0 errors, 0 warnings). The config (`eslint.config.js`) has two blocks:
- **`src/**`** — Browser globals, React hooks plugin, Vite refresh plugin. `motion` is whitelisted in `varsIgnorePattern` because `<motion.div>` JSX member expressions aren't recognized as usage by `no-unused-vars`.
- **`server/**`** — Node.js globals, CommonJS `sourceType`. Underscore-prefixed args (`_password`, `_code`) are ignored.

---

## Database & Row Level Security

**Security model:** Frontend never talks to Supabase directly. All requests go through Express, which uses the Supabase service role key (`bypassrls=true`). RLS protects against direct database access.

**Tables with RLS enabled and forced:**
`users`, `events`, `event_rsvps`, `saved_events`, `chat_messages`, `communities`, `community_members`, `community_messages`, `feed_posts`, `post_reactions`

**Key restrictions:**
- Sensitive columns (`password`, `verification_code`, `verification_code_expiry`) revoked from `anon` and `authenticated` roles
- No direct INSERT/UPDATE/DELETE on `users` table from frontend roles
- All data mutation goes through Express API → service role client

**Migrations:** Run via `node server/migrate.js`. Files in `server/migrations/` are executed in order (001–005). See Directory Layout above for details.

---

## Claude Code Automations

Configuration lives in `.claude/`. Full docs: `.claude/AUTOMATION_SETUP.md` and `.claude/QUICKSTART.md`.

| Type | Name | Purpose |
|---|---|---|
| MCP Server | GitHub | PR, issue, workflow management |
| MCP Server | Supabase | Direct database queries and schema inspection |
| Hook | `auto-lint` | Runs `npm run lint -- --fix` on `.jsx`/`.js` edits |
| Hook | `block-env` | Prevents editing `.env` files |
| Skill | `/gen-test` | Generate unit tests (Vitest + React Testing Library) |
| Skill | `/create-migration` | Create Supabase migration files |
| Subagent | `code-reviewer` | Security, quality, design system compliance review |
| Subagent | `test-coverage-analyzer` | Identify untested code and coverage gaps |
| Workflow | `auto-approve` | Auto-approves, squash-merges, and deletes branch for conflict-free PRs |

---

## Development Workflow

### Branches

| Branch | Environment | GitHub Pages | Backend | Workflow |
|--------|---|---|---|---|
| `development` | Development/Preview | `/SocialiseApp/dev/` | `socialise-app-development.up.railway.app` | `deploy-develop.yml` |
| `master` | Production | `/SocialiseApp/prod/` | `socialise-app-production.up.railway.app` | `deploy-master.yml` |

**Workflow:**
1. Create feature branches from `development`
2. Test locally with local backend
3. Push to `development` → auto-deploys to `/dev/` preview for testing
4. Merge `development` → `production` → auto-deploys to `/prod/` production

**Auto-approve PRs:** The `auto-approve.yml` workflow runs on all PRs. If a PR has no merge conflicts, it automatically approves, squash-merges, and deletes the source branch. PRs with conflicts get a comment and are skipped.

### Running Locally

**Setup:**
```bash
# Frontend
npm run dev          # Vite dev server @ localhost:5173

# Backend (separate terminal)
cd server
npm install
node index.js        # Express @ localhost:3001
```

**Environment variables:**
- Frontend: `VITE_GOOGLE_MAPS_API_KEY` + `VITE_API_URL=http://localhost:3001/api` in `.env` (see `.env.example`)
- Backend: `JWT_SECRET`, `PORT`, `ALLOWED_ORIGINS` in `server/.env` (see `server/.env.example`)

**Deployment:**
- `development` branch → GitHub Actions auto-deploys to `/dev/` + uses `socialise-app-development` Railway project
- `production` branch → GitHub Actions auto-deploys to `/prod/` + uses `socialise-app-production` Railway project

**Versioning:**
- `production` deploy bumps the minor version (x.**y**.0) in `package.json` and syncs it back to `development`.
- `development` deploy does **not** bump the version — this is intentional. Both branches must stay on the same version to avoid merge conflicts when promoting `development` → `production`.

**ESLint:** `npm run lint` — React hooks rules enabled. Fix lint errors before pushing.

**Tailwind v4:** Uses CSS-native `@import "tailwindcss"` — no `tailwind.config.js` in the traditional sense. CSS variables in `index.css` are the source of truth for the design system.

---

## Conventions

- Components use default exports.
- State handlers defined in `App.jsx`, passed as props.
- Toast notifications via `showToast(message, type)` — types: `'success'`, `'error'`, `'info'`.
- Optional chaining everywhere user/event data is accessed: `user?.name ?? 'fallback'`.
- Framer Motion used for all transitions. `AnimatePresence` wraps conditionally rendered elements.
- Never hardcode `#ffffff` or `black` — always use design token CSS vars or Tailwind utilities mapped to those vars.

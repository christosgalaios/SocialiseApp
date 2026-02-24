# Socialise App — Claude Brain

> Fast-reference context for Claude Code. Read this file before touching anything.

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

**State management:** Zustand stores in `src/stores/`. Tab content extracted to `HomeTab`, `HubTab`, `ExploreTab`, `ProfileTab`. Modals in `AppModals`. `App.jsx` is layout + effects + routing (~500 lines). Backend uses Supabase (Postgres) for all persistence including auth.

---

## Directory Layout

```
/src
  App.jsx              # Layout, effects, routing (~500 lines)
  api.js               # API client — all endpoints (auth, events, communities, feed, users)
  main.jsx             # Entry point + MangoContext provider
  index.css            # Design tokens, global styles, Tailwind overrides
  /stores              # Zustand stores (auth, events, communities, feed, ui)
  /components          # UI components (incl. HomeTab, HubTab, ExploreTab, ProfileTab, AppModals)
  /contexts            # MangoContext (kitten assistant global state)
  /hooks
    useAccessibility.js  # useEscapeKey + useFocusTrap hooks for modal/sheet accessibility
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
    006_login_streak.sql              # Login streak columns
    007_user_xp.sql                   # XP and unlocked titles columns
    008_bug_reports.sql                # Bug reports table (replaces BUGS.md file)
    009_bug_report_version.sql         # Add app_version column to bug_reports
    010_bug_report_platform.sql         # Add platform column to bug_reports
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
package.json           # Frontend deps (ESM) — v0.1.0
```

---

## Architecture Patterns

**State management:** Zustand stores in `src/stores/` — `authStore` (user, login, logout, session), `eventStore` (events, RSVP, save, chat), `communityStore` (communities, join/leave), `feedStore` (posts, reactions), `uiStore` (tabs, modals, filters, toasts, XP, preferences). Components import stores directly — no prop drilling for shared state.

**Navigation:** Tab-based (`home` | `hub` | `explore` | `profile`). `setActiveTab` in uiStore is the router. Mobile = BottomNav, Desktop = Sidebar. Tab content lives in `HomeTab`, `HubTab`, `ExploreTab`, `ProfileTab`.

**Modals/Sheets:** Controlled by boolean state in `uiStore`. Rendered by `AppModals` component. All wrapped in `<AnimatePresence>`.

**Auth flow:** Splash → (token in localStorage?) → App or AuthScreen. Session check runs `api.getMe(token)` on mount with 8s timeout. On failure, auto-logout.

**API client (`src/api.js`):** Wraps `fetch` with `parseJson()` helper — handles non-JSON responses, checks `response.ok`, throws descriptive `Error` objects. Callers show errors via `showToast`.

**Code splitting:** Vite `manualChunks` splits framer-motion (129kb) and Google Maps (158kb) into separate cacheable vendor chunks. Heavy conditional components (`MangoChat`, `MangoAssistant`, `OnboardingFlow`, `CreateEventModal`, `EventReels`) use `React.lazy()` + `Suspense` for on-demand loading. Main chunk: ~393kb.

---

## Design System — "Warm Hearth"

**Philosophy:** Prioritize human connection over cold "tech" aesthetics. The app should feel tactile, grounded, and inviting.

| Token | Value | Name | Usage |
|---|---|---|---|
| `--primary` | `#E2725B` | Community Terracotta | Warm, inviting — actions, CTAs, interactions |
| `--secondary` | `#2D5F5D` | Open Door Teal | Grounded, calm — nav, text, secondary gradients |
| `--accent` | `#F4B942` | Latecomer Gold | Highlights, sparks, "delight" moments |
| `--bg-paper` | `#F9F7F2` | Paper White | Background (never pure `#FFFFFF`) |
| `--text` | `#1A1C1C` | Soft Charcoal | Main text (high contrast but softer than pure black) |
| `--text-muted` | `#5C6363` | — | Secondary text, placeholders |

**Typography:** `Outfit` for headings (bold, rounded, friendly). `Quicksand` for body (rounded sans-serif, high readability).

**Critical rules:**
- Light mode only. Dark mode CSS vars exist but are unused.
- Never white text on light background.
- Inputs must use `text-[var(--text)]` — not Tailwind text utilities.
- Heavy roundness: `rounded-[24px]` / `rounded-[32px]` for cards/modals. `rounded-2xl` for inner elements.
- Scrollbars hidden globally (`no-scrollbar`).
- Card class: `.premium-card`. Frosted glass: `.glass-2`. Glow: `.glow-primary`.

**Component patterns:**
- **Modals:** Centered, `fixed inset-0`, backdrop blur (`bg-secondary/60 backdrop-blur-sm`). Paper-colored content box.
- **Sheets:** Slide-up from bottom (mobile style). Used for bookings, saved, help, etc.
- **Feed:** Threaded comments with hard max-depth of 1 (comment → reply, no deeper nesting). Emoji toggles (one per person).
- **Maps:** `LocationPicker.jsx` handles autocomplete + pin. Graceful failure: shows "Key missing" UI if `VITE_GOOGLE_MAPS_API_KEY` is absent.

---

## Key Components

| Component | File | Notes |
|---|---|---|
| App | `src/App.jsx` | Layout, effects, routing. ~500 lines. |
| HomeTab | `src/components/HomeTab.jsx` | Home tab: recommendations, video wall, events. |
| HubTab | `src/components/HubTab.jsx` | Hub tab: communities/tribes. |
| ExploreTab | `src/components/ExploreTab.jsx` | Explore tab: search, filters, event list. |
| ProfileTab | `src/components/ProfileTab.jsx` | Profile + settings tabs. |
| AppModals | `src/components/AppModals.jsx` | All modals/sheets centralized. |
| Mango | `src/components/Mango.jsx` | Interactive kitten SVG, 44kb. Physics, poses, drag. SVG defined inline. |
| MangoContext | `src/contexts/MangoContext.jsx` | Global state: pose, visibility, chat, notifications. |
| EventDetailSheet | `src/components/EventDetailSheet.jsx` | Bottom sheet: info + chat tabs. |
| LocationPicker | `src/components/LocationPicker.jsx` | Google Maps + Places autocomplete. Has value-sync useEffect. |
| FeedItem | `src/components/FeedItem.jsx` | Threaded feed posts with emoji reactions. |
| OnboardingFlow | `src/components/OnboardingFlow.jsx` | 3-step: interests → location → group size. |
| CreateEventModal | `src/components/CreateEventModal.jsx` | Event creation form. |
| VideoWall | `src/components/VideoWall.jsx` | Auto-playing video showcase. |
| AuthScreen | `src/components/AuthScreen.jsx` | Login/register form. Demo: ben@demo.com / password (blocked in prod). |
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
| `socialise_xp` | Number | User XP points (synced from Supabase, cached locally) |
| `socialise_unlocked_titles` | Array | Unlocked achievement title IDs (synced from Supabase, cached locally) |

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
| PUT | `/users/me/xp` | Required | Update XP and/or unlocked titles |
| GET | `/users/me/events` | Required | My hosted + attending events |
| GET | `/users/me/saved` | Required | My saved events |
| GET | `/users/me/communities` | Required | My communities |
| GET | `/events/recommendations/for-you` | Required | Micro-Meet recommendations (by match score) |
| POST | `/bugs` | Required | Submit bug report (stored in Supabase `bug_reports` table) |
| GET | `/bugs` | Required | List bug reports (filterable by `?status=open`) |
| PUT | `/bugs/:bugId` | Required | Update bug report status/priority (used by `/fix-bugs` skill) |

**Demo credentials:** `ben@demo.com` / `password` (blocked in production — `NODE_ENV=production` returns 403)

**User storage:** Supabase `users` table. Auth routes read/write Supabase directly via service role client.

**Environment variables (see `server/.env.example`):**
- `JWT_SECRET` — Secret for signing JWTs. Required in production.
- `PORT` — Server port. Defaults to 3001.
- `ALLOWED_ORIGINS` — Comma-separated CORS origins. Defaults to localhost dev origins.
- `SUPABASE_URL` — Supabase project URL. Required.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only, bypasses RLS). Required.
- `BUGS_SHEET_WEBHOOK_URL` — Optional. Google Apps Script web app URL. When set, bug reports are synced to a Google Sheet in real time (fire-and-forget — failures don't affect the API response). Supports two modes: new bug creation (appends row) and status updates via `PUT /bugs/:bugId` (updates existing row by `bug_id`). The Apps Script uses header-based column lookup (not hardcoded indices) so columns can be reordered freely. Environment values are `PROD` (from `/prod/` page), `DEV` (from `/dev/` page), or `LOCAL` (localhost). The "Fixed At" column is auto-populated by the Apps Script when a bug's status is set to `fixed`. The Apps Script source is in `docs/google-sheets-apps-script.js`.

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
| XP and unlocked titles | Real — persisted in Supabase `users` table, synced on login, updated via `PUT /users/me/xp` |
| UI constants (categories, XP levels, tags) | Frontend-only — defined in `src/data/constants.js` |
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
- Migration runner (`server/migrate.js`) + 10 migration files in `server/migrations/`
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
- Version bumping removed from all deploy workflows — version now derived dynamically from latest merged PR number (`0.1.{PR#}`) via `VITE_APP_VERSION` env var, eliminating all version-related merge conflicts and branch divergence ✓
- Auth migrated from `users.json` to Supabase `users` table — fixes ephemeral filesystem issue on Railway ✓
- Row Level Security (RLS) enabled on all Supabase tables with appropriate policies ✓
- `update_updated_at` function secured with immutable `search_path` ✓
- Email verification added then intentionally removed; unused `resend` dependency removed from `server/package.json` ✓
- GitHub Pages deploys to `/dev/` and `/prod/` subfolders — no more root-level conflicts ✓
- Frontend wired to real API — `mockData.js` renamed to `constants.js` (UI config only, no mock data) ✓
- Legacy `server/users.json` deleted (was already empty) ✓
- JWT_SECRET hardcoded fallback removed — now throws in production if env var not set. Dev fallback uses `crypto.randomBytes()` (not a predictable string) ✓
- Duplicate inline JWT verification in `communities.js` replaced with shared `extractUserId` helper ✓
- Rate limiting added to `/auth/login` and `/auth/register` via `express-rate-limit` (15 requests per 15 min per IP). Mutation rate limiter (100 req/15 min) added globally to events, communities, feed, and users routes ✓
- Demo account (`ben@demo.com`) blocked in production (`NODE_ENV=production` returns 403) ✓
- `.gitleaksignore` added to suppress false positives from old dev-only JWT fallback string in git history ✓
- ESLint config split into frontend (`src/`) and server (`server/`) blocks — 0 errors, 0 warnings ✓
- Unused `motion` import removed from `Sidebar.jsx`; remaining `motion` imports whitelisted (JSX member expression false positives) ✓
- CORS origin list logged on server startup for production verification ✓
- Native `loading="lazy"` added to all `<img>` tags in list/feed/modal components for deferred off-screen image loading ✓
- `auto-approve.yml` now runs lint, tests, and build before approving PRs (validate job) ✓
- ESLint config expanded with Vitest globals for test files and ESM sourceType for server tests ✓
- `react-hooks` v7 compiler rules (`purity`, `immutability`, `set-state-in-effect`) disabled until Phase 2 refactor ✓
- `server/routes/**/*.test.js` excluded from root Vitest config (server-only deps can't resolve in jsdom) ✓
- All pre-existing lint errors fixed: unused vars/imports removed, `global` → `globalThis`, `process.env` → `import.meta.env` ✓
- Phase 1 test infrastructure complete: 401 tests (229 frontend + 172 server) across 13 test files ✓
- Phase 2 state management refactor: Zustand stores replace custom hooks, App.jsx reduced from ~1500 to ~500 lines ✓
- Tab components extracted: HomeTab, HubTab, ExploreTab, ProfileTab, AppModals — each imports Zustand stores directly ✓
- Store tests added: 111 tests across 5 store test files (total: 512 tests) ✓
- BottomNav fixed to use `setActiveTabWithEffects` — restores scroll-to-top and mango animations on mobile tab switches ✓
- MyBookingsSheet cancel now calls `api.leaveEvent()` with rollback on failure (was optimistic-only with stale closure) ✓
- Bundle optimized from 736kb → 389kb main chunk via code splitting: `manualChunks` for vendor libs + `React.lazy()` for heavy conditional components ✓
- Google Maps chunk (158kb) lazy-loaded — only fetched when CreateEventModal opens ✓
- `MangoSVG.jsx` (74kb) deleted — orphaned, component defined inline in `Mango.jsx` ✓
- Orphaned hooks directory (`src/hooks/`) deleted — replaced by Zustand stores in Phase 2 ✓
- Orphaned `EmailVerificationModal.jsx` deleted — email verification intentionally removed ✓
- `GroupChatsSheet` wired to real API — removed localStorage fallback, fake `AUTO_REPLIES`, and simulated online count ✓
- Phase 4 accessibility: `useEscapeKey` + `useFocusTrap` hooks, ARIA roles on all 14 modals/sheets, keyboard nav on BottomNav/Sidebar, skip link, `prefers-reduced-motion`, `aria-live` toasts ✓
- `bg-black/60` replaced with `bg-secondary/60` in 5 modal overlays (MyBookingsSheet, SavedEventsSheet, ProUpgradeModal, HelpSheet, TribeDiscovery) ✓
- EventDetailSheet empty chat state: white text → `text-secondary` (design system violation) ✓
- ErrorBoundary improved: `role="alert"`, design system styling, Try Again + Reload buttons ✓
- Missing `loading="lazy"` added to img tags in MyBookingsSheet, SavedEventsSheet, TribeSheet ✓
- HomeTab `refreshRecommendations` now handles errors with error toast (was showing success on failure) ✓
- `FeedItem` `handleReply` and `submitComment` use `currentUser?.name ?? 'Guest'` instead of `currentUser.name` (null safety) ✓
- Blob URL memory leak in ProfileTab `handleAvatarUpload` fixed — revokes previous URL before creating new one ✓
- `EventReels` slideshow images have `onError` fallback (skip to next image on load failure) ✓
- `loading="lazy"` added to all remaining img tags: HomeTab, ProfileTab, AuthScreen, IOSInstallPrompt, RealtimePing ✓
- Component test coverage expanded: 409 frontend tests across 18 test files (useAccessibility 16, BottomNav 16, Toast 10, Sidebar 16, ErrorBoundary 11) ✓
- `auto-approve.yml` blocks feature branch PRs from targeting `production` — only `development` → `production` PRs are allowed ✓
- `deploy-production.yml` back-merges production into development after deploy — keeps branches in sync (merge commits from development→production PRs no longer cause "behind" drift) ✓
- XP and unlocked titles persisted to Supabase `users` table (migration 007) — fixes level mismatch between prod and dev environments. Auth responses include `xp` and `unlockedTitles`, synced to uiStore on login/session check. `PUT /api/users/me/xp` endpoint for updates. ✓
- EventReels swipe freeze fixed — `isAnimating` ref guard prevents rapid swipe state changes during `AnimatePresence` transitions, `onTouchCancel` handler resets stale touch refs, `touchStartY` reset on touch end (BUG-1771870680693) ✓
- CreateEventModal hardlock fixed — `isSubmitting` state with loading spinner prevents double-submission and gives users feedback during API calls (BUG-1771870610374) ✓
- VideoWall timeout accumulation fixed — `handleInteractionEnd` clears previous timeout before creating a new one, preventing leaked `setTimeout` callbacks that caused jank (BUG-1771870610374) ✓
- `PUT /api/bugs/:bugId` now syncs status/priority updates to Google Sheet via Apps Script webhook (fire-and-forget, same as `POST /bugs`) ✓
- Bug report environment detection uses short uppercase values: `PROD` (from `/prod/` page), `DEV` (from `/dev/` page), `LOCAL` (localhost) — consistent with Google Sheet dropdown options ✓
- Google Sheet Apps Script uses header-based column lookup (`getColumnMap_`) instead of hardcoded indices — columns can be reordered freely without breaking create/update logic ✓
- `/fix-bugs` skill fetches from Google Sheet (single source), auto-prioritizes and updates the sheet first, then shows summary table and asks what to fix (all open / P1 only / specific bug) ✓
- Google Sheet "Fixed At" column auto-populated by Apps Script when status is set to `fixed` — timestamps when each bug was resolved ✓
- `/fix-bugs` workflow processes bugs ONE AT A TIME: mark `in-progress` in Supabase → fix code → mark `fixed` in Supabase → commit + push → next bug. Status updates go directly to Supabase REST API (`PATCH $SUPABASE_URL/rest/v1/bug_reports`) using the service role key — never skip this step. No automatic pickup of new bugs after completing the agreed list ✓
- LocationPicker shows fallback text input when Google Maps API key is missing or fails to load (BUG-1771938422741) ✓
- CreateEventModal close button enlarged to 40x40 touch target, z-index stacking fixed, overflow-x-hidden for reliable scrolling (BUG-1771938439942) ✓
- Explore filters (category, search, size, date, tags) no longer affect HomeTab — `filteredEvents` scoped to ExploreTab only; HomeTab uses full unfiltered events from store; Sidebar "Discover" category section only renders on explore tab (BUG-1771942366608) ✓
- CreateEventModal close button given explicit `z-30` and `bg-paper` to prevent occlusion during scroll on mobile (BUG-1771942525165) ✓
- Bug reports now capture platform info (OS, browser, device type) — auto-detected from `navigator.userAgent` in `BugReportModal`, stored in `bug_reports.platform` column (migration 010), synced to Google Sheet ✓

---

## Roadmap — Prioritized Next Steps

> Ordered by impact and dependency. Complete each phase before moving to the next.

### Phase 0: CI Safety Net (Quick Win) ✅

**Why first:** The `auto-approve.yml` workflow merges PRs based on mergeability alone — no lint, no build check. A broken build can land on `development` automatically. This is a one-step fix with the highest safety-to-effort ratio.

- [x] Add `npm run lint`, `npm run build`, and `npm test` steps to `auto-approve.yml` before the approve/merge step (validate job)
- [x] Fix all pre-existing lint errors exposed by CI gates (91 errors → 0 errors, 6 warnings)
- [x] Exclude `server/routes/**/*.test.js` from root Vitest config (server-only deps can't resolve in jsdom)

### Phase 1: Test Infrastructure ✅

**Status:** Complete. 581 tests across 18 test files (409 frontend + 172 server). All passing.

- [x] Install Vitest + React Testing Library + jsdom (frontend)
- [x] Add `npm test` script to both `package.json` files
- [x] Write backend route tests: `auth.js` (30), `events.js` (37), `communities.js` (33), `feed.js` (30), `matching.js` (42)
- [x] Write frontend component tests: `AuthScreen` (22), `CreateEventModal` (23), `EventDetailSheet` (31), `FeedItem` (23), `OnboardingFlow` (27), `EventCard` (22), `BottomNav` (16), `Toast` (10), `Sidebar` (16), `ErrorBoundary` (11)
- [x] Write `api.js` unit tests (39 tests — mock fetch, error handling, parseJson)
- [x] Write `useAccessibility` hook tests (16 tests — useEscapeKey + useFocusTrap)

### Phase 2: State Management Refactor ✅

**Status:** Complete. Zustand stores replace custom hooks. `App.jsx` reduced from ~1500 to ~500 lines.

- [x] Install Zustand (v5.0.11)
- [x] Extract auth state into `src/stores/authStore.js`
- [x] Extract events state into `src/stores/eventStore.js`
- [x] Extract communities state into `src/stores/communityStore.js`
- [x] Extract feed state into `src/stores/feedStore.js`
- [x] Extract UI state into `src/stores/uiStore.js`
- [x] Extract tab components: `HomeTab`, `HubTab`, `ExploreTab`, `ProfileTab`
- [x] Extract `AppModals` component
- [x] Slim `App.jsx` to layout + effects + routing
- [x] Write store tests: authStore (13), eventStore (35), communityStore (18), feedStore (7), uiStore (38)
- [x] Verify all 512 tests still pass after refactor

### Phase 3: Wire Remaining Mock Data + Real-Time

**Why third:** `GroupChatsSheet` still uses `localStorage` for community chat messages and `setTimeout` for fake auto-replies (`Sarah K.`, `Marcus V.`) — despite real API endpoints existing (`GET/POST /communities/:id/chat`). `RealtimePing` state is initialized but never triggered. With clean state management (Phase 2), these become straightforward to fix.

- [x] Wire `GroupChatsSheet` to real API: fetch messages via `api.getCommunityChat()`, send via `api.sendCommunityMessage()` — removed localStorage fallback, fake `AUTO_REPLIES`, and simulated online count
- [ ] Subscribe to `chat_messages` table changes for live event chat (Supabase Realtime)
- [ ] Subscribe to `community_messages` for live community chat
- [ ] Subscribe to `feed_posts` and `post_reactions` for live feed updates
- [x] Remove `setTimeout` simulations — fake auto-replies removed from GroupChatsSheet; remaining setTimeouts in App.jsx are legitimate UX timing (debounce, skeleton, celebration)
- [ ] Wire `RealtimePing` to actual subscription events (currently initialized to `{ isVisible: false }` and never triggered)
- [x] Replace hardcoded online member count in `GroupChatsSheet` (`Math.floor(members * 0.08)`) — removed fake count, shows member count only
- [ ] Add connection status indicator (connected/reconnecting)
- [ ] Handle Realtime subscription cleanup on unmount

### Phase 4: Accessibility ✅

**Status:** Complete. Accessibility hooks (`useEscapeKey`, `useFocusTrap`) in `src/hooks/useAccessibility.js`. All 14 modals/sheets have `role="dialog"`, `aria-modal`, `aria-label`, Escape key close, and focus trapping. Navigation has ARIA tablist/listbox patterns with arrow key support. Skip link and `prefers-reduced-motion` added globally.

- [x] Add ARIA roles and labels to all modals/sheets (14 components: EventDetailSheet, CreateEventModal, GroupChatsSheet, TribeSheet, TribeDiscovery, MyBookingsSheet, SavedEventsSheet, ProUpgradeModal, HelpSheet, LevelUpModal, UserProfileSheet, MatchAnalysisModal, AvatarCropModal, Level Detail inline)
- [x] Add keyboard navigation to `BottomNav` (role="tablist", arrow keys cycle tabs) and `Sidebar` (role="listbox", arrow keys cycle categories)
- [x] Add focus trapping to all modal/sheet components via shared `useFocusTrap` hook (traps Tab, restores focus on close)
- [x] Add Escape key close to all modals/sheets via shared `useEscapeKey` hook
- [x] Add `aria-live="polite"` region to Toast notifications (screen readers announce toasts)
- [x] Add skip-to-content link (`<a href="#main-content">`) with `.sr-only` styling in App.jsx
- [x] Add `prefers-reduced-motion` media query in `index.css` — disables all CSS animations/transitions
- [x] Add `aria-label` to all icon-only buttons (close, send, phone, video, notification toggle, leave, etc.)
- [x] Add `aria-hidden="true"` to decorative elements (glow rings, active indicators, chevron icons)
- [x] BottomNav uses `<nav>` landmark with `aria-label="Main navigation"`
- [x] Sidebar uses `<nav>` landmark with `aria-label="Category filter"`
- [ ] Test with screen reader (VoiceOver/NVDA) and keyboard-only navigation

### Phase 5: Security Hardening (Pre-Launch)

**Why fifth:** Current security is adequate for development but not production launch. These items become critical before real users arrive.

- [ ] Move JWT from `localStorage` to HttpOnly cookies (requires backend cookie middleware + frontend fetch credential changes)
- [ ] Add email verification on registration (Supabase Auth or custom SMTP)
- [ ] Set `ALLOWED_ORIGINS` env var in production Railway to exact production domains only
- [ ] Tighten RLS policies — restrict beyond service role if frontend ever talks to Supabase directly
- [ ] Add CSRF protection if moving to cookie-based auth
- [x] Add rate limiting to all mutation endpoints (100 req/15 min for POST/PUT/DELETE on events, communities, feed, users)

### Phase 6: Bug Fixes + Production Polish

**Why last:** These improve the experience but don't block core functionality.

**Documented P1 bugs** (see `docs/MANGO_DEV_TASKS.md` — verify against `docs/MANGO_QA_SIGNOFF.md` for current state):
- [ ] BUG-1: Mango position not persisted when wall crawl is interrupted by tap — `onPositionChange` never called in that branch
- [ ] BUG-2: Mango pose stays `wall_grab` when dragging back off wall — no pose reset to `carried` when leaving wall zone mid-drag

**Production polish:**
- [ ] Enforce Pro features on backend (`isPro` check on premium endpoints)
- [ ] Add service worker for offline support / PWA install prompt
- [ ] Implement Google OAuth (currently simulated with DEMO_USER)
- [ ] During signup, ask users whether they are primarily here to attend events or host events — store as a `role` preference (`attendee` | `host`) and use it to personalise the default tab, recommendations, and onboarding tips
- [ ] Add error boundary components for graceful crash recovery
- [x] Performance audit: bundle splitting (736kb → 389kb main chunk), lazy-load heavy components (MangoChat, MangoAssistant, OnboardingFlow, CreateEventModal, EventReels), vendor chunks for framer-motion and Google Maps
- [x] Delete orphaned `MangoSVG.jsx` (74kb, not imported — SVG defined inline in `Mango.jsx`)
- [x] Delete orphaned hooks (`src/hooks/` — replaced by Zustand stores)
- [x] Delete orphaned `EmailVerificationModal.jsx` (email verification intentionally removed)

### Phase 7: TikTok Integration

**Why:** Allow event hosts to connect their TikTok account and embed TikTok videos directly into event listings — richer event previews, better engagement, and leverages content creators already promoting events on TikTok.

- [ ] Add TikTok OAuth flow (connect/disconnect TikTok account in Profile settings)
- [ ] Store TikTok connection tokens securely in Supabase `users` table (new columns: `tiktok_user_id`, `tiktok_access_token`, `tiktok_username`)
- [ ] Create migration for TikTok user fields
- [ ] Add TikTok video URL field to event creation form (`CreateEventModal`)
- [ ] Build `TikTokEmbed` component — renders TikTok oEmbed player for event detail pages
- [ ] Add TikTok video display to `EventDetailSheet` (show embedded video in event info tab)
- [ ] Add backend routes: `POST /api/auth/tiktok/connect`, `POST /api/auth/tiktok/disconnect`, `GET /api/auth/tiktok/callback`
- [ ] Add TikTok oEmbed proxy endpoint (`GET /api/tiktok/oembed?url=...`) to avoid CORS issues
- [ ] Validate TikTok URLs server-side before storing (must match `tiktok.com/@user/video/...` pattern)
- [ ] Show connected TikTok username badge on host profiles
- [ ] Allow hosts to browse/select from their own TikTok videos when creating events (TikTok Display API)
- [ ] Add TikTok video previews to event cards in feed/explore views (thumbnail + play icon)

### ESLint

ESLint passes clean (0 errors, 0 warnings). The config (`eslint.config.js`) has four blocks:
- **`src/**`** — Browser globals, React hooks plugin, Vite refresh plugin. `motion` is whitelisted in `varsIgnorePattern` because `<motion.div>` JSX member expressions aren't recognized as usage by `no-unused-vars`. Three `react-hooks` v7 rules disabled (`purity`, `immutability`, `set-state-in-effect`) — they require Phase 2 state refactor to fix properly.
- **`src/**/*.test.*` + `src/test/**`** — Adds Vitest globals (`describe`, `it`, `expect`, `vi`, `beforeAll`, `afterAll`, etc.) and `globalThis`.
- **`server/**` (excluding tests)** — Node.js globals, CommonJS `sourceType`. Underscore-prefixed args (`_password`, `_code`) are ignored.
- **`server/**/*.test.js`** — Node.js + Vitest globals, ESM `sourceType` (server tests use `import`).

---

## Database & Row Level Security

**Security model:** Frontend never talks to Supabase directly. All requests go through Express, which uses the Supabase service role key (`bypassrls=true`). RLS protects against direct database access.

**Tables with RLS enabled and forced:**
`users`, `events`, `event_rsvps`, `saved_events`, `chat_messages`, `communities`, `community_members`, `community_messages`, `feed_posts`, `post_reactions`, `bug_reports`

**Key restrictions:**
- Sensitive columns (`password`, `verification_code`, `verification_code_expiry`) revoked from `anon` and `authenticated` roles
- No direct INSERT/UPDATE/DELETE on `users` table from frontend roles
- All data mutation goes through Express API → service role client

**Migrations:** Run via `node server/migrate.js`. Files in `server/migrations/` are executed in order (001–010). See Directory Layout above for details.

---

## Claude Code Automations

Configuration lives in `.claude/`. Full docs: `.claude/AUTOMATION_SETUP.md` and `.claude/QUICKSTART.md`.

| Type | Name | Purpose |
|---|---|---|
| MCP Server | GitHub | PR, issue, workflow management |
| MCP Server | Supabase | Direct database queries and schema inspection |
| Hook | `session-start` | Creates `server/.env` from env vars + starts backend on session start |
| Hook | `auto-lint` | Runs `npm run lint -- --fix` on `.jsx`/`.js` edits |
| Hook | `block-env` | Prevents editing `.env` files |
| Skill | `/gen-test` | Generate unit tests (Vitest + React Testing Library) |
| Skill | `/create-migration` | Create Supabase migration files |
| Skill | `/fix-bugs` | Process bug reports from Google Sheet — validate, fix, and commit |
| Subagent | `code-reviewer` | Security, quality, design system compliance review |
| Subagent | `test-coverage-analyzer` | Identify untested code and coverage gaps |
| Subagent | `bug-fixer` | Validates bug reports and creates minimal fixes (bug-only, no features) |
| Workflow | `auto-approve` | Blocks feature→production PRs, validates (lint + test + build), then auto-approves, squash-merges, and deletes branch for conflict-free PRs |
| Workflow | `bug-fixer` | Triggered by `bug` label on issues — validates, fixes, and creates PR via Claude Code |

---

## Changelog

`CHANGELOG.md` in the project root tracks all user-facing changes using the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**When to update it:** Every PR that delivers a user-facing change — new feature, bug fix, behaviour change, or security improvement.

**How to update it:**
1. Open `CHANGELOG.md`.
2. Add entries under the `[Unreleased]` section at the top using the appropriate category:
   - **Added** — new feature or capability
   - **Changed** — behaviour that worked before but works differently now
   - **Fixed** — something that was broken and is now correct
   - **Removed** — feature or behaviour intentionally dropped
   - **Security** — vulnerability fix or hardening
3. Write entries from the **user's perspective** — describe what they can now do or what no longer breaks, not the internal implementation detail.
4. When a batch of changes ships to production, rename `[Unreleased]` to `[0.1.{PR#}] — YYYY-MM-DD` and add a fresh `[Unreleased]` block above it.

**What not to include:** CI workflow tweaks, docs-only changes, dependency bumps with no user impact, and version sync commits.

---

## Development Workflow

### Branches

| Branch | Environment | GitHub Pages | Backend | Workflow |
|--------|---|---|---|---|
| `development` | Development/Preview | `/SocialiseApp/dev/` | `socialise-app-development.up.railway.app` | `deploy-development.yml` |
| `production` | Production | `/SocialiseApp/prod/` | `socialise-app-production.up.railway.app` | `deploy-production.yml` |

**Workflow:**
1. Create feature branches from `development`
2. Test locally with local backend
3. Push to `development` → auto-deploys to `/dev/` preview for testing
4. Merge `development` → `production` → auto-deploys to `/prod/` production

**Auto-approve PRs:** The `auto-approve.yml` workflow runs on all PRs. It blocks PRs targeting `production` from any branch other than `development` (posts a comment and fails). For allowed PRs, it runs a `validate` job (lint, tests, build). If the PR has no merge conflicts and validation passes, it automatically approves, squash-merges, and deletes the source branch. PRs with conflicts get a comment and are skipped.

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
- Version is derived dynamically at build time from the latest merged PR number: `0.1.{PR#}` (e.g. `0.1.104`).
- `package.json` version is a static placeholder (`0.1.0`) — not used at runtime.
- Both deploy workflows pass `VITE_APP_VERSION` to the Vite build. The app reads it via `import.meta.env.VITE_APP_VERSION`.
- No version bump commits, no sync between branches — eliminates merge conflicts and branch divergence.

**ESLint:** `npm run lint` — React hooks rules enabled. Fix lint errors before pushing.

**Tailwind v4:** Uses CSS-native `@import "tailwindcss"` — no `tailwind.config.js` in the traditional sense. CSS variables in `index.css` are the source of truth for the design system.

---

## Conventions

- Components use default exports.
- State managed via Zustand stores (`src/stores/`). Components import stores directly — minimal prop drilling.
- Toast notifications via `showToast(message, type)` — types: `'success'`, `'error'`, `'info'`.
- Optional chaining everywhere user/event data is accessed: `user?.name ?? 'fallback'`.
- Framer Motion used for all transitions. `AnimatePresence` wraps conditionally rendered elements.
- Never hardcode `#ffffff` or `black` — always use design token CSS vars or Tailwind utilities mapped to those vars.

---

## Lessons Learned (Do NOT Repeat These Mistakes)

### 1. Deploy workflows need `contents: write` for GitHub Pages

The `JamesIves/github-pages-deploy-action` pushes built files to the `gh-pages` branch. This requires `permissions: contents: write`. Do NOT downgrade to `contents: read` — the deploy step will fail with a 403 error. The write permission is safe as long as the workflow itself doesn't make commits to source branches (which it no longer does).

### 2. Workflow changes must land on the TARGET branch to take effect

GitHub Actions runs the version of the workflow file that exists **on the branch being pushed to** — not the version in the PR or the source branch. When we merged our new `deploy-production.yml` to development and then to production, the push to production triggered the **old** `deploy-production.yml` (still on production at that moment). The old workflow ran its version bump + sync steps, pushing commits that overwrote our changes on both branches. Our fix was effectively erased before it could take effect.

**Rule:** When changing a workflow that runs on `push: [production]`, the old workflow will run one final time during the merge that brings the new version. Account for this — ensure the old workflow's side effects won't undo your changes.

### 3. Workflows that push commits to branches can silently overwrite unrelated changes

The old `deploy-production.yml` checked out `development`, modified `package.json`, and force-pushed. This "version sync" step only touched `package.json`, but the act of pushing to development from within a workflow creates commits that can cause merge conflicts and branch divergence. Any workflow that pushes commits to source branches is inherently dangerous — it creates a feedback loop that's hard to reason about.

**Rule:** Deploy workflows should be read-build-deploy only. Never push commits back to source branches from a deploy workflow. Derive dynamic values (like version numbers) at build time from external sources (PR numbers, git tags, timestamps) instead of committing them.

### 4. Squash merges can lose file changes when combined with automated commits

When auto-approve squash-merged PRs from development → production, and the old workflow then pushed version commits to both branches, the squashed history made it impossible to cleanly track which file changes survived. Regular merge commits preserve the full history and make conflicts explicit.

**Rule:** For branch promotion (development → production), prefer regular merge over squash merge to preserve change history and make conflicts visible.

### 5. `GITHUB_TOKEN` merges don't trigger other workflows

GitHub Actions prevents workflow cascading by default. When `auto-approve.yml` merges a PR using the built-in `GITHUB_TOKEN`, the resulting push to the target branch does **not** trigger `on: push` workflows (like `deploy-development.yml` or `deploy-production.yml`). This is a GitHub security feature to prevent infinite loops. The old deploy workflows happened to work because version sync commits were pushed using git credentials, not `GITHUB_TOKEN`.

**Rule:** If a workflow merges PRs via the GitHub API (using `GITHUB_TOKEN`), it must explicitly trigger downstream workflows using `workflow_dispatch`. Add `workflow_dispatch` as a trigger on deploy workflows, and have auto-approve call `actions.createWorkflowDispatch()` after merging. The auto-approve workflow needs `actions: write` permission for this.

### 6. Regular merges create commits that only exist on the target branch

When auto-approve merges `development → production` using a regular merge (not fast-forward), the merge commit only exists on `production`. Over time, `development` falls behind by N merge commits — even though the actual source code is identical. GitHub shows `development` as "N commits behind production", which is confusing and can cause messy diffs in future PRs.

**Rule:** After deploying to production, back-merge `production` into `development` to bring in the merge commit metadata. The `deploy-production.yml` workflow does this automatically via `github.rest.repos.merge()` in the `sync-development` job. The `[skip ci]` tag in the commit message prevents the back-merge from triggering deploy-development.

### 7. `/fix-bugs` must update bug statuses in Supabase — not just fix code

When processing bugs via `/fix-bugs`, the full lifecycle is: **mark `in-progress` in Supabase → fix the code → mark `fixed` in Supabase → commit + push**. Fixing code and pushing without updating the bug status in the database means the bug sheet stays stale, the `/fix-bugs` skill will re-surface the same bugs next run, and there's no audit trail of when things were resolved.

**Rule:** Every `/fix-bugs` run MUST update bug statuses directly in Supabase via the REST API (`PATCH /rest/v1/bug_reports?bug_id=eq.{ID}`). Use the `SUPABASE_SERVICE_ROLE_KEY` from environment variables — it bypasses RLS. The local Express server may not be reachable (DNS issues in sandboxed environments), but the Supabase REST API at `$SUPABASE_URL/rest/v1/` is. The Google Sheet webhook (`BUGS_SHEET_WEBHOOK_URL`) may also be unavailable — that's fine, Supabase is the source of truth and the sheet syncs on the next deployed backend call. Never skip the status update step.

### 8. External services in sandboxed environments — know what's reachable

In this sandbox environment, DNS resolution for some hosts fails (`EAI_AGAIN`), but the Supabase REST API resolves fine via its IP. The local Express server can't connect to Supabase (DNS failure), but direct `curl` to `$SUPABASE_URL/rest/v1/` works. The production Railway backend (`socialise-app-production.up.railway.app`) is reachable but blocks demo login. The development Railway backend may not be running.

**Rule:** When you need to update Supabase data and the local server can't start, go directly to the Supabase REST API with the service role key. Don't waste time trying to start the local server, logging in for a JWT, or retrying DNS failures. Use `printenv` to get env vars into shell variables (avoids quoting issues with `$VAR` in curl commands).

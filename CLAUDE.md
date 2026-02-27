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
    011_report_type.sql                 # Add type column (bug/feature) to bug_reports
    012_organiser_profile.sql            # Organiser profile columns (role, bio, display name, categories, social links, etc.)
    013_bug_report_fix_metadata.sql      # Add fix_notes and component columns to bug_reports
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
| BugReportModal | `src/components/BugReportModal.jsx` | Bug report submission form. |
| FeatureRequestModal | `src/components/FeatureRequestModal.jsx` | Feature request submission form (mirrors BugReportModal). |
| Skeleton | `src/components/Skeleton.jsx` | Loading skeletons for each tab. |
| OrganiserSetupFlow | `src/components/OrganiserSetupFlow.jsx` | 3-step organiser onboarding: display name → categories → bio + social links. Lazy-loaded. |
| OrganiserDashboard | `src/components/OrganiserDashboard.jsx` | Organiser home view: stats, events, communities, quick actions. |
| OrganiserProfileSheet | `src/components/OrganiserProfileSheet.jsx` | Bottom sheet: public organiser profile viewer (tapped from event host). |
| OrganiserStatsCard | `src/components/OrganiserStatsCard.jsx` | Reusable stats card: icon, value, label, optional trend. |
| useSwipeToClose | `src/hooks/useAccessibility.js` | Hook for swipe-down-to-close on bottom sheets. Returns `sheetY` motion value + `handleProps` for drag handle. |

---

## Data Models

**Event:**
```js
{ id, title, date, time, location, price, spots, image, category, attendees, host,
  isMicroMeet, matchScore?, matchTags?, theme? }
```

**User (localStorage + server):**
```js
{ id, email, name, location, avatar, bio, interests, tribe, isPro,
  role, organiserBio, organiserDisplayName, organiserCategories,
  organiserSocialLinks, organiserCoverPhoto, organiserVerified, organiserSetupComplete }
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
| PUT | `/users/me/role` | Required | Switch role (attendee ↔ organiser) |
| GET | `/users/me/organiser-stats` | Required | Organiser dashboard stats, events, communities |
| GET | `/users/:id/organiser-profile` | Optional | Public organiser profile + events + communities |
| GET | `/events/recommendations/for-you` | Required | Micro-Meet recommendations (by match score) |
| POST | `/bugs` | Required | Submit bug report or feature request (pass `type: 'feature'` for feature requests; stored in Supabase `bug_reports` table) |
| GET | `/bugs` | Required or Service Key | List bug reports/feature requests (filterable by `?status=open` and/or `?type=feature`). Primary data source for `/fix-bugs` skill (structured JSON). |
| POST | `/bugs/full-sync` | Required or Service Key | Push all Supabase bug reports to Google Sheet. Clears the sheet and rebuilds from Supabase. Use after direct DB edits or to fix sync drift. Returns `{ synced: N, sheetSynced: true/false }`. |
| PUT | `/bugs/batch` | Required or Service Key | Batch update + delete multiple bugs in one call. Accepts `{ updates: [{ bugId, ...fields }], deletions: ["BUG-123"] }`. Returns `{ results: [{ bugId, success, sheetSynced }] }`. |
| PUT | `/bugs/:bugId` | Required or Service Key | Update report fields (status, priority, type, fix_notes, component, etc.) — auto-syncs Supabase + Google Sheet. Response includes `sheetSynced: true/false`. |
| DELETE | `/bugs/:bugId` | Required or Service Key | Delete bug report (used for duplicate consolidation — syncs deletion to Google Sheet). Response includes `sheetSynced: true/false`. |

**Demo credentials:** `ben@demo.com` / `password` (blocked in production — `NODE_ENV=production` returns 403)

**User storage:** Supabase `users` table. Auth routes read/write Supabase directly via service role client.

**Environment variables (see `server/.env.example`):**
- `JWT_SECRET` — Secret for signing JWTs. Required in production.
- `PORT` — Server port. Defaults to 3001.
- `ALLOWED_ORIGINS` — Comma-separated CORS origins. Defaults to localhost dev origins.
- `SUPABASE_URL` — Supabase project URL. Required.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only, bypasses RLS). Required.
- `BUGS_SHEET_WEBHOOK_URL` — Optional. Google Apps Script web app URL. When set, bug reports are synced to a Google Sheet in real time. API responses include `sheetSynced: true/false` confirming sync status. Supports four modes: new bug creation (appends row), status updates via `PUT /bugs/:bugId` (updates existing row), deletion via `DELETE /bugs/:bugId` (removes row), and full-sync via `POST /bugs/full-sync` (clears sheet and rebuilds from Supabase). The Apps Script uses header-based column lookup (not hardcoded indices) so columns can be reordered freely. Environment values are `PROD` (from `/prod/` page), `DEV` (from `/dev/` page), or `LOCAL` (localhost). The "Fixed At" column is auto-populated by the Apps Script when a bug's status is set to `fixed`. **Full bi-directional sync:** the `onSheetEdit` installable trigger syncs ALL editable column changes from the sheet back to Supabase (Status, Priority, Type, Description, Environment, Fix Notes, Component, App Version, Platform). The Google Sheet is the primary human editing surface — edit anything there and it syncs back automatically. Non-syncable columns (Bug ID, Created At, Reports, Reporter, Fixed At) are managed by the system. Requires one-time `setupSupabaseCredentials()` in Apps Script — stores `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Google Script Properties. The Apps Script source is in `docs/google-sheets-apps-script.js`.
- `BUGS_SERVICE_KEY` — Optional. Shared secret for `/fix-bugs` skill to authenticate against bug endpoints without registering throwaway users. Pass via `X-Service-Key` header. When set, GET/PUT/DELETE on `/bugs` accept this header as an alternative to JWT Bearer tokens. Generate with `openssl rand -hex 32`.

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
- Component test coverage expanded: 409 frontend tests across 18 test files (useAccessibility 16, BottomNav 16, Toast 10, Sidebar 16, ErrorBoundary 11); `useSwipeToClose` hook adds 10 more tests; EventReels (27) and AvatarCropModal (14) added in deep QA (total 489 across 22 test files) ✓
- `auto-approve.yml` blocks feature branch PRs from targeting `production` — only `development` → `production` PRs are allowed ✓
- `deploy-production.yml` back-merges production into development after deploy — keeps branches in sync (merge commits from development→production PRs no longer cause "behind" drift) ✓
- XP and unlocked titles persisted to Supabase `users` table (migration 007) — fixes level mismatch between prod and dev environments. Auth responses include `xp` and `unlockedTitles`, synced to uiStore on login/session check. `PUT /api/users/me/xp` endpoint for updates. ✓
- EventReels swipe freeze fixed — `isAnimating` ref guard prevents rapid swipe state changes during `AnimatePresence` transitions, `onTouchCancel` handler resets stale touch refs, `touchStartY` reset on touch end (BUG-1771870680693) ✓
- CreateEventModal hardlock fixed — `isSubmitting` state with loading spinner prevents double-submission and gives users feedback during API calls (BUG-1771870610374) ✓
- VideoWall timeout accumulation fixed — `handleInteractionEnd` clears previous timeout before creating a new one, preventing leaked `setTimeout` callbacks that caused jank (BUG-1771870610374) ✓
- `PUT /api/bugs/:bugId` now syncs status/priority updates to Google Sheet via Apps Script webhook (fire-and-forget, same as `POST /bugs`) ✓
- Bug report environment detection uses short uppercase values: `PROD` (from `/prod/` page), `DEV` (from `/dev/` page), `LOCAL` (localhost) — consistent with Google Sheet dropdown options ✓
- Google Sheet Apps Script uses header-based column lookup (`getColumnMap_`) instead of hardcoded indices — columns can be reordered freely without breaking create/update logic ✓
- `/fix-bugs` skill fetches from production API `GET /api/bugs` (structured JSON, always fresh — no CSV parsing), auto-prioritizes with age-based boosting, auto-detects components, uses fuzzy duplicate matching, shows summary table and asks what to fix (all open / P1 only / specific bug) ✓
- Google Sheet "Fixed At" column auto-populated by Apps Script when status is set to `fixed` — timestamps when each bug was resolved ✓
- `/fix-bugs` workflow processes bugs ONE AT A TIME: mark `in-progress` via production API (syncs Supabase + Sheet) → fix code → mark `claim-fixed` with `fix_notes` + `component` via production API → commit + push → next bug. User manually verifies each fix and changes to `fixed`. Uses `X-Service-Key` header for auth (no throwaway user registration). Batch endpoint `PUT /api/bugs/batch` for priority/dedup writes. `sheetSynced` field in responses confirms sheet webhook success. No automatic pickup of new bugs after completing the agreed list ✓
- LocationPicker shows fallback text input when Google Maps API key is missing or fails to load (BUG-1771938422741) ✓
- CreateEventModal close button enlarged to 40x40 touch target, z-index stacking fixed, overflow-x-hidden for reliable scrolling (BUG-1771938439942) ✓
- Explore filters (category, search, size, date, tags) no longer affect HomeTab — `filteredEvents` scoped to ExploreTab only; HomeTab uses full unfiltered events from store; Sidebar "Discover" category section only renders on explore tab (BUG-1771942366608) ✓
- CreateEventModal close button given explicit `z-30` and `bg-paper` to prevent occlusion during scroll on mobile (BUG-1771942525165) ✓
- Bug reports now capture platform info (OS, browser, device type) — auto-detected from `navigator.userAgent` in `BugReportModal`, stored in `bug_reports.platform` column (migration 010), synced to Google Sheet ✓
- Bug report environment detection fixed — `BugReportModal` now correctly reads `window.location.pathname` instead of hardcoded value; all three environments (PROD/DEV/LOCAL) report correctly (BUG-1771951807738) ✓
- Profile page scroll freeze fixed — `overscroll-behavior: contain` on profile content prevents iOS scroll context from leaking to parent (BUG-1771951713663) ✓
- Feed double-refresh fixed — debounce guard on pull-to-refresh `fetchAllData` prevents rapid successive API calls (BUG-1771951999824) ✓
- Bug report modal text overflow fixed — `break-words` and `overflow-wrap` on description textarea prevent long unbroken strings from breaking layout (BUG-1771951629740) ✓
- VideoWall diagonal scroll glitch fixed — `touch-action: pan-x` on horizontal scroll container prevents vertical scroll interference on diagonal swipes (BUG-1771951846903) ✓
- `DELETE /api/bugs/:bugId` endpoint added — deletes from Supabase and syncs deletion to Google Sheet via Apps Script `action: 'delete'` webhook. Enables proper duplicate consolidation (delete duplicates from both DB and sheet) ✓
- Apps Script `doPost` now supports `action: 'delete'` — removes a row by `bug_id`, complementing existing create/update actions ✓
- CreateEventModal restructured — header (with close button) and footer (with submit button) moved outside the scrollable area. Only form content scrolls. Eliminates iOS sticky-inside-overflow touch handling issues that prevented the close button from working (BUG-1771954170889) ✓
- Main content scroll freeze after closing sheets fixed — CSS `:has()` rule locks `#main-content` overflow when any `role="dialog"` or `role="alertdialog"` exists in the DOM. When the dialog unmounts, overflow restores and iOS re-engages the parent scroll context automatically. Works across all 14+ modals/sheets (BUG-1771954483248) ✓
- Pull-to-refresh no longer triggers on horizontal swipes — tracks both X and Y touch coordinates with direction locking after 10px of movement. VideoWall carousel scrolling no longer conflicts with pull-to-refresh (BUG-1771954280752) ✓
- Explore tab first-load animation glitch fixed — `transition={{ duration: 0.15 }}` on ExploreTab motion.div reduces the visible gap from `AnimatePresence mode="wait"` sequential transitions (BUG-1771954315641) ✓
- ChangelogSheet scroll fixed — replaced `maxHeight` calc with flex layout (`flex-1 min-h-0`) + `overscroll-contain` so the "What's New" sheet scrolls properly on iOS Safari (BUG-1771957626306) ✓
- VideoWall press-and-hold drag glitch fixed — replaced Framer Motion `whileTap` with manual press tracking via `onPointerDown` + global `pointerup` listener so cards stay scaled down until touch is fully released, even when finger drags off the card (BUG-1771957730622) ✓
- Feature request submission added — `FeatureRequestModal` component (mirrors `BugReportModal`), Lightbulb button above Bug button, `type` column in `bug_reports` table (migration 011), `FEAT-` ID prefix for feature requests, Google Sheet `Type` column, `/fix-bugs` skill re-categorizes bug-as-feature instead of rejecting ✓
- Apps Script update handler now syncs `description`, `platform`, and `reporter` fields (previously only synced status/priority/environment/app_version/reports/type) ✓
- Reporter column added to Google Sheet — auto-populated from JWT email on bug/feature submission, visible in sheet for triage ✓
- Bi-directional sync added — `onSheetEdit` installable trigger syncs ALL editable column changes from Google Sheet back to Supabase via REST API (Status, Priority, Type, Description, Environment, Fix Notes, Component, App Version, Platform). Auto-populates/clears "Fixed At" on status changes. Google Sheet is the primary human editing surface. Requires one-time `setupSupabaseCredentials()` setup ✓
- Full-sync endpoint added — `POST /api/bugs/full-sync` reads all bugs from Supabase and pushes them to Google Sheet via `action: 'full-sync'` webhook (clears sheet, rebuilds all rows). Use after direct DB edits or to recover from sync drift ✓
- Duplicate bug consolidation — 31 tickets reduced to 20 by merging duplicate reports (CreateEventModal close x4→1, scroll freeze x4→2, text overflow x3→2, explore animation x2→1, swipe-to-close x2→1, EventReels x2→1). All merged descriptions preserve debugging context. Test/rejected tickets deleted ✓
- Community hub scroll lock fixed — `overscroll-behavior-y: contain` on `#main-content` prevents iOS Safari scroll context confusion during tab transitions; pull-to-refresh touch refs cleaned up on tab switch; instant scroll reset instead of smooth (races with AnimatePresence); `requestAnimationFrame` forces iOS to recalculate scroll context (BUG-1771959452079 + BUG-1771959505810) ✓
- CreateEventModal stuck fixed — close button uses `onPointerDown` instead of `onClick` for immediate response on iOS; backdrop uses `onPointerDown`; `touch-action: manipulation` on header/close button prevents iOS gesture recognizer interference; swipe-down-to-close via Framer Motion `drag="y"` on modal container (BUG-1771966783965) ✓
- Explore page wobble animation fixed — removed `layoutId` from `EventCard` that caused unintended cross-tab layout animations during `AnimatePresence mode="wait"` transitions (BUG-1771959632614) ✓
- Feature request box text overflow fixed — `break-words` and `overflow-wrap: break-word` on description textarea; `overscroll-contain` on modal scroll area (BUG-1771992727908) ✓
- Feature request/bug report buttons overlap fixed — increased vertical spacing between floating buttons (bottom-[120px] and bottom-[168px] on mobile) to prevent touch target overlap (BUG-1771992911027) ✓
- Swipe-to-close added to all 12 bottom sheets/modals — `useSwipeToClose` hook in `useAccessibility.js` tracks pointer drag on handle bars and dismisses when threshold or velocity exceeded. Applied to: EventDetailSheet, MyBookingsSheet, SavedEventsSheet, HelpSheet, GroupChatsSheet, TribeSheet, ChangelogSheet, UserProfileSheet, BugReportModal, FeatureRequestModal, CreateEventModal. 10 new tests for the hook (BUG-1771992986881) ✓
- EventReels aria-labels added — all 7 icon-only buttons now have proper `aria-label` attributes (close, previous, next, like/unlike, chat, upload, share). Text labels on buttons marked `aria-hidden="true"` to prevent double-announcement ✓
- `sendMessage` in App.jsx now removes optimistic message on failure — previously, failed sends left ghost "sent" messages visible in the chat. Now rolls back the optimistic message from `chatMessages` state on error ✓
- `handleJoin` in App.jsx reads XP from Zustand store at call time (`useUIStore.getState().userXP`) instead of stale closure value — fixes XP not accumulating on rapid event joins. Also rolls back XP on join failure ✓
- `AvatarCropModal` wheel listener attached via native `addEventListener` with `{ passive: false }` — fixes Chrome console warning about `preventDefault()` on passive wheel events (React attaches `onWheel` as passive by default) ✓
- `bg-white` replaced with `bg-paper` in 9 locations — AuthScreen form inputs (5), BugReportModal textarea (1), FeatureRequestModal textarea (1), GroupChatsSheet message bubble + reaction popup (2). Design system compliance: never hardcode `#ffffff` ✓
- GroupChatsSheet missing aria-labels added — search and close buttons in community list header now have proper `aria-label` attributes ✓
- Component test coverage expanded: 489 tests across 22 test files — added EventReels (27 tests: rendering, accessibility, navigation, interactions, touch, inclusivity tags) and AvatarCropModal (14 tests: rendering, interactions, zoom controls, wheel handler lifecycle) ✓
- `fetchAllData` now shows error toast on failure — previously only logged to console, leaving users with an empty app and no explanation ✓
- Mango `handleDragEnd` setTimeout now tracked via `fallTimerRef` and cleaned up on unmount — prevents state-update-on-unmounted-component warnings and memory leaks. All three Mango timers (hold, idle, fall) now have explicit unmount cleanup ✓
- BugReportModal and FeatureRequestModal close buttons use `onPointerDown` instead of `onClick` — prevents iOS gesture recognizer from swallowing taps inside scrollable modal containers (same fix as CreateEventModal BUG-1771966783965) ✓
- Null safety on `filteredEvents` — `e.title?.toLowerCase()` prevents crash when an event has a missing title ✓
- HomeTab micro-meets scroll buttons have `aria-label="Scroll left"` / `aria-label="Scroll right"` for screen readers ✓
- OnboardingFlow back button has `aria-label="Go back"` for screen readers ✓
- `/fix-bugs` process overhauled — service token auth (`X-Service-Key` header, `BUGS_SERVICE_KEY` env var) replaces throwaway user registration; `GET /api/bugs` (structured JSON) replaces Google Sheet CSV export as primary data source; `PUT /api/bugs/batch` endpoint for bulk priority/dedup writes; `sheetSynced` field in API responses replaces CSV re-verification; `fix_notes` column for fix traceability; `component` column for affected area; age-based priority boosting; fuzzy duplicate matching ✓

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
- [x] Swipe-down-to-close on all 12 bottom sheets/modals via `useSwipeToClose` hook — drag handle bars dismiss on threshold or velocity
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

**Migrations:** Run via `node server/migrate.js`. Files in `server/migrations/` are executed in order (001–012). See Directory Layout above for details.

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
| Skill | `/fix-bugs` | Process bug reports from API — validate, fix, and commit (service key auth, batch ops, fix metadata) |
| Subagent | `code-reviewer` | Security, quality, design system compliance review |
| Subagent | `test-coverage-analyzer` | Identify untested code and coverage gaps |
| Subagent | `bug-fixer` | Validates bug reports and creates minimal fixes (bug-only, no features) |
| Workflow | `auto-approve` | Blocks feature→production PRs, validates (lint + test + build), then auto-approves, squash-merges, and deletes branch for conflict-free PRs |
| Workflow | `bug-fixer` | Triggered by `bug` label on issues — validates, fixes, and creates PR via Claude Code |

---

## Changelog

`CHANGELOG.md` in the project root tracks all user-facing changes using the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**When to update it:** Every PR that touches `src/`, `server/routes/`, `server/index.js`, or `server/matching.js` **MUST** include a `CHANGELOG.md` update. No exceptions — if you write or change user-facing code, you update the changelog in the same commit. This is not optional.

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

**Before pushing any branch:** confirm `CHANGELOG.md` is in `git diff --staged` alongside your code changes. If it isn't, stop and add it.

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
- **CHANGELOG.md is mandatory on every PR that changes `src/`, `server/routes/`, `server/index.js`, or `server/matching.js`.** Add one line per user-facing change under `[Unreleased]` before committing. The changelog is the user-visible record of every fix and feature — keeping it current is part of the definition of "done".

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

### 7. `/fix-bugs` must update bug statuses via the production API — which syncs both Supabase and Google Sheet

When processing bugs via `/fix-bugs`, the full lifecycle is: **mark `in-progress` via production API → fix the code → mark `claim-fixed` with `fix_notes` + `component` via production API → commit + push**. The user then manually verifies each fix and changes the status to `fixed`. The production API (`PUT /api/bugs/:bugId`) handles both Supabase and Google Sheet sync in one call — the `sheetSynced` field in the response confirms whether the sheet webhook succeeded.

**Rule:** Every `/fix-bugs` run MUST update bug statuses via the production API. Authenticate with `X-Service-Key` header (see `BUGS_SERVICE_KEY` env var) — no throwaway user registration needed. Use `PUT /api/bugs/batch` for bulk priority/component/dedup writes at the start. Process bugs ONE AT A TIME: mark in-progress → fix → mark `claim-fixed` with `fix_notes` → commit + push → next bug. Never use `fixed` directly — only `claim-fixed`. The user changes `claim-fixed` → `fixed` after verifying. Always include `fix_notes` explaining what was fixed.

### 8. External services in sandboxed environments — know what's reachable

In this sandbox environment, DNS resolution for some hosts fails (`EAI_AGAIN`), but the Supabase REST API resolves fine via its IP. The local Express server can't connect to Supabase (DNS failure), but direct `curl` to `$SUPABASE_URL/rest/v1/` works. The production Railway backend (`socialise-app-production.up.railway.app`) is reachable but blocks demo login. The development Railway backend may not be running.

**Rule:** When you need to update Supabase data and the local server can't start, go directly to the Supabase REST API with the service role key. Don't waste time trying to start the local server, logging in for a JWT, or retrying DNS failures. Use `printenv` to get env vars into shell variables (avoids quoting issues with `$VAR` in curl commands). For running raw SQL (migrations, schema changes, ad-hoc queries), use the Supabase Management API — see lesson #13.

### 9. Authenticate with service key — not throwaway users

The old approach registered a throwaway `claude-bot-{timestamp}@temp.dev` user on production for every `/fix-bugs` run, polluting the users table and requiring cleanup. This was fragile and wasteful.

**Rule:** Use the `BUGS_SERVICE_KEY` env var with the `X-Service-Key` header to authenticate against bug endpoints. No user registration, no cleanup, no user table pollution:
```bash
SERVICE_KEY=$(printenv BUGS_SERVICE_KEY | tr -d ' ')
curl -s -X PUT "https://socialise-app-production.up.railway.app/api/bugs/$BUG_ID" \
  -H "Content-Type: application/json" \
  -H "X-Service-Key: $SERVICE_KEY" \
  -d '{"status":"claim-fixed","fix_notes":"Added null check in EventCard.jsx:42","component":"EventCard"}'
```
If `BUGS_SERVICE_KEY` is not set, fall back to the legacy temp user registration as a last resort.

### 10. Trust the production API response — don't re-verify via CSV

The old approach fetched the entire Google Sheet CSV export after every status update to verify the change landed. Google caches CSV exports for up to ~5 minutes, so this often saw stale data and wasted time. The production API now returns a `sheetSynced: true/false` field confirming whether the webhook succeeded.

**Rule:** Trust the API response. If `PUT /api/bugs/:bugId` returns `200` with `sheetSynced: true`, both Supabase and the sheet are updated. If `sheetSynced: false`, Supabase is still updated (source of truth) — note the sheet sync failure but don't block. Only verify the sheet CSV as a manual debugging step, never as part of the automated workflow. Avoid dual writes (API + direct Supabase) — the API handles both in one call.

### 11. Always rebase onto development before pushing — prevents merge conflicts from squash-merged PRs

When auto-approve squash-merges a PR into `development`, the squashed commit has different history than the original commits on the feature branch. If you keep committing on the same branch and push again, the next PR will always conflict — Git sees the squashed version and the original commits as unrelated changes to the same files.

**Rule:** Before every `git push`, always rebase onto the latest `origin/development`:
```bash
git fetch origin development && git rebase origin/development
```
If the rebase drops commits (because they were already squash-merged), that's correct — Git recognizes the patches are already upstream. If there are conflicts, resolve them during the rebase. Then force-push with `--force-with-lease` (safe — only affects the feature branch, not development or other branches).

This must happen **every time** before pushing, not just when conflicts are detected. It's a 2-second operation when there's nothing to rebase, and it prevents the conflict entirely.

### 12. Identify lesson-learned opportunities proactively in every conversation

At the end of each task or conversation, proactively review what happened and surface any lesson-learned opportunities — don't wait for the user to point out mistakes. Look for:

- **Assumptions that turned out wrong** (e.g., claiming an update worked without verifying)
- **Workflow gaps that caused rework** (e.g., an endpoint silently ignoring fields)
- **Duplicate detection failures** (e.g., missing that two bugs describe the same symptom)
- **Process improvements worth encoding** into CLAUDE.md, skill files, or agent definitions
- **Verification steps that were skipped** (e.g., not checking the Google Sheet after an update)

When a lesson is identified, propose updating the relevant documentation (CLAUDE.md, skill definitions, agent definitions) to make it permanent. Don't just note it — encode it so it can't happen again.

### 13. Running Supabase migrations in the sandbox — use the Management API, not the JS client

The Supabase JS client (`@supabase/supabase-js`) relies on DNS resolution for `*.supabase.co` hostnames, which fails in this sandbox environment (`EAI_AGAIN` / `fetch failed`). This means `node server/migrate.js` will always fail — it uses `supabase.rpc('exec', ...)` under the hood. Don't waste time installing deps, creating `.env`, and retrying the migration runner.

**Rule:** To execute raw SQL against Supabase from the sandbox, use the **Supabase Management API** database query endpoint with the `SUPABASE_ACCESS_TOKEN`:

```bash
SUPABASE_ACCESS_TOKEN=$(printenv SUPABASE_ACCESS_TOKEN | tr -d ' ')
PROJECT_REF=$(printenv SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

SQL=$(cat server/migrations/001_initial_schema.sql)

curl -s -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg q "$SQL" '{query: $q}')"
```

Key details:
- The endpoint is `POST https://api.supabase.com/v1/projects/{ref}/database/query` (NOT `/sql` — that doesn't exist)
- Auth uses `SUPABASE_ACCESS_TOKEN` (management token), NOT `SUPABASE_SERVICE_ROLE_KEY`
- Trim whitespace from the token: `tr -d ' '` — the env var may have a leading space
- Extract the project ref from `SUPABASE_URL` by stripping `https://` and `.supabase.co`
- Use `jq -n --arg q "$SQL" '{query: $q}'` to safely JSON-encode the SQL (handles quotes, newlines, dollar signs in PL/pgSQL)
- HTTP 201 = success, HTTP 400 = SQL error (check the `message` field)
- Migrations with `IF NOT EXISTS` / `CREATE OR REPLACE` are safe to re-run; seed data INSERTs will fail with duplicate key errors if data already exists — skip and continue
- Existing triggers will fail with `42710: trigger already exists` — non-critical if the table itself was created successfully

This also applies to any ad-hoc SQL you need to run (schema inspection, data fixes, etc.) — always prefer the Management API over trying to start the local Express server or use the JS client.

### 14. Commit after every QA round — never leave fixes uncommitted across context boundaries

During a deep QA session, round 3 fixes (3 files modified) were left uncommitted when the context window ran out. If the session hadn't been continued, those fixes would have been silently lost — no error, no warning, just gone. Rounds 1 and 2 had been committed and pushed; round 3 had not.

**Rule:** When running multi-round QA or fix sessions, commit and push after **every** round — not at the end. A small incremental commit takes seconds and guarantees work survives context compaction, session timeouts, or crashes. Never accumulate uncommitted changes across rounds "because there might be more coming." There always might be more coming. Commit anyway.

### 15. Verify tool availability before composing complex arguments

Attempted `gh pr create` with a detailed multi-paragraph PR body, only to discover `gh` isn't installed in the sandbox. The entire body composition was wasted effort. CLAUDE.md Lesson #8 already warns about sandbox limitations, but this is a more specific anti-pattern: building elaborate arguments for a command you haven't confirmed exists.

**Rule:** Before composing a command with complex arguments (heredocs, multi-line bodies, JSON payloads), run a quick `which <tool>` or `<tool> --version` first. If it fails, skip the composition entirely and note the limitation. This applies to `gh`, `jq`, `docker`, and any non-standard CLI tool.

### 16. Don't write a plan and stall — implement directly unless explicitly asked to wait

When the user asks for a feature implementation, they expect you to build it — not write a plan file and then output "No response requested." Writing a plan is useful for internal reasoning, but stopping after the plan without implementing is a dead halt that wastes the user's time. The user had to follow up twice ("Continue from where you left off" and "Are you just waiting for approval?") before implementation started.

**Rule:** When a user asks "how can we do this the best way?" in the context of a feature request, that's a request to implement — not to write a proposal and wait. Start building immediately. If you need to plan internally, do it in your reasoning, then proceed to implementation in the same turn. Only pause for explicit approval if the user says "just give me a plan" or "don't implement yet."

### 17. Run database migrations yourself — don't tell the user to do it manually

After implementing a feature that included a new migration file (`012_organiser_profile.sql`), I told the user "you'll need to run the migration manually." The user correctly pointed out that I should be able to run it myself using the Supabase Management API (see lesson #13). This wasted a round-trip and made the user do work that was clearly within my capability.

**Rule:** When a feature implementation includes a database migration, run it yourself as part of the implementation — don't punt it to the user. Use the Supabase Management API (lesson #13) to execute the SQL. The migration is part of the feature delivery, not a separate task for the user. Only flag manual steps if they genuinely require user credentials or permissions you don't have.

### 18. Clean up temporary files before committing — don't leave plan.md or scratch files in the repo

During the organiser profile implementation, a temporary `plan.md` file was created for internal planning and left in the working directory. The git pre-push hook flagged it as untracked. Temporary scratch files should never be committed or left lying around — they confuse git status, can accidentally get committed, and create noise for the user.

**Rule:** If you create temporary files (plans, notes, scratch pads) during implementation, delete them before staging and committing. Better yet, don't create temporary files at all — use your reasoning for planning instead of writing to disk.

### 19. Verify rebase conflict resolutions include all required imports and state

When resolving rebase conflicts, keeping JSX from one side of the conflict can leave orphaned references if the corresponding imports, state declarations, or store accessors were on the other side of the conflict (or in a different hunk that was dropped). This happened when the review/vibe tags section was kept during a rebase of OrganiserProfileSheet.jsx, but upstream `development` didn't have the supporting `getOrganiserReviews` API method, `setShowOrganiserReview` store state, `ORGANISER_VIBE_TAGS` constant import, or `Sparkles` icon import — causing 10 `no-undef` lint errors that broke CI.

**Rule:** After resolving every rebase conflict, run `npm run lint` before continuing the rebase (`git rebase --continue`). If you kept JSX that references variables, check that the corresponding imports and state declarations survived the rebase. If the supporting infrastructure (API methods, store state, constants) doesn't exist on the target branch, remove the orphaned JSX rather than trying to add stubs — incomplete features are worse than absent features.

### 20. Never use Framer Motion variant propagation (`containerVariants`/`staggerChildren`) — use explicit animations

Framer Motion's variant propagation pattern — where a parent `<motion.div>` has `variants={containerVariants}` with `staggerChildren` and children use `variants={itemVariants}` — silently fails in complex component trees. Children stay at `opacity: 0` with no error. This happened in `OrganiserDashboard.jsx` where the greeting (first child) was visible but all other sections (header, quick actions, tabs, stats, events, communities) were invisible. Three separate fix attempts (removing parent opacity, switching to variant names, using orchestration-only containers) all failed. The only fix was removing variant propagation entirely.

**Rule:** Never use `containerVariants`/`itemVariants` with `staggerChildren`/`delayChildren` for page-level layouts. Instead, give each section its own explicit `initial`/`animate`/`transition` props with a manual delay helper:

```js
const staggerDelay = (i) => ({ type: 'spring', damping: 25, stiffness: 400, delay: 0.05 + i * 0.06 });

// Each section gets its own independent animation:
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={staggerDelay(0)}>Section 1</motion.div>
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={staggerDelay(1)}>Section 2</motion.div>
```

This is reliable because each element controls its own animation — no parent-child propagation chain to break. Variant propagation is fine for simple cases (2-3 items in a list), but do not use it for complex dashboard layouts with conditional rendering, IIFEs, and nested wrappers.

### 21. Fix ALL issues before declaring a bug fixed — don't assume one fix is sufficient

When the user reports "X is broken", there are almost always multiple contributing causes. Fixing the first issue you find and declaring victory wastes the user's time — they have to come back, re-report, and wait for another fix cycle. This happened with the organiser dashboard: the initial fix addressed one animation issue, but the dashboard had 5+ separate problems (variant propagation, missing hostAvatar, null safety, error states, orphaned code).

**Rule:** When investigating a bug report, keep searching after finding the first issue. Read the full component tree, trace every data flow path, and check every rendering branch. Create a comprehensive list of ALL issues before starting fixes. Only declare "fixed" after verifying the full user flow works end-to-end — not after patching the first thing that looks wrong.

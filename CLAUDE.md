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
package.json           # Frontend deps (ESM) — v0.38.0
ANTIGRAVITY_BRAIN.md   # Design philosophy doc (read before UI changes)
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
- [ ] Add rate limiting to all mutation endpoints (currently only on `/auth/*`)

### Phase 6: Bug Fixes + Production Polish

**Why last:** These improve the experience but don't block core functionality.

**Documented P1 bugs** (see `docs/MANGO_DEV_TASKS.md` — verify against `docs/MANGO_QA_SIGNOFF.md` for current state):
- [ ] BUG-1: Mango position not persisted when wall crawl is interrupted by tap — `onPositionChange` never called in that branch
- [ ] BUG-2: Mango pose stays `wall_grab` when dragging back off wall — no pose reset to `carried` when leaving wall zone mid-drag

**Production polish:**
- [ ] Enforce Pro features on backend (`isPro` check on premium endpoints)
- [ ] Add service worker for offline support / PWA install prompt
- [ ] Implement Google OAuth (currently simulated with DEMO_USER)
- [ ] Add error boundary components for graceful crash recovery
- [x] Performance audit: bundle splitting (736kb → 389kb main chunk), lazy-load heavy components (MangoChat, MangoAssistant, OnboardingFlow, CreateEventModal, EventReels), vendor chunks for framer-motion and Google Maps
- [x] Delete orphaned `MangoSVG.jsx` (74kb, not imported — SVG defined inline in `Mango.jsx`)
- [x] Delete orphaned hooks (`src/hooks/` — replaced by Zustand stores)
- [x] Delete orphaned `EmailVerificationModal.jsx` (email verification intentionally removed)

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
| Workflow | `auto-approve` | Validates (lint + test + build), then auto-approves, squash-merges, and deletes branch for conflict-free PRs |

---

## Development Workflow

### Branches

| Branch | Environment | GitHub Pages | Backend | Workflow |
|--------|---|---|---|---|
| `development` | Development/Preview | `/SocialiseApp/dev/` | `socialise-app-development.up.railway.app` | `deploy-develop.yml` |
| `production` | Production | `/SocialiseApp/prod/` | `socialise-app-production.up.railway.app` | `deploy-production.yml` |

**Workflow:**
1. Create feature branches from `development`
2. Test locally with local backend
3. Push to `development` → auto-deploys to `/dev/` preview for testing
4. Merge `development` → `production` → auto-deploys to `/prod/` production

**Auto-approve PRs:** The `auto-approve.yml` workflow runs on all PRs. It first runs a `validate` job (lint, tests, build). If the PR has no merge conflicts and validation passes, it automatically approves, squash-merges, and deletes the source branch. PRs with conflicts get a comment and are skipped.

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
- State managed via Zustand stores (`src/stores/`). Components import stores directly — minimal prop drilling.
- Toast notifications via `showToast(message, type)` — types: `'success'`, `'error'`, `'info'`.
- Optional chaining everywhere user/event data is accessed: `user?.name ?? 'fallback'`.
- Framer Motion used for all transitions. `AnimatePresence` wraps conditionally rendered elements.
- Never hardcode `#ffffff` or `black` — always use design token CSS vars or Tailwind utilities mapped to those vars.

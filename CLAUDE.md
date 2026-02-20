# Socialise App — Claude Brain

> Fast-reference context for Claude Code. Read this before touching anything.

---

## What This App Is

**Socialise** is a community-driven social event discovery and micro-meet matchmaking platform. The pitch: warm, local, human connection — not cold tech. Think Meetup meets Hinge, with AI-curated small dinners (4-6 people) called "Micro-Meets".

**Current state:** Active migration from mock data to real backend. Backend routes for events, communities, feed, and users are wired to Supabase. Auth still uses flat-file `users.json` — fixing this is the current priority. Frontend still reads from `mockData.js` and has not yet been wired to the real API endpoints.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion 12 |
| Icons | Lucide React |
| Maps | @react-google-maps/api + use-places-autocomplete |
| Backend | Node.js + Express 5, deployed on Railway |
| Database | Supabase (Postgres) — events, communities, feed, users tables |
| Auth | JWT (jsonwebtoken) + bcryptjs — still backed by users.json (migration pending) |
| Persistence | localStorage (frontend), users.json (auth only, legacy), Supabase (all other data) |
| Deployment | GitHub Pages (frontend), Railway (backend) |
| Fonts | Outfit (headings), Quicksand (body) |

No Redux, no Zustand. Frontend state lives in `App.jsx` + localStorage. Backend uses Supabase (Postgres) for persistence.

---

## Directory Layout

```
/src
  App.jsx              # Main app — 1026 lines, all state lives here
  api.js               # API client (login, register, getMe)
  main.jsx             # Entry point + MangoContext provider
  index.css            # Design tokens, global styles, Tailwind overrides
  /components          # 32+ UI components
  /contexts            # MangoContext (kitten assistant global state)
  /data
    mockData.js        # All mock events, communities, feed posts, demo user
/server
  index.js             # Express entry — mounts all routers
  supabase.js          # Supabase client (service role, server-side only)
  matching.js          # Micro-Meet matching algorithm
  migrate.js           # DB migration runner
  seed.js              # Seed data for Supabase tables
  users.json           # Legacy flat-file user store (auth only — being replaced)
  package.json         # Server-specific deps (CommonJS)
  /routes
    auth.js            # Login/register/me — still reads users.json (migration pending)
    events.js          # CRUD + RSVP/save/chat — Supabase
    communities.js     # CRUD + join/leave/feed — Supabase
    feed.js            # Global feed + reactions — Supabase
    users.js           # Profiles + recommendations — Supabase
/public                # PWA icons, logos
/docs                  # QA notes, dev task docs
package.json           # Frontend deps (ESM)
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
| `--paper` | `#F9F7F2` | Background (never pure white) |
| `--text` | `#1A1C1C` | Main text |
| `--muted` | `#5C6363` | Secondary text |

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
| App | `src/App.jsx` | All state, all handlers. 1026 lines. |
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
{ id, name, members, lastMessage, unread, avatar, description, memberAvatars, category, isJoined }
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
| `socialise_joined` | Array | Joined event IDs |
| `socialise_chats` | Object | `{ [eventId]: Message[] }` |
| `socialise_pro` | Boolean | Pro subscription |
| `socialise_tribes` | Array | Joined tribe IDs |
| `socialise_saved` | Array | Saved event IDs |
| `socialise_onboarding_shown` | Boolean | Onboarding complete |
| `socialise_preferences` | Object | User onboarding prefs |
| `socialise_experimental` | Boolean | Experimental features toggle |

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
| POST | `/events/:id/rsvp` | Required | RSVP to event |
| DELETE | `/events/:id/rsvp` | Required | Un-RSVP |
| POST | `/events/:id/save` | Required | Save event |
| DELETE | `/events/:id/save` | Required | Unsave event |
| GET | `/events/:id/chat` | Optional | Get event chat messages |
| POST | `/events/:id/chat` | Required | Post chat message |
| GET | `/communities` | Optional | List communities from Supabase |
| GET | `/communities/:id` | Optional | Single community detail |
| POST | `/communities` | Required | Create community |
| POST | `/communities/:id/join` | Required | Join community |
| DELETE | `/communities/:id/join` | Required | Leave community |
| GET | `/communities/:id/feed` | Optional | Community feed |
| POST | `/communities/:id/feed` | Required | Post to community feed |
| GET | `/feed` | Optional | Global feed from Supabase |
| POST | `/feed` | Required | Create feed post |
| GET | `/users/:id` | Optional | User profile |
| PUT | `/users/:id` | Required | Update profile |
| GET | `/users/:id/recommendations` | Optional | Micro-Meet recommendations |

**Demo credentials:** `ben@demo.com` / `password`

**User storage (auth only — legacy):** `server/users.json` — flat JSON array. Auth route reads/writes this directly. Migration to Supabase is the active work item.

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
| Auth (login/register/JWT) | Real — but users stored in `users.json`, not Supabase yet (active bug) |
| User data | Real (users.json) — Supabase migration pending |
| Events API | Real (Supabase via `/api/events`) — frontend not yet wired |
| Communities API | Real (Supabase via `/api/communities`) — frontend not yet wired |
| Feed API | Real (Supabase via `/api/feed`) — frontend not yet wired |
| Users API | Real (Supabase via `/api/users`) — frontend not yet wired |
| Micro-Meet recommendations | Real — matching algorithm in `server/matching.js` |
| Frontend events display | Still mock — reads from `mockData.js` |
| Frontend communities display | Still mock — reads from `mockData.js` |
| Frontend feed display | Still mock — reads from `mockData.js` |
| Chat messages | Mock (initial) + localStorage for new messages |
| Realtime pings | Simulated with setTimeout |
| Pro subscription | UI only — no payment, no enforcement |
| Google login | Simulated — just loads DEMO_USER |

## Migration In Progress

**Goal:** Replace all mock data with real Supabase-backed API calls.

**Completed (backend):**
- Supabase client configured in `server/supabase.js`
- Events, Communities, Feed, Users routes all wired to Supabase
- Micro-Meet matching algorithm (`server/matching.js`)
- Seed data script (`server/seed.js`)
- Migration runner (`server/migrate.js`)
- Railway deployment configured for production + development environments
- API URL now reads from `VITE_API_URL` env var (not hardcoded)

**In progress:**
- Auth route still reads/writes `users.json` — needs migrating to Supabase users table. This is causing authentication issues (users registered via the API aren't persisted correctly in production/Railway where the filesystem is ephemeral).

**Not yet started (frontend):**
- Wire `src/api.js` to call real `/api/events`, `/api/communities`, `/api/feed` endpoints instead of importing from `mockData.js`
- Replace localStorage-based join/save/tribe state with API calls
- Handle loading/error states for real async data throughout the app

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

---

## Known Gaps (to be addressed when scaling to production)

### Structural
- `App.jsx` is 1026 lines with all state centralized. Needs breaking into feature slices or a proper store (Zustand recommended) when complexity grows further.
- No test coverage. Zero tests. Needs Vitest + React Testing Library for unit tests, Playwright or Cypress for E2E.
- Frontend still uses `mockData.js` — needs wiring to real API (see Migration In Progress above).
- No real-time. Supabase Realtime could replace the current `setTimeout` simulation for live feed/chat.

### Security
- **Auth uses `users.json` on an ephemeral Railway filesystem** — registered users are lost on every redeploy. Migrating auth to Supabase is the active priority.
- Server JWT_SECRET defaults to dev fallback — must set `JWT_SECRET` env var in production.
- CORS defaults to dev origins — set `ALLOWED_ORIGINS` env var in production.
- localStorage token storage is XSS-vulnerable. For production: HttpOnly cookies.
- No rate limiting on auth endpoints. Add express-rate-limit before public launch.
- No email verification on registration.

### UX
- Pro feature gates exist in UI but are not enforced (isPro not checked in logic).
- No offline support / service worker.
- No accessibility audit — limited ARIA, no keyboard nav testing.
- No lazy loading on images.

---

## Development Workflow

### Branches

| Branch | Environment | GitHub Pages | Backend | Purpose |
|--------|---|---|---|---|
| `development` (tracks `develop`) | Development/Preview | `/SocialiseApp/dev/` | `socialise-app-development.up.railway.app` | Testing & validation |
| `production` (tracks `master`) | Production | `/SocialiseApp/` | `socialise-app-production.up.railway.app` | Public-facing |

**Workflow:**
1. Create feature branches from `development`
2. Test locally with local backend
3. Push to `development` → auto-deploys to `/dev/` preview for testing
4. Merge `development` → `production` → auto-deploys to `/` production

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
- `production` branch → GitHub Actions auto-deploys to `/` + uses `socialise-app-production` Railway project

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

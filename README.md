<p align="center">
  <img src="public/logo.png" alt="Socialise" width="80" />
</p>

<h1 align="center">Socialise.</h1>

<p align="center">
  Community-driven social event discovery and micro-meet matchmaking platform.
  <br />
  Warm, local, human connection — not cold tech.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-purple" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Express-4-green" alt="Express 4" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ecf8e" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tests-548-brightgreen" alt="548 Tests" />
</p>

---

## What is Socialise?

Socialise is a platform for discovering local social events and connecting with people through AI-curated small group dinners called **Micro-Meets** (4–6 people). Think Meetup meets Hinge — built around communities, shared interests, and real-world gatherings.

### Key Features

- **Event Discovery** — Browse, search, and filter local events by category, location, and date
- **Micro-Meets** — AI-matched small group dinners based on shared interests and compatibility scores
- **Communities & Tribes** — Join interest-based groups with shared feeds and group chat
- **Social Feed** — Threaded posts with emoji reactions across communities
- **Real-time Chat** — Event and community chat rooms
- **Gamification** — XP system with levels and unlockable titles
- **Mango** — An interactive kitten companion with physics-based animations, drag interactions, and multiple poses
- **PWA Support** — Installable on mobile with app icons and offline-ready shell

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion 12, Zustand 5 |
| **Icons** | Lucide React |
| **Maps** | @react-google-maps/api + use-places-autocomplete |
| **Backend** | Node.js + Express 4 |
| **Database** | Supabase (Postgres) with Row Level Security |
| **Auth** | JWT + bcryptjs |
| **Testing** | Vitest, React Testing Library, Supertest |
| **Deployment** | GitHub Pages (frontend), Railway (backend) |

---

## Project Structure

```
/src
  App.jsx                # Layout, effects, routing
  api.js                 # API client (auth, events, communities, feed, users)
  main.jsx               # Entry point
  index.css              # Design tokens, global styles
  /stores                # Zustand stores (auth, events, communities, feed, ui)
  /components            # UI components (tabs, modals, sheets)
  /contexts              # MangoContext (kitten assistant state)
  /hooks                 # useEscapeKey, useFocusTrap
  /data
    constants.js         # UI constants: categories, tags, XP levels

/server
  index.js               # Express entry — mounts all routers
  supabase.js            # Supabase client (service role)
  matching.js            # Micro-Meet matching algorithm
  migrate.js             # DB migration runner
  seed.js                # Seed data for Supabase tables
  /migrations            # SQL migration files (001–005)
  /routes                # auth, events, communities, feed, users

/.github/workflows       # CI/CD: auto-approve, deploy-dev, deploy-prod
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) Google Maps API key for location features

### Frontend

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your API keys

# Start dev server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Backend

```bash
cd server

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secret

# Run database migrations
node migrate.js

# (Optional) Seed demo data
node seed.js

# Start the server
node index.js
```

The backend runs at `http://localhost:3001`.

### Environment Variables

**Frontend** (`.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:3001/api`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (optional) |

**Backend** (`server/.env`):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret for signing JWTs (required in production) |
| `PORT` | Server port (default: `3001`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

---

## Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI |

### Backend

| Command | Description |
|---|---|
| `node index.js` | Start Express server |
| `node migrate.js` | Run database migrations |
| `node seed.js` | Seed demo data |
| `npm test` | Run server tests |

---

## Testing

The project has **548 tests** across 22 test files:

- **Frontend (373 tests)** — Components, Zustand stores, API client, accessibility hooks
- **Backend (175 tests)** — Route handlers (auth, events, communities, feed) and the matching algorithm

```bash
# Run all frontend tests
npm test

# Run all server tests
cd server && npm test

# Run with coverage
npm run test:coverage
```

---

## API Overview

Base URL: `http://localhost:3001/api`

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| **Events** | CRUD, join/leave, save/unsave, chat |
| **Communities** | CRUD, join/leave, members, chat |
| **Feed** | CRUD, emoji reactions |
| **Users** | Profile update, my events/saved/communities |
| **Recommendations** | `GET /events/recommendations/for-you` (match-scored Micro-Meets) |

All mutation endpoints require a Bearer token. Rate limiting is applied to auth endpoints (15 requests per 15 minutes per IP).

---

## Design System — "Warm Hearth"

The design philosophy prioritizes human warmth over cold tech aesthetics.

| Token | Color | Usage |
|---|---|---|
| Primary | `#E2725B` (Terracotta) | Actions, CTAs |
| Secondary | `#2D5F5D` (Teal) | Navigation, text |
| Accent | `#F4B942` (Gold) | Highlights, delight |
| Background | `#F9F7F2` (Paper) | App background |

**Typography:** Outfit (headings) + Quicksand (body)

See [ANTIGRAVITY_BRAIN.md](ANTIGRAVITY_BRAIN.md) for the full design system reference.

---

## Deployment

| Branch | Frontend | Backend |
|---|---|---|
| `development` | GitHub Pages `/dev/` | Railway (development) |
| `production` | GitHub Pages `/prod/` | Railway (production) |

**Workflow:**
1. Create feature branches from `development`
2. PRs are auto-validated (lint, test, build) and auto-merged if conflict-free
3. Push to `development` deploys to the dev preview environment
4. Merge `development` into `production` deploys to production

Version is derived dynamically at build time from the latest merged PR number (`0.1.{PR#}`).

---

## Demo

**Demo credentials:** `ben@demo.com` / `password`

---

## License

This project is private and not licensed for public use.

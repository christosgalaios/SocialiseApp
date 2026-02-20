# Socialise App: Mock-to-Real Migration Plan

## Overview
Migrate Socialise from a mock-data prototype to a live application with real user-generated content, persistent data storage, and functional business logic.

**Current State:**
- Real: Auth (login/register/JWT), user data (users.json file)
- Mock: All events, communities, feed posts, micro-meets, chat messages
- Backend: Auth-only, events endpoint is a stub

**Target State:**
- All core entities (events, communities, posts, chats) stored in real database
- User-generated content flowing through the app
- Removal of mock data and demo account
- Functional micro-meet matching (AI or algorithmic)

---

## Phase 1: Database & Backend Infrastructure

### 1.1 Choose & Setup Database
**Decision Required:** Which database?
- **Option A: Supabase (PostgreSQL)** — Recommended
  - Postgres + Auth + Realtime included
  - Easy to scale
  - Supabase JS client integrates well with React
  - Free tier sufficient for initial phase

- **Option B: Firebase (NoSQL)**
  - Easier setup, Google-managed
  - Realtime out of box
  - Less control over schema

- **Option C: Local Postgres + Railway/Render**
  - Full control, more setup
  - Self-host or use PaaS hosting

**Recommendation:** Start with **Supabase** (PostgreSQL). Gives you relational database benefits, real-time subscriptions, and simpler deployment than self-hosted Postgres.

### 1.2 Schema Design

**Tables needed:**

```sql
-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  location text NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  date timestamp NOT NULL,
  time text NOT NULL,
  price integer DEFAULT 0,
  max_spots integer DEFAULT 30,
  current_spots integer DEFAULT 0,
  host_id uuid REFERENCES users(id),
  image_url text,
  is_micro_meet boolean DEFAULT false,
  status text DEFAULT 'active', -- 'active', 'cancelled', 'completed'
  category_attrs jsonb, -- Flexible attrs per category
  inclusivity_tags text[],
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Communities (Tribes)
CREATE TABLE communities (
  id uuid PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  avatar text, -- emoji or URL
  category text,
  is_curated boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Community Membership
CREATE TABLE community_members (
  id uuid PRIMARY KEY,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamp DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Feed Posts
CREATE TABLE feed_posts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  community_id uuid REFERENCES communities(id) ON DELETE SET NULL,
  image_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Feed Post Reactions (emoji reactions)
CREATE TABLE post_reactions (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Event Chat Messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Event Attendees / RSVPs
CREATE TABLE event_rsvps (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'interested', -- 'interested', 'going', 'maybe', 'not_going'
  joined_at timestamp DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Saved Events (User bookmarks)
CREATE TABLE saved_events (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  saved_at timestamp DEFAULT now(),
  UNIQUE(user_id, event_id)
);
```

**Users table** — Extend existing:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
```

---

## Phase 2: Backend API Endpoints

### 2.1 Events API
```
GET    /api/events?category=Food&location=London&limit=20&offset=0
  → Filter by category, location; pagination

GET    /api/events/:id
  → Fetch single event + attendee list

POST   /api/events
  → Create event (authenticated, user is host)
  → Body: { title, description, category, location, lat, lng, date, time, price, max_spots, image_url, category_attrs, inclusivity_tags }

PUT    /api/events/:id
  → Update event (host only)

DELETE /api/events/:id
  → Cancel event (host only)

GET    /api/events/:id/attendees
  → List attendees with status

POST   /api/events/:id/join
  → RSVP to event (authenticated)
  → Body: { status: 'interested' | 'going' | 'maybe' | 'not_going' }

POST   /api/events/:id/leave
  → Un-RSVP from event

GET    /api/events/:id/chat
  → Fetch chat messages for event (paginated)

POST   /api/events/:id/chat
  → Send message to event chat (authenticated)
  → Body: { message: string }
```

### 2.2 Communities API
```
GET    /api/communities?category=Tech&limit=20&offset=0
  → List communities

GET    /api/communities/:id
  → Fetch single community + member count

POST   /api/communities
  → Create community (authenticated)
  → Body: { name, description, avatar, category }

PUT    /api/communities/:id
  → Update community (creator only)

POST   /api/communities/:id/join
  → Join community (authenticated)

POST   /api/communities/:id/leave
  → Leave community

GET    /api/communities/:id/members
  → List community members (paginated)
```

### 2.3 Feed API
```
GET    /api/feed?community_id=...&limit=20&offset=0
  → Fetch feed posts (global or community-specific)

POST   /api/feed
  → Create post (authenticated)
  → Body: { content, event_id?, community_id?, image_url? }

DELETE /api/feed/:id
  → Delete own post

POST   /api/feed/:id/reactions
  → Add reaction emoji (authenticated)
  → Body: { emoji: string }

DELETE /api/feed/:id/reactions/:emoji
  → Remove reaction
```

### 2.4 User API (extend existing)
```
GET    /api/users/:id
  → Public user profile

PUT    /api/users/me
  → Update own profile (authenticated)
  → Body: { name, bio, interests, location, avatar }

GET    /api/users/me/events
  → My events (hosted + attending)

GET    /api/users/me/saved
  → My saved events
```

---

## Phase 3: Remove Demo & Mock Data

### 3.1 Backend Changes
- **Remove:** Demo account bypass in login route (lines 99-100 in `server/index.js`)
- **Remove:** Hardcoded demo user generation in register route
- **Keep:** Auth infrastructure, validation, JWT logic

### 3.2 Frontend Changes
- **Remove:** Import of `mockData.js` in App.jsx
- **Remove:** `DEMO_USER` constant from mockData
- **Remove:** Hardcoded `INITIAL_EVENTS`, `COMMUNITIES`, `INITIAL_MICRO_MEETS`, `ADVERTISED_EVENTS` from mockData
- **Remove:** `useEffect` that populates state with mock data on mount
- **Keep:** `CATEGORIES`, `INCLUSIVITY_TAGS`, `CATEGORY_ATTRIBUTES` (these are UI config, not data)

### 3.3 State Management Updates in App.jsx
**Current approach (mock):**
```jsx
const [events, setEvents] = useState(INITIAL_EVENTS);
const [communities, setCommunities] = useState(COMMUNITIES);
```

**New approach (real):**
```jsx
const [events, setEvents] = useState([]);
const [eventsLoading, setEventsLoading] = useState(true);
const [eventsError, setEventsError] = useState(null);

// Fetch on mount
useEffect(() => {
  if (user) fetchEvents();
}, [user]);

const fetchEvents = async (filters = {}) => {
  try {
    setEventsLoading(true);
    const response = await api.getEvents(filters);
    setEvents(response);
  } catch (err) {
    setEventsError(err.message);
    showToast(err.message, 'error');
  } finally {
    setEventsLoading(false);
  }
};
```

---

## Phase 4: Implement Micro-Meets Real Logic

### 4.1 Matching Algorithm
Micro-Meets are curated small dinners (4-6 people). Need matching based on:
- **User interests overlap** — Higher match score if interests align
- **Location proximity** — Prefer users in same general area
- **Group diversity** — Mix different backgrounds/professions
- **Availability** — All users free on proposed date/time

### 4.2 Implementation Options

**Option A: Simple Rule-Based (Phase 1)**
```js
function matchScore(userA, userB) {
  const commonInterests = userA.interests.filter(i => userB.interests.includes(i));
  const interestScore = (commonInterests.length / Math.max(userA.interests.length, userB.interests.length)) * 100;
  const locationScore = userA.location === userB.location ? 50 : 0;
  return interestScore * 0.7 + locationScore * 0.3;
}
```

**Option B: AI-Powered (Phase 2+)**
- Use Claude API to analyze user bios/interests and generate creative match combinations
- Endpoint: `POST /api/micro-meets/generate` → call Claude, save result

### 4.3 Backend Implementation
```
POST   /api/micro-meets/generate
  → Authenticated, creates matching groups
  → Logic: Find 4-6 compatible users, schedule, create event + chat group

GET    /api/micro-meets
  → List upcoming micro-meets user is in

POST   /api/micro-meets/:id/join
  → Accept generated micro-meet
```

---

## Phase 5: Data Migration & Seeding

### 5.1 Seed Initial Content
Create a seed script (`server/seed.js`) that:
1. Creates default communities (e.g., "London Tech Socials", "Brunch Club", etc.)
2. Creates sample events for launch day
3. Bulk-inserts using Supabase/Postgres COPY or batch inserts

### 5.2 Backward Compatibility
- **localStorage keys remain the same** for joined events, saved events, preferences
- **Read from localStorage on first sync**, then use database as source of truth

### 5.3 Migration Path
1. Launch new API endpoints alongside mock data
2. Gradually move frontend components to fetch from API instead of state
3. Enable toggle flag `useRealData` in App.jsx to switch between mock and real
4. Once stable, remove mock data paths entirely

---

## Phase 6: Frontend Integration

### 6.1 API Client Updates (`src/api.js`)
Add new methods:
```js
export const getEvents = (filters = {}) => fetchWithAuth(`/events?${new URLSearchParams(filters)}`);
export const getEvent = (id) => fetchWithAuth(`/events/${id}`);
export const createEvent = (data) => fetchWithAuth(`/events`, { method: 'POST', body: data });
export const joinEvent = (eventId, status) => fetchWithAuth(`/events/${eventId}/join`, { method: 'POST', body: { status } });
export const getCommunities = (filters = {}) => fetchWithAuth(`/communities?${new URLSearchParams(filters)}`);
export const createCommunity = (data) => fetchWithAuth(`/communities`, { method: 'POST', body: data });
export const getFeedPosts = (filters = {}) => fetchWithAuth(`/feed?${new URLSearchParams(filters)}`);
export const createPost = (data) => fetchWithAuth(`/feed`, { method: 'POST', body: data });
// ... more as needed
```

### 6.2 Component Updates
Update key components to handle loading/error states:
- `EventCard` → fetch images from URL field, not mock
- `EventDetailSheet` → fetch chat messages from API
- `FeedItem` → fetch posts from database
- `CommunityList` → fetch communities from database
- `CreateEventModal` → POST to `/api/events` instead of local state
- `Skeleton` → shown while loading from API

### 6.3 Pagination & Infinite Scroll
Implement offset-based pagination:
```jsx
const [events, setEvents] = useState([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const res = await api.getEvents({ limit: 20, offset });
  if (res.length < 20) setHasMore(false);
  setEvents([...events, ...res]);
  setOffset(offset + 20);
};
```

---

## Phase 7: Testing & Launch

### 7.1 Manual Testing Checklist
- [ ] Create event as user A, see it in event list
- [ ] User B joins event, chat works
- [ ] Create community, user joins
- [ ] Create feed post with emoji reactions
- [ ] Save/bookmark event
- [ ] Micro-meet generation (if implemented)
- [ ] Event cancellation removes from lists
- [ ] Offline behavior (show cached data, queue changes)

### 7.2 Performance Optimization
- Image optimization (lazy load, Cloudinary or similar)
- Query optimization (indexes on frequently filtered columns)
- Rate limiting on API endpoints
- Caching strategy (browser cache for events, refresh on nav)

### 7.3 Error Handling
- Network errors → Retry with exponential backoff
- 401 Unauthorized → Auto-logout
- 400 Bad Request → Show validation errors to user
- 500 Server Error → Show generic error toast

---

## Timeline (Estimated Phases)

| Phase | Tasks | Effort |
|-------|-------|--------|
| **1-2** | Database setup, schema, backend API | 2-3 weeks |
| **3** | Remove demo/mock, update state mgmt | 1 week |
| **4** | Micro-meets logic | 1-2 weeks |
| **5** | Data migration & seeding | 3-5 days |
| **6** | Frontend integration | 2-3 weeks |
| **7** | Testing, fixes, launch | 1 week |

**Total:** 6-9 weeks to full migration.

---

## Decisions Required

1. **Database choice:** Supabase (recommended) vs Firebase vs self-hosted Postgres?
2. **Micro-meets matching:** Simple rule-based (Phase 1) or AI-powered (Phase 2)?
3. **Payment integration:** Stripe/Paddle later, or mock pricing for now?
4. **Realtime features:** Enable Supabase Realtime subscriptions for live chat/feed?
5. **Email notifications:** Send emails when event is about to start? (Phase 2+)

---

## Success Criteria

✅ Zero mock data in production state
✅ All events/communities/posts user-generated and database-backed
✅ Chat messages persist across sessions
✅ New users can onboard, create events, join communities
✅ Micro-meet generation functional (basic matching)
✅ No demo account backdoors
✅ API response times < 500ms (p95)
✅ 95%+ uptime during initial launch week

---

## Rollback Plan

If critical issues arise post-launch:
1. Switch `USE_MOCK_DATA` flag to true in App.jsx
2. Revert backend to serve hardcoded events from a fallback JSON file
3. Show banner: "We're experiencing issues. Using offline data for now."
4. Debug on staging before re-deploying

---

## Next Steps (If Approved)

1. **Decide:** Database choice (recommend Supabase)
2. **Setup:** Create Supabase project, configure schema
3. **Build Phase 1:** Backend API for events + communities
4. **Test:** Manually verify endpoints work
5. **Integrate:** Update App.jsx to fetch from API instead of mock
6. **Launch:** Remove mock data, deploy to production

# Socialise App: Real Database Setup Guide

This guide covers the manual steps needed to complete the mock-to-real migration and get your Supabase backend running.

## Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js 16+ installed locally
- Git repository access
- Backend server running locally or on a VPS

---

## Phase 1: Create Supabase Project

### 1.1 Create Project on Supabase

1. Go to https://app.supabase.com
2. Sign up or log in
3. Click **"New Project"**
4. Choose organization (or create one)
5. **Project name:** `socialise` (or your choice)
6. **Database password:** Create a strong password (save it safely)
7. **Region:** Choose closest to your users (e.g., `eu-west-1` for Europe)
8. Click **"Create new project"** and wait 1-2 minutes for initialization

### 1.2 Get Your API Keys

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them shortly):
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **Service Role Key** — under "Project API keys", scroll to `service_role`

⚠️ **Keep `service_role` key SECRET** — never commit it or expose to the browser. Use it only on the backend.

---

## Phase 2: Set Up Environment Variables

### 2.1 Create Server .env File

```bash
cd /home/user/SocialiseApp/server
cp .env.example .env
```

### 2.2 Fill in .env

Edit `server/.env` with your values:

```bash
# Required: Generate a strong JWT secret
# On macOS/Linux:
openssl rand -hex 32
# On Windows, use an online generator or: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

JWT_SECRET=<paste-your-generated-secret-here>

# Required: From Supabase Project Settings → API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Adjust if needed
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2.3 Verify .env is Ignored by Git

Check that `server/.env` is in `.gitignore`:

```bash
echo "server/.env" >> .gitignore
git add .gitignore && git commit -m "Ensure server/.env is in gitignore"
```

---

## Phase 3: Create Database Schema

### 3.1 Run SQL Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"** (or **"New SQL snippet"**)
3. Open `/home/user/SocialiseApp/server/migrations/001_initial_schema.sql`
4. Copy entire file contents
5. Paste into the SQL editor
6. Click **"Run"** or **Cmd+Enter**
7. Wait for "Success" message

The migration will create all tables:
- `events`
- `event_rsvps`
- `saved_events`
- `chat_messages`
- `communities`
- `community_members`
- `community_messages`
- `feed_posts`
- `post_reactions`

### 3.2 Verify Tables Exist

In Supabase Dashboard:
1. Go to **Table Editor** (left sidebar)
2. You should see all 9 tables listed
3. Click each one to verify columns exist

---

## Phase 4: Seed Initial Data

### 4.1 Prepare Seed Script

The seed script creates demo events and communities. First, ensure your user exists:

1. Log in to the Socialise app (or register) with an account
2. Make sure at least one user exists in `server/users.json`
3. Note the user's ID (visible in users.json)

### 4.2 Run Seed Script

```bash
cd /home/user/SocialiseApp/server
node seed.js
```

Expected output:
```
Upserting 8 communities...
Upserting 6 events...
Seeding complete!
```

If you see errors about `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`, double-check your `.env` file.

### 4.3 Verify Seeded Data

In Supabase Dashboard → **Table Editor**:
1. Open **`communities`** table — should show 8 rows (London Tech Socials, Hiking Enthusiasts, etc.)
2. Open **`events`** table — should show 6 rows (Friday Social Drinks, 90s vs 00s Party, etc.)

---

## Phase 5: Test the Backend API

### 5.1 Start Backend Server

```bash
cd /home/user/SocialiseApp/server
node index.js
```

Expected output:
```
Server running on :3001
```

### 5.2 Test Key Endpoints

In a separate terminal, test with curl:

**Get all events:**
```bash
curl -s http://localhost:3001/api/events | jq .
```

**Get communities:**
```bash
curl -s http://localhost:3001/api/communities | jq .
```

**Get feed:**
```bash
curl -s http://localhost:3001/api/feed | jq .
```

All should return JSON arrays with seeded data.

### 5.3 Test Authenticated Endpoints

First, log in to get a token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ben@demo.com","password":"password"}' | jq .
```

Copy the `token` from the response, then test:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Create an event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Test Event",
    "category":"Food & Drinks",
    "location":"London",
    "date":"2025-03-01",
    "time":"19:00",
    "price":15,
    "max_spots":20
  }' | jq .
```

---

## Phase 6: Wire Frontend to Backend

### 6.1 Check Frontend .env

Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in `.env` (frontend):

```bash
cat /home/user/SocialiseApp/.env
```

If missing, add it:

```bash
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 6.2 Start Frontend Dev Server

In a separate terminal:

```bash
cd /home/user/SocialiseApp
npm run dev
```

Visit http://localhost:5173 and test:
1. Register a new account or log in
2. Navigate to **Explore** tab
3. You should see the seeded events from Supabase
4. Try joining an event — should work without errors

---

## Phase 7: Deploy Backend (Optional)

If you want to deploy the backend to production:

### 7.1 Deploy to Railway or Render

**Option A: Railway**
1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your Socialise repo
4. Select the `server` directory as root
5. Set environment variables (JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
6. Deploy

**Option B: Render**
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Set build command: (leave default or `npm install`)
5. Set start command: `node index.js`
6. Add environment variables
7. Deploy

### 7.2 Update Frontend API URL

Once deployed, update `src/api.js`:

```javascript
const API_URL = 'https://your-backend-url.railway.app/api'; // Change from localhost:3001
```

---

## Phase 8: Known Gaps & Future Work

### Not Yet Implemented

1. **Micro-Meets Matching Algorithm** — Currently returns all micro-meets without personalized scoring. Needs to:
   - Calculate compatibility score based on user interests vs event category
   - Weight by location proximity
   - Return as `matchScore` field on events

2. **Reviews System** — Table exists but no API endpoints yet. Would need:
   - GET `/api/communities/:id/reviews`
   - POST `/api/communities/:id/reviews` (create review)

3. **Payment Integration** — Currently bypassed. Needs:
   - Stripe integration for event payments
   - Payment verification in `/api/events/:id/join`
   - Refund logic on leave

4. **Real-time Chat** — Currently uses polling. Could upgrade to:
   - Supabase Realtime subscriptions
   - WebSockets

5. **Notifications** — No backend support yet. Would need:
   - Email service (SendGrid, Mailgun)
   - Push notifications (OneSignal, Firebase)

6. **Image Upload** — Currently accepts URLs only. Should add:
   - Supabase Storage for user avatars, event images
   - File upload endpoints

### Security Checklist for Production

- [ ] Set `JWT_SECRET` to a strong random value (not default)
- [ ] Restrict `ALLOWED_ORIGINS` to your actual domain
- [ ] Use HTTPS only (no HTTP)
- [ ] Enable Supabase Row Level Security (RLS) — currently disabled
- [ ] Rate limit auth endpoints (express-rate-limit)
- [ ] Add email verification on registration
- [ ] Use HttpOnly cookies for auth tokens instead of localStorage
- [ ] Add CSRF protection
- [ ] Audit Supabase permissions and data exposure

---

## Troubleshooting

### "SUPABASE_URL not found"
- Check that `server/.env` has `SUPABASE_URL=...`
- Ensure you're running `node` commands from the `server/` directory

### "Service role key invalid"
- Double-check the key is copied exactly (no extra spaces)
- Verify it's the `service_role` key, not `anon` key

### Events not showing in frontend
- Check backend is running: `curl http://localhost:3001/api/events`
- Check browser console for API errors
- Verify `src/api.js` has correct API_URL (should be localhost:3001 for dev)

### "Event creation fails with 403"
- Ensure token is valid: check localStorage `socialise_token`
- Token must not be expired
- User must exist in `server/users.json`

### Seeding fails
- Ensure all users created in the app are in `server/users.json`
- Check `seed.js` — it uses the first user's ID. If no users, create one first
- Run `node seed.js --verbose` for more details (if available)

---

## Next Steps

1. ✅ Database schema created
2. ✅ API routes implemented
3. ✅ Frontend wired to API
4. [ ] **You are here** — Manual setup (Supabase + .env + seeding)
5. [ ] Test end-to-end flow
6. [ ] Implement micro-meets matching (Phase 4)
7. [ ] Add payment integration (Stripe)
8. [ ] Enable Supabase RLS for security
9. [ ] Deploy to production
10. [ ] Monitor and iterate

---

## Questions?

Check the MIGRATION_PLAN.md for overall strategy or review the API route files in `server/routes/*.js` for implementation details.

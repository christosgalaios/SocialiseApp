# Supabase Setup Guide for Socialise App

This guide walks through setting up a real Supabase project for the Socialise App.

## Prerequisites

- [Supabase account](https://supabase.com) (free tier is sufficient for development)
- `node` v18+
- `npm`

---

## Step 1: Create a Supabase Project

### 1a. Go to Supabase Dashboard

Visit [app.supabase.com](https://app.supabase.com)

### 1b. Create a New Project

- Click **"New Project"**
- **Name:** `socialise-dev` (or your choice)
- **Database Password:** Generate a strong password (save it securely)
- **Region:** Choose closest to your users (e.g., `us-east-1` for US, `eu-west-1` for EU)
- Click **"Create new project"**

**Wait 2-3 minutes** for the project to be provisioned.

### 1c. Retrieve API Keys

Once provisioned, navigate to **Project Settings → API**

You'll need two keys:
- **Project URL** (looks like `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
- **service_role key** (under "Project API keys", marked as `service_role`)

⚠️ **IMPORTANT:** Never expose `service_role` key to the browser. It bypasses Row Level Security.

---

## Step 2: Create `.env` File

### 2a. Copy Example

```bash
cd /home/user/SocialiseApp/server
cp .env.example .env
```

### 2b. Fill in Supabase Credentials

Open `server/.env` and update:

```bash
JWT_SECRET=your-long-random-secret-here
PORT=3001
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To generate JWT_SECRET:**
```bash
openssl rand -hex 32
```

---

## Step 3: Run Migrations

Migrations set up the database schema (tables, columns, constraints).

### Method 1: Supabase Dashboard (Recommended)

**Easiest and most reliable:**

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New Query"**
3. Open `server/migrations/001_initial_schema.sql` in your text editor
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (Ctrl+Enter)

**Expected result:** Green checkmark, no errors

### Method 2: Node Script (Advanced)

If you want to automate migrations:

```bash
cd /home/user/SocialiseApp/server
npm install  # Install Supabase SDK if not done
node migrate.js
```

*Note: This requires proper RPC setup in Supabase, so Method 1 is more reliable.*

---

## Step 4: Seed Initial Data

### 4a. Run Seed Script

```bash
cd /home/user/SocialiseApp/server
node seed.js
```

**Expected output:**
```
✅ Seeding communities...
✅ Seeding events...
✅ Seed complete!
```

### 4b. Verify in Dashboard

Go to **Supabase Dashboard → Data Editor**

Check these tables have data:
- `communities` (8 communities created)
- `events` (12+ micro-meet events)
- `chat_messages` (should be empty)
- `event_rsvps` (should be empty)

---

## Step 5: Configure Backend Environment

The `server/.env` is already set up. Verify it has:

```bash
JWT_SECRET=<your-32-char-hex-string>
PORT=3001
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Step 6: Start the Backend

```bash
cd /home/user/SocialiseApp/server
npm install  # if not done yet
node index.js
```

**Expected output:**
```
✓ Auth routes ready
✓ Events routes ready
✓ Communities routes ready
✓ Server listening on http://localhost:3001
```

---

## Step 7: Configure Frontend

The frontend connects via API. Update `.env` in the root directory (if needed):

```bash
# .env (root directory)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_API_URL=http://localhost:3001/api  # or your production URL
```

---

## Step 8: Test End-to-End

### 8a. Start Frontend

```bash
cd /home/user/SocialiseApp
npm run dev
```

### 8b. Test Flow

1. **Register a new user**
   - Go to app → AuthScreen
   - Fill in email, password, name
   - Click "Create account"

2. **Verify user in Supabase**
   - Check `server/users.json` has the new user ✓
   - (Note: users still stored in JSON for auth compatibility)

3. **View Events**
   - Log in with your new account
   - Go to **Explore** tab
   - You should see micro-meets with match scores!
   - Scores calculated based on your interests

4. **Join an Event**
   - Click on any micro-meet
   - Click "Join" or "Interested"
   - Check `event_rsvps` table in Supabase → should show your RSVP ✓

5. **Send Chat Message**
   - In event detail, go to **Chat** tab
   - Type a message
   - Check `chat_messages` table → should show your message ✓

---

## Step 9: Production Checklist

Before deploying, ensure:

- [ ] JWT_SECRET is a 32+ character random string (not "change_me")
- [ ] service_role key is NOT in frontend code
- [ ] CORS allowed origins configured in API
- [ ] Database backups enabled in Supabase
- [ ] Row Level Security (RLS) policies reviewed
- [ ] Rate limiting added to auth endpoints
- [ ] Google Maps API key restricted to your domain

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:** Check `server/.env` exists and has both keys:
```bash
ls server/.env
cat server/.env | grep SUPABASE
```

### Error: "Cannot find module '@supabase/supabase-js'"

**Solution:** Install dependencies:
```bash
cd server
npm install
```

### Events not showing match scores

**Possible causes:**
1. User not authenticated → match scores only calculate for logged-in users
2. Micro-meet events not in database → run seed script again
3. User interests not set → update interests in profile

**Check:**
```bash
# Verify micro-meets exist
curl http://localhost:3001/api/events

# Verify user has interests
curl -H "Authorization: Bearer your-token" \
  http://localhost:3001/api/auth/me
```

### Seed script fails with permission error

**Solution:** Check you're using `service_role` key (not `anon` key):
```bash
grep SUPABASE_SERVICE_ROLE_KEY server/.env
# Should NOT be blank or say "anon"
```

### Port 3001 already in use

**Solution:** Use a different port:
```bash
PORT=3002 node index.js
```

Then update frontend:
```bash
# .env
VITE_API_URL=http://localhost:3002/api
```

---

## Database Schema Overview

### communities
```sql
id (uuid) → primary key
name (text) → unique community name
description (text) → longer description
avatar (text) → emoji or image URL
category (text) → "Tech", "Food & Drinks", etc.
is_curated (boolean) → featured community?
created_by (text) → user_id of creator
member_count (int) → denormalized for performance
created_at, updated_at → timestamps
```

### events
```sql
id (uuid) → primary key
title (text) → event name
description (text) → longer description
category (text) → "Food & Drinks", "Tech", etc.
location (text) → venue address
lat, lng (decimal) → coordinates for maps
date (text) → ISO date "2026-03-15"
time (text) → HH:MM format "19:00"
price (int) → in pounds (£)
max_spots (int) → capacity
image_url (text) → hero image
host_id (text) → user.id who created event
host_name (text) → user.name of host
is_micro_meet (boolean) → true if 4-8 person curated event
status (text) → "active" | "cancelled" | "completed"
category_attrs (jsonb) → flexible attributes per category
inclusivity_tags (text[]) → ["lgbtq", "dog-friendly", "sober"]
created_at, updated_at → timestamps
```

### event_rsvps
```sql
id (uuid) → primary key
event_id (uuid) → references events
user_id (text) → user who RSVP'd
status (text) → "going" | "interested" | "maybe"
joined_at (timestamp) → when they joined
UNIQUE(event_id, user_id) → can't RSVP twice
```

### chat_messages
```sql
id (uuid) → primary key
event_id (uuid) → which event
user_id (text) → who sent it
user_name (text) → sender name
user_avatar (text) → sender avatar
message (text) → the message content
is_system (boolean) → system message (e.g., "User joined")
is_host (boolean) → is sender the host?
created_at (timestamp) → when sent
```

### saved_events
```sql
id (uuid) → primary key
event_id (uuid) → saved event
user_id (text) → who saved it
saved_at (timestamp) → when saved
UNIQUE(event_id, user_id) → can't save twice
```

### community_members
```sql
id (uuid) → primary key
community_id (uuid) → which community
user_id (text) → which user
joined_at (timestamp) → when joined
UNIQUE(community_id, user_id) → can't join twice
```

---

## Next Steps

Once Supabase is set up and working:

1. **Deploy Backend** → Railway, Render, or Fly.io
2. **Update Frontend API URL** → Point to production backend
3. **Deploy Frontend** → GitHub Pages or Vercel
4. **Configure Production Variables** → Environment secrets in CI/CD
5. **Monitor** → Set up Supabase alerts and logging

---

## Support

For Supabase-specific issues, see:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

For Socialise App issues, refer to `CLAUDE.md` in the root directory.

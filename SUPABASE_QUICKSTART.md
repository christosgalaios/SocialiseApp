# Supabase Setup — Quick Checklist

Follow this 10-minute checklist to get Socialise App running with Supabase.

---

## ✅ 1. Create Supabase Project

- [ ] Go to [app.supabase.com](https://app.supabase.com)
- [ ] Click **"New Project"**
- [ ] Name: `socialise-dev`
- [ ] Save the database password somewhere safe
- [ ] Choose closest region
- [ ] **Wait 2-3 minutes** for provisioning

**You should see:** "Connecting to your new database..." → then "Ready!"

---

## ✅ 2. Get API Keys

- [ ] Go to **Project Settings → API**
- [ ] Copy **Project URL** (looks like `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
- [ ] Copy **service_role** key (under "Project API keys")

**⚠️ IMPORTANT:** Don't share the service_role key! Never put it in browser code.

---

## ✅ 3. Create `.env` File

```bash
cd /home/user/SocialiseApp/server
cp .env.example .env
```

Edit `.env`:

```
JWT_SECRET=<generate with: openssl rand -hex 32>
PORT=3001
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- [ ] `.env` file created
- [ ] All 4 variables filled in

---

## ✅ 4. Run Database Migrations

**Easiest method (Recommended):**

1. [ ] Go to **Supabase Dashboard → SQL Editor**
2. [ ] Click **"New Query"**
3. [ ] Copy contents of `server/migrations/001_initial_schema.sql`
4. [ ] Paste into SQL Editor
5. [ ] Click **"Run"** (Ctrl+Enter or Cmd+Enter)

**Expected result:** Green checkmark, no errors.

**Alternative method:**
```bash
cd /home/user/SocialiseApp/server
npm install
node migrate.js
```

- [ ] Migrations complete (no SQL errors)

---

## ✅ 5. Seed Initial Data

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

- [ ] Seed script finished without errors

---

## ✅ 6. Verify Data in Supabase

- [ ] Go to **Supabase Dashboard → Data Editor**
- [ ] Check `communities` table → should have 8 rows
- [ ] Check `events` table → should have 12+ rows
- [ ] Check other tables exist (chat_messages, event_rsvps, etc.)

---

## ✅ 7. Start Backend

```bash
cd /home/user/SocialiseApp/server
node index.js
```

**Expected output:**
```
✓ Auth routes ready
✓ Events routes ready
✓ Communities routes ready
✓ Server listening on http://localhost:3001
```

- [ ] Backend running on :3001

---

## ✅ 8. Start Frontend

In a **new terminal**:

```bash
cd /home/user/SocialiseApp
npm run dev
```

**Expected output:**
```
VITE v7.3.1 ready in XXX ms
➜  Local:   http://localhost:5173
```

- [ ] Frontend running on :5173

---

## ✅ 9. Test the App

1. [ ] Open http://localhost:5173 in browser
2. [ ] Register a new account (email, password, name)
3. [ ] Go to **Explore** tab
4. [ ] See micro-meets with match scores
5. [ ] Click on an event → should show details
6. [ ] Click **"Join"** → should add to event_rsvps table

**Verify in Supabase:**
- [ ] `event_rsvps` table has your RSVP
- [ ] `users.json` file has your user (backend storage)

---

## ✅ 10. You're Done! 🎉

Supabase is now set up and running. The app is using **real data** instead of mock data.

### Next Steps

- **Deploy backend** → Railway, Render, or Fly.io
- **Deploy frontend** → GitHub Pages or Vercel
- **Add more features** → Communities, real-time chat, payments
- **Monitor** → Set up Supabase alerts and logging

---

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"

**Fix:** Check `.env` exists and has all 4 variables:
```bash
cat /home/user/SocialiseApp/server/.env | grep -E "JWT_SECRET|PORT|SUPABASE"
```

### Seed script fails

**Common cause:** Using wrong key (anon instead of service_role)

**Fix:** Copy-paste the service_role key again (not anon key)

### Port 3001 already in use

**Fix:** Kill the process or use a different port:
```bash
PORT=3002 node index.js
```

### Still stuck?

See full troubleshooting in `SUPABASE_SETUP.md`

---

## 💡 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Supabase Dashboard | https://app.supabase.com | — |
| Frontend | http://localhost:5173 | `npm run dev` |
| Backend | http://localhost:3001 | `node index.js` |
| Database | Supabase SQL Editor | Copy migration SQL |
| API Docs | N/A (hardcoded routes) | See `server/routes/` |

---

**That's it!** You now have a fully functional Socialise App with real Supabase backend. 🚀

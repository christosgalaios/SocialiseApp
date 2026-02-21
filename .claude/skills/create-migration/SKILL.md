---
name: create-migration
description: Create and validate Supabase database migrations
disable-model-invocation: true
context: fork
---

# Supabase Migration Creator

Creates and validates database migrations for Socialise. This is **user-only** to prevent accidental destructive migrations.

## Usage

```bash
/create-migration "Add email verification to users table"
/create-migration "Create notifications table for events"
/create-migration "Add soft delete to events"
```

## Migration Patterns

### Schema Changes
```sql
-- Add column
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;

-- Create table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  message TEXT NOT NULL,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add constraints
ALTER TABLE events ADD CONSTRAINT price_check CHECK (price >= 0);
```

### RLS Policies
```sql
-- Users can only see their own notifications
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Only event host can modify event
CREATE POLICY "Hosts modify own events" ON events
  FOR UPDATE USING (host_id = auth.uid());
```

### Data Migrations (Post-Schema)
```sql
-- Update existing data
UPDATE events SET category = 'social' WHERE category IS NULL;

-- Populate new column
UPDATE users SET email_verified_at = created_at WHERE verified = true;
```

## Key Migrations (Auth Priority)

### Active Todo: Migrate users from `users.json` to Supabase

```sql
-- 1. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar TEXT,
  bio TEXT,
  location VARCHAR(255),
  interests TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create auth trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- 3. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create policy for user access
CREATE POLICY "Users read their own record" ON users
  FOR SELECT USING (id = auth.uid());
```

## Pre-Migration Checklist

- [ ] Backup production database (automatic on Railway)
- [ ] Test migration on development environment first
- [ ] Review RLS policies for security
- [ ] Check for cascading deletes/constraints
- [ ] Verify migration doesn't break existing queries
- [ ] Plan rollback strategy

## File Structure

Migrations go in `server/migrations/`:
```
server/migrations/
  001_create_tables.sql
  002_add_rls_policies.sql
  003_migrate_users_from_json.sql
```

## Running Migrations

**Development (Railway development environment):**
```bash
node server/migrate.js
```

**Production (after code review):**
Railway auto-runs migrations on `production` branch deploy.

## Post-Migration Validation

After applying migrations:

1. Verify schema in Supabase dashboard
2. Check RLS policies are enforced
3. Test API endpoints work as expected
4. Monitor error logs for 1 hour after deploy
5. If issues: rollback via Railway dashboard

## Common Patterns for Socialise

### Events Table Enhancements
```sql
-- Add match analysis
ALTER TABLE events ADD COLUMN match_score INTEGER;
ALTER TABLE events ADD COLUMN match_tags TEXT[];

-- Add soft delete
ALTER TABLE events ADD COLUMN deleted_at TIMESTAMP;
```

### Communities/Tribes
```sql
-- Create communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create membership table
CREATE TABLE community_members (
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (community_id, user_id)
);
```

## Testing Migrations Locally

1. Run local Supabase:
```bash
supabase start
```

2. Apply migration:
```bash
node server/migrate.js
```

3. Inspect with CLI:
```bash
supabase db inspect
```

4. Verify with API:
```bash
curl http://localhost:3001/api/events
```

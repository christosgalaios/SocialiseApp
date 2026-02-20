-- ============================================================
-- Socialise App — Users Table
-- Migrates user persistence from flat-file users.json to Supabase.
-- id is text (not uuid) to match existing Date.now().toString() IDs
-- and the text user_id columns in all other tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                       text PRIMARY KEY,
  email                    text NOT NULL UNIQUE,
  password                 text NOT NULL,           -- bcrypt hash
  name                     text NOT NULL DEFAULT '',
  location                 text DEFAULT 'London',
  avatar                   text DEFAULT '',
  bio                      text DEFAULT '',
  interests                text[] DEFAULT '{}',
  tribe                    text DEFAULT 'Newcomers',
  is_pro                   boolean DEFAULT false,
  is_email_verified        boolean DEFAULT false,
  verification_code        text,
  verification_code_expiry bigint,                  -- ms since epoch
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Reuse the update_updated_at() function created in migration 001
CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

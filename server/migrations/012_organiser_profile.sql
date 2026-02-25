-- ============================================================
-- Socialise App — Organiser Profile
-- Adds organiser-related columns to the existing users table.
-- Allows any user to switch between attendee and organiser roles.
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'attendee';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_bio text DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_display_name text DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_categories text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_social_links jsonb DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_cover_photo text DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organiser_setup_complete boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add XP and unlocked titles columns to users table (same pattern as login_streak)
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_titles text[] DEFAULT '{}';

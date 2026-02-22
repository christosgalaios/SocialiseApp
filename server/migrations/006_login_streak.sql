-- Add login streak tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date date;

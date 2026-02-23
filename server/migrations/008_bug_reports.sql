-- ============================================================
-- Socialise App — Bug Reports Table
--
-- Replaces BUGS.md file-based storage with a persistent
-- Supabase table. Reports are submitted via POST /api/bugs
-- and processed by the /fix-bugs skill.
--
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

CREATE TABLE IF NOT EXISTS bug_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id        text NOT NULL UNIQUE,                      -- "BUG-{timestamp}" — human-readable ID
  description   text NOT NULL,                             -- Sanitized user description
  status        text NOT NULL DEFAULT 'open',              -- open | fixed | rejected | needs-triage | duplicate of {ID}
  priority      text NOT NULL DEFAULT 'auto',              -- auto | P1 - Critical | P2 - Major | P3 - Minor
  reporter_id   text NOT NULL,                             -- user ID from users table
  environment   text NOT NULL DEFAULT 'local',             -- production | development | local
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Index for querying open bugs (used by /fix-bugs skill)
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);

-- Updated-at trigger (reuses existing function from migration 001)
CREATE TRIGGER set_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
-- Same pattern as other tables: locked down for anon/authenticated,
-- all access goes through Express with service_role key.

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports FORCE ROW LEVEL SECURITY;

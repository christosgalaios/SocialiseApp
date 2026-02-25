-- ============================================================
-- Socialise App — Bug Report Fix Metadata Columns
--
-- Adds two columns to bug_reports for better triage and traceability:
--   - fix_notes: Brief description of what was fixed and which commit
--     (e.g. "Added null check in EventCard.jsx:42 — commit abc123")
--   - component: Auto-detected affected component/file area
--     (e.g. "EventDetailSheet", "CreateEventModal", "auth", "feed")
--
-- Both are nullable — older reports won't have these fields.
-- ============================================================

ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS fix_notes text;

ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS component text;

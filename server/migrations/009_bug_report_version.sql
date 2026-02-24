-- ============================================================
-- Add app_version column to bug_reports
--
-- Tracks which app version the bug was reported from.
-- Value comes from VITE_APP_VERSION (e.g. "0.1.104").
-- Nullable — older reports won't have this field.
-- ============================================================

ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS app_version text;

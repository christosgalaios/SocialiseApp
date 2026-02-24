-- ============================================================
-- Add platform column to bug_reports
--
-- Captures the user's platform info at time of bug submission:
-- OS name/version, browser name/version, and device type.
-- Example: "Android 14 / Chrome 120 / Mobile"
-- Nullable — older reports won't have this field.
-- ============================================================

ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS platform text;

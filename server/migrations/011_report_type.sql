-- ============================================================
-- Socialise App — Report Type Column
--
-- Adds a `type` column to bug_reports to distinguish between
-- bug reports and feature requests. Both use the same table,
-- routes, and Google Sheet — differentiated by this column.
--
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'bug';

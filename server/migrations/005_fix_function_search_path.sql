-- Migration 005: Fix function search_path security warning
-- Sets an immutable search_path on update_updated_at() to prevent
-- search-path injection attacks.
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

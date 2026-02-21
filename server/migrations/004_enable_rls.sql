-- ============================================================
-- Socialise App — Enable Row Level Security on all tables
--
-- WHY:  The Supabase Security Advisor flags every public table
--       that has RLS disabled. Without RLS, anyone who obtains
--       the anon key can read/write every row via PostgREST.
--
-- HOW IT WORKS:
--   • ALTER TABLE … ENABLE ROW LEVEL SECURITY  → default-deny
--     for the `anon` and `authenticated` Postgres roles.
--   • The Express backend uses the `service_role` key, which
--     has `bypassrls = true` — so all existing API routes
--     continue to work exactly as before.
--   • No permissive policies are added for `anon` because the
--     frontend never talks to Supabase directly (it goes
--     through Express). This is a total lockdown of direct
--     PostgREST access.
--
-- SENSITIVE COLUMNS:
--   • REVOKE SELECT on password, verification_code, and
--     verification_code_expiry from anon + authenticated.
--     This addresses the "Sensitive Columns Exposed" warning
--     even if permissive policies are added later.
--
-- Run in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================


-- ── 1. Enable RLS on all public tables ──────────────────────

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions     ENABLE ROW LEVEL SECURITY;


-- ── 2. Force RLS for table owners too (defense in depth) ────
--    By default, table owners bypass RLS. FORCE ensures even
--    the owning role (typically `postgres`) respects policies
--    unless using service_role (which has bypassrls=true).

ALTER TABLE public.users              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.events             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.communities        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_members  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions     FORCE ROW LEVEL SECURITY;


-- ── 3. Lock down sensitive columns on users table ───────────
--    Even if permissive SELECT policies are added later,
--    these columns remain inaccessible to anon/authenticated.

REVOKE SELECT (password)                 ON public.users FROM anon, authenticated;
REVOKE SELECT (verification_code)        ON public.users FROM anon, authenticated;
REVOKE SELECT (verification_code_expiry) ON public.users FROM anon, authenticated;


-- ── 4. Revoke direct INSERT/UPDATE/DELETE on users table ────
--    User creation and updates must go through the Express
--    backend (which validates input and hashes passwords).

REVOKE INSERT ON public.users FROM anon, authenticated;
REVOKE UPDATE ON public.users FROM anon, authenticated;
REVOKE DELETE ON public.users FROM anon, authenticated;


-- ============================================================
-- NOTES FOR FUTURE DEVELOPMENT
--
-- If you later add a Supabase client to the frontend (e.g. for
-- realtime subscriptions or direct queries), you'll need to add
-- permissive policies. Example patterns:
--
--   -- Let anyone read active events
--   CREATE POLICY "public_read_events"
--     ON public.events FOR SELECT
--     USING (status = 'active');
--
--   -- Let authenticated users read their own RSVPs
--   CREATE POLICY "own_rsvps"
--     ON public.event_rsvps FOR SELECT
--     USING (user_id = auth.uid()::text);
--
-- Until then, the Express backend with service_role handles
-- all data access, and these tables are locked down.
-- ============================================================

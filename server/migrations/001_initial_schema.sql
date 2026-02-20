-- ============================================================
-- Socialise App — Initial Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Events
CREATE TABLE IF NOT EXISTS events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text DEFAULT '',
  category      text NOT NULL DEFAULT 'Food & Drinks',
  location      text NOT NULL,
  lat           decimal(9,6),
  lng           decimal(9,6),
  date          text NOT NULL,            -- ISO date string: "2026-03-15"
  time          text NOT NULL,            -- "19:00"
  price         integer DEFAULT 0,
  max_spots     integer DEFAULT 30,
  image_url     text,
  host_id       text NOT NULL,            -- user ID from users.json
  host_name     text NOT NULL DEFAULT '',
  is_micro_meet boolean DEFAULT false,
  status        text DEFAULT 'active',    -- 'active' | 'cancelled' | 'completed'
  category_attrs  jsonb DEFAULT '{}',
  inclusivity_tags text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Event RSVPs (joined events)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id     text NOT NULL,              -- user ID from users.json
  status      text DEFAULT 'going',       -- 'going' | 'interested' | 'maybe'
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Saved / bookmarked events
CREATE TABLE IF NOT EXISTS saved_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  saved_at    timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id      text NOT NULL,
  user_name    text NOT NULL,
  user_avatar  text DEFAULT '',
  message      text NOT NULL,
  is_system    boolean DEFAULT false,
  is_host      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Communities (Tribes)
CREATE TABLE IF NOT EXISTS communities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL UNIQUE,
  description  text DEFAULT '',
  avatar       text DEFAULT '🌟',         -- emoji or image URL
  category     text DEFAULT 'General',
  is_curated   boolean DEFAULT false,
  created_by   text NOT NULL,             -- user ID
  member_count integer DEFAULT 0,         -- denormalised for quick reads
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Community membership
CREATE TABLE IF NOT EXISTS community_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  uuid REFERENCES communities(id) ON DELETE CASCADE,
  user_id       text NOT NULL,
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Community chat messages
CREATE TABLE IF NOT EXISTS community_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  uuid REFERENCES communities(id) ON DELETE CASCADE,
  user_id       text NOT NULL,
  user_name     text NOT NULL,
  user_avatar   text DEFAULT '',
  message       text NOT NULL,
  is_system     boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Feed posts
CREATE TABLE IF NOT EXISTS feed_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  user_name     text NOT NULL,
  user_avatar   text DEFAULT '',
  community_id  uuid REFERENCES communities(id) ON DELETE SET NULL,
  community_name text DEFAULT '',
  event_id      uuid REFERENCES events(id) ON DELETE SET NULL,
  content       text NOT NULL,
  image_url     text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Post reactions (emoji)
CREATE TABLE IF NOT EXISTS post_reactions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id  uuid REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id  text NOT NULL,
  emoji    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_status       ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category     ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_host_id      ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at   ON events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event   ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user    ON event_rsvps(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_events_user   ON saved_events(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_event ON chat_messages(event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user      ON community_members(user_id);

CREATE INDEX IF NOT EXISTS idx_feed_posts_user       ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_community  ON feed_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);

-- ============================================================
-- Helper function: auto-update updated_at on row change
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER feed_posts_updated_at
  BEFORE UPDATE ON feed_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

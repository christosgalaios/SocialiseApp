-- Migration 014: Organiser Reviews (vibe tags)
-- Allows users to leave vibe/review tags on organisers after attending their events

CREATE TABLE IF NOT EXISTS organiser_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organiser_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tags text[] NOT NULL DEFAULT '{}',
    comment text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organiser_id, reviewer_id)
);

-- Index for fast lookups by organiser
CREATE INDEX IF NOT EXISTS idx_organiser_reviews_organiser ON organiser_reviews(organiser_id);

-- Index for checking if a user already reviewed
CREATE INDEX IF NOT EXISTS idx_organiser_reviews_reviewer ON organiser_reviews(reviewer_id);

-- Enable RLS
ALTER TABLE organiser_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE organiser_reviews FORCE ROW LEVEL SECURITY;

-- Policies: anyone can read, authenticated users can manage their own reviews
CREATE POLICY organiser_reviews_select ON organiser_reviews FOR SELECT USING (true);
CREATE POLICY organiser_reviews_insert ON organiser_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY organiser_reviews_update ON organiser_reviews FOR UPDATE USING (true);
CREATE POLICY organiser_reviews_delete ON organiser_reviews FOR DELETE USING (true);

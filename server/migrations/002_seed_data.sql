-- ============================================================
-- Socialise App — Seed Data
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql
-- Populates tables with demo data for development/testing
-- ============================================================

-- ── Communities ──────────────────────────────────────────────

INSERT INTO communities (id, name, description, avatar, category, is_curated, created_by, member_count)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'London Tech Socials', 'Weekly meetups for tech enthusiasts. From startups to big tech, everyone''s welcome.', '🚀', 'Tech', true, 'ben-demo', 1240),
  ('c0000001-0000-0000-0000-000000000002', 'Hiking Enthusiasts', 'Exploring the UK''s best trails together. All fitness levels welcome.', '🥾', 'Outdoors', false, 'ben-demo', 890),
  ('c0000001-0000-0000-0000-000000000003', 'Board Game Night', 'Monthly game nights across London. Strategy, party games, and more!', '🎲', 'Games', true, 'ben-demo', 445),
  ('c0000001-0000-0000-0000-000000000004', 'Foodies United', 'Restaurant hopping, supper clubs, and culinary adventures.', '🍜', 'Food & Drinks', false, 'ben-demo', 2100),
  ('c0000001-0000-0000-0000-000000000005', 'Creative Collective', 'Artists, designers, and makers sharing inspiration.', '🎨', 'Creative', false, 'ben-demo', 780),
  ('c0000001-0000-0000-0000-000000000006', 'Book Club London', 'Monthly reads and lively discussions. Fiction and non-fiction.', '📚', 'Learning', false, 'ben-demo', 560),
  ('c0000001-0000-0000-0000-000000000007', 'Run Club UK', 'Weekly group runs, from 5K to marathons. All paces welcome.', '🏃', 'Active', false, 'ben-demo', 3200),
  ('c0000001-0000-0000-0000-000000000008', 'Wine & Dine', 'Tastings, vineyard trips, and pairing dinners.', '🍷', 'Nightlife', false, 'ben-demo', 920)
ON CONFLICT (name) DO NOTHING;

-- Demo user joins first 3 communities
INSERT INTO community_members (community_id, user_id)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'ben-demo'),
  ('c0000001-0000-0000-0000-000000000002', 'ben-demo'),
  ('c0000001-0000-0000-0000-000000000003', 'ben-demo')
ON CONFLICT (community_id, user_id) DO NOTHING;

-- ── Events ───────────────────────────────────────────────────

INSERT INTO events (id, title, description, category, location, date, time, price, max_spots, image_url, host_id, host_name, is_micro_meet, category_attrs, inclusivity_tags)
VALUES
  -- Regular events
  ('e0000001-0000-0000-0000-000000000001', 'Friday Social Drinks', 'Casual drinks with a friendly crowd. All welcome!', 'Food & Drinks', 'The Golden Lion, Soho', '2026-03-06', '19:00', 0, 25, 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', 'ben-demo', 'Super Socialisers', false, '{"cuisine": "Pub Classics", "dietary": ["Vegan", "Vegetarian"], "dressCode": "Casual"}', ARRAY['lgbtq', 'sober']),

  ('e0000001-0000-0000-0000-000000000002', '90s vs 00s Party Night', 'The ultimate throwback party! Dress to impress.', 'Nightlife', 'Electric Brixton', '2026-03-14', '22:00', 15, 150, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', 'ben-demo', 'The Party Crew', false, '{"dressCode": "Smart Casual", "musicGenre": "90s Pop / 00s R&B", "ageMin": "18+"}', ARRAY['lgbtq']),

  ('e0000001-0000-0000-0000-000000000003', 'Winter Countryside Hike', 'Beautiful trail through Surrey countryside. Moderate difficulty.', 'Outdoors', 'Box Hill, Surrey', '2026-03-15', '10:00', 8, 30, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80', 'ben-demo', 'Wild Walkers', false, '{"difficulty": "Moderate", "distance": "12", "elevation": "275", "terrain": "Muddy", "steepness": "Moderate"}', ARRAY['dog-friendly', 'elder-friendly']),

  ('e0000001-0000-0000-0000-000000000004', 'Board Games & Pizza', 'Come play your favourite board games with pizza on the side!', 'Games', 'Draughts, Waterloo', '2026-03-20', '19:30', 5, 20, 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80', 'ben-demo', 'Tabletop London', false, '{"gameType": "Board Games", "skillLevel": "Beginner Friendly", "gamesProvided": "Yes"}', ARRAY['lgbtq', 'elder-friendly', 'wheelchair']),

  ('e0000001-0000-0000-0000-000000000005', 'Bottomless Brunch', 'Free-flowing prosecco and delicious brunch dishes.', 'Food & Drinks', 'The Breakfast Club', '2026-03-22', '11:00', 35, 12, 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80', 'ben-demo', 'Brunch Club', false, '{"cuisine": "British Brunch", "dietary": ["Vegan", "Gluten-Free"], "dressCode": "Smart Casual"}', ARRAY['women-only']),

  ('e0000001-0000-0000-0000-000000000006', 'Live Jazz Night', 'An evening of world-class jazz and blues.', 'Entertainment', 'Ronnie Scott''s', '2026-03-23', '20:00', 25, 40, 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80', 'ben-demo', 'Jazz Lovers', false, '{"genre": "Jazz / Blues", "duration": "3", "dressCode": "Smart Casual"}', ARRAY['elder-friendly', 'wheelchair']),

  -- Micro-meets
  ('e0000001-0000-0000-0000-000000000101', 'Dinner for 6', 'AI-curated dinner with like-minded people. Tech & Travel themed.', 'Food & Drinks', 'Dishoom, Covent Garden', '2026-03-08', '19:30', 0, 6, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 'ben-demo', 'Socialise AI', true, '{}', ARRAY[]::text[]),

  ('e0000001-0000-0000-0000-000000000102', 'Hike for 4', 'Small group hike for nature lovers. Easy pace, great company.', 'Outdoors', 'Hampstead Heath', '2026-03-09', '09:00', 0, 4, 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80', 'ben-demo', 'Socialise AI', true, '{}', ARRAY[]::text[]),

  ('e0000001-0000-0000-0000-000000000103', 'Coffee Chat', 'Startup founders meetup over great coffee.', 'Food & Drinks', 'Monmouth Coffee', '2026-03-06', '11:00', 0, 4, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', 'ben-demo', 'Socialise AI', true, '{}', ARRAY[]::text[])
ON CONFLICT DO NOTHING;

-- Some RSVPs to make events feel alive
INSERT INTO event_rsvps (event_id, user_id, status)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'ben-demo', 'going')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- ── Chat Messages ────────────────────────────────────────────

-- Event 1: Friday Social Drinks
INSERT INTO chat_messages (event_id, user_id, user_name, user_avatar, message, is_host)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'user-sarah', 'Sarah K.', 'https://i.pravatar.cc/150?u=sarah', 'Can''t wait for Friday! Who''s bringing the good vibes? 🎉', false),
  ('e0000001-0000-0000-0000-000000000001', 'user-james', 'James M.', 'https://i.pravatar.cc/150?u=james', 'Just RSVPd! First time joining, any tips?', false),
  ('e0000001-0000-0000-0000-000000000001', 'ben-demo', 'Ben', 'https://i.pravatar.cc/150?u=host', 'Welcome James! Just bring yourself and an open mind 😊', true);

-- ── Community Chat Messages ──────────────────────────────────

INSERT INTO community_messages (community_id, user_id, user_name, user_avatar, message)
VALUES
  -- London Tech Socials
  ('c0000001-0000-0000-0000-000000000001', 'user-marcus', 'Marcus V.', 'https://i.pravatar.cc/150?u=marcus', 'Great session yesterday on AI Agents! Anyone caught the recording?'),
  ('c0000001-0000-0000-0000-000000000001', 'user-sarah', 'Sarah K.', 'https://i.pravatar.cc/150?u=sarah', 'Yes! Will share the link in a sec'),
  ('c0000001-0000-0000-0000-000000000001', 'user-james', 'James M.', 'https://i.pravatar.cc/150?u=james', 'Anyone up for pub quiz tonight?'),
  -- Hiking Enthusiasts
  ('c0000001-0000-0000-0000-000000000002', 'user-elena', 'Elena P.', 'https://i.pravatar.cc/150?u=elena', 'Photos from last week''s hike! ⛰️'),
  ('c0000001-0000-0000-0000-000000000002', 'user-alex', 'Alex', 'https://i.pravatar.cc/150?u=alex', 'Stunning! Where was this?'),
  -- Board Game Night
  ('c0000001-0000-0000-0000-000000000003', 'user-tom', 'Tom H.', 'https://i.pravatar.cc/150?u=tom', 'Who''s coming to the Wingspan tournament next week? Still have 2 spots!'),
  ('c0000001-0000-0000-0000-000000000003', 'ben-demo', 'Ben', 'https://i.pravatar.cc/150?u=host', 'New games arriving Thursday');

-- ── Feed Posts ────────────────────────────────────────────────

INSERT INTO feed_posts (id, user_id, user_name, user_avatar, community_id, community_name, content, image_url)
VALUES
  ('f0000001-0000-0000-0000-000000000001', 'user-marcus', 'Marcus V.', 'https://i.pravatar.cc/150?u=marcus', 'c0000001-0000-0000-0000-000000000001', 'London Tech Socials', 'Great session yesterday on AI Agents! Anyone caught the recording?', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'),
  ('f0000001-0000-0000-0000-000000000002', 'user-elena', 'Elena P.', 'https://i.pravatar.cc/150?u=elena', 'c0000001-0000-0000-0000-000000000002', 'Hiking Enthusiasts', 'View from the summit today! ⛰️', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'),
  ('f0000001-0000-0000-0000-000000000003', 'user-tom', 'Tom H.', 'https://i.pravatar.cc/150?u=tom', 'c0000001-0000-0000-0000-000000000003', 'Board Game Night', 'Who''s coming to the Wingspan tournament next week? Still have 2 spots!', null),
  ('f0000001-0000-0000-0000-000000000004', 'user-sarah', 'Sarah K.', 'https://i.pravatar.cc/150?u=sarah', 'c0000001-0000-0000-0000-000000000001', 'London Tech Socials', 'Just landed a new role thanks to connections made here! 🎉 This community is amazing.', null);

-- Some reactions on feed posts
INSERT INTO post_reactions (post_id, user_id, emoji)
VALUES
  ('f0000001-0000-0000-0000-000000000001', 'ben-demo', '🔥'),
  ('f0000001-0000-0000-0000-000000000001', 'user-sarah', '👏'),
  ('f0000001-0000-0000-0000-000000000002', 'ben-demo', '❤️'),
  ('f0000001-0000-0000-0000-000000000002', 'user-marcus', '🔥'),
  ('f0000001-0000-0000-0000-000000000002', 'user-tom', '😍'),
  ('f0000001-0000-0000-0000-000000000003', 'ben-demo', '🎲'),
  ('f0000001-0000-0000-0000-000000000004', 'user-marcus', '🎉'),
  ('f0000001-0000-0000-0000-000000000004', 'user-james', '❤️'),
  ('f0000001-0000-0000-0000-000000000004', 'user-elena', '👏'),
  ('f0000001-0000-0000-0000-000000000004', 'ben-demo', '🎉')
ON CONFLICT (post_id, user_id, emoji) DO NOTHING;

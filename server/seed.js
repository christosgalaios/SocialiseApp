/**
 * Socialise App — Seed Script
 *
 * Inserts initial communities and events into Supabase.
 * Safe to re-run: uses upsert / ignores existing rows.
 *
 * Usage (from the server/ directory):
 *   node seed.js
 *
 * Requires server/.env to be set up with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const supabase = require('./supabase');

// Stable ID so the seed user can be host of seeded events
const SEED_HOST_ID = 'seed-admin-001';
const SEED_HOST_NAME = 'Socialise Team';

// ── Communities ──────────────────────────────────────────────────────────────

const SEED_COMMUNITIES = [
    {
        name: 'London Tech Socials',
        description: 'Weekly meetups for tech enthusiasts. From startups to big tech, everyone welcome.',
        avatar: '🚀',
        category: 'Tech',
        is_curated: true,
        created_by: SEED_HOST_ID,
        member_count: 1240,
    },
    {
        name: 'Hiking Enthusiasts',
        description: "Exploring the UK's best trails together. All fitness levels welcome.",
        avatar: '🥾',
        category: 'Outdoors',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 890,
    },
    {
        name: 'Board Game Night',
        description: 'Monthly game nights across London. Strategy, party games, and more!',
        avatar: '🎲',
        category: 'Games',
        is_curated: true,
        created_by: SEED_HOST_ID,
        member_count: 445,
    },
    {
        name: 'Foodies United',
        description: 'Restaurant hopping, supper clubs, and culinary adventures.',
        avatar: '🍜',
        category: 'Food & Drinks',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 2100,
    },
    {
        name: 'Creative Collective',
        description: 'Artists, designers, and makers sharing inspiration.',
        avatar: '🎨',
        category: 'Creative',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 780,
    },
    {
        name: 'Book Club London',
        description: 'Monthly reads and lively discussions. Fiction and non-fiction.',
        avatar: '📚',
        category: 'Learning',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 560,
    },
    {
        name: 'Run Club UK',
        description: 'Weekly group runs, from 5K to marathons. All paces welcome.',
        avatar: '🏃',
        category: 'Active',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 3200,
    },
    {
        name: 'Wine & Dine',
        description: 'Tastings, vineyard trips, and pairing dinners.',
        avatar: '🍷',
        category: 'Nightlife',
        is_curated: false,
        created_by: SEED_HOST_ID,
        member_count: 920,
    },
];

// ── Events ────────────────────────────────────────────────────────────────────

const SEED_EVENTS = [
    {
        title: 'Friday Social Drinks',
        description: 'Kick off the weekend with good company and great drinks. Everyone is welcome — no pressure, just vibes.',
        category: 'Food & Drinks',
        location: 'The Golden Lion, Soho, London',
        date: '2026-03-06',
        time: '19:00',
        price: 0,
        max_spots: 25,
        image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'Super Socialisers',
        inclusivity_tags: ['lgbtq', 'sober'],
        category_attrs: { cuisine: 'Pub Classics', dietary: ['Vegan', 'Vegetarian'], dressCode: 'Casual' },
    },
    {
        title: '90s vs 00s Party Night',
        description: 'Your favourite throwback anthems in one epic night. Dress to impress.',
        category: 'Nightlife',
        location: 'Electric Brixton, London',
        date: '2026-03-14',
        time: '22:00',
        price: 15,
        max_spots: 150,
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'The Party Crew',
        inclusivity_tags: ['lgbtq'],
        category_attrs: { dressCode: 'Smart Casual', musicGenre: '90s Pop / 00s R&B', ageMin: '18+' },
    },
    {
        title: 'Spring Countryside Hike',
        description: 'A beautiful moderate hike through the Surrey hills. Dogs very welcome!',
        category: 'Outdoors',
        location: 'Box Hill, Surrey',
        date: '2026-03-21',
        time: '10:00',
        price: 8,
        max_spots: 30,
        image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'Wild Walkers',
        inclusivity_tags: ['dog-friendly', 'elder-friendly'],
        category_attrs: { difficulty: 'Moderate', distance: '12', elevation: '275', terrain: 'Mixed', steepness: 'Gentle' },
    },
    {
        title: 'Board Games & Pizza',
        description: 'An evening of strategy, fun, and great food. Beginners totally welcome.',
        category: 'Games',
        location: 'Draughts, Waterloo, London',
        date: '2026-03-27',
        time: '19:30',
        price: 5,
        max_spots: 20,
        image_url: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'Tabletop London',
        inclusivity_tags: ['lgbtq', 'elder-friendly', 'wheelchair'],
        category_attrs: { gameType: 'Board Games', skillLevel: 'Beginner Friendly', gamesProvided: 'Yes' },
    },
    {
        title: 'Bottomless Brunch',
        description: 'Two hours of bottomless drinks and stunning food in a great atmosphere.',
        category: 'Food & Drinks',
        location: 'The Breakfast Club, Soho, London',
        date: '2026-04-05',
        time: '11:00',
        price: 35,
        max_spots: 12,
        image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'Brunch Club',
        inclusivity_tags: ['women-only'],
        category_attrs: { cuisine: 'British Brunch', dietary: ['Vegan', 'Gluten-Free'], dressCode: 'Smart Casual' },
    },
    {
        title: 'Live Jazz Night',
        description: "An intimate evening at one of London's most iconic jazz venues. Come early for the best seats.",
        category: 'Entertainment',
        location: "Ronnie Scott's, Soho, London",
        date: '2026-04-11',
        time: '20:00',
        price: 25,
        max_spots: 40,
        image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
        host_id: SEED_HOST_ID,
        host_name: 'Jazz Lovers',
        inclusivity_tags: ['elder-friendly', 'wheelchair'],
        category_attrs: { genre: 'Jazz / Blues', duration: '3', dressCode: 'Smart Casual' },
    },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
    console.log('🌱 Starting seed...\n');

    // --- Communities ---
    console.log('Seeding communities...');
    const { data: communities, error: communityError } = await supabase
        .from('communities')
        .upsert(SEED_COMMUNITIES, { onConflict: 'name', ignoreDuplicates: false })
        .select();

    if (communityError) {
        console.error('  ✗ Communities error:', communityError.message);
    } else {
        console.log(`  ✓ ${communities.length} communities seeded`);
    }

    // --- Events ---
    console.log('Seeding events...');
    const { data: events, error: eventError } = await supabase
        .from('events')
        .upsert(SEED_EVENTS, { onConflict: 'title', ignoreDuplicates: true })
        .select();

    if (eventError) {
        console.error('  ✗ Events error:', eventError.message);
    } else {
        console.log(`  ✓ ${events.length} events seeded`);
    }

    console.log('\n✅ Seed complete.');
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});

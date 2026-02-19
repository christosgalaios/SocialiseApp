const express = require('express');
const supabase = require('../supabase');
const { authenticateToken, loadUserProfile, extractUserId, readUsers } = require('./auth');
const { enrichEventsWithMatches } = require('../matching');

const router = express.Router();

// --- Helpers ---

// Attach attendee count + isJoined + isSaved + match scores to each event row
async function enrichEvents(events, userId) {
    if (!events.length) return events;

    const eventIds = events.map(e => e.id);

    // Attendee counts
    const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .in('event_id', eventIds);

    // User's joined events
    const { data: userRsvps } = userId
        ? await supabase.from('event_rsvps').select('event_id').in('event_id', eventIds).eq('user_id', userId)
        : { data: [] };

    // User's saved events
    const { data: userSaved } = userId
        ? await supabase.from('saved_events').select('event_id').in('event_id', eventIds).eq('user_id', userId)
        : { data: [] };

    const countMap = {};
    (rsvps || []).forEach(r => { countMap[r.event_id] = (countMap[r.event_id] || 0) + 1; });

    const joinedSet = new Set((userRsvps || []).map(r => r.event_id));
    const savedSet = new Set((userSaved || []).map(r => r.event_id));

    // Get user profile for matching micro-meets
    let userProfile = null;
    if (userId) {
        const users = readUsers();
        userProfile = users.find(u => u.id === userId);
    }

    // Enrich events with matching scores if applicable
    let enrichedEvents = events.map(e => ({
        ...e,
        attendees: countMap[e.id] || 0,
        spots: e.max_spots,
        image: e.image_url,
        host: e.host_name,
        isJoined: joinedSet.has(e.id),
        isSaved: savedSet.has(e.id),
    }));

    if (userProfile) {
        enrichedEvents = enrichEventsWithMatches(enrichedEvents, userProfile);
    }

    return enrichedEvents;
}

// --- GET /api/events ---
router.get('/', async (req, res) => {
    const { category, search, size, limit = 20, offset = 0 } = req.query;
    const userId = extractUserId(req.headers['authorization']);

    let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }
    if (search) {
        query = query.ilike('title', `%${search}%`);
    }
    if (size === 'micro') {
        query = query.eq('is_micro_meet', true);
    } else if (size === 'large') {
        query = query.eq('is_micro_meet', false);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[events GET]', error);
        return res.status(500).json({ message: 'Failed to fetch events' });
    }

    const enriched = await enrichEvents(data || [], userId);
    res.json(enriched);
});

// --- GET /api/events/:id ---
router.get('/:id', async (req, res) => {
    const userId = extractUserId(req.headers['authorization']);

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !data) return res.status(404).json({ message: 'Event not found' });

    const [enriched] = await enrichEvents([data], userId);
    res.json(enriched);
});

// --- POST /api/events --- (create)
router.post('/', authenticateToken, loadUserProfile, async (req, res) => {
    const { title, description, category, location, lat, lng, date, time, price, max_spots, image, category_attrs, inclusivity_tags, is_micro_meet } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!location?.trim()) return res.status(400).json({ message: 'Location is required' });
    if (!date) return res.status(400).json({ message: 'Date is required' });
    if (!time) return res.status(400).json({ message: 'Time is required' });

    const { data, error } = await supabase
        .from('events')
        .insert({
            title: title.trim(),
            description: description?.trim() || '',
            category: category || 'Food & Drinks',
            location: location.trim(),
            lat: lat || null,
            lng: lng || null,
            date,
            time,
            price: Number(price) || 0,
            max_spots: Number(max_spots) || 30,
            image_url: image || null,
            host_id: req.user.id,
            host_name: req.userProfile.name,
            is_micro_meet: Boolean(is_micro_meet),
            category_attrs: category_attrs || {},
            inclusivity_tags: inclusivity_tags || [],
        })
        .select()
        .single();

    if (error) {
        console.error('[events POST]', error);
        return res.status(500).json({ message: 'Failed to create event' });
    }

    res.status(201).json({ ...data, attendees: 0, spots: data.max_spots, image: data.image_url, host: data.host_name, isJoined: false, isSaved: false });
});

// --- PUT /api/events/:id --- (update — host only)
router.put('/:id', authenticateToken, async (req, res) => {
    const { data: existing } = await supabase.from('events').select('host_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ message: 'Event not found' });
    if (existing.host_id !== req.user.id) return res.status(403).json({ message: 'Not authorised' });

    const allowed = ['title', 'description', 'category', 'location', 'lat', 'lng', 'date', 'time', 'price', 'max_spots', 'image_url', 'category_attrs', 'inclusivity_tags'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const { data, error } = await supabase.from('events').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ message: 'Failed to update event' });
    res.json(data);
});

// --- DELETE /api/events/:id --- (cancel — host only)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { data: existing } = await supabase.from('events').select('host_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ message: 'Event not found' });
    if (existing.host_id !== req.user.id) return res.status(403).json({ message: 'Not authorised' });

    const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', req.params.id);
    if (error) return res.status(500).json({ message: 'Failed to cancel event' });
    res.json({ message: 'Event cancelled' });
});

// --- POST /api/events/:id/join --- (RSVP — payment bypassed for now)
router.post('/:id/join', authenticateToken, async (req, res) => {
    const { data: event } = await supabase.from('events').select('id, max_spots, status').eq('id', req.params.id).single();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'active') return res.status(400).json({ message: 'Event is no longer active' });

    // Check capacity
    const { count } = await supabase.from('event_rsvps').select('*', { count: 'exact', head: true }).eq('event_id', req.params.id);
    if (count >= event.max_spots) return res.status(400).json({ message: 'Event is full' });

    const { error } = await supabase.from('event_rsvps').upsert({ event_id: req.params.id, user_id: req.user.id, status: 'going' }, { onConflict: 'event_id,user_id' });
    if (error) return res.status(500).json({ message: 'Failed to join event' });
    res.json({ message: 'Joined event' });
});

// --- POST /api/events/:id/leave ---
router.post('/:id/leave', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('event_rsvps').delete().eq('event_id', req.params.id).eq('user_id', req.user.id);
    if (error) return res.status(500).json({ message: 'Failed to leave event' });
    res.json({ message: 'Left event' });
});

// --- POST /api/events/:id/save ---
router.post('/:id/save', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('saved_events').upsert({ event_id: req.params.id, user_id: req.user.id }, { onConflict: 'event_id,user_id' });
    if (error) return res.status(500).json({ message: 'Failed to save event' });
    res.json({ message: 'Event saved' });
});

// --- POST /api/events/:id/unsave ---
router.post('/:id/unsave', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('saved_events').delete().eq('event_id', req.params.id).eq('user_id', req.user.id);
    if (error) return res.status(500).json({ message: 'Failed to unsave event' });
    res.json({ message: 'Event unsaved' });
});

// --- GET /api/events/:id/chat ---
router.get('/:id/chat', async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', req.params.id)
        .order('created_at', { ascending: true })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({ message: 'Failed to fetch messages' });
    res.json(data || []);
});

// --- POST /api/events/:id/chat ---
router.post('/:id/chat', authenticateToken, loadUserProfile, async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const { data: event } = await supabase.from('events').select('host_id').eq('id', req.params.id).single();
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            event_id: req.params.id,
            user_id: req.user.id,
            user_name: req.userProfile.name,
            user_avatar: req.userProfile.avatar || '',
            message: message.trim(),
            is_host: event.host_id === req.user.id,
        })
        .select()
        .single();

    if (error) return res.status(500).json({ message: 'Failed to send message' });
    res.status(201).json(data);
});

module.exports = router;

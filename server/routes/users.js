const express = require('express');
const sharp = require('sharp');
const supabase = require('../supabase');
const { authenticateToken, toPublicUser } = require('./auth');

const router = express.Router();

// Avatar size/quality constants for server-side downscaling
const AVATAR_SIZE = 128;       // px — square output
const AVATAR_QUALITY = 70;     // JPEG quality (0-100)
const AVATAR_MAX_BYTES = 100000; // reject data URLs larger than ~100KB before processing

/**
 * Downscale a base64 data-URL avatar to AVATAR_SIZE×AVATAR_SIZE JPEG.
 * Returns a smaller data URL string, or null if the input is not a data URL.
 */
async function processAvatar(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;

    // Extract raw base64 payload
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) return null;

    const inputBuffer = Buffer.from(base64Data, 'base64');
    if (inputBuffer.length > AVATAR_MAX_BYTES * 1.5) {
        throw new Error('Avatar image too large');
    }

    const outputBuffer = await sharp(inputBuffer)
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
        .jpeg({ quality: AVATAR_QUALITY })
        .toBuffer();

    return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
}

// --- PUT /api/users/me --- (update own profile)
router.put('/me', authenticateToken, async (req, res) => {
    const allowed = ['name', 'bio', 'location', 'avatar', 'interests'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Validate
    if (updates.name !== undefined && (!updates.name?.trim() || updates.name.trim().length > 100)) {
        return res.status(400).json({ message: 'Invalid name' });
    }
    if (updates.bio !== undefined && updates.bio.length > 300) {
        return res.status(400).json({ message: 'Bio too long (max 300 characters)' });
    }
    if (updates.interests !== undefined && !Array.isArray(updates.interests)) {
        return res.status(400).json({ message: 'Interests must be an array' });
    }

    // Server-side avatar downscaling — shrink data-URL images before storing
    if (updates.avatar && updates.avatar.startsWith('data:image/')) {
        try {
            updates.avatar = await processAvatar(updates.avatar);
        } catch {
            return res.status(400).json({ message: 'Failed to process avatar image' });
        }
    }

    const { data: updated, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

    if (!updated) return res.status(404).json({ message: 'User not found' });
    if (error) return res.status(500).json({ message: 'Failed to update profile' });

    res.json(toPublicUser(updated));
});

// --- GET /api/users/me/events --- (hosted + attending)
router.get('/me/events', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    // Events the user is attending
    const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', userId);

    const attendingIds = (rsvps || []).map(r => r.event_id);

    // Events the user hosts
    const { data: hosted } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    // Events user is attending (that they don't host)
    let attending = [];
    if (attendingIds.length) {
        const { data } = await supabase
            .from('events')
            .select('*')
            .in('id', attendingIds)
            .neq('host_id', userId)
            .eq('status', 'active')
            .order('date', { ascending: true });
        attending = data || [];
    }

    res.json({
        hosting: (hosted || []).map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, isJoined: true })),
        attending: attending.map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, isJoined: true })),
    });
});

// --- GET /api/users/me/saved ---
router.get('/me/saved', authenticateToken, async (req, res) => {
    const { data: saved } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', req.user.id);

    const savedIds = (saved || []).map(s => s.event_id);
    if (!savedIds.length) return res.json([]);

    const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('id', savedIds)
        .eq('status', 'active');

    res.json((events || []).map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, isSaved: true })));
});

// --- GET /api/users/me/communities ---
router.get('/me/communities', authenticateToken, async (req, res) => {
    const { data: memberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', req.user.id);

    const communityIds = (memberships || []).map(m => m.community_id);
    if (!communityIds.length) return res.json([]);

    const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .in('id', communityIds);

    res.json((communities || []).map(c => ({ ...c, isJoined: true, members: c.member_count })));
});

// --- DELETE /api/users/me --- (delete own account and all associated data)
router.delete('/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    // Delete all user data from related tables first, then the user record
    const tables = [
        { table: 'post_reactions', column: 'user_id' },
        { table: 'feed_posts', column: 'user_id' },
        { table: 'community_messages', column: 'user_id' },
        { table: 'community_members', column: 'user_id' },
        { table: 'chat_messages', column: 'user_id' },
        { table: 'saved_events', column: 'user_id' },
        { table: 'event_rsvps', column: 'user_id' },
    ];

    for (const { table, column } of tables) {
        const { error } = await supabase.from(table).delete().eq(column, userId);
        if (error) {
            console.error(`[ERROR] Failed to delete from ${table}:`, error.message);
            return res.status(500).json({ message: 'Failed to delete account. Please try again.' });
        }
    }

    // Delete events hosted by this user
    const { error: eventsError } = await supabase.from('events').delete().eq('host_id', userId);
    if (eventsError) {
        console.error('[ERROR] Failed to delete hosted events:', eventsError.message);
        return res.status(500).json({ message: 'Failed to delete account. Please try again.' });
    }

    // Finally delete the user record
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    if (userError) {
        console.error('[ERROR] Failed to delete user:', userError.message);
        return res.status(500).json({ message: 'Failed to delete account. Please try again.' });
    }

    res.json({ message: 'Account deleted successfully' });
});

module.exports = router;

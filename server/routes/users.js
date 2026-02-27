const express = require('express');
const sharp = require('sharp');
const supabase = require('../supabase');
const { authenticateToken, toPublicUser } = require('./auth');
const {
    USER_NOT_FOUND, USER_UPDATE_FAILED, USER_XP_UPDATE_FAILED,
    USER_DELETE_FAILED, USER_AVATAR_FAILED, USER_INVALID_INPUT,
    USER_ROLE_UPDATE_FAILED, USER_STATS_FAILED,
} = require('../errors');

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
    // Organiser fields use camelCase in request body, snake_case in DB
    const organiserFieldMap = {
        organiserBio: 'organiser_bio',
        organiserDisplayName: 'organiser_display_name',
        organiserCategories: 'organiser_categories',
        organiserSocialLinks: 'organiser_social_links',
        organiserCoverPhoto: 'organiser_cover_photo',
        organiserSetupComplete: 'organiser_setup_complete',
    };
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    Object.entries(organiserFieldMap).forEach(([camel, snake]) => {
        if (req.body[camel] !== undefined) updates[snake] = req.body[camel];
    });

    // Validate
    if (updates.name !== undefined && (!updates.name?.trim() || updates.name.trim().length > 100)) {
        return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Invalid name' });
    }
    if (updates.bio !== undefined && updates.bio.length > 300) {
        return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Bio too long (max 300 characters)' });
    }
    if (updates.interests !== undefined && !Array.isArray(updates.interests)) {
        return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Interests must be an array' });
    }

    // Server-side avatar downscaling — shrink data-URL images before storing
    if (updates.avatar && updates.avatar.startsWith('data:image/')) {
        try {
            updates.avatar = await processAvatar(updates.avatar);
        } catch {
            return res.status(400).json({ code: USER_AVATAR_FAILED, message: 'Failed to process avatar image' });
        }
    }

    const { data: updated, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

    if (!updated) return res.status(404).json({ code: USER_NOT_FOUND, message: 'User not found' });
    if (error) return res.status(500).json({ code: USER_UPDATE_FAILED, message: 'Failed to update profile: database update rejected' });

    res.json(toPublicUser(updated));
});

// --- PUT /api/users/me/xp --- (update XP and unlocked titles)
router.put('/me/xp', authenticateToken, async (req, res) => {
    const { xp, unlockedTitles } = req.body;

    const updates = {};
    if (xp != null) {
        if (typeof xp !== 'number' || xp < 0 || !Number.isInteger(xp)) {
            return res.status(400).json({ code: USER_INVALID_INPUT, message: 'XP must be a non-negative integer' });
        }
        updates.xp = xp;
    }
    if (unlockedTitles != null) {
        if (!Array.isArray(unlockedTitles) || !unlockedTitles.every(t => typeof t === 'string')) {
            return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Unlocked titles must be an array of strings' });
        }
        updates.unlocked_titles = unlockedTitles;
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Nothing to update' });
    }

    const { data: updated, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

    if (!updated) return res.status(404).json({ code: USER_NOT_FOUND, message: 'User not found' });
    if (error) return res.status(500).json({ code: USER_XP_UPDATE_FAILED, message: 'Failed to update XP: database update rejected' });

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

    // Fetch host avatars for attending events
    const attendingHostIds = [...new Set(attending.map(e => e.host_id).filter(Boolean))];
    const hostAvatarMap = {};
    if (attendingHostIds.length) {
        const { data: hosts } = await supabase
            .from('users')
            .select('id, avatar')
            .in('id', attendingHostIds);
        (hosts || []).forEach(h => { hostAvatarMap[h.id] = h.avatar; });
    }

    // Get the current user's avatar for hosted events
    const { data: currentUser } = await supabase
        .from('users')
        .select('avatar')
        .eq('id', userId)
        .single();
    const myAvatar = currentUser?.avatar || '';

    res.json({
        hosting: (hosted || []).map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, hostAvatar: myAvatar, isJoined: true })),
        attending: attending.map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, hostAvatar: hostAvatarMap[e.host_id] || '', isJoined: true })),
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

    // Fetch host avatars
    const savedHostIds = [...new Set((events || []).map(e => e.host_id).filter(Boolean))];
    const savedHostAvatarMap = {};
    if (savedHostIds.length) {
        const { data: hosts } = await supabase
            .from('users')
            .select('id, avatar')
            .in('id', savedHostIds);
        (hosts || []).forEach(h => { savedHostAvatarMap[h.id] = h.avatar; });
    }

    res.json((events || []).map(e => ({ ...e, spots: e.max_spots, image: e.image_url, host: e.host_name, hostAvatar: savedHostAvatarMap[e.host_id] || '', isSaved: true })));
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

// --- PUT /api/users/me/role --- (switch between attendee and organiser)
router.put('/me/role', authenticateToken, async (req, res) => {
    const { role } = req.body;
    if (!role || !['attendee', 'organiser'].includes(role)) {
        return res.status(400).json({ code: USER_INVALID_INPUT, message: 'Role must be "attendee" or "organiser"' });
    }

    const { data: updated, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', req.user.id)
        .select()
        .single();

    if (!updated) return res.status(404).json({ code: USER_NOT_FOUND, message: 'User not found' });
    if (error) return res.status(500).json({ code: USER_ROLE_UPDATE_FAILED, message: 'Failed to update role' });

    res.json(toPublicUser(updated));
});

// --- GET /api/users/me/organiser-stats --- (dashboard analytics)
router.get('/me/organiser-stats', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Events hosted by this user
        const { data: hosted } = await supabase
            .from('events')
            .select('id, title, date, time, max_spots, image_url, host_name, category, status, created_at')
            .eq('host_id', userId)
            .order('created_at', { ascending: false });

        const hostedEvents = hosted || [];
        const activeEvents = hostedEvents.filter(e => e.status === 'active');
        const eventIds = hostedEvents.map(e => e.id);

        // Total RSVPs across all hosted events
        let totalAttendees = 0;
        let rsvpsByEvent = {};
        if (eventIds.length) {
            const { data: rsvps } = await supabase
                .from('event_rsvps')
                .select('event_id')
                .in('event_id', eventIds);

            (rsvps || []).forEach(r => {
                rsvpsByEvent[r.event_id] = (rsvpsByEvent[r.event_id] || 0) + 1;
                totalAttendees++;
            });
        }

        // Communities created by this user
        const { data: communities } = await supabase
            .from('communities')
            .select('id, name, member_count, avatar, category, created_at')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        const ownedCommunities = communities || [];
        const totalCommunityMembers = ownedCommunities.reduce((sum, c) => sum + (c.member_count || 0), 0);

        // Get the organiser's avatar for hostAvatar field
        const { data: organiserUser } = await supabase
            .from('users')
            .select('avatar')
            .eq('id', userId)
            .single();
        const organiserAvatar = organiserUser?.avatar || '';

        // Enrich events with attendee count
        const enrichedEvents = activeEvents.map(e => ({
            ...e,
            spots: e.max_spots,
            image: e.image_url,
            host: e.host_name,
            hostAvatar: organiserAvatar,
            attendees: rsvpsByEvent[e.id] || 0,
        }));

        res.json({
            stats: {
                eventsHosted: hostedEvents.length,
                activeEvents: activeEvents.length,
                totalAttendees,
                communitiesCreated: ownedCommunities.length,
                totalCommunityMembers,
            },
            events: enrichedEvents,
            communities: ownedCommunities.map(c => ({ ...c, members: c.member_count })),
        });
    } catch (err) {
        console.error('[ERROR] Failed to fetch organiser stats:', err.message);
        res.status(500).json({ code: USER_STATS_FAILED, message: 'Failed to fetch organiser stats' });
    }
});

// --- GET /api/users/:id/organiser-profile --- (public organiser profile)
router.get('/:id/organiser-profile', async (req, res) => {
    const { id } = req.params;

    const { data: user } = await supabase
        .from('users')
        .select('id, name, avatar, bio, role, organiser_bio, organiser_display_name, organiser_categories, organiser_social_links, organiser_cover_photo, organiser_verified, organiser_setup_complete')
        .eq('id', id)
        .single();

    if (!user) return res.status(404).json({ code: USER_NOT_FOUND, message: 'User not found' });

    // Get their hosted events
    const { data: events } = await supabase
        .from('events')
        .select('id, title, date, time, max_spots, image_url, host_name, category, status')
        .eq('host_id', id)
        .eq('status', 'active')
        .order('date', { ascending: true });

    // Get attendee counts for these events
    const eventIds = (events || []).map(e => e.id);
    let rsvpsByEvent = {};
    if (eventIds.length) {
        const { data: rsvps } = await supabase
            .from('event_rsvps')
            .select('event_id')
            .in('event_id', eventIds);
        (rsvps || []).forEach(r => {
            rsvpsByEvent[r.event_id] = (rsvpsByEvent[r.event_id] || 0) + 1;
        });
    }

    // Get their communities
    const { data: communities } = await supabase
        .from('communities')
        .select('id, name, member_count, avatar, category')
        .eq('created_by', id);

    res.json({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role ?? 'attendee',
        organiserBio: user.organiser_bio ?? '',
        organiserDisplayName: user.organiser_display_name ?? '',
        organiserCategories: user.organiser_categories ?? [],
        organiserSocialLinks: user.organiser_social_links ?? {},
        organiserCoverPhoto: user.organiser_cover_photo ?? '',
        organiserVerified: user.organiser_verified ?? false,
        organiserSetupComplete: user.organiser_setup_complete ?? false,
        events: (events || []).map(e => ({
            ...e,
            spots: e.max_spots,
            image: e.image_url,
            host: e.host_name,
            hostAvatar: user.avatar || '',
            attendees: rsvpsByEvent[e.id] || 0,
        })),
        communities: (communities || []).map(c => ({ ...c, members: c.member_count })),
    });
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
            return res.status(500).json({ code: USER_DELETE_FAILED, message: `Failed to delete account: could not clear ${table}` });
        }
    }

    // Delete events hosted by this user
    const { error: eventsError } = await supabase.from('events').delete().eq('host_id', userId);
    if (eventsError) {
        console.error('[ERROR] Failed to delete hosted events:', eventsError.message);
        return res.status(500).json({ code: USER_DELETE_FAILED, message: 'Failed to delete account: could not remove hosted events' });
    }

    // Finally delete the user record
    const { error: userError } = await supabase.from('users').delete().eq('id', userId);
    if (userError) {
        console.error('[ERROR] Failed to delete user:', userError.message);
        return res.status(500).json({ code: USER_DELETE_FAILED, message: 'Failed to delete account: could not remove user record' });
    }

    res.json({ message: 'Account deleted successfully' });
});

module.exports = router;

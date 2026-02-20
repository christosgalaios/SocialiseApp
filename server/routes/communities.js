const express = require('express');
const supabase = require('../supabase');
const { authenticateToken, loadUserProfile } = require('./auth');

const router = express.Router();

// --- GET /api/communities ---
router.get('/', async (req, res) => {
    const { category, search, limit = 30, offset = 0 } = req.query;
    const userId = req.headers['authorization']
        ? (() => { try { const jwt = require('jsonwebtoken'); const t = req.headers['authorization'].split(' ')[1]; return jwt.verify(t, process.env.JWT_SECRET || 'socialise_secret_key_123_change_in_production').id; } catch { return null; } })()
        : null;

    let query = supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data: communities, error } = await query;
    if (error) {
        console.error('[communities GET]', error);
        return res.status(500).json({ message: 'Failed to fetch communities' });
    }

    // Enrich with isJoined for the requesting user
    if (userId && communities?.length) {
        const ids = communities.map(c => c.id);
        const { data: memberships } = await supabase
            .from('community_members')
            .select('community_id')
            .in('community_id', ids)
            .eq('user_id', userId);
        const joinedSet = new Set((memberships || []).map(m => m.community_id));
        return res.json(communities.map(c => ({ ...c, isJoined: joinedSet.has(c.id), members: c.member_count })));
    }

    res.json((communities || []).map(c => ({ ...c, isJoined: false, members: c.member_count })));
});

// --- GET /api/communities/:id ---
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase.from('communities').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ message: 'Community not found' });

    // Get recent member avatars (first 4)
    const { data: members } = await supabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', req.params.id)
        .limit(4);

    res.json({
        ...data,
        members: data.member_count,
        memberAvatars: (members || []).map(m => `https://i.pravatar.cc/150?u=${m.user_id}`),
    });
});

// --- POST /api/communities --- (create)
router.post('/', authenticateToken, loadUserProfile, async (req, res) => {
    const { name, description, avatar, category } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });

    const { data, error } = await supabase
        .from('communities')
        .insert({
            name: name.trim(),
            description: description?.trim() || '',
            avatar: avatar || '🌟',
            category: category || 'General',
            created_by: req.user.id,
            member_count: 1,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return res.status(400).json({ message: 'A community with that name already exists' });
        console.error('[communities POST]', error);
        return res.status(500).json({ message: 'Failed to create community' });
    }

    // Auto-join creator
    await supabase.from('community_members').insert({ community_id: data.id, user_id: req.user.id });

    res.status(201).json({ ...data, isJoined: true, members: 1 });
});

// --- POST /api/communities/:id/join ---
router.post('/:id/join', authenticateToken, async (req, res) => {
    const { data: community } = await supabase.from('communities').select('id, member_count').eq('id', req.params.id).single();
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const { error } = await supabase
        .from('community_members')
        .upsert({ community_id: req.params.id, user_id: req.user.id }, { onConflict: 'community_id,user_id' });

    if (error) return res.status(500).json({ message: 'Failed to join community' });

    // Update denormalised count
    await supabase.from('communities').update({ member_count: community.member_count + 1 }).eq('id', req.params.id);

    res.json({ message: 'Joined community' });
});

// --- POST /api/communities/:id/leave ---
router.post('/:id/leave', authenticateToken, async (req, res) => {
    const { data: community } = await supabase.from('communities').select('id, member_count, created_by').eq('id', req.params.id).single();
    if (!community) return res.status(404).json({ message: 'Community not found' });
    if (community.created_by === req.user.id) return res.status(400).json({ message: 'Founders cannot leave their own community' });

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', req.params.id)
        .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ message: 'Failed to leave community' });

    const newCount = Math.max(0, community.member_count - 1);
    await supabase.from('communities').update({ member_count: newCount }).eq('id', req.params.id);

    res.json({ message: 'Left community' });
});

// --- GET /api/communities/:id/members ---
router.get('/:id/members', async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    const { data, error } = await supabase
        .from('community_members')
        .select('user_id, joined_at')
        .eq('community_id', req.params.id)
        .order('joined_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({ message: 'Failed to fetch members' });
    res.json(data || []);
});

// --- GET /api/communities/:id/chat ---
router.get('/:id/chat', async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('community_id', req.params.id)
        .order('created_at', { ascending: true })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({ message: 'Failed to fetch messages' });
    res.json(data || []);
});

// --- POST /api/communities/:id/chat ---
router.post('/:id/chat', authenticateToken, loadUserProfile, async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const { data, error } = await supabase
        .from('community_messages')
        .insert({
            community_id: req.params.id,
            user_id: req.user.id,
            user_name: req.userProfile.name,
            user_avatar: req.userProfile.avatar || '',
            message: message.trim(),
        })
        .select()
        .single();

    if (error) return res.status(500).json({ message: 'Failed to send message' });
    res.status(201).json(data);
});

module.exports = router;

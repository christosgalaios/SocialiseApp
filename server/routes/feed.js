const express = require('express');
const supabase = require('../supabase');
const { authenticateToken, loadUserProfile, extractUserId } = require('./auth');

const router = express.Router();

// Attach reaction counts + hasReacted to each post
async function enrichPosts(posts, userId) {
    if (!posts.length) return posts;

    const postIds = posts.map(p => p.id);

    const { data: reactions } = await supabase
        .from('post_reactions')
        .select('post_id, emoji, user_id')
        .in('post_id', postIds);

    // Build { postId: { emoji: count } } and { postId: Set<emoji> } for user
    const reactionMap = {};
    const userReactions = {};

    (reactions || []).forEach(r => {
        if (!reactionMap[r.post_id]) reactionMap[r.post_id] = {};
        reactionMap[r.post_id][r.emoji] = (reactionMap[r.post_id][r.emoji] || 0) + 1;

        if (userId && r.user_id === userId) {
            if (!userReactions[r.post_id]) userReactions[r.post_id] = new Set();
            userReactions[r.post_id].add(r.emoji);
        }
    });

    return posts.map(p => ({
        ...p,
        reactions: reactionMap[p.id] || {},
        myReactions: userId ? [...(userReactions[p.id] || [])] : [],
    }));
}

// --- GET /api/feed ---
router.get('/', async (req, res) => {
    const { community_id, limit = 20, offset = 0 } = req.query;
    const userId = extractUserId(req.headers['authorization']);

    let query = supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (community_id) query = query.eq('community_id', community_id);

    const { data, error } = await query;
    if (error) {
        console.error('[feed GET]', error);
        return res.status(500).json({ message: 'Failed to fetch feed' });
    }

    const enriched = await enrichPosts(data || [], userId);
    res.json(enriched);
});

// --- POST /api/feed --- (create post)
router.post('/', authenticateToken, loadUserProfile, async (req, res) => {
    const { content, community_id, event_id, image_url } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: 'Post content cannot be empty' });
    if (content.trim().length > 1000) return res.status(400).json({ message: 'Post too long (max 1000 characters)' });

    // Look up community name if provided
    let communityName = '';
    if (community_id) {
        const { data: community } = await supabase.from('communities').select('name').eq('id', community_id).single();
        communityName = community?.name || '';
    }

    const { data, error } = await supabase
        .from('feed_posts')
        .insert({
            user_id: req.user.id,
            user_name: req.userProfile.name,
            user_avatar: req.userProfile.avatar || '',
            community_id: community_id || null,
            community_name: communityName,
            event_id: event_id || null,
            content: content.trim(),
            image_url: image_url || null,
        })
        .select()
        .single();

    if (error) {
        console.error('[feed POST]', error);
        return res.status(500).json({ message: 'Failed to create post' });
    }

    res.status(201).json({ ...data, reactions: {}, myReactions: [] });
});

// --- DELETE /api/feed/:id --- (delete own post)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { data: post } = await supabase.from('feed_posts').select('user_id').eq('id', req.params.id).single();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorised' });

    const { error } = await supabase.from('feed_posts').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: 'Failed to delete post' });
    res.json({ message: 'Post deleted' });
});

// --- POST /api/feed/:id/react --- (toggle emoji reaction)
router.post('/:id/react', authenticateToken, async (req, res) => {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });

    const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', req.params.id)
        .eq('user_id', req.user.id)
        .eq('emoji', emoji)
        .single();

    if (existing) {
        // Toggle off
        await supabase.from('post_reactions').delete().eq('id', existing.id);
        return res.json({ added: false });
    }

    const { error } = await supabase.from('post_reactions').insert({ post_id: req.params.id, user_id: req.user.id, emoji });
    if (error) return res.status(500).json({ message: 'Failed to react' });
    res.json({ added: true });
});

module.exports = router;

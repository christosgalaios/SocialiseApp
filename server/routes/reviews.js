const express = require('express');
const supabase = require('../supabase');
const { authenticateToken } = require('./auth');
const {
    REVIEW_FETCH_FAILED, REVIEW_INSERT_FAILED, REVIEW_UPDATE_FAILED,
    REVIEW_DELETE_FAILED, REVIEW_NOT_FOUND, REVIEW_INVALID_INPUT,
    REVIEW_SELF_REVIEW,
} = require('../errors');

const router = express.Router();

// Valid vibe tag IDs — must match frontend ORGANISER_VIBE_TAGS
const VALID_TAGS = [
    'welcoming', 'well-organized', 'fun-vibe', 'inclusive',
    'creative', 'chill', 'energetic', 'great-communicator',
    'supportive', 'inspiring',
];

// --- GET /api/reviews/:organiserId --- (get reviews for an organiser)
router.get('/:organiserId', async (req, res) => {
    const { organiserId } = req.params;

    try {
        const { data: reviews, error } = await supabase
            .from('organiser_reviews')
            .select('id, organiser_id, reviewer_id, tags, comment, created_at')
            .eq('organiser_id', organiserId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ code: REVIEW_FETCH_FAILED, message: 'Failed to fetch reviews' });
        }

        // Get reviewer names/avatars
        const reviewerIds = [...new Set((reviews || []).map(r => r.reviewer_id))];
        let reviewerMap = {};
        if (reviewerIds.length) {
            const { data: users } = await supabase
                .from('users')
                .select('id, name, avatar')
                .in('id', reviewerIds);
            (users || []).forEach(u => { reviewerMap[u.id] = u; });
        }

        // Aggregate tag counts
        const tagCounts = {};
        (reviews || []).forEach(r => {
            (r.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Sort tags by frequency
        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));

        res.json({
            reviews: (reviews || []).map(r => ({
                id: r.id,
                organiserId: r.organiser_id,
                reviewerId: r.reviewer_id,
                reviewerName: reviewerMap[r.reviewer_id]?.name ?? 'Anonymous',
                reviewerAvatar: reviewerMap[r.reviewer_id]?.avatar ?? '',
                tags: r.tags,
                comment: r.comment,
                createdAt: r.created_at,
            })),
            topTags,
            totalReviews: (reviews || []).length,
        });
    } catch (err) {
        console.error('[ERROR] Failed to fetch reviews:', err.message);
        res.status(500).json({ code: REVIEW_FETCH_FAILED, message: 'Failed to fetch reviews' });
    }
});

// --- POST /api/reviews/:organiserId --- (submit or update a review)
router.post('/:organiserId', authenticateToken, async (req, res) => {
    const { organiserId } = req.params;
    const reviewerId = req.user.id;
    const { tags, comment } = req.body;

    // Can't review yourself
    if (organiserId === reviewerId) {
        return res.status(400).json({ code: REVIEW_SELF_REVIEW, message: 'You cannot review yourself' });
    }

    // Validate tags
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ code: REVIEW_INVALID_INPUT, message: 'At least one vibe tag is required' });
    }
    if (tags.length > 5) {
        return res.status(400).json({ code: REVIEW_INVALID_INPUT, message: 'Maximum 5 vibe tags allowed' });
    }
    const invalidTags = tags.filter(t => !VALID_TAGS.includes(t));
    if (invalidTags.length) {
        return res.status(400).json({ code: REVIEW_INVALID_INPUT, message: `Invalid tags: ${invalidTags.join(', ')}` });
    }

    // Validate comment
    if (comment !== undefined && typeof comment !== 'string') {
        return res.status(400).json({ code: REVIEW_INVALID_INPUT, message: 'Comment must be a string' });
    }
    if (comment && comment.length > 200) {
        return res.status(400).json({ code: REVIEW_INVALID_INPUT, message: 'Comment too long (max 200 characters)' });
    }

    try {
        // Upsert — one review per user-organiser pair
        const { data: review, error } = await supabase
            .from('organiser_reviews')
            .upsert({
                organiser_id: organiserId,
                reviewer_id: reviewerId,
                tags,
                comment: comment?.trim() || '',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'organiser_id,reviewer_id' })
            .select()
            .single();

        if (error) {
            console.error('[ERROR] Failed to upsert review:', error.message);
            return res.status(500).json({ code: REVIEW_INSERT_FAILED, message: 'Failed to save review' });
        }

        res.status(201).json({
            id: review.id,
            organiserId: review.organiser_id,
            reviewerId: review.reviewer_id,
            tags: review.tags,
            comment: review.comment,
            createdAt: review.created_at,
        });
    } catch (err) {
        console.error('[ERROR] Failed to save review:', err.message);
        res.status(500).json({ code: REVIEW_INSERT_FAILED, message: 'Failed to save review' });
    }
});

// --- DELETE /api/reviews/:organiserId --- (delete own review)
router.delete('/:organiserId', authenticateToken, async (req, res) => {
    const { organiserId } = req.params;
    const reviewerId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('organiser_reviews')
            .delete()
            .eq('organiser_id', organiserId)
            .eq('reviewer_id', reviewerId)
            .select()
            .single();

        if (!data) {
            return res.status(404).json({ code: REVIEW_NOT_FOUND, message: 'Review not found' });
        }
        if (error) {
            return res.status(500).json({ code: REVIEW_DELETE_FAILED, message: 'Failed to delete review' });
        }

        res.json({ message: 'Review deleted' });
    } catch (err) {
        console.error('[ERROR] Failed to delete review:', err.message);
        res.status(500).json({ code: REVIEW_DELETE_FAILED, message: 'Failed to delete review' });
    }
});

module.exports = router;

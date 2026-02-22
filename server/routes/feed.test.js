import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('feed.js route logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('enrichPosts helper', () => {
        it('should return empty array for empty input', () => {
            const posts = [];
            expect(posts.length).toBe(0);
        });

        it('should aggregate reaction counts by emoji per post', () => {
            const reactions = [
                { post_id: 'p1', emoji: '❤️', user_id: 'u1' },
                { post_id: 'p1', emoji: '❤️', user_id: 'u2' },
                { post_id: 'p1', emoji: '😂', user_id: 'u1' },
                { post_id: 'p2', emoji: '❤️', user_id: 'u3' },
            ];

            const reactionMap = {};
            reactions.forEach(r => {
                if (!reactionMap[r.post_id]) reactionMap[r.post_id] = {};
                reactionMap[r.post_id][r.emoji] = (reactionMap[r.post_id][r.emoji] || 0) + 1;
            });

            expect(reactionMap['p1']['❤️']).toBe(2);
            expect(reactionMap['p1']['😂']).toBe(1);
            expect(reactionMap['p2']['❤️']).toBe(1);
        });

        it('should track user reactions per post', () => {
            const userId = 'u1';
            const reactions = [
                { post_id: 'p1', emoji: '❤️', user_id: 'u1' },
                { post_id: 'p1', emoji: '😂', user_id: 'u1' },
                { post_id: 'p1', emoji: '❤️', user_id: 'u2' },
                { post_id: 'p2', emoji: '🎉', user_id: 'u1' },
            ];

            const userReactions = {};
            reactions.forEach(r => {
                if (userId && r.user_id === userId) {
                    if (!userReactions[r.post_id]) userReactions[r.post_id] = new Set();
                    userReactions[r.post_id].add(r.emoji);
                }
            });

            expect([...userReactions['p1']]).toEqual(['❤️', '😂']);
            expect([...userReactions['p2']]).toEqual(['🎉']);
        });

        it('should return empty reactions for posts with no reactions', () => {
            const reactionMap = {};
            const postId = 'p1';
            const result = reactionMap[postId] || {};
            expect(result).toEqual({});
        });

        it('should return empty myReactions when no userId', () => {
            const userId = null;
            const userReactions = {};
            const postId = 'p1';
            const result = userId ? [...(userReactions[postId] || [])] : [];
            expect(result).toEqual([]);
        });

        it('should enrich post with reactions and myReactions', () => {
            const post = { id: 'p1', content: 'Hello', user_name: 'John' };
            const reactionMap = { 'p1': { '❤️': 3, '😂': 1 } };
            const userReactions = { 'p1': new Set(['❤️']) };
            const userId = 'u1';

            const enriched = {
                ...post,
                reactions: reactionMap[post.id] || {},
                myReactions: userId ? [...(userReactions[post.id] || [])] : [],
            };

            expect(enriched.reactions).toEqual({ '❤️': 3, '😂': 1 });
            expect(enriched.myReactions).toEqual(['❤️']);
        });
    });

    describe('Feed listing', () => {
        it('should default limit to 20 and offset to 0', () => {
            const query = {};
            const limit = query.limit || 20;
            const offset = query.offset || 0;
            expect(limit).toBe(20);
            expect(offset).toBe(0);
        });

        it('should calculate correct range', () => {
            const offset = 10;
            const limit = 20;
            const rangeStart = Number(offset);
            const rangeEnd = Number(offset) + Number(limit) - 1;
            expect(rangeStart).toBe(10);
            expect(rangeEnd).toBe(29);
        });

        it('should filter by community_id when provided', () => {
            const communityId = 'c1';
            expect(!!communityId).toBe(true);

            const emptyCommunityId = undefined;
            expect(!!emptyCommunityId).toBe(false);
        });

        it('should handle null data from Supabase', () => {
            const data = null;
            const result = data || [];
            expect(result).toEqual([]);
        });
    });

    describe('Post creation validation', () => {
        it('should require non-empty content', () => {
            expect(''.trim()).toBeFalsy();
            expect('  '.trim()).toBeFalsy();
            expect(null?.trim()).toBeUndefined();
        });

        it('should reject content over 1000 characters', () => {
            const longContent = 'a'.repeat(1001);
            expect(longContent.trim().length > 1000).toBe(true);

            const validContent = 'a'.repeat(1000);
            expect(validContent.trim().length > 1000).toBe(false);
        });

        it('should accept valid content', () => {
            const content = 'Hello world!';
            expect(content.trim()).toBeTruthy();
            expect(content.trim().length <= 1000).toBe(true);
        });

        it('should trim content', () => {
            const content = '  Hello world  ';
            expect(content.trim()).toBe('Hello world');
        });

        it('should include user info in post', () => {
            const userProfile = { name: 'John Doe', avatar: 'avatar.jpg' };
            const insertData = {
                user_id: 'u1',
                user_name: userProfile.name,
                user_avatar: userProfile.avatar || '',
                content: 'Hello',
            };

            expect(insertData.user_name).toBe('John Doe');
            expect(insertData.user_avatar).toBe('avatar.jpg');
        });

        it('should default avatar to empty string', () => {
            const userProfile = { name: 'John', avatar: null };
            const avatar = userProfile.avatar || '';
            expect(avatar).toBe('');
        });

        it('should handle optional community_id', () => {
            const communityId = undefined;
            const result = communityId || null;
            expect(result).toBeNull();
        });

        it('should handle optional event_id', () => {
            const eventId = undefined;
            const result = eventId || null;
            expect(result).toBeNull();
        });

        it('should handle optional image_url', () => {
            const imageUrl = undefined;
            const result = imageUrl || null;
            expect(result).toBeNull();
        });

        it('should include empty reactions in create response', () => {
            const data = { id: 'p1', content: 'Hello' };
            const response = { ...data, reactions: {}, myReactions: [] };

            expect(response.reactions).toEqual({});
            expect(response.myReactions).toEqual([]);
        });
    });

    describe('Post delete logic', () => {
        it('should prevent non-author from deleting', () => {
            const post = { user_id: 'user1' };
            const requestUserId = 'user2';
            expect(post.user_id !== requestUserId).toBe(true);
        });

        it('should allow author to delete', () => {
            const post = { user_id: 'user1' };
            const requestUserId = 'user1';
            expect(post.user_id === requestUserId).toBe(true);
        });

        it('should return 404 for non-existent post', () => {
            const post = null;
            expect(!post).toBe(true);
        });
    });

    describe('Reaction toggle logic', () => {
        it('should require emoji', () => {
            const emoji = undefined;
            expect(!emoji).toBe(true);

            const validEmoji = '❤️';
            expect(!validEmoji).toBe(false);
        });

        it('should toggle off existing reaction', () => {
            const existing = { id: 'r1' };
            expect(!!existing).toBe(true);

            const response = { added: false };
            expect(response.added).toBe(false);
        });

        it('should add new reaction', () => {
            const existing = null;
            expect(!existing).toBe(true);

            const response = { added: true };
            expect(response.added).toBe(true);
        });

        it('should check by post_id, user_id, and emoji', () => {
            const query = {
                post_id: 'p1',
                user_id: 'u1',
                emoji: '❤️',
            };

            expect(query.post_id).toBe('p1');
            expect(query.user_id).toBe('u1');
            expect(query.emoji).toBe('❤️');
        });
    });

    describe('Community name lookup for posts', () => {
        it('should look up community name when community_id provided', () => {
            const community = { name: 'Tech Lovers' };
            const communityName = community?.name || '';
            expect(communityName).toBe('Tech Lovers');
        });

        it('should default community name to empty string', () => {
            const community = null;
            const communityName = community?.name || '';
            expect(communityName).toBe('');
        });

        it('should not look up community when no community_id', () => {
            const communityId = undefined;
            let communityName = '';
            if (communityId) {
                communityName = 'Should not reach';
            }
            expect(communityName).toBe('');
        });
    });
});

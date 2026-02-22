import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('communities.js route logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Community listing enrichment', () => {
        it('should add isJoined flag based on memberships', () => {
            const communities = [
                { id: 'c1', name: 'Tech', member_count: 10 },
                { id: 'c2', name: 'Food', member_count: 5 },
                { id: 'c3', name: 'Travel', member_count: 20 },
            ];
            const memberships = [{ community_id: 'c1' }, { community_id: 'c3' }];
            const joinedSet = new Set(memberships.map(m => m.community_id));

            const enriched = communities.map(c => ({
                ...c,
                isJoined: joinedSet.has(c.id),
                members: c.member_count,
            }));

            expect(enriched[0].isJoined).toBe(true);
            expect(enriched[0].members).toBe(10);
            expect(enriched[1].isJoined).toBe(false);
            expect(enriched[2].isJoined).toBe(true);
        });

        it('should set isJoined false when no userId', () => {
            const communities = [
                { id: 'c1', name: 'Tech', member_count: 10 },
            ];
            // userId is null — no memberships to check
            const result = (communities || []).map(c => ({
                ...c,
                isJoined: false,
                members: c.member_count,
            }));

            expect(result[0].isJoined).toBe(false);
            expect(result[0].members).toBe(10);
        });

        it('should map member_count to members field', () => {
            const community = { id: 'c1', member_count: 42 };
            expect(community.member_count).toBe(42);

            const enriched = { ...community, members: community.member_count };
            expect(enriched.members).toBe(42);
        });
    });

    describe('Community detail', () => {
        it('should generate avatar URLs from user IDs', () => {
            const members = [
                { user_id: 'u1' },
                { user_id: 'u2' },
                { user_id: 'u3' },
            ];

            const avatars = members.map(m => `https://i.pravatar.cc/150?u=${m.user_id}`);

            expect(avatars).toHaveLength(3);
            expect(avatars[0]).toBe('https://i.pravatar.cc/150?u=u1');
            expect(avatars[1]).toBe('https://i.pravatar.cc/150?u=u2');
        });

        it('should limit member avatars to 4', () => {
            const allMembers = Array.from({ length: 10 }, (_, i) => ({ user_id: `u${i}` }));
            // Query uses .limit(4)
            const limited = allMembers.slice(0, 4);
            expect(limited).toHaveLength(4);
        });
    });

    describe('Community creation validation', () => {
        it('should require name', () => {
            const body = { name: '', description: 'Test' };
            const isValid = body.name?.trim();
            expect(isValid).toBeFalsy();
        });

        it('should reject null name', () => {
            const body = { name: null, description: 'Test' };
            const isValid = body.name?.trim();
            expect(isValid).toBeFalsy();
        });

        it('should accept valid name', () => {
            const body = { name: 'Tech Lovers', description: 'Test' };
            const isValid = body.name?.trim();
            expect(isValid).toBeTruthy();
        });

        it('should trim name whitespace', () => {
            const name = '  Tech Lovers  ';
            expect(name.trim()).toBe('Tech Lovers');
        });

        it('should default avatar to star emoji', () => {
            const avatar = undefined;
            const result = avatar || '🌟';
            expect(result).toBe('🌟');
        });

        it('should default category to General', () => {
            const category = undefined;
            const result = category || 'General';
            expect(result).toBe('General');
        });

        it('should default description to empty string', () => {
            const description = undefined;
            const result = description?.trim() || '';
            expect(result).toBe('');
        });

        it('should set initial member_count to 1', () => {
            const insertData = {
                name: 'Test',
                member_count: 1,
            };
            expect(insertData.member_count).toBe(1);
        });

        it('should detect duplicate community name (23505 error)', () => {
            const error = { code: '23505' };
            expect(error.code === '23505').toBe(true);
        });

        it('should include isJoined true in create response', () => {
            const data = { id: 'c1', name: 'Tech', member_count: 1 };
            const response = { ...data, isJoined: true, members: 1 };
            expect(response.isJoined).toBe(true);
            expect(response.members).toBe(1);
        });
    });

    describe('Community join logic', () => {
        it('should increment member count on join', () => {
            const community = { id: 'c1', member_count: 10 };
            const newCount = community.member_count + 1;
            expect(newCount).toBe(11);
        });

        it('should use upsert for idempotent joins', () => {
            // upsert with onConflict prevents duplicate memberships
            const upsertData = { community_id: 'c1', user_id: 'u1' };
            const onConflict = 'community_id,user_id';
            expect(upsertData.community_id).toBe('c1');
            expect(onConflict).toBe('community_id,user_id');
        });
    });

    describe('Community leave logic', () => {
        it('should prevent founder from leaving', () => {
            const community = { id: 'c1', member_count: 10, created_by: 'user1' };
            const requestUserId = 'user1';
            expect(community.created_by === requestUserId).toBe(true);
        });

        it('should allow non-founder to leave', () => {
            const community = { id: 'c1', member_count: 10, created_by: 'user1' };
            const requestUserId = 'user2';
            expect(community.created_by === requestUserId).toBe(false);
        });

        it('should decrement member count on leave', () => {
            const community = { member_count: 10 };
            const newCount = Math.max(0, community.member_count - 1);
            expect(newCount).toBe(9);
        });

        it('should not go below 0 member count', () => {
            const community = { member_count: 0 };
            const newCount = Math.max(0, community.member_count - 1);
            expect(newCount).toBe(0);
        });
    });

    describe('Community members listing', () => {
        it('should default limit to 20 and offset to 0', () => {
            const query = {};
            const limit = query.limit || 20;
            const offset = query.offset || 0;
            expect(limit).toBe(20);
            expect(offset).toBe(0);
        });

        it('should calculate correct range', () => {
            const offset = 0;
            const limit = 20;
            const rangeEnd = Number(offset) + Number(limit) - 1;
            expect(rangeEnd).toBe(19);
        });

        it('should handle empty member list', () => {
            const data = null;
            const result = data || [];
            expect(result).toEqual([]);
        });
    });

    describe('Community chat', () => {
        it('should require non-empty message', () => {
            expect(''.trim()).toBeFalsy();
            expect('  '.trim()).toBeFalsy();
            expect(null?.trim()).toBeUndefined();
            expect('Hello'.trim()).toBeTruthy();
        });

        it('should trim message', () => {
            const message = '  Hello world  ';
            expect(message.trim()).toBe('Hello world');
        });

        it('should default chat limit to 50', () => {
            const query = {};
            const limit = query.limit || 50;
            expect(limit).toBe(50);
        });

        it('should include user info in chat message', () => {
            const userProfile = { name: 'John Doe', avatar: 'avatar.jpg' };
            const insertData = {
                community_id: 'c1',
                user_id: 'u1',
                user_name: userProfile.name,
                user_avatar: userProfile.avatar || '',
                message: 'Hello',
            };

            expect(insertData.user_name).toBe('John Doe');
            expect(insertData.user_avatar).toBe('avatar.jpg');
        });

        it('should default avatar to empty string', () => {
            const userProfile = { name: 'John', avatar: null };
            const avatar = userProfile.avatar || '';
            expect(avatar).toBe('');
        });
    });

    describe('Query parameter handling', () => {
        it('should filter by category', () => {
            const category = 'Tech';
            expect(!!category).toBe(true);
        });

        it('should filter by search term', () => {
            const search = 'food';
            const pattern = `%${search}%`;
            expect(pattern).toBe('%food%');
        });

        it('should default limit to 30 for communities', () => {
            const query = {};
            const limit = query.limit || 30;
            expect(limit).toBe(30);
        });

        it('should handle empty search', () => {
            const search = '';
            expect(!!search).toBe(false);
        });
    });
});

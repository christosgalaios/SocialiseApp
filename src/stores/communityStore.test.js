import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';

// Mock api
vi.mock('../api', () => ({
  default: {
    joinCommunity: vi.fn(),
    leaveCommunity: vi.fn(),
  },
}));

import api from '../api';
import useCommunityStore from './communityStore';

describe('communityStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset store state
    act(() => {
      useCommunityStore.setState({
        communities: [],
        selectedTribe: null,
        showTribeDiscovery: false,
        userTribes: [],
      });
    });
  });

  describe('initial state', () => {
    it('should have empty communities', () => {
      expect(useCommunityStore.getState().communities).toEqual([]);
    });

    it('should have null selectedTribe', () => {
      expect(useCommunityStore.getState().selectedTribe).toBeNull();
    });

    it('should have false showTribeDiscovery', () => {
      expect(useCommunityStore.getState().showTribeDiscovery).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set communities directly', () => {
      const communities = [{ id: '1', name: 'Test' }];
      act(() => useCommunityStore.getState().setCommunities(communities));
      expect(useCommunityStore.getState().communities).toEqual(communities);
    });

    it('should set communities with updater function', () => {
      act(() => useCommunityStore.getState().setCommunities([{ id: '1' }]));
      act(() => useCommunityStore.getState().setCommunities(prev => [...prev, { id: '2' }]));
      expect(useCommunityStore.getState().communities).toHaveLength(2);
    });

    it('should set selectedTribe', () => {
      const tribe = { id: '1', name: 'Test Tribe' };
      act(() => useCommunityStore.getState().setSelectedTribe(tribe));
      expect(useCommunityStore.getState().selectedTribe).toEqual(tribe);
    });

    it('should set showTribeDiscovery', () => {
      act(() => useCommunityStore.getState().setShowTribeDiscovery(true));
      expect(useCommunityStore.getState().showTribeDiscovery).toBe(true);
    });

    it('should set userTribes', () => {
      act(() => useCommunityStore.getState().setUserTribes(['1', '2']));
      expect(useCommunityStore.getState().userTribes).toEqual(['1', '2']);
    });
  });

  describe('handleJoinTribe', () => {
    it('should optimistically add tribe to userTribes', async () => {
      api.joinCommunity.mockResolvedValue({});
      act(() => useCommunityStore.getState().setCommunities([{ id: '1', name: 'Test' }]));

      await act(async () => {
        await useCommunityStore.getState().handleJoinTribe({ id: '1', name: 'Test' });
      });

      expect(useCommunityStore.getState().userTribes).toContain('1');
      expect(useCommunityStore.getState().communities[0].isJoined).toBe(true);
    });

    it('should call api.joinCommunity', async () => {
      api.joinCommunity.mockResolvedValue({});

      await act(async () => {
        await useCommunityStore.getState().handleJoinTribe({ id: '1' });
      });

      expect(api.joinCommunity).toHaveBeenCalledWith('1');
    });

    it('should not join if already a member', async () => {
      act(() => useCommunityStore.setState({ userTribes: ['1'] }));

      await act(async () => {
        await useCommunityStore.getState().handleJoinTribe({ id: '1' });
      });

      expect(api.joinCommunity).not.toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      api.joinCommunity.mockRejectedValue(new Error('Server error'));
      act(() => useCommunityStore.getState().setCommunities([{ id: '1' }]));

      try {
        await act(async () => {
          await useCommunityStore.getState().handleJoinTribe({ id: '1' });
        });
      } catch {
        // expected
      }

      expect(useCommunityStore.getState().userTribes).not.toContain('1');
    });

    it('should call onSuccess callback', async () => {
      api.joinCommunity.mockResolvedValue({});
      const onSuccess = vi.fn();

      await act(async () => {
        await useCommunityStore.getState().handleJoinTribe({ id: '1' }, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      api.joinCommunity.mockRejectedValue(new Error('Failed'));
      const onError = vi.fn();

      try {
        await act(async () => {
          await useCommunityStore.getState().handleJoinTribe({ id: '1' }, { onError });
        });
      } catch {
        // expected
      }

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('handleLeaveTribe', () => {
    it('should optimistically remove tribe from userTribes', async () => {
      api.leaveCommunity.mockResolvedValue({});
      act(() => {
        useCommunityStore.setState({ userTribes: ['1', '2'] });
        useCommunityStore.getState().setCommunities([
          { id: '1', isJoined: true },
          { id: '2', isJoined: true },
        ]);
      });

      await act(async () => {
        await useCommunityStore.getState().handleLeaveTribe('1');
      });

      expect(useCommunityStore.getState().userTribes).toEqual(['2']);
      expect(useCommunityStore.getState().communities[0].isJoined).toBe(false);
      expect(useCommunityStore.getState().selectedTribe).toBeNull();
    });

    it('should rollback on API failure', async () => {
      api.leaveCommunity.mockRejectedValue(new Error('Server error'));
      act(() => {
        useCommunityStore.setState({ userTribes: ['1'] });
        useCommunityStore.getState().setCommunities([{ id: '1', isJoined: true }]);
      });

      try {
        await act(async () => {
          await useCommunityStore.getState().handleLeaveTribe('1');
        });
      } catch {
        // expected
      }

      expect(useCommunityStore.getState().userTribes).toContain('1');
    });

    it('should update userTribes state after leave', async () => {
      api.leaveCommunity.mockResolvedValue({});
      act(() => useCommunityStore.setState({ userTribes: ['1', '2'] }));

      await act(async () => {
        await useCommunityStore.getState().handleLeaveTribe('1');
      });

      expect(useCommunityStore.getState().userTribes).toEqual(['2']);
    });

    it('should call onSuccess callback', async () => {
      api.leaveCommunity.mockResolvedValue({});
      const onSuccess = vi.fn();
      act(() => useCommunityStore.setState({ userTribes: ['1'] }));

      await act(async () => {
        await useCommunityStore.getState().handleLeaveTribe('1', { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });
});

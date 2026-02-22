import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import useFeedStore from './feedStore';

describe('feedStore', () => {
  beforeEach(() => {
    act(() => {
      useFeedStore.setState({
        feedPosts: [],
        selectedUserProfile: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have empty feedPosts', () => {
      expect(useFeedStore.getState().feedPosts).toEqual([]);
    });

    it('should have null selectedUserProfile', () => {
      expect(useFeedStore.getState().selectedUserProfile).toBeNull();
    });
  });

  describe('setFeedPosts', () => {
    it('should set posts directly', () => {
      const posts = [{ id: '1', content: 'Hello' }];
      act(() => useFeedStore.getState().setFeedPosts(posts));
      expect(useFeedStore.getState().feedPosts).toEqual(posts);
    });

    it('should set posts with updater function', () => {
      act(() => useFeedStore.getState().setFeedPosts([{ id: '1' }]));
      act(() => useFeedStore.getState().setFeedPosts(prev => [...prev, { id: '2' }]));
      expect(useFeedStore.getState().feedPosts).toHaveLength(2);
    });

    it('should replace all posts when set directly', () => {
      act(() => useFeedStore.getState().setFeedPosts([{ id: '1' }, { id: '2' }]));
      act(() => useFeedStore.getState().setFeedPosts([{ id: '3' }]));
      expect(useFeedStore.getState().feedPosts).toEqual([{ id: '3' }]);
    });
  });

  describe('setSelectedUserProfile', () => {
    it('should set profile', () => {
      const profile = { name: 'Alice', avatar: 'alice.jpg' };
      act(() => useFeedStore.getState().setSelectedUserProfile(profile));
      expect(useFeedStore.getState().selectedUserProfile).toEqual(profile);
    });

    it('should clear profile', () => {
      act(() => useFeedStore.getState().setSelectedUserProfile({ name: 'Alice' }));
      act(() => useFeedStore.getState().setSelectedUserProfile(null));
      expect(useFeedStore.getState().selectedUserProfile).toBeNull();
    });
  });
});

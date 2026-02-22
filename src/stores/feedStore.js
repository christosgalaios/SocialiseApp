import { create } from 'zustand';

const useFeedStore = create((set) => ({
  // State
  feedPosts: [],
  selectedUserProfile: null,

  // Setters
  setFeedPosts: (postsOrUpdater) => {
    if (typeof postsOrUpdater === 'function') {
      set((state) => ({ feedPosts: postsOrUpdater(state.feedPosts) }));
    } else {
      set({ feedPosts: postsOrUpdater });
    }
  },

  setSelectedUserProfile: (profile) => set({ selectedUserProfile: profile }),
}));

export default useFeedStore;

import { create } from 'zustand';
import api from '../api';

const useCommunityStore = create((set, get) => ({
  // State
  communities: [],
  selectedTribe: null,
  showTribeDiscovery: false,
  userTribes: (() => {
    const jsonValue = localStorage.getItem('socialise_tribes');
    if (jsonValue != null) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        localStorage.removeItem('socialise_tribes');
      }
    }
    return [];
  })(),

  // Setters
  setCommunities: (communitiesOrUpdater) => {
    if (typeof communitiesOrUpdater === 'function') {
      set((state) => ({ communities: communitiesOrUpdater(state.communities) }));
    } else {
      set({ communities: communitiesOrUpdater });
    }
  },

  setSelectedTribe: (tribe) => set({ selectedTribe: tribe }),
  setShowTribeDiscovery: (show) => set({ showTribeDiscovery: show }),

  setUserTribes: (tribes) => {
    set({ userTribes: tribes });
    localStorage.setItem('socialise_tribes', JSON.stringify(tribes));
  },

  resetUserTribes: () => {
    set({ userTribes: [] });
    localStorage.removeItem('socialise_tribes');
  },

  // Actions
  handleJoinTribe: async (tribe, { onSuccess, onError } = {}) => {
    const { userTribes } = get();
    if (userTribes.includes(tribe.id)) return;

    const prevTribes = userTribes;
    const prevCommunities = get().communities;

    try {
      // Optimistic UI
      const newTribes = [...userTribes, tribe.id];
      set({ userTribes: newTribes });
      localStorage.setItem('socialise_tribes', JSON.stringify(newTribes));
      set((state) => ({
        communities: state.communities.map(c =>
          c.id === tribe.id ? { ...c, isJoined: true } : c
        ),
      }));

      await api.joinCommunity(tribe.id);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Rollback
      set({ userTribes: prevTribes, communities: prevCommunities });
      localStorage.setItem('socialise_tribes', JSON.stringify(prevTribes));
      if (onError) onError(err);
      throw err;
    }
  },

  handleLeaveTribe: async (tribeId, { onSuccess, onError } = {}) => {
    const { userTribes } = get();
    const prevTribes = userTribes;
    const prevCommunities = get().communities;

    try {
      // Optimistic UI
      const newTribes = userTribes.filter(id => id !== tribeId);
      set({ userTribes: newTribes, selectedTribe: null });
      localStorage.setItem('socialise_tribes', JSON.stringify(newTribes));
      set((state) => ({
        communities: state.communities.map(c =>
          c.id === tribeId ? { ...c, isJoined: false } : c
        ),
      }));

      await api.leaveCommunity(tribeId);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Rollback
      set({ userTribes: prevTribes, communities: prevCommunities });
      localStorage.setItem('socialise_tribes', JSON.stringify(prevTribes));
      if (onError) onError(err);
      throw err;
    }
  },
}));

export default useCommunityStore;

import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Navigation
  activeTab: 'home',
  slideDir: 0,

  setActiveTab: (id, direction = 0) => {
    set({ activeTab: id, slideDir: direction });
  },

  // Profile sub-tab
  profileSubTab: 'profile',
  setProfileSubTab: (tab) => set({ profileSubTab: tab }),

  // Modal states
  showBookings: false,
  setShowBookings: (show) => set({ showBookings: show }),
  showSaved: false,
  setShowSaved: (show) => set({ showSaved: show }),
  showGroupChats: false,
  setShowGroupChats: (show) => set({ showGroupChats: show }),
  showProModal: false,
  setShowProModal: (show) => set({ showProModal: show }),
  showHelp: false,
  setShowHelp: (show) => set({ showHelp: show }),
  showOnboarding: (() => {
    const jsonValue = localStorage.getItem('socialise_onboarding_shown');
    return jsonValue ? JSON.parse(jsonValue) : false;
  })(),
  setShowOnboarding: (value) => {
    set({ showOnboarding: value });
    localStorage.setItem('socialise_onboarding_shown', JSON.stringify(value));
  },

  // Avatar crop modal
  avatarCropImage: null,
  setAvatarCropImage: (image) => set({ avatarCropImage: image }),

  // Delight moments
  showConfetti: false,
  setShowConfetti: (show) => set({ showConfetti: show }),
  realtimePing: { isVisible: false, name: '', avatar: '', action: '' },
  setRealtimePing: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ realtimePing: updater(state.realtimePing) }));
    } else {
      set({ realtimePing: updater });
    }
  },
  showReels: false,
  setShowReels: (show) => set({ showReels: show }),
  showLevelUp: false,
  setShowLevelUp: (show) => set({ showLevelUp: show }),
  levelUpData: null,
  setLevelUpData: (data) => set({ levelUpData: data }),
  showLevelDetail: false,
  setShowLevelDetail: (show) => set({ showLevelDetail: show }),

  // Explore filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeCategory: 'All',
  setActiveCategory: (category) => set({ activeCategory: category }),
  sizeFilter: 'all',
  setSizeFilter: (filter) => set({ sizeFilter: filter }),
  dateRange: { start: null, end: null },
  setDateRange: (range) => set({ dateRange: range }),
  thisWeekActive: false,
  setThisWeekActive: (active) => set({ thisWeekActive: active }),
  activeTags: [],
  setActiveTags: (tags) => set({ activeTags: tags }),

  // Pagination
  recommendedLimit: 3,
  setRecommendedLimit: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ recommendedLimit: updater(state.recommendedLimit) }));
    } else {
      set({ recommendedLimit: updater });
    }
  },
  exploreLimit: 6,
  setExploreLimit: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ exploreLimit: updater(state.exploreLimit) }));
    } else {
      set({ exploreLimit: updater });
    }
  },

  // Content ready
  contentReady: false,
  setContentReady: (ready) => set({ contentReady: ready }),

  // Pull-to-refresh
  pullY: 0,
  setPullY: (y) => set({ pullY: y }),
  isRefreshing: false,
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

  // Notifications/Toast
  notifications: [],
  showToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, 3000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  // User preferences
  userPreferences: (() => {
    const jsonValue = localStorage.getItem('socialise_preferences');
    return jsonValue ? JSON.parse(jsonValue) : null;
  })(),
  setUserPreferences: (prefs) => {
    set({ userPreferences: prefs });
    localStorage.setItem('socialise_preferences', JSON.stringify(prefs));
  },

  // User XP
  userXP: (() => {
    const jsonValue = localStorage.getItem('socialise_xp');
    return jsonValue ? JSON.parse(jsonValue) : 0;
  })(),
  setUserXP: (xp) => {
    set({ userXP: xp });
    localStorage.setItem('socialise_xp', JSON.stringify(xp));
  },

  // Unlocked titles
  userUnlockedTitles: (() => {
    const jsonValue = localStorage.getItem('socialise_unlocked_titles');
    return jsonValue ? JSON.parse(jsonValue) : [];
  })(),
  setUserUnlockedTitles: (titles) => {
    set({ userUnlockedTitles: titles });
    localStorage.setItem('socialise_unlocked_titles', JSON.stringify(titles));
  },

  // Pro state
  proEnabled: (() => {
    const jsonValue = localStorage.getItem('socialise_pro');
    return jsonValue ? JSON.parse(jsonValue) : false;
  })(),
  setProEnabled: (enabled) => {
    set({ proEnabled: enabled });
    localStorage.setItem('socialise_pro', JSON.stringify(enabled));
  },

  // Experimental features
  experimentalFeatures: (() => {
    const jsonValue = localStorage.getItem('socialise_experimental');
    return jsonValue ? JSON.parse(jsonValue) : false;
  })(),
  setExperimentalFeatures: (enabled) => {
    set({ experimentalFeatures: enabled });
    localStorage.setItem('socialise_experimental', JSON.stringify(enabled));
  },
}));

export default useUIStore;

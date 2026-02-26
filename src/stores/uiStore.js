import { create } from 'zustand';
import { isSoundEnabled, setSoundEnabled as persistSoundEnabled } from '../utils/feedback';

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
  showLevelUp: false,
  setShowLevelUp: (show) => set({ showLevelUp: show }),
  levelUpData: null,
  setLevelUpData: (data) => set({ levelUpData: data }),
  showLevelDetail: false,
  setShowLevelDetail: (show) => set({ showLevelDetail: show }),
  showBugReport: false,
  setShowBugReport: (show) => set({ showBugReport: show }),
  showFeatureRequest: false,
  setShowFeatureRequest: (show) => set({ showFeatureRequest: show }),
  showChangelog: false,
  setShowChangelog: (show) => set({ showChangelog: show }),

  // Organiser modals
  showOrganiserSetup: false,
  setShowOrganiserSetup: (show) => set({ showOrganiserSetup: show }),
  showOrganiserProfile: null, // userId or null
  setShowOrganiserProfile: (userId) => set({ showOrganiserProfile: userId }),
  showOrganiserEditProfile: false,
  setShowOrganiserEditProfile: (show) => set({ showOrganiserEditProfile: show }),
  organiserDashboardTab: 'overview',
  setOrganiserDashboardTab: (tab) => set({ organiserDashboardTab: tab }),

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

  // Login streak
  loginStreak: (() => {
    const jsonValue = localStorage.getItem('socialise_login_streak');
    return jsonValue ? JSON.parse(jsonValue) : 0;
  })(),
  setLoginStreak: (streak) => {
    set({ loginStreak: streak });
    localStorage.setItem('socialise_login_streak', JSON.stringify(streak));
  },

  // Per-skill XP (individual progression for each skill)
  skillXP: (() => {
    const jsonValue = localStorage.getItem('socialise_skill_xp');
    return jsonValue ? JSON.parse(jsonValue) : {
      social_spark: 0,
      adventure_spirit: 0,
      creative_soul: 0,
      community_leader: 0,
      knowledge_seeker: 0,
    };
  })(),
  setSkillXP: (skillXP) => {
    set({ skillXP });
    localStorage.setItem('socialise_skill_xp', JSON.stringify(skillXP));
  },
  addSkillXP: (gains) => {
    set((state) => {
      const next = { ...state.skillXP };
      Object.entries(gains).forEach(([key, amount]) => {
        if (next[key] !== undefined) next[key] = (next[key] || 0) + amount;
      });
      localStorage.setItem('socialise_skill_xp', JSON.stringify(next));
      return { skillXP: next };
    });
  },

  // Legacy userXP — kept as total of all skill XP for backend sync
  userXP: (() => {
    const jsonValue = localStorage.getItem('socialise_xp');
    return jsonValue ? JSON.parse(jsonValue) : 0;
  })(),
  setUserXP: (xp) => {
    set({ userXP: xp });
    localStorage.setItem('socialise_xp', JSON.stringify(xp));
  },

  // Unlocked titles / badges
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

  // Sound enabled
  soundEnabled: isSoundEnabled(),
  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    persistSoundEnabled(enabled);
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

  // Reset all per-user data to clean defaults
  resetUserData: () => {
    const defaultSkillXP = {
      social_spark: 0,
      adventure_spirit: 0,
      creative_soul: 0,
      community_leader: 0,
      knowledge_seeker: 0,
    };
    set({
      loginStreak: 0,
      userXP: 0,
      skillXP: defaultSkillXP,
      userUnlockedTitles: [],
      userPreferences: null,
      showOnboarding: false,
      proEnabled: false,
      experimentalFeatures: false,
    });
    localStorage.removeItem('socialise_login_streak');
    localStorage.removeItem('socialise_xp');
    localStorage.removeItem('socialise_skill_xp');
    localStorage.removeItem('socialise_unlocked_titles');
    localStorage.removeItem('socialise_preferences');
    localStorage.removeItem('socialise_onboarding_shown');
    localStorage.removeItem('socialise_pro');
    localStorage.removeItem('socialise_experimental');
  },
}));

export default useUIStore;

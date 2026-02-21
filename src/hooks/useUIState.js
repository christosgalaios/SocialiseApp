import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook to manage UI-related state
 * Extracts UI/UX state from App.jsx (modals, filters, tabs, etc.)
 */
export function useUIState() {
  // Main navigation tabs
  const [activeTab, setActiveTabState] = useState('home');
  const [slideDir, setSlideDir] = useState(0);
  const mainContentRef = useRef(null);
  const lastHomeExitRef = useRef(0);

  // Create safe tab setter with effects
  const setActiveTab = useCallback((id, direction = 0) => {
    if (activeTab === 'home' && id !== 'home') {
      lastHomeExitRef.current = Date.now();
    } else if (activeTab !== 'home' && id === 'home') {
      const timeAway = Date.now() - lastHomeExitRef.current;
      if (timeAway > 10000) {
        // Will be used by App.jsx to trigger mango effects
        // Mango effects handled by app parent
      }
    }
    setSlideDir(direction);
    setActiveTabState(id);

    // Scroll to top when tab changes or is re-clicked
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Profile sub-tab
  const [profileSubTab, setProfileSubTab] = useState('profile');

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showGroupChats, setShowGroupChats] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_onboarding_shown');
    return jsonValue ? JSON.parse(jsonValue) : false;
  });

  // Persist onboarding shown state
  const setShowOnboardingPersist = useCallback((value) => {
    setShowOnboarding(value);
    localStorage.setItem('socialise_onboarding_shown', JSON.stringify(value));
  }, []);

  // Avatar crop modal
  const [avatarCropImage, setAvatarCropImage] = useState(null);

  // Delight moments state
  const [showConfetti, setShowConfetti] = useState(false);
  const [realtimePing, setRealtimePing] = useState({ isVisible: false, name: '', avatar: '', action: '' });
  const [showReels, setShowReels] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showLevelDetail, setShowLevelDetail] = useState(false);

  // Explore filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all' | 'micro' | 'large'
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [thisWeekActive, setThisWeekActive] = useState(false);
  const [activeTags, setActiveTags] = useState([]);

  // Pagination
  const [recommendedLimit, setRecommendedLimit] = useState(3);
  const [exploreLimit, setExploreLimit] = useState(6);

  // Content ready (skeletons vs real content)
  const [contentReady, setContentReady] = useState(false);

  // Pull-to-refresh state
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const hasVibratedRef = useRef(false);

  // Toast notifications
  const [notifications, setNotifications] = useState([]);

  // User preferences (from localStorage)
  const [userPreferences, setUserPreferencesState] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_preferences');
    return jsonValue ? JSON.parse(jsonValue) : null;
  });

  // Persist user preferences to localStorage
  const setUserPreferences = useCallback((prefs) => {
    setUserPreferencesState(prefs);
    localStorage.setItem('socialise_preferences', JSON.stringify(prefs));
  }, []);

  // User XP and unlocked titles (from localStorage)
  const [userXP, setUserXPState] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_xp');
    return jsonValue ? JSON.parse(jsonValue) : 750;
  });

  // Persist user XP to localStorage
  const setUserXP = useCallback((xp) => {
    setUserXPState(xp);
    localStorage.setItem('socialise_xp', JSON.stringify(xp));
  }, []);

  const [userUnlockedTitles, setUserUnlockedTitlesState] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_unlocked_titles');
    return jsonValue
      ? JSON.parse(jsonValue)
      : ['first-event', 'social-butterfly', 'tribe-leader', 'conversation-starter', 'night-owl'];
  });

  // Persist user unlocked titles to localStorage
  const setUserUnlockedTitles = useCallback((titles) => {
    setUserUnlockedTitlesState(titles);
    localStorage.setItem('socialise_unlocked_titles', JSON.stringify(titles));
  }, []);

  // Pro enabled state (from localStorage)
  const [proEnabled, setProEnabledState] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_pro');
    return jsonValue ? JSON.parse(jsonValue) : false;
  });

  // Persist pro enabled state to localStorage
  const setProEnabled = useCallback((enabled) => {
    setProEnabledState(enabled);
    localStorage.setItem('socialise_pro', JSON.stringify(enabled));
  }, []);

  // Experimental features (from localStorage)
  const [experimentalFeatures, setExperimentalFeaturesState] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_experimental');
    return jsonValue ? JSON.parse(jsonValue) : false;
  });

  // Persist experimental features to localStorage
  const setExperimentalFeatures = useCallback((enabled) => {
    setExperimentalFeaturesState(enabled);
    localStorage.setItem('socialise_experimental', JSON.stringify(enabled));
  }, []);

  // Add notification (toast)
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    // Navigation
    activeTab,
    setActiveTab,
    slideDir,
    mainContentRef,

    // Profile
    profileSubTab,
    setProfileSubTab,

    // Modals
    showCreate,
    setShowCreate,
    showBookings,
    setShowBookings,
    showSaved,
    setShowSaved,
    showGroupChats,
    setShowGroupChats,
    showProModal,
    setShowProModal,
    showHelp,
    setShowHelp,
    showOnboarding,
    setShowOnboarding: setShowOnboardingPersist,
    avatarCropImage,
    setAvatarCropImage,

    // Delight moments
    showConfetti,
    setShowConfetti,
    realtimePing,
    setRealtimePing,
    showReels,
    setShowReels,
    showLevelUp,
    setShowLevelUp,
    levelUpData,
    setLevelUpData,
    showLevelDetail,
    setShowLevelDetail,

    // Explore filters
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sizeFilter,
    setSizeFilter,
    dateRange,
    setDateRange,
    thisWeekActive,
    setThisWeekActive,
    activeTags,
    setActiveTags,

    // Pagination
    recommendedLimit,
    setRecommendedLimit,
    exploreLimit,
    setExploreLimit,

    // Content state
    contentReady,
    setContentReady,

    // Pull-to-refresh
    pullY,
    setPullY,
    isRefreshing,
    setIsRefreshing,
    touchStartY,
    hasVibratedRef,

    // Notifications/Toast
    notifications,
    showToast,
    removeNotification,

    // User preferences
    userPreferences,
    setUserPreferences,

    // User stats
    userXP,
    setUserXP,
    userUnlockedTitles,
    setUserUnlockedTitles,

    // Pro state
    proEnabled,
    setProEnabled,

    // Experimental features
    experimentalFeatures,
    setExperimentalFeatures,
  };
}

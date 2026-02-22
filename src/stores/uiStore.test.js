import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import useUIStore from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to initial state
    act(() => {
      useUIStore.setState({
        activeTab: 'home',
        slideDir: 0,
        profileSubTab: 'profile',
        showBookings: false,
        showSaved: false,
        showGroupChats: false,
        showProModal: false,
        showHelp: false,
        showConfetti: false,
        showReels: false,
        showLevelUp: false,
        levelUpData: null,
        showLevelDetail: false,
        avatarCropImage: null,
        searchQuery: '',
        activeCategory: 'All',
        sizeFilter: 'all',
        dateRange: { start: null, end: null },
        thisWeekActive: false,
        activeTags: [],
        recommendedLimit: 3,
        exploreLimit: 6,
        contentReady: false,
        pullY: 0,
        isRefreshing: false,
        notifications: [],
        userXP: 750,
        proEnabled: false,
        experimentalFeatures: false,
      });
    });
  });

  describe('navigation', () => {
    it('should set active tab with direction', () => {
      act(() => useUIStore.getState().setActiveTab('explore', 1));
      expect(useUIStore.getState().activeTab).toBe('explore');
      expect(useUIStore.getState().slideDir).toBe(1);
    });

    it('should default direction to 0', () => {
      act(() => useUIStore.getState().setActiveTab('hub'));
      expect(useUIStore.getState().activeTab).toBe('hub');
      expect(useUIStore.getState().slideDir).toBe(0);
    });
  });

  describe('profile sub-tab', () => {
    it('should set profile sub-tab', () => {
      act(() => useUIStore.getState().setProfileSubTab('settings'));
      expect(useUIStore.getState().profileSubTab).toBe('settings');
    });
  });

  describe('modal states', () => {
    it('should toggle showBookings', () => {
      act(() => useUIStore.getState().setShowBookings(true));
      expect(useUIStore.getState().showBookings).toBe(true);
    });

    it('should toggle showSaved', () => {
      act(() => useUIStore.getState().setShowSaved(true));
      expect(useUIStore.getState().showSaved).toBe(true);
    });

    it('should toggle showGroupChats', () => {
      act(() => useUIStore.getState().setShowGroupChats(true));
      expect(useUIStore.getState().showGroupChats).toBe(true);
    });

    it('should toggle showProModal', () => {
      act(() => useUIStore.getState().setShowProModal(true));
      expect(useUIStore.getState().showProModal).toBe(true);
    });

    it('should toggle showHelp', () => {
      act(() => useUIStore.getState().setShowHelp(true));
      expect(useUIStore.getState().showHelp).toBe(true);
    });

    it('should toggle showReels', () => {
      act(() => useUIStore.getState().setShowReels(true));
      expect(useUIStore.getState().showReels).toBe(true);
    });

    it('should toggle showLevelUp', () => {
      act(() => useUIStore.getState().setShowLevelUp(true));
      expect(useUIStore.getState().showLevelUp).toBe(true);
    });

    it('should set levelUpData', () => {
      const data = { newLevel: 5, unlockedTitle: 'Champion' };
      act(() => useUIStore.getState().setLevelUpData(data));
      expect(useUIStore.getState().levelUpData).toEqual(data);
    });
  });

  describe('avatar crop', () => {
    it('should set avatar crop image', () => {
      act(() => useUIStore.getState().setAvatarCropImage('data:image/png;base64,...'));
      expect(useUIStore.getState().avatarCropImage).toBe('data:image/png;base64,...');
    });

    it('should clear avatar crop image', () => {
      act(() => useUIStore.getState().setAvatarCropImage('test'));
      act(() => useUIStore.getState().setAvatarCropImage(null));
      expect(useUIStore.getState().avatarCropImage).toBeNull();
    });
  });

  describe('filters', () => {
    it('should set search query', () => {
      act(() => useUIStore.getState().setSearchQuery('yoga'));
      expect(useUIStore.getState().searchQuery).toBe('yoga');
    });

    it('should set active category', () => {
      act(() => useUIStore.getState().setActiveCategory('Outdoors'));
      expect(useUIStore.getState().activeCategory).toBe('Outdoors');
    });

    it('should set size filter', () => {
      act(() => useUIStore.getState().setSizeFilter('small'));
      expect(useUIStore.getState().sizeFilter).toBe('small');
    });

    it('should set date range', () => {
      const range = { start: '2026-01-01', end: '2026-12-31' };
      act(() => useUIStore.getState().setDateRange(range));
      expect(useUIStore.getState().dateRange).toEqual(range);
    });

    it('should set this week active', () => {
      act(() => useUIStore.getState().setThisWeekActive(true));
      expect(useUIStore.getState().thisWeekActive).toBe(true);
    });

    it('should set active tags', () => {
      act(() => useUIStore.getState().setActiveTags(['dog-friendly', 'wheelchair']));
      expect(useUIStore.getState().activeTags).toEqual(['dog-friendly', 'wheelchair']);
    });
  });

  describe('pagination', () => {
    it('should set recommended limit directly', () => {
      act(() => useUIStore.getState().setRecommendedLimit(6));
      expect(useUIStore.getState().recommendedLimit).toBe(6);
    });

    it('should set recommended limit with updater function', () => {
      act(() => useUIStore.getState().setRecommendedLimit(prev => prev + 3));
      expect(useUIStore.getState().recommendedLimit).toBe(6);
    });

    it('should set explore limit directly', () => {
      act(() => useUIStore.getState().setExploreLimit(12));
      expect(useUIStore.getState().exploreLimit).toBe(12);
    });

    it('should set explore limit with updater function', () => {
      act(() => useUIStore.getState().setExploreLimit(prev => prev + 6));
      expect(useUIStore.getState().exploreLimit).toBe(12);
    });
  });

  describe('pull-to-refresh', () => {
    it('should set pull Y', () => {
      act(() => useUIStore.getState().setPullY(50));
      expect(useUIStore.getState().pullY).toBe(50);
    });

    it('should set isRefreshing', () => {
      act(() => useUIStore.getState().setIsRefreshing(true));
      expect(useUIStore.getState().isRefreshing).toBe(true);
    });
  });

  describe('toast notifications', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add notification', () => {
      act(() => useUIStore.getState().showToast('Test message', 'success'));
      expect(useUIStore.getState().notifications).toHaveLength(1);
      expect(useUIStore.getState().notifications[0].message).toBe('Test message');
      expect(useUIStore.getState().notifications[0].type).toBe('success');
    });

    it('should default to info type', () => {
      act(() => useUIStore.getState().showToast('Info message'));
      expect(useUIStore.getState().notifications[0].type).toBe('info');
    });

    it('should auto-remove after 3 seconds', () => {
      act(() => useUIStore.getState().showToast('Temp message'));
      expect(useUIStore.getState().notifications).toHaveLength(1);

      act(() => vi.advanceTimersByTime(3000));
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should remove specific notification', () => {
      act(() => useUIStore.getState().showToast('Message 1'));
      // Advance time so Date.now() returns a different value for 2nd toast
      act(() => vi.advanceTimersByTime(1));
      act(() => useUIStore.getState().showToast('Message 2'));
      expect(useUIStore.getState().notifications).toHaveLength(2);

      const firstId = useUIStore.getState().notifications[0].id;
      act(() => useUIStore.getState().removeNotification(firstId));
      expect(useUIStore.getState().notifications).toHaveLength(1);
      expect(useUIStore.getState().notifications[0].message).toBe('Message 2');
    });
  });

  describe('state persistence setters', () => {
    // Note: localStorage persistence is tested via state updates only.
    // The actual localStorage.setItem calls happen inside the store closures,
    // which capture a reference to the module-level localStorage that may differ
    // from the test environment's localStorage in Vitest's jsdom sandbox.

    it('should update userPreferences state', () => {
      const prefs = { interests: ['Food'], location: 'London' };
      act(() => useUIStore.getState().setUserPreferences(prefs));
      expect(useUIStore.getState().userPreferences).toEqual(prefs);
    });

    it('should update userXP state', () => {
      act(() => useUIStore.getState().setUserXP(1000));
      expect(useUIStore.getState().userXP).toBe(1000);
    });

    it('should update userUnlockedTitles state', () => {
      act(() => useUIStore.getState().setUserUnlockedTitles(['first-event']));
      expect(useUIStore.getState().userUnlockedTitles).toEqual(['first-event']);
    });

    it('should update proEnabled state', () => {
      act(() => useUIStore.getState().setProEnabled(true));
      expect(useUIStore.getState().proEnabled).toBe(true);
    });

    it('should update experimentalFeatures state', () => {
      act(() => useUIStore.getState().setExperimentalFeatures(true));
      expect(useUIStore.getState().experimentalFeatures).toBe(true);
    });

    it('should update onboarding state', () => {
      act(() => useUIStore.getState().setShowOnboarding(true));
      expect(useUIStore.getState().showOnboarding).toBe(true);
    });
  });

  describe('realtime ping', () => {
    it('should set realtime ping directly', () => {
      const ping = { isVisible: true, name: 'Alice', avatar: 'a.jpg', action: 'joined' };
      act(() => useUIStore.getState().setRealtimePing(ping));
      expect(useUIStore.getState().realtimePing).toEqual(ping);
    });

    it('should set realtime ping with updater function', () => {
      act(() => useUIStore.getState().setRealtimePing(prev => ({ ...prev, isVisible: true })));
      expect(useUIStore.getState().realtimePing.isVisible).toBe(true);
    });
  });

  describe('content ready', () => {
    it('should set content ready', () => {
      act(() => useUIStore.getState().setContentReady(true));
      expect(useUIStore.getState().contentReady).toBe(true);
    });
  });
});

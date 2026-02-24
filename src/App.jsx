import { useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import './index.css';

// --- STORES ---
import useAuthStore from './stores/authStore';
import useEventStore from './stores/eventStore';
import useCommunityStore from './stores/communityStore';
import useFeedStore from './stores/feedStore';
import useUIStore from './stores/uiStore';

// --- DATA & CONSTANTS ---
import { XP_LEVELS } from './data/constants';

// --- COMPONENTS ---
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import Confetti from './components/Confetti';
import RealtimePing from './components/RealtimePing';
import { Bug } from 'lucide-react';

// Lazy-loaded components (heavy, conditionally rendered)
const MangoChat = lazy(() => import('./components/MangoChat'));
const MangoAssistant = lazy(() => import('./components/MangoAssistant'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
import {
  HomeSkeleton,
  HubSkeleton,
  ExploreSkeleton,
  ProfileSkeleton,
} from './components/Skeleton';
import { useMango } from './contexts/MangoContext';

// --- TAB COMPONENTS ---
import HomeTab from './components/HomeTab';
import HubTab from './components/HubTab';
import ExploreTab from './components/ExploreTab';
import ProfileTab from './components/ProfileTab';
import AppModals from './components/AppModals';

// --- MAIN APP COMPONENT ---
function App() {
  const mango = useMango();

  // Store selectors
  const user = useAuthStore((s) => s.user);
  const appState = useAuthStore((s) => s.appState);
  const setAppState = useAuthStore((s) => s.setAppState);

  const events = useEventStore((s) => s.events);
  const setEvents = useEventStore((s) => s.setEvents);
  const setJoinedEvents = useEventStore((s) => s.setJoinedEvents);
  const setSavedEvents = useEventStore((s) => s.setSavedEvents);
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setChatMessages = useEventStore((s) => s.setChatMessages);
  const setShowCreate = useEventStore((s) => s.setShowCreate);

  const setCommunities = useCommunityStore((s) => s.setCommunities);

  const setFeedPosts = useFeedStore((s) => s.setFeedPosts);

  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const sizeFilter = useUIStore((s) => s.sizeFilter);
  const dateRange = useUIStore((s) => s.dateRange);
  const activeTags = useUIStore((s) => s.activeTags);
  const thisWeekActive = useUIStore((s) => s.thisWeekActive);
  const contentReady = useUIStore((s) => s.contentReady);
  const setContentReady = useUIStore((s) => s.setContentReady);
  const setExploreLimit = useUIStore((s) => s.setExploreLimit);
  const setRecommendedLimit = useUIStore((s) => s.setRecommendedLimit);
  const pullY = useUIStore((s) => s.pullY);
  const setPullY = useUIStore((s) => s.setPullY);
  const isRefreshing = useUIStore((s) => s.isRefreshing);
  const setIsRefreshing = useUIStore((s) => s.setIsRefreshing);
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);
  const showToast = useUIStore((s) => s.showToast);
  const showConfetti = useUIStore((s) => s.showConfetti);
  const setShowConfetti = useUIStore((s) => s.setShowConfetti);
  const realtimePing = useUIStore((s) => s.realtimePing);
  const setRealtimePing = useUIStore((s) => s.setRealtimePing);
  const showOnboarding = useUIStore((s) => s.showOnboarding);
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding);
  const userPreferences = useUIStore((s) => s.userPreferences);
  const setUserPreferences = useUIStore((s) => s.setUserPreferences);
  const userXP = useUIStore((s) => s.userXP);
  const setUserXP = useUIStore((s) => s.setUserXP);
  const setLevelUpData = useUIStore((s) => s.setLevelUpData);
  const setShowLevelUp = useUIStore((s) => s.setShowLevelUp);
  const experimentalFeatures = useUIStore((s) => s.experimentalFeatures);

  // Refs for touch handling
  const mainContentRef = useRef(null);
  const touchStartY = useRef(0);
  const hasVibratedRef = useRef(false);
  const dataFetchedForUser = useRef(null);

  // Splash screen coordination: wait for both animation and session check
  const sessionTargetRef = useRef(null); // 'app' | 'auth' | null
  const splashDoneRef = useRef(false);

  const tryTransition = useCallback(() => {
    if (splashDoneRef.current && sessionTargetRef.current) {
      setAppState(sessionTargetRef.current);
    }
  }, [setAppState]);

  // Reset explore limit when filters change
  useEffect(() => {
    setExploreLimit(6);
  }, [searchQuery, activeCategory, sizeFilter, dateRange, activeTags, thisWeekActive, setExploreLimit]);

  // Scroll-to-bottom → load more
  useEffect(() => {
    const el = mainContentRef.current;
    if (!el) return;
    let cooldown = false;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 120 && !cooldown) {
        cooldown = true;
        if (activeTab === 'home') {
          setRecommendedLimit(prev => prev + 3);
        } else if (activeTab === 'explore') {
          setExploreLimit(prev => prev + 6);
        }
        setTimeout(() => { cooldown = false; }, 800);
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [activeTab, setRecommendedLimit, setExploreLimit]);

  // Content loading: show skeletons then reveal
  useEffect(() => {
    if (appState !== 'app') {
      setContentReady(false);
      return;
    }
    const t = setTimeout(() => setContentReady(true), 600);
    return () => clearTimeout(t);
  }, [appState, setContentReady]);

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    try {
      const [eventsData, communitiesData, feedData] = await Promise.all([
        api.getEvents(),
        api.getCommunities(),
        api.getFeed(),
      ]);
      setEvents(eventsData || []);
      setJoinedEvents((eventsData || []).filter(e => e.isJoined).map(e => e.id));
      setSavedEvents((eventsData || []).filter(e => e.isSaved).map(e => e.id));
      setCommunities(communitiesData || []);
      setFeedPosts(feedData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [setEvents, setJoinedEvents, setSavedEvents, setCommunities, setFeedPosts]);

  // Fetch data when app is ready
  useEffect(() => {
    if (appState !== 'app' || !user) return;
    if (dataFetchedForUser.current === user.id) return;
    dataFetchedForUser.current = user.id;
    fetchAllData();
  }, [appState, user, fetchAllData]);

  // Handle auth
  const handleLogin = useCallback(async (type, credentials) => {
    try {
      await useAuthStore.getState().handleLogin(type, credentials, {
        onSuccess: (loginUser) => {
          showToast(`Welcome${type === 'register' ? '' : ' back'}, ${loginUser.name?.split(' ')[0] || 'there'}!`, 'success');
          dataFetchedForUser.current = null;
        },
      });
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    }
  }, [showToast]);

  const handleLogout = useCallback(() => {
    setEvents([]);
    setJoinedEvents([]);
    setSavedEvents([]);
    setCommunities([]);
    setFeedPosts([]);
    useUIStore.getState().resetUserData();
    useCommunityStore.getState().resetUserTribes();
    useAuthStore.getState().handleLogout(() => {
      showToast('Signed out successfully', 'info');
    });
  }, [setEvents, setJoinedEvents, setSavedEvents, setCommunities, setFeedPosts, showToast]);

  // Session check on mount — stores result without changing appState directly.
  // The actual transition happens in tryTransition once the splash animation also finishes.
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const token = localStorage.getItem('socialise_token');
      if (!token) {
        sessionTargetRef.current = 'auth';
        tryTransition();
        return;
      }
      try {
        const userData = await api.getMe(token);
        if (!cancelled) {
          useAuthStore.getState().setUser(userData);
          dataFetchedForUser.current = null;
          sessionTargetRef.current = 'app';
          tryTransition();
        }
      } catch (err) {
        console.error('Session invalid', err);
        if (!cancelled) {
          localStorage.removeItem('socialise_token');
          localStorage.removeItem('socialise_user');
          useAuthStore.getState().setUser(null);
          sessionTargetRef.current = 'auth';
          tryTransition();
        }
      }
    };
    const t = setTimeout(checkSession, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [tryTransition]);

  // Fetch chat messages when event detail opens
  const selectedEventId = selectedEvent?.id;
  useEffect(() => {
    if (!selectedEventId) return;
    let cancelled = false;
    const fetchChat = async () => {
      try {
        const messages = await api.getEventChat(selectedEventId);
        if (cancelled) return;
        setChatMessages(prev => ({
          ...prev,
          [selectedEventId]: (messages || []).map(m => ({
            id: m.id,
            user: m.user_name,
            avatar: m.user_avatar,
            message: m.message,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            isMe: m.user_id === user?.id,
            isHost: m.is_host,
            isSystem: m.is_system,
          })),
        }));
      } catch (err) {
        console.error('Failed to fetch chat:', err);
      }
    };
    fetchChat();
    return () => { cancelled = true; };
  }, [selectedEventId, user?.id, setChatMessages]);

  // Event join/leave with XP
  const handleJoin = useCallback(async (id) => {
    const currentJoined = useEventStore.getState().joinedEvents;
    if (currentJoined.includes(id)) {
      // Leave
      setJoinedEvents(prev => prev.filter(e => e !== id));
      showToast('You left the event.', 'info');
      try {
        await api.leaveEvent(id);
      } catch (err) {
        setJoinedEvents(prev => [...prev, id]);
        showToast(err.message, 'error');
      }
    } else {
      // Join
      setJoinedEvents(prev => [...prev, id]);
      showToast("You're going! Added to your calendar.", 'success');

      // Award XP
      const xpGain = 50;
      const newXP = userXP + xpGain;
      const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= userXP).pop();
      const newLevel = XP_LEVELS.filter(l => l.xpRequired <= newXP).pop();
      setUserXP(newXP);
      // Persist XP to backend (fire-and-forget — localStorage is source of truth for optimistic UI)
      api.updateXP({ xp: newXP }).catch(() => {});
      if (newLevel && currentLevel && newLevel.level > currentLevel.level) {
        setTimeout(() => {
          setLevelUpData({ newLevel, unlockedTitle: null });
          setShowLevelUp(true);
        }, 1500);
      }

      setShowConfetti(true);
      mango.celebrate("You're in! 🎉");

      try {
        await api.joinEvent(id);
      } catch (err) {
        setJoinedEvents(prev => prev.filter(e => e !== id));
        showToast(err.message, 'error');
      }
    }
  }, [setJoinedEvents, showToast, userXP, setUserXP, setLevelUpData, setShowLevelUp, setShowConfetti, mango]);

  const sendMessage = useCallback(async (eventId, text) => {
    if (!text.trim()) return;
    const name = user?.name ?? 'Guest';
    const parts = name.split(' ');
    const optimisticId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: optimisticId,
      user: `${parts[0] ?? ''} ${parts[1]?.[0] ?? ''}.`.trim() || 'Guest',
      avatar: user?.avatar ?? '',
      message: text,
      time: 'Just now',
      isMe: true,
    };

    setChatMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), optimisticMsg],
    }));

    try {
      await api.sendEventMessage(eventId, text);
    } catch {
      showToast('Failed to send message', 'error');
    }
  }, [user, setChatMessages, showToast]);

  const createNewEvent = useCallback(async (data) => {
    try {
      const newEvent = await api.createEvent(data);
      setEvents(prev => [newEvent, ...prev]);
      useEventStore.getState().setShowCreate(false);
      showToast('Experience published successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    }
  }, [setEvents, showToast]);

  // Parse date string for filtering
  const parseEventDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    const currentYear = new Date().getFullYear();
    const parsed = new Date(`${dateStr} ${currentYear}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    if (!matchesCategory) return false;
    if (sizeFilter === 'micro' && !e.isMicroMeet) return false;
    if (sizeFilter === 'large' && e.isMicroMeet) return false;
    if (dateRange.start || dateRange.end) {
      const eventDate = parseEventDate(e.date);
      if (eventDate) {
        if (dateRange.start && eventDate < dateRange.start) return false;
        if (dateRange.end && eventDate > dateRange.end) return false;
      }
    }
    if (activeTags.length > 0) {
      const eventTags = e.tags || e.inclusivity_tags || [];
      if (!activeTags.every(t => eventTags.includes(t))) return false;
    }
    return true;
  }).sort((a, b) => (a.isMicroMeet === b.isMicroMeet) ? 0 : a.isMicroMeet ? -1 : 1);

  // Touch handlers for pull-to-refresh
  const handleTouchStart = (e) => {
    if (activeTab === 'home' && mainContentRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      hasVibratedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    if (activeTab === 'home' && mainContentRef.current?.scrollTop === 0 && touchStartY.current > 0) {
      const deltaY = touchY - touchStartY.current;
      if (deltaY > 0 && !isRefreshing) {
        const newPullY = Math.min(deltaY * 0.4, 150);
        setPullY(newPullY);
        if (newPullY > 60 && !hasVibratedRef.current) {
          try {
            if (window.navigator?.vibrate) window.navigator.vibrate(20);
            hasVibratedRef.current = true;
          } catch { /* ignore */ }
        } else if (newPullY < 50 && hasVibratedRef.current) {
          hasVibratedRef.current = false;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = 0;
    if (pullY > 60) {
      setIsRefreshing(true);
      setPullY(80);
      try {
        if (window.navigator?.vibrate) window.navigator.vibrate(50);
      } catch { /* ignore */ }
      fetchAllData().then(() => {
        setIsRefreshing(false);
        setPullY(0);
        setRecommendedLimit(3);
        showToast('Feed refreshed', 'success');
      }).catch(() => {
        setIsRefreshing(false);
        setPullY(0);
      });
    } else {
      setPullY(0);
    }
  };

  // Enhanced setActiveTab with mango effects
  const setActiveTabWithEffects = useCallback((id, direction = 0) => {
    if (activeTab === 'home' && id !== 'home') {
      // Exiting home tab
    } else if (activeTab !== 'home' && id === 'home') {
      mango.setMessage('Welcome back!');
      mango.setCoords({ x: 0, y: 0 });
      mango.setPose('playing');
      setTimeout(() => mango.setMessage(null), 2500);
      setTimeout(() => mango.setPose('wave'), 4000);
    }
    setActiveTab(id, direction);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, setActiveTab, mango]);

  const handleSplashFinish = useCallback(() => {
    splashDoneRef.current = true;
    tryTransition();
  }, [tryTransition]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-paper font-sans overflow-hidden">
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[300] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-bold focus:text-sm">
        Skip to main content
      </a>

      {/* Global Toast Notifications */}
      <AnimatePresence>
        {notifications.map(n => (
          <Toast key={n.id} message={n.message} type={n.type} onClose={() => removeNotification(n.id)} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {appState === 'splash' && (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        )}

        {appState === 'auth' && (
          <AuthScreen key="auth" onLogin={handleLogin} />
        )}

        {appState === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col relative overflow-hidden pt-[env(safe-area-inset-top)]"
          >
            <div className="flex h-full">
              {/* Desktop Sidebar */}
              <Sidebar
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                experimentalFeatures={experimentalFeatures}
              />

              {/* Main Content Area */}
              <main
                id="main-content"
                ref={mainContentRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar pb-24 md:pb-0"
              >
                {/* Pull Refresh Indicator */}
                <motion.div
                  className="w-full flex justify-center bg-transparent absolute top-0 left-0 z-30 pointer-events-none overflow-hidden"
                  style={{ height: pullY }}
                >
                  <div className="flex items-end h-full pb-4">
                    {isRefreshing ? <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /> :
                      <span className="text-primary font-black text-xs tracking-widest opacity-80">
                        {pullY > 60 ? 'RELEASE TO REFRESH' : 'PULL DOWN'}
                      </span>}
                  </div>
                </motion.div>

                <motion.div style={{ translateY: pullY }} className="min-h-full">
                  <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                      contentReady ? (
                        <HomeTab
                          onProfileClick={() => setActiveTabWithEffects('profile')}
                          filteredEvents={filteredEvents}
                          fetchAllData={fetchAllData}
                        />
                      ) : (<HomeSkeleton />)
                    )}

                    {activeTab === 'hub' && (
                      contentReady ? <HubTab /> : <HubSkeleton />
                    )}

                    {activeTab === 'explore' && (
                      contentReady ? (
                        <ExploreTab filteredEvents={filteredEvents} />
                      ) : (<ExploreSkeleton />)
                    )}

                    {activeTab === 'profile' && (
                      contentReady ? (
                        <ProfileTab onLogout={handleLogout} />
                      ) : (<ProfileSkeleton />)
                    )}
                  </AnimatePresence>
                </motion.div>
              </main>
            </div>

            {/* Floating Navigation - Mobile Only */}
            <div className="md:hidden">
              <BottomNav activeTab={activeTab} setActiveTab={setActiveTabWithEffects} onCreateClick={() => setShowCreate(true)} />
            </div>

            {/* Modals & Sheets */}
            <AppModals
              handleJoin={handleJoin}
              sendMessage={sendMessage}
              createNewEvent={createNewEvent}
              filteredEvents={filteredEvents}
            />

            {/* Onboarding Flow */}
            <AnimatePresence>
              {user && !showOnboarding && !userPreferences && (
                <Suspense fallback={null}>
                  <OnboardingFlow
                    userName={user?.name ?? 'there'}
                    onComplete={(prefs) => {
                      setUserPreferences(prefs);
                      setShowOnboarding(true);
                      showToast(`Welcome, ${user?.name?.split(' ')[0] ?? 'there'}! Let's find your tribe.`, 'success');
                    }}
                  />
                </Suspense>
              )}
            </AnimatePresence>

            {/* Delight Moments */}
            <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
            <RealtimePing
              isVisible={realtimePing.isVisible}
              name={realtimePing.name}
              avatar={realtimePing.avatar}
              action={realtimePing.action}
              onClose={() => setRealtimePing(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Mango Assistant */}
            {activeTab === 'home' && (
              <Suspense fallback={null}>
                <MangoAssistant />
              </Suspense>
            )}

            {/* Bug Report Button */}
            <motion.button
              className="fixed bottom-28 right-4 z-50 w-11 h-11 rounded-full bg-secondary/90 text-white shadow-lg flex items-center justify-center backdrop-blur-sm border border-white/10 md:bottom-6"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => useUIStore.getState().setShowBugReport(true)}
              aria-label="Report a bug"
            >
              <Bug size={18} />
            </motion.button>

            <IOSInstallPrompt />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mango.isChatOpen && (
          <Suspense fallback={null}>
            <MangoChat user={user} events={events} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

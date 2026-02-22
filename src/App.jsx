import { useEffect, useRef, useCallback } from 'react';
import { version as APP_VERSION } from '../package.json';
import {
  Mail, ShieldCheck, Zap, Check, Heart, Crown, ChevronRight, ChevronLeft, LogOut, Camera, Users, Settings, MessageCircle, RefreshCw, ArrowLeft, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import './index.css';

// --- CUSTOM HOOKS ---
import { useAuthState } from './hooks/useAuthState';
import { useEventsState } from './hooks/useEventsState';
import { useCommunitiesState } from './hooks/useCommunitiesState';
import { useFeedState } from './hooks/useFeedState';
import { useUIState } from './hooks/useUIState';

// --- DATA & CONSTANTS (UI config only — no mock data) ---
import {
  CATEGORIES,
  XP_LEVELS,
  UNLOCKABLE_TITLES,
  PROFILE_STATS
} from './data/constants';

// --- COMPONENTS ---
import AnimatedLogo from './components/AnimatedLogo';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import MicroMeetCard from './components/MicroMeetCard';
import EventCard from './components/EventCard';
import FeedItem from './components/FeedItem';
import CreateEventModal from './components/CreateEventModal';
import EventDetailSheet from './components/EventDetailSheet';
import MangoChat from './components/MangoChat';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import VideoWall from './components/VideoWall';
import Mango from './components/Mango';
import MangoAssistant from './components/MangoAssistant';
import Confetti from './components/Confetti';
import ExploreFilters from './components/ExploreFilters';
import TribeSheet from './components/TribeSheet';
import TribeDiscovery from './components/TribeDiscovery';
import RealtimePing from './components/RealtimePing';
import WarmthScore from './components/WarmthScore';
import MyBookingsSheet from './components/MyBookingsSheet';
import SavedEventsSheet from './components/SavedEventsSheet';
import ProUpgradeModal from './components/ProUpgradeModal';
import HelpSheet from './components/HelpSheet';
import UserProfileSheet from './components/UserProfileSheet';
import GroupChatsSheet from './components/GroupChatsSheet';
import OnboardingFlow from './components/OnboardingFlow';
import EventReels from './components/EventReels';
import LevelUpModal from './components/LevelUpModal';
import AvatarCropModal from './components/AvatarCropModal';
import {
  HomeSkeleton,
  HubSkeleton,
  ExploreSkeleton,
  ProfileSkeleton
} from './components/Skeleton';
import { useMango } from './contexts/MangoContext';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } }
};

// --- MAIN APP COMPONENT ---
function App() {
  // Custom hooks for state management
  const auth = useAuthState();
  const events = useEventsState();
  const communities = useCommunitiesState();
  const feed = useFeedState();
  const ui = useUIState();
  const mango = useMango();

  // Destructure ui properties used in effects to satisfy exhaustive-deps
  const {
    setExploreLimit, searchQuery, activeCategory, sizeFilter, dateRange, activeTags, thisWeekActive,
    activeTab, setRecommendedLimit, mainContentRef, setContentReady,
  } = ui;

  // Reset explore limit when filters change
  useEffect(() => {
    setExploreLimit(6);
  }, [searchQuery, activeCategory, sizeFilter, dateRange, activeTags, thisWeekActive, setExploreLimit]);

  // Scroll-to-bottom → load more (home recommended & explore)
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
  }, [activeTab, setRecommendedLimit, setExploreLimit, mainContentRef]);

  // Content loading: show skeletons then reveal
  useEffect(() => {
    if (auth.appState !== 'app') {
      setContentReady(false);
      return;
    }
    const t = setTimeout(() => setContentReady(true), 600);
    return () => clearTimeout(t);
  }, [auth.appState, setContentReady]);

  // Fetch all data from API when app is ready
  const fetchAllData = useCallback(async () => {
    try {
      const [eventsData, communitiesData, feedData] = await Promise.all([
        api.getEvents(),
        api.getCommunities(),
        api.getFeed(),
      ]);
      events.setEvents(eventsData || []);
      events.setJoinedEvents((eventsData || []).filter(e => e.isJoined).map(e => e.id));
      events.setSavedEvents((eventsData || []).filter(e => e.isSaved).map(e => e.id));
      communities.setCommunities(communitiesData || []);
      feed.setFeedPosts(feedData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [events, communities, feed]);

  useEffect(() => {
    if (auth.appState !== 'app' || !auth.user) return;
    if (auth.dataFetchedForUser.current === auth.user.id) return;
    auth.dataFetchedForUser.current = auth.user.id;
    fetchAllData();
  }, [auth.appState, auth.user, auth.dataFetchedForUser, fetchAllData]);

  // Handle auth transitions with proper callbacks
  const handleLogin = useCallback(async (type, credentials) => {
    try {
      await auth.handleLogin(type, credentials, {
        onSuccess: (user) => {
          ui.showToast(`Welcome${type === 'register' ? '' : ' back'}, ${user.name?.split(' ')[0] || 'there'}!`, 'success');
          auth.dataFetchedForUser.current = null;
        }
      });
    } catch (err) {
      ui.showToast(err.message || 'Authentication failed', 'error');
    }
  }, [auth, ui]);

  const handleLogout = useCallback(() => {
    events.setEvents([]);
    events.setJoinedEvents([]);
    events.setSavedEvents([]);
    communities.setCommunities([]);
    feed.setFeedPosts([]);
    auth.handleLogout(() => {
      ui.showToast('Signed out successfully', 'info');
    });
  }, [auth, events, communities, feed, ui]);

  const handleTouchStart = (e) => {
    if (ui.activeTab === 'home' && ui.mainContentRef.current?.scrollTop === 0) {
      ui.touchStartY.current = e.touches[0].clientY;
      ui.hasVibratedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    // Only pull-to-refresh on home tab when at the top
    if (ui.activeTab === 'home' && ui.mainContentRef.current?.scrollTop === 0 && ui.touchStartY.current > 0) {
      const deltaY = touchY - ui.touchStartY.current;
      if (deltaY > 0 && !ui.isRefreshing) {
        const newPullY = Math.min(deltaY * 0.4, 150);
        ui.setPullY(newPullY);

        // Haptic feedback when crossing threshold
        if (newPullY > 60 && !ui.hasVibratedRef.current) {
          try {
            if (window.navigator?.vibrate) window.navigator.vibrate(20);
            ui.hasVibratedRef.current = true;
          } catch { /* ignore */ }
        } else if (newPullY < 50 && ui.hasVibratedRef.current) {
          // Reset if user pulls back up significantly
          ui.hasVibratedRef.current = false;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    ui.touchStartY.current = 0; // Reset start
    if (ui.pullY > 60) {
      ui.setIsRefreshing(true);
      ui.setPullY(80); // Snap
      try {
        if (window.navigator?.vibrate) window.navigator.vibrate(50);
      } catch { /* ignore */ }

      fetchAllData().then(() => {
        ui.setIsRefreshing(false);
        ui.setPullY(0);
        ui.setRecommendedLimit(3);
        ui.showToast('Feed refreshed', 'success');
      }).catch(() => {
        ui.setIsRefreshing(false);
        ui.setPullY(0);
      });
    } else {
      ui.setPullY(0);
    }
  };



  const fileInputRef = useRef(null);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      ui.setAvatarCropImage(imageUrl);
    }
    // Reset so the same file can be re-selected
    event.target.value = '';
  };

  const handleAvatarCropSave = (croppedDataUrl) => {
    auth.setUser({ ...auth.user, avatar: croppedDataUrl });
    ui.setAvatarCropImage(null);
    ui.showToast('Profile photo updated!', 'success');
  };

  const handleAvatarCropCancel = () => {
    if (ui.avatarCropImage) URL.revokeObjectURL(ui.avatarCropImage);
    ui.setAvatarCropImage(null);
  };

  // Persistent Session Check - run once on mount
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const token = localStorage.getItem('socialise_token');
      if (!token) {
        auth.setAppState('auth');
        return;
      }
      try {
        const userData = await api.getMe(token);
        if (!cancelled) {
          auth.setUser(userData);
          auth.setAppState('app');
          auth.dataFetchedForUser.current = null;
        }
      } catch (err) {
        console.error('Session invalid', err);
        if (!cancelled) handleLogout();
      }
    };
    const t = setTimeout(checkSession, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [handleLogout, auth]);

  // Fetch chat messages when event detail opens
  useEffect(() => {
    if (!events.selectedEvent) return;
    let cancelled = false;
    const fetchChat = async () => {
      try {
        const messages = await api.getEventChat(events.selectedEvent.id);
        if (cancelled) return;
        events.setChatMessages(prev => ({
          ...prev,
          [events.selectedEvent.id]: (messages || []).map(m => ({
            id: m.id,
            user: m.user_name,
            avatar: m.user_avatar,
            message: m.message,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            isMe: m.user_id === auth.user?.id,
            isHost: m.is_host,
            isSystem: m.is_system,
          }))
        }));
      } catch (err) {
        console.error('Failed to fetch chat:', err);
      }
    };
    fetchChat();
    return () => { cancelled = true; };
  }, [events.selectedEvent?.id, auth.user?.id, events]);

  // Event join/leave with XP and delight moments
  const handleJoin = useCallback(async (id) => {
    if (events.joinedEvents.includes(id)) {
      // Leave
      events.setJoinedEvents(prev => prev.filter(e => e !== id));
      ui.showToast('You left the event.', 'info');
      try {
        await api.leaveEvent(id);
      } catch (err) {
        events.setJoinedEvents(prev => [...prev, id]);
        ui.showToast(err.message, 'error');
      }
    } else {
      // Join
      events.setJoinedEvents(prev => [...prev, id]);
      ui.showToast('You\'re going! Added to your calendar.', 'success');

      // Award XP
      const xpGain = 50;
      const newXP = ui.userXP + xpGain;
      const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= ui.userXP).pop();
      const newLevel = XP_LEVELS.filter(l => l.xpRequired <= newXP).pop();
      ui.setUserXP(newXP);
      if (newLevel && currentLevel && newLevel.level > currentLevel.level) {
        setTimeout(() => {
          ui.setLevelUpData({ newLevel, unlockedTitle: null });
          ui.setShowLevelUp(true);
        }, 1500);
      }

      // Trigger delight moments
      ui.setShowConfetti(true);
      mango.celebrate("You're in! 🎉");

      try {
        await api.joinEvent(id);
      } catch (err) {
        events.setJoinedEvents(prev => prev.filter(e => e !== id));
        ui.showToast(err.message, 'error');
      }
    }
  }, [events, ui, mango]);

  const sendMessage = useCallback(async (eventId, text) => {
    if (!text.trim()) return;
    const name = auth.user?.name ?? 'Guest';
    const parts = name.split(' ');
    const optimisticId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: optimisticId,
      user: `${parts[0] ?? ''} ${parts[1]?.[0] ?? ''}.`.trim() || 'Guest',
      avatar: auth.user?.avatar ?? '',
      message: text,
      time: 'Just now',
      isMe: true
    };

    events.setChatMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), optimisticMsg]
    }));

    try {
      await api.sendEventMessage(eventId, text);
    } catch {
      ui.showToast('Failed to send message', 'error');
    }
  }, [auth.user, events, ui]);

  const createNewEvent = useCallback(async (data) => {
    try {
      const newEvent = await api.createEvent(data);
      events.setEvents(prev => [newEvent, ...prev]);
      events.setShowCreate(false);
      ui.showToast('Experience published successfully!', 'success');
    } catch (err) {
      ui.showToast(err.message || 'Failed to create event', 'error');
    }
  }, [events, ui]);

  // Parse date string like "Feb 7" to a Date object
  const parseEventDate = useCallback((dateStr) => {
    if (!dateStr) return null;
    const currentYear = new Date().getFullYear();
    const parsed = new Date(`${dateStr} ${currentYear}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const filteredEvents = events.events.filter(e => {
    // Search filter
    const matchesSearch = e.title.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(ui.searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Category filter
    const matchesCategory = ui.activeCategory === 'All' || e.category === ui.activeCategory;
    if (!matchesCategory) return false;

    // Size filter
    if (ui.sizeFilter === 'micro' && !e.isMicroMeet) return false;
    if (ui.sizeFilter === 'large' && e.isMicroMeet) return false;

    // Date range filter
    if (ui.dateRange.start || ui.dateRange.end) {
      const eventDate = parseEventDate(e.date);
      if (eventDate) {
        if (ui.dateRange.start && eventDate < ui.dateRange.start) return false;
        if (ui.dateRange.end && eventDate > ui.dateRange.end) return false;
      }
    }

    // Inclusivity tag filter
    if (ui.activeTags.length > 0) {
      const eventTags = e.tags || e.inclusivity_tags || [];
      if (!ui.activeTags.every(t => eventTags.includes(t))) return false;
    }

    return true;
  }).sort((a, b) => (a.isMicroMeet === b.isMicroMeet) ? 0 : a.isMicroMeet ? -1 : 1);

  // Match Analysis Placeholder Modal
  const MatchAnalysisModal = ({ event, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-2 p-8 rounded-[40px] max-w-sm w-full text-center border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary animate-[shimmer_2s_infinite]" />
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap size={40} className="text-primary animate-pulse" />
        </div>
        <h3 className="text-2xl font-black mb-2">High Synergy Detected</h3>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Our AI has analyzed the attendee list. You have a <span className="text-primary font-black">94% match</span> with this tribe based on your interests in <span className="text-white font-bold">{(event.matchTags?.slice(0, 2).join(' & ')) ?? 'this event'}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 rounded-xl font-black bg-primary text-white shadow-lg glow-primary hover:scale-[1.02] transition-transform">Join Tribe</button>
        </div>
      </motion.div>
    </div>
  );

  // Enhanced setActiveTab with mango effects
  const setActiveTab = useCallback((id, direction = 0) => {
    if (ui.activeTab === 'home' && id !== 'home') {
      // Exiting home tab
    } else if (ui.activeTab !== 'home' && id === 'home') {
      // Returning to home tab - trigger welcome back
      const timeAway = Date.now() - ui.mainContentRef.current?.dataset.lastHomeExitTime || 0;
      if (timeAway > 10000) {
        mango.setMessage('Welcome back!');
        mango.setCoords({ x: 0, y: 0 });
        mango.setPose('playing');
        setTimeout(() => mango.setMessage(null), 2500);
        setTimeout(() => mango.setPose('wave'), 4000);
      }
    }
    ui.setActiveTab(id, direction);
  }, [ui, mango]);

  const userRef = useRef(auth.user);
  userRef.current = auth.user;
  const handleSplashFinish = useCallback(() => {
    auth.setAppState(userRef.current ? 'app' : 'auth');
  }, [auth]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-paper font-sans overflow-hidden">
      {/* Global Toast Notifications — Always visible */}
      <AnimatePresence>
        {ui.notifications.map(n => (
          <Toast key={n.id} message={n.message} type={n.type} onClose={() => ui.removeNotification(n.id)} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {auth.appState === 'splash' && (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        )}

        {auth.appState === 'auth' && (
          <AuthScreen key="auth" onLogin={handleLogin} />
        )}

        {auth.appState === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col relative overflow-hidden pt-[env(safe-area-inset-top)]"
          >

            <div className="flex h-full">

              {/* Desktop Sidebar (Left) */}
              <Sidebar
                activeCategory={ui.activeCategory}
                onSelect={ui.setActiveCategory}
                experimentalFeatures={ui.experimentalFeatures}
              />

              {/* Main Content Area */}
              <main
                ref={ui.mainContentRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar pb-24 md:pb-0"
              >
                {/* Pull Refresh Indicator */}
                <motion.div
                  className="w-full flex justify-center bg-transparent absolute top-0 left-0 z-30 pointer-events-none overflow-hidden"
                  style={{ height: ui.pullY }}
                >
                  <div className="flex items-end h-full pb-4">
                    {ui.isRefreshing ? <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /> :
                      <span className="text-primary font-black text-xs tracking-widest opacity-80">
                        {ui.pullY > 60 ? 'RELEASE TO REFRESH' : 'PULL DOWN'}
                      </span>}
                  </div>
                </motion.div>

                <motion.div style={{ translateY: ui.pullY }} className="min-h-full">
                  <AnimatePresence mode="wait">
                    {ui.activeTab === 'home' && (
                      ui.contentReady ? (
                      <motion.div
                        key="home"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="p-5 md:p-10 space-y-10 max-w-7xl mx-auto"
                      >
                        <motion.header variants={itemVariants} className="flex justify-between items-center mb-8">
                          <div>
                            <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest mb-1">Wednesday, 4 Feb</p>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-primary">
                              Good Afternoon<span className="text-accent">,</span><br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm filter animate-text-gradient">{auth.user?.name?.split(' ')[0]}</span><span className="text-accent">.</span>
                            </h1>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="relative group cursor-pointer"
                            onClick={() => setActiveTab('profile')}
                          >
                            <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img src={auth.user?.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-2xl relative z-10" alt="Profile" />
                            {ui.experimentalFeatures && ui.proEnabled && <div className="absolute -bottom-1 -right-1 z-20 bg-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white shadow-lg border border-white/20">PRO</div>}
                          </motion.button>
                        </motion.header>

                        {/* Video Wall */}
                        <VideoWall
                          userName={auth.user?.name?.split(' ')[0] || 'You'}
                          onEventSelect={(id) => {
                            const event = events.events.find(e => e.id === id);
                            if (event) events.setSelectedEvent(event);
                          }} />

                        {/* Curated Micro-Meets */}
                        <div className="max-w-[100vw] -mx-5 px-5 md:mx-0 md:px-0">
                          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30"><Zap size={16} className="text-amber-500" /></div>
                              <h2 className="text-xl font-bold tracking-tight text-primary">Curated Micro-Meets<span className="text-accent">.</span></h2>
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                              <button
                                onClick={() => {
                                  const el = document.getElementById('micro-meets-scroll');
                                  if (el) el.scrollBy({ left: -316, behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
                              >
                                <ChevronLeft size={16} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => {
                                  const el = document.getElementById('micro-meets-scroll');
                                  if (el) el.scrollBy({ left: 316, behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
                              >
                                <ChevronRight size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </motion.div>

                          <motion.div
                            id="micro-meets-scroll"
                            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x md:snap-none no-scrollbar"
                            variants={containerVariants}
                          >
                            {events.events.filter(e => e.isMicroMeet || e.is_micro_meet).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).map(meet => (
                              <div key={meet.id} className="snap-center shrink-0">
                                <MicroMeetCard meet={meet} onClick={events.setSelectedEvent} />
                              </div>
                            ))}
                            {events.events.filter(e => e.isMicroMeet || e.is_micro_meet).length === 0 && (
                              <div className="text-center text-secondary/40 text-sm font-medium py-8 w-full">No micro-meets available yet</div>
                            )}
                          </motion.div>
                        </div>

                        {/* Recommended Events - sorted by relevance to user preferences */}
                        <motion.section variants={itemVariants}>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Heart size={16} className="text-primary" /></div>
                              <h2 className="text-xl font-bold tracking-tight text-primary">Recommended for You<span className="text-accent">.</span></h2>
                            </div>
                            <button
                              onClick={() => {
                                ui.setRecommendedLimit(3);
                                fetchAllData().then(() => ui.showToast('Recommendations refreshed', 'success'));
                              }}
                              className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
                              title="Refresh recommendations"
                            >
                              <RefreshCw size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                          {(() => {
                            const recommended = filteredEvents.filter(e => !e.isMicroMeet).sort((a, b) => {
                              const interests = ui.userPreferences?.interests || auth.user?.interests || [];
                              const scoreEvent = (ev) => {
                                let score = 0;
                                if (interests.some(i => ev.category?.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ev.category?.toLowerCase()?.split(' ')[0]))) score += 3;
                                if (events.joinedEvents.includes(ev.id)) score += 2;
                                if (ev.attendees > 20) score += 1;
                                return score;
                              };
                              return scoreEvent(b) - scoreEvent(a);
                            });
                            const visible = recommended.slice(0, ui.recommendedLimit);
                            const hasMore = ui.recommendedLimit < recommended.length;
                            return (
                              <>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                  {visible.map(event => (
                                    <EventCard key={event.id} event={event} isJoined={events.joinedEvents.includes(event.id)} onClick={events.setSelectedEvent} />
                                  ))}
                                </div>
                                {hasMore && (
                                  <div className="flex justify-center mt-4">
                                    <div className="flex items-center gap-2 text-secondary/40 text-xs font-bold animate-pulse">
                                      <div className="w-4 h-4 border-2 border-secondary/30 border-t-primary rounded-full animate-spin" />
                                      Scroll for more
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </motion.section>
                      </motion.div>
                      ) : ( <HomeSkeleton /> )
                    )}

                    {ui.activeTab === 'hub' && (
                      ui.contentReady ? (
                      <motion.div
                        key="hub"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
                      >
                        <header className="mb-10">
                          <h1 className="text-4xl font-black tracking-tighter mb-2 text-primary">Community Hub<span className="text-accent">.</span></h1>
                          <p className="text-gray-400 font-medium">Your tribes and local buzz.</p>
                        </header>

                        <div className="grid md:grid-cols-3 gap-8">
                          {/* Live Feed - Span 2 cols on Desktop */}
                          <div className="md:col-span-2 space-y-4">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Live Pulse<span className="text-accent">.</span></h3>
                            {feed.feedPosts.length > 0 ? feed.feedPosts.map(post => (
                              <FeedItem key={post.id} post={{
                                ...post,
                                user: post.user_name || post.user,
                                avatar: post.user_avatar || post.avatar,
                                community: post.community_name || post.community,
                                communityId: post.community_id || post.communityId,
                                time: post.created_at ? new Date(post.created_at).toLocaleDateString() : post.time,
                                likes: Object.values(post.reactions || {}).reduce((a, b) => a + b, 0),
                                comments: 0,
                              }} currentUser={{ name: auth.user?.name ?? 'Guest', avatar: auth.user?.avatar ?? '' }} onOpenProfile={feed.setSelectedUserProfile} />
                            )) : (
                              <div className="text-center text-secondary/40 text-sm font-medium py-8">No posts yet. Be the first!</div>
                            )}
                          </div>

                          {/* Local Tribes - Span 1 col (Sidebar style on desktop) */}
                          <div>
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Your Tribes<span className="text-accent">.</span></h3>
                            <div className="space-y-4">
                              {communities.communities.filter(c => communities.userTribes.includes(c.id)).map(comm => (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={comm.id}
                                  onClick={() => communities.setSelectedTribe(comm)}
                                  className="premium-card p-4 flex items-center gap-4 group cursor-pointer"
                                >
                                  <div className="w-12 h-12 rounded-[18px] bg-secondary/10 flex items-center justify-center text-2xl border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                                    {comm.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <h4 className="font-bold text-sm truncate">{comm.name}</h4>
                                    </div>
                                    <p className="text-[11px] text-secondary/60 truncate">{comm.members || 0} members</p>
                                  </div>
                                </motion.div>
                              ))}
                              <button
                                onClick={() => communities.setShowTribeDiscovery(true)}
                                className="w-full py-4 border border-dashed border-primary/30 rounded-[20px] text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary/50 transition-all uppercase tracking-widest"
                              >
                                + Find New Tribe
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      ) : ( <HubSkeleton /> )
                    )}

                    {ui.activeTab === 'explore' && (
                      ui.contentReady ? (
                      <motion.div
                        key="explore"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
                      >
                        <header className="mb-8">
                          <div className="flex items-center justify-between mb-6">
                            <h1 className="text-4xl font-black tracking-tighter text-primary">Explore<span className="text-accent">.</span></h1>
                            <button
                              onClick={() => ui.setShowReels(true)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs hover:bg-primary/20 transition-all uppercase tracking-widest"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><line x1="10" y1="2" x2="10" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m2 2 8 10M22 2l-8 10"/></svg>
                              Reels
                            </button>
                          </div>

                          {/* Filters */}
                          <div className="sticky top-0 z-40 bg-secondary/10 backdrop-blur-xl py-4 -mx-5 px-5 md:mx-0 md:px-0 md:relative md:bg-transparent md:backdrop-blur-none border-b border-secondary/10 md:border-none">
                            <ExploreFilters
                              searchQuery={ui.searchQuery}
                              setSearchQuery={ui.setSearchQuery}
                              activeCategory={ui.activeCategory}
                              setActiveCategory={ui.setActiveCategory}
                              sizeFilter={ui.sizeFilter}
                              setSizeFilter={ui.setSizeFilter}
                              dateRange={ui.dateRange}
                              setDateRange={ui.setDateRange}
                              thisWeekActive={ui.thisWeekActive}
                              setThisWeekActive={ui.setThisWeekActive}
                              activeTags={ui.activeTags}
                              setActiveTags={ui.setActiveTags}
                            />
                          </div>
                        </header>

                        {/* Events Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {filteredEvents.slice(0, ui.exploreLimit).map(event => (
                            <EventCard key={event.id} event={event} isJoined={events.joinedEvents.includes(event.id)} onClick={events.setSelectedEvent} />
                          ))}
                        </div>
                        {ui.exploreLimit < filteredEvents.length && (
                          <div className="flex justify-center mt-6">
                            <div className="flex items-center gap-2 text-secondary/40 text-xs font-bold animate-pulse">
                              <div className="w-4 h-4 border-2 border-secondary/30 border-t-primary rounded-full animate-spin" />
                              Scroll for more
                            </div>
                          </div>
                        )}
                      </motion.div>
                      ) : ( <ExploreSkeleton /> )
                    )}

                    {ui.activeTab === 'profile' && (
                      ui.contentReady ? (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
                      >
                        {ui.profileSubTab === 'settings' ? (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-6"
                          >
                            {/* Back button */}
                            <button
                              onClick={() => ui.setProfileSubTab('profile')}
                              className="flex items-center gap-2 text-secondary/60 hover:text-secondary font-bold text-sm mb-2 transition-colors"
                            >
                              <ArrowLeft size={18} />
                              Back to Profile
                            </button>
                            <div className="premium-card rounded-[32px] overflow-hidden border border-secondary/10">
                              <div className="p-4 border-b border-secondary/10">
                                <h2 className="font-black text-secondary text-lg">Experimental features</h2>
                                <p className="text-xs text-secondary/60 mt-1">Try upcoming features early.</p>
                              </div>
                              <div className="p-4 flex items-center justify-between">
                                <span className="font-bold text-secondary">Enable experimental features</span>
                                <button
                                  role="switch"
                                  aria-checked={ui.experimentalFeatures}
                                  onClick={() => ui.setExperimentalFeatures(!ui.experimentalFeatures)}
                                  className={`relative w-12 h-7 rounded-full transition-colors ${ui.experimentalFeatures ? 'bg-primary' : 'bg-secondary/20'}`}
                                >
                                  <motion.div
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                                    animate={{ x: ui.experimentalFeatures ? 24 : 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    style={{ left: 4 }}
                                  />
                                </button>
                              </div>
                              {ui.experimentalFeatures && (
                                <div className="border-t border-secondary/10 p-4 space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => ui.setShowGroupChats(true)}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
                                  >
                                    <MessageCircle className="text-secondary" size={20} />
                                    <span className="font-bold text-secondary">Group Chats</span>
                                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-secondary/50">WhatsApp</span>
                                  </button>
                                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                                    <ShieldCheck className="text-green-500" size={20} />
                                    <span className="font-bold text-secondary">Safe Mode</span>
                                    <span className="ml-auto text-[10px] font-black text-green-500 uppercase tracking-wider">On</span>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                                    <Zap className="text-accent" size={20} />
                                    <span className="font-bold text-secondary">Smart Match</span>
                                    <span className="ml-auto text-[10px] font-black text-accent uppercase tracking-wider">94%</span>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                                    <Mail className="text-secondary" size={20} />
                                    <span className="font-bold text-secondary">Invitations</span>
                                    <span className="ml-auto text-[10px] font-black text-secondary uppercase tracking-wider">3 pending</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                        <>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
                          {/* Header with avatar and WarmthScore side by side on desktop */}
                          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                            {/* Avatar Section */}
                            <div className="text-center md:text-left">
                              <div className="relative inline-block group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl mx-auto md:mx-0 mb-4 relative z-10 transition-transform group-hover:scale-105">
                                  <img src={auth.user?.avatar} className="w-full h-full object-cover" alt="Profile" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white drop-shadow-md" size={32} />
                                  </div>
                                </div>
                                <div className="absolute bottom-3 right-0 md:right-auto md:left-24 z-30 bg-white text-primary p-2 rounded-full shadow-lg border-2 border-primary group-hover:scale-110 transition-transform">
                                  <Camera size={14} className="stroke-[3px]" />
                                </div>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleAvatarUpload}
                                />
                                <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 transform scale-150" />
                                {ui.experimentalFeatures && ui.proEnabled && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1"><Crown size={10} /> PRO</div>}
                              </div>
                              <h1 className="text-3xl font-black tracking-tighter mb-2 text-primary">{auth.user?.name}<span className="text-accent">.</span></h1>
                              {auth.user?.selectedTitle && (
                                <span className="inline-block px-3 py-1 mb-2 bg-accent/10 rounded-full border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">{auth.user.selectedTitle}</span>
                              )}
                              <p className="text-sm text-gray-400 font-medium max-w-xs leading-relaxed mb-3">{auth.user?.bio}</p>
                              <div className="flex items-center justify-center md:justify-start gap-5">
                                <div className="text-center">
                                  <span className="text-lg font-black text-secondary">{auth.user?.followers ?? 0}</span>
                                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Followers</p>
                                </div>
                                <div className="w-px h-6 bg-secondary/10" />
                                <div className="text-center">
                                  <span className="text-lg font-black text-secondary">{auth.user?.following ?? 0}</span>
                                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Following</p>
                                </div>
                              </div>
                            </div>

                            {/* Level Circle */}
                            <div className="flex-1 flex justify-center md:justify-end">
                              {(() => {
                                const cl = XP_LEVELS.filter(l => l.xpRequired <= ui.userXP).pop() || XP_LEVELS[0];
                                const nl = XP_LEVELS.find(l => l.xpRequired > ui.userXP) || XP_LEVELS[XP_LEVELS.length - 1];
                                const xpIn = ui.userXP - cl.xpRequired;
                                const xpNeed = nl.xpRequired - cl.xpRequired;
                                const prog = xpNeed > 0 ? Math.min((xpIn / xpNeed) * 100, 100) : 100;
                                return <WarmthScore level={cl.level} levelProgress={prog} levelIcon={cl.icon} streak={5} />;
                              })()}
                            </div>
                          </motion.div>

                          {/* XP & Level Progress — tap to see full level roadmap */}
                          <motion.div
                            variants={itemVariants}
                            className="premium-card p-6 overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform"
                            onClick={() => ui.setShowLevelDetail(true)}
                          >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                            {(() => {
                              const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= ui.userXP).pop() || XP_LEVELS[0];
                              const nextLevel = XP_LEVELS.find(l => l.xpRequired > ui.userXP) || XP_LEVELS[XP_LEVELS.length - 1];
                              const xpInLevel = ui.userXP - currentLevel.xpRequired;
                              const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired;
                              const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
                              return (
                                <>
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className="text-3xl">{currentLevel.icon}</span>
                                      <div>
                                        <h3 className="font-black text-secondary text-lg">Level {currentLevel.level}</h3>
                                        <p className={`text-xs font-bold ${currentLevel.color}`}>{currentLevel.title}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-2xl font-black text-accent">{ui.userXP}</span>
                                      <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Total XP</p>
                                      <p className="text-[8px] font-bold text-primary/50 uppercase tracking-widest mt-0.5">Tap for roadmap</p>
                                    </div>
                                  </div>
                                  <div className="w-full h-3 bg-secondary/10 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-secondary/40 font-bold">{xpInLevel} / {xpNeeded} XP to {nextLevel.title}</p>
                                </>
                              );
                            })()}
                          </motion.div>

                          {/* Game-Like Stats */}
                          <motion.div variants={itemVariants} className="premium-card p-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Your Stats<span className="text-accent">.</span></h3>
                            <div className="space-y-3">
                              {PROFILE_STATS.map(stat => {
                                const value = auth.user?.stats?.[stat.key] ?? Math.floor(Math.random() * 7 + 1);
                                const percentage = (value / stat.maxLevel) * 100;
                                return (
                                  <div key={stat.key} className="flex items-center gap-3">
                                    <span className="text-lg w-8 text-center">{stat.icon}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-secondary">{stat.label}</span>
                                        <span className="text-[10px] font-black text-secondary/40">{value}/{stat.maxLevel}</span>
                                      </div>
                                      <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percentage}%` }}
                                          transition={{ duration: 0.8, delay: 0.1 }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>

                          {/* Achievements — only show unlocked ones */}
                          {ui.userUnlockedTitles.length > 0 && (
                            <motion.div variants={itemVariants} className="premium-card p-6">
                              <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Achievements<span className="text-accent">.</span></h3>
                              <div className="grid grid-cols-2 gap-3">
                                {UNLOCKABLE_TITLES.filter(t => ui.userUnlockedTitles.includes(t.id)).map(title => (
                                  <div key={title.id} className="p-4 rounded-2xl border bg-accent/5 border-accent/20">
                                    <span className="text-2xl">{title.icon}</span>
                                    <h4 className="text-xs font-bold mt-2 text-secondary">{title.title}</h4>
                                    <p className="text-[9px] text-secondary/40 mt-0.5">{title.description}</p>
                                    <span className="inline-block mt-2 text-[8px] font-black text-accent uppercase tracking-widest">+{title.xpReward} XP</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* Connections Card */}
                          <motion.div
                            variants={itemVariants}
                            className="premium-card p-6 flex items-center gap-6 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden group"
                          >
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Users className="text-primary" size={28} />
                            </div>
                            <div>
                              <span className="text-3xl font-black text-secondary">{events.joinedEvents.length}</span>
                              <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60 mt-1">Connections</p>
                            </div>
                          </motion.div>



                          {ui.experimentalFeatures && !ui.proEnabled && (
                            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-secondary/10 text-center">
                              <p className="text-xs text-secondary/60 mb-6 px-4 font-medium leading-relaxed italic">Unlock advanced matchmaking and event analytics for £12.99/mo</p>
                              <button
                                onClick={() => ui.setShowProModal(true)}
                                className="w-full bg-gradient-to-r from-primary to-accent py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl glow-primary transition-all active:scale-95 text-white"
                              >
                                Go Pro
                              </button>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="premium-card overflow-hidden mt-6 rounded-[32px] bg-secondary/5 border border-secondary/10">
                          {[
                            { label: 'My Bookings', icon: Check, action: () => ui.setShowBookings(true), badge: events.joinedEvents.length },
                            { label: 'Saved Experiences', icon: Heart, action: () => ui.setShowSaved(true), badge: events.savedEvents.length },
                            ...(ui.experimentalFeatures ? [{ label: 'Socialise Pass', icon: Zap, action: () => ui.setShowProModal(true) }] : []),
                            { label: 'Settings', icon: Settings, action: () => ui.setProfileSubTab('settings') },
                            { label: 'Help & Privacy', icon: ShieldCheck, action: () => ui.setShowHelp(true) }
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full flex items-center justify-between p-6 border-b border-secondary/10 last:border-0 hover:bg-secondary/5 transition-all active:pl-8"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/10">
                                  <item.icon size={20} className="text-primary" />
                                </div>
                                <span className="font-extrabold text-[15px] tracking-tight text-secondary">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.badge > 0 && (
                                  <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                                <ChevronRight className="text-secondary/40" size={20} />
                              </div>
                            </button>
                          ))}
                        </motion.div>

                        <motion.button
                          variants={itemVariants}
                          onClick={handleLogout}
                          className="w-full p-6 mt-6 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
                        >
                          <LogOut size={18} />
                          Log Out
                        </motion.button>

                        <motion.p
                          variants={itemVariants}
                          className="text-center text-[11px] tracking-widest mt-6 pb-2"
                          style={{ color: 'var(--muted)', opacity: 0.45 }}
                        >
                          v{APP_VERSION}
                        </motion.p>
                        </>
                        )}
                      </motion.div>
                      ) : ( <ProfileSkeleton /> )
                    )}
                  </AnimatePresence>
                </motion.div>
              </main>
            </div>

            {/* Floating Navigation - Mobile Only */}
            <div className="md:hidden">
              <BottomNav activeTab={ui.activeTab} setActiveTab={ui.setActiveTab} onCreateClick={() => events.setShowCreate(true)} />
            </div>

            {/* Modals & Sheets */}
            <AnimatePresence>
              {events.selectedEvent && (
                <EventDetailSheet
                  key="event-detail"
                  event={events.selectedEvent}
                  isJoined={events.joinedEvents.includes(events.selectedEvent.id)}
                  onJoin={() => {
                    if (events.selectedEvent.isMicroMeet && !events.joinedEvents.includes(events.selectedEvent.id)) {
                      events.setShowMatchModal(events.selectedEvent);
                    } else {
                      handleJoin(events.selectedEvent.id);
                    }
                  }}
                  onClose={() => events.setSelectedEvent(null)}
                  messages={events.chatMessages[events.selectedEvent.id] || []}
                  onSendMessage={(text) => sendMessage(events.selectedEvent.id, text)}
                  onOpenProfile={feed.setSelectedUserProfile}
                />
              )}
              {events.showCreate && <CreateEventModal key="create-event" onClose={() => events.setShowCreate(false)} onSubmit={createNewEvent} />}
              {events.showMatchModal && (
                <MatchAnalysisModal
                  key="match-modal"
                  event={events.showMatchModal}
                  onConfirm={() => {
                    handleJoin(events.showMatchModal.id);
                    events.setShowMatchModal(null);
                  }}
                  onCancel={() => events.setShowMatchModal(null)}
                />
              )}
              {/* Tribe Modals */}
              <TribeSheet
                key="tribe-sheet"
                tribe={communities.selectedTribe}
                isOpen={!!communities.selectedTribe}
                onClose={() => communities.setSelectedTribe(null)}
                onLeave={communities.handleLeaveTribe}
              />
              <TribeDiscovery
                key="tribe-discovery"
                isOpen={communities.showTribeDiscovery}
                onClose={() => communities.setShowTribeDiscovery(false)}
                onJoin={communities.handleJoinTribe}
                joinedTribes={communities.userTribes}
              />
              {/* Level Detail Modal */}
              {ui.showLevelDetail && (
                <motion.div
                  key="level-detail"
                  className="fixed inset-0 z-[200] flex items-end justify-center bg-secondary/60 backdrop-blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => ui.setShowLevelDetail(false)}
                >
                  <motion.div
                    className="w-full max-w-lg bg-paper rounded-t-[40px] p-6 pb-12 max-h-[85vh] overflow-y-auto no-scrollbar border-t border-secondary/10"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-secondary mb-1">Level Roadmap<span className="text-accent">.</span></h2>
                    <p className="text-xs text-secondary/50 mb-6 font-medium">Your progress and upcoming unlocks</p>

                    {(() => {
                      const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= ui.userXP).pop() || XP_LEVELS[0];
                      return (
                        <div className="space-y-3">
                          {XP_LEVELS.map((lvl, i) => {
                            const isCurrentLevel = lvl.level === currentLevel.level;
                            const isUnlocked = ui.userXP >= lvl.xpRequired;
                            const nextLvl = XP_LEVELS[i + 1];
                            const xpIn = isCurrentLevel ? ui.userXP - lvl.xpRequired : 0;
                            const xpNeed = nextLvl ? nextLvl.xpRequired - lvl.xpRequired : 0;
                            const prog = isCurrentLevel && xpNeed > 0 ? Math.min((xpIn / xpNeed) * 100, 100) : 0;
                            return (
                              <div
                                key={lvl.level}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isCurrentLevel
                                    ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                                    : isUnlocked
                                    ? 'bg-accent/5 border-accent/20'
                                    : 'bg-secondary/5 border-secondary/10 opacity-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">{lvl.icon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span className="font-black text-secondary text-sm">Level {lvl.level}</span>
                                        <span className={`ml-2 text-xs font-bold ${lvl.color}`}>{lvl.title}</span>
                                      </div>
                                      {isCurrentLevel && (
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Current</span>
                                      )}
                                      {!isUnlocked && (
                                        <div className="flex items-center gap-1 text-secondary/40">
                                          <Lock size={12} />
                                          <span className="text-[9px] font-bold">{lvl.xpRequired} XP</span>
                                        </div>
                                      )}
                                    </div>
                                    {isCurrentLevel && nextLvl && (
                                      <>
                                        <div className="w-full h-1.5 bg-secondary/10 rounded-full mt-2 overflow-hidden">
                                          <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${prog}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                          />
                                        </div>
                                        <p className="text-[9px] text-secondary/40 mt-1">{xpIn} / {xpNeed} XP to {nextLvl.title}</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              )}
              {/* Profile Modals */}
              <MyBookingsSheet
                key="bookings"
                isOpen={ui.showBookings}
                onClose={() => ui.setShowBookings(false)}
                bookings={events.events.filter(e => events.joinedEvents.includes(e.id))}
                onCancel={(id) => {
                  events.setJoinedEvents(events.joinedEvents.filter(eid => eid !== id));
                  ui.showToast('Booking cancelled', 'info');
                }}
              />
              <SavedEventsSheet
                key="saved"
                isOpen={ui.showSaved}
                onClose={() => ui.setShowSaved(false)}
                savedEvents={events.events.filter(e => events.savedEvents.includes(e.id))}
                onRemove={async (id) => {
                  events.setSavedEvents(prev => prev.filter(eid => eid !== id));
                  ui.showToast('Removed from saved', 'info');
                  try {
                    await api.unsaveEvent(id);
                  } catch (err) {
                    events.setSavedEvents(prev => [...prev, id]);
                    ui.showToast(err.message, 'error');
                  }
                }}
                onSelect={(event) => {
                  ui.setShowSaved(false);
                  events.setSelectedEvent(event);
                }}
              />
              <ProUpgradeModal
                key="pro"
                isOpen={ui.showProModal}
                onClose={() => ui.setShowProModal(false)}
                onUpgrade={() => {
                  ui.setProEnabled(true);
                  ui.setShowConfetti(true);
                  ui.showToast('Welcome to Socialise Pro! 🎉', 'success');
                }}
              />
              <HelpSheet
                key="help"
                isOpen={ui.showHelp}
                onClose={() => ui.setShowHelp(false)}
                onDeleteAccount={async () => {
                  try {
                    await api.deleteAccount();
                    ui.setShowHelp(false);
                    // Clear all app state
                    events.setEvents([]);
                    events.setJoinedEvents([]);
                    events.setSavedEvents([]);
                    communities.setCommunities([]);
                    feed.setFeedPosts([]);
                    // Clear all localStorage data
                    localStorage.removeItem('socialise_pro');
                    localStorage.removeItem('socialise_tribes');
                    localStorage.removeItem('socialise_onboarding_shown');
                    localStorage.removeItem('socialise_preferences');
                    localStorage.removeItem('socialise_experimental');
                    localStorage.removeItem('socialise_xp');
                    localStorage.removeItem('socialise_unlocked_titles');
                    // Log out (clears user + token from localStorage)
                    auth.handleLogout();
                    ui.showToast('Account deleted successfully', 'info');
                  } catch (err) {
                    ui.showToast(err.message || 'Failed to delete account', 'error');
                  }
                }}
              />
              <GroupChatsSheet
                isOpen={ui.showGroupChats}
                onClose={() => ui.setShowGroupChats(false)}
                joinedCommunities={communities.communities.filter((c) => communities.userTribes.includes(c.id))}
              />
              <UserProfileSheet
                key="user-profile"
                profile={feed.selectedUserProfile}
                isOpen={!!feed.selectedUserProfile}
                onClose={() => feed.setSelectedUserProfile(null)}
                onMessage={(p) => ui.showToast(`Opening chat with ${p.name}…`, 'info')}
              />
              <LevelUpModal
                isOpen={ui.showLevelUp}
                onClose={() => ui.setShowLevelUp(false)}
                newLevel={ui.levelUpData?.newLevel}
                unlockedTitle={ui.levelUpData?.unlockedTitle}
              />
              {ui.showReels && (
                <EventReels
                  events={filteredEvents}
                  onClose={() => ui.setShowReels(false)}
                  onSelectEvent={(event) => {
                    ui.setShowReels(false);
                    events.setSelectedEvent(event);
                  }}
                />
              )}
              <AvatarCropModal
                imageUrl={ui.avatarCropImage}
                isOpen={!!ui.avatarCropImage}
                onSave={handleAvatarCropSave}
                onCancel={handleAvatarCropCancel}
              />
            </AnimatePresence>

            {/* Onboarding Flow */}
            <AnimatePresence>
              {auth.user && !ui.showOnboarding && !ui.userPreferences && (
                <OnboardingFlow
                  userName={auth.user?.name ?? 'there'}
                  onComplete={(prefs) => {
                    ui.setUserPreferences(prefs);
                    ui.setShowOnboarding(true);
                    ui.showToast(`Welcome, ${auth.user?.name?.split(' ')[0] ?? 'there'}! Let's find your tribe.`, 'success');
                  }}
                />
              )}
            </AnimatePresence>

            {/* Delight Moments */}
            <Confetti active={ui.showConfetti} onComplete={() => ui.setShowConfetti(false)} />
            <RealtimePing
              isVisible={ui.realtimePing.isVisible}
              name={ui.realtimePing.name}
              avatar={ui.realtimePing.avatar}
              action={ui.realtimePing.action}
              onClose={() => ui.setRealtimePing(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Mango Assistant - Global Persistent Cat */}
            {ui.activeTab === 'home' && <MangoAssistant />}

            <IOSInstallPrompt />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mango.isChatOpen && <MangoChat user={auth.user} events={events.events} />}
      </AnimatePresence>
    </div>
  );
}

export default App;

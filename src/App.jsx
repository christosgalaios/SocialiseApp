import { useState, useEffect, useRef, useCallback } from 'react';
import { version as APP_VERSION } from '../package.json';
import {
  BarChart3, Mail, ShieldCheck, Zap, Check, Heart, User, Crown, ChevronRight, ChevronLeft, LogOut, Camera, Users, Settings, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import './index.css';

// --- DATA & CONSTANTS ---
import {
  CATEGORIES,
  INITIAL_EVENTS,
  INITIAL_MICRO_MEETS,
  COMMUNITIES,
  SUGGESTED_COMMUNITIES,
  INITIAL_MESSAGES,
  FEED_POSTS,
  DEMO_USER,
  XP_LEVELS,
  UNLOCKABLE_TITLES,
  PROFILE_STATS
} from './data/mockData';

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

// --- STORAGE HELPER ---
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue != null) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        // Corrupt storage — discard and fall through to initial value
        localStorage.removeItem(key);
      }
    }
    if (typeof initialValue === 'function') {
      return initialValue();
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// --- MAIN APP COMPONENT ---
function App() {
  const [appState, setAppState] = useState('splash');
  const [activeTab, setActiveTabState] = useState('home');
  // eslint-disable-next-line no-unused-vars
  const [slideDir, setSlideDir] = useState(0);
  const mainContentRef = useRef(null);
  const lastHomeExitRef = useRef(0);

    const setActiveTab = (id, direction = 0) => {
    if (activeTab === 'home' && id !== 'home') {
      lastHomeExitRef.current = Date.now();
    } else if (activeTab !== 'home' && id === 'home') {
      const timeAway = Date.now() - lastHomeExitRef.current;
      if (timeAway > 10000) {
        mango.setMessage('Welcome back!');
        mango.setCoords({ x: 0, y: 0 });
        mango.setPose('playing');
        setTimeout(() => mango.setMessage(null), 2500);
        setTimeout(() => mango.setPose('wave'), 4000);
      }
    }
    setSlideDir(direction);
    setActiveTabState(id);
    // Scroll to top when tab changes or is re-clicked
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [events, setEvents] = useState([...INITIAL_EVENTS, ...INITIAL_MICRO_MEETS]);
  const [joinedEvents, setJoinedEvents] = useLocalStorage('socialise_joined', []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [chatMessages, setChatMessages] = useLocalStorage('socialise_chats', INITIAL_MESSAGES);
  const [proEnabled, setProEnabled] = useLocalStorage('socialise_pro', false);

  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showMatchModal, setShowMatchModal] = useState(null);

  // Explore Filter State
  const [sizeFilter, setSizeFilter] = useState('all'); // 'all' | 'micro' | 'large'
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [thisWeekActive, setThisWeekActive] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const [showReels, setShowReels] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [userXP, setUserXP] = useLocalStorage('socialise_xp', 750);
  const [userUnlockedTitles, setUserUnlockedTitles] = useLocalStorage('socialise_unlocked_titles', ['first-event', 'social-butterfly', 'tribe-leader', 'conversation-starter', 'night-owl']);

  // Delight moments state
  const [showConfetti, setShowConfetti] = useState(false);
  const [realtimePing, setRealtimePing] = useState({ isVisible: false, name: '', avatar: '', action: '' });
  const mango = useMango();

  // Hub State
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [showTribeDiscovery, setShowTribeDiscovery] = useState(false);
  const [userTribes, setUserTribes] = useLocalStorage('socialise_tribes', COMMUNITIES.map(c => c.id));

  // Profile Modals State
  const [showBookings, setShowBookings] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showGroupChats, setShowGroupChats] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [savedEvents, setSavedEvents] = useLocalStorage('socialise_saved', []);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useLocalStorage('socialise_onboarding_shown', false);
  const [userPreferences, setUserPreferences] = useLocalStorage('socialise_preferences', null);

  // Other user profile (feed/comment/chat click)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  // Avatar crop modal
  const [avatarCropImage, setAvatarCropImage] = useState(null);

  // Profile sub-tab: Profile | Settings
  const [profileSubTab, setProfileSubTab] = useState('profile');
  const [experimentalFeatures, setExperimentalFeatures] = useLocalStorage('socialise_experimental', false);

  // Content loading: show skeletons then reveal (big-platform style)
  const [contentReady, setContentReady] = useState(false);
  useEffect(() => {
    if (appState !== 'app') {
      setContentReady(false);
      return;
    }
    const t = setTimeout(() => setContentReady(true), 600);
    return () => clearTimeout(t);
  }, [appState]);

  // Authenticated User State
  const [user, setUser] = useLocalStorage('socialise_user', null);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };



  const handleLogin = async (type) => {
    try {
      if (type === 'demo') {
        const response = await api.login('ben@demo.com', 'password');
        setUser(response.user);
        localStorage.setItem('socialise_token', response.token);
        showToast('Logged in as Ben Barnes (Demo)', 'success');
        setAppState('app');
      } else {
        // Simulated Google login
        showToast('Google login simulated', 'success');
        setUser(DEMO_USER);
        setAppState('app');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('socialise_token');
    setAppState('auth');
    showToast('Signed out successfully', 'info');
  }, []);

  // Tribe handlers
  const handleJoinTribe = (tribe) => {
    if (!userTribes.includes(tribe.id)) {
      setUserTribes([...userTribes, tribe.id]);
      showToast(`Joined ${tribe.name}!`, 'success');
    }
  };

  const handleLeaveTribe = (tribeId) => {
    setUserTribes(userTribes.filter(id => id !== tribeId));
    setSelectedTribe(null);
    const tribe = COMMUNITIES.find(c => c.id === tribeId);
    showToast(`Left ${tribe?.name || 'tribe'}`, 'info');
  };

  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const hasVibratedRef = useRef(false);

  const handleTouchStart = (e) => {
    if (mainContentRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      hasVibratedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    // Only track if we started at top
    if (mainContentRef.current?.scrollTop === 0 && touchStartY.current > 0) {
      const deltaY = touchY - touchStartY.current;
      if (deltaY > 0 && !isRefreshing) {
        const newPullY = Math.min(deltaY * 0.4, 150);
        setPullY(newPullY);

        // Haptic feedback when crossing threshold
        if (newPullY > 60 && !hasVibratedRef.current) {
          try {
            if (window.navigator?.vibrate) window.navigator.vibrate(20);
            hasVibratedRef.current = true;
          } catch (e) { /* ignore */ }
        } else if (newPullY < 50 && hasVibratedRef.current) {
          // Reset if user pulls back up significantly
          hasVibratedRef.current = false;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = 0; // Reset start
    if (pullY > 60) {
      setIsRefreshing(true);
      setPullY(80); // Snap 
      try {
        if (window.navigator?.vibrate) window.navigator.vibrate(50);
      } catch (e) { /* ignore */ }

      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
        showToast('Feed refreshed', 'success');
        setEvents(prev => [...prev].sort(() => Math.random() - 0.5));
      }, 2000);
    } else {
      setPullY(0);
    }
  };



  const fileInputRef = useRef(null);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarCropImage(imageUrl);
    }
    // Reset so the same file can be re-selected
    event.target.value = '';
  };

  const handleAvatarCropSave = (croppedDataUrl) => {
    setUser(prev => ({ ...prev, avatar: croppedDataUrl }));
    setAvatarCropImage(null);
    showToast('Profile photo updated!', 'success');
  };

  const handleAvatarCropCancel = () => {
    if (avatarCropImage) URL.revokeObjectURL(avatarCropImage);
    setAvatarCropImage(null);
  };

  // Persistent Session Check - run once on mount so splash can finish without effect re-runs
  const handleLogoutRef = useRef(handleLogout);
  handleLogoutRef.current = handleLogout;
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const token = localStorage.getItem('socialise_token');
      if (!token) return;
      try {
        const userData = await api.getMe(token);
        if (!cancelled) setUser(userData);
      } catch (err) {
        console.error('Session invalid', err);
        if (!cancelled) handleLogoutRef.current();
      }
    };
    const t = setTimeout(checkSession, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // Dark Mode Application


  // Mock API Interactions
  const handleJoin = (id) => {
    if (joinedEvents.includes(id)) {
      setJoinedEvents(prev => prev.filter(e => e !== id));
      showToast('You left the event.', 'info');
    } else {
      setJoinedEvents(prev => [...prev, id]);
      showToast('You\'re going! Added to your calendar.', 'success');

      // Award XP
      const xpGain = 50;
      const newXP = userXP + xpGain;
      const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= userXP).pop();
      const newLevel = XP_LEVELS.filter(l => l.xpRequired <= newXP).pop();
      setUserXP(newXP);
      if (newLevel && currentLevel && newLevel.level > currentLevel.level) {
        setTimeout(() => {
          setLevelUpData({ newLevel, unlockedTitle: null });
          setShowLevelUp(true);
        }, 1500);
      }

      // Trigger delight moments!
      setShowConfetti(true);
      mango.celebrate("You're in! 🎉");

      // Simulate someone else joining too (realtime ping)
      setTimeout(() => {
        const randomNames = ['Sarah', 'Marcus', 'Priya', 'Alex', 'Jordan'];
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        setRealtimePing({
          isVisible: true,
          name: randomName,
          avatar: `https://i.pravatar.cc/100?u=${randomName}`,
          action: 'also joined!'
        });
      }, 2000);
    }
  };

  const sendMessage = (eventId, text) => {
    if (!text.trim()) return;
    const name = user?.name ?? 'Guest';
    const parts = name.split(' ');
    const newMessage = {
      id: Date.now(),
      user: `${parts[0] ?? ''} ${parts[1]?.[0] ?? ''}.`.trim() || 'Guest',
      avatar: user?.avatar ?? '',
      message: text,
      time: "Just now",
      isMe: true
    };

    setChatMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newMessage]
    }));
  };

  const createNewEvent = (data) => {
    const newEvent = {
      id: Date.now(),
      ...data,
      attendees: 1,
      host: user?.name ?? 'Host',
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01ea3?w=500&q=80" // Default party image
    };
    setEvents([newEvent, ...events]);
    setShowCreate(false);
    showToast('Experience published successfully!', 'success');
  };

  // Parse date string like "Feb 7" to a Date object
  const parseEventDate = (dateStr) => {
    if (!dateStr) return null;
    const currentYear = new Date().getFullYear();
    const parsed = new Date(`${dateStr} ${currentYear}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const filteredEvents = events.filter(e => {
    // Search filter
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Category filter
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    if (!matchesCategory) return false;

    // Size filter
    if (sizeFilter === 'micro' && !e.isMicroMeet) return false;
    if (sizeFilter === 'large' && e.isMicroMeet) return false;

    // Date range filter
    if (dateRange.start || dateRange.end) {
      const eventDate = parseEventDate(e.date);
      if (eventDate) {
        if (dateRange.start && eventDate < dateRange.start) return false;
        if (dateRange.end && eventDate > dateRange.end) return false;
      }
    }

    // Inclusivity tag filter
    if (activeTags.length > 0) {
      if (!e.tags || !activeTags.every(t => e.tags.includes(t))) return false;
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

  const userRef = useRef(user);
  userRef.current = user;
  const handleSplashFinish = useCallback(() => {
    setAppState(userRef.current ? 'app' : 'auth');
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-paper font-sans overflow-hidden">
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
            {/* Global Toast Notifications */}
            <AnimatePresence>
              {notifications.map(n => (
                <Toast key={n.id} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />
              ))}
            </AnimatePresence>

            <div className="flex h-full">

              {/* Desktop Sidebar (Left) */}
              <Sidebar
                activeCategory={activeCategory}
                onSelect={setActiveCategory}

              />

              {/* Main Content Area */}
              <main
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
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm filter animate-text-gradient">{user?.name?.split(' ')[0]}</span><span className="text-accent">.</span>
                            </h1>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="relative group cursor-pointer"
                            onClick={() => setActiveTab('profile')}
                          >
                            <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img src={user?.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-2xl relative z-10" alt="Profile" />
                            {proEnabled && <div className="absolute -bottom-1 -right-1 z-20 bg-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white shadow-lg border border-white/20">PRO</div>}
                          </motion.button>
                        </motion.header>

                        {/* Video Wall */}
                        <VideoWall
                          userName={user?.name?.split(' ')[0] || 'You'}
                          onEventSelect={(id) => {
                            // Find event in events array or mock data
                            const event = events.find(e => e.id === id) || INITIAL_EVENTS.find(e => e.id === id);
                            if (event) setSelectedEvent(event);
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
                            {INITIAL_MICRO_MEETS.map(meet => (
                              <div key={meet.id} className="snap-center shrink-0">
                                <MicroMeetCard meet={meet} onClick={setSelectedEvent} />
                              </div>
                            ))}
                          </motion.div>
                        </div>

                        {/* Recommended Events - sorted by relevance to user preferences */}
                        <motion.section variants={itemVariants}>
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Heart size={16} className="text-primary" /></div>
                            <h2 className="text-xl font-bold tracking-tight text-primary">Recommended for You<span className="text-accent">.</span></h2>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.filter(e => !e.isMicroMeet).sort((a, b) => {
                              // Score events by how well they match user preferences
                              const interests = userPreferences?.interests || user?.interests || [];
                              const scoreEvent = (ev) => {
                                let score = 0;
                                if (interests.some(i => ev.category?.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ev.category?.toLowerCase()?.split(' ')[0]))) score += 3;
                                if (joinedEvents.includes(ev.id)) score += 2;
                                if (ev.attendees > 20) score += 1;
                                return score;
                              };
                              return scoreEvent(b) - scoreEvent(a);
                            }).slice(0, 3).map(event => (
                              <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
                            ))}
                          </div>
                        </motion.section>
                      </motion.div>
                      ) : ( <HomeSkeleton /> )
                    )}

                    {activeTab === 'hub' && (
                      contentReady ? (
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
                            {FEED_POSTS.map(post => (
                              <FeedItem key={post.id} post={post} currentUser={{ name: user?.name ?? 'Guest', avatar: user?.avatar ?? '' }} onOpenProfile={setSelectedUserProfile} />
                            ))}
                          </div>

                          {/* Local Tribes - Span 1 col (Sidebar style on desktop) */}
                          <div>
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Your Tribes<span className="text-accent">.</span></h3>
                            <div className="space-y-4">
                              {COMMUNITIES.filter(c => userTribes.includes(c.id)).map(comm => (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={comm.id}
                                  onClick={() => setSelectedTribe(comm)}
                                  className="premium-card p-4 flex items-center gap-4 group cursor-pointer"
                                >
                                  <div className="w-12 h-12 rounded-[18px] bg-secondary/10 flex items-center justify-center text-2xl border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                                    {comm.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <h4 className="font-bold text-sm truncate">{comm.name}</h4>
                                      {comm.unread > 0 && <span className="bg-primary text-[10px] font-black px-1.5 rounded-md text-white">{comm.unread}</span>}
                                    </div>
                                    <p className="text-[11px] text-secondary/60 truncate">{comm.lastMessage}</p>
                                  </div>
                                </motion.div>
                              ))}
                              <button
                                onClick={() => setShowTribeDiscovery(true)}
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

                    {activeTab === 'explore' && (
                      contentReady ? (
                      <motion.div
                        key="explore"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
                      >
                        <header className="mb-8">
                          <div className="flex items-center justify-between mb-6">
                            <h1 className="text-4xl font-black tracking-tighter text-primary">Explore<span className="text-accent">.</span></h1>
                            <button
                              onClick={() => setShowReels(true)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs hover:bg-primary/20 transition-all uppercase tracking-widest"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><line x1="10" y1="2" x2="10" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m2 2 8 10M22 2l-8 10"/></svg>
                              Reels
                            </button>
                          </div>

                          {/* Filters */}
                          <div className="sticky top-0 z-40 bg-secondary/10 backdrop-blur-xl py-4 -mx-5 px-5 md:mx-0 md:px-0 md:relative md:bg-transparent md:backdrop-blur-none border-b border-secondary/10 md:border-none">
                            <ExploreFilters
                              searchQuery={searchQuery}
                              setSearchQuery={setSearchQuery}
                              activeCategory={activeCategory}
                              setActiveCategory={setActiveCategory}
                              sizeFilter={sizeFilter}
                              setSizeFilter={setSizeFilter}
                              dateRange={dateRange}
                              setDateRange={setDateRange}
                              thisWeekActive={thisWeekActive}
                              setThisWeekActive={setThisWeekActive}
                              activeTags={activeTags}
                              setActiveTags={setActiveTags}
                            />
                          </div>
                        </header>

                        {/* Events Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
                          ))}
                        </div>
                      </motion.div>
                      ) : ( <ExploreSkeleton /> )
                    )}

                    {activeTab === 'profile' && (
                      contentReady ? (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
                      >
                        {/* Profile / Settings tabs */}
                        <div className="flex gap-2 mb-6">
                          <button
                            onClick={() => setProfileSubTab('profile')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${profileSubTab === 'profile' ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary/70 hover:bg-secondary/15'}`}
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => setProfileSubTab('settings')}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${profileSubTab === 'settings' ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary/70 hover:bg-secondary/15'}`}
                          >
                            <Settings size={18} />
                            Settings
                          </button>
                        </div>

                        {profileSubTab === 'settings' ? (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-6"
                          >
                            <div className="premium-card rounded-[32px] overflow-hidden border border-secondary/10">
                              <div className="p-4 border-b border-secondary/10">
                                <h2 className="font-black text-secondary text-lg">Experimental features</h2>
                                <p className="text-xs text-secondary/60 mt-1">Try upcoming features early.</p>
                              </div>
                              <div className="p-4 flex items-center justify-between">
                                <span className="font-bold text-secondary">Enable experimental features</span>
                                <button
                                  role="switch"
                                  aria-checked={experimentalFeatures}
                                  onClick={() => setExperimentalFeatures(!experimentalFeatures)}
                                  className={`relative w-12 h-7 rounded-full transition-colors ${experimentalFeatures ? 'bg-primary' : 'bg-secondary/20'}`}
                                >
                                  <motion.div
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                                    animate={{ x: experimentalFeatures ? 24 : 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    style={{ left: 4 }}
                                  />
                                </button>
                              </div>
                              {experimentalFeatures && (
                                <div className="border-t border-secondary/10 p-4 space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowGroupChats(true)}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
                                  >
                                    <MessageCircle className="text-secondary" size={20} />
                                    <span className="font-bold text-secondary">Group Chats</span>
                                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-secondary/50">WhatsApp</span>
                                  </button>
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
                                  <img src={user?.avatar} className="w-full h-full object-cover" alt="Profile" />
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
                                {proEnabled && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1"><Crown size={10} /> PRO</div>}
                              </div>
                              <h1 className="text-3xl font-black tracking-tighter mb-2 text-primary">{user?.name}<span className="text-accent">.</span></h1>
                              {user?.selectedTitle && (
                                <span className="inline-block px-3 py-1 mb-2 bg-accent/10 rounded-full border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">{user.selectedTitle}</span>
                              )}
                              <p className="text-sm text-gray-400 font-medium max-w-xs leading-relaxed mb-3">{user?.bio}</p>
                              <div className="flex items-center gap-5">
                                <div className="text-center">
                                  <span className="text-lg font-black text-secondary">{user?.followers ?? 0}</span>
                                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Followers</p>
                                </div>
                                <div className="w-px h-6 bg-secondary/10" />
                                <div className="text-center">
                                  <span className="text-lg font-black text-secondary">{user?.following ?? 0}</span>
                                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Following</p>
                                </div>
                              </div>
                            </div>

                            {/* WarmthScore */}
                            <div className="flex-1 flex justify-center md:justify-end">
                              <WarmthScore score={78} streak={5} />
                            </div>
                          </motion.div>

                          {/* XP & Level Progress */}
                          <motion.div variants={itemVariants} className="premium-card p-6 overflow-hidden relative">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                            {(() => {
                              const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= userXP).pop() || XP_LEVELS[0];
                              const nextLevel = XP_LEVELS.find(l => l.xpRequired > userXP) || XP_LEVELS[XP_LEVELS.length - 1];
                              const xpInLevel = userXP - currentLevel.xpRequired;
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
                                      <span className="text-2xl font-black text-accent">{userXP}</span>
                                      <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Total XP</p>
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
                                const value = user?.stats?.[stat.key] ?? Math.floor(Math.random() * 7 + 1);
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

                          {/* Achievements / Unlockable Titles */}
                          <motion.div variants={itemVariants} className="premium-card p-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Achievements<span className="text-accent">.</span></h3>
                            <div className="grid grid-cols-2 gap-3">
                              {UNLOCKABLE_TITLES.map(title => {
                                const isUnlocked = userUnlockedTitles.includes(title.id);
                                return (
                                  <div
                                    key={title.id}
                                    className={`p-4 rounded-2xl border transition-all ${isUnlocked
                                      ? 'bg-accent/5 border-accent/20'
                                      : 'bg-secondary/5 border-secondary/10 opacity-50'
                                    }`}
                                  >
                                    <span className="text-2xl">{title.icon}</span>
                                    <h4 className={`text-xs font-bold mt-2 ${isUnlocked ? 'text-secondary' : 'text-secondary/40'}`}>{title.title}</h4>
                                    <p className="text-[9px] text-secondary/40 mt-0.5">{title.description}</p>
                                    {isUnlocked && <span className="inline-block mt-2 text-[8px] font-black text-accent uppercase tracking-widest">+{title.xpReward} XP</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Hero Card - My Connections (spans 2 cols) */}
                            <motion.div
                              variants={itemVariants}
                              className="col-span-2 md:col-span-1 md:row-span-2 premium-card p-6 flex flex-col items-center justify-center gap-4 text-center transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden group"
                            >
                              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Users className="text-primary" size={28} />
                              </div>
                              <div>
                                <span className="text-3xl font-black text-secondary">{joinedEvents.length}</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60 mt-1">Connections</p>
                              </div>
                            </motion.div>

                            {/* Smaller cards */}
                            {[
                              { icon: Mail, color: 'text-secondary', bg: 'bg-secondary/10', label: 'Invitations', value: '3' },
                              { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Safe Mode', value: 'On' },
                              { icon: Zap, color: 'text-accent', bg: 'bg-accent/10', label: 'Smart Match', value: '94%' }
                            ].map((tool, i) => (
                              <motion.div
                                key={i}
                                variants={itemVariants}
                                className="premium-card p-4 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                              >
                                <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center`}>
                                  <tool.icon className={tool.color} size={20} />
                                </div>
                                <div className="text-left">
                                  <p className="font-black text-lg text-secondary">{tool.value}</p>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50">{tool.label}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>



                          {!proEnabled && (
                            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-secondary/10 text-center">
                              <p className="text-xs text-secondary/60 mb-6 px-4 font-medium leading-relaxed italic">Unlock advanced matchmaking and event analytics for £12.99/mo</p>
                              <button
                                onClick={() => setShowProModal(true)}
                                className="w-full bg-gradient-to-r from-primary to-accent py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl glow-primary transition-all active:scale-95 text-white"
                              >
                                Go Pro
                              </button>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="premium-card overflow-hidden mt-6 rounded-[32px] bg-secondary/5 border border-secondary/10">
                          {[
                            { label: 'My Bookings', icon: Check, action: () => setShowBookings(true), badge: joinedEvents.length },
                            { label: 'Saved Experiences', icon: Heart, action: () => setShowSaved(true), badge: savedEvents.length },
                            { label: 'Socialise Pass', icon: Zap, action: () => setShowProModal(true) },
                            { label: 'Help & Privacy', icon: ShieldCheck, action: () => setShowHelp(true) }
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
              <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onCreateClick={() => setShowCreate(true)} />
            </div>

            {/* Modals & Sheets */}
            <AnimatePresence>
              {selectedEvent && (
                <EventDetailSheet
                  key="event-detail"
                  event={selectedEvent}
                  isJoined={joinedEvents.includes(selectedEvent.id)}
                  onJoin={() => {
                    if (selectedEvent.isMicroMeet && !joinedEvents.includes(selectedEvent.id)) {
                      setShowMatchModal(selectedEvent);
                    } else {
                      handleJoin(selectedEvent.id);
                    }
                  }}
                  onClose={() => setSelectedEvent(null)}
                  messages={chatMessages[selectedEvent.id] || []}
                  onSendMessage={(text) => sendMessage(selectedEvent.id, text)}
                  onOpenProfile={setSelectedUserProfile}
                />
              )}
              {showCreate && <CreateEventModal key="create-event" onClose={() => setShowCreate(false)} onSubmit={createNewEvent} />}
              {showMatchModal && (
                <MatchAnalysisModal
                  key="match-modal"
                  event={showMatchModal}
                  onConfirm={() => {
                    handleJoin(showMatchModal.id);
                    setShowMatchModal(null);
                  }}
                  onCancel={() => setShowMatchModal(null)}
                />
              )}
              {/* Tribe Modals */}
              <TribeSheet
                key="tribe-sheet"
                tribe={selectedTribe}
                isOpen={!!selectedTribe}
                onClose={() => setSelectedTribe(null)}
                onLeave={handleLeaveTribe}
              />
              <TribeDiscovery
                key="tribe-discovery"
                isOpen={showTribeDiscovery}
                onClose={() => setShowTribeDiscovery(false)}
                onJoin={handleJoinTribe}
                joinedTribes={userTribes}
              />
              {/* Profile Modals */}
              <MyBookingsSheet
                key="bookings"
                isOpen={showBookings}
                onClose={() => setShowBookings(false)}
                bookings={events.filter(e => joinedEvents.includes(e.id))}
                onCancel={(id) => {
                  setJoinedEvents(joinedEvents.filter(eid => eid !== id));
                  showToast('Booking cancelled', 'info');
                }}
              />
              <SavedEventsSheet
                key="saved"
                isOpen={showSaved}
                onClose={() => setShowSaved(false)}
                savedEvents={events.filter(e => savedEvents.includes(e.id))}
                onRemove={(id) => {
                  setSavedEvents(savedEvents.filter(eid => eid !== id));
                  showToast('Removed from saved', 'info');
                }}
                onSelect={(event) => {
                  setShowSaved(false);
                  setSelectedEvent(event);
                }}
              />
              <ProUpgradeModal
                key="pro"
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
                onUpgrade={() => {
                  setProEnabled(true);
                  setShowConfetti(true);
                  showToast('Welcome to Socialise Pro! 🎉', 'success');
                }}
              />
              <HelpSheet
                key="help"
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
              />
              <GroupChatsSheet
                isOpen={showGroupChats}
                onClose={() => setShowGroupChats(false)}
                joinedCommunities={COMMUNITIES.filter((c) => userTribes.includes(c.id))}
              />
              <UserProfileSheet
                key="user-profile"
                profile={selectedUserProfile}
                isOpen={!!selectedUserProfile}
                onClose={() => setSelectedUserProfile(null)}
                onMessage={(p) => showToast(`Opening chat with ${p.name}…`, 'info')}
              />
              <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                newLevel={levelUpData?.newLevel}
                unlockedTitle={levelUpData?.unlockedTitle}
              />
              {showReels && (
                <EventReels
                  events={filteredEvents}
                  onClose={() => setShowReels(false)}
                  onSelectEvent={(event) => {
                    setShowReels(false);
                    setSelectedEvent(event);
                  }}
                />
              )}
              <AvatarCropModal
                imageUrl={avatarCropImage}
                isOpen={!!avatarCropImage}
                onSave={handleAvatarCropSave}
                onCancel={handleAvatarCropCancel}
              />
            </AnimatePresence>

            {/* Onboarding Flow */}
            <AnimatePresence>
              {user && !showOnboarding && !userPreferences && (
                <OnboardingFlow
                  userName={user?.name ?? 'there'}
                  onComplete={(prefs) => {
                    setUserPreferences(prefs);
                    setShowOnboarding(true);
                    showToast(`Welcome, ${user?.name?.split(' ')[0] ?? 'there'}! Let's find your tribe.`, 'success');
                  }}
                />
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

            {/* Mango Assistant - Global Persistent Cat */}
            {activeTab === 'home' && <MangoAssistant />}

            <IOSInstallPrompt />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mango.isChatOpen && <MangoChat />}
      </AnimatePresence>
    </div>
  );
}

export default App;

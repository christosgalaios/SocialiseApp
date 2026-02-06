import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart3, Mail, ShieldCheck, Zap, Check, Heart, User, Sparkles, ChevronRight, LogOut, Camera, Users
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
  INITIAL_MESSAGES,
  FEED_POSTS,
  DEMO_USER
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
import RealtimePing from './components/RealtimePing';
import WarmthScore from './components/WarmthScore';
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
    if (jsonValue != null) return JSON.parse(jsonValue);
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
    // Logic for Mango's home persistence
    if (activeTab === 'home' && id !== 'home') {
      // Leaving home
      lastHomeExitRef.current = Date.now();
    } else if (activeTab !== 'home' && id === 'home') {
      // Returning to home
      const timeAway = Date.now() - lastHomeExitRef.current;
      if (timeAway > 10000) { // 10 seconds
        // Reset position and play!
        mango.setCoords({ x: 0, y: 0 });
        mango.setPose('playing');
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

  // Delight moments state
  const [showConfetti, setShowConfetti] = useState(false);
  const [realtimePing, setRealtimePing] = useState({ isVisible: false, name: '', avatar: '', action: '' });
  const mango = useMango();

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
        // Use the same Ben persona for now to keep consistency as requested
        setUser(DEMO_USER);
        setAppState('app');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('socialise_token');
    setAppState('auth');
    showToast('Signed out successfully', 'info');
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
      setUser(prev => ({ ...prev, avatar: imageUrl }));
      showToast('Profile photo updated!', 'success');
    }
  };

  // Persistent Session Check
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('socialise_token');
      if (token && !user) {
        try {
          const userData = await api.getMe(token);
          setUser(userData);
          // Removed setAppState('app') to allow SplashScreen to finish
        } catch (err) {
          console.error("Session invalid", err);
          handleLogout();
        }
      }
      // Removed else if (user) block to prevent skipping splash
    };
    // Simulate check
    setTimeout(checkSession, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Dark Mode Application


  // Mock API Interactions
  const handleJoin = (id) => {
    if (joinedEvents.includes(id)) {
      setJoinedEvents(prev => prev.filter(e => e !== id));
      showToast('You left the event.', 'info');
    } else {
      setJoinedEvents(prev => [...prev, id]);
      showToast('You\'re going! Added to your calendar.', 'success');

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
    const newMessage = {
      id: Date.now(),
      user: `${user.name.split(' ')[0]} ${user.name.split(' ')[1]?.[0] || ''}.`,
      avatar: user.avatar,
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
      host: user.name,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01ea3?w=500&q=80" // Default party image
    };
    setEvents([newEvent, ...events]);
    setShowCreate(false);
    showToast('Experience published successfully!', 'success');
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    return matchesSearch && matchesCategory;
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
          Our AI has analyzed the attendee list. You have a <span className="text-primary font-black">94% match</span> with this tribe based on your interests in <span className="text-white font-bold">{event.matchTags?.slice(0, 2).join(' & ')}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 rounded-xl font-black bg-primary text-white shadow-lg glow-primary hover:scale-[1.02] transition-transform">Join Tribe</button>
        </div>
      </motion.div>
    </div>
  );

  // Memoize splash finish handler to prevent re-renders breaking the splash animation
  const handleSplashFinish = useCallback(() => {
    setAppState(user ? 'app' : 'auth');
  }, [user]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-paper font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {appState === 'splash' && (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        )}

        {appState === 'auth' && (
          <AuthScreen key="auth" onLogin={handleLogin} />
        )}

        {appState === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
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
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                              Good Afternoon,<br />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm filter animate-text-gradient">{user?.name?.split(' ')[0]}</span>.
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
                          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30"><Zap size={16} className="text-amber-500" /></div>
                            <h2 className="text-xl font-bold tracking-tight text-secondary">Curated Micro-Meets</h2>
                          </motion.div>

                          {/* 
                            DESKTOP: Grid Layout (grid-cols-2 or 3)
                            MOBILE: Horizontal Scroll (flex + overflow-x-auto) 
                        */}
                          <motion.div
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

                        {/* Your Events */}
                        <motion.section variants={itemVariants}>
                          <h2 className="text-xl font-bold mb-6 tracking-tight">Your Next Events</h2>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.filter(e => !e.isMicroMeet).slice(0, 3).map(event => (
                              <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
                            ))}
                          </div>
                        </motion.section>
                      </motion.div>
                    )}

                    {activeTab === 'hub' && (
                      <motion.div
                        key="hub"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
                      >
                        <header className="mb-10">
                          <h1 className="text-4xl font-black tracking-tighter mb-2">Community Hub</h1>
                          <p className="text-gray-400 font-medium">Your tribes and local buzz.</p>
                        </header>

                        <div className="grid md:grid-cols-3 gap-8">
                          {/* Live Feed - Span 2 cols on Desktop */}
                          <div className="md:col-span-2 space-y-8">
                            <div>
                              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Live Pulse</h3>
                              {FEED_POSTS.map(post => (
                                <FeedItem key={post.id} post={post} />
                              ))}
                            </div>
                          </div>

                          {/* Local Tribes - Span 1 col (Sidebar style on desktop) */}
                          <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Your Tribes</h3>
                            <div className="space-y-4">
                              {COMMUNITIES.map(comm => (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  key={comm.id}
                                  className="premium-card p-4 flex items-center gap-4 group cursor-pointer"
                                >
                                  <div className="w-12 h-12 rounded-[18px] bg-white/5 flex items-center justify-center text-2xl border border-white/5 shadow-inner group-hover:bg-white/10 transition-colors">
                                    {comm.avatar}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <h4 className="font-bold text-sm truncate">{comm.name}</h4>
                                      {comm.unread > 0 && <span className="bg-primary text-[10px] font-black px-1.5 rounded-md text-white">{comm.unread}</span>}
                                    </div>
                                    <p className="text-[11px] text-gray-400 truncate opacity-70">{comm.lastMessage}</p>
                                  </div>
                                </motion.div>
                              ))}
                              <button className="w-full py-4 border border-dashed border-white/10 rounded-[20px] text-xs font-bold text-gray-500 hover:text-white hover:border-white/30 transition-all uppercase tracking-widest">
                                + Find New Tribe
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'explore' && (
                      <motion.div
                        key="explore"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
                      >
                        <header className="mb-8">
                          <h1 className="text-4xl font-black tracking-tighter mb-6">Explore</h1>

                          {/* Search & Filter Bar */}
                          <div className="sticky top-0 z-40 bg-dark/80 backdrop-blur-xl py-4 -mx-5 px-5 md:mx-0 md:px-0 md:relative md:bg-transparent md:backdrop-blur-none md:max-w-xl">
                            <div className="relative mb-6">
                              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500"><Zap size={20} /></div>
                              <input
                                type="text"
                                placeholder="Search events, vibes, people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full glass-2 border-white/10 rounded-[24px] pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-lg placeholder:text-gray-600"
                              />
                            </div>

                            {/* Mobile Horizontal Category List (Hidden on Desktop if using Sidebar) */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:hidden">
                              {CATEGORIES.map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => setActiveCategory(cat.id)}
                                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-white text-black border-white shadow-lg scale-105' : 'glass-2 border-white/10 text-gray-400 hover:text-white'}`}
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </header>

                        {/* Events Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'profile' && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
                      >
                        {/* Abstract background shape */}
                        <div className="absolute top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-40 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

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
                                {proEnabled && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1"><Sparkles size={10} /> PRO</div>}
                              </div>
                              <h1 className="text-3xl font-black tracking-tighter mb-2">{user?.name}</h1>
                              <p className="text-sm text-gray-400 font-medium max-w-xs leading-relaxed">{user?.bio}</p>
                            </div>

                            {/* WarmthScore */}
                            <div className="flex-1 flex justify-center md:justify-end">
                              <WarmthScore score={78} streak={5} />
                            </div>
                          </motion.div>

                          {/* Asymmetric Feature Cards - Hero card + 3 smaller */}
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
                            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-white/5 text-center">
                              <p className="text-xs text-gray-500 mb-6 px-4 font-medium leading-relaxed italic">Unlock advanced matchmaking and event analytics for £12.99/mo</p>
                              <button className="w-full bg-gradient-to-r from-primary to-accent py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl glow-primary transition-all active:scale-95 text-white">Go Pro</button>
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="premium-card overflow-hidden mt-6 rounded-[32px] bg-white/5 border border-white/5 bg-secondary/10">
                          {[
                            { label: 'My Bookings', icon: Check },
                            { label: 'Saved Experiences', icon: Heart },
                            { label: 'Socialise Pass', icon: Zap },
                            { label: 'Help & Privacy', icon: ShieldCheck }
                          ].map((item) => (
                            <button key={item.label} className="w-full flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all active:pl-8">
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                  <item.icon size={20} className="text-primary" />
                                </div>
                                <span className="font-extrabold text-[15px] tracking-tight">{item.label}</span>
                              </div>
                              <ChevronRight className="text-gray-600" size={20} />
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
                      </motion.div>
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
                />
              )}
              {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSubmit={createNewEvent} />}
              {showMatchModal && (
                <MatchAnalysisModal
                  event={showMatchModal}
                  onConfirm={() => {
                    handleJoin(showMatchModal.id);
                    setShowMatchModal(null);
                  }}
                  onCancel={() => setShowMatchModal(null)}
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

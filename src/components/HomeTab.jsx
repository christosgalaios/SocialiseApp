import { useCallback } from 'react';
import { Heart, Zap, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import useEventStore from '../stores/eventStore';
import useUIStore from '../stores/uiStore';
import { DEFAULT_AVATAR } from '../data/constants';
import VideoWall from './VideoWall';
import MicroMeetCard from './MicroMeetCard';
import EventCard from './EventCard';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } },
};

export default function HomeTab({ onProfileClick, fetchAllData }) {
  const user = useAuthStore((s) => s.user);
  const events = useEventStore((s) => s.events);
  const joinedEvents = useEventStore((s) => s.joinedEvents);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const experimentalFeatures = useUIStore((s) => s.experimentalFeatures);
  const proEnabled = useUIStore((s) => s.proEnabled);
  const recommendedLimit = useUIStore((s) => s.recommendedLimit);
  const setRecommendedLimit = useUIStore((s) => s.setRecommendedLimit);
  const userPreferences = useUIStore((s) => s.userPreferences);
  const showToast = useUIStore((s) => s.showToast);

  const refreshRecommendations = useCallback(() => {
    setRecommendedLimit(3);
    fetchAllData()
      .then(() => showToast('Recommendations refreshed', 'success'))
      .catch(() => showToast('Failed to refresh', 'error'));
  }, [fetchAllData, setRecommendedLimit, showToast]);

  const recommended = events.filter(e => !e.isMicroMeet).sort((a, b) => {
    const interests = userPreferences?.interests || user?.interests || [];
    const scoreEvent = (ev) => {
      let score = 0;
      if (interests.some(i => ev.category?.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ev.category?.toLowerCase()?.split(' ')[0]))) score += 3;
      if (joinedEvents.includes(ev.id)) score += 2;
      if (ev.attendees > 20) score += 1;
      return score;
    };
    return scoreEvent(b) - scoreEvent(a);
  });

  const visible = recommended.slice(0, recommendedLimit);
  const hasMore = recommendedLimit < recommended.length;

  const microMeets = events.filter(e => e.isMicroMeet || e.is_micro_meet).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return (
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
          <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest mb-1">{getFormattedDate()}</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-primary">
            {getGreeting()}<span className="text-accent">,</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm filter animate-text-gradient">{user?.name?.split(' ')[0]}</span><span className="text-accent">.</span>
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="relative group cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
          <img src={user?.avatar || DEFAULT_AVATAR} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-2xl relative z-10" alt="Profile" loading="lazy" />
          {experimentalFeatures && proEnabled && <div className="absolute -bottom-1 -right-1 z-20 bg-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md text-white shadow-lg border border-white/20">PRO</div>}
        </motion.button>
      </motion.header>

      {/* Video Wall */}
      <VideoWall
        userName={user?.name?.split(' ')[0] || 'You'}
        onEventSelect={(id) => {
          const event = events.find(e => e.id === id);
          if (event) setSelectedEvent(event);
        }}
      />

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
          {microMeets.map(meet => (
            <div key={meet.id} className="snap-center shrink-0">
              <MicroMeetCard meet={meet} onClick={setSelectedEvent} />
            </div>
          ))}
          {microMeets.length === 0 && (
            <div className="text-center text-secondary/40 text-sm font-medium py-8 w-full">No micro-meets available yet</div>
          )}
        </motion.div>
      </div>

      {/* Recommended Events */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Heart size={16} className="text-primary" /></div>
            <h2 className="text-xl font-bold tracking-tight text-primary">Recommended for You<span className="text-accent">.</span></h2>
          </div>
          <button
            onClick={refreshRecommendations}
            className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
            title="Refresh recommendations"
          >
            <RefreshCw size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map(event => (
            <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
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
      </motion.section>
    </motion.div>
  );
}

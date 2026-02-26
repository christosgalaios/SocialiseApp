import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { playTap, hapticTap } from '../utils/feedback';
import useAuthStore from '../stores/authStore';
import useEventStore from '../stores/eventStore';
import useUIStore from '../stores/uiStore';
import EventCard from './EventCard';
import ExploreFilters from './ExploreFilters';
import { INCLUSIVITY_TAGS } from '../data/constants';

/** Auto-cycling slideshow for a single reel card. */
const ReelSlideshow = ({ images, isActive }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive, images.length]);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          alt=""
          loading="lazy"
          onError={() => {
            if (images.length > 1) {
              setCurrentIndex(prev => (prev + 1) % images.length);
            }
          }}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** Inline reel card — tall portrait card with slideshow + event info overlay. */
const InlineReelCard = ({ event, onClick }) => {
  const slideshowImages = [
    event.image,
    event.image?.replace('w=800', 'w=801'),
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  ];

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(event)}
      className="relative w-[180px] h-[260px] md:w-[200px] md:h-[280px] shrink-0 rounded-[24px] overflow-hidden cursor-pointer bg-secondary snap-start"
    >
      <ReelSlideshow images={slideshowImages} isActive={true} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      {/* Category badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">
          {event.category}
        </span>
        {event.tags?.slice(0, 1).map(tagId => {
          const tag = INCLUSIVITY_TAGS.find(t => t.id === tagId);
          if (!tag) return null;
          return (
            <span key={tagId} className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-bold text-white">
              {tag.emoji}
            </span>
          );
        })}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <h3 className="text-sm font-black text-white mb-1 drop-shadow-lg tracking-tight line-clamp-2">{event.title}</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-white/70 text-[10px] font-bold">
          <span className="flex items-center gap-0.5"><Calendar size={10} /> {event.date}</span>
          <span className="flex items-center gap-0.5"><MapPin size={10} /> {event.location?.split(',')[0]}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-white/50 text-[9px] font-medium">
          <Users size={9} /> {event.attendees} going
        </div>
      </div>
    </motion.div>
  );
};

export default function ExploreTab({ filteredEvents }) {
  const user = useAuthStore((s) => s.user);
  const joinedEvents = useEventStore((s) => s.joinedEvents);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);
  const sizeFilter = useUIStore((s) => s.sizeFilter);
  const setSizeFilter = useUIStore((s) => s.setSizeFilter);
  const dateRange = useUIStore((s) => s.dateRange);
  const setDateRange = useUIStore((s) => s.setDateRange);
  const thisWeekActive = useUIStore((s) => s.thisWeekActive);
  const setThisWeekActive = useUIStore((s) => s.setThisWeekActive);
  const activeTags = useUIStore((s) => s.activeTags);
  const setActiveTags = useUIStore((s) => s.setActiveTags);
  const exploreLimit = useUIStore((s) => s.exploreLimit);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
  }, [filteredEvents]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };

  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
    >
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-primary">Explore<span className="text-accent">.</span></h1>
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

      {/* Inline Reels Carousel */}
      {filteredEvents.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-secondary tracking-tight">Reels<span className="text-accent">.</span></h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { playTap(); hapticTap(); scroll(-1); }}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary/40 hover:text-secondary/70 disabled:opacity-30 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => { playTap(); hapticTap(); scroll(1); }}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary/40 hover:text-secondary/70 disabled:opacity-30 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-proximity -mx-5 px-5 md:mx-0 md:px-0"
          >
            {filteredEvents.slice(0, 10).map(event => (
              <InlineReelCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        </section>
      )}

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.slice(0, exploreLimit).map(event => (
          <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} isHosting={event.host_id === user?.id} onClick={setSelectedEvent} />
        ))}
      </div>
      {exploreLimit < filteredEvents.length && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-secondary/40 text-xs font-bold animate-pulse">
            <div className="w-4 h-4 border-2 border-secondary/30 border-t-primary rounded-full animate-spin" />
            Scroll for more
          </div>
        </div>
      )}
    </motion.div>
  );
}

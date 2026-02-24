import { motion } from 'framer-motion';
import useEventStore from '../stores/eventStore';
import useUIStore from '../stores/uiStore';
import EventCard from './EventCard';
import ExploreFilters from './ExploreFilters';

export default function ExploreTab({ filteredEvents }) {
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
  const setShowReels = useUIStore((s) => s.setShowReels);

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
        {filteredEvents.slice(0, exploreLimit).map(event => (
          <EventCard key={event.id} event={event} isJoined={joinedEvents.includes(event.id)} onClick={setSelectedEvent} />
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

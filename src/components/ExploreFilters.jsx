import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Users, Star, ChevronDown, SlidersHorizontal, X, UsersRound } from 'lucide-react';
import { CATEGORIES, INCLUSIVITY_TAGS } from '../data/constants';
import DateRangeCalendar from './DateRangeCalendar';

const ExploreFilters = ({
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
    activeTags = [],
    setActiveTags,
}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Calculate "This Week" range (current Monday to Sunday)
    const getThisWeekRange = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { start: monday, end: sunday };
    };

    const handleThisWeek = () => {
        if (thisWeekActive) {
            setThisWeekActive(false);
            setDateRange({ start: null, end: null });
        } else {
            setThisWeekActive(true);
            setDateRange(getThisWeekRange());
        }
    };

    const clearDates = () => {
        setThisWeekActive(false);
        setDateRange({ start: null, end: null });
    };

    const formatDateRange = () => {
        if (!dateRange.start) return 'Pick Dates';
        const start = dateRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (!dateRange.end) return start;
        const end = dateRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `${start} - ${end}`;
    };

    const toggleTag = (tagId) => {
        if (!setActiveTags) return;
        if (activeTags.includes(tagId)) {
            setActiveTags(activeTags.filter(t => t !== tagId));
        } else {
            setActiveTags([...activeTags, tagId]);
        }
    };

    // Check if any filters are active (to show indicator)
    const hasActiveFilters = activeCategory !== 'All' || sizeFilter !== 'all' || dateRange.start || thisWeekActive || activeTags.length > 0;

    // Reset all filters
    const resetAllFilters = () => {
        setSearchQuery('');
        setActiveCategory('All');
        setSizeFilter('all');
        setDateRange({ start: null, end: null });
        setThisWeekActive(false);
        if (setActiveTags) setActiveTags([]);
    };

    return (
        <div className="space-y-3">
            {/* Search Bar with Filter Toggle */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary" aria-hidden="true">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search events, vibes, people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary/10 border border-secondary/20 rounded-[24px] pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-lg placeholder:text-secondary/50 text-[var(--text)]"
                        aria-label="Search events"
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className={`px-4 py-4 rounded-2xl flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${filtersExpanded
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-secondary/10 border border-secondary/20 text-secondary hover:text-primary hover:border-primary/50'
                        }`}
                    aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
                    aria-expanded={filtersExpanded}
                >
                    <SlidersHorizontal size={18} aria-hidden="true" />
                    {hasActiveFilters && !filtersExpanded && (
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                    )}
                    <motion.div
                        animate={{ rotate: filtersExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                    >
                        <ChevronDown size={16} />
                    </motion.div>
                </button>
            </div>

            {/* Collapsible Filters */}
            <AnimatePresence>
                {filtersExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 pt-2">
                            {/* Quick Actions Row */}
                            <div className="flex gap-3 flex-wrap">
                                {/* This Week Chip */}
                                <button
                                    onClick={handleThisWeek}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${thisWeekActive
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-secondary/10 border border-secondary/20 text-secondary hover:text-primary hover:border-primary/50'
                                        }`}
                                >
                                    <Star size={14} />
                                    This Week
                                </button>

                                {/* Date Picker Toggle */}
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${dateRange.start && !thisWeekActive
                                        ? 'bg-secondary text-white shadow-lg'
                                        : 'bg-secondary/10 border border-secondary/20 text-secondary hover:text-primary hover:border-secondary/50'
                                        }`}
                                >
                                    <Calendar size={14} />
                                    {thisWeekActive ? 'Pick Dates' : formatDateRange()}
                                </button>

                                {/* Clear Dates */}
                                {(dateRange.start || thisWeekActive) && (
                                    <button
                                        onClick={clearDates}
                                        className="px-4 py-3 rounded-2xl text-xs font-bold text-secondary/60 hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                    >
                                        Clear Dates
                                    </button>
                                )}
                            </div>

                            {/* Category Pills */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${activeCategory === cat.id
                                            ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                            : 'bg-secondary/10 border-secondary/20 text-secondary hover:text-primary hover:border-primary/30'
                                            }`}
                                    >
                                        {Icon && <Icon size={14} />}
                                        {cat.label}
                                    </button>
                                    );
                                })}
                            </div>

                            {/* Size Toggle */}
                            <div className="flex gap-2">
                                {[
                                    { id: 'all', label: 'All Sizes', icon: null },
                                    { id: 'micro', label: 'Micro Meets', icon: Users },
                                    { id: 'large', label: 'Group Events', icon: UsersRound }
                                ].map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setSizeFilter(size.id)}
                                        className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${sizeFilter === size.id
                                            ? 'bg-accent/20 text-accent border border-accent/30'
                                            : 'bg-secondary/10 text-secondary/70 border border-secondary/20 hover:text-primary hover:border-secondary/40'
                                            }`}
                                    >
                                        {size.icon && <size.icon size={14} />}
                                        {size.label}
                                    </button>
                                ))}
                            </div>

                            {/* Inclusivity Tags */}
                            <div>
                                <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Inclusivity</p>
                                <div className="flex gap-2 flex-wrap">
                                    {INCLUSIVITY_TAGS.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-2 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                                                activeTags.includes(tag.id)
                                                    ? tag.color + ' shadow-sm'
                                                    : 'bg-secondary/5 border-secondary/15 text-secondary/60 hover:border-secondary/30'
                                            }`}
                                        >
                                            <span>{tag.emoji}</span>
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset All Filters */}
                            {hasActiveFilters && (
                                <motion.button
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={resetAllFilters}
                                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                >
                                    <X size={14} />
                                    Reset All Filters
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Modal */}
            <DateRangeCalendar
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                dateRange={dateRange}
                setDateRange={setDateRange}
                setThisWeekActive={setThisWeekActive}
            />
        </div>
    );
};

export default ExploreFilters;

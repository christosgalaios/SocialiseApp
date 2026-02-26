import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, TrendingUp, Plus, Megaphone,
  ChevronRight, BarChart3, Globe, Pencil, Clock, History, RefreshCw,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import useEventStore from '../stores/eventStore';
import useCommunityStore from '../stores/communityStore';
import OrganiserStatsCard from './OrganiserStatsCard';
import { DEFAULT_AVATAR, ORGANISER_SOCIAL_PLATFORMS, CATEGORIES } from '../data/constants';
import { playTap, playClick, hapticTap } from '../utils/feedback';
import api from '../api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } },
};

export default function OrganiserDashboard({ onSwitchToAttendee, onCreateEvent }) {
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);
  const setShowOrganiserEditProfile = useUIStore((s) => s.setShowOrganiserEditProfile);
  const organiserDashboardTab = useUIStore((s) => s.organiserDashboardTab);
  const setOrganiserDashboardTab = useUIStore((s) => s.setOrganiserDashboardTab);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const allEvents = useEventStore((s) => s.events);
  const setSelectedTribe = useCommunityStore((s) => s.setSelectedTribe);
  const allCommunities = useCommunityStore((s) => s.communities);

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [eventFilter, setEventFilter] = useState('upcoming');

  const fetchDashboard = async (silent = false) => {
    try {
      const data = await api.getOrganiserStats();
      setStats(data.stats);
      setEvents(data.events);
      setCommunities(data.communities);
      if (!silent) showToast('Dashboard refreshed', 'success');
    } catch {
      if (!silent) showToast('Failed to load organiser stats', 'error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchDashboard(true)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    playClick(); hapticTap();
    await fetchDashboard(false);
    setIsRefreshing(false);
  };

  const socialLinks = user?.organiserSocialLinks || {};
  const activeSocials = ORGANISER_SOCIAL_PLATFORMS.filter(p => socialLinks[p.key]?.trim());

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate >= now || isNaN(eventDate.getTime())) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const filteredEvents = eventFilter === 'upcoming' ? upcomingEvents : pastEvents;

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Profile header skeleton */}
        <div className="premium-card p-6 rounded-[24px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-[24px] bg-secondary/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 bg-secondary/10 rounded-full" />
              <div className="h-3 w-20 bg-secondary/10 rounded-full" />
            </div>
          </div>
          <div className="h-4 w-full bg-secondary/10 rounded-full mb-2" />
          <div className="h-4 w-3/4 bg-secondary/10 rounded-full" />
        </div>
        {/* Quick actions skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-14 rounded-2xl bg-secondary/10" />
          <div className="w-28 h-14 rounded-2xl bg-secondary/10" />
        </div>
        {/* Stats grid skeleton */}
        <div>
          <div className="h-3 w-32 bg-secondary/10 rounded-full mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="premium-card p-5 rounded-[24px]">
                <div className="w-11 h-11 rounded-2xl bg-secondary/10 mb-3" />
                <div className="h-7 w-12 bg-secondary/10 rounded-full mb-1" />
                <div className="h-2.5 w-20 bg-secondary/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Events section skeleton */}
        <div className="premium-card p-6 rounded-[24px]">
          <div className="h-3 w-24 bg-secondary/10 rounded-full mb-4" />
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-secondary/10 rounded-full" />
                <div className="h-3 w-20 bg-secondary/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Organiser Header */}
      <motion.div variants={itemVariants} className="premium-card p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

        {/* Cover photo area */}
        {user?.organiserCoverPhoto && (
          <div className="-mx-6 -mt-6 mb-4 h-28 overflow-hidden rounded-t-[24px]">
            <img src={user.organiserCoverPhoto} className="w-full h-full object-cover" alt="" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-primary/20 shadow-lg shrink-0">
            <img src={user?.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="Organiser" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-secondary truncate">
                {user?.organiserDisplayName || user?.name}
              </h2>
              {user?.organiserVerified && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Verified</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Megaphone size={12} className="text-accent" />
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">Organiser</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center hover:bg-secondary/10 transition-colors disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw size={16} className={`text-secondary/60 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { playTap(); hapticTap(); setShowOrganiserEditProfile(true); }}
              className="w-10 h-10 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center hover:bg-secondary/10 transition-colors"
              aria-label="Edit organiser profile"
            >
              <Pencil size={16} className="text-secondary/60" />
            </button>
          </div>
        </div>

        {user?.organiserBio && (
          <p className="text-sm text-secondary/60 font-medium leading-relaxed mb-3">{user.organiserBio}</p>
        )}

        {/* Category chips */}
        {user?.organiserCategories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {user.organiserCategories.map((catId) => {
              const cat = CATEGORIES.find(c => c.id === catId);
              const Icon = cat?.icon;
              return (
                <span key={catId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 rounded-full border border-primary/10 text-[11px] font-bold text-primary">
                  {Icon && <Icon size={10} />}
                  {cat?.label || catId}
                </span>
              );
            })}
          </div>
        )}

        {activeSocials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeSocials.map(p => (
              <span key={p.key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/5 rounded-full border border-secondary/10 text-[11px] font-bold text-secondary/60">
                <Globe size={10} />
                {socialLinks[p.key]}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => { playTap(); onSwitchToAttendee(); }}
          className="text-[10px] font-black text-secondary/40 uppercase tracking-widest hover:text-secondary/60 transition-colors"
        >
          Switch to attendee view
        </button>
      </motion.div>

      {/* Profile Completeness */}
      {(() => {
        const checks = [
          { label: 'Display name', done: !!user?.organiserDisplayName?.trim() },
          { label: 'Bio', done: !!user?.organiserBio?.trim() },
          { label: 'Categories', done: (user?.organiserCategories?.length ?? 0) > 0 },
          { label: 'Social links', done: activeSocials.length > 0 },
          { label: 'First event', done: events.length > 0 },
        ];
        const completed = checks.filter(c => c.done).length;
        const pct = Math.round((completed / checks.length) * 100);
        if (pct >= 100) return null;
        return (
          <motion.div variants={itemVariants} className="premium-card p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                Complete Your Profile<span className="text-accent">.</span>
              </h3>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {checks.map((check) => (
                <span
                  key={check.label}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    check.done
                      ? 'bg-green-500/10 border-green-500/20 text-green-600 line-through'
                      : 'bg-secondary/5 border-secondary/10 text-secondary/50 cursor-pointer hover:border-primary/30'
                  }`}
                  onClick={!check.done ? () => { playTap(); setShowOrganiserEditProfile(true); } : undefined}
                >
                  {check.done ? '✓' : '○'} {check.label}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })()}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
          className="flex-1 p-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
        >
          <Plus size={18} />
          Create Event
        </button>
        <button
          onClick={() => { playTap(); hapticTap(); }}
          className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex items-center justify-center gap-2 hover:bg-secondary/10 transition-colors"
        >
          <Users size={18} />
          Community
        </button>
      </motion.div>

      {/* Dashboard Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 bg-secondary/5 rounded-2xl border border-secondary/10">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { playTap(); setOrganiserDashboardTab(tab.key); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              organiserDashboardTab === tab.key
                ? 'bg-paper text-primary shadow-sm'
                : 'text-secondary/40 hover:text-secondary/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {organiserDashboardTab === 'analytics' ? (
        <motion.div
          key="analytics"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div>
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
              Your Performance<span className="text-accent">.</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <OrganiserStatsCard
                icon={Calendar}
                value={stats?.eventsHosted ?? 0}
                label="Events Hosted"
                color="text-primary"
                bgColor="bg-primary/10"
                borderColor="border-primary/20"
              />
              <OrganiserStatsCard
                icon={Users}
                value={stats?.totalAttendees ?? 0}
                label="Total Attendees"
                color="text-secondary"
                bgColor="bg-secondary/10"
                borderColor="border-secondary/20"
              />
              <OrganiserStatsCard
                icon={TrendingUp}
                value={stats?.activeEvents ?? 0}
                label="Active Events"
                color="text-accent"
                bgColor="bg-accent/10"
                borderColor="border-accent/20"
              />
              <OrganiserStatsCard
                icon={BarChart3}
                value={stats?.totalCommunityMembers ?? 0}
                label="Community Members"
                color="text-teal-600"
                bgColor="bg-teal-500/10"
                borderColor="border-teal-500/20"
              />
            </div>
          </div>

          {/* Attendance rate */}
          {events.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">
                Event Fill Rates<span className="text-accent">.</span>
              </h3>
              <div className="space-y-3">
                {events.slice(0, 6).map((event) => {
                  const fillPct = event.spots > 0 ? Math.round((event.attendees / event.spots) * 100) : 0;
                  return (
                    <div key={event.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-bold text-secondary truncate max-w-[60%]">{event.title}</span>
                        <span className={`text-[11px] font-black ${fillPct >= 80 ? 'text-accent' : fillPct >= 50 ? 'text-primary' : 'text-secondary/50'}`}>{fillPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${fillPct >= 80 ? 'bg-accent' : fillPct >= 50 ? 'bg-primary' : 'bg-secondary/30'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(fillPct, 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-secondary/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary/40">Average fill rate</span>
                  <span className="text-sm font-black text-primary">
                    {Math.round(events.reduce((sum, e) => sum + (e.spots > 0 ? (e.attendees / e.spots) * 100 : 0), 0) / Math.max(events.length, 1))}%
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
      <>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
          Your Performance<span className="text-accent">.</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <OrganiserStatsCard
            icon={Calendar}
            value={stats?.eventsHosted ?? 0}
            label="Events Hosted"
            color="text-primary"
            bgColor="bg-primary/10"
            borderColor="border-primary/20"
          />
          <OrganiserStatsCard
            icon={Users}
            value={stats?.totalAttendees ?? 0}
            label="Total Attendees"
            color="text-secondary"
            bgColor="bg-secondary/10"
            borderColor="border-secondary/20"
          />
          <OrganiserStatsCard
            icon={TrendingUp}
            value={stats?.activeEvents ?? 0}
            label="Active Events"
            color="text-accent"
            bgColor="bg-accent/10"
            borderColor="border-accent/20"
          />
          <OrganiserStatsCard
            icon={BarChart3}
            value={stats?.totalCommunityMembers ?? 0}
            label="Community Members"
            color="text-teal-600"
            bgColor="bg-teal-500/10"
            borderColor="border-teal-500/20"
          />
        </div>
      </motion.div>

      {/* My Events */}
      <motion.div variants={itemVariants} className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest">
            My Events<span className="text-accent">.</span>
          </h3>
          <span className="text-[9px] font-bold text-secondary/30 uppercase tracking-widest">
            {events.length} total
          </span>
        </div>

        {/* Event filter tabs */}
        {events.length > 0 && (
          <div className="flex gap-2 mb-4">
            {[
              { key: 'upcoming', label: 'Upcoming', icon: Clock, count: upcomingEvents.length },
              { key: 'past', label: 'Past', icon: History, count: pastEvents.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { playTap(); setEventFilter(tab.key); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  eventFilter === tab.key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-secondary/5 text-secondary/50 border border-secondary/10 hover:bg-secondary/10'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  eventFilter === tab.key ? 'bg-primary/20 text-primary' : 'bg-secondary/10 text-secondary/40'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-[20px] bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Calendar size={28} className="text-primary/30" />
            </div>
            <p className="text-sm text-secondary/50 font-bold mb-1">No events yet</p>
            <p className="text-[11px] text-secondary/30 mb-4 max-w-[200px] mx-auto">Create your first event and start building your audience</p>
            <button
              onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              Create Event
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-secondary/40 font-medium">
              No {eventFilter} events
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={eventFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {filteredEvents.slice(0, 5).map((event) => {
                const fillPct = event.spots > 0 ? Math.round((event.attendees / event.spots) * 100) : 0;
                const fullEvent = allEvents.find(e => e.id === event.id) || event;
                return (
                  <button
                    key={event.id}
                    onClick={() => { playTap(); hapticTap(); setSelectedEvent(fullEvent); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                      {event.image && <img src={event.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-secondary truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-secondary/40 font-medium">{event.date}</span>
                        <span className="text-[10px] text-secondary/30">|</span>
                        <span className={`text-[10px] font-bold ${fillPct >= 80 ? 'text-accent' : 'text-primary'}`}>
                          <Users size={10} className="inline mr-0.5" />
                          {event.attendees}/{event.spots}
                        </span>
                      </div>
                      {/* Mini fill bar */}
                      <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fillPct >= 80 ? 'bg-accent' : 'bg-primary/60'}`}
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-secondary/30 shrink-0" />
                  </button>
                );
              })}
              {filteredEvents.length > 5 && (
                <p className="text-[10px] text-center text-secondary/40 font-bold pt-1">
                  +{filteredEvents.length - 5} more
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* My Communities */}
      <motion.div variants={itemVariants} className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest">
            My Communities<span className="text-accent">.</span>
          </h3>
          <span className="text-[9px] font-bold text-secondary/30 uppercase tracking-widest">
            {communities.length} communities
          </span>
        </div>

        {communities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-[20px] bg-secondary/5 border border-secondary/10 flex items-center justify-center">
              <Users size={28} className="text-secondary/30" />
            </div>
            <p className="text-sm text-secondary/50 font-bold mb-1">No communities yet</p>
            <p className="text-[11px] text-secondary/30 max-w-[200px] mx-auto">Build your tribe by creating a community around your events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map((community) => {
              const fullCommunity = allCommunities.find(c => c.id === community.id) || community;
              return (
                <button
                  key={community.id}
                  onClick={() => { playTap(); hapticTap(); setSelectedTribe(fullCommunity); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary/10 shrink-0 flex items-center justify-center text-lg">
                    {community.avatar || '🏘️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-secondary truncate">{community.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-secondary/40 font-medium">
                        {community.members ?? 0} members
                      </span>
                      {(community.members ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          <TrendingUp size={8} />
                          active
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-secondary/30 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
      </>
      )}
    </motion.div>
  );
}

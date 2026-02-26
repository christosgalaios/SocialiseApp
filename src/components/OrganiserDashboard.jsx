import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, TrendingUp, Plus, Megaphone,
  ChevronRight, BarChart3, Globe, Pencil, Clock, History, RefreshCw, Share2, Sparkles,
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

const getRelativeDate = (dateStr) => {
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return dateStr;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return dateStr;
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
  const setShowTribeDiscovery = useCommunityStore((s) => s.setShowTribeDiscovery);
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

  const nextEvent = useMemo(() => {
    if (upcomingEvents.length === 0) return null;
    const now = new Date();
    const sorted = [...upcomingEvents]
      .map(e => ({ ...e, _date: new Date(e.date) }))
      .filter(e => !isNaN(e._date.getTime()) && e._date >= now)
      .sort((a, b) => a._date - b._date);
    if (sorted.length === 0) return null;
    const next = sorted[0];
    const diffMs = next._date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let countdown = '';
    if (diffDays > 0) countdown = `${diffDays}d ${diffHours}h`;
    else if (diffHours > 0) countdown = `${diffHours}h`;
    else countdown = 'Starting soon';
    return { ...next, countdown };
  }, [upcomingEvents]);

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

        {/* Event count summary */}
        {events.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
              <Clock size={10} />
              {upcomingEvents.length} upcoming
            </span>
            <span className="text-secondary/20">|</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary/40">
              <History size={10} />
              {pastEvents.length} past
            </span>
            <span className="text-secondary/20">|</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary/40">
              <Users size={10} />
              {communities.length} communities
            </span>
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
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
          className="p-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-sm flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-lg"
        >
          <Plus size={20} />
          <span className="text-[10px]">New Event</span>
        </button>
        <button
          onClick={() => { playTap(); hapticTap(); setShowTribeDiscovery(true); }}
          className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/10 transition-colors"
        >
          <Users size={20} />
          <span className="text-[10px]">Community</span>
        </button>
        <button
          onClick={() => {
            playTap(); hapticTap();
            const profileUrl = `${window.location.origin}${window.location.pathname}?organiser=${user?.id}`;
            navigator.clipboard?.writeText(profileUrl)
              .then(() => showToast('Profile link copied!', 'success'))
              .catch(() => showToast('Could not copy link', 'error'));
          }}
          className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/10 transition-colors"
        >
          <Share2 size={20} />
          <span className="text-[10px]">Share</span>
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

          {/* Top Performer */}
          {events.length > 0 && (() => {
            const best = [...events].sort((a, b) => {
              const fillA = a.spots > 0 ? a.attendees / a.spots : 0;
              const fillB = b.spots > 0 ? b.attendees / b.spots : 0;
              return fillB - fillA;
            })[0];
            const bestFill = best?.spots > 0 ? Math.round((best.attendees / best.spots) * 100) : 0;
            return (
              <div className="premium-card p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <TrendingUp size={16} className="text-accent" />
                  </div>
                  <h3 className="text-xs font-black text-accent uppercase tracking-widest">Top Performer</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-secondary/10 shrink-0">
                    {best?.image && <img src={best.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-secondary truncate">{best?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-accent">{bestFill}% filled</span>
                      <span className="text-secondary/20">|</span>
                      <span className="text-[11px] font-medium text-secondary/50">{best?.attendees}/{best?.spots} spots</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Category Distribution */}
          {events.length > 0 && (() => {
            const catCounts = {};
            events.forEach(e => {
              const cat = e.category || 'Other';
              catCounts[cat] = (catCounts[cat] || 0) + 1;
            });
            const sorted = Object.entries(catCounts).sort(([, a], [, b]) => b - a);
            const total = events.length;
            return (
              <div className="premium-card p-6">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">
                  Event Categories<span className="text-accent">.</span>
                </h3>
                <div className="space-y-3">
                  {sorted.map(([cat, count]) => {
                    const pct = Math.round((count / total) * 100);
                    const catData = CATEGORIES.find(c => c.id === cat);
                    const Icon = catData?.icon;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                          {Icon ? <Icon size={14} className="text-primary" /> : <Calendar size={14} className="text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-secondary">{cat}</span>
                            <span className="text-[10px] font-black text-secondary/50">{count} event{count !== 1 ? 's' : ''} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-primary/60"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Attendance rate */}
          {events.length > 0 ? (
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
              <div className="mt-4 pt-4 border-t border-secondary/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-secondary/40">Average fill rate</span>
                <span className="text-sm font-black text-primary">
                  {Math.round(events.reduce((sum, e) => sum + (e.spots > 0 ? (e.attendees / e.spots) * 100 : 0), 0) / Math.max(events.length, 1))}%
                </span>
              </div>
            </div>
          ) : (
            <div className="premium-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-[20px] bg-accent/5 border border-accent/10 flex items-center justify-center">
                <Sparkles size={28} className="text-accent/40" />
              </div>
              <h4 className="text-sm font-black text-secondary mb-1">No analytics yet</h4>
              <p className="text-[11px] text-secondary/40 max-w-[220px] mx-auto mb-4">
                Create your first event and watch your analytics come to life
              </p>
              <button
                onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold active:scale-95 transition-transform"
              >
                <Plus size={14} />
                Create Your First Event
              </button>
            </div>
          )}
        </motion.div>
      ) : (
      <>

      {/* Next Event Countdown */}
      {nextEvent && (
        <motion.div variants={itemVariants} className="premium-card p-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-secondary/10 shrink-0">
              {nextEvent.image && <img src={nextEvent.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-0.5">Next Event</p>
              <p className="text-sm font-bold text-secondary truncate">{nextEvent.title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-primary leading-tight">{nextEvent.countdown}</p>
              <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">until start</p>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Events + Communities responsive grid */}
      <div className="grid gap-6 lg:grid-cols-2">

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
                const relDate = getRelativeDate(event.date);
                const isLive = relDate === 'Today';
                const isSoldOut = fillPct >= 100;
                const isAlmostFull = fillPct >= 80 && !isSoldOut;
                return (
                  <button
                    key={event.id}
                    onClick={() => { playTap(); hapticTap(); setSelectedEvent(fullEvent); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/10 shrink-0 relative">
                      {event.image && <img src={event.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                      {isLive && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-paper animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-secondary truncate">{event.title}</p>
                        {isSoldOut && (
                          <span className="shrink-0 text-[8px] font-black text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 uppercase">Sold Out</span>
                        )}
                        {isAlmostFull && (
                          <span className="shrink-0 text-[8px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded-full border border-accent/20 uppercase">Almost Full</span>
                        )}
                        {isLive && (
                          <span className="shrink-0 text-[8px] font-black text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20 uppercase">Live</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${relDate === 'Today' ? 'text-green-600 font-bold' : relDate === 'Tomorrow' ? 'text-primary font-bold' : 'text-secondary/40'}`}>{relDate}</span>
                        <span className="text-[10px] text-secondary/30">|</span>
                        <span className={`text-[10px] font-bold ${fillPct >= 80 ? 'text-accent' : 'text-primary'}`}>
                          <Users size={10} className="inline mr-0.5" />
                          {event.attendees}/{event.spots}
                        </span>
                      </div>
                      {/* Mini fill bar */}
                      <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isSoldOut ? 'bg-red-500' : fillPct >= 80 ? 'bg-accent' : 'bg-primary/60'}`}
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

      </div>{/* end responsive grid */}
      </>
      )}
    </motion.div>
  );
}

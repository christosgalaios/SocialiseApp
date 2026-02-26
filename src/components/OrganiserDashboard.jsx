import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, TrendingUp, Plus, Megaphone,
  ChevronRight, BarChart3, Globe, Pencil, Clock, History,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import OrganiserStatsCard from './OrganiserStatsCard';
import { DEFAULT_AVATAR, ORGANISER_SOCIAL_PLATFORMS } from '../data/constants';
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

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('upcoming');

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const data = await api.getOrganiserStats();
        if (cancelled) return;
        setStats(data.stats);
        setEvents(data.events);
        setCommunities(data.communities);
      } catch {
        if (!cancelled) showToast('Failed to load organiser stats', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button
            onClick={() => { playTap(); hapticTap(); setShowOrganiserEditProfile(true); }}
            className="w-10 h-10 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center hover:bg-secondary/10 transition-colors shrink-0"
            aria-label="Edit organiser profile"
          >
            <Pencil size={16} className="text-secondary/60" />
          </button>
        </div>

        {user?.organiserBio && (
          <p className="text-sm text-secondary/60 font-medium leading-relaxed mb-3">{user.organiserBio}</p>
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
            <Calendar size={32} className="text-secondary/20 mx-auto mb-2" />
            <p className="text-sm text-secondary/40 font-medium">No events yet</p>
            <p className="text-[11px] text-secondary/30">Create your first event to get started</p>
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
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10">
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
                  </div>
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
            <Users size={32} className="text-secondary/20 mx-auto mb-2" />
            <p className="text-sm text-secondary/40 font-medium">No communities yet</p>
            <p className="text-[11px] text-secondary/30">Build your tribe by creating a community</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map((community) => (
              <div key={community.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary/10 shrink-0 flex items-center justify-center text-lg">
                  {community.avatar || '🏘️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary truncate">{community.name}</p>
                  <span className="text-[10px] text-secondary/40 font-medium">
                    {community.members ?? 0} members
                  </span>
                </div>
                <ChevronRight size={16} className="text-secondary/30 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

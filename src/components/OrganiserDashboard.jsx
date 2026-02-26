import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, TrendingUp, Plus, Megaphone,
  ChevronRight, BarChart3, Globe, Pencil, Clock, History, RefreshCw, Share2, Sparkles,
  Pin, DollarSign, UserCheck, Repeat, Copy, StickyNote, Activity, Search, Download, ArrowUpRight,
  AlertTriangle, Award, Target, Zap, Settings, CheckSquare, Square, ChevronDown, X, Check,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import useEventStore from '../stores/eventStore';
import useCommunityStore from '../stores/communityStore';
import OrganiserStatsCard from './OrganiserStatsCard';
import { DEFAULT_AVATAR, ORGANISER_SOCIAL_PLATFORMS, CATEGORIES } from '../data/constants';
import { playTap, playClick, playSuccess, hapticTap } from '../utils/feedback';
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
  const [pinnedEventIds, setPinnedEventIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('socialise_pinned_events') || '[]');
    } catch { return []; }
  });
  const [eventNotes, setEventNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('socialise_event_notes') || '{}');
    } catch { return {}; }
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [hiddenWidgets, setHiddenWidgets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('socialise_hidden_widgets') || '[]');
    } catch { return []; }
  });
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [eventChecklists, setEventChecklists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('socialise_event_checklists') || '{}');
    } catch { return {}; }
  });
  const [expandedChecklist, setExpandedChecklist] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      const data = await api.getOrganiserStats();
      setStats(data.stats);
      setEvents(data.events);
      setCommunities(data.communities);
      if (!silent) showToast('Dashboard refreshed', 'success');
    } catch {
      if (!silent) showToast('Failed to load organiser stats', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard(true)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchDashboard]);

  const isRefreshingRef = useRef(false);
  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    playClick(); hapticTap();
    await fetchDashboard(false);
    isRefreshingRef.current = false;
    setIsRefreshing(false);
  }, [fetchDashboard]);

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

  const togglePin = useCallback((eventId) => {
    setPinnedEventIds(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      localStorage.setItem('socialise_pinned_events', JSON.stringify(next));
      return next;
    });
    playTap(); hapticTap();
  }, []);

  const handleDuplicateEvent = useCallback((event) => {
    const duplicated = {
      title: `${event.title} (Copy)`,
      category: event.category,
      location: event.location,
      spots: event.spots,
      price: event.price,
      image: event.image,
      description: event.description,
    };
    localStorage.setItem('socialise_prefill_event', JSON.stringify(duplicated));
    onCreateEvent?.();
    showToast('Event duplicated — edit and save', 'info');
    playClick(); hapticTap();
  }, [onCreateEvent, showToast]);

  const saveNote = useCallback((eventId) => {
    setEventNotes(prev => {
      const next = { ...prev };
      if (noteText.trim()) {
        next[eventId] = noteText.trim();
      } else {
        delete next[eventId];
      }
      localStorage.setItem('socialise_event_notes', JSON.stringify(next));
      return next;
    });
    setEditingNoteId(null);
    setNoteText('');
  }, [noteText]);

  const weeklyActivity = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date?.startsWith(dayStr));
      const attendees = dayEvents.reduce((sum, e) => sum + (e.attendees ?? 0), 0);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        events: dayEvents.length,
        attendees,
      });
    }
    const maxAttendees = Math.max(...days.map(d => d.attendees), 1);
    return { days, maxAttendees };
  }, [events]);

  const sortedFilteredEvents = useMemo(() => {
    let results = filteredEvents;
    if (eventSearch.trim()) {
      const q = eventSearch.toLowerCase();
      results = results.filter(e => e.title?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q));
    }
    const pinned = results.filter(e => pinnedEventIds.includes(e.id));
    const unpinned = results.filter(e => !pinnedEventIds.includes(e.id));
    return [...pinned, ...unpinned];
  }, [filteredEvents, pinnedEventIds, eventSearch]);

  const revenueInsights = useMemo(() => {
    if (events.length === 0) return null;
    let totalRevenue = 0;
    let paidEvents = 0;
    events.forEach(e => {
      const price = parseFloat(e.price);
      if (price > 0) {
        totalRevenue += price * (e.attendees ?? 0);
        paidEvents++;
      }
    });
    const avgTicket = paidEvents > 0 ? totalRevenue / events.reduce((sum, e) => sum + (parseFloat(e.price) > 0 ? e.attendees ?? 0 : 0), 0) : 0;
    return { totalRevenue, paidEvents, avgTicket: Math.round(avgTicket * 100) / 100 };
  }, [events]);

  const audienceInsights = useMemo(() => {
    if (events.length === 0) return null;
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees ?? 0), 0);
    const avgPerEvent = Math.round(totalAttendees / events.length);
    const totalSpots = events.reduce((sum, e) => sum + (e.spots ?? 0), 0);
    const overallFill = totalSpots > 0 ? Math.round((totalAttendees / totalSpots) * 100) : 0;
    const bestEvent = [...events].sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0))[0];
    return { avgPerEvent, overallFill, totalAttendees, bestEvent };
  }, [events]);

  const attentionAlerts = useMemo(() => {
    const alerts = [];
    const now = new Date();
    upcomingEvents.forEach(e => {
      const eventDate = new Date(e.date);
      const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
      const fill = e.spots > 0 ? (e.attendees / e.spots) * 100 : 0;
      if (daysUntil <= 3 && daysUntil >= 0 && fill < 50) {
        alerts.push({ event: e, type: 'low-fill', message: `"${e.title}" is only ${Math.round(fill)}% filled and starts in ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `${daysUntil} days`}` });
      } else if (fill >= 100) {
        alerts.push({ event: e, type: 'sold-out', message: `"${e.title}" is sold out — consider adding more spots` });
      }
    });
    return alerts;
  }, [upcomingEvents]);

  const milestones = useMemo(() => {
    const hosted = stats?.eventsHosted ?? 0;
    const attendees = stats?.totalAttendees ?? 0;
    const items = [
      { label: 'First Event', target: 1, current: hosted, icon: Calendar, unlocked: hosted >= 1 },
      { label: '5 Events', target: 5, current: hosted, icon: Target, unlocked: hosted >= 5 },
      { label: '10 Events', target: 10, current: hosted, icon: Award, unlocked: hosted >= 10 },
      { label: '50 Attendees', target: 50, current: attendees, icon: Users, unlocked: attendees >= 50 },
      { label: '100 Attendees', target: 100, current: attendees, icon: Zap, unlocked: attendees >= 100 },
    ];
    return items;
  }, [stats]);

  const exportAnalytics = useCallback(() => {
    const lines = [
      `Organiser Analytics — ${user?.organiserDisplayName || user?.name}`,
      `Exported: ${new Date().toLocaleDateString()}`,
      '',
      'PERFORMANCE',
      `Events Hosted: ${stats?.eventsHosted ?? 0}`,
      `Total Attendees: ${stats?.totalAttendees ?? 0}`,
      `Active Events: ${stats?.activeEvents ?? 0}`,
      `Community Members: ${stats?.totalCommunityMembers ?? 0}`,
      '',
      'EVENTS',
      ...events.map(e => {
        const fill = e.spots > 0 ? Math.round((e.attendees / e.spots) * 100) : 0;
        return `  ${e.title} — ${e.attendees}/${e.spots} (${fill}%) — ${e.date}`;
      }),
    ];
    if (revenueInsights?.paidEvents > 0) {
      lines.push('', 'REVENUE',
        `Est. Revenue: $${Math.round(revenueInsights.totalRevenue)}`,
        `Paid Events: ${revenueInsights.paidEvents}`,
        `Avg Ticket: $${revenueInsights.avgTicket}`,
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Analytics exported', 'success');
    playClick();
    setExportDone(true);
    setTimeout(() => setExportDone(false), 1500);
  }, [user, stats, events, revenueInsights, showToast]);

  const handleCreateCommunity = useCallback(async () => {
    if (isCreatingCommunity || !newCommunityName.trim()) return;
    setIsCreatingCommunity(true);
    try {
      await api.createCommunity({
        name: newCommunityName.trim(),
        description: newCommunityDesc.trim() || null,
        category: user?.organiserCategories?.[0] || 'Social',
      });
      playSuccess();
      showToast('Community created!', 'success');
      setNewCommunityName('');
      setNewCommunityDesc('');
      setShowCreateCommunity(false);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.message || 'Failed to create community', 'error');
    } finally {
      setIsCreatingCommunity(false);
    }
  }, [isCreatingCommunity, newCommunityName, newCommunityDesc, user, showToast, fetchDashboard]);

  const toggleWidget = useCallback((widgetId) => {
    setHiddenWidgets(prev => {
      const next = prev.includes(widgetId) ? prev.filter(w => w !== widgetId) : [...prev, widgetId];
      localStorage.setItem('socialise_hidden_widgets', JSON.stringify(next));
      return next;
    });
  }, []);

  const isWidgetVisible = useCallback((widgetId) => !hiddenWidgets.includes(widgetId), [hiddenWidgets]);

  const DEFAULT_CHECKLIST = [
    { id: 'venue', label: 'Confirm venue' },
    { id: 'promo', label: 'Share on socials' },
    { id: 'remind', label: 'Send reminders' },
    { id: 'prep', label: 'Prepare materials' },
  ];

  const getChecklist = useCallback((eventId) => {
    return eventChecklists[eventId] || DEFAULT_CHECKLIST.map(item => ({ ...item, done: false }));
  }, [eventChecklists]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChecklistItem = useCallback((eventId, itemId) => {
    setEventChecklists(prev => {
      const list = prev[eventId] || DEFAULT_CHECKLIST.map(item => ({ ...item, done: false }));
      const next = { ...prev, [eventId]: list.map(item => item.id === itemId ? { ...item, done: !item.done } : item) };
      localStorage.setItem('socialise_event_checklists', JSON.stringify(next));
      return next;
    });
    playTap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  const handleKeyboard = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'n' || e.key === 'N') { onCreateEvent?.(); }
    if (e.key === 'r' || e.key === 'R') { handleRefresh(); }
    if (e.key === 'c' || e.key === 'C') { setShowTribeDiscovery(true); }
    if (e.key === 'e' || e.key === 'E') { setShowOrganiserEditProfile(true); }
  }, [onCreateEvent, handleRefresh, setShowTribeDiscovery, setShowOrganiserEditProfile]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTagline = () => {
    const hosted = stats?.eventsHosted ?? 0;
    const attendees = stats?.totalAttendees ?? 0;
    const active = stats?.activeEvents ?? 0;
    if (hosted === 0) return 'Ready to create your first event?';
    if (active >= 3) return `${active} events running — you're on fire`;
    if (attendees >= 100) return `${attendees} people reached and counting`;
    if (upcomingEvents.length > 0) return `${upcomingEvents.length} upcoming — keep the momentum`;
    if (hosted >= 10) return 'A seasoned organiser — impressive';
    if (attendees > 0) return `${attendees} people connected through your events`;
    return 'Your community is waiting';
  };

  const getOrganiserTier = () => {
    const hosted = stats?.eventsHosted ?? 0;
    if (hosted >= 20) return { label: 'Gold', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '👑' };
    if (hosted >= 5) return { label: 'Silver', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: '⭐' };
    return { label: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '🌱' };
  };

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
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[76px] rounded-2xl bg-secondary/10" />
          ))}
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
      {/* Greeting */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-0.5">Dashboard</p>
          <h1 className="text-2xl font-black text-secondary tracking-tight">
            {getGreeting()}<span className="text-accent">,</span> {(user?.organiserDisplayName || user?.name)?.split(' ')[0]}<span className="text-accent">.</span>
          </h1>
          {stats && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-[11px] font-medium text-secondary/40 mt-0.5"
            >
              {getTagline()}
            </motion.p>
          )}
        </div>
        {stats && (() => {
          const tier = getOrganiserTier();
          return (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.3 }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 ${tier.bg} rounded-full border ${tier.border} ${tier.color} text-[10px] font-black`}
            >
              {tier.icon} {tier.label}
            </motion.span>
          );
        })()}
      </motion.div>

      {/* Attention Alerts */}
      {isWidgetVisible('alerts') && attentionAlerts.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          {attentionAlerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                alert.type === 'low-fill'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-green-500/5 border-green-500/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                alert.type === 'low-fill' ? 'bg-amber-500/10' : 'bg-green-500/10'
              }`}>
                <AlertTriangle size={14} className={alert.type === 'low-fill' ? 'text-amber-500' : 'text-green-600'} />
              </div>
              <p className="text-[11px] font-medium text-secondary/70 flex-1">{alert.message}</p>
              <button
                onClick={() => {
                  const fullEvent = allEvents.find(e => e.id === alert.event.id) || alert.event;
                  playTap(); hapticTap(); setSelectedEvent(fullEvent);
                }}
                className="text-[10px] font-bold text-primary hover:underline shrink-0"
              >
                View
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

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
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { playTap(); setShowWidgetSettings(!showWidgetSettings); }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                showWidgetSettings ? 'bg-primary/10 text-primary' : 'bg-secondary/5 border border-secondary/10 text-secondary/60 hover:bg-secondary/10'
              }`}
              aria-label="Dashboard settings"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-9 h-9 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center hover:bg-secondary/10 transition-colors disabled:opacity-50"
              aria-label="Refresh dashboard (R)"
              title="Refresh (R)"
            >
              <RefreshCw size={14} className={`text-secondary/60 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { playTap(); hapticTap(); setShowOrganiserEditProfile(true); }}
              className="w-9 h-9 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center hover:bg-secondary/10 transition-colors"
              aria-label="Edit organiser profile"
            >
              <Pencil size={14} className="text-secondary/60" />
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

        {/* Stat badges */}
        {stats && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {upcomingEvents.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/5 border border-green-500/10 text-[10px] font-bold text-green-600">
                <Clock size={10} />
                {upcomingEvents.length} upcoming
              </span>
            )}
            {pastEvents.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/5 border border-secondary/10 text-[10px] font-bold text-secondary/40">
                <History size={10} />
                {pastEvents.length} past
              </span>
            )}
            {communities.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/5 border border-secondary/10 text-[10px] font-bold text-secondary/40">
                <Users size={10} />
                {communities.length} communities
              </span>
            )}
            {(stats.totalAttendees ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary">
                <TrendingUp size={10} />
                {stats.totalAttendees} total attendees
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => { playTap(); onSwitchToAttendee(); }}
          className="text-[10px] font-black text-secondary/40 uppercase tracking-widest hover:text-secondary/60 transition-colors"
        >
          Switch to attendee view
        </button>
      </motion.div>

      {/* Widget Settings Panel */}
      <AnimatePresence>
        {showWidgetSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="premium-card p-4 space-y-2">
              <h4 className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2">Show/Hide Sections</h4>
              {[
                { id: 'alerts', label: 'Attention Alerts' },
                { id: 'completeness', label: 'Profile Completeness' },
                { id: 'milestones', label: 'Milestones' },
                { id: 'activity', label: 'Weekly Activity' },
                { id: 'countdown', label: 'Next Event Countdown' },
              ].map(widget => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-secondary/5 transition-colors text-left"
                >
                  {isWidgetVisible(widget.id) ? (
                    <CheckSquare size={14} className="text-primary shrink-0" />
                  ) : (
                    <Square size={14} className="text-secondary/30 shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${isWidgetVisible(widget.id) ? 'text-secondary' : 'text-secondary/40'}`}>{widget.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Completeness */}
      {isWidgetVisible('completeness') && (() => {
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
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
          className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-black text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          <Plus size={20} />
          <span className="text-[10px]">New Event</span>
          <kbd className="hidden md:inline text-[8px] font-mono text-white/50 bg-white/10 px-1 rounded">N</kbd>
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playTap(); hapticTap(); setShowTribeDiscovery(true); }}
          className="p-3 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/10 transition-colors"
        >
          <Users size={20} />
          <span className="text-[10px]">Community</span>
          <kbd className="hidden md:inline text-[8px] font-mono text-secondary/30 bg-secondary/5 px-1 rounded">C</kbd>
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playTap(); hapticTap(); setShowOrganiserEditProfile(true); }}
          className="p-3 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/10 transition-colors"
        >
          <Pencil size={20} />
          <span className="text-[10px]">Edit</span>
          <kbd className="hidden md:inline text-[8px] font-mono text-secondary/30 bg-secondary/5 px-1 rounded">E</kbd>
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTap(); hapticTap();
            const profileUrl = `${window.location.origin}${window.location.pathname}?organiser=${user?.id}`;
            navigator.clipboard?.writeText(profileUrl)
              .then(() => showToast('Profile link copied!', 'success'))
              .catch(() => showToast('Could not copy link', 'error'));
          }}
          className="p-3 rounded-2xl bg-secondary/5 border border-secondary/10 font-bold text-sm text-secondary flex flex-col items-center justify-center gap-1.5 hover:bg-secondary/10 transition-colors"
        >
          <Share2 size={20} />
          <span className="text-[10px]">Share</span>
        </motion.button>
      </motion.div>

      {/* Dashboard Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 bg-secondary/5 rounded-2xl border border-secondary/10 relative">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { playTap(); setOrganiserDashboardTab(tab.key); }}
            className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors relative z-[1]"
            style={{ color: organiserDashboardTab === tab.key ? 'var(--primary)' : undefined }}
          >
            {organiserDashboardTab === tab.key && (
              <motion.div
                layoutId="dashboard-tab-pill"
                className="absolute inset-0 bg-paper rounded-xl shadow-sm"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className={organiserDashboardTab === tab.key ? '' : 'text-secondary/40 hover:text-secondary/60'}>
              {tab.label}
            </span>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                Your Performance<span className="text-accent">.</span>
              </h3>
              <motion.button
                onClick={exportAnalytics}
                whileTap={{ scale: 0.94 }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-colors ${
                  exportDone ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-secondary/5 border-secondary/10 text-secondary/50 hover:text-secondary/70'
                }`}
                aria-label="Export analytics"
              >
                {exportDone ? <Check size={10} /> : <Download size={10} />}
                {exportDone ? 'Done' : 'Export'}
              </motion.button>
            </div>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <TrendingUp size={16} className="text-accent" />
                    </div>
                    <h3 className="text-xs font-black text-accent uppercase tracking-widest">Top Performer</h3>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bestFill >= 80 ? 'text-accent bg-accent/10 border border-accent/20' : 'text-primary bg-primary/10 border border-primary/20'}`}
                  >
                    {bestFill}%
                  </motion.span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-secondary/10 shrink-0">
                    {best?.image && <img src={best.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-secondary truncate">{best?.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] font-medium text-secondary/50">{best?.attendees}/{best?.spots} spots</span>
                      {best?.category && (
                        <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{best.category}</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-secondary/10 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${bestFill >= 80 ? 'bg-accent/60' : 'bg-primary/50'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(bestFill, 100)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                      />
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
                  {sorted.map(([cat, count], idx) => {
                    const pct = Math.round((count / total) * 100);
                    const catData = CATEGORIES.find(c => c.id === cat);
                    const Icon = catData?.icon;
                    const isTop = idx === 0 && sorted.length > 1;
                    return (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.06 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 + idx * 0.06 }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isTop ? 'bg-accent/10 border-accent/20' : 'bg-primary/5 border-primary/10'
                          }`}
                        >
                          {Icon ? <Icon size={14} className={isTop ? 'text-accent' : 'text-primary'} /> : <Calendar size={14} className="text-primary" />}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-secondary">{cat}</span>
                            <span className="text-[10px] font-black text-secondary/50">{count} event{count !== 1 ? 's' : ''} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${isTop ? 'bg-accent/60' : 'bg-primary/60'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 + idx * 0.06 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Revenue Insights */}
          {revenueInsights && revenueInsights.paidEvents > 0 && (() => {
            const paidPct = events.length > 0 ? Math.round((revenueInsights.paidEvents / events.length) * 100) : 0;
            return (
            <div className="premium-card p-6 relative overflow-hidden">
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <DollarSign size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-xs font-black text-green-600 uppercase tracking-widest">Revenue Insights</h3>
                </div>
                <span className="text-[9px] font-bold text-green-600/50">{paidPct}% paid</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <motion.p
                    className="text-xl font-black text-secondary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    ${Math.round(revenueInsights.totalRevenue).toLocaleString()}
                  </motion.p>
                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">Est. Revenue</p>
                </div>
                <div>
                  <motion.p
                    className="text-xl font-black text-secondary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
                  >
                    {revenueInsights.paidEvents}
                  </motion.p>
                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">Paid Events</p>
                </div>
                <div>
                  <motion.p
                    className="text-xl font-black text-secondary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
                  >
                    ${revenueInsights.avgTicket}
                  </motion.p>
                  <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">Avg Ticket</p>
                </div>
              </div>
              {/* Paid vs free split bar */}
              <div className="mt-4 pt-3 border-t border-secondary/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-secondary/40">Paid vs Free</span>
                  <span className="text-[9px] font-bold text-secondary/40">{revenueInsights.paidEvents} paid · {events.length - revenueInsights.paidEvents} free</span>
                </div>
                <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden flex">
                  <motion.div
                    className="h-full bg-green-500/60 rounded-l-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${paidPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
            );
          })()}

          {/* Audience Insights */}
          {audienceInsights && (() => {
            const maxSpots = Math.max(...events.map(e => e.spots ?? 0), 1);
            return (
            <div className="premium-card p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserCheck size={16} className="text-primary" />
                </div>
                <h3 className="text-xs font-black text-primary uppercase tracking-widest">Audience Insights</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-secondary/40" />
                      <span className="text-[11px] font-bold text-secondary">Avg. per event</span>
                    </div>
                    <span className="text-sm font-black text-primary">{audienceInsights.avgPerEvent}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/50 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((audienceInsights.avgPerEvent / maxSpots) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} className="text-secondary/40" />
                      <span className="text-[11px] font-bold text-secondary">Overall fill rate</span>
                    </div>
                    <span className={`text-sm font-black ${audienceInsights.overallFill >= 70 ? 'text-accent' : 'text-primary'}`}>{audienceInsights.overallFill}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${audienceInsights.overallFill >= 70 ? 'bg-accent/60' : 'bg-primary/50'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${audienceInsights.overallFill}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat size={14} className="text-secondary/40" />
                    <span className="text-[11px] font-bold text-secondary">Total reach</span>
                  </div>
                  <span className="text-sm font-black text-secondary">{audienceInsights.totalAttendees} people</span>
                </div>
                {audienceInsights.bestEvent && (
                  <div className="pt-3 mt-3 border-t border-secondary/10">
                    <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1.5">Most Popular Event</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                        {audienceInsights.bestEvent.image && (
                          <img src={audienceInsights.bestEvent.image} className="w-full h-full object-cover" alt="" loading="lazy" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-secondary truncate">{audienceInsights.bestEvent.title}</p>
                        <p className="text-[10px] text-secondary/40">{audienceInsights.bestEvent.attendees} attendees</p>
                      </div>
                    </div>
                  </div>
                )}
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
                {events.slice(0, 6).map((event, idx) => {
                  const fillPct = event.spots > 0 ? Math.round((event.attendees / event.spots) * 100) : 0;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-bold text-secondary truncate max-w-[55%]">{event.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-medium text-secondary/35">{event.attendees}/{event.spots}</span>
                          <span className={`text-[11px] font-black ${fillPct >= 80 ? 'text-accent' : fillPct >= 50 ? 'text-primary' : 'text-secondary/50'}`}>{fillPct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${fillPct >= 80 ? 'bg-accent' : fillPct >= 50 ? 'bg-primary' : 'bg-secondary/30'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(fillPct, 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + idx * 0.05 }}
                        />
                      </div>
                    </motion.div>
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
            <div className="premium-card p-8 text-center relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-[24px] bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/10 flex items-center justify-center"
              >
                <Sparkles size={32} className="text-accent/50" />
              </motion.div>
              <h4 className="text-base font-black text-secondary mb-1">Your Analytics Await</h4>
              <p className="text-[11px] text-secondary/40 max-w-[240px] mx-auto mb-2">
                Create your first event and watch your dashboard come to life with real-time insights
              </p>
              <div className="flex justify-center gap-4 mb-5">
                {['Fill rates', 'Revenue', 'Audience'].map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-[9px] font-bold text-primary/50 bg-primary/5 px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
              <button
                onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold active:scale-95 transition-transform shadow-lg"
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
      {isWidgetVisible('countdown') && nextEvent && (() => {
        const nextFillPct = nextEvent.spots > 0 ? Math.round((nextEvent.attendees / nextEvent.spots) * 100) : 0;
        return (
        <motion.div variants={itemVariants} className="premium-card p-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-secondary/10 shrink-0 relative">
              {nextEvent.image && <img src={nextEvent.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-0.5">Next Event</p>
              <p className="text-sm font-bold text-secondary truncate">{nextEvent.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold ${nextFillPct >= 80 ? 'text-accent' : 'text-primary'}`}>
                  {nextEvent.attendees}/{nextEvent.spots} spots
                </span>
                <div className="flex-1 max-w-[80px] h-1 bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${nextFillPct >= 100 ? 'bg-red-500' : nextFillPct >= 80 ? 'bg-accent' : 'bg-primary/60'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(nextFillPct, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <motion.p
                className="text-lg font-black text-primary leading-tight"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
              >
                {nextEvent.countdown}
              </motion.p>
              <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">until start</p>
            </div>
          </div>
        </motion.div>
        );
      })()}

      {/* Weekly Activity */}
      {isWidgetVisible('activity') && events.length > 0 && (() => {
        const totalWeekAttendees = weeklyActivity.days.reduce((s, d) => s + d.attendees, 0);
        const totalWeekEvents = weeklyActivity.days.reduce((s, d) => s + d.events, 0);
        return (
        <motion.div variants={itemVariants} className="premium-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity size={16} className="text-primary" />
              </div>
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">This Week</h3>
            </div>
            <span className="text-[9px] font-bold text-secondary/35">{totalWeekEvents} events · {totalWeekAttendees} attendees</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-20">
            {weeklyActivity.days.map((day, i) => {
              const isToday = i === weeklyActivity.days.length - 1;
              const barColor = isToday ? 'bg-accent' : day.events > 0 ? 'bg-primary/60' : 'bg-secondary/20';
              return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 relative group">
                {day.attendees > 0 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">{day.attendees}</span>
                  </div>
                )}
                <motion.div
                  className={`w-full rounded-t-lg ${barColor}`}
                  style={{ minHeight: 2 }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((day.attendees / weeklyActivity.maxAttendees) * 100, 5)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.05 }}
                  title={`${day.attendees} attendees, ${day.events} event${day.events !== 1 ? 's' : ''}`}
                />
              </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            {weeklyActivity.days.map((day, i) => {
              const isToday = i === weeklyActivity.days.length - 1;
              return (
              <div key={i} className="flex-1 text-center">
                <span className={`text-[8px] font-bold uppercase ${isToday ? 'text-accent' : 'text-secondary/30'}`}>{day.label}</span>
                {day.events > 0 && <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${isToday ? 'bg-accent' : 'bg-green-500/50'}`} />}
              </div>
              );
            })}
          </div>
        </motion.div>
        );
      })()}

      {/* Milestones */}
      {isWidgetVisible('milestones') && (
      <motion.div variants={itemVariants} className="premium-card p-5">
        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
          Milestones<span className="text-accent">.</span>
        </h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {milestones.map((m) => {
            const pct = Math.min(Math.round((m.current / m.target) * 100), 100);
            return (
              <div
                key={m.label}
                className={`shrink-0 w-24 p-3 rounded-2xl border text-center transition-all ${
                  m.unlocked ? 'bg-accent/5 border-accent/20' : 'bg-secondary/5 border-secondary/10'
                }`}
              >
                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                  m.unlocked ? 'bg-accent/10' : 'bg-secondary/10'
                }`}>
                  <m.icon size={18} className={m.unlocked ? 'text-accent' : 'text-secondary/30'} />
                </div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${m.unlocked ? 'text-accent' : 'text-secondary/40'}`}>
                  {m.label}
                </p>
                {!m.unlocked && (
                  <div className="w-full h-1 bg-secondary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                )}
                {m.unlocked && <p className="text-[8px] font-bold text-accent">Unlocked</p>}
              </div>
            );
          })}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors relative"
              >
                {eventFilter === tab.key && (
                  <motion.div
                    layoutId="event-filter-pill"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className={`relative z-[1] flex items-center gap-1.5 ${eventFilter === tab.key ? 'text-primary' : 'text-secondary/50'}`}>
                  <tab.icon size={12} />
                  {tab.label}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    eventFilter === tab.key ? 'bg-primary/20 text-primary' : 'bg-secondary/10 text-secondary/40'
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Event search */}
        {events.length > 3 && (
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/30" />
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search events..."
              className={`w-full pl-9 py-2 rounded-xl bg-secondary/5 border border-secondary/10 text-xs text-[var(--text)] placeholder:text-secondary/30 outline-none focus:border-primary/30 transition-colors ${eventSearch ? 'pr-8' : 'pr-3'}`}
            />
            {eventSearch && (
              <button
                onClick={() => setEventSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                aria-label="Clear search"
              >
                <X size={10} className="text-secondary/50" />
              </button>
            )}
            {eventSearch.trim() && (
              <p className="text-[9px] font-bold text-secondary/30 mt-1">
                {sortedFilteredEvents.length} result{sortedFilteredEvents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-3 rounded-[20px] bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 flex items-center justify-center"
            >
              <Calendar size={28} className="text-primary/40" />
            </motion.div>
            <p className="text-sm text-secondary/50 font-bold mb-1">No events yet</p>
            <p className="text-[11px] text-secondary/30 mb-4 max-w-[200px] mx-auto">Create your first event and start building your audience</p>
            <button
              onClick={() => { playClick(); hapticTap(); onCreateEvent?.(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              Create Event
            </button>
          </div>
        ) : sortedFilteredEvents.length === 0 ? (
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
              {(showAllEvents ? sortedFilteredEvents : sortedFilteredEvents.slice(0, 5)).map((event, idx) => {
                const fillPct = event.spots > 0 ? Math.round((event.attendees / event.spots) * 100) : 0;
                const fullEvent = allEvents.find(e => e.id === event.id) || event;
                const relDate = getRelativeDate(event.date);
                const isLive = relDate === 'Today';
                const isSoldOut = fillPct >= 100;
                const isAlmostFull = fillPct >= 80 && !isSoldOut;
                const isPinned = pinnedEventIds.includes(event.id);
                const note = eventNotes[event.id];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="space-y-1"
                  >
                    <button
                      onClick={() => { playTap(); hapticTap(); setSelectedEvent(fullEvent); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border hover:bg-secondary/10 transition-colors text-left ${
                        isPinned ? 'bg-accent/5 border-accent/20' : 'bg-secondary/5 border-secondary/10'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/10 shrink-0 relative">
                        {event.image && <img src={event.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                        {isLive && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-paper animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isPinned && <Pin size={10} className="text-accent shrink-0" />}
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
                          {event.time && (
                            <>
                              <span className="text-[10px] text-secondary/20">·</span>
                              <span className="text-[10px] text-secondary/40 font-medium">{event.time}</span>
                            </>
                          )}
                          <span className="text-[10px] text-secondary/20">·</span>
                          <span className={`text-[10px] font-bold ${fillPct >= 80 ? 'text-accent' : 'text-primary'}`}>
                            <Users size={10} className="inline mr-0.5" />
                            {event.attendees}/{event.spots}
                          </span>
                          {parseFloat(event.price) > 0 && (
                            <>
                              <span className="text-[10px] text-secondary/20">·</span>
                              <span className="text-[10px] font-bold text-green-600">${event.price}</span>
                            </>
                          )}
                        </div>
                        {/* Mini fill bar */}
                        <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isSoldOut ? 'bg-red-500' : fillPct >= 80 ? 'bg-accent' : 'bg-primary/60'}`}
                            style={{ width: `${Math.min(fillPct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); togglePin(event.id); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); togglePin(event.id); } }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isPinned ? 'bg-accent/10 text-accent' : 'text-secondary/20 hover:text-secondary/40'
                          }`}
                          aria-label={isPinned ? 'Unpin event' : 'Pin event'}
                        >
                          <Pin size={12} />
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); handleDuplicateEvent(event); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDuplicateEvent(event); } }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/20 hover:text-secondary/40 transition-colors"
                          aria-label="Duplicate event"
                        >
                          <Copy size={12} />
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(editingNoteId === event.id ? null : event.id);
                            setNoteText(eventNotes[event.id] || '');
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setEditingNoteId(editingNoteId === event.id ? null : event.id); setNoteText(eventNotes[event.id] || ''); } }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            note ? 'bg-primary/10 text-primary' : 'text-secondary/20 hover:text-secondary/40'
                          }`}
                          aria-label={note ? 'Edit note' : 'Add note'}
                        >
                          <StickyNote size={12} />
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-secondary/30 shrink-0" />
                    </button>
                    {/* Note display */}
                    {note && editingNoteId !== event.id && (
                      <div className="ml-3 flex items-start gap-2 p-2 rounded-xl bg-primary/5 border border-primary/10">
                        <StickyNote size={10} className="text-primary/40 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-secondary/60 italic leading-relaxed">{note}</p>
                      </div>
                    )}
                    {/* Note editor */}
                    {editingNoteId === event.id && (
                      <div className="ml-3 flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveNote(event.id); if (e.key === 'Escape') setEditingNoteId(null); }}
                          placeholder="Add a quick note..."
                          className="flex-1 text-xs px-3 py-2 rounded-xl bg-secondary/5 border border-secondary/10 text-[var(--text)] placeholder:text-secondary/30 outline-none focus:border-primary/30"
                          autoFocus
                        />
                        <button
                          onClick={() => saveNote(event.id)}
                          className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                    {/* Event Checklist */}
                    {eventFilter === 'upcoming' && (() => {
                      const cl = getChecklist(event.id);
                      const doneCount = cl.filter(i => i.done).length;
                      const allDone = doneCount === cl.length;
                      return (
                      <div className="ml-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedChecklist(expandedChecklist === event.id ? null : event.id); playTap(); }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-secondary/40 hover:text-secondary/60 transition-colors"
                        >
                          <ChevronDown size={10} className={`transition-transform ${expandedChecklist === event.id ? 'rotate-180' : ''}`} />
                          <span>Pre-event checklist</span>
                          <span className={`${allDone ? 'text-green-600' : ''}`}>({doneCount}/{cl.length})</span>
                          <div className="w-12 h-1 bg-secondary/10 rounded-full overflow-hidden ml-0.5">
                            <div
                              className={`h-full rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-primary/50'}`}
                              style={{ width: `${cl.length > 0 ? (doneCount / cl.length) * 100 : 0}%` }}
                            />
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedChecklist === event.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-1.5 space-y-1"
                            >
                              {getChecklist(event.id).map(item => (
                                <button
                                  key={item.id}
                                  onClick={(e) => { e.stopPropagation(); toggleChecklistItem(event.id, item.id); }}
                                  className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/5 transition-colors text-left"
                                >
                                  {item.done ? (
                                    <CheckSquare size={12} className="text-green-600 shrink-0" />
                                  ) : (
                                    <Square size={12} className="text-secondary/30 shrink-0" />
                                  )}
                                  <span className={`text-[11px] font-medium ${item.done ? 'text-secondary/40 line-through' : 'text-secondary/70'}`}>
                                    {item.label}
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      );
                    })()}
                  </motion.div>
                );
              })}
              {sortedFilteredEvents.length > 5 && (
                <button
                  onClick={() => { playTap(); setShowAllEvents(!showAllEvents); }}
                  className="w-full py-2 text-[10px] text-center text-primary/70 font-bold hover:text-primary transition-colors"
                >
                  {showAllEvents ? 'Show less' : `View all ${sortedFilteredEvents.length} events`}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* My Communities */}
      <motion.div variants={itemVariants} className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black text-primary uppercase tracking-widest">
              My Communities<span className="text-accent">.</span>
            </h3>
            {communities.length > 0 && (() => {
              const totalMembers = communities.reduce((sum, c) => sum + (c.members ?? 0), 0);
              return totalMembers > 0 ? (
                <p className="text-[9px] font-medium text-secondary/35 mt-0.5">{totalMembers} total members</p>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-secondary/30 uppercase tracking-widest">
              {communities.length} communities
            </span>
            <button
              onClick={() => { playTap(); setShowCreateCommunity(!showCreateCommunity); }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                showCreateCommunity ? 'bg-primary/10 text-primary' : 'bg-secondary/5 border border-secondary/10 text-secondary/40 hover:text-secondary/60'
              }`}
              aria-label="Create community"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Inline Create Community Form */}
        <AnimatePresence>
          {showCreateCommunity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Quick Create</p>
                <input
                  type="text"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="Community name..."
                  className="w-full px-3 py-2.5 rounded-xl bg-paper border border-secondary/20 text-sm font-medium text-[var(--text)] placeholder:text-secondary/30 outline-none focus:border-primary transition-colors"
                  maxLength={50}
                />
                <input
                  type="text"
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="Short description (optional)..."
                  className="w-full px-3 py-2 rounded-xl bg-paper border border-secondary/20 text-xs font-medium text-[var(--text)] placeholder:text-secondary/30 outline-none focus:border-primary transition-colors"
                  maxLength={200}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCommunity}
                    disabled={!newCommunityName.trim() || isCreatingCommunity}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {isCreatingCommunity ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => { setShowCreateCommunity(false); setNewCommunityName(''); setNewCommunityDesc(''); }}
                    className="px-4 py-2.5 rounded-xl bg-secondary/5 border border-secondary/10 text-xs font-bold text-secondary/50 hover:text-secondary/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {communities.length === 0 && !showCreateCommunity ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-[20px] bg-secondary/5 border border-secondary/10 flex items-center justify-center">
              <Users size={28} className="text-secondary/30" />
            </div>
            <p className="text-sm text-secondary/50 font-bold mb-1">No communities yet</p>
            <p className="text-[11px] text-secondary/30 max-w-[200px] mx-auto mb-4">Build your tribe by creating a community around your events</p>
            <button
              onClick={() => { playTap(); setShowCreateCommunity(true); }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              Create Community
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map((community, idx) => {
              const fullCommunity = allCommunities.find(c => c.id === community.id) || community;
              const memberCount = community.members ?? 0;
              const sizeLabel = memberCount >= 100 ? 'Large' : memberCount >= 20 ? 'Growing' : memberCount > 0 ? 'Starting' : 'New';
              const sizeColor = memberCount >= 100 ? 'text-accent' : memberCount >= 20 ? 'text-green-600' : 'text-secondary/40';
              return (
                <motion.button
                  key={community.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => { playTap(); hapticTap(); setSelectedTribe(fullCommunity); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary/10 shrink-0 flex items-center justify-center text-lg">
                    {community.avatar || '🏘️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-secondary truncate">{community.name}</p>
                    {community.description && (
                      <p className="text-[10px] text-secondary/40 truncate mt-0.5">{community.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-secondary/40 font-medium">
                        {memberCount} members
                      </span>
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${sizeColor} bg-current/10 px-1.5 py-0.5 rounded-full`}>
                        <ArrowUpRight size={8} />
                        {sizeLabel}
                      </span>
                      {community.category && (
                        <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">
                          {community.category}
                        </span>
                      )}
                    </div>
                    {/* Member growth bar */}
                    <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${memberCount >= 100 ? 'bg-accent' : memberCount >= 20 ? 'bg-green-500/60' : 'bg-primary/40'}`}
                        style={{ width: `${Math.min((memberCount / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-secondary/30 shrink-0" />
                </motion.button>
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

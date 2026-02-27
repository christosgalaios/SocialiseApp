import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Globe, Megaphone, ChevronRight, ExternalLink, UserPlus, UserCheck, Clock, History, Star, TrendingUp, Share2, MessageCircle } from 'lucide-react';
import { DEFAULT_AVATAR, ORGANISER_SOCIAL_PLATFORMS, CATEGORIES } from '../data/constants';
import { playTap, playClick, hapticTap } from '../utils/feedback';
import useUIStore from '../stores/uiStore';
import useEventStore from '../stores/eventStore';
import useCommunityStore from '../stores/communityStore';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import api from '../api';

const sectionAnim = (i) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', damping: 25, stiffness: 400, delay: i * 0.06 },
});

const SOCIAL_URLS = {
  instagram: (v) => `https://instagram.com/${v.replace(/^@/, '')}`,
  tiktok: (v) => `https://tiktok.com/@${v.replace(/^@/, '')}`,
  twitter: (v) => `https://x.com/${v.replace(/^@/, '')}`,
  website: (v) => v.startsWith('http') ? v : `https://${v}`,
};

const SOCIAL_STYLES = {
  instagram: { color: 'text-pink-600', bg: 'bg-pink-500/5', border: 'border-pink-500/10', hoverBg: 'hover:bg-pink-500/10' },
  tiktok: { color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/10', hoverBg: 'hover:bg-secondary/10' },
  twitter: { color: 'text-sky-500', bg: 'bg-sky-500/5', border: 'border-sky-500/10', hoverBg: 'hover:bg-sky-500/10' },
  website: { color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10', hoverBg: 'hover:bg-primary/10' },
};

export default function OrganiserProfileSheet() {
  const userId = useUIStore((s) => s.showOrganiserProfile);
  const setShowOrganiserProfile = useUIStore((s) => s.setShowOrganiserProfile);
  const showToast = useUIStore((s) => s.showToast);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const allEvents = useEventStore((s) => s.events);
  const setSelectedTribe = useCommunityStore((s) => s.setSelectedTribe);
  const allCommunities = useCommunityStore((s) => s.communities);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [eventTab, setEventTab] = useState('upcoming');

  const close = () => setShowOrganiserProfile(null);
  useEscapeKey(close);
  const focusTrapRef = useFocusTrap(!!userId);
  const { sheetY, handleProps } = useSwipeToClose(close);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    api.getOrganiserProfile(userId)
      .then(data => { if (!cancelled) setProfile(data); })
      .catch(err => { if (!cancelled) showToast(err.message || 'Failed to load profile', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (!profile?.events?.length) return { upcomingEvents: [], pastEvents: [] };
    const now = new Date();
    const upcoming = [];
    const past = [];
    (profile.events ?? []).forEach(e => {
      const d = new Date(e.date);
      if (d >= now || isNaN(d.getTime())) upcoming.push(e);
      else past.push(e);
    });
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [profile]);

  const highlightEvent = useMemo(() => {
    if (!profile?.events?.length) return null;
    return [...profile.events].sort((a, b) => {
      const fillA = a.spots > 0 ? a.attendees / a.spots : 0;
      const fillB = b.spots > 0 ? b.attendees / b.spots : 0;
      return fillB - fillA;
    })[0];
  }, [profile]);

  const organiserTier = useMemo(() => {
    const hosted = profile?.events?.length ?? 0;
    if (hosted >= 20) return { label: 'Gold Organiser', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    if (hosted >= 5) return { label: 'Silver Organiser', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
    return { label: 'Organiser', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };
  }, [profile]);

  if (!userId) return null;

  const socialLinks = profile?.organiserSocialLinks || {};
  const activeSocials = ORGANISER_SOCIAL_PLATFORMS.filter(p => socialLinks[p.key]?.trim());

  const totalEvents = profile?.events?.length ?? 0;
  const totalCommunities = profile?.communities?.length ?? 0;
  const totalMembers = profile?.communities?.reduce((sum, c) => sum + (c.members ?? 0), 0) ?? 0;
  const avgFill = totalEvents > 0 ? Math.round((profile?.events ?? []).reduce((sum, e) => sum + (e.spots > 0 ? (e.attendees / e.spots) * 100 : 0), 0) / totalEvents) : 0;
  const totalAttendees = profile?.events?.reduce((sum, e) => sum + (e.attendees ?? 0), 0) ?? 0;

  const displayedEvents = eventTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleShareProfile = () => {
    playTap(); hapticTap();
    const profileUrl = `${window.location.origin}${window.location.pathname}?organiser=${userId}`;
    navigator.clipboard?.writeText(profileUrl)
      .then(() => showToast('Profile link copied!', 'success'))
      .catch(() => showToast('Could not copy link', 'error'));
  };

  return (
    <AnimatePresence>
      {userId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm flex items-end md:items-center justify-center"
          onPointerDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            ref={focusTrapRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            style={{ y: sheetY }}
            className="bg-paper rounded-t-[32px] md:rounded-[32px] w-full md:max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Organiser profile"
          >
            {/* Drag handle */}
            <div {...handleProps} className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-secondary/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-secondary/10">
              <h2 className="text-lg font-black text-secondary">Organiser Profile</h2>
              <button
                onPointerDown={() => { playTap(); close(); }}
                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                aria-label="Close"
              >
                <X size={20} className="text-secondary/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              {loading ? (
                <div className="p-6 space-y-4">
                  <div className="h-24 rounded-2xl bg-secondary/10 animate-pulse" />
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[24px] bg-secondary/10 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                      <div className="h-3 w-20 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                  <div className="h-16 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.25s' }} />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="h-16 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.35s' }} />
                    <div className="h-16 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <div className="h-32 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.45s' }} />
                </div>
              ) : profile ? (
                <div>
                  {/* Cover photo */}
                  {profile.organiserCoverPhoto && (
                    <div className="h-28 overflow-hidden">
                      <img src={profile.organiserCoverPhoto} className="w-full h-full object-cover" alt="" loading="lazy" aria-hidden="true" />
                    </div>
                  )}

                  <div className="p-6 space-y-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
                    {/* Profile header */}
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-20 rounded-[24px] overflow-hidden border-2 border-primary/20 shadow-lg shrink-0 ${profile.organiserCoverPhoto ? '-mt-10 relative z-10 ring-4 ring-paper' : ''}`}>
                        <img src={profile.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt={`${profile.organiserDisplayName || profile.name || 'Organiser'} avatar`} loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-secondary truncate select-text">
                            {profile.organiserDisplayName || profile.name}
                          </h3>
                          {profile.organiserVerified && (
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${organiserTier.bg} border ${organiserTier.border} text-[9px] font-black ${organiserTier.color} uppercase tracking-widest`}>
                            <Megaphone size={9} />
                            {organiserTier.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Follow + Share buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          playClick(); hapticTap();
                          setIsFollowing(!isFollowing);
                          showToast(isFollowing ? 'Unfollowed organiser' : 'Following organiser!', isFollowing ? 'info' : 'success');
                        }}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                          isFollowing
                            ? 'bg-secondary/5 border-2 border-secondary/20 text-secondary'
                            : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        }`}
                      >
                        <motion.span
                          key={isFollowing ? 'following' : 'follow'}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                          {isFollowing ? 'Following' : 'Follow'}
                        </motion.span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={handleShareProfile}
                        className="w-12 py-3 rounded-2xl bg-secondary/5 border-2 border-secondary/20 flex items-center justify-center hover:bg-secondary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                        aria-label="Share profile"
                      >
                        <Share2 size={18} className="text-secondary/60" />
                      </motion.button>
                    </div>

                    {/* Bio */}
                    {(profile.organiserBio || profile.bio) && (
                      <div className="premium-card p-4 rounded-[20px] border border-transparent hover:border-secondary/10 transition-colors duration-200">
                        <p className="text-sm text-secondary/70 font-medium leading-relaxed select-text">
                          {profile.organiserBio || profile.bio}
                        </p>
                      </div>
                    )}

                    {/* Quick stats */}
                    <motion.div {...sectionAnim(1)} className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Calendar, value: totalEvents, label: 'Events', color: 'text-primary', bg: 'bg-primary/5' },
                        { icon: Users, value: totalAttendees, label: 'Attendees', color: 'text-accent', bg: 'bg-accent/5' },
                        { icon: MessageCircle, value: totalCommunities, label: 'Communities', color: 'text-secondary', bg: 'bg-secondary/5' },
                        { icon: Users, value: totalMembers, label: 'Members', color: 'text-teal-600', bg: 'bg-teal-500/5' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 + i * 0.06 }}
                          whileHover={{ y: -2, transition: { duration: 0.12 } }}
                          className={`p-3 rounded-2xl ${stat.bg} border border-secondary/10`}
                        >
                          <div className="flex items-center gap-2">
                            <stat.icon size={14} className={stat.color} />
                            <motion.span
                              className="text-lg font-black text-secondary"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.15 + i * 0.05 }}
                            >
                              {stat.value}
                            </motion.span>
                          </div>
                          <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">{stat.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Engagement stats */}
                    {totalEvents > 0 && (
                      <motion.div {...sectionAnim(2)} className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-primary" />
                          <span className="text-[11px] font-bold text-secondary">Avg Fill Rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${avgFill >= 70 ? 'bg-accent' : 'bg-primary'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(avgFill, 100)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                            />
                          </div>
                          <span className={`text-sm font-black ${avgFill >= 70 ? 'text-accent' : 'text-primary'}`}>{avgFill}%</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Highlight Event */}
                    {highlightEvent && (() => {
                      const hlFill = highlightEvent.spots > 0 ? Math.round((highlightEvent.attendees / highlightEvent.spots) * 100) : 0;
                      return (
                      <motion.button
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const fullEvent = allEvents.find(e => e.id === highlightEvent.id) || highlightEvent;
                          playTap(); hapticTap(); setSelectedEvent(fullEvent);
                        }}
                        className="w-full premium-card p-4 rounded-[20px] relative overflow-hidden text-left hover:bg-secondary/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent/5 rounded-full blur-2xl" aria-hidden="true" />
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Star size={12} className="text-accent" />
                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">Top Event</span>
                          </div>
                          <span className={`text-[10px] font-black ${hlFill >= 80 ? 'text-accent' : 'text-primary'}`}>{hlFill}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                            {highlightEvent.image && <img src={highlightEvent.image} className="w-full h-full object-cover" alt={highlightEvent.title || 'Top event'} loading="lazy" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-secondary truncate">{highlightEvent.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-secondary/40">
                                {highlightEvent.attendees}/{highlightEvent.spots} spots
                              </span>
                              {highlightEvent.category && (
                                <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{highlightEvent.category}</span>
                              )}
                            </div>
                            <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${hlFill >= 100 ? 'bg-red-500' : hlFill >= 80 ? 'bg-accent' : 'bg-primary/50'}`}
                                style={{ width: `${Math.min(hlFill, 100)}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-secondary/30 shrink-0" aria-hidden="true" />
                        </div>
                      </motion.button>
                      );
                    })()}

                    {/* Social links — clickable */}
                    {activeSocials.length > 0 && (
                      <motion.div {...sectionAnim(3)}>
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                          Connect<span className="text-accent">.</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeSocials.map(p => {
                            const url = SOCIAL_URLS[p.key]?.(socialLinks[p.key]);
                            const style = SOCIAL_STYLES[p.key] || SOCIAL_STYLES.website;
                            return (
                              <a
                                key={p.key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all group hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${style.bg} ${style.border} ${style.color} ${style.hoverBg}`}
                              >
                                <Globe size={10} />
                                <span className="capitalize text-[9px] font-black opacity-50 mr-0.5">{p.key}</span>
                                {socialLinks[p.key]}
                                <ExternalLink size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                              </a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Categories */}
                    {profile.organiserCategories?.length > 0 && (
                      <motion.div {...sectionAnim(4)}>
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                          Hosts<span className="text-accent">.</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(profile.organiserCategories ?? []).map((catId, idx) => {
                            const catData = CATEGORIES.find(c => c.id === catId);
                            const CatIcon = catData?.icon;
                            return (
                              <motion.span
                                key={catId}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: idx * 0.05 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[11px] font-bold text-primary"
                              >
                                {CatIcon && <CatIcon size={12} />}
                                {catData?.label || catId}
                              </motion.span>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Events with tabs */}
                    {profile.events?.length > 0 && (
                      <motion.div {...sectionAnim(5)}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest">
                            Events<span className="text-accent">.</span>
                          </h4>
                          <div className="flex gap-1">
                            {[
                              { key: 'upcoming', label: 'Upcoming', icon: Clock, count: upcomingEvents.length },
                              { key: 'past', label: 'Past', icon: History, count: pastEvents.length },
                            ].map(tab => (
                              <button
                                key={tab.key}
                                onClick={() => { playTap(); setEventTab(tab.key); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors relative hover:bg-secondary/5 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                              >
                                {eventTab === tab.key && (
                                  <motion.div
                                    layoutId="profile-event-tab-pill"
                                    className="absolute inset-0 bg-primary/10 rounded-lg"
                                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                                    style={{ zIndex: 0 }}
                                  />
                                )}
                                <span className={`relative z-[1] flex items-center gap-1 ${eventTab === tab.key ? 'text-primary' : 'text-secondary/40'}`}>
                                  <tab.icon size={10} />
                                  {tab.label} ({tab.count})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={eventTab}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="space-y-2"
                          >
                            {displayedEvents.length > 0 ? displayedEvents.map(event => {
                              const fillPct = event.spots > 0 ? Math.round((event.attendees / event.spots) * 100) : 0;
                              return (
                                <motion.button
                                  key={event.id}
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  whileHover={{ x: 2, transition: { duration: 0.12 } }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    const fullEvent = allEvents.find(e => e.id === event.id) || event;
                                    playTap(); hapticTap(); setSelectedEvent(fullEvent);
                                  }}
                                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                >
                                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                                    {event.image && <img src={event.image} className="w-full h-full object-cover" alt={event.title || 'Event'} loading="lazy" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-secondary truncate">{event.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="text-[10px] text-secondary/40 font-medium">{event.date}</span>
                                      <span className={`text-[10px] font-bold ${fillPct >= 80 ? 'text-accent' : 'text-primary'}`}>
                                        {event.attendees}/{event.spots} spots
                                      </span>
                                      {event.category && (
                                        <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{event.category}</span>
                                      )}
                                      {parseFloat(event.price) > 0 && (
                                        <span className="text-[9px] font-bold text-green-600">${event.price}</span>
                                      )}
                                    </div>
                                    <div className="w-full h-1 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${fillPct >= 100 ? 'bg-red-500' : fillPct >= 80 ? 'bg-accent' : 'bg-primary/50'}`}
                                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-secondary/30 shrink-0" aria-hidden="true" />
                                </motion.button>
                              );
                            }) : (
                              <p className="text-center py-4 text-[11px] text-secondary/40 font-medium">
                                No {eventTab} events
                              </p>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Communities */}
                    {profile.communities?.length > 0 && (
                      <motion.div {...sectionAnim(6)}>
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                          Communities<span className="text-accent">.</span>
                        </h4>
                        <div className="space-y-2">
                          {(profile.communities ?? []).map(c => {
                            const fullCommunity = allCommunities.find(ac => ac.id === c.id) || c;
                            return (
                              <motion.button
                                key={c.id}
                                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { playTap(); hapticTap(); setSelectedTribe(fullCommunity); }}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                              >
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 shrink-0 flex items-center justify-center text-base">
                                  {c.avatar || '🏘️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-secondary truncate">{c.name}</p>
                                  {c.description && (
                                    <p className="text-[10px] text-secondary/40 truncate">{c.description}</p>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-secondary/40">{c.members ?? 0} members</span>
                                    {c.category && (
                                      <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{c.category}</span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-secondary/30 shrink-0" aria-hidden="true" />
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Reviews / Vibe Tags */}
                    {reviewData && reviewData.topTags?.length > 0 && (
                      <motion.div {...sectionAnim(7)}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest">
                            Vibes<span className="text-accent">.</span>
                          </h4>
                          <button
                            onClick={() => {
                              playTap(); hapticTap();
                              setShowOrganiserReview({
                                organiserId: userId,
                                organiserName: profile?.organiserDisplayName || profile?.name,
                              });
                            }}
                            className="text-[10px] font-bold text-primary hover:text-accent transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded"
                          >
                            <Sparkles size={10} />
                            Leave a review
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reviewData.topTags.map(({ tag, count }) => {
                            const tagDef = ORGANISER_VIBE_TAGS.find(t => t.id === tag);
                            if (!tagDef) return null;
                            return (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-transform hover:scale-105 ${tagDef.color}`}
                              >
                                <span>{tagDef.emoji}</span>
                                {tagDef.label}
                                {count > 1 && (
                                  <span className="ml-0.5 text-[9px] font-black opacity-60">{count}</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-secondary/30 font-medium mt-2">
                          {reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'review' : 'reviews'}
                        </p>
                      </motion.div>
                    )}

                    {/* Leave review CTA — show even when no reviews exist yet */}
                    {reviewData && reviewData.topTags?.length === 0 && (
                      <motion.div {...sectionAnim(7)}>
                        <button
                          onClick={() => {
                            playTap(); hapticTap();
                            setShowOrganiserReview({
                              organiserId: userId,
                              organiserName: profile?.organiserDisplayName || profile?.name,
                            });
                          }}
                          className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors text-center focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                        >
                          <Sparkles size={20} className="text-primary mx-auto mb-1.5" />
                          <p className="text-sm font-bold text-secondary">Leave a vibe review</p>
                          <p className="text-[10px] text-secondary/40 font-medium mt-0.5">Share your experience with this organiser</p>
                        </button>
                      </motion.div>
                    )}

                    {/* Empty state */}
                    {(!profile.events?.length && !profile.communities?.length) && (
                      <div className="text-center py-6">
                        <motion.div
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center"
                        >
                          <Megaphone size={24} className="text-secondary/20" />
                        </motion.div>
                        <p className="text-sm text-secondary/40 font-medium">This organiser hasn&apos;t hosted anything yet</p>
                        <p className="text-[10px] text-secondary/25 mt-1">Check back later for events</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-secondary/40">Profile not found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

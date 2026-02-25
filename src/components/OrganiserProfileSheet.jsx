import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MapPin, Globe, Megaphone, ChevronRight } from 'lucide-react';
import { DEFAULT_AVATAR, ORGANISER_SOCIAL_PLATFORMS } from '../data/constants';
import { playTap } from '../utils/feedback';
import useUIStore from '../stores/uiStore';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import api from '../api';

export default function OrganiserProfileSheet() {
  const userId = useUIStore((s) => s.showOrganiserProfile);
  const setShowOrganiserProfile = useUIStore((s) => s.setShowOrganiserProfile);
  const showToast = useUIStore((s) => s.showToast);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!userId) return null;

  const socialLinks = profile?.organiserSocialLinks || {};
  const activeSocials = ORGANISER_SOCIAL_PLATFORMS.filter(p => socialLinks[p.key]?.trim());

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
                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-secondary/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[24px] bg-secondary/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-secondary/10 rounded-full" />
                      <div className="h-3 w-20 bg-secondary/10 rounded-full" />
                    </div>
                  </div>
                  <div className="h-16 bg-secondary/10 rounded-2xl" />
                  <div className="h-32 bg-secondary/10 rounded-2xl" />
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  {/* Profile header */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-primary/20 shadow-lg shrink-0">
                      <img src={profile.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-secondary truncate">
                          {profile.organiserDisplayName || profile.name}
                        </h3>
                        {profile.organiserVerified && (
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Megaphone size={12} className="text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Organiser</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {(profile.organiserBio || profile.bio) && (
                    <div className="premium-card p-4 rounded-[20px]">
                      <p className="text-sm text-secondary/70 font-medium leading-relaxed">
                        {profile.organiserBio || profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Social links */}
                  {activeSocials.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeSocials.map(p => (
                        <span key={p.key} className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary/5 rounded-full border border-secondary/10 text-[11px] font-bold text-secondary/60">
                          <Globe size={10} />
                          {socialLinks[p.key]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {profile.organiserCategories?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.organiserCategories.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[11px] font-bold text-primary">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Events */}
                  {profile.events?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                        Upcoming Events<span className="text-accent">.</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.events.map(event => (
                          <div key={event.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                              {event.image && <img src={event.image} className="w-full h-full object-cover" alt="" loading="lazy" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-secondary truncate">{event.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-secondary/40 font-medium">{event.date}</span>
                                <span className="text-[10px] text-primary font-bold">
                                  {event.attendees}/{event.spots} spots
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-secondary/30 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communities */}
                  {profile.communities?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                        Communities<span className="text-accent">.</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.communities.map(c => (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 border border-secondary/10">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 shrink-0 flex items-center justify-center text-base">
                              {c.avatar || '🏘️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-secondary truncate">{c.name}</p>
                              <span className="text-[10px] text-secondary/40">{c.members ?? 0} members</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!profile.events?.length && !profile.communities?.length) && (
                    <div className="text-center py-6">
                      <Megaphone size={32} className="text-secondary/20 mx-auto mb-2" />
                      <p className="text-sm text-secondary/40 font-medium">This organiser hasn't hosted anything yet</p>
                    </div>
                  )}
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

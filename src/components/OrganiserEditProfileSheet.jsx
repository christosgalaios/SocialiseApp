import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Check, Camera, ShieldCheck, ChevronDown, Eye } from 'lucide-react';
import { CATEGORIES, ORGANISER_SOCIAL_PLATFORMS, DEFAULT_AVATAR } from '../data/constants';
import { playTap, playSuccess } from '../utils/feedback';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import api from '../api';

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400, delay: i * 0.06 } }),
};

export default function OrganiserEditProfileSheet() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showOrganiserEditProfile = useUIStore((s) => s.showOrganiserEditProfile);
  const setShowOrganiserEditProfile = useUIStore((s) => s.setShowOrganiserEditProfile);
  const showToast = useUIStore((s) => s.showToast);

  const [displayName, setDisplayName] = useState(user?.organiserDisplayName || user?.name || '');
  const [organiserBio, setOrganiserBio] = useState(user?.organiserBio || '');
  const [selectedCategories, setSelectedCategories] = useState(user?.organiserCategories || []);
  const [socialLinks, setSocialLinks] = useState(user?.organiserSocialLinks || {});
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(user?.organiserCoverPhoto || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const initialStateRef = useRef({
    displayName: user?.organiserDisplayName || user?.name || '',
    organiserBio: user?.organiserBio || '',
    selectedCategories: user?.organiserCategories || [],
    socialLinks: user?.organiserSocialLinks || {},
    coverPhotoPreview: user?.organiserCoverPhoto || '',
  });

  const hasUnsavedChanges = () => {
    const init = initialStateRef.current;
    return displayName !== init.displayName ||
      organiserBio !== init.organiserBio ||
      JSON.stringify(selectedCategories) !== JSON.stringify(init.selectedCategories) ||
      JSON.stringify(socialLinks) !== JSON.stringify(init.socialLinks) ||
      coverPhotoPreview !== init.coverPhotoPreview;
  };

  const close = () => {
    if (hasUnsavedChanges() && !isSubmitting) {
      if (!window.confirm('You have unsaved changes. Discard them?')) return;
    }
    setShowOrganiserEditProfile(false);
  };
  useEscapeKey(close);
  const focusTrapRef = useFocusTrap(showOrganiserEditProfile);
  const { sheetY, handleProps } = useSwipeToClose(close);

  const categories = CATEGORIES.filter(c => c.id !== 'All');

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const updateSocialLink = (key, value) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const validateSocialLink = (key, value) => {
    if (!value?.trim()) return null;
    const v = value.trim();
    if (key === 'website') {
      if (!/^https?:\/\/.+\..+/.test(v)) return 'Enter a valid URL (https://...)';
    } else {
      if (/\s/.test(v)) return 'Usernames cannot contain spaces';
    }
    return null;
  };

  const socialErrors = ORGANISER_SOCIAL_PLATFORMS.reduce((acc, p) => {
    const err = validateSocialLink(p.key, socialLinks[p.key]);
    if (err) acc[p.key] = err;
    return acc;
  }, {});

  const hasSocialErrors = Object.keys(socialErrors).length > 0;
  const canSave = displayName.trim().length >= 2 && selectedCategories.length >= 1 && !hasSocialErrors;
  const [shakeKey, setShakeKey] = useState(0);

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!canSave) {
      setShakeKey(k => k + 1);
      playTap();
      return;
    }
    setIsSubmitting(true);

    try {
      const updated = await api.updateProfile({
        organiserDisplayName: displayName.trim(),
        organiserBio: organiserBio.trim(),
        organiserCategories: selectedCategories,
        organiserSocialLinks: Object.fromEntries(
          Object.entries(socialLinks).filter(([, v]) => v?.trim())
        ),
        organiserCoverPhoto: coverPhotoPreview.trim() || null,
      });
      setUser(updated);
      playSuccess();
      showToast('Organiser profile updated!', 'success');
      close();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showOrganiserEditProfile) return null;

  return (
    <AnimatePresence>
      {showOrganiserEditProfile && (
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
            className="bg-paper rounded-t-[32px] md:rounded-[32px] w-full md:max-w-lg max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Edit organiser profile"
          >
            {/* Drag handle */}
            <div {...handleProps} className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-secondary/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-secondary/10">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-secondary">Edit Profile</h2>
                {hasUnsavedChanges() && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-amber-500"
                    style={{ boxShadow: '0 0 6px rgba(245, 158, 11, 0.4)' }}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => { playTap(); setShowPreview(!showPreview); }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                    showPreview ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary/60'
                  }`}
                  aria-label={showPreview ? 'Hide preview' : 'Show preview'}
                >
                  <motion.div animate={{ rotate: showPreview ? 8 : 0 }} transition={{ duration: 0.2 }}>
                    <Eye size={18} />
                  </motion.div>
                </motion.button>
                <button
                  onPointerDown={() => { playTap(); close(); }}
                  className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                  aria-label="Close"
                >
                  <X size={20} className="text-secondary/60" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" style={{ overscrollBehavior: 'contain' }}>

              {/* Live Preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="premium-card p-4 rounded-2xl relative overflow-hidden mb-2">
                      <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-3">Preview</p>
                      {coverPhotoPreview && (
                        <div className="-mx-4 -mt-8 mb-3 h-16 overflow-hidden rounded-t-2xl">
                          <img src={coverPhotoPreview} className="w-full h-full object-cover opacity-60" alt="Cover photo preview" loading="lazy" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary/10 shrink-0">
                          <img src={user?.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="Avatar preview" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-secondary truncate">
                            {displayName.trim() || 'Your Name'}
                          </p>
                          {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {selectedCategories.slice(0, 3).map(catId => {
                                const cat = CATEGORIES.find(c => c.id === catId);
                                return <span key={catId} className="text-[8px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">{cat?.label || catId}</span>;
                              })}
                              {selectedCategories.length > 3 && <span className="text-[8px] text-secondary/40">+{selectedCategories.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      {organiserBio.trim() && (
                        <p className="text-[11px] text-secondary/50 mt-2 line-clamp-2">{organiserBio}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cover Photo */}
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="show">
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-2 block">
                  Cover Photo
                </label>
                <div className="relative h-24 rounded-2xl overflow-hidden bg-secondary/5 border-2 border-dashed border-secondary/20 hover:border-primary/30 transition-colors duration-200">
                  {coverPhotoPreview ? (
                    <>
                      <img src={coverPhotoPreview} className="w-full h-full object-cover" alt="Cover" loading="lazy" />
                      <button
                        onClick={() => setCoverPhotoPreview('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none before:absolute before:inset-[-8px] before:content-['']"
                        aria-label="Remove cover photo"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <Camera size={20} className="text-secondary/30" />
                      <span className="text-[10px] font-bold text-secondary/30">Paste image URL below</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/cover-photo.jpg"
                  value={coverPhotoPreview}
                  onChange={(e) => setCoverPhotoPreview(e.target.value)}
                  className="w-full mt-2 bg-secondary/5 border border-secondary/20 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-secondary/30 transition-all placeholder:text-secondary/40"
                />
              </motion.div>

              {/* Display Name */}
              <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-secondary/60 uppercase tracking-widest">
                    Display Name
                  </label>
                  <span className={`text-[10px] font-bold ${displayName.length >= 2 ? 'text-green-600' : 'text-secondary/40'}`}>
                    {displayName.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="How attendees will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-3.5 text-base font-medium text-[var(--text)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-secondary/30 transition-all placeholder:text-secondary/40"
                  maxLength={50}
                />
                {displayName.trim().length > 0 && displayName.trim().length < 2 && (
                  <p className="text-[10px] text-red-500/70 mt-1 font-medium">Name must be at least 2 characters</p>
                )}
                {/* Character progress bar */}
                <div className="w-full h-0.5 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${displayName.length >= 2 ? 'bg-green-500/60' : 'bg-primary/40'}`}
                    animate={{ width: `${Math.min((displayName.length / 50) * 100, 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>

              {/* Bio */}
              <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-secondary/60 uppercase tracking-widest">
                    Organiser Bio
                  </label>
                  <span className={`text-[10px] font-bold ${organiserBio.length > 250 ? 'text-amber-500' : 'text-secondary/40'}`}>
                    {organiserBio.length}/300
                  </span>
                </div>
                <textarea
                  placeholder="Tell people what kind of events you host..."
                  value={organiserBio}
                  onChange={(e) => setOrganiserBio(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-primary hover:border-secondary/30 transition-all placeholder:text-secondary/40 min-h-[100px] resize-none"
                  maxLength={300}
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-words' }}
                />
                {/* Character progress bar */}
                <div className="w-full h-0.5 bg-secondary/10 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${organiserBio.length > 250 ? 'bg-amber-500/60' : 'bg-primary/40'}`}
                    animate={{ width: `${Math.min((organiserBio.length / 300) * 100, 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-secondary/60 uppercase tracking-widest">
                    Event Categories
                  </label>
                  <span className={`text-[10px] font-bold ${selectedCategories.length >= 1 ? 'text-green-600' : 'text-red-500/70'}`}>
                    {selectedCategories.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.id}
                        onClick={() => { toggleCategory(cat.id); playTap(); }}
                        whileTap={{ scale: 0.92 }}
                        whileHover={!isSelected ? { scale: 1.03, transition: { duration: 0.12 } } : {}}
                        animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-secondary/5 border-secondary/20 text-secondary/70 hover:border-secondary/40'
                        }`}
                      >
                        {Icon && <Icon size={14} />}
                        {cat.label}
                        {isSelected && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 400 }}>
                            <Check size={12} />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-[10px] text-red-500/70 mt-1 font-medium">Select at least 1 category</p>
                )}
              </motion.div>

              {/* Social Links — collapsible */}
              <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="show">
                <button
                  onClick={() => { setShowSocialLinks(!showSocialLinks); playTap(); }}
                  className="w-full flex items-center justify-between mb-3 rounded-xl px-1 -mx-1 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none transition-all"
                >
                  <label className="text-xs font-black text-secondary/60 uppercase tracking-widest pointer-events-none">
                    Social Links <span className="text-secondary/30">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {Object.values(socialLinks).filter(v => v?.trim()).length > 0 && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                        {Object.values(socialLinks).filter(v => v?.trim()).length} linked
                      </span>
                    )}
                    <ChevronDown size={14} className={`text-secondary/40 transition-transform ${showSocialLinks ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {showSocialLinks && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        {ORGANISER_SOCIAL_PLATFORMS.map((platform) => {
                          const error = socialErrors[platform.key];
                          const hasValue = socialLinks[platform.key]?.trim();
                          return (
                            <div key={platform.key} className="flex items-center gap-3">
                              <motion.div
                                animate={hasValue ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                                  hasValue ? 'bg-green-500/5 border-green-500/20' : 'bg-secondary/5 border-secondary/10'
                                }`}
                              >
                                <Link2 size={16} className={hasValue ? 'text-green-600' : 'text-secondary/50'} />
                              </motion.div>
                              <div className="flex-1">
                                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">{platform.label}</span>
                                <input
                                  type="text"
                                  placeholder={platform.placeholder}
                                  value={socialLinks[platform.key] || ''}
                                  onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                                  className={`w-full bg-secondary/5 border rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] focus:outline-none transition-all placeholder:text-secondary/40 ${
                                    error ? 'border-red-400 focus:border-red-500' : hasValue ? 'border-green-500/30 focus:border-green-500' : 'border-secondary/20 focus:border-primary hover:border-secondary/30'
                                  }`}
                                />
                                {error && <p className="text-[10px] text-red-500/70 mt-0.5 font-medium">{error}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Verification Request */}
              <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="show">
                {!user?.organiserVerified ? (
                  <div className="premium-card p-4 rounded-2xl relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl" aria-hidden="true" />
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
                      >
                        <ShieldCheck size={18} className="text-primary" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-secondary">Get Verified</p>
                        <p className="text-[10px] text-secondary/40">Verified organisers get a badge on their profile</p>
                      </div>
                      <button
                        onClick={() => {
                          playTap();
                          showToast('Verification request submitted! We\'ll review your profile.', 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-green-500/5 border border-green-500/10 hover:border-green-500/20 hover:shadow-sm transition-all duration-200">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-600">Verified Organiser</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer with save button */}
            <div className="p-6 border-t border-secondary/10 pb-[max(32px,env(safe-area-inset-bottom))]">
              {hasUnsavedChanges() && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold text-amber-500 text-center mb-2"
                >
                  You have unsaved changes
                </motion.p>
              )}
              <motion.button
                key={shakeKey}
                onClick={handleSave}
                disabled={isSubmitting}
                whileTap={canSave ? { scale: 0.98 } : {}}
                animate={!canSave && shakeKey > 0 ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                  canSave
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-secondary/20 text-secondary/40 cursor-not-allowed'
                } ${isSubmitting ? 'opacity-50' : ''}`}
                style={canSave && hasUnsavedChanges() ? { boxShadow: '0 4px 20px rgba(226, 114, 91, 0.3)' } : {}}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Check size={20} />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

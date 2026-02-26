import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Check } from 'lucide-react';
import { CATEGORIES, ORGANISER_SOCIAL_PLATFORMS } from '../data/constants';
import { playTap, playSuccess } from '../utils/feedback';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import api from '../api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => setShowOrganiserEditProfile(false);
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

  const canSave = displayName.trim().length >= 2 && selectedCategories.length >= 1;

  const handleSave = async () => {
    if (isSubmitting || !canSave) return;
    setIsSubmitting(true);

    try {
      const updated = await api.updateProfile({
        organiserDisplayName: displayName.trim(),
        organiserBio: organiserBio.trim(),
        organiserCategories: selectedCategories,
        organiserSocialLinks: Object.fromEntries(
          Object.entries(socialLinks).filter(([, v]) => v?.trim())
        ),
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
              <h2 className="text-lg font-black text-secondary">Edit Profile</h2>
              <button
                onPointerDown={() => { playTap(); close(); }}
                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-secondary/60" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ overscrollBehavior: 'contain' }}>
              {/* Display Name */}
              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-2 block">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="How attendees will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-3.5 text-base font-medium text-[var(--text)] focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40"
                  maxLength={50}
                />
                <p className="text-[10px] text-secondary/40 mt-1 font-medium">{displayName.length}/50 characters</p>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-2 block">
                  Organiser Bio
                </label>
                <textarea
                  placeholder="Tell people what kind of events you host..."
                  value={organiserBio}
                  onChange={(e) => setOrganiserBio(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40 min-h-[100px] resize-none"
                  maxLength={300}
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-words' }}
                />
                <p className="text-[10px] text-secondary/40 mt-1 font-medium">{organiserBio.length}/300 characters</p>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-3 block">
                  Event Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-secondary/5 border-secondary/20 text-secondary/70 hover:border-secondary/40'
                        }`}
                      >
                        {Icon && <Icon size={14} />}
                        {cat.label}
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-[10px] text-red-500/70 mt-1 font-medium">Select at least 1 category</p>
                )}
              </div>

              {/* Social Links */}
              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-3 block">
                  Social Links <span className="text-secondary/30">(optional)</span>
                </label>
                <div className="space-y-3">
                  {ORGANISER_SOCIAL_PLATFORMS.map((platform) => (
                    <div key={platform.key} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0">
                        <Link2 size={16} className="text-secondary/50" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">{platform.label}</span>
                        <input
                          type="text"
                          placeholder={platform.placeholder}
                          value={socialLinks[platform.key] || ''}
                          onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                          className="w-full bg-secondary/5 border border-secondary/20 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with save button */}
            <div className="p-6 pb-8 border-t border-secondary/10">
              <button
                onClick={handleSave}
                disabled={!canSave || isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
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
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

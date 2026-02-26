import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Megaphone, Palette, Link2, Check, Camera, X } from 'lucide-react';
import { CATEGORIES, ORGANISER_SOCIAL_PLATFORMS } from '../data/constants';
import { playClick, playTap, playSuccess } from '../utils/feedback';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import api from '../api';
import { useEscapeKey } from '../hooks/useAccessibility';

export default function OrganiserSetupFlow() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setShowOrganiserSetup = useUIStore((s) => s.setShowOrganiserSetup);
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [organiserBio, setOrganiserBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => setShowOrganiserSetup(false);
  useEscapeKey(close);

  const categories = CATEGORIES.filter(c => c.id !== 'All');

  const toggleCategory = (id) => {
    playClick();
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

  const canProceed = () => {
    if (step === 0) return displayName.trim().length >= 2;
    if (step === 1) return selectedCategories.length >= 1;
    if (step === 2) return !hasSocialErrors;
    return true;
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    playSuccess();

    try {
      // Switch role to organiser
      await api.switchRole('organiser');

      // Save organiser profile data
      const updated = await api.updateProfile({
        organiserDisplayName: displayName.trim(),
        organiserBio: organiserBio.trim(),
        organiserCategories: selectedCategories,
        organiserSocialLinks: Object.fromEntries(
          Object.entries(socialLinks).filter(([, v]) => v.trim())
        ),
        organiserSetupComplete: true,
      });

      setUser(updated);
      showToast('Welcome, organiser! Your profile is set up.', 'success');
      close();
    } catch (err) {
      showToast(err.message || 'Failed to set up organiser profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Become an Organiser',
      subtitle: 'Set up your organiser identity',
      desc: 'This is how attendees will see you',
    },
    {
      title: 'What do you host?',
      subtitle: 'Pick your event categories',
      desc: 'Select at least 1 category',
    },
    {
      title: 'Tell people about you',
      subtitle: 'Bio & social links',
      desc: 'Help attendees find and trust you',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-paper flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Organiser profile setup"
    >
      {/* Header with close */}
      <div className="p-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-1">
            {['Identity', 'Categories', 'Details'].map((label, i) => (
              <div key={i} className="flex-1">
                <motion.div className="h-1.5 rounded-full overflow-hidden bg-secondary/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-primary rounded-full"
                  />
                </motion.div>
                <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 text-center transition-colors ${
                  i <= step ? 'text-primary' : 'text-secondary/30'
                }`}>{label}</p>
              </div>
            ))}
          </div>
          <button
            onPointerDown={close}
            className="ml-4 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-secondary/60" />
          </button>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-black tracking-tight text-primary mb-1">
            {steps[step].title}<span className="text-accent">.</span>
          </h1>
          <h2 className="text-xl font-bold text-secondary/80 mb-2">{steps[step].subtitle}</h2>
          <p className="text-sm text-secondary/50">{steps[step].desc}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Organiser icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-[32px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <Megaphone size={40} className="text-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-2 block">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="How attendees will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-4 text-lg font-medium text-[var(--text)] focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40"
                  maxLength={50}
                  autoFocus
                />
                <p className="text-[10px] text-secondary/40 mt-1 font-medium">{displayName.length}/50 characters</p>
              </div>

              <div className="premium-card p-4 rounded-[24px]">
                <p className="text-sm text-secondary/70 font-medium leading-relaxed">
                  As an organiser, you can create events, build communities, and track your performance.
                  You can switch back to attendee mode any time.
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-secondary/40">Tap to select</p>
                <motion.span
                  key={selectedCategories.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    selectedCategories.length >= 1 ? 'text-green-600 bg-green-500/10' : 'text-secondary/40 bg-secondary/5'
                  }`}
                >
                  {selectedCategories.length} selected
                </motion.span>
              </div>
              <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-secondary/5 border-secondary/20 text-secondary/70 hover:border-secondary/40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-secondary/10'
                    }`}>
                      {Icon && <Icon size={24} />}
                    </div>
                    <span className="text-sm font-bold">{cat.label}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={16} className="text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="bio-links"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-2 block">
                  Organiser Bio
                </label>
                <textarea
                  placeholder="Tell people what kind of events you host and what makes them special..."
                  value={organiserBio}
                  onChange={(e) => setOrganiserBio(e.target.value)}
                  className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40 min-h-[100px] resize-none"
                  maxLength={300}
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-words' }}
                />
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-0.5 bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${organiserBio.length > 250 ? 'bg-amber-500/60' : 'bg-primary/40'}`}
                      animate={{ width: `${Math.min((organiserBio.length / 300) * 100, 100)}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${organiserBio.length > 250 ? 'text-amber-500' : 'text-secondary/40'}`}>
                    {organiserBio.length}/300
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-secondary/60 uppercase tracking-widest mb-3 block">
                  Social Links <span className="text-secondary/30">(optional)</span>
                </label>
                <div className="space-y-3">
                  {ORGANISER_SOCIAL_PLATFORMS.map((platform) => {
                    const error = socialErrors[platform.key];
                    return (
                      <div key={platform.key}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/5 border border-secondary/10 flex items-center justify-center shrink-0">
                            <Link2 size={16} className="text-secondary/50" />
                          </div>
                          <input
                            type="text"
                            placeholder={platform.placeholder}
                            value={socialLinks[platform.key] || ''}
                            onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                            className={`flex-1 bg-secondary/5 border rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text)] focus:outline-none transition-all placeholder:text-secondary/40 ${
                              error ? 'border-red-400 focus:border-red-500' : 'border-secondary/20 focus:border-primary'
                            }`}
                          />
                        </div>
                        {error && <p className="text-[10px] text-red-500/70 mt-0.5 ml-[52px] font-medium">{error}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 pb-10 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => { playTap(); setStep(step - 1); }}
            className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-secondary" />
          </button>
        )}
        <button
          onClick={() => { playTap(); step < 2 ? setStep(step + 1) : handleComplete(); }}
          disabled={!canProceed() || isSubmitting}
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : step < 2 ? (
            <>
              Continue
              <ChevronRight size={20} />
            </>
          ) : (
            <>
              Start Organising
              <Megaphone size={20} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

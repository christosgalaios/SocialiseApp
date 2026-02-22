import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

/**
 * LevelUpModal - Celebration screen when a user levels up.
 * Shows animated level badge, new title unlock, and XP progress.
 */
const LevelUpModal = ({ isOpen, onClose, newLevel, unlockedTitle }) => {
  useEscapeKey(isOpen, onClose);
  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Level up to level ${newLevel?.level || 1}`}
          ref={focusTrapRef}
        >
          {/* Backdrop with radial glow */}
          <div className="absolute inset-0 bg-secondary/90 backdrop-blur-xl" onClick={onClose} />

          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accent/60"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative z-10 max-w-sm w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors z-20"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Card */}
            <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl rounded-[40px] p-8 text-center border border-white/10 shadow-2xl overflow-hidden">
              {/* Top glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/30 rounded-full blur-3xl -translate-y-1/2" />

              {/* Level up text */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-2"
              >
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Level Up!</span>
              </motion.div>

              {/* Level badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                className="relative mx-auto mb-6"
              >
                <div className="w-28 h-28 mx-auto relative">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-spin-slow" />
                  <div className="absolute inset-2 rounded-full border-2 border-white/10" />
                  {/* Inner circle */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl">
                    <span className="text-4xl">{newLevel?.icon || '⭐'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Level number */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-black text-white mb-2"
              >
                Level {newLevel?.level || 1}
              </motion.h2>

              {/* Title */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-bold text-accent mb-6"
              >
                {newLevel?.title || 'Newcomer'}
              </motion.p>

              {/* Unlocked title */}
              {unlockedTitle && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/10"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Trophy size={16} className="text-accent" />
                    <span className="text-xs font-black text-accent uppercase tracking-widest">New Title Unlocked</span>
                  </div>
                  <p className="text-white font-bold text-lg">{unlockedTitle.icon} {unlockedTitle.title}</p>
                  <p className="text-white/50 text-xs mt-1">{unlockedTitle.description}</p>
                </motion.div>
              )}

              {/* Continue button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-primary text-white font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Sparkles size={18} />
                Continue
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;

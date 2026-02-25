import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, Star } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';
import { playSwooshClose, hapticTap } from '../utils/feedback';
import { SKILLS, FAME_SCORE_LEVELS, SKILL_LEVEL_THRESHOLDS, getSkillLevel } from '../data/constants';

/**
 * LevelUpScreen — Full-screen celebration overlay for skill level-ups and Fame Score level-ups.
 *
 * Props:
 *   isOpen         — boolean
 *   onClose        — () => void
 *   levelUpData    — {
 *     type: 'skill' | 'fame',
 *     skillKey?: string,          // for type === 'skill'
 *     newSkillLevel?: number,
 *     unlockedBadge?: object,     // badge definition if milestone
 *     newFameLevel?: object,      // for type === 'fame' or when fame also leveled up
 *     fameLeveledUp?: boolean,
 *   }
 */
const LevelUpScreen = ({ isOpen, onClose, levelUpData }) => {
  useEscapeKey(isOpen, onClose);
  const focusTrapRef = useFocusTrap(isOpen);
  const particlesRef = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 2,
    }))
  );

  if (!isOpen || !levelUpData) return null;

  const { type, skillKey, newSkillLevel, unlockedBadge, newFameLevel, fameLeveledUp } = levelUpData;

  const skill = skillKey ? SKILLS.find(s => s.key === skillKey) : null;
  const isMilestone = !!unlockedBadge;
  const isFameOnly = type === 'fame';

  // Progress bar data for skill
  let skillProgressPct = 0;
  if (skill && newSkillLevel != null) {
    const thresholdIdx = newSkillLevel - 1; // 0-indexed
    const prevThreshold = SKILL_LEVEL_THRESHOLDS[thresholdIdx] ?? 0;
    const nextThreshold = SKILL_LEVEL_THRESHOLDS[thresholdIdx + 1] ?? prevThreshold;
    const range = nextThreshold - prevThreshold;
    skillProgressPct = range > 0 ? 0 : 100; // just leveled up, so start at 0
  }

  // Decide accent color from skill
  const accentFrom = skill?.barFrom ?? 'from-primary';
  const accentTo = skill?.barTo ?? 'to-accent';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={isFameOnly ? `Fame Score level up to ${newFameLevel?.title}` : `${skill?.label} leveled up to level ${newSkillLevel}`}
          ref={focusTrapRef}
        >
          {/* Deep backdrop */}
          <div className="absolute inset-0 bg-secondary/95 backdrop-blur-2xl" onClick={onClose} />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particlesRef.current.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: p.id % 3 === 0
                    ? 'var(--accent)'
                    : p.id % 3 === 1
                    ? 'var(--primary)'
                    : 'rgba(255,255,255,0.4)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.4, 0],
                  opacity: [0, 0.8, 0],
                  y: [0, -30 - Math.random() * 40],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  repeatDelay: 1 + Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="relative z-10 w-full max-w-sm mx-6"
          >
            {/* Close */}
            <button
              onPointerDown={() => { playSwooshClose(); hapticTap(); onClose(); }}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 z-20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative bg-gradient-to-b from-white/12 to-white/5 backdrop-blur-3xl rounded-[44px] p-8 border border-white/10 shadow-2xl overflow-hidden text-center">
              {/* Top glow blob */}
              <div
                className={`absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-3xl opacity-40`}
                style={{ background: isFameOnly ? 'var(--accent)' : undefined }}
              />

              {/* ─── SKILL level-up ─── */}
              {!isFameOnly && skill && (
                <>
                  <motion.p
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-4"
                  >
                    Skill Level Up
                  </motion.p>

                  {/* Skill icon ring */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 14, stiffness: 160 }}
                    className="mx-auto mb-5 relative"
                    style={{ width: 104, height: 104 }}
                  >
                    {/* Spinning outer ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/10"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute inset-1 rounded-full border-2 border-dashed"
                      style={{ borderColor: 'var(--accent)', opacity: 0.5 }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Center */}
                    <div
                      className={`absolute inset-4 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br ${accentFrom} ${accentTo}`}
                    >
                      <span className="text-4xl" role="img" aria-hidden="true">{skill.icon}</span>
                    </div>
                  </motion.div>

                  {/* Skill name + level */}
                  <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="text-4xl font-black text-white mb-1 leading-none"
                  >
                    Level {newSkillLevel}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.48 }}
                    className={`text-base font-bold mb-5 ${skill.color}`}
                  >
                    {skill.label}
                  </motion.p>

                  {/* Progress bar for new level */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="mb-6"
                  >
                    <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5">
                      <span>Level {newSkillLevel}</span>
                      {newSkillLevel < 10 && <span>Level {newSkillLevel + 1}</span>}
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${accentFrom} ${accentTo}`}
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>

                  {/* Milestone badge unlock */}
                  {isMilestone && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, type: 'spring', damping: 16 }}
                      className="rounded-[24px] p-4 mb-6 border border-amber-500/30 bg-amber-500/10 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star size={13} className="text-accent fill-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.25em]">
                          {unlockedBadge.isStamp ? 'Profile Stamp Unlocked' : 'Badge Unlocked'}
                        </span>
                        <Star size={13} className="text-accent fill-accent" />
                      </div>
                      <span className="text-4xl block mb-1.5">{unlockedBadge.icon}</span>
                      <p className="text-white font-black text-base">{unlockedBadge.name}</p>
                      <p className="text-white/50 text-xs mt-0.5">{unlockedBadge.description}</p>
                      {unlockedBadge.isStamp && (
                        <p className="text-accent/70 text-[10px] font-bold mt-1.5 uppercase tracking-widest">
                          Equip on your profile
                        </p>
                      )}
                    </motion.div>
                  )}
                </>
              )}

              {/* ─── FAME SCORE level-up ─── */}
              {(isFameOnly || fameLeveledUp) && newFameLevel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isFameOnly ? 0.2 : 0.9 }}
                  className={`${!isFameOnly ? 'border-t border-white/10 pt-5 mt-2' : ''}`}
                >
                  {isFameOnly && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-5"
                    >
                      Fame Score Level Up
                    </motion.p>
                  )}
                  {!isFameOnly && (
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">
                      + Fame Score Level Up!
                    </p>
                  )}

                  {isFameOnly && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.25, type: 'spring', damping: 14 }}
                      className="mx-auto mb-5 relative"
                      style={{ width: 104, height: 104 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-accent/40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl">
                        <span className="text-4xl">{newFameLevel.icon}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-center gap-3">
                    {!isFameOnly && (
                      <span className="text-2xl">{newFameLevel.icon}</span>
                    )}
                    <div>
                      {isFameOnly && (
                        <p className="text-5xl font-black text-white leading-none mb-1">
                          Fame {newFameLevel.level}
                        </p>
                      )}
                      <p className={`${isFameOnly ? 'text-xl' : 'text-sm'} font-black ${newFameLevel.color}`}>
                        {newFameLevel.title}
                      </p>
                      {!isFameOnly && (
                        <p className="text-[10px] text-white/40 font-bold">Fame Score</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMilestone ? 1.1 : (fameLeveledUp || isFameOnly) ? 0.9 : 0.7 }}
                onPointerDown={onClose}
                className={`w-full mt-6 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform bg-gradient-to-r ${accentFrom} ${accentTo}`}
              >
                <Sparkles size={16} />
                Keep Going
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpScreen;

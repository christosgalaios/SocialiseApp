import { useRef, Suspense, lazy } from 'react';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.dev';
import {
  Mail, ShieldCheck, Zap, Check, Heart, Crown, ChevronRight, LogOut, Camera, Users, Settings, MessageCircle, ArrowLeft, Volume2, Megaphone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import { playTap, playToggle, playClick, hapticTap } from '../utils/feedback';
import useEventStore from '../stores/eventStore';
import useUIStore from '../stores/uiStore';
import {
  SKILLS,
  UNLOCKABLE_TITLES,
  DEFAULT_AVATAR,
  FAME_SCORE_LEVELS,
  getFameLevel,
  getFameLevelProgress,
  getSkillLevel,
  getSkillLevelProgress,
  SKILL_LEVEL_THRESHOLDS,
} from '../data/constants';
import WarmthScore from './WarmthScore';
const OrganiserDashboard = lazy(() => import('./OrganiserDashboard'));
import api from '../api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } },
};

/** Inline skill card showing level, progress bar, and milestone badges */
function SkillCard({ skill, xp = 0, unlockedBadgeIds = [] }) {
  const level = getSkillLevel(xp);
  const progressPct = getSkillLevelProgress(xp);
  const thresholdForLevel = SKILL_LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = SKILL_LEVEL_THRESHOLDS[level] ?? thresholdForLevel;
  const xpInLevel = xp - thresholdForLevel;
  const xpNeeded = nextThreshold - thresholdForLevel;

  const milestones = skill.badges;

  return (
    <div className={`rounded-[24px] border p-4 ${skill.bgColor} ${skill.borderColor} relative overflow-hidden`}>
      {/* Skill header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${skill.bgColor} border ${skill.borderColor}`}>
          <span className="text-xl">{skill.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-black text-sm ${skill.color}`}>{skill.label}</h4>
            <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest bg-secondary/5 px-2 py-0.5 rounded-full">
              Lv. {level}
            </span>
          </div>
          <p className="text-[10px] text-secondary/40 font-medium truncate">{skill.description}</p>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="mb-1">
        <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${skill.barFrom} ${skill.barTo}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-secondary/40 font-bold">
            {level < 10 ? `${xpInLevel} / ${xpNeeded} XP` : 'Max Level'}
          </span>
          {level < 10 && (
            <span className="text-[9px] text-secondary/30 font-bold">Lv. {level + 1}</span>
          )}
        </div>
      </div>

      {/* Milestone badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {milestones.map((badge) => {
          const earned = unlockedBadgeIds.includes(badge.id) || level >= badge.level;
          return (
            <div
              key={badge.id}
              title={earned ? badge.description : `Reach Level ${badge.level} to unlock`}
              className={`flex flex-col items-center gap-0.5 transition-all ${earned ? 'opacity-100' : 'opacity-25 grayscale'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-base
                ${earned
                  ? badge.isStamp
                    ? 'bg-accent/15 border-accent/30 ring-1 ring-accent/20'
                    : `${skill.bgColor} ${skill.borderColor}`
                  : 'bg-secondary/5 border-secondary/10'
                }`}
              >
                {badge.icon}
              </div>
              <span className={`text-[8px] font-bold leading-tight text-center max-w-[36px] ${earned ? 'text-secondary/60' : 'text-secondary/30'}`}>
                {badge.isStamp ? '★' : ''}{badge.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileTab({ onLogout, onCreateEvent }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const joinedEvents = useEventStore((s) => s.joinedEvents);
  const savedEvents = useEventStore((s) => s.savedEvents);

  const profileSubTab = useUIStore((s) => s.profileSubTab);
  const setProfileSubTab = useUIStore((s) => s.setProfileSubTab);
  const experimentalFeatures = useUIStore((s) => s.experimentalFeatures);
  const setExperimentalFeatures = useUIStore((s) => s.setExperimentalFeatures);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);
  const proEnabled = useUIStore((s) => s.proEnabled);
  const setShowBookings = useUIStore((s) => s.setShowBookings);
  const setShowSaved = useUIStore((s) => s.setShowSaved);
  const setShowProModal = useUIStore((s) => s.setShowProModal);
  const setShowHelp = useUIStore((s) => s.setShowHelp);
  const setShowGroupChats = useUIStore((s) => s.setShowGroupChats);
  const setShowLevelDetail = useUIStore((s) => s.setShowLevelDetail);
  const avatarCropImage = useUIStore((s) => s.avatarCropImage);
  const setAvatarCropImage = useUIStore((s) => s.setAvatarCropImage);
  const loginStreak = useUIStore((s) => s.loginStreak);
  const skillXP = useUIStore((s) => s.skillXP);
  const userUnlockedTitles = useUIStore((s) => s.userUnlockedTitles);
  const setShowOrganiserSetup = useUIStore((s) => s.setShowOrganiserSetup);
  const showToast = useUIStore((s) => s.showToast);

  const isOrganiser = user?.role === 'organiser' && user?.organiserSetupComplete;

  const handleSwitchToAttendee = async () => {
    try {
      const updated = await api.switchRole('attendee');
      setUser(updated);
      showToast('Switched to attendee view', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to switch role', 'error');
    }
  };

  const fileInputRef = useRef(null);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (avatarCropImage && avatarCropImage.startsWith('blob:')) {
        URL.revokeObjectURL(avatarCropImage);
      }
      const imageUrl = URL.createObjectURL(file);
      setAvatarCropImage(imageUrl);
    }
    event.target.value = '';
  };

  // Fame Score calculations (from total skill XP)
  const totalXP = Object.values(skillXP || {}).reduce((sum, v) => sum + (v || 0), 0);
  const fameLevel = getFameLevel(totalXP);
  const fameLevelProgress = getFameLevelProgress(totalXP);
  const nextFameLevel = FAME_SCORE_LEVELS.find(l => l.totalXpRequired > totalXP) || FAME_SCORE_LEVELS[FAME_SCORE_LEVELS.length - 1];
  const xpToNextFame = nextFameLevel.totalXpRequired - totalXP;

  // All badge IDs that are considered unlocked (via skill level)
  const allUnlockedBadgeIds = [
    ...userUnlockedTitles,
    ...SKILLS.flatMap(skill =>
      skill.badges
        .filter(b => getSkillLevel(skillXP?.[skill.key] ?? 0) >= b.level)
        .map(b => b.id)
    ),
  ];

  // Organiser dashboard view
  if (profileSubTab === 'profile' && isOrganiser) {
    return (
      <motion.div
        key="organiser-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
        style={{ overscrollBehavior: 'contain' }}
      >
        <Suspense fallback={
          <div className="space-y-5 animate-pulse">
            <div className="premium-card p-6 rounded-[24px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-[24px] bg-secondary/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-36 bg-secondary/10 rounded-full" />
                  <div className="h-3 w-20 bg-secondary/10 rounded-full" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => <div key={i} className="h-24 rounded-[24px] bg-secondary/10" />)}
            </div>
          </div>
        }>
          <OrganiserDashboard
            onSwitchToAttendee={handleSwitchToAttendee}
            onCreateEvent={onCreateEvent}
          />
        </Suspense>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card overflow-hidden mt-6 rounded-[32px] bg-secondary/5 border border-secondary/10"
        >
          {[
            { label: 'My Bookings', icon: Check, action: () => { playTap(); hapticTap(); setShowBookings(true); }, badge: joinedEvents.length },
            { label: 'Saved Experiences', icon: Heart, action: () => { playTap(); hapticTap(); setShowSaved(true); }, badge: savedEvents.length },
            { label: 'Settings', icon: Settings, action: () => { playTap(); hapticTap(); setProfileSubTab('settings'); } },
            { label: 'Help & Privacy', icon: ShieldCheck, action: () => { playTap(); hapticTap(); setShowHelp(true); } },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-6 border-b border-secondary/10 last:border-0 hover:bg-secondary/5 transition-all active:pl-8"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/10">
                  <item.icon size={20} className="text-primary" />
                </div>
                <span className="font-extrabold text-[15px] tracking-tight text-secondary">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="text-secondary/40" size={20} />
              </div>
            </button>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => { playTap(); onLogout(); }}
          className="w-full p-6 mt-6 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
        >
          <LogOut size={18} />
          Log Out
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11px] tracking-widest mt-6 pb-2"
          style={{ color: 'var(--muted)', opacity: 0.45 }}
        >
          v{APP_VERSION}
        </motion.p>
      </motion.div>
    );
  }

  if (profileSubTab === 'settings') {
    return (
      <motion.div
        key="profile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <button
            onClick={() => { playTap(); setProfileSubTab('profile'); }}
            className="flex items-center gap-2 text-secondary/60 hover:text-secondary font-bold text-sm mb-2 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>
          {/* Sound toggle */}
          <div className="premium-card rounded-[32px] overflow-hidden border border-secondary/10">
            <div className="p-4 border-b border-secondary/10">
              <h2 className="font-black text-secondary text-lg">Sound &amp; feedback</h2>
              <p className="text-xs text-secondary/60 mt-1">Warm interaction sounds across the app.</p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Volume2 size={20} className="text-primary" />
                </div>
                <span className="font-bold text-secondary">Enable sounds</span>
              </div>
              <button
                role="switch"
                aria-checked={soundEnabled}
                onClick={() => { playToggle(!soundEnabled); setSoundEnabled(!soundEnabled); }}
                className={`relative w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-primary' : 'bg-secondary/20'}`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                  animate={{ x: soundEnabled ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ left: 4 }}
                />
              </button>
            </div>
          </div>

          <div className="premium-card rounded-[32px] overflow-hidden border border-secondary/10">
            <div className="p-4 border-b border-secondary/10">
              <h2 className="font-black text-secondary text-lg">Experimental features</h2>
              <p className="text-xs text-secondary/60 mt-1">Try upcoming features early.</p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="font-bold text-secondary">Enable experimental features</span>
              <button
                role="switch"
                aria-checked={experimentalFeatures}
                onClick={() => { playToggle(!experimentalFeatures); setExperimentalFeatures(!experimentalFeatures); }}
                className={`relative w-12 h-7 rounded-full transition-colors ${experimentalFeatures ? 'bg-primary' : 'bg-secondary/20'}`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                  animate={{ x: experimentalFeatures ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ left: 4 }}
                />
              </button>
            </div>
            {experimentalFeatures && (
              <div className="border-t border-secondary/10 p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowGroupChats(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
                >
                  <MessageCircle className="text-secondary" size={20} />
                  <span className="font-bold text-secondary">Group Chats</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-secondary/50">WhatsApp</span>
                </button>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                  <ShieldCheck className="text-green-500" size={20} />
                  <span className="font-bold text-secondary">Safe Mode</span>
                  <span className="ml-auto text-[10px] font-black text-green-500 uppercase tracking-wider">On</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                  <Zap className="text-accent" size={20} />
                  <span className="font-bold text-secondary">Smart Match</span>
                  <span className="ml-auto text-[10px] font-black text-accent uppercase tracking-wider">94%</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/5">
                  <Mail className="text-secondary" size={20} />
                  <span className="font-bold text-secondary">Invitations</span>
                  <span className="ml-auto text-[10px] font-black text-secondary uppercase tracking-wider">3 pending</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 md:p-10 max-w-4xl mx-auto pb-32 relative"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 relative">
        {/* Header with avatar and WarmthScore */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="text-center md:text-left">
            <div className="relative inline-block group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl mx-auto md:mx-0 mb-4 relative z-10 transition-transform group-hover:scale-105">
                <img src={user?.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="Profile" loading="lazy" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white drop-shadow-md" size={32} />
                </div>
              </div>
              <div className="absolute bottom-3 right-0 md:right-auto md:left-24 z-30 bg-white text-primary p-2 rounded-full shadow-lg border-2 border-primary group-hover:scale-110 transition-transform">
                <Camera size={14} className="stroke-[3px]" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 transform scale-150" />
              {experimentalFeatures && proEnabled && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-20 bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full text-white shadow-lg border border-white/20 whitespace-nowrap flex items-center gap-1"><Crown size={10} /> PRO</div>}
            </div>
            <h1 className="text-3xl font-black tracking-tighter mb-2 text-primary">{user?.name}<span className="text-accent">.</span></h1>
            {user?.selectedTitle && (
              <span className="inline-block px-3 py-1 mb-2 bg-accent/10 rounded-full border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">{user.selectedTitle}</span>
            )}
            <p className="text-sm text-secondary/60 font-medium max-w-xs leading-relaxed mb-3">{user?.bio}</p>
            <div className="flex items-center justify-center md:justify-start gap-5">
              <div className="text-center">
                <span className="text-lg font-black text-secondary">{user?.followers ?? 0}</span>
                <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Followers</p>
              </div>
              <div className="w-px h-6 bg-secondary/10" />
              <div className="text-center">
                <span className="text-lg font-black text-secondary">{user?.following ?? 0}</span>
                <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Following</p>
              </div>
            </div>
          </div>

          {/* Fame Score Circle */}
          <div className="flex-1 flex justify-center md:justify-end">
            <WarmthScore
              level={fameLevel.level}
              levelProgress={fameLevelProgress}
              levelIcon={fameLevel.icon}
              streak={loginStreak}
            />
          </div>
        </motion.div>

        {/* Fame Score Progress Card */}
        <motion.div
          variants={itemVariants}
          className="premium-card p-6 overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => { playClick(); setShowLevelDetail(true); }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{fameLevel.icon}</span>
              <div>
                <h3 className="font-black text-secondary text-base leading-tight">Fame Score</h3>
                <p className={`text-sm font-black ${fameLevel.color}`}>{fameLevel.title}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-accent">{totalXP}</span>
              <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Total XP</p>
              <p className="text-[8px] font-bold text-primary/50 uppercase tracking-widest mt-0.5">Tap for roadmap</p>
            </div>
          </div>
          <div className="w-full h-3 bg-secondary/10 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${fameLevelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          {fameLevel.level < 10 ? (
            <p className="text-[10px] text-secondary/40 font-bold">
              {xpToNextFame} XP to {nextFameLevel.title}
            </p>
          ) : (
            <p className="text-[10px] text-accent font-bold">Max Fame Score reached ✦</p>
          )}
        </motion.div>

        {/* Your Skills Section */}
        <motion.div variants={itemVariants} className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest">
              Your Skills<span className="text-accent">.</span>
            </h3>
            <span className="text-[9px] font-bold text-secondary/30 uppercase tracking-widest">
              {SKILLS.length} skills
            </span>
          </div>
          <div className="space-y-3">
            {SKILLS.map((skill) => (
              <SkillCard
                key={skill.key}
                skill={skill}
                xp={skillXP?.[skill.key] ?? 0}
                unlockedBadgeIds={allUnlockedBadgeIds}
              />
            ))}
          </div>
        </motion.div>

        {/* Badges/Stamps earned */}
        {allUnlockedBadgeIds.filter(id => SKILLS.flatMap(s => s.badges).some(b => b.id === id)).length > 0 && (
          <motion.div variants={itemVariants} className="premium-card p-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">
              Earned Badges<span className="text-accent">.</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {SKILLS.flatMap(skill =>
                skill.badges.filter(badge => {
                  const skillLvl = getSkillLevel(skillXP?.[skill.key] ?? 0);
                  return skillLvl >= badge.level || allUnlockedBadgeIds.includes(badge.id);
                }).map(badge => ({ ...badge, skill }))
              ).map(badge => (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center ${
                    badge.isStamp
                      ? 'bg-accent/10 border-accent/30'
                      : `${badge.skill.bgColor} ${badge.skill.borderColor}`
                  }`}
                  style={{ minWidth: 64 }}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className={`text-[9px] font-black leading-tight ${badge.isStamp ? 'text-accent' : badge.skill.color}`}>
                    {badge.name}
                  </span>
                  {badge.isStamp && (
                    <span className="text-[8px] text-accent/60 font-bold uppercase tracking-widest">Stamp</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legacy achievements (from old system) */}
        {userUnlockedTitles.filter(id => UNLOCKABLE_TITLES.some(t => t.id === id)).length > 0 && (
          <motion.div variants={itemVariants} className="premium-card p-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Achievements<span className="text-accent">.</span></h3>
            <div className="grid grid-cols-2 gap-3">
              {UNLOCKABLE_TITLES.filter(t => userUnlockedTitles.includes(t.id)).map(title => (
                <div key={title.id} className="p-4 rounded-2xl border bg-accent/5 border-accent/20">
                  <span className="text-2xl">{title.icon}</span>
                  <h4 className="text-xs font-bold mt-2 text-secondary">{title.title}</h4>
                  <p className="text-[9px] text-secondary/40 mt-0.5">{title.description}</p>
                  <span className="inline-block mt-2 text-[8px] font-black text-accent uppercase tracking-widest">+{title.xpReward} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connections Card */}
        <motion.div
          variants={itemVariants}
          className="premium-card p-6 flex items-center gap-6 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Users className="text-primary" size={28} />
          </div>
          <div>
            <span className="text-3xl font-black text-secondary">{joinedEvents.length}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60 mt-1">Connections</p>
          </div>
        </motion.div>

        {/* Become an Organiser CTA */}
        {!isOrganiser && (
          <motion.div
            variants={itemVariants}
            className="premium-card p-6 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform group"
            onClick={() => { playClick(); hapticTap(); setShowOrganiserSetup(true); }}
          >
            <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                <Megaphone size={26} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-secondary text-base">Become an Organiser</h3>
                <p className="text-[11px] text-secondary/50 font-medium mt-0.5">Host events, build communities & track your impact</p>
              </div>
              <ChevronRight size={20} className="text-accent/60 shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '📅', label: 'Host Events', desc: 'Create & manage' },
                { icon: '👥', label: 'Communities', desc: 'Build your tribe' },
                { icon: '📊', label: 'Analytics', desc: 'Track growth' },
              ].map((feature) => (
                <div key={feature.label} className="p-2.5 rounded-xl bg-secondary/5 border border-secondary/10 text-center">
                  <span className="text-lg block mb-1">{feature.icon}</span>
                  <p className="text-[10px] font-bold text-secondary">{feature.label}</p>
                  <p className="text-[8px] text-secondary/40 font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {experimentalFeatures && !proEnabled && (
          <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-secondary/10 text-center">
            <p className="text-xs text-secondary/60 mb-6 px-4 font-medium leading-relaxed italic">Unlock advanced matchmaking and event analytics for £12.99/mo</p>
            <button
              onClick={() => setShowProModal(true)}
              className="w-full bg-gradient-to-r from-primary to-accent py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl glow-primary transition-all active:scale-95 text-white"
            >
              Go Pro
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="premium-card overflow-hidden mt-6 rounded-[32px] bg-secondary/5 border border-secondary/10">
        {[
          { label: 'My Bookings', icon: Check, action: () => { playTap(); hapticTap(); setShowBookings(true); }, badge: joinedEvents.length },
          { label: 'Saved Experiences', icon: Heart, action: () => { playTap(); hapticTap(); setShowSaved(true); }, badge: savedEvents.length },
          ...(experimentalFeatures ? [{ label: 'Socialise Pass', icon: Zap, action: () => { playTap(); setShowProModal(true); } }] : []),
          { label: 'Settings', icon: Settings, action: () => { playTap(); hapticTap(); setProfileSubTab('settings'); } },
          { label: 'Help & Privacy', icon: ShieldCheck, action: () => { playTap(); hapticTap(); setShowHelp(true); } },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center justify-between p-6 border-b border-secondary/10 last:border-0 hover:bg-secondary/5 transition-all active:pl-8"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/10">
                <item.icon size={20} className="text-primary" />
              </div>
              <span className="font-extrabold text-[15px] tracking-tight text-secondary">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="text-secondary/40" size={20} />
            </div>
          </button>
        ))}
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={() => { playTap(); onLogout(); }}
        className="w-full p-6 mt-6 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
      >
        <LogOut size={18} />
        Log Out
      </motion.button>

      <motion.p
        variants={itemVariants}
        className="text-center text-[11px] tracking-widest mt-6 pb-2"
        style={{ color: 'var(--muted)', opacity: 0.45 }}
      >
        v{APP_VERSION}
      </motion.p>
    </motion.div>
  );
}

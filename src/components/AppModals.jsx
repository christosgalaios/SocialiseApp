import React, { Suspense } from 'react';
import { Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import useEventStore from '../stores/eventStore';
import useCommunityStore from '../stores/communityStore';
import useFeedStore from '../stores/feedStore';
import useUIStore from '../stores/uiStore';
import api from '../api';
import { formatError } from '../errorUtils';
import {
  FAME_SCORE_LEVELS,
  SKILLS,
  getFameLevel,
  getSkillLevel,
  getSkillLevelProgress,
  SKILL_LEVEL_THRESHOLDS,
} from '../data/constants';
import EventDetailSheet from './EventDetailSheet';
import TribeSheet from './TribeSheet';
import TribeDiscovery from './TribeDiscovery';
import MyBookingsSheet from './MyBookingsSheet';
import SavedEventsSheet from './SavedEventsSheet';
import ProUpgradeModal from './ProUpgradeModal';
import HelpSheet from './HelpSheet';
import GroupChatsSheet from './GroupChatsSheet';
import UserProfileSheet from './UserProfileSheet';
import LevelUpScreen from './LevelUpScreen';
import AvatarCropModal from './AvatarCropModal';
import BugReportModal from './BugReportModal';
import FeatureRequestModal from './FeatureRequestModal';
import ChangelogSheet from './ChangelogSheet';
import OrganiserProfileSheet from './OrganiserProfileSheet';

const OrganiserSetupFlow = React.lazy(() => import('./OrganiserSetupFlow'));

// Match Analysis Modal (inline component)
const MatchAnalysisModal = ({ event, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-xl" role="alertdialog" aria-modal="true" aria-label="Match analysis">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-2 p-8 rounded-[40px] max-w-sm w-full text-center border border-white/10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary animate-[shimmer_2s_infinite]" />
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Zap size={40} className="text-primary animate-pulse" />
      </div>
      <h3 className="text-2xl font-black mb-2">High Synergy Detected</h3>
      <p className="text-sm text-secondary/60 mb-8 leading-relaxed">
        Our AI has analyzed the attendee list. You have a <span className="text-primary font-black">94% match</span> with this tribe based on your interests in <span className="text-white font-bold">{(event.matchTags?.slice(0, 2).join(' & ')) ?? 'this event'}</span>.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-4 rounded-xl font-black bg-primary text-white shadow-lg glow-primary hover:scale-[1.02] transition-transform">Join Tribe</button>
      </div>
    </motion.div>
  </div>
);

export default function AppModals({ handleJoin, sendMessage }) {
  const user = useAuthStore((s) => s.user);
  const handleLogoutAuth = useAuthStore((s) => s.handleLogout);

  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const showMatchModal = useEventStore((s) => s.showMatchModal);
  const setShowMatchModal = useEventStore((s) => s.setShowMatchModal);
  const joinedEvents = useEventStore((s) => s.joinedEvents);
  const chatMessages = useEventStore((s) => s.chatMessages);
  const events = useEventStore((s) => s.events);
  const setEvents = useEventStore((s) => s.setEvents);
  const setJoinedEvents = useEventStore((s) => s.setJoinedEvents);
  const setSavedEvents = useEventStore((s) => s.setSavedEvents);

  const selectedTribe = useCommunityStore((s) => s.selectedTribe);
  const setSelectedTribe = useCommunityStore((s) => s.setSelectedTribe);
  const showTribeDiscovery = useCommunityStore((s) => s.showTribeDiscovery);
  const setShowTribeDiscovery = useCommunityStore((s) => s.setShowTribeDiscovery);
  const handleJoinTribe = useCommunityStore((s) => s.handleJoinTribe);
  const handleLeaveTribe = useCommunityStore((s) => s.handleLeaveTribe);
  const userTribes = useCommunityStore((s) => s.userTribes);
  const communities = useCommunityStore((s) => s.communities);
  const setCommunities = useCommunityStore((s) => s.setCommunities);

  const selectedUserProfile = useFeedStore((s) => s.selectedUserProfile);
  const setSelectedUserProfile = useFeedStore((s) => s.setSelectedUserProfile);
  const setFeedPosts = useFeedStore((s) => s.setFeedPosts);

  const showBookings = useUIStore((s) => s.showBookings);
  const setShowBookings = useUIStore((s) => s.setShowBookings);
  const showSaved = useUIStore((s) => s.showSaved);
  const setShowSaved = useUIStore((s) => s.setShowSaved);
  const showProModal = useUIStore((s) => s.showProModal);
  const setShowProModal = useUIStore((s) => s.setShowProModal);
  const showHelp = useUIStore((s) => s.showHelp);
  const setShowHelp = useUIStore((s) => s.setShowHelp);
  const showGroupChats = useUIStore((s) => s.showGroupChats);
  const setShowGroupChats = useUIStore((s) => s.setShowGroupChats);
  const showLevelUp = useUIStore((s) => s.showLevelUp);
  const setShowLevelUp = useUIStore((s) => s.setShowLevelUp);
  const levelUpData = useUIStore((s) => s.levelUpData);
  const showLevelDetail = useUIStore((s) => s.showLevelDetail);
  const setShowLevelDetail = useUIStore((s) => s.setShowLevelDetail);
  const setShowConfetti = useUIStore((s) => s.setShowConfetti);
  const setProEnabled = useUIStore((s) => s.setProEnabled);
  const showToast = useUIStore((s) => s.showToast);
  const avatarCropImage = useUIStore((s) => s.avatarCropImage);
  const setAvatarCropImage = useUIStore((s) => s.setAvatarCropImage);
  const skillXP = useUIStore((s) => s.skillXP);
  const totalXP = Object.values(skillXP || {}).reduce((sum, v) => sum + (v || 0), 0);
  const showBugReport = useUIStore((s) => s.showBugReport);
  const setShowBugReport = useUIStore((s) => s.setShowBugReport);
  const showFeatureRequest = useUIStore((s) => s.showFeatureRequest);
  const setShowFeatureRequest = useUIStore((s) => s.setShowFeatureRequest);
  const showChangelog = useUIStore((s) => s.showChangelog);
  const setShowChangelog = useUIStore((s) => s.setShowChangelog);
  const showOrganiserSetup = useUIStore((s) => s.showOrganiserSetup);
  const savedEventsData = useEventStore((s) => s.savedEvents);

  const handleAvatarCropSave = async (croppedDataUrl) => {
    // Optimistic update — show the new avatar immediately
    const previousAvatar = user?.avatar;
    useAuthStore.getState().setUser({ ...user, avatar: croppedDataUrl });
    setAvatarCropImage(null);

    try {
      const updatedUser = await api.updateProfile({ avatar: croppedDataUrl });
      useAuthStore.getState().setUser(updatedUser);
      showToast('Profile photo updated!', 'success');
    } catch (err) {
      // Rollback on failure
      useAuthStore.getState().setUser({ ...user, avatar: previousAvatar });
      showToast(formatError(err, 'Failed to update profile photo'), 'error');
    }
  };

  const handleAvatarCropCancel = () => {
    if (avatarCropImage) URL.revokeObjectURL(avatarCropImage);
    setAvatarCropImage(null);
  };

  return (
    <AnimatePresence>
      {selectedEvent && (
        <EventDetailSheet
          key="event-detail"
          event={selectedEvent}
          isJoined={joinedEvents.includes(selectedEvent.id)}
          onJoin={() => {
            if (selectedEvent.isMicroMeet && !joinedEvents.includes(selectedEvent.id)) {
              setShowMatchModal(selectedEvent);
            } else {
              handleJoin(selectedEvent.id);
            }
          }}
          onClose={() => setSelectedEvent(null)}
          messages={chatMessages[selectedEvent.id] || []}
          onSendMessage={(text) => sendMessage(selectedEvent.id, text)}
          onOpenProfile={setSelectedUserProfile}
        />
      )}
      {showMatchModal && (
        <MatchAnalysisModal
          key="match-modal"
          event={showMatchModal}
          onConfirm={() => {
            handleJoin(showMatchModal.id);
            setShowMatchModal(null);
          }}
          onCancel={() => setShowMatchModal(null)}
        />
      )}
      {/* Tribe Modals */}
      <TribeSheet
        key="tribe-sheet"
        tribe={selectedTribe}
        isOpen={!!selectedTribe}
        onClose={() => setSelectedTribe(null)}
        onLeave={handleLeaveTribe}
      />
      <TribeDiscovery
        key="tribe-discovery"
        isOpen={showTribeDiscovery}
        onClose={() => setShowTribeDiscovery(false)}
        onJoin={handleJoinTribe}
        joinedTribes={userTribes}
      />
      {/* Level Roadmap Sheet */}
      {showLevelDetail && (
        <motion.div
          key="level-detail"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-secondary/60 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Fame Score roadmap"
          onClick={() => setShowLevelDetail(false)}
        >
          <motion.div
            className="w-full max-w-lg bg-paper rounded-t-[40px] p-6 pb-12 max-h-[90vh] overflow-y-auto no-scrollbar border-t border-secondary/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <h2 className="text-2xl font-black text-secondary mb-1">Your Roadmap<span className="text-accent">.</span></h2>
            <p className="text-xs text-secondary/50 mb-2 font-medium">Skills, milestones & Fame Score progression</p>

            {/* Fame Score section */}
            <div className="mb-6">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Fame Score</p>
              {(() => {
                const fameLevel = getFameLevel(totalXP);
                return (
                  <div className="space-y-2">
                    {FAME_SCORE_LEVELS.map((lvl, i) => {
                      const isCurrentLevel = lvl.level === fameLevel.level;
                      const isUnlocked = totalXP >= lvl.totalXpRequired;
                      const nextLvl = FAME_SCORE_LEVELS[i + 1];
                      const xpIn = isCurrentLevel ? totalXP - lvl.totalXpRequired : 0;
                      const xpNeed = nextLvl ? nextLvl.totalXpRequired - lvl.totalXpRequired : 0;
                      const prog = isCurrentLevel && xpNeed > 0 ? Math.min((xpIn / xpNeed) * 100, 100) : 0;
                      return (
                        <div
                          key={lvl.level}
                          className={`p-3 rounded-2xl border transition-all ${
                            isCurrentLevel
                              ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                              : isUnlocked
                              ? 'bg-accent/5 border-accent/20'
                              : 'bg-secondary/5 border-secondary/10 opacity-40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{lvl.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-secondary text-xs">Fame {lvl.level}</span>
                                  <span className={`text-xs font-bold ${lvl.color}`}>{lvl.title}</span>
                                </div>
                                {isCurrentLevel && (
                                  <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Now</span>
                                )}
                                {!isUnlocked && (
                                  <div className="flex items-center gap-1 text-secondary/40">
                                    <Lock size={10} />
                                    <span className="text-[9px] font-bold">{lvl.totalXpRequired} XP</span>
                                  </div>
                                )}
                              </div>
                              {isCurrentLevel && nextLvl && (
                                <>
                                  <div className="w-full h-1.5 bg-secondary/10 rounded-full mt-1.5 overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${prog}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                  </div>
                                  <p className="text-[9px] text-secondary/40 mt-1">{xpIn} / {xpNeed} XP to {nextLvl.title}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Skills section */}
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Your Skills</p>
            <div className="space-y-4">
              {SKILLS.map((skill) => {
                const xp = skillXP?.[skill.key] ?? 0;
                const level = getSkillLevel(xp);
                const progressPct = getSkillLevelProgress(xp);
                const thresholdForLevel = SKILL_LEVEL_THRESHOLDS[level - 1] ?? 0;
                const nextThreshold = SKILL_LEVEL_THRESHOLDS[level] ?? thresholdForLevel;
                const xpInLevel = xp - thresholdForLevel;
                const xpNeeded = nextThreshold - thresholdForLevel;
                return (
                  <div key={skill.key} className={`rounded-2xl border p-4 ${skill.bgColor} ${skill.borderColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{skill.icon}</span>
                      <span className={`font-black text-sm ${skill.color}`}>{skill.label}</span>
                      <span className="ml-auto text-[10px] font-black text-secondary/50 bg-secondary/5 px-2 py-0.5 rounded-full">Lv. {level}</span>
                    </div>
                    <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden mb-1">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${skill.barFrom} ${skill.barTo}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[9px] text-secondary/40 font-bold mb-3">
                      {level < 10 ? `${xpInLevel} / ${xpNeeded} XP` : 'Max Level'}
                    </p>
                    {/* Milestone badges */}
                    <div className="grid grid-cols-4 gap-2">
                      {skill.badges.map((badge) => {
                        const earned = level >= badge.level;
                        return (
                          <div key={badge.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                            earned
                              ? badge.isStamp
                                ? 'bg-accent/10 border-accent/30'
                                : `${skill.bgColor} ${skill.borderColor}`
                              : 'bg-secondary/5 border-secondary/10 opacity-30'
                          }`}>
                            <span className="text-lg">{badge.icon}</span>
                            <span className={`text-[8px] font-bold leading-tight ${earned ? 'text-secondary/70' : 'text-secondary/30'}`}>
                              Lv.{badge.level}
                            </span>
                            {badge.isStamp && earned && (
                              <span className="text-[7px] font-black text-accent uppercase">stamp</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Profile Modals */}
      <MyBookingsSheet
        key="bookings"
        isOpen={showBookings}
        onClose={() => setShowBookings(false)}
        bookings={events.filter(e => joinedEvents.includes(e.id))}
        onCancel={async (id) => {
          setJoinedEvents(prev => prev.filter(eid => eid !== id));
          showToast('Booking cancelled', 'info');
          try {
            await api.leaveEvent(id);
          } catch (err) {
            setJoinedEvents(prev => [...prev, id]);
            showToast(formatError(err), 'error');
          }
        }}
      />
      <SavedEventsSheet
        key="saved"
        isOpen={showSaved}
        onClose={() => setShowSaved(false)}
        savedEvents={events.filter(e => savedEventsData.includes(e.id))}
        onRemove={async (id) => {
          setSavedEvents(prev => prev.filter(eid => eid !== id));
          showToast('Removed from saved', 'info');
          try {
            await api.unsaveEvent(id);
          } catch (err) {
            setSavedEvents(prev => [...prev, id]);
            showToast(formatError(err), 'error');
          }
        }}
        onSelect={(event) => {
          setShowSaved(false);
          setSelectedEvent(event);
        }}
      />
      <ProUpgradeModal
        key="pro"
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        onUpgrade={() => {
          setProEnabled(true);
          setShowConfetti(true);
          showToast('Welcome to Socialise Pro! 🎉', 'success');
        }}
      />
      <HelpSheet
        key="help"
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        onDeleteAccount={async () => {
          try {
            await api.deleteAccount();
            setShowHelp(false);
            setEvents([]);
            setJoinedEvents([]);
            setSavedEvents([]);
            setCommunities([]);
            setFeedPosts([]);
            useUIStore.getState().resetUserData();
            useCommunityStore.getState().resetUserTribes();
            handleLogoutAuth();
            showToast('Account deleted successfully', 'info');
          } catch (err) {
            showToast(formatError(err, 'Failed to delete account'), 'error');
          }
        }}
      />
      <GroupChatsSheet
        isOpen={showGroupChats}
        onClose={() => setShowGroupChats(false)}
        joinedCommunities={communities.filter((c) => userTribes.includes(c.id))}
      />
      <UserProfileSheet
        key="user-profile"
        profile={selectedUserProfile}
        isOpen={!!selectedUserProfile}
        onClose={() => setSelectedUserProfile(null)}
        onMessage={(p) => showToast(`Opening chat with ${p.name}…`, 'info')}
      />
      <LevelUpScreen
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelUpData={levelUpData}
      />
      <AvatarCropModal
        imageUrl={avatarCropImage}
        isOpen={!!avatarCropImage}
        onSave={handleAvatarCropSave}
        onCancel={handleAvatarCropCancel}
      />
      <BugReportModal
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        onSubmit={async (formData) => {
          const path = window.location.pathname;
          const environment = path.includes('/prod') ? 'PROD' : path.includes('/dev') ? 'DEV' : 'LOCAL';
          const result = await api.reportBug({
            ...formData,
            app_version: import.meta.env.VITE_APP_VERSION || '0.1.dev',
            environment,
          });
          showToast(`Bug report ${result.bugId} logged!`, 'success');
        }}
      />
      <FeatureRequestModal
        isOpen={showFeatureRequest}
        onClose={() => setShowFeatureRequest(false)}
        onSubmit={async (formData) => {
          const path = window.location.pathname;
          const environment = path.includes('/prod') ? 'PROD' : path.includes('/dev') ? 'DEV' : 'LOCAL';
          const result = await api.submitFeatureRequest({
            ...formData,
            app_version: import.meta.env.VITE_APP_VERSION || '0.1.dev',
            environment,
          });
          showToast(`Feature request ${result.bugId} logged!`, 'success');
        }}
      />
      <ChangelogSheet
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
      {showOrganiserSetup && (
        <Suspense fallback={null}>
          <OrganiserSetupFlow key="organiser-setup" />
        </Suspense>
      )}
      <OrganiserProfileSheet key="organiser-profile" />
    </AnimatePresence>
  );
}

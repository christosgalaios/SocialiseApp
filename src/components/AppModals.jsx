import { lazy, Suspense } from 'react';
import { Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import useEventStore from '../stores/eventStore';
import useCommunityStore from '../stores/communityStore';
import useFeedStore from '../stores/feedStore';
import useUIStore from '../stores/uiStore';
import api from '../api';
import { XP_LEVELS } from '../data/constants';
import EventDetailSheet from './EventDetailSheet';
import TribeSheet from './TribeSheet';
import TribeDiscovery from './TribeDiscovery';
import MyBookingsSheet from './MyBookingsSheet';
import SavedEventsSheet from './SavedEventsSheet';
import ProUpgradeModal from './ProUpgradeModal';
import HelpSheet from './HelpSheet';
import GroupChatsSheet from './GroupChatsSheet';
import UserProfileSheet from './UserProfileSheet';
import LevelUpModal from './LevelUpModal';
import AvatarCropModal from './AvatarCropModal';
import BugReportModal from './BugReportModal';

// Lazy-loaded: CreateEventModal pulls in LocationPicker → Google Maps (~50kb)
const CreateEventModal = lazy(() => import('./CreateEventModal'));
const EventReels = lazy(() => import('./EventReels'));

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

export default function AppModals({ handleJoin, sendMessage, createNewEvent, filteredEvents }) {
  const user = useAuthStore((s) => s.user);
  const handleLogoutAuth = useAuthStore((s) => s.handleLogout);

  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const setSelectedEvent = useEventStore((s) => s.setSelectedEvent);
  const showCreate = useEventStore((s) => s.showCreate);
  const setShowCreate = useEventStore((s) => s.setShowCreate);
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
  const showReels = useUIStore((s) => s.showReels);
  const setShowReels = useUIStore((s) => s.setShowReels);
  const setShowConfetti = useUIStore((s) => s.setShowConfetti);
  const setProEnabled = useUIStore((s) => s.setProEnabled);
  const showToast = useUIStore((s) => s.showToast);
  const avatarCropImage = useUIStore((s) => s.avatarCropImage);
  const setAvatarCropImage = useUIStore((s) => s.setAvatarCropImage);
  const userXP = useUIStore((s) => s.userXP);
  const showBugReport = useUIStore((s) => s.showBugReport);
  const setShowBugReport = useUIStore((s) => s.setShowBugReport);
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
    } catch {
      // Rollback on failure
      useAuthStore.getState().setUser({ ...user, avatar: previousAvatar });
      showToast('Failed to update profile photo', 'error');
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
      {showCreate && (
        <Suspense fallback={null}>
          <CreateEventModal key="create-event" onClose={() => setShowCreate(false)} onSubmit={createNewEvent} />
        </Suspense>
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
      {/* Level Detail Modal */}
      {showLevelDetail && (
        <motion.div
          key="level-detail"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-secondary/60 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Level roadmap"
          onClick={() => setShowLevelDetail(false)}
        >
          <motion.div
            className="w-full max-w-lg bg-paper rounded-t-[40px] p-6 pb-12 max-h-[85vh] overflow-y-auto no-scrollbar border-t border-secondary/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <h2 className="text-2xl font-black text-secondary mb-1">Level Roadmap<span className="text-accent">.</span></h2>
            <p className="text-xs text-secondary/50 mb-6 font-medium">Your progress and upcoming unlocks</p>

            {(() => {
              const currentLevel = XP_LEVELS.filter(l => l.xpRequired <= userXP).pop() || XP_LEVELS[0];
              return (
                <div className="space-y-3">
                  {XP_LEVELS.map((lvl, i) => {
                    const isCurrentLevel = lvl.level === currentLevel.level;
                    const isUnlocked = userXP >= lvl.xpRequired;
                    const nextLvl = XP_LEVELS[i + 1];
                    const xpIn = isCurrentLevel ? userXP - lvl.xpRequired : 0;
                    const xpNeed = nextLvl ? nextLvl.xpRequired - lvl.xpRequired : 0;
                    const prog = isCurrentLevel && xpNeed > 0 ? Math.min((xpIn / xpNeed) * 100, 100) : 0;
                    return (
                      <div
                        key={lvl.level}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrentLevel
                            ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                            : isUnlocked
                            ? 'bg-accent/5 border-accent/20'
                            : 'bg-secondary/5 border-secondary/10 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{lvl.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-black text-secondary text-sm">Level {lvl.level}</span>
                                <span className={`ml-2 text-xs font-bold ${lvl.color}`}>{lvl.title}</span>
                              </div>
                              {isCurrentLevel && (
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Current</span>
                              )}
                              {!isUnlocked && (
                                <div className="flex items-center gap-1 text-secondary/40">
                                  <Lock size={12} />
                                  <span className="text-[9px] font-bold">{lvl.xpRequired} XP</span>
                                </div>
                              )}
                            </div>
                            {isCurrentLevel && nextLvl && (
                              <>
                                <div className="w-full h-1.5 bg-secondary/10 rounded-full mt-2 overflow-hidden">
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
            showToast(err.message, 'error');
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
            showToast(err.message, 'error');
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
            showToast(err.message || 'Failed to delete account', 'error');
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
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={levelUpData?.newLevel}
        unlockedTitle={levelUpData?.unlockedTitle}
      />
      {showReels && (
        <Suspense fallback={null}>
          <EventReels
            events={filteredEvents}
            onClose={() => setShowReels(false)}
            onSelectEvent={(event) => {
              setShowReels(false);
              setSelectedEvent(event);
            }}
          />
        </Suspense>
      )}
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
          const result = await api.reportBug(formData);
          showToast(`Bug report ${result.bugId} logged!`, 'success');
        }}
      />
    </AnimatePresence>
  );
}

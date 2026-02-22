import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;
import { X, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

// Deterministic hash for stable follower counts based on name
const nameHash = (name, seed = 5) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = ((hash << seed) - hash) + name.charCodeAt(i);
    return Math.abs(hash);
};

/**
 * Sheet showing another user's profile (avatar, name, optional community/bio).
 * Opened when clicking on a user in feed, comments, or event chat.
 */
const UserProfileSheet = ({ profile, isOpen, onClose, onMessage }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    useEscapeKey(isOpen, onClose);
    const focusTrapRef = useFocusTrap(isOpen);

    if (!profile) return null;

    const { name, avatar, community } = profile;
    const bio = profile.bio ?? (community ? `Member of ${community}` : 'Part of the Socialise community.');
    const followers = profile.followers ?? (nameHash(name, 5) % 180 + 20);
    const following = profile.following ?? (nameHash(name, 3) % 90 + 10);

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] bg-secondary/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={profile?.name ? `${profile.name}'s profile` : 'User profile'}
                    ref={focusTrapRef}
                >
                    <MotionDiv
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 top-[20%] bg-paper rounded-t-[32px] overflow-hidden shadow-2xl border-t border-secondary/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 rounded-full bg-secondary/20" />
                        </div>
                        <div className="px-6 pb-8">
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[28px] overflow-hidden border-2 border-secondary/10 shadow-xl mb-4">
                                    <img src={avatar} alt={name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-secondary mb-1">
                                    {name}<span className="text-accent">.</span>
                                </h2>
                                {community && (
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{community}</p>
                                )}

                                {/* Follower stats */}
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="text-center">
                                        <span className="text-xl font-black text-secondary">{isFollowing ? followers + 1 : followers}</span>
                                        <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">Followers</p>
                                    </div>
                                    <div className="w-px h-8 bg-secondary/10" />
                                    <div className="text-center">
                                        <span className="text-xl font-black text-secondary">{following}</span>
                                        <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">Following</p>
                                    </div>
                                </div>

                                <p className="text-sm text-secondary/70 font-medium max-w-xs mb-6">{bio}</p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        className={`flex-1 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all ${
                                            isFollowing
                                                ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                                : 'bg-primary text-white'
                                        }`}
                                    >
                                        {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                    <button
                                        onClick={() => { onMessage?.(profile); onClose(); }}
                                        className="flex-1 py-4 rounded-[24px] bg-secondary/10 text-secondary border border-secondary/20 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                                    >
                                        <MessageCircle size={18} />
                                        Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default UserProfileSheet;

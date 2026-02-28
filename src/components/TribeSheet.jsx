import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, LogOut, Bell, BellOff, Star, UserPlus, UserCheck, Shield, Heart } from 'lucide-react';
import api from '../api';
import FeedItem from './FeedItem';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import { DEFAULT_AVATAR } from '../data/constants';
import { playSwooshClose, hapticTap } from '../utils/feedback';

const TribeSheet = ({ tribe, isOpen, onClose, onLeave }) => {
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [isFollowing, setIsFollowing] = useState(true);
    const [activeSection, setActiveSection] = useState('activity'); // 'activity' | 'reviews'
    useEscapeKey(isOpen, onClose);
    const focusTrapRef = useFocusTrap(isOpen);
    const { sheetY, dragZoneProps } = useSwipeToClose(onClose);
    const [tribePosts, setTribePosts] = useState([]);
    const reviews = [];

    useEffect(() => {
        if (!isOpen || !tribe?.id) return;
        let cancelled = false;
        api.getFeed({ community_id: tribe.id }).then(data => {
            if (!cancelled) setTribePosts(data || []);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [isOpen, tribe?.id]);

    if (!tribe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label={tribe?.name || 'Tribe details'}
                    ref={focusTrapRef}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 top-16 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{ y: sheetY }}
                    >
                        {/* Drag zone — handle + header title row */}
                        <div {...dragZoneProps}>
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 rounded-full bg-secondary/20" aria-hidden="true" />
                        </div>
                        <div className="px-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-4xl border border-secondary/20">
                                        {tribe.avatar}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-primary">{tribe.name}<span className="text-accent">.</span></h2>
                                        <p className="text-sm text-secondary/60 flex items-center gap-2">
                                            <Users size={14} />
                                            {tribe.members.toLocaleString()} members
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { playSwooshClose(); hapticTap(); onClose(); }}
                                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        </div>

                        {/* Header details */}
                        <div className="px-6 pb-6 border-b border-secondary/10">

                            {/* Curated badge + rating */}
                            <div className="flex items-center gap-3 mb-3">
                                {tribe.isCurated && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">
                                        <Shield size={12} /> Curated Group
                                    </span>
                                )}
                                {tribe.rating && (
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 text-[10px] font-black text-amber-600">
                                        <Star size={12} className="fill-current" /> {tribe.rating} ({tribe.reviewCount})
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-secondary/80 mb-4">{tribe.description}</p>

                            {/* Member avatars + follower count */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                        {tribe.memberAvatars?.slice(0, 4).map((avatar, i) => (
                                            <img
                                                key={i}
                                                src={avatar || DEFAULT_AVATAR}
                                                alt="Member"
                                                className="w-8 h-8 rounded-full border-2 border-paper object-cover"
                                                loading="lazy"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-secondary/50">
                                        +{(tribe.members - 4).toLocaleString()} others
                                    </span>
                                </div>
                                {tribe.followers && (
                                    <div className="flex items-center gap-1.5 text-xs text-secondary/60 font-bold">
                                        <Heart size={14} className="text-primary" />
                                        {tribe.followers.toLocaleString()} followers
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsFollowing(!isFollowing)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${isFollowing
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-primary text-white'
                                    }`}
                                >
                                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button
                                    onClick={() => setNotificationsOn(!notificationsOn)}
                                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${notificationsOn
                                        ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                        : 'bg-secondary/5 text-secondary/50 border border-secondary/10'
                                        }`}
                                    aria-label={notificationsOn ? 'Mute notifications' : 'Enable notifications'}
                                >
                                    {notificationsOn ? <Bell size={16} /> : <BellOff size={16} />}
                                </button>
                                <button
                                    onClick={() => onLeave(tribe.id)}
                                    className="px-4 py-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:outline-none"
                                    aria-label="Leave tribe"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Section tabs: Activity / Reviews */}
                        <div className="flex border-b border-secondary/10" role="tablist" aria-label="Tribe sections">
                            {['activity', 'reviews'].map(section => (
                                <button
                                    key={section}
                                    role="tab"
                                    aria-selected={activeSection === section}
                                    onClick={() => setActiveSection(section)}
                                    className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all border-b-2 -mb-px ${
                                        activeSection === section
                                            ? 'border-primary text-secondary'
                                            : 'border-transparent text-secondary/40'
                                    }`}
                                >
                                    {section === 'activity' ? 'Activity' : `Reviews (${reviews.length})`}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto no-scrollbar overscroll-contain" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                            {activeSection === 'activity' ? (
                                <>
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">
                                        Recent Activity<span className="text-accent">.</span>
                                    </h3>
                                    {tribePosts.length > 0 ? (
                                        <div className="space-y-4">
                                            {tribePosts.map(post => (
                                                <FeedItem key={post.id} post={post} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-secondary/40">
                                            <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm font-medium">No recent posts</p>
                                            <p className="text-xs mt-1">Be the first to share something!</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Reviews Section */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-3xl font-black text-secondary">{tribe.rating}</span>
                                                <div className="flex">
                                                    {[1,2,3,4,5].map(i => (
                                                        <Star key={i} size={16} className={i <= Math.round(tribe.rating) ? 'text-amber-500 fill-current' : 'text-secondary/20'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-secondary/50 font-bold">{tribe.reviewCount} reviews</p>
                                        </div>
                                        <button className="px-4 py-2.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none">
                                            Write Review
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {reviews.map(review => (
                                            <div key={review.id} className="premium-card p-5">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img src={review.avatar || DEFAULT_AVATAR} alt={review.user} className="w-10 h-10 rounded-full object-cover border border-secondary/10" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-secondary">{review.user}</h4>
                                                        <p className="text-[10px] text-secondary/40">{review.time}</p>
                                                    </div>
                                                    <div className="flex">
                                                        {[1,2,3,4,5].map(i => (
                                                            <Star key={i} size={12} className={i <= review.rating ? 'text-amber-500 fill-current' : 'text-secondary/20'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-secondary/70 leading-relaxed">{review.text}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button className="text-[10px] font-bold text-secondary/40 flex items-center gap-1 hover:text-primary transition-colors">
                                                        <Heart size={12} /> Helpful ({review.helpful})
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {reviews.length === 0 && (
                                            <div className="text-center py-12 text-secondary/40">
                                                <Star size={32} className="mx-auto mb-3 opacity-50" />
                                                <p className="text-sm font-medium">No reviews yet</p>
                                                <p className="text-xs mt-1">Be the first to review this group!</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TribeSheet;

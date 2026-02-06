import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, Calendar, ChevronRight, LogOut, Bell, BellOff } from 'lucide-react';
import { FEED_POSTS } from '../data/mockData';
import FeedItem from './FeedItem';

const TribeSheet = ({ tribe, isOpen, onClose, onLeave }) => {
    const [notificationsOn, setNotificationsOn] = useState(true);
    const tribePosts = FEED_POSTS.filter(p => p.communityId === tribe?.id);

    if (!tribe) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 top-16 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-6 border-b border-white/5">
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
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-sm text-secondary/80 mb-4">{tribe.description}</p>

                            {/* Member avatars */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex -space-x-3">
                                    {tribe.memberAvatars?.slice(0, 4).map((avatar, i) => (
                                        <img
                                            key={i}
                                            src={avatar}
                                            alt=""
                                            className="w-8 h-8 rounded-full border-2 border-paper object-cover"
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-secondary/50">
                                    +{(tribe.members - 4).toLocaleString()} others
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setNotificationsOn(!notificationsOn)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${notificationsOn
                                        ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                        : 'bg-white/5 text-secondary/50 border border-white/10'
                                        }`}
                                >
                                    {notificationsOn ? <Bell size={16} /> : <BellOff size={16} />}
                                    {notificationsOn ? 'Notifications On' : 'Notifications Off'}
                                </button>
                                <button
                                    onClick={() => onLeave(tribe.id)}
                                    className="px-6 py-3 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Leave
                                </button>
                            </div>
                        </div>

                        {/* Tribe Feed */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
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
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TribeSheet;

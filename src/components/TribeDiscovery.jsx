import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, UserPlus, Check } from 'lucide-react';
import api from '../api';

const TribeDiscovery = ({ isOpen, onClose, onJoin, joinedTribes = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [joiningId, setJoiningId] = useState(null);
    const [allCommunities, setAllCommunities] = useState([]);

    // Fetch communities when the modal opens
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        api.getCommunities().then(data => {
            if (!cancelled) setAllCommunities(data || []);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [isOpen]);

    const filteredTribes = allCommunities
        .filter(tribe => !joinedTribes.includes(tribe.id))
        .filter(tribe =>
            tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tribe.category || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleJoin = (tribe) => {
        setJoiningId(tribe.id);
        setTimeout(() => {
            onJoin(tribe);
            setJoiningId(null);
        }, 600);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-paper border border-secondary/20 rounded-[32px] w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-black tracking-tight text-primary">
                                    Find Your Tribe<span className="text-accent">.</span>
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50" />
                                <input
                                    type="text"
                                    placeholder="Search tribes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-secondary/10 border border-secondary/20 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40"
                                />
                            </div>
                        </div>

                        {/* Tribes List */}
                        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
                            <p className="text-xs font-bold text-secondary/50 uppercase tracking-widest mb-3 px-2">
                                Suggested for you
                            </p>
                            <div className="space-y-3">
                                {filteredTribes.map(tribe => {
                                    const isJoined = joinedTribes.includes(tribe.id);
                                    const isJoining = joiningId === tribe.id;

                                    return (
                                        <motion.div
                                            key={tribe.id}
                                            layout
                                            className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 hover:border-secondary/20 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-3xl border border-secondary/20 shrink-0">
                                                    {tribe.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-bold text-sm truncate">{tribe.name}</h3>
                                                            <p className="text-xs text-secondary/50 flex items-center gap-1">
                                                                <Users size={12} />
                                                                {tribe.members.toLocaleString()} members
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => !isJoined && handleJoin(tribe)}
                                                            disabled={isJoined || isJoining}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${isJoined
                                                                ? 'bg-accent/20 text-accent border border-accent/30'
                                                                : isJoining
                                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                                    : 'bg-primary text-white hover:bg-primary/90'
                                                                }`}
                                                        >
                                                            {isJoined ? (
                                                                <>
                                                                    <Check size={14} />
                                                                    Joined
                                                                </>
                                                            ) : isJoining ? (
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                                                                    className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <UserPlus size={14} />
                                                                    Join
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-secondary/60 mt-1 line-clamp-2">{tribe.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] text-accent font-bold flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full">
                                                            <Users size={12} />
                                                            {tribe.category || 'Community'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TribeDiscovery;

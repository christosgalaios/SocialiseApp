import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const SavedEventsSheet = ({ isOpen, onClose, savedEvents = [], onRemove, onSelect }) => {
    useEscapeKey(isOpen, onClose);
    const focusTrapRef = useFocusTrap(isOpen);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Saved events"
                    ref={focusTrapRef}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 top-20 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 rounded-full bg-secondary/20" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 border-b border-secondary/10 flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-primary">
                                Saved<span className="text-accent">.</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-secondary" />
                            </button>
                        </div>

                        {/* Saved Events List */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {savedEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {savedEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            layout
                                            onClick={() => onSelect(event)}
                                            className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10 cursor-pointer hover:border-primary/30 transition-all"
                                        >
                                            <div className="flex gap-4">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-20 h-20 rounded-xl object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm truncate text-secondary">{event.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-secondary/60 mt-1">
                                                        <Calendar size={12} />
                                                        {event.date} • {event.time}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-secondary/60 mt-0.5">
                                                        <MapPin size={12} />
                                                        <span className="truncate">{event.location}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-xs font-bold text-primary">
                                                            {event.price === 0 ? 'Free' : `£${event.price}`}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRemove(event.id);
                                                            }}
                                                            className="text-xs font-bold text-secondary/50 hover:text-red-500 flex items-center gap-1 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Heart size={48} className="mx-auto mb-4 text-secondary/30" />
                                    <p className="font-bold text-secondary/60">No saved events</p>
                                    <p className="text-sm text-secondary/40 mt-1">Tap the heart on events to save them</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SavedEventsSheet;

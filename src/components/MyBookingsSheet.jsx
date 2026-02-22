import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, Ticket, Trash2 } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const MyBookingsSheet = ({ isOpen, onClose, bookings = [], onCancel }) => {
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
                    aria-label="My bookings"
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
                                My Bookings<span className="text-accent">.</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-secondary" />
                            </button>
                        </div>

                        {/* Bookings List */}
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            layout
                                            className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10"
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
                                                        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Ticket size={10} />
                                                            Confirmed
                                                        </span>
                                                        <button
                                                            onClick={() => onCancel(event.id)}
                                                            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                                                        >
                                                            <Trash2 size={12} />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Calendar size={48} className="mx-auto mb-4 text-secondary/30" />
                                    <p className="font-bold text-secondary/60">No bookings yet</p>
                                    <p className="text-sm text-secondary/40 mt-1">Events you join will appear here</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MyBookingsSheet;

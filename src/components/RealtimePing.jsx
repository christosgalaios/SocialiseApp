import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RealtimePing - Toast-like notification for real-time activity
 * "Sarah just joined!" with avatar slide-in effect
 */
const RealtimePing = ({
    isVisible = false,
    name = "Someone",
    avatar = null,
    action = "just joined!",
    onClose = () => { }
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none md:left-auto md:right-8 md:max-w-xs"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className="glass-2 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl border border-primary/20 pointer-events-auto">
                        {/* Animated pulse ring */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 rounded-full bg-primary/30"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            {avatar ? (
                                <img
                                    src={avatar}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white relative z-10"
                                    alt={name}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm relative z-10">
                                    {name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="font-bold text-secondary text-sm">{name}</span>
                            <span className="text-secondary/60 text-sm">{action}</span>
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-1 ml-1">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-green-500"
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RealtimePing;

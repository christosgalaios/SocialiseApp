import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronDown, Mail, Shield, FileText, MessageCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import { playSwooshClose, playClick, hapticTap } from '../utils/feedback';

const HelpSheet = ({ isOpen, onClose, onDeleteAccount }) => {
    useEscapeKey(isOpen, onClose);
    const focusTrapRef = useFocusTrap(isOpen);
    const { sheetY, handleProps } = useSwipeToClose(onClose);
    const [openFaq, setOpenFaq] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const faqs = [
        { q: 'How do I join an event?', a: 'Browse events in the Explore tab and tap "Join" on any event that interests you. You\'ll receive confirmation and can view details in My Bookings.' },
        { q: 'What are Micro Meets?', a: 'Micro Meets are AI-curated small group gatherings (2-6 people) matched based on your interests and preferences for more intimate connections.' },
        { q: 'How do Tribes work?', a: 'Tribes are communities of like-minded people. Join tribes from the Hub to see their events and connect with members.' },
        { q: 'Can I create my own events?', a: 'Yes! Tap the + button to create events. You can set the date, location, capacity, and invite members from your tribes.' },
        { q: 'How do I cancel a booking?', a: 'Go to Profile → My Bookings and tap "Cancel" on the event. Refunds are processed within 3-5 business days.' },
    ];

    const links = [
        { icon: Mail, label: 'Contact Support', desc: 'Get help from our team' },
        { icon: Shield, label: 'Privacy Policy', desc: 'How we protect your data' },
        { icon: FileText, label: 'Terms of Service', desc: 'Our usage agreement' },
        { icon: Trash2, label: 'Delete Account', desc: 'Permanently delete all your data', destructive: true },
    ];

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await onDeleteAccount();
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

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
                    aria-label="Help and support"
                    ref={focusTrapRef}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-x-0 bottom-0 top-20 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        style={{ y: sheetY }}
                    >
                        {/* Handle */}
                        <div {...handleProps} className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 rounded-full bg-secondary/20" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 border-b border-secondary/10 flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-primary">
                                Help & Support<span className="text-accent">.</span>
                            </h2>
                            <button
                                onClick={() => { playSwooshClose(); hapticTap(); onClose(); }}
                                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-secondary" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {/* FAQ Section */}
                            <div className="mb-8">
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HelpCircle size={14} />
                                    Frequently Asked<span className="text-accent">.</span>
                                </h3>
                                <div className="space-y-2">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="bg-secondary/5 rounded-2xl border border-secondary/10 overflow-hidden">
                                            <button
                                                onClick={() => { playClick(); setOpenFaq(openFaq === i ? null : i); }}
                                                className="w-full p-4 flex items-center justify-between text-left"
                                            >
                                                <span className="font-bold text-sm text-secondary">{faq.q}</span>
                                                <motion.div
                                                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown size={18} className="text-secondary/50" />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence>
                                                {openFaq === i && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="px-4 pb-4 text-sm text-secondary/70 leading-relaxed">
                                                            {faq.a}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Links Section */}
                            <div>
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MessageCircle size={14} />
                                    More Options<span className="text-accent">.</span>
                                </h3>
                                <div className="space-y-2">
                                    {links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={link.destructive ? () => setShowDeleteConfirm(true) : undefined}
                                            className={`w-full rounded-2xl p-4 border flex items-center gap-4 transition-all text-left ${
                                                link.destructive
                                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                                    : 'bg-secondary/5 border-secondary/10 hover:border-primary/30'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                link.destructive ? 'bg-red-500/10' : 'bg-primary/10'
                                            }`}>
                                                <link.icon size={20} className={link.destructive ? 'text-red-500' : 'text-primary'} />
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${link.destructive ? 'text-red-500' : 'text-secondary'}`}>{link.label}</p>
                                                <p className={`text-xs ${link.destructive ? 'text-red-500/60' : 'text-secondary/60'}`}>{link.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delete Account Confirmation Modal */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
                                onClick={() => !deleting && setShowDeleteConfirm(false)}
                                role="alertdialog"
                                aria-modal="true"
                                aria-label="Delete account confirmation"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="bg-paper rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-secondary/10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle size={32} className="text-red-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-secondary text-center mb-2">Delete Account?</h3>
                                    <p className="text-sm text-secondary/60 text-center mb-8 leading-relaxed">
                                        This will permanently delete your account and all your data including events, bookings, community memberships, and posts. This action cannot be undone.
                                    </p>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            className="w-full py-4 rounded-2xl bg-red-500 text-white text-[12px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {deleting ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={16} />
                                                    Delete Everything
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleting}
                                            className="w-full py-4 rounded-2xl bg-secondary/10 text-secondary text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HelpSheet;

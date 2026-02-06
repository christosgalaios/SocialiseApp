import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronDown, Mail, Shield, FileText, MessageCircle } from 'lucide-react';

const HelpSheet = ({ isOpen, onClose }) => {
    const [openFaq, setOpenFaq] = useState(null);

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
    ];

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
                                Help & Support<span className="text-accent">.</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
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
                                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
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
                                            className="w-full bg-secondary/5 rounded-2xl p-4 border border-secondary/10 flex items-center gap-4 hover:border-primary/30 transition-all text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <link.icon size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-secondary">{link.label}</p>
                                                <p className="text-xs text-secondary/60">{link.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HelpSheet;

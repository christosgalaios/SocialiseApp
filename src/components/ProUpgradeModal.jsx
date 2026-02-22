import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Zap, Users, BarChart3, Wand2, Shield } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const ProUpgradeModal = ({ isOpen, onClose, onUpgrade }) => {
    useEscapeKey(isOpen, onClose);
    const focusTrapRef = useFocusTrap(isOpen);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onUpgrade();
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    const features = [
        { icon: Wand2, label: 'AI-Powered Matching', desc: 'Get matched with like-minded people' },
        { icon: BarChart3, label: 'Event Analytics', desc: 'See who views your events' },
        { icon: Users, label: 'Unlimited Tribes', desc: 'Join as many communities as you want' },
        { icon: Shield, label: 'Priority Support', desc: '24/7 dedicated assistance' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Upgrade to Pro"
                    ref={focusTrapRef}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-paper rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-primary/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-br from-primary to-accent p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30"
                            >
                                <Crown size={40} className="text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Go Pro</h2>
                            <p className="text-white/80 text-sm mt-1">Unlock the full Socialise experience</p>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <feature.icon size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-secondary">{feature.label}</p>
                                            <p className="text-xs text-secondary/60">{feature.desc}</p>
                                        </div>
                                        <Check size={18} className="text-accent ml-auto" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pricing */}
                            <div className="bg-secondary/5 rounded-2xl p-4 text-center mb-6 border border-secondary/10">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-black text-secondary">£12.99</span>
                                    <span className="text-secondary/60 text-sm">/month</span>
                                </div>
                                <p className="text-xs text-secondary/50 mt-1">Cancel anytime</p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleUpgrade}
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-primary to-accent py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        Upgrade Now
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-secondary/40 mt-4">
                                By upgrading, you agree to our Terms of Service
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProUpgradeModal;

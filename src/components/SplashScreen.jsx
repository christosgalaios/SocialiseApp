import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
    // Narrative Phases:
    // 'host' - S (the host) fades in alone, looking around
    // 'members' - "ocialise" letters arrive but spaced out, distant
    // 'huddle' - S pulls everyone close, letters squeeze together
    // 'latecomer' - The dot appears awkwardly from far right
    // 'welcome' - Group opens up slightly, dot slides in gently
    // 'together' - Full "Socialise." with brand colors, warm and unified
    const [phase, setPhase] = useState('host');

    useEffect(() => {
        // Phase 1: Host (S appears alone)
        // Already starting in 'host' phase

        // Phase 2: Members arrive (distant letters)
        setTimeout(() => setPhase('members'), 1200);

        // Phase 3: Huddle (letters come close)
        setTimeout(() => setPhase('huddle'), 2800);

        // Phase 4: Latecomer (dot appears awkwardly)
        setTimeout(() => setPhase('latecomer'), 4200);

        // Phase 5: Welcome (group makes room)
        setTimeout(() => setPhase('welcome'), 5000);

        // Phase 6: Together (brand colors, unified)
        setTimeout(() => setPhase('together'), 6200);

        // Final handoff
        setTimeout(onFinish, 8000);
    }, [onFinish]);

    const showMembers = ['members', 'huddle', 'latecomer', 'welcome', 'together'].includes(phase);
    const showDot = ['latecomer', 'welcome', 'together'].includes(phase);
    const isHuddled = ['huddle', 'latecomer', 'welcome', 'together'].includes(phase);
    const isWelcoming = ['welcome', 'together'].includes(phase);
    const isTogether = phase === 'together';

    // Letter spacing based on phase
    const getLetterSpacing = () => {
        if (phase === 'members') return 12; // Distant
        if (phase === 'huddle' || phase === 'latecomer') return -2; // Tight huddle
        if (isWelcoming) return 0; // Normal, making room
        return 0;
    };

    // S margin to the right
    const getSMargin = () => {
        if (phase === 'host') return 0;
        if (phase === 'members') return 8; // Some distance
        if (isHuddled) return -1; // Close
        return 0;
    };

    return (
        <motion.div
            initial={{ opacity: 0, backgroundColor: "var(--bg-paper)" }}
            animate={{ opacity: 1, backgroundColor: "var(--bg-paper)" }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Warm glow in final phase */}
            <AnimatePresence>
                {isTogether && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary),transparent_60%)]"
                    />
                )}
            </AnimatePresence>

            {/* Main word container */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="flex items-baseline relative"
            >
                {/* The Host: S */}
                <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: phase === 'host' ? [1, 1.05, 1] : 1,
                        marginRight: getSMargin(),
                        color: isTogether ? 'var(--primary)' : 'var(--text)'
                    }}
                    transition={{
                        opacity: { duration: 0.8 },
                        scale: { duration: 0.6, repeat: phase === 'host' ? 2 : 0 },
                        marginRight: { type: "spring", stiffness: 120, damping: 12 },
                        color: { duration: 1.2 }
                    }}
                    className="text-7xl md:text-9xl font-black inline-block tracking-tighter"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                    S
                </motion.span>

                {/* The Members: ocialise */}
                <AnimatePresence>
                    {showMembers && (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-baseline"
                        >
                            {[..."ocialise"].map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{
                                        opacity: 0,
                                        x: 60 + i * 10, // Arrive from far right, staggered
                                        y: (i % 2 === 0 ? -15 : 15), // Scattered vertically
                                        rotate: (i % 2 === 0 ? 8 : -8)
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        y: 0,
                                        rotate: 0,
                                        marginRight: getLetterSpacing()
                                    }}
                                    transition={{
                                        delay: i * 0.08,
                                        type: "spring",
                                        stiffness: phase === 'members' ? 80 : 150,
                                        damping: phase === 'members' ? 10 : 14
                                    }}
                                    className="text-6xl md:text-8xl font-bold inline-block lowercase tracking-tighter"
                                    style={{
                                        fontFamily: "'Quicksand', sans-serif",
                                        color: 'var(--text)'
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* The Latecomer: . (dot) */}
                <AnimatePresence>
                    {showDot && (
                        <motion.span
                            initial={{
                                opacity: 0,
                                x: 100, // Way off to the right
                                y: 20, // Slightly below
                                scale: 0.5
                            }}
                            animate={{
                                opacity: 1,
                                x: isWelcoming ? 4 : 30, // Stays distant until welcomed
                                y: phase === 'latecomer' ? [20, -10, 15, -5, 0] : 0, // Nervous wobble
                                scale: phase === 'latecomer' ? [0.5, 0.7, 0.6, 0.8, 1] : 1,
                                marginLeft: isWelcoming ? 2 : 8,
                                color: isTogether ? 'var(--accent)' : 'var(--text)'
                            }}
                            transition={{
                                x: { type: "spring", stiffness: 60, damping: 8 },
                                y: { duration: 0.8 },
                                scale: { duration: 0.8 },
                                color: { duration: 1.2 }
                            }}
                            className="text-6xl md:text-8xl font-black inline-block leading-none"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                            .
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Tagline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: isTogether ? 0.6 : 0,
                    y: isTogether ? 0 : 20
                }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-20 text-sm font-bold tracking-[0.2em] text-text/60"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
                Space for everyone.
            </motion.p>
        </motion.div>
    );
};

export default SplashScreen;

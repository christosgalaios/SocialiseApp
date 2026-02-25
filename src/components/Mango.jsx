import { useState, useRef, useCallback, useEffect } from 'react';
import { useMango } from '../contexts/MangoContext';
import { motion, useMotionValue, useTransform, AnimatePresence, useVelocity, useDragControls } from 'framer-motion';

/**
 * MangoSVG - A playful orange tabby kitten with interactive poses
 * Features: pointed ears, almond eyes, white chest, slender cat body
 */
const MangoSVG = ({ pose = 'wave', size = 80, isDragging = false }) => {
    // Brand colors
    const orange = '#E2725B';           // Primary terracotta
    const orangeDark = '#C75B47';       // Darker stripes
    const white = '#FFFFFF';            // Chest, paws
    const cream = '#FFF8F0';            // Muzzle
    const teal = '#2D5F5D';             // Eyes
    const pink = '#FFB5A7';             // Nose, inner ears
    const gold = '#F4B942';             // Accent

    const renderPose = () => {
        switch (pose) {
            case 'wave':
                return (
                    <g>
                        {/* Tail FIRST - renders behind everything */}
                        <motion.path
                            d="M54 58 Q68 50 64 36"
                            stroke={orange}
                            strokeWidth="7"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ["M54 58 Q68 50 64 36", "M54 58 Q72 52 66 38", "M54 58 Q68 50 64 36"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* Slender cat body */}
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        {/* White chest patch */}
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        {/* Cat head - slightly oval, not round */}
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />

                        {/* POINTED triangular ears - like real cat */}
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        {/* Inner ear pink */}
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />

                        {/* Tabby stripes on forehead */}
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        {/* White muzzle area */}
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />

                        {/* Almond-shaped cat eyes */}
                        <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                        {/* Vertical cat pupils */}
                        <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        {/* Eye shine */}
                        <circle cx="33" cy="29" r="1" fill={white} />
                        <circle cx="49" cy="29" r="1" fill={white} />

                        {/* Small pink nose */}
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />

                        {/* Cat mouth - small 'Y' shape */}
                        <path d="M40 40 L40 43" stroke={orangeDark} strokeWidth="1" />
                        <path d="M36 45 Q40 43 44 45" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                        {/* Long whiskers */}
                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="14" y1="34" x2="28" y2="36" />
                            <line x1="14" y1="38" x2="28" y2="38" />
                            <line x1="16" y1="42" x2="28" y2="40" />
                            <line x1="52" y1="36" x2="66" y2="34" />
                            <line x1="52" y1="38" x2="66" y2="38" />
                            <line x1="52" y1="40" x2="64" y2="42" />
                        </g>

                        {/* Waving paw - white tip */}
                        <motion.g
                            animate={{ rotate: [0, 20, 0, 20, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
                            style={{ transformOrigin: '56px 50px' }}
                        >
                            <ellipse cx="62" cy="46" rx="6" ry="5" fill={orange} />
                            <ellipse cx="64" cy="48" rx="3" ry="3" fill={white} />
                        </motion.g>

                        {/* Front paw - white tip */}
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                    </g>
                );

            // PLAYFUL pose - jumping/spinning after tap
            case 'playful':
                return (
                    <motion.g
                        animate={{
                            rotate: [0, -10, 10, -5, 0],
                            y: [0, -8, 0, -4, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Tail wagging fast */}
                        <motion.path
                            d="M54 58 Q68 50 64 36"
                            stroke={orange}
                            strokeWidth="7"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ["M54 58 Q68 50 64 36", "M54 58 Q75 55 70 40", "M54 58 Q65 48 62 34", "M54 58 Q68 50 64 36"] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        />

                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />

                        {/* Perky ears */}
                        <path d="M18 26 L24 4 L32 24 Z" fill={orange} />
                        <path d="M48 24 L56 4 L62 26 Z" fill={orange} />
                        <path d="M21 24 L24 10 L29 23 Z" fill={pink} />
                        <path d="M51 23 L56 10 L59 24 Z" fill={pink} />

                        <path d="M32 18 L34 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 16 L40 22" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 18 L46 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />

                        {/* Excited wide eyes */}
                        <ellipse cx="32" cy="28" rx="6" ry="5" fill={teal} />
                        <ellipse cx="48" cy="28" rx="6" ry="5" fill={teal} />
                        <ellipse cx="32" cy="28" rx="2" ry="4" fill="#1a3a38" />
                        <ellipse cx="48" cy="28" rx="2" ry="4" fill="#1a3a38" />
                        <circle cx="34" cy="26" r="1.5" fill={white} />
                        <circle cx="50" cy="26" r="1.5" fill={white} />

                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />

                        {/* Happy open mouth */}
                        <path d="M35 42 Q40 48 45 42" stroke={orangeDark} strokeWidth="1.5" fill={pink} strokeLinecap="round" />

                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="14" y1="36" x2="28" y2="38" />
                            <line x1="52" y1="38" x2="66" y2="36" />
                        </g>

                        {/* Both paws up */}
                        <motion.ellipse cx="22" cy="44" rx="5" ry="4" fill={orange} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.15, repeat: Infinity }} />
                        <motion.ellipse cx="58" cy="44" rx="5" ry="4" fill={orange} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.15, repeat: Infinity, delay: 0.08 }} />

                        {/* Sparkles */}
                        <motion.text x="8" y="16" fontSize="10" fill={gold} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 0.5, repeat: Infinity }}>✨</motion.text>
                        <motion.text x="64" y="12" fontSize="8" fill={gold} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}>⭐</motion.text>
                    </motion.g>
                );

            // PURR pose - eyes closed, rubbing side to side
            case 'purr':
                return (
                    <motion.g
                        animate={{ x: [-3, 3, -3] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Tail curled contentedly */}
                        <path d="M54 58 Q68 52 66 42 Q64 50 58 54" stroke={orange} strokeWidth="7" strokeLinecap="round" fill="none" />

                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />

                        {/* Relaxed ears */}
                        <path d="M20 28 L26 10 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 10 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 14 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 14 L57 26 Z" fill={pink} />

                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />

                        {/* Happy closed eyes - content arcs */}
                        <path d="M27 30 Q32 26 37 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M43 30 Q48 26 53 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />

                        {/* Happy blush */}
                        <ellipse cx="24" cy="36" rx="4" ry="2" fill={pink} opacity="0.6" />
                        <ellipse cx="56" cy="36" rx="4" ry="2" fill={pink} opacity="0.6" />

                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />

                        {/* Content smile */}
                        <path d="M35 42 Q40 46 45 42" stroke={orangeDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="16" y1="36" x2="28" y2="38" />
                            <line x1="52" y1="38" x2="64" y2="36" />
                        </g>

                        {/* Paws tucked in */}
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="48" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="48" cy="70" rx="3" ry="3" fill={white} />

                        {/* Purr effect - vibration lines */}
                        <motion.g
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        >
                            <path d="M12 56 Q8 60 12 64" stroke={orange} strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M68 56 Q72 60 68 64" stroke={orange} strokeWidth="1" fill="none" opacity="0.5" />
                        </motion.g>

                        {/* Hearts */}
                        <motion.text
                            x="4" y="20"
                            fontSize="10"
                            fill="#FF6B8A"
                            animate={{ y: [20, 14], opacity: [0, 1, 0], scale: [0.5, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            ♡
                        </motion.text>
                        <motion.text
                            x="68" y="24"
                            fontSize="8"
                            fill="#FF6B8A"
                            animate={{ y: [24, 18], opacity: [0, 1, 0], scale: [0.5, 1, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        >
                            ♡
                        </motion.text>
                    </motion.g>
                );

            // CARRIED pose - held by scruff like mama cat carries kitten
            case 'carried':
                return (
                    <g transform="translate(0, 25)">
                        {/* Limp dangling tail */}
                        <path d="M45 50 Q52 60 48 72" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />

                        {/* Limp body hanging down */}
                        <ellipse cx="40" cy="52" rx="14" ry="10" fill={orange} />
                        <ellipse cx="40" cy="54" rx="7" ry="6" fill={white} />

                        {/* Head tilted back (scruff being held) */}
                        <ellipse cx="40" cy="26" rx="16" ry="14" fill={orange} />

                        {/* Scruff pinch point at top - adjusted to be near center (40,40) with translation */}
                        <ellipse cx="40" cy="12" rx="6" ry="4" fill={orangeDark} />

                        {/* Ears flopping */}
                        <path d="M22 22 L26 10 L32 24 Z" fill={orange} transform="rotate(-10 27 17)" />
                        <path d="M48 24 L54 10 L58 22 Z" fill={orange} transform="rotate(10 53 17)" />
                        <path d="M24 22 L26 14 L30 23 Z" fill={pink} transform="rotate(-10 27 17)" />
                        <path d="M50 23 L54 14 L56 22 Z" fill={pink} transform="rotate(10 53 17)" />

                        <ellipse cx="40" cy="32" rx="9" ry="6" fill={cream} />

                        {/* Squinty accepting eyes */}
                        <path d="M30 26 Q34 24 38 26" stroke={teal} strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M42 26 Q46 24 50 26" stroke={teal} strokeWidth="2" fill="none" strokeLinecap="round" />

                        <ellipse cx="40" cy="32" rx="2" ry="1.5" fill={pink} />

                        {/* Relaxed mouth */}
                        <path d="M37 35 Q40 37 43 35" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                        {/* Whiskers */}
                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="22" y1="30" x2="32" y2="32" />
                            <line x1="48" y1="32" x2="58" y2="30" />
                        </g>

                        {/* Dangling paws */}
                        <motion.g animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                            <ellipse cx="32" cy="62" rx="4" ry="5" fill={orange} />
                            <ellipse cx="32" cy="64" rx="2.5" ry="2.5" fill={white} />
                        </motion.g>
                        <motion.g animate={{ rotate: [0, -5, 0, 5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>
                            <ellipse cx="48" cy="62" rx="4" ry="5" fill={orange} />
                            <ellipse cx="48" cy="64" rx="2.5" ry="2.5" fill={white} />
                        </motion.g>
                    </g>
                );

            case 'celebrate':
                return (
                    <g>
                        <motion.g
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.35, repeat: Infinity }}
                        >
                            <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                            <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                            <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />

                            <path d="M18 26 L24 4 L32 24 Z" fill={orange} />
                            <path d="M48 24 L56 4 L62 26 Z" fill={orange} />
                            <path d="M21 24 L24 10 L29 23 Z" fill={pink} />
                            <path d="M51 23 L56 10 L59 24 Z" fill={pink} />

                            <path d="M32 18 L34 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                            <path d="M40 16 L40 22" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M48 18 L46 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                            <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />

                            <path d="M27 30 Q32 26 37 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <path d="M43 30 Q48 26 53 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />

                            <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />

                            <path d="M35 42 Q40 48 45 42" stroke={orangeDark} strokeWidth="1.5" fill={pink} strokeLinecap="round" />

                            <g stroke={white} strokeWidth="0.8" opacity="0.9">
                                <line x1="14" y1="36" x2="28" y2="38" />
                                <line x1="52" y1="38" x2="66" y2="36" />
                            </g>

                            <motion.g animate={{ rotate: [-15, 15, -15] }} transition={{ duration: 0.25, repeat: Infinity }}>
                                <ellipse cx="22" cy="44" rx="5" ry="4" fill={orange} />
                                <ellipse cx="20" cy="45" rx="2.5" ry="2.5" fill={white} />
                            </motion.g>
                            <motion.g animate={{ rotate: [15, -15, 15] }} transition={{ duration: 0.25, repeat: Infinity }}>
                                <ellipse cx="58" cy="44" rx="5" ry="4" fill={orange} />
                                <ellipse cx="60" cy="45" rx="2.5" ry="2.5" fill={white} />
                            </motion.g>
                        </motion.g>

                        <motion.g
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            <text x="6" y="18" fontSize="10" fill={gold}>✨</text>
                            <text x="66" y="12" fontSize="8" fill={gold}>⭐</text>
                        </motion.g>
                    </g>
                );

            case 'curious':
                return (
                    <g>
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        <motion.g
                            animate={{ rotate: [0, 15, 0, -8, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            style={{ transformOrigin: '40px 32px' }}
                        >
                            <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />

                            <path d="M18 26 L24 4 L32 24 Z" fill={orange} />
                            <path d="M48 26 L54 10 L60 28 Z" fill={orange} />
                            <path d="M21 24 L24 10 L29 23 Z" fill={pink} />
                            <path d="M51 25 L54 14 L57 27 Z" fill={pink} />

                            <path d="M32 18 L34 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                            <path d="M40 16 L40 22" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M48 18 L46 24" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                            <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />

                            <ellipse cx="32" cy="30" rx="6" ry="5" fill={teal} />
                            <ellipse cx="48" cy="30" rx="6" ry="5" fill={teal} />
                            <ellipse cx="32" cy="30" rx="2" ry="4" fill="#1a3a38" />
                            <ellipse cx="48" cy="30" rx="2" ry="4" fill="#1a3a38" />
                            <circle cx="33" cy="28" r="1.5" fill={white} />
                            <circle cx="49" cy="28" r="1.5" fill={white} />

                            <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />

                            <ellipse cx="40" cy="44" rx="2" ry="2" fill={orangeDark} />

                            <g stroke={white} strokeWidth="0.8" opacity="0.9">
                                <line x1="16" y1="36" x2="28" y2="38" />
                                <line x1="52" y1="38" x2="64" y2="36" />
                            </g>
                        </motion.g>

                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="48" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="48" cy="70" rx="3" ry="3" fill={white} />

                        <motion.text
                            x="64" y="18"
                            fontSize="12"
                            fontWeight="bold"
                            fill={gold}
                            animate={{ y: [18, 14, 18] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            ?
                        </motion.text>
                    </g>
                );

            case 'lonely':
                return (
                    <g>
                        <path d="M54 60 Q60 66 56 74" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />

                        <ellipse cx="40" cy="62" rx="14" ry="10" fill={orange} />
                        <ellipse cx="40" cy="63" rx="7" ry="6" fill={white} />

                        <ellipse cx="40" cy="36" rx="17" ry="15" fill={orange} />

                        <path d="M16 32 L22 16 L32 30 Z" fill={orange} transform="rotate(-15 24 24)" />
                        <path d="M48 30 L58 16 L64 32 Z" fill={orange} transform="rotate(15 56 24)" />
                        <path d="M19 30 L22 20 L28 29 Z" fill={pink} transform="rotate(-15 24 24)" />
                        <path d="M52 29 L58 20 L61 30 Z" fill={pink} transform="rotate(15 56 24)" />

                        <ellipse cx="40" cy="44" rx="9" ry="6" fill={cream} />

                        <ellipse cx="32" cy="34" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="34" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="34" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="34" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="33" r="1" fill={white} />
                        <circle cx="49" cy="33" r="1" fill={white} />

                        <path d="M24 28 L34 32" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M46 32 L56 28" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        <ellipse cx="40" cy="44" rx="2" ry="1.5" fill={pink} />

                        <path d="M35 50 Q40 47 45 50" stroke={orangeDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

                        <g stroke={white} strokeWidth="0.8" opacity="0.7">
                            <line x1="18" y1="42" x2="28" y2="44" />
                            <line x1="52" y1="44" x2="62" y2="42" />
                        </g>

                        <ellipse cx="34" cy="70" rx="4" ry="5" fill={orange} />
                        <ellipse cx="46" cy="70" rx="4" ry="5" fill={orange} />
                    </g>
                );

            case 'sleep':
                return (
                    <g>
                        <path d="M58 54 Q70 44 66 30" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <path d="M66 30 Q62 36 56 40" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />

                        <ellipse cx="40" cy="54" rx="24" ry="16" fill={orange} />
                        <ellipse cx="40" cy="56" rx="14" ry="9" fill={white} />

                        <ellipse cx="28" cy="42" rx="14" ry="12" fill={orange} />
                        <ellipse cx="28" cy="48" rx="8" ry="5" fill={cream} />

                        <path d="M12 38 L16 28 L24 38 Z" fill={orange} />
                        <path d="M34 36 L40 26 L46 38 Z" fill={orange} />
                        <path d="M14 37 L16 30 L21 37 Z" fill={pink} />
                        <path d="M36 36 L40 29 L43 37 Z" fill={pink} />

                        <path d="M20 42 Q24 40 28 42" stroke={teal} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <path d="M30 40 Q34 38 38 40" stroke={teal} strokeWidth="1.5" fill="none" strokeLinecap="round" />

                        <ellipse cx="26" cy="48" rx="2" ry="1.5" fill={pink} />

                        <path d="M22 52 Q26 54 30 52" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                        <motion.text
                            x="46" y="24"
                            fill={teal}
                            fontSize="12"
                            fontWeight="bold"
                            animate={{ opacity: [0, 1, 0], y: [24, 18] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            z
                        </motion.text>
                        <motion.text
                            x="54" y="14"
                            fill={teal}
                            fontSize="10"
                            fontWeight="bold"
                            animate={{ opacity: [0, 1, 0], y: [14, 8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            z
                        </motion.text>
                    </g>
                );

            // CLEAN pose - licking paw
            case 'clean':
                return (
                    <g>
                        <ellipse cx="40" cy="58" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        {/* Head bowed down */}
                        <ellipse cx="40" cy="42" rx="18" ry="16" fill={orange} />

                        <path d="M22 36 L26 18 L34 34 Z" fill={orange} />
                        <path d="M48 34 L54 18 L60 36 Z" fill={orange} />
                        <path d="M25 34 L26 22 L31 33 Z" fill={pink} />
                        <path d="M49 33 L54 22 L57 34 Z" fill={pink} />

                        <path d="M32 30 L34 36" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 28 L40 34" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 30 L46 36" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        <ellipse cx="40" cy="48" rx="10" ry="7" fill={cream} />

                        {/* Closed cleaning eyes */}
                        <path d="M27 40 Q32 36 37 40" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M43 40 Q48 36 53 40" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />

                        {/* Paw being licked */}
                        <motion.g
                            animate={{
                                y: [0, -2, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            <ellipse cx="40" cy="54" rx="5" ry="4" fill={white} />
                            {/* Pink tongue licking */}
                            <path d="M40 50 Q43 54 40 58" stroke={pink} strokeWidth="3" fill="none" strokeLinecap="round" />
                        </motion.g>

                        {/* Tail curled */}
                        <path d="M54 58 Q68 50 64 36" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                    </g>
                );

            // PLAYING pose - Upside down with ball
            case 'playing':
                return (
                    <g>
                        {/* Upside down transformation group */}
                        <motion.g
                            animate={{ rotate: 180, y: -20 }} // Moved UP (-y) to avoid bottom bar clipping
                            style={{ originX: "40px", originY: "40px" }}
                        >
                            {/* Body curled */}
                            <ellipse cx="40" cy="50" rx="22" ry="18" fill={orange} />
                            <ellipse cx="40" cy="52" rx="12" ry="10" fill={white} />

                            {/* Paws batting */}
                            <motion.g animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }} transition={{ duration: 0.3, repeat: Infinity }}>
                                <ellipse cx="28" cy="30" rx="6" ry="5" fill={white} />
                                <ellipse cx="52" cy="30" rx="6" ry="5" fill={white} />
                            </motion.g>

                            {/* Head upside down */}
                            <ellipse cx="40" cy="68" rx="18" ry="16" fill={orange} />

                            {/* Ears */}
                            <path d="M22 62 L26 44 L34 60 Z" fill={orange} />
                            <path d="M48 60 L54 44 L60 62 Z" fill={orange} />

                            {/* Eyes - Wide and excited */}
                            <ellipse cx="34" cy="72" rx="4" ry="6" fill={white} />
                            <ellipse cx="46" cy="72" rx="4" ry="6" fill={white} />
                            <circle cx="34" cy="72" r="2" fill="#1a3a38" />
                            <circle cx="46" cy="72" r="2" fill="#1a3a38" />

                            {/* Nose & Mouth */}
                            <ellipse cx="40" cy="78" rx="2" ry="1.5" fill={pink} />
                            <path d="M38 80 Q40 82 42 80" stroke={orangeDark} strokeWidth="2" fill="none" strokeLinecap="round" />

                            {/* Tail wiggling */}
                            <motion.path
                                d="M40 32 Q30 20 20 30"
                                stroke={orange}
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                                animate={{ d: ["M40 32 Q30 20 20 30", "M40 32 Q50 20 60 30", "M40 32 Q30 20 20 30"] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            />
                        </motion.g>

                        {/* The Ball - Floating and bouncing */}
                        <motion.circle
                            cx="40"
                            cy="10" // Moved ball UP
                            r="8"
                            fill="#F4B942" // Brand Yellow
                            animate={{ y: [-15, -5, -15] }} // Bouncing high
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="37"
                            cy="7"
                            r="2"
                            fill="rgba(255,255,255,0.6)"
                            animate={{ y: [-15, -5, -15] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </g>
                );

            case 'peek':
                return (
                    <g>
                        <motion.g
                            initial={{ y: 28 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 180, damping: 12 }}
                        >
                            <ellipse cx="40" cy="56" rx="17" ry="14" fill={orange} />
                            <ellipse cx="40" cy="62" rx="9" ry="6" fill={cream} />

                            <path d="M22 46 L28 28 L36 44 Z" fill={orange} />
                            <path d="M44 44 L52 28 L58 46 Z" fill={orange} />
                            <path d="M25 44 L28 32 L33 43 Z" fill={pink} />
                            <path d="M47 43 L52 32 L55 44 Z" fill={pink} />

                            <ellipse cx="34" cy="54" rx="5" ry="4" fill={teal} />
                            <ellipse cx="46" cy="54" rx="5" ry="4" fill={teal} />
                            <ellipse cx="34" cy="53" rx="1.5" ry="3" fill="#1a3a38" />
                            <ellipse cx="46" cy="53" rx="1.5" ry="3" fill="#1a3a38" />
                            <circle cx="35" cy="52" r="1" fill={white} />
                            <circle cx="47" cy="52" r="1" fill={white} />

                            <ellipse cx="40" cy="62" rx="2" ry="1.5" fill={pink} />

                            <g stroke={white} strokeWidth="0.8" opacity="0.9">
                                <line x1="20" y1="58" x2="30" y2="60" />
                                <line x1="50" y1="60" x2="60" y2="58" />
                            </g>

                            <ellipse cx="30" cy="74" rx="6" ry="3" fill={orange} />
                            <ellipse cx="50" cy="74" rx="6" ry="3" fill={orange} />
                            <ellipse cx="28" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="32" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="48" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="52" cy="74" rx="2.5" ry="2" fill={white} />
                        </motion.g>
                    </g>
                );

            default:
                return null;
        }
    };

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            style={{ overflow: 'visible', cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {renderPose()}
        </motion.svg>
    );
};

/**
 * Interactive Mango Component with gesture support and physics
 * - Single tap: playful animation
 * - Tap + hold: purr and rub
 * - Drag: pick up by scruff with velocity-based wiggle
 * - Drop: falls to ground
 * - Persistent: remembers coordinates
 * - Idle: cleans after 10s, sleeps after 30s
 */
const Mango = ({
    pose: initialPose = 'wave',
    // eslint-disable-next-line no-unused-vars
    message = null,
    position = 'bottom-right',
    size = 80,
    interactive = true,
    initialCoords = { x: 0, y: 0 },
    onPositionChange = () => { },
    onPoseChange = () => { } // Notify parent on internal pose change
}) => {
    const { toggleChat } = useMango();
    const [currentPose, setCurrentPose] = useState(initialPose);
    const [isDragging, setIsDragging] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [isFalling, setIsFalling] = useState(false);

    // Timers
    const holdTimerRef = useRef(null);
    const idleTimerRef = useRef(null);
    const fallTimerRef = useRef(null);
    const tapStartTimeRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const containerRef = useRef(null);
    useDragControls();

    // For dragging position - initialize from persisted coords
    const x = useMotionValue(initialCoords.x);
    const y = useMotionValue(initialCoords.y);

    // Track velocity for wiggle effect
    const xVelocity = useVelocity(x);
    const wiggleRotation = useTransform(xVelocity, [-1000, 0, 1000], [-25, 0, 25]);

    // Track window dimensions for drag bounds
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ground level - 100px from bottom (above bottom nav ~80px + some margin)
    const GROUND_LEVEL = windowSize.height - 100 - size;

    const positionClasses = {
        'bottom-right': 'fixed bottom-28 right-4',
        'bottom-left': 'fixed bottom-28 left-4',
        'top-right': 'fixed top-4 right-4',
        'top-left': 'fixed top-4 left-4',
        'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'inline': 'relative',
    };

    // Sync internal pose when prop changes (external control)
    useEffect(() => {
        setCurrentPose(initialPose);
    }, [initialPose]);

    // Update internal pose and notify parent
    const updatePose = useCallback((newPose) => {
        setCurrentPose(newPose);
        onPoseChange(newPose);
    }, [onPoseChange]);

    // Reset idle timer on interaction
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Don't start idle timer if dragging
        if (isDragging) return;

        idleTimerRef.current = setTimeout(() => {
            // After 10s idle -> clean
            updatePose('clean');

            idleTimerRef.current = setTimeout(() => {
                // After 30s total (10+20) -> sleep
                updatePose('sleep');
            }, 20000);
        }, 10000);
    }, [isDragging, updatePose]);

    // Initialize idle timer on mount and pose change
    useEffect(() => {
        resetIdleTimer();
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer, currentPose]);

    // Handle tap start (pointer down)
    const handlePointerDown = useCallback(() => {
        if (!interactive) return;

        resetIdleTimer();
        tapStartTimeRef.current = Date.now();
        hasDraggedRef.current = false;
        setIsFalling(false);

        // Start hold timer - if held for 300ms without drag, enter purr mode
        holdTimerRef.current = setTimeout(() => {
            if (!hasDraggedRef.current) {
                setIsHolding(true);
                setCurrentPose('purr');
            }
        }, 300);
    }, [interactive, resetIdleTimer]);

    // Handle tap end (pointer up)
    const handlePointerUp = useCallback(() => {
        if (!interactive) return;

        // Clear hold timer
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }

        const tapDuration = Date.now() - tapStartTimeRef.current;

        // If was holding (purring), stop
        if (isHolding && !isDragging) {
            setIsHolding(false);
            setCurrentPose(initialPose);
            return;
        }

        // Quick tap = open chat
        if (tapDuration < 300 && !hasDraggedRef.current && !isDragging) {
            toggleChat();
        }
    }, [interactive, isDragging, isHolding, initialPose, toggleChat]);

    // Handle drag start
    const handleDragStart = useCallback(() => {
        if (!interactive) return;

        hasDraggedRef.current = true;
        setIsFalling(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Clear hold timer
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }

        setIsHolding(false);
        setIsDragging(true);
        setCurrentPose('carried');
    }, [interactive]);

    // Handle drag end - drop with gravity + save position
    // eslint-disable-next-line no-unused-vars
    const handleDragEnd = useCallback((_event, _info) => {
        setIsDragging(false);
        resetIdleTimer();

        // Get current position
        const currentY = y.get();
        const currentX = x.get();

        // Notify parent of new position for persistence
        onPositionChange({ x: currentX, y: currentY });

        // Gravity logic
        if (currentY < 0) {
            setIsFalling(true);
            setCurrentPose('playful'); // Excited landing pose

            // Animate Y back to 0 (ground) if needed, but framer motion drag constraints might handle it visually
            // actually we need to explicitly animate if it's "above" ground and we want it to fall
            // Since we use constraints top: -1000, bottom: 0, it won't go below 0. 
            // But if user drops it at -200, it stays there unless we animate it?
            // User said "falls to ground". So we should animate y -> 0 if y < 0.
            // My previous code did: animate={isFalling ? { y: 0 } : undefined} which handles this.
        }

        if (fallTimerRef.current) clearTimeout(fallTimerRef.current);
        fallTimerRef.current = setTimeout(() => {
            fallTimerRef.current = null;
            setIsFalling(false);
            setCurrentPose(initialPose);
            // After fall, update coords again to 0 y if we fell?
            // Yes, if it fell to ground, Y becomes 0.
            if (currentY < 0) {
                onPositionChange({ x: currentX, y: 0 });
            }
        }, 500);
    }, [initialPose, y, x, onPositionChange, resetIdleTimer]);

    // Sync motion values if external initialCoords change (e.g. fresh mount)
    useEffect(() => {
        x.set(initialCoords.x);
        y.set(initialCoords.y);
    }, [initialCoords.x, initialCoords.y, x, y]);

    // Clean up all timers on unmount
    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (fallTimerRef.current) clearTimeout(fallTimerRef.current);
        };
    }, []);

    // Non-interactive mode
    if (!interactive) {
        return (
            <div className={`${positionClasses[position]} z-50`}>
                <MangoSVG pose={initialPose} size={size} />
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className={`${positionClasses[position]} z-50 touch-none select-none`}
            drag
            dragMomentum={false}
            // Constrain: can't go below ground (positive Y from start = going down)
            // Can go up freely (negative Y)
            dragConstraints={{
                top: -(windowSize.height - size),
                bottom: 0,
                left: -(windowSize.width - size),
                right: windowSize.width - size
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x, y }}
            animate={isFalling ? { y: 0 } : undefined}
            transition={isFalling ? {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1.5
            } : undefined}
            whileTap={{ scale: isDragging ? 1.1 : 1 }}
        >
            <motion.div
                style={{
                    rotate: isDragging ? wiggleRotation : 0
                }}
                animate={{
                    scale: isDragging ? 1.1 : isFalling ? 1.2 : 1
                }}
                transition={{
                    scale: { duration: 0.2 }
                }}
            >


                <MangoSVG pose={currentPose} size={size} isDragging={isDragging} />
            </motion.div>
        </motion.div>
    );
};

export default Mango;

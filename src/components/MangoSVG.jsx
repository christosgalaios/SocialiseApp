/* eslint-disable no-unused-vars, react-refresh/only-export-components */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useMango } from '../contexts/MangoContext';
import { motion, useMotionValue, useTransform, AnimatePresence, useVelocity, animate } from 'framer-motion';
/* eslint-enable no-unused-vars */

/**
 * MangoSVG - A playful orange tabby kitten with interactive poses
 * Features: pointed ears, almond eyes, white chest, slender cat body
 */
const MangoSVG = ({ pose = 'wave', size = 80, isDragging = false, wallSide = 'right' }) => {
    // Brand colors
    const orange = '#E2725B';           // Primary terracotta
    // eslint-disable-next-line no-unused-vars
    const orangeLight = '#EFA090';      // Lighter shade
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
                        <motion.path
                            initial={{ d: "M54 58 Q68 50 64 36" }}
                            animate={{ d: ["M54 58 Q68 50 64 36", "M54 58 Q72 52 66 38", "M54 58 Q68 50 64 36"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            stroke={orange}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="29" r="1" fill={white} />
                        <circle cx="49" cy="29" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M40 40 L40 43" stroke={orangeDark} strokeWidth="1" />
                        <path d="M36 45 Q40 43 44 45" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="14" y1="34" x2="28" y2="36" />
                            <line x1="14" y1="38" x2="28" y2="38" />
                            <line x1="16" y1="42" x2="28" y2="40" />
                            <line x1="52" y1="36" x2="66" y2="34" />
                            <line x1="52" y1="38" x2="66" y2="38" />
                            <line x1="52" y1="40" x2="64" y2="42" />
                        </g>
                        <motion.g
                            animate={{ rotate: [0, 18, 0, 18, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
                            style={{ transformOrigin: '56px 50px' }}
                        >
                            <ellipse cx="62" cy="46" rx="6" ry="5" fill={orange} />
                            <ellipse cx="64" cy="48" rx="3" ry="3" fill={white} />
                        </motion.g>
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                    </g>
                );

            // PLAYFUL pose - same build as clean, happy bounce
            case 'playful':
                return (
                    <motion.g
                        animate={{ rotate: [0, -6, 6, -4, 0], y: [0, -6, 0, -3, 0] }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        style={{ transformOrigin: '40px 50px' }}
                    >
                        <motion.path
                            initial={{ d: "M54 58 Q68 50 64 36" }}
                            animate={{ d: ["M54 58 Q68 50 64 36", "M54 58 Q72 52 66 38", "M54 58 Q68 50 64 36"] }}
                            transition={{ duration: 0.4, repeat: Infinity }}
                            stroke={orange}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="29" r="1" fill={white} />
                        <circle cx="49" cy="29" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M35 42 Q40 46 45 42" stroke={orangeDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        <g stroke={white} strokeWidth="0.8" opacity="0.9">
                            <line x1="14" y1="34" x2="28" y2="36" />
                            <line x1="14" y1="38" x2="28" y2="38" />
                            <line x1="52" y1="36" x2="66" y2="34" />
                            <line x1="52" y1="38" x2="66" y2="38" />
                        </g>
                        <motion.g animate={{ y: [0, -4, 0], rotate: [0, 8, 0] }} transition={{ duration: 0.2, repeat: Infinity }} style={{ transformOrigin: '22px 48px' }}>
                            <ellipse cx="22" cy="44" rx="5" ry="4" fill={orange} />
                            <ellipse cx="20" cy="45" rx="2.5" ry="2.5" fill={white} />
                        </motion.g>
                        <motion.g animate={{ y: [0, -4, 0], rotate: [0, -8, 0] }} transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }} style={{ transformOrigin: '58px 48px' }}>
                            <ellipse cx="58" cy="44" rx="5" ry="4" fill={orange} />
                            <ellipse cx="60" cy="45" rx="2.5" ry="2.5" fill={white} />
                        </motion.g>
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                    </motion.g>
                );

            // PURR pose - eyes closed, rubbing side to side
            case 'purr':
                return (
                    <motion.g
                        animate={{ x: [-3, 3, -3] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <path d="M54 58 Q68 52 66 42 Q64 50 58 54" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />

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

                        <motion.g animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 0.4, repeat: Infinity }}>
                            <path d="M12 56 Q8 60 12 64" stroke={orange} strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M68 56 Q72 60 68 64" stroke={orange} strokeWidth="1" fill="none" opacity="0.5" />
                        </motion.g>
                    </motion.g>
                );

            // CARRIED pose - goofy, off-balance, cute dangling kitten
            case 'carried':
                return (
                    <motion.g
                        animate={{ rotate: [0, 4, -3, 5, 0], y: [0, 2, -1, 2, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '40px 20px' }}
                    >
                        {/* Floppy tail swaying */}
                        <motion.path
                            d="M45 50 Q52 60 48 72"
                            stroke={orange}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ['M45 50 Q52 60 48 72', 'M44 50 Q54 58 50 72', 'M46 50 Q50 62 46 72', 'M45 50 Q52 60 48 72'] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <ellipse cx="40" cy="52" rx="16" ry="10" fill={orange} />
                        <ellipse cx="40" cy="54" rx="8" ry="6" fill={white} />
                        <ellipse cx="40" cy="26" rx="18" ry="14" fill={orange} />
                        <ellipse cx="40" cy="12" rx="6" ry="4" fill={orangeDark} />
                        <motion.g animate={{ rotate: [-6, 5, -6] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ transformOrigin: '27 18px' }}>
                            <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                            <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        </motion.g>
                        <motion.g animate={{ rotate: [5, -6, 5] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ transformOrigin: '53 18px' }}>
                            <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                            <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        </motion.g>
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="32" rx="10" ry="6" fill={cream} />
                        <ellipse cx="32" cy="27" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="27" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="27" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="27" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="26" r="1" fill={white} />
                        <circle cx="49" cy="26" r="1" fill={white} />
                        <ellipse cx="40" cy="32" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 35 Q40 37 43 35" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 32 L18 30" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 34 L16 34" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 36 L18 38" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 32 L62 30" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 34 L64 34" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 36 L62 38" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <motion.g animate={{ rotate: [0, 12, -10, 14, 0] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ transformOrigin: '32px 60px' }}>
                            <ellipse cx="32" cy="62" rx="5" ry="5" fill={orange} />
                            <ellipse cx="32" cy="64" rx="3" ry="2.5" fill={white} />
                        </motion.g>
                        <motion.g animate={{ rotate: [0, -12, 10, -14, 0] }} transition={{ duration: 0.95, repeat: Infinity, delay: 0.15 }} style={{ transformOrigin: '48px 60px' }}>
                            <ellipse cx="48" cy="62" rx="5" ry="5" fill={orange} />
                            <ellipse cx="48" cy="64" rx="3" ry="2.5" fill={white} />
                        </motion.g>
                    </motion.g>
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

                            <path d="M35 42 Q40 48 45 42" stroke={orangeDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

                            <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

                            <motion.g animate={{ rotate: [-12, 12, -12] }} transition={{ duration: 0.3, repeat: Infinity }} style={{ transformOrigin: '22px 44px' }}>
                                <ellipse cx="22" cy="44" rx="5" ry="6" fill={orange} />
                                <ellipse cx="22" cy="46" rx="3" ry="3" fill={white} />
                            </motion.g>
                            <motion.g animate={{ rotate: [12, -12, 12] }} transition={{ duration: 0.3, repeat: Infinity }} style={{ transformOrigin: '58px 44px' }}>
                                <ellipse cx="58" cy="44" rx="5" ry="6" fill={orange} />
                                <ellipse cx="58" cy="46" rx="3" ry="3" fill={white} />
                            </motion.g>
                        </motion.g>

                        <motion.g
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            <text x="6" y="18" fontSize="10" fill={gold}>âœ¨</text>
                            <text x="66" y="12" fontSize="8" fill={gold}>â­</text>
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

                            <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                            <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                            <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                            <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                            <circle cx="33" cy="28" r="1" fill={white} />
                            <circle cx="49" cy="28" r="1" fill={white} />

                            <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                            <path d="M37 42 Q40 44 43 42" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                            <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
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

                        <ellipse cx="40" cy="58" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />

                        <ellipse cx="40" cy="36" rx="18" ry="16" fill={orange} />

                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />

                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                        <ellipse cx="40" cy="42" rx="10" ry="7" fill={cream} />

                        <ellipse cx="32" cy="34" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="34" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="34" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="34" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="33" r="1" fill={white} />
                        <circle cx="49" cy="33" r="1" fill={white} />

                        <ellipse cx="40" cy="42" rx="2.5" ry="2" fill={pink} />
                        <path d="M35 48 Q40 45 45 48" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                        <path d="M28 42 L18 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 44 L16 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 46 L18 48" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 44 L64 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 46 L62 48" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

                        <ellipse cx="34" cy="70" rx="5" ry="6" fill={orange} />
                        <ellipse cx="34" cy="72" rx="3" ry="3" fill={white} />
                        <ellipse cx="46" cy="70" rx="5" ry="6" fill={orange} />
                        <ellipse cx="46" cy="72" rx="3" ry="3" fill={white} />
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
                            <ellipse cx="40" cy="50" rx="16" ry="12" fill={orange} />
                            <ellipse cx="40" cy="52" rx="8" ry="8" fill={white} />

                            <motion.g animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }} transition={{ duration: 0.3, repeat: Infinity }}>
                                <ellipse cx="28" cy="30" rx="5" ry="6" fill={orange} />
                                <ellipse cx="28" cy="32" rx="3" ry="3" fill={white} />
                                <ellipse cx="52" cy="30" rx="5" ry="6" fill={orange} />
                                <ellipse cx="52" cy="32" rx="3" ry="3" fill={white} />
                            </motion.g>

                            <ellipse cx="40" cy="68" rx="18" ry="16" fill={orange} />

                            <path d="M22 62 L26 44 L34 60 Z" fill={orange} />
                            <path d="M48 60 L54 44 L60 62 Z" fill={orange} />
                            <path d="M25 60 L26 50 L31 59 Z" fill={pink} />
                            <path d="M51 59 L54 50 L57 60 Z" fill={pink} />

                            <path d="M32 64 L34 70" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                            <path d="M40 62 L40 68" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M48 64 L46 70" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                            <ellipse cx="40" cy="74" rx="10" ry="6" fill={cream} />

                            <ellipse cx="34" cy="72" rx="5" ry="4" fill={teal} />
                            <ellipse cx="46" cy="72" rx="5" ry="4" fill={teal} />
                            <ellipse cx="34" cy="72" rx="1.5" ry="3" fill="#1a3a38" />
                            <ellipse cx="46" cy="72" rx="1.5" ry="3" fill="#1a3a38" />
                            <circle cx="35" cy="71" r="1" fill={white} />
                            <circle cx="47" cy="71" r="1" fill={white} />

                            <ellipse cx="40" cy="78" rx="2.5" ry="2" fill={pink} />
                            <path d="M38 80 Q40 82 42 80" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                            <path d="M30 76 L20 74" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M30 78 L18 78" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M30 80 L20 82" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M50 76 L60 74" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M50 78 L62 78" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M50 80 L60 82" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

                            {/* Tail wiggling */}
                            <motion.path
                                initial={{ d: "M40 32 Q30 20 20 30" }}
                                animate={{ d: ["M40 32 Q30 20 20 30", "M40 32 Q50 20 60 30", "M40 32 Q30 20 20 30"] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                stroke={orange}
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
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

                            <path d="M32 48 L34 54" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                            <path d="M40 46 L40 52" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M48 48 L46 54" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />

                            <ellipse cx="34" cy="54" rx="5" ry="4" fill={teal} />
                            <ellipse cx="46" cy="54" rx="5" ry="4" fill={teal} />
                            <ellipse cx="34" cy="53" rx="1.5" ry="3" fill="#1a3a38" />
                            <ellipse cx="46" cy="53" rx="1.5" ry="3" fill="#1a3a38" />
                            <circle cx="35" cy="52" r="1" fill={white} />
                            <circle cx="47" cy="52" r="1" fill={white} />

                            <ellipse cx="40" cy="62" rx="2.5" ry="2" fill={pink} />
                            <path d="M37 65 Q40 67 43 65" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />

                            <path d="M28 60 L18 58" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 62 L16 62" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M28 64 L18 66" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 60 L62 58" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 62 L64 62" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                            <path d="M52 64 L62 66" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />

                            <ellipse cx="30" cy="74" rx="6" ry="3" fill={orange} />
                            <ellipse cx="50" cy="74" rx="6" ry="3" fill={orange} />
                            <ellipse cx="28" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="32" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="48" cy="74" rx="2.5" ry="2" fill={white} />
                            <ellipse cx="52" cy="74" rx="2.5" ry="2" fill={white} />
                        </motion.g>
                    </g>
                );

            // MAD pose - impact after fall (she mad)
            case 'mad':
                return (
                    <g>
                        <path d="M54 58 Q68 52 66 42 Q64 50 58 54" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M22 26 L28 14 L34 26 Z" fill={orange} transform="rotate(-25 28 20)" />
                        <path d="M46 26 L54 14 L60 26 Z" fill={orange} transform="rotate(25 52 20)" />
                        <path d="M24 24 L28 16 L31 25 Z" fill={pink} transform="rotate(-25 28 20)" />
                        <path d="M49 25 L54 16 L57 26 Z" fill={pink} transform="rotate(25 52 20)" />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <path d="M28 24 L34 28" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M52 28 L46 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M30 30 L34 30" stroke={teal} strokeWidth="2" strokeLinecap="round" />
                        <path d="M46 30 L50 30" stroke={teal} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M36 44 Q40 42 44 44" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="56" cy="50" rx="5" ry="6" fill={orange} />
                        <ellipse cx="56" cy="52" rx="3" ry="3" fill={white} />
                    </g>
                );

            // HURT pose - right after impact (pained)
            case 'hurt':
                return (
                    <g>
                        <path d="M54 58 Q68 52 66 42 Q64 50 58 54" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <path d="M28 26 L34 28" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M46 28 L52 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M30 30 L34 30" stroke={teal} strokeWidth="1.5" strokeLinecap="round" />
                        <ellipse cx="48" cy="30" rx="3" ry="2.5" fill={teal} opacity="0.8" />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 44 Q40 46 43 44" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="56" cy="50" rx="5" ry="6" fill={orange} />
                        <ellipse cx="56" cy="52" rx="3" ry="3" fill={white} />
                    </g>
                );

            // SIDEEYE pose - unimpressed, looking to the side
            case 'sideeye':
                return (
                    <g>
                        <path d="M54 58 Q68 50 64 36" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <path d="M28 25 L34 27" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M46 27 L52 25" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="34" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="50" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="35" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="51" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="35.5" cy="29" r="1" fill={white} />
                        <circle cx="51.5" cy="29" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 42 L43 42" stroke={orangeDark} strokeWidth="1" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="62" cy="46" rx="5" ry="6" fill={orange} />
                        <ellipse cx="64" cy="48" rx="3" ry="3" fill={white} />
                    </g>
                );

            // FLUNG pose - upward slingshot launch
            case 'flung':
                return (
                    <motion.g
                        animate={{ rotate: [0, -8, 6, -5, 0], y: [0, -3, 2, -2, 0] }}
                        transition={{ duration: 0.28, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '40px 45px' }}
                    >
                        <motion.path
                            d="M54 58 Q64 66 60 76"
                            stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none"
                            animate={{ d: ['M54 58 Q64 66 60 76', 'M52 56 Q62 70 56 78', 'M56 58 Q66 64 62 74', 'M54 58 Q64 66 60 76'] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        {/* Wide â€œwoahâ€ eyes */}
                        <ellipse cx="31" cy="29" rx="5" ry="4" fill={teal} />
                        <ellipse cx="49" cy="29" rx="5" ry="4" fill={teal} />
                        <ellipse cx="31" cy="29" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="49" cy="29" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="32" cy="28" r="1" fill={white} />
                        <circle cx="50" cy="28" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 44 Q40 46 43 44" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <motion.g animate={{ rotate: [0, -25, 20, -15, 0] }} transition={{ duration: 0.25, repeat: Infinity }} style={{ transformOrigin: '32px 66px' }}>
                            <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                            <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        </motion.g>
                        <motion.g animate={{ rotate: [0, 22, -18, 25, 0] }} transition={{ duration: 0.26, repeat: Infinity, delay: 0.05 }} style={{ transformOrigin: '56px 48px' }}>
                            <ellipse cx="56" cy="50" rx="5" ry="6" fill={orange} />
                            <ellipse cx="56" cy="52" rx="3" ry="3" fill={white} />
                        </motion.g>
                    </motion.g>
                );

            // FLOAT pose - weightless, gentle tumbling, dreamy off-balance
            case 'float':
                return (
                    <motion.g
                        animate={{ rotate: [0, 5, -4, 6, -3, 0], y: [0, -3, 2, -2, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '40px 42px' }}
                    >
                        <motion.path
                            d="M54 58 Q68 50 64 36"
                            stroke={orange}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ['M54 58 Q68 50 64 36', 'M52 56 Q70 52 66 38', 'M56 60 Q66 48 62 34', 'M54 58 Q68 50 64 36'] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <motion.path d="M29 30 Q33 29 37 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        <motion.path d="M41 30 Q45 29 49 30" stroke={teal} strokeWidth="2.5" fill="none" strokeLinecap="round" animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 42 Q40 44 43 42" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <motion.g animate={{ rotate: [0, 8, -6, 10, 0] }} transition={{ duration: 1.3, repeat: Infinity }} style={{ transformOrigin: '32px 66px' }}>
                            <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                            <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        </motion.g>
                        <motion.g animate={{ rotate: [0, -7, 9, -5, 0] }} transition={{ duration: 1.25, repeat: Infinity, delay: 0.2 }} style={{ transformOrigin: '56px 48px' }}>
                            <ellipse cx="56" cy="50" rx="5" ry="6" fill={orange} />
                            <ellipse cx="56" cy="52" rx="3" ry="3" fill={white} />
                        </motion.g>
                    </motion.g>
                );

            // FALL pose - off-balance tumble, limbs flailing, cute alarmed
            case 'fall':
                return (
                    <motion.g
                        animate={{ rotate: [0, -10, 8, -7, 5, 0], y: [0, 2, -1, 2, 0] }}
                        transition={{ duration: 0.32, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '40px 48px' }}
                    >
                        <motion.path
                            d="M54 58 Q68 50 64 36"
                            stroke={orange}
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ['M54 58 Q68 50 64 36', 'M52 56 Q70 54 66 38', 'M56 60 Q64 48 62 40', 'M54 58 Q68 50 64 36'] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                        />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <ellipse cx="31" cy="29" rx="5" ry="4" fill={teal} />
                        <ellipse cx="49" cy="29" rx="5" ry="4" fill={teal} />
                        <ellipse cx="31" cy="29" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="49" cy="29" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="32" cy="28" r="1" fill={white} />
                        <circle cx="50" cy="28" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 44 Q40 46 43 44" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <motion.g animate={{ rotate: [0, -28, 22, -20, 0] }} transition={{ duration: 0.3, repeat: Infinity }} style={{ transformOrigin: '32px 66px' }}>
                            <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                            <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        </motion.g>
                        <motion.g animate={{ rotate: [0, 25, -22, 28, 0] }} transition={{ duration: 0.28, repeat: Infinity, delay: 0.08 }} style={{ transformOrigin: '56px 48px' }}>
                            <ellipse cx="56" cy="50" rx="5" ry="6" fill={orange} />
                            <ellipse cx="56" cy="52" rx="3" ry="3" fill={white} />
                        </motion.g>
                    </motion.g>
                );

            // SIDEEYE ANGRY - post-impact attitude (animated)
            case 'sideeye_angry':
                return (
                    <motion.g
                        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                    >
                        <path d="M54 58 Q68 50 64 36" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="60" rx="16" ry="12" fill={orange} />
                        <ellipse cx="40" cy="62" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="32" rx="18" ry="16" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <path d="M28 24 L34 28" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M52 28 L46 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <ellipse cx="34" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="50" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="35" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="51" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M36 43 Q40 41 44 43" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                        <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                        <ellipse cx="62" cy="46" rx="5" ry="6" fill={orange} />
                        <ellipse cx="64" cy="48" rx="3" ry="3" fill={white} />
                    </motion.g>
                );

            // WALL GRAB - clinging to screen edge like a tree (edge bar + body flush)
            case 'wall_grab':
                return (
                    <g>
                        {/* Screen edge (tree) - vertical bar at viewport edge */}
                        {wallSide === 'left' && <rect x="0" y="0" width="4" height="80" fill="#1a1a1a" opacity="0.35" />}
                        {wallSide === 'right' && <rect x="76" y="0" width="4" height="80" fill="#1a1a1a" opacity="0.35" />}
                        <path d="M54 58 Q68 50 64 36" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="58" rx="14" ry="11" fill={orange} />
                        <ellipse cx="40" cy="60" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="34" rx="16" ry="14" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="29" r="1" fill={white} />
                        <circle cx="49" cy="29" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 42 Q40 44 43 42" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        {/* Legs extended toward wall (right); when wallSide left, whole SVG is scaleX(-1) */}
                        {wallSide === 'right' && (
                            <>
                                <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                                <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                                <motion.g animate={{ x: [0, 2, 0] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ transformOrigin: '68px 48px' }}>
                                    <ellipse cx="68" cy="46" rx="6" ry="5" fill={orange} />
                                    <ellipse cx="70" cy="48" rx="3.5" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }} style={{ transformOrigin: '72px 58px' }}>
                                    <ellipse cx="72" cy="56" rx="5" ry="5" fill={orange} />
                                    <ellipse cx="74" cy="58" rx="3" ry="3" fill={white} />
                                </motion.g>
                            </>
                        )}
                        {wallSide === 'left' && (
                            <>
                                <ellipse cx="48" cy="68" rx="5" ry="6" fill={orange} />
                                <ellipse cx="48" cy="70" rx="3" ry="3" fill={white} />
                                <motion.g animate={{ x: [0, -2, 0] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ transformOrigin: '12px 48px' }}>
                                    <ellipse cx="12" cy="46" rx="6" ry="5" fill={orange} />
                                    <ellipse cx="10" cy="48" rx="3.5" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ x: [0, -3, 0] }} transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }} style={{ transformOrigin: '8px 58px' }}>
                                    <ellipse cx="8" cy="56" rx="5" ry="5" fill={orange} />
                                    <ellipse cx="6" cy="58" rx="3" ry="3" fill={white} />
                                </motion.g>
                            </>
                        )}
                    </g>
                );

            // WALL CRAWL - crawling down the wall
            case 'wall_crawl':
                return (
                    <g>
                        {wallSide === 'left' && <rect x="0" y="0" width="4" height="80" fill="#1a1a1a" opacity="0.35" />}
                        {wallSide === 'right' && <rect x="76" y="0" width="4" height="80" fill="#1a1a1a" opacity="0.35" />}
                        <path d="M54 58 Q68 50 64 36" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <ellipse cx="40" cy="58" rx="14" ry="11" fill={orange} />
                        <ellipse cx="40" cy="60" rx="8" ry="8" fill={white} />
                        <ellipse cx="40" cy="34" rx="16" ry="14" fill={orange} />
                        <path d="M20 28 L26 8 L34 26 Z" fill={orange} />
                        <path d="M46 26 L54 8 L60 28 Z" fill={orange} />
                        <path d="M23 26 L26 12 L31 25 Z" fill={pink} />
                        <path d="M49 25 L54 12 L57 26 Z" fill={pink} />
                        <path d="M32 20 L34 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <path d="M40 18 L40 24" stroke={orangeDark} strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M48 20 L46 26" stroke={orangeDark} strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="40" cy="38" rx="10" ry="7" fill={cream} />
                        <ellipse cx="32" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="48" cy="30" rx="5" ry="4" fill={teal} />
                        <ellipse cx="32" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <ellipse cx="48" cy="30" rx="1.5" ry="3" fill="#1a3a38" />
                        <circle cx="33" cy="29" r="1" fill={white} />
                        <circle cx="49" cy="29" r="1" fill={white} />
                        <ellipse cx="40" cy="38" rx="2.5" ry="2" fill={pink} />
                        <path d="M37 42 Q40 44 43 42" stroke={orangeDark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M28 38 L18 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 40 L16 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M28 42 L18 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 38 L62 36" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 40 L64 40" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        <path d="M52 42 L62 44" stroke={white} strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
                        {wallSide === 'right' && (
                            <>
                                <motion.g animate={{ y: [0, 4, 0], x: [0, 2, 0] }} transition={{ duration: 0.25, repeat: Infinity }} style={{ transformOrigin: '32px 68px' }}>
                                    <ellipse cx="32" cy="68" rx="5" ry="6" fill={orange} />
                                    <ellipse cx="32" cy="70" rx="3" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ y: [0, 5, 0], x: [0, 3, 0] }} transition={{ duration: 0.22, repeat: Infinity, delay: 0.12 }} style={{ transformOrigin: '68px 48px' }}>
                                    <ellipse cx="68" cy="46" rx="6" ry="5" fill={orange} />
                                    <ellipse cx="70" cy="48" rx="3.5" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ y: [0, 4, 0], x: [0, 2, 0] }} transition={{ duration: 0.24, repeat: Infinity, delay: 0.06 }} style={{ transformOrigin: '72px 58px' }}>
                                    <ellipse cx="72" cy="56" rx="5" ry="5" fill={orange} />
                                    <ellipse cx="74" cy="58" rx="3" ry="3" fill={white} />
                                </motion.g>
                            </>
                        )}
                        {wallSide === 'left' && (
                            <>
                                <motion.g animate={{ y: [0, 4, 0], x: [0, -2, 0] }} transition={{ duration: 0.25, repeat: Infinity }} style={{ transformOrigin: '48px 68px' }}>
                                    <ellipse cx="48" cy="68" rx="5" ry="6" fill={orange} />
                                    <ellipse cx="48" cy="70" rx="3" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ y: [0, 5, 0], x: [0, -3, 0] }} transition={{ duration: 0.22, repeat: Infinity, delay: 0.12 }} style={{ transformOrigin: '12px 48px' }}>
                                    <ellipse cx="12" cy="46" rx="6" ry="5" fill={orange} />
                                    <ellipse cx="10" cy="48" rx="3.5" ry="3" fill={white} />
                                </motion.g>
                                <motion.g animate={{ y: [0, 4, 0], x: [0, -2, 0] }} transition={{ duration: 0.24, repeat: Infinity, delay: 0.06 }} style={{ transformOrigin: '8px 58px' }}>
                                    <ellipse cx="8" cy="56" rx="5" ry="5" fill={orange} />
                                    <ellipse cx="6" cy="58" rx="3" ry="3" fill={white} />
                                </motion.g>
                            </>
                        )}
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

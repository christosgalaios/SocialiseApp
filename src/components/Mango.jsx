import { motion } from 'framer-motion';

/**
 * MangoSVG - The Mango kitten character with multiple poses
 * Uses brand terracotta colors and playful animations
 */
const MangoSVG = ({ pose = 'wave', size = 80 }) => {
    // Brand colors
    const terracotta = '#E2725B';
    const terracottaLight = '#E8A090';
    const terracottaDark = '#C45C47';

    const renderPose = () => {
        switch (pose) {
            case 'wave':
                return (
                    <g>
                        {/* Body */}
                        <ellipse cx="40" cy="55" rx="25" ry="20" fill={terracotta} />
                        {/* Head */}
                        <circle cx="40" cy="30" r="22" fill={terracotta} />
                        {/* Ears */}
                        <polygon points="22,18 28,5 35,18" fill={terracotta} />
                        <polygon points="45,18 52,5 58,18" fill={terracotta} />
                        <polygon points="24,16 28,8 32,16" fill={terracottaLight} />
                        <polygon points="48,16 52,8 56,16" fill={terracottaLight} />
                        {/* Face */}
                        <ellipse cx="32" cy="28" rx="4" ry="5" fill="#2D5F5D" /> {/* Left eye */}
                        <ellipse cx="48" cy="28" rx="4" ry="5" fill="#2D5F5D" /> {/* Right eye */}
                        <circle cx="33" cy="27" r="1.5" fill="white" /> {/* Eye shine */}
                        <circle cx="49" cy="27" r="1.5" fill="white" />
                        <ellipse cx="40" cy="36" rx="3" ry="2" fill={terracottaDark} /> {/* Nose */}
                        <path d="M37 38 Q40 42 43 38" stroke={terracottaDark} strokeWidth="1.5" fill="none" /> {/* Mouth */}
                        {/* Whiskers */}
                        <line x1="20" y1="34" x2="30" y2="36" stroke={terracottaDark} strokeWidth="1" />
                        <line x1="20" y1="38" x2="30" y2="38" stroke={terracottaDark} strokeWidth="1" />
                        <line x1="50" y1="36" x2="60" y2="34" stroke={terracottaDark} strokeWidth="1" />
                        <line x1="50" y1="38" x2="60" y2="38" stroke={terracottaDark} strokeWidth="1" />
                        {/* Waving paw */}
                        <motion.g
                            animate={{ rotate: [0, 20, 0, 20, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            style={{ transformOrigin: '65px 45px' }}
                        >
                            <ellipse cx="68" cy="42" rx="8" ry="6" fill={terracottaLight} />
                        </motion.g>
                        {/* Other paw */}
                        <ellipse cx="20" cy="60" rx="6" ry="8" fill={terracottaLight} />
                        {/* Tail */}
                        <motion.path
                            d="M60 60 Q75 50 70 35"
                            stroke={terracotta}
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                            animate={{ d: ["M60 60 Q75 50 70 35", "M60 60 Q80 55 72 38", "M60 60 Q75 50 70 35"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </g>
                );

            case 'celebrate':
                return (
                    <g>
                        {/* Body - bouncing */}
                        <motion.g
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            <ellipse cx="40" cy="55" rx="25" ry="20" fill={terracotta} />
                            <circle cx="40" cy="30" r="22" fill={terracotta} />
                            {/* Ears */}
                            <polygon points="22,18 28,5 35,18" fill={terracotta} />
                            <polygon points="45,18 52,5 58,18" fill={terracotta} />
                            <polygon points="24,16 28,8 32,16" fill={terracottaLight} />
                            <polygon points="48,16 52,8 56,16" fill={terracottaLight} />
                            {/* Happy closed eyes */}
                            <path d="M28 28 Q32 24 36 28" stroke="#2D5F5D" strokeWidth="2.5" fill="none" />
                            <path d="M44 28 Q48 24 52 28" stroke="#2D5F5D" strokeWidth="2.5" fill="none" />
                            {/* Big smile */}
                            <ellipse cx="40" cy="36" rx="3" ry="2" fill={terracottaDark} />
                            <path d="M32 38 Q40 48 48 38" stroke={terracottaDark} strokeWidth="2" fill="none" />
                            {/* Both paws up */}
                            <motion.ellipse
                                cx="18" cy="35" rx="8" ry="6" fill={terracottaLight}
                                animate={{ rotate: [-10, 10, -10] }}
                                transition={{ duration: 0.3, repeat: Infinity }}
                            />
                            <motion.ellipse
                                cx="62" cy="35" rx="8" ry="6" fill={terracottaLight}
                                animate={{ rotate: [10, -10, 10] }}
                                transition={{ duration: 0.3, repeat: Infinity }}
                            />
                        </motion.g>
                    </g>
                );

            case 'curious':
                return (
                    <g>
                        <ellipse cx="40" cy="55" rx="25" ry="20" fill={terracotta} />
                        {/* Tilted head */}
                        <motion.g
                            animate={{ rotate: [0, 15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ transformOrigin: '40px 30px' }}
                        >
                            <circle cx="40" cy="30" r="22" fill={terracotta} />
                            <polygon points="22,18 28,5 35,18" fill={terracotta} />
                            <polygon points="45,18 52,5 58,18" fill={terracotta} />
                            <polygon points="24,16 28,8 32,16" fill={terracottaLight} />
                            <polygon points="48,16 52,8 56,16" fill={terracottaLight} />
                            {/* Big curious eyes */}
                            <ellipse cx="32" cy="28" rx="5" ry="6" fill="#2D5F5D" />
                            <ellipse cx="48" cy="28" rx="5" ry="6" fill="#2D5F5D" />
                            <circle cx="33" cy="26" r="2" fill="white" />
                            <circle cx="49" cy="26" r="2" fill="white" />
                            <ellipse cx="40" cy="38" rx="3" ry="2" fill={terracottaDark} />
                            <path d="M38 40 Q40 42 42 40" stroke={terracottaDark} strokeWidth="1.5" fill="none" />
                        </motion.g>
                        <ellipse cx="20" cy="60" rx="6" ry="8" fill={terracottaLight} />
                        <ellipse cx="60" cy="60" rx="6" ry="8" fill={terracottaLight} />
                    </g>
                );

            case 'lonely':
                return (
                    <g>
                        <ellipse cx="40" cy="58" rx="25" ry="18" fill={terracotta} />
                        <circle cx="40" cy="32" r="22" fill={terracotta} />
                        {/* Droopy ears */}
                        <polygon points="22,22 25,8 35,20" fill={terracotta} />
                        <polygon points="45,20 55,8 58,22" fill={terracotta} />
                        <polygon points="24,20 26,12 32,19" fill={terracottaLight} />
                        <polygon points="48,19 54,12 56,20" fill={terracottaLight} />
                        {/* Sad eyes */}
                        <ellipse cx="32" cy="30" rx="4" ry="5" fill="#2D5F5D" />
                        <ellipse cx="48" cy="30" rx="4" ry="5" fill="#2D5F5D" />
                        <circle cx="33" cy="29" r="1.5" fill="white" />
                        <circle cx="49" cy="29" r="1.5" fill="white" />
                        {/* Sad eyebrows */}
                        <line x1="26" y1="22" x2="36" y2="25" stroke={terracottaDark} strokeWidth="2" />
                        <line x1="44" y1="25" x2="54" y2="22" stroke={terracottaDark} strokeWidth="2" />
                        <ellipse cx="40" cy="38" rx="3" ry="2" fill={terracottaDark} />
                        {/* Frown */}
                        <path d="M35 42 Q40 38 45 42" stroke={terracottaDark} strokeWidth="1.5" fill="none" />
                        <ellipse cx="25" cy="62" rx="6" ry="6" fill={terracottaLight} />
                        <ellipse cx="55" cy="62" rx="6" ry="6" fill={terracottaLight} />
                    </g>
                );

            case 'sleep':
                return (
                    <g>
                        {/* Curled up body */}
                        <ellipse cx="40" cy="50" rx="30" ry="22" fill={terracotta} />
                        <circle cx="30" cy="35" r="18" fill={terracotta} />
                        {/* Ears */}
                        <polygon points="16,28 20,18 26,28" fill={terracotta} />
                        <polygon points="34,25 40,15 46,28" fill={terracotta} />
                        <polygon points="18,27 20,20 24,27" fill={terracottaLight} />
                        <polygon points="36,25 40,18 44,27" fill={terracottaLight} />
                        {/* Closed eyes - sleeping */}
                        <path d="M22 34 L30 34" stroke="#2D5F5D" strokeWidth="2" strokeLinecap="round" />
                        <path d="M34 32 L42 32" stroke="#2D5F5D" strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="28" cy="40" rx="2" ry="1.5" fill={terracottaDark} />
                        {/* Tail wrapped around */}
                        <path d="M55 60 Q70 40 60 25 Q55 35 50 40" stroke={terracotta} strokeWidth="8" strokeLinecap="round" fill="none" />
                        {/* ZZZ */}
                        <motion.text
                            x="50" y="20"
                            fill="#2D5F5D"
                            fontSize="10"
                            fontWeight="bold"
                            animate={{ opacity: [0, 1, 0], y: [20, 15, 10] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            z
                        </motion.text>
                        <motion.text
                            x="58" y="12"
                            fill="#2D5F5D"
                            fontSize="8"
                            fontWeight="bold"
                            animate={{ opacity: [0, 1, 0], y: [12, 8, 4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        >
                            z
                        </motion.text>
                    </g>
                );

            case 'peek':
                return (
                    <g>
                        {/* Just head peeking from bottom */}
                        <motion.g
                            initial={{ y: 30 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <circle cx="40" cy="55" r="22" fill={terracotta} />
                            {/* Ears */}
                            <polygon points="22,43 28,30 35,43" fill={terracotta} />
                            <polygon points="45,43 52,30 58,43" fill={terracotta} />
                            <polygon points="24,41 28,33 32,41" fill={terracottaLight} />
                            <polygon points="48,41 52,33 56,41" fill={terracottaLight} />
                            {/* Peeking eyes */}
                            <ellipse cx="32" cy="52" rx="4" ry="5" fill="#2D5F5D" />
                            <ellipse cx="48" cy="52" rx="4" ry="5" fill="#2D5F5D" />
                            <circle cx="33" cy="51" r="1.5" fill="white" />
                            <circle cx="49" cy="51" r="1.5" fill="white" />
                            <ellipse cx="40" cy="60" rx="3" ry="2" fill={terracottaDark} />
                            {/* Paws on edge */}
                            <ellipse cx="25" cy="72" rx="8" ry="5" fill={terracottaLight} />
                            <ellipse cx="55" cy="72" rx="8" ry="5" fill={terracottaLight} />
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            {renderPose()}
        </motion.svg>
    );
};

/**
 * Mango Component - The main character wrapper with positioning and speech bubble
 */
const Mango = ({ pose = 'wave', message = null, position = 'bottom-right', size = 80 }) => {
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    return (
        <div className={`relative ${position !== 'inline' ? positionClasses[position] : ''}`}>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-2 shadow-lg border border-secondary/10 whitespace-nowrap z-10"
                >
                    <span className="text-xs font-bold text-secondary">{message}</span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-secondary/10" />
                </motion.div>
            )}
            <MangoSVG pose={pose} size={size} />
        </div>
    );
};

export default Mango;

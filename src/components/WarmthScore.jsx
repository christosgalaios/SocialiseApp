import { motion } from 'framer-motion';
import { Heart, TrendingUp } from 'lucide-react';

/**
 * WarmthScore - Animated circular progress showing user's connection activity
 */
const WarmthScore = ({ score = 78, streak = 5 }) => {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
        >
            {/* SVG Circle Progress */}
            <div className="relative w-32 h-32">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-secondary/10"
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="url(#warmthGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                    <defs>
                        <linearGradient id="warmthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        className="flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                    >
                        <Heart size={16} className="text-primary fill-primary" />
                    </motion.div>
                    <motion.span
                        className="text-3xl font-black text-secondary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {score}
                    </motion.span>
                    <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">
                        Warmth
                    </span>
                </div>
            </div>

            {/* Streak indicator below */}
            <motion.div
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-accent/10 rounded-full border border-accent/20"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <TrendingUp size={14} className="text-accent" />
                <span className="text-xs font-black text-accent">{streak} day streak!</span>
            </motion.div>
        </motion.div>
    );
};

export default WarmthScore;

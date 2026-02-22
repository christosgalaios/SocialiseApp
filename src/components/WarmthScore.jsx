import { motion } from 'framer-motion';

const DAILY_REWARDS = [
    { day: 1, icon: '⚡', xp: 10 },
    { day: 2, icon: '⚡', xp: 15 },
    { day: 3, icon: '🌟', xp: 20 },
    { day: 4, icon: '🌟', xp: 25 },
    { day: 5, icon: '💎', xp: 30 },
    { day: 6, icon: '💎', xp: 50 },
    { day: 7, icon: '👑', xp: 100 },
];

/**
 * WarmthScore - Level progress circle with daily streak rewards
 */
const WarmthScore = ({ level = 4, levelProgress = 75, levelIcon = '⭐', streak = 0 }) => {
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (levelProgress / 100) * circumference;

    // Which day of the 7-day cycle we're currently on (1–7), 0 means no streak
    const streakDay = streak > 0 ? ((streak - 1) % 7) + 1 : 0;

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
                        cx="64" cy="64" r="45"
                        stroke="currentColor" strokeWidth="8" fill="none"
                        className="text-secondary/10"
                    />
                    {/* Progress arc */}
                    <motion.circle
                        cx="64" cy="64" r="45"
                        stroke="url(#levelGradient)"
                        strokeWidth="8" fill="none" strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        style={{ strokeDasharray: circumference }}
                    />
                    <defs>
                        <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-xl leading-none"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                    >
                        {levelIcon}
                    </motion.span>
                    <motion.span
                        className="text-3xl font-black text-secondary leading-none mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {level}
                    </motion.span>
                    <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">
                        Level
                    </span>
                </div>
            </div>

            {/* Daily Streak Rewards */}
            <motion.div
                className="mt-4 flex items-end gap-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                {DAILY_REWARDS.map((reward) => {
                    const isClaimed = reward.day < streakDay;
                    const isToday = reward.day === streakDay;
                    return (
                        <div key={reward.day} className="flex flex-col items-center gap-0.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all ${
                                isClaimed
                                    ? 'bg-accent text-white shadow-sm'
                                    : isToday
                                    ? 'bg-primary/20 border-2 border-primary ring-1 ring-primary/30 animate-pulse'
                                    : 'bg-secondary/10 opacity-35'
                            }`}>
                                {isClaimed ? '✓' : reward.icon}
                            </div>
                            <span className="text-[7px] font-bold text-secondary/40">{reward.day}</span>
                        </div>
                    );
                })}
            </motion.div>

            {/* Streak count badge */}
            <motion.div
                className={`flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border ${streak > 0 ? 'bg-accent/10 border-accent/20' : 'bg-secondary/5 border-secondary/10'}`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
            >
                <span className={`text-xs font-black ${streak > 0 ? 'text-accent' : 'text-secondary/40'}`}>
                    {streak > 0 ? `🔥 ${streak} day streak` : 'Log in daily to build a streak!'}
                </span>
            </motion.div>
        </motion.div>
    );
};

export default WarmthScore;

import { motion } from 'framer-motion';
import {
  Calendar, Mic, Martini, Compass, Dice5, Utensils, Heart, Users
} from 'lucide-react';

const AnimatedLogo = () => {
  const icons = [
    { Icon: Calendar, angle: 0, delay: 0.2, color: '#E2725B' },    // Top - terracotta
    { Icon: Heart, angle: 45, delay: 0.3, color: '#F4B942' },       // Top-Right - gold
    { Icon: Martini, angle: 135, delay: 0.4, color: '#E2725B' },    // Bottom-Right
    { Icon: Compass, angle: 180, delay: 0.5, color: '#2D5F5D' },    // Bottom - teal
    { Icon: Users, angle: 225, delay: 0.6, color: '#F4B942' },      // Bottom-Left
    { Icon: Utensils, angle: 315, delay: 0.7, color: '#2D5F5D' },   // Top-Left
  ];

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" aria-hidden="true" />

      {/* Rotating Gradient Ring */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="160" cy="160" r="156"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="12 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Second ring - counter-rotating */}
      <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-[spin_20s_linear_infinite_reverse]">
        <motion.circle
          cx="152" cy="152" r="148"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="4 20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </svg>

      {/* Inner Circle Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="absolute inset-5 bg-dark rounded-full border-2 border-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-radial from-primary/15 to-transparent opacity-60" aria-hidden="true" />
        {/* Subtle shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 animate-pulse" aria-hidden="true" />
      </motion.div>

      {/* Radial Icons with glow */}
      {icons.map(({ angle, delay, color }, i) => {
        const radius = 128;
        const rad = (angle - 90) * (Math.PI / 180);
        const x = 160 + radius * Math.cos(rad);
        const y = 160 + radius * Math.sin(rad);

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: 1,
            }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 12 }}
            style={{ left: x - 14, top: y - 14 }}
            className="absolute"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-md opacity-40"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <div
                className="relative w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ color }}
              >
                <Icon size={22} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Brand Text */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ x: 12 }}
          animate={{ x: 0 }}
          transition={{ delay: 2.0, duration: 0.8, ease: "easeInOut" }}
          className="flex items-center font-black italic tracking-tighter text-5xl text-white"
        >
          <motion.span
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
            className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent"
          >
            SOCI
          </motion.span>

          <motion.span
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1.15, rotate: 0, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", bounce: 0.6 }}
            className="mx-0.5"
            style={{ color: 'var(--accent)' }}
          >
            A
          </motion.span>

          <motion.span
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
            className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent"
          >
            LISE
          </motion.span>

          <motion.span
            initial={{ y: -50, opacity: 0, scale: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, type: "spring", bounce: 0.5 }}
            style={{ color: 'var(--primary)' }}
          >
            .
          </motion.span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="text-[10px] font-bold uppercase tracking-[0.3em] mt-2"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Connect. Discover. Belong.
        </motion.p>
      </div>
    </div>
  );
};

export default AnimatedLogo;

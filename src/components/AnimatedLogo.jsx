import { motion } from 'framer-motion';
import { 
  Calendar, Mic, Martini, Compass, Dice5, Utensils
} from 'lucide-react';

const AnimatedLogo = () => {
  const icons = [
    { Icon: Calendar, angle: 0, delay: 0.2 },     // Top
    { Icon: Mic, angle: 40, delay: 0.3 },         // Top-Right (moved up)
    { Icon: Martini, angle: 140, delay: 0.4 },    // Bottom-Right (moved down)
    { Icon: Compass, angle: 180, delay: 0.5 },    // Bottom
    { Icon: Dice5, angle: 220, delay: 0.6 },      // Bottom-Left (moved down)
    { Icon: Utensils, angle: 320, delay: 0.7 },   // Top-Left (moved up)
  ];

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Rotating Gradient Ring */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(265, 85%, 65%)" />
            <stop offset="100%" stopColor="hsl(190, 95%, 50%)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="160" cy="160" r="156"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Inner Circle Background */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="absolute inset-4 bg-dark rounded-full border-4 border-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50" />
      </motion.div>

      {/* Radial Icons */}
      {icons.map(({ Icon, angle, delay }, i) => {
        const radius = 130; // Radius for icons
        const rad = (angle - 90) * (Math.PI / 180); // -90 to start at top
        const x = 160 + radius * Math.cos(rad);
        const y = 160 + radius * Math.sin(rad);

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 12 }}
            style={{ left: x - 12, top: y - 12 }} // Centering icon (24x24)
            className="absolute w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          >
            <Icon size={24} />
          </motion.div>
        );
      })}

      {/* Split Text Animation with Welcoming Dot */}
      <div className="relative z-10 flex items-center justify-center font-black italic tracking-tighter text-5xl text-white">
        <motion.div
            initial={{ x: 12 }} // Start slightly right so "SOCIALISE" looks centered
            animate={{ x: 0 }}  // Nudge left to center the full "SOCIALISE."
            transition={{ delay: 2.0, duration: 0.8, ease: "easeInOut" }}
            className="flex items-center"
        >
            <motion.span
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
            className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent"
            >
            SOCI
            </motion.span>
            
            <motion.span
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", bounce: 0.6 }}
            className="text-secondary glow-secondary-text mx-1"
            >
            A
            </motion.span>

            <motion.span
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
            className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent"
            >
            LISE
            </motion.span>

            {/* The Welcoming Dot - Now inside to move with the word */}
            <motion.span
                initial={{ y: -50, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 2.2, type: "spring", bounce: 0.5 }}
                className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent"
            >
                .
            </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedLogo;

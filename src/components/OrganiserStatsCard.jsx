import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const numVal = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(numVal) || numVal === 0) { setDisplay(value); return; }

    const duration = 600;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(numVal * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{typeof value === 'number' ? display : value}</>;
}

export default function OrganiserStatsCard({ icon: Icon, value, label, trend, color = 'text-primary', bgColor = 'bg-primary/10', borderColor = 'border-primary/20' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className="premium-card p-5 relative overflow-hidden group cursor-default"
    >
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300" style={{ background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)` }} aria-hidden="true" />
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${bgColor} flex items-center justify-center border ${borderColor} group-hover:scale-110 transition-transform duration-200`}>
          {Icon && <Icon size={22} className={`${color} group-hover:rotate-[-8deg] transition-transform duration-200`} />}
        </div>
        {trend != null && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-all duration-200 group-hover:scale-105 ${
            trend > 0 ? 'text-green-600 bg-green-500/10' : trend < 0 ? 'text-red-500 bg-red-500/10' : 'text-secondary/40 bg-secondary/5'
          }`}>
            {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <motion.span
          className="text-2xl font-black text-secondary block group-hover:text-primary transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
        >
          <AnimatedNumber value={value} />
        </motion.span>
        <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5 group-hover:text-secondary/60 transition-colors duration-200">{label}</p>
      </div>
    </motion.div>
  );
}

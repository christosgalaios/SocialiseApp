import { motion } from 'framer-motion';

export default function OrganiserStatsCard({ icon: Icon, value, label, trend, color = 'text-primary', bgColor = 'bg-primary/10', borderColor = 'border-primary/20' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`premium-card p-5 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${bgColor} flex items-center justify-center border ${borderColor}`}>
          {Icon && <Icon size={22} className={color} />}
        </div>
        {trend != null && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
            trend > 0 ? 'text-green-600 bg-green-500/10' : trend < 0 ? 'text-red-500 bg-red-500/10' : 'text-secondary/40 bg-secondary/5'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-black text-secondary">{value}</span>
        <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

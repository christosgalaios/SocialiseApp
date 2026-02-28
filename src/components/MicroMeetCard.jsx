import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/constants';
import { playCardPress, hapticTap } from '../utils/feedback';

const MicroMeetCard = ({ meet, onClick }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    className="min-w-[300px] premium-card p-6 mr-4 relative overflow-hidden group shadow-2xl cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
    onClick={() => { playCardPress(); hapticTap(); onClick(meet); }}
    tabIndex={0}
    role="button"
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playCardPress(); hapticTap(); onClick(meet); } }}
  >
    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" aria-hidden="true" />
    {meet.matchScore !== undefined && (
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20 shadow-inner">
          <Wand2 className="text-accent" size={12} strokeWidth={3} />
          <span className="text-[10px] font-black text-accent uppercase tracking-widest">{meet.matchScore}% Match</span>
        </div>
      </div>
    )}
    <h3 className="text-2xl font-black mb-1 tracking-tighter text-secondary">{meet.title}</h3>
    {meet.theme && <p className="text-sm text-secondary/70 font-bold mb-6 uppercase tracking-wider text-[10px]">{meet.theme}</p>}
    {meet.category && !meet.theme && <p className="text-sm text-secondary/70 font-bold mb-6 uppercase tracking-wider text-[10px]">{meet.category}</p>}
    <div className="flex items-center justify-between mt-auto">
      {meet.avatars && (
        <div className="flex -space-x-2.5">
          {meet.avatars.slice(0, 3).map((av, i) => (
            <img key={i} src={av || DEFAULT_AVATAR} className="w-10 h-10 rounded-full border-2 border-paper shadow-lg" alt="attendee" loading="lazy" />
          ))}
          {meet.spotsLeft && <div className="w-10 h-10 rounded-full bg-secondary/10 border-2 border-paper flex items-center justify-center text-[10px] font-black text-secondary">+{meet.spotsLeft}</div>}
        </div>
      )}
      <div className="text-right">
        {meet.date && <p className="text-[10px] text-secondary/70 font-black uppercase tracking-widest mb-0.5">{meet.date}</p>}
        {meet.spots && <p className="text-xs text-secondary/60 font-bold">{meet.spots} spots</p>}
      </div>
    </div>
  </motion.div>
);

export default MicroMeetCard;

import { motion } from 'framer-motion';
import { Check, Clock, Users, Calendar, MapPin, Megaphone } from 'lucide-react';
import { INCLUSIVITY_TAGS } from '../data/constants';
import { playCardPress, hapticTap } from '../utils/feedback';

const EventCard = ({ event, onClick, compact = false, isJoined = false, isHosting = false }) => (
  <motion.div
    whileTap={{ scale: 0.96 }}
    className={`premium-card overflow-hidden group ${compact ? 'flex gap-4 p-4' : 'mb-6 shadow-2xl'}`}
    onClick={() => { playCardPress(); hapticTap(); onClick(event); }}
  >
    {compact ? (
      <>
        <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-2xl shadow-inner border border-paper/10">
          <img src={event.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} loading="lazy" />
          {isHosting ? (
            <div className="absolute inset-0 bg-accent/40 backdrop-blur-sm flex items-center justify-center">
              <Megaphone className="text-white" size={22} strokeWidth={2.5} />
            </div>
          ) : isJoined ? (
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center">
              <Check className="text-white" size={24} strokeWidth={3} />
            </div>
          ) : null}
        </div>
        <div className="flex-1 py-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-extrabold text-lg leading-tight tracking-tight text-secondary">{event.title}</h4>
            {event.price === 0 && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Free</span>}
          </div>
          <p className="text-xs text-secondary/60 font-bold mb-3 flex items-center gap-1.5">
            <Clock size={12} /> {event.date} • {event.time}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/5">
              <Users size={10} className="text-secondary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary/70">{event.attendees} going</span>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="relative h-52 overflow-hidden">
          <img src={event.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={event.title} loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5">
            <span className="bg-paper/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-secondary uppercase tracking-widest shadow-lg">{event.category}</span>
            {isHosting && <span className="bg-accent px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1"><Megaphone size={10} />HOSTING</span>}
            {isJoined && !isHosting && <span className="bg-primary px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">GOING</span>}
            {event.tags?.slice(0, 2).map(tagId => {
              const tag = INCLUSIVITY_TAGS.find(t => t.id === tagId);
              if (!tag) return null;
              return <span key={tagId} className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-bold text-secondary/80 shadow-sm">{tag.emoji} {tag.label}</span>;
            })}
          </div>
          <div className="absolute bottom-4 left-4 right-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-500" aria-hidden="true">
            <h3 className="text-3xl font-black mb-1 truncate text-white drop-shadow-lg tracking-tighter">{event.title}</h3>
            <div className="flex items-center gap-4 text-white/90 text-xs font-bold">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {event.date}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location?.split(',')[0]}</span>
            </div>
          </div>
        </div>
      </>
    )}
  </motion.div>
);

export default EventCard;

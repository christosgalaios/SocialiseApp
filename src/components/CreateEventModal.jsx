import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CreateEventModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '', date: '2026-02-15', time: '19:00', location: '', type: 'free', price: 0, category: 'Social'
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }}
        className="bg-paper w-full max-w-md rounded-[48px] overflow-hidden border border-secondary/10 shadow-[0_50px_100px_-20px_rgba(45,95,93,0.15)] relative z-50 p-10 text-secondary"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-secondary/30 hover:text-secondary transition-colors active:scale-90"><X size={28} strokeWidth={2.5} /></button>
        <div className="mb-10">
          <h2 className="text-4xl font-black mb-2 tracking-tighter">Kickstart a <span className="text-primary italic">Vibe.</span></h2>
          <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.2em]">Anti-Greed Hosting Model</p>
        </div>

        {/* Pricing Model Selector */}
        <div className="flex bg-secondary/5 p-2 rounded-[28px] mb-10 border border-secondary/10 inner-shadow">
          <button
            onClick={() => setFormData({ ...formData, type: 'free', price: 0 })}
            className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === 'free' ? 'bg-primary text-white shadow-lg' : 'text-secondary/40'}`}
          >
            Free Event <br /><span className="text-[8px] font-bold opacity-60 italic whitespace-nowrap">0% Platform Fee</span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, type: 'ticketed', price: 12 })}
            className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === 'ticketed' ? 'bg-primary text-white shadow-lg' : 'text-secondary/40'}`}
          >
            Ticketed <br /><span className="text-[8px] font-bold opacity-60 italic whitespace-nowrap">5% Transparent Fee</span>
          </button>
        </div>

        <div className="space-y-6 mb-10 text-secondary">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-5">Vibe Title</label>
            <input
              type="text" placeholder="Pub Quiz, Dinner for 6, etc."
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-secondary/5 border border-secondary/10 rounded-[22px] px-8 py-5 text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-secondary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-5">When</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-secondary/5 border border-secondary/10 rounded-[22px] px-5 py-5 text-xs font-black focus:outline-none focus:border-primary uppercase tracking-tighter" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-5">At</label>
              <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-secondary/5 border border-secondary/10 rounded-[22px] px-5 py-5 text-xs font-black focus:outline-none focus:border-primary uppercase tracking-tighter" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-5">Where</label>
            <input
              type="text" placeholder="Venue name or neighborhood"
              value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-secondary/5 border border-secondary/10 rounded-[22px] px-8 py-5 text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-secondary/20"
            />
          </div>
          {formData.type === 'ticketed' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
              <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-5">Price (£)</label>
              <input
                type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-primary/5 border border-primary/20 rounded-[22px] px-8 py-5 text-base font-black text-primary focus:outline-none"
              />
            </motion.div>
          )}
        </div>

        <button
          onClick={() => onSubmit(formData)}
          disabled={!formData.title || !formData.location}
          className="w-full py-6 bg-gradient-to-r from-secondary to-primary rounded-[24px] text-lg font-black uppercase tracking-[0.1em] shadow-xl text-white disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Publish Experience
        </button>
      </motion.div>
    </div>
  );
};

export default CreateEventModal;

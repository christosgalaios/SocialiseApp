import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, AlertCircle, Check } from 'lucide-react';
import { CATEGORIES } from '../data/constants';
import LocationPicker from './LocationPicker';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const CreateEventModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '', date: '2026-02-15', time: '19:00', location: '', type: 'free', price: 0, category: 'Food & Drinks', image: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  useEscapeKey(true, onClose);
  const focusTrapRef = useFocusTrap(true);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.type === 'ticketed' && formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1529543544277-750e0c7e4d18?w=800&q=80'
      });
    }
  };

  const handleImageUrl = (url) => {
    setFormData({ ...formData, image: url });
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const categories = CATEGORIES.filter(c => c.id !== 'All');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Create event" ref={focusTrapRef}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }}
        className="bg-paper w-full max-w-md rounded-[32px] overflow-hidden border border-secondary/10 shadow-2xl relative z-50 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-paper p-6 pb-4 border-b border-secondary/10 z-10">
          <button onClick={onClose} className="absolute top-6 right-6 text-secondary/30 hover:text-secondary transition-colors active:scale-90" aria-label="Close">
            <X size={24} strokeWidth={2.5} />
          </button>
          <h2 className="text-2xl font-black tracking-tight text-secondary">Create Event<span className="text-accent">.</span></h2>
          <p className="text-xs text-secondary/50 font-medium mt-1">Share your vibe with the community</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Image Preview/Input */}
          <div className="space-y-2">
            <label htmlFor="event-image" className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Cover Image</label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" loading="lazy" onError={() => setImagePreview(null)} />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" aria-hidden="true" />
                <button
                  onClick={() => handleImageUrl('')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-secondary/70 flex items-center justify-center text-white hover:bg-secondary/90"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Image size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" aria-hidden="true" />
                <input
                  id="event-image"
                  type="url"
                  placeholder="Paste image URL..."
                  value={formData.image}
                  onChange={(e) => handleImageUrl(e.target.value)}
                  className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-secondary/30"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="event-title" className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Event Title</label>
            <input
              id="event-title"
              type="text"
              placeholder="e.g. Friday Drinks at The Golden Lion"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={`w-full bg-secondary/5 border rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-secondary/30 ${errors.title ? 'border-red-500' : 'border-secondary/10'}`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-red-500 flex items-center gap-1 ml-3" role="alert">
                <AlertCircle size={12} /> {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3" id="category-label">Category</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="category-label">
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat.id}
                  role="radio"
                  aria-checked={formData.category === cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${formData.category === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-secondary/5 text-secondary/70 border border-secondary/10 hover:border-secondary/30'
                    }`}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="event-date" className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Date</label>
              <input
                id="event-date"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="event-time" className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Time</label>
              <input
                id="event-time"
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Location</label>
            <LocationPicker
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              value={formData.location}
              onChange={(loc) => {
                // If simple string update (legacy/manual typing fallback if we allowed it)
                if (typeof loc === 'string') {
                  setFormData({ ...formData, location: loc });
                } else {
                  // Update location with address and store coordinates
                  setFormData({
                    ...formData,
                    location: loc.address,
                    coordinates: { lat: loc.lat, lng: loc.lng }
                  });
                }
              }}
            />
            {errors.location && (
              <p className="text-xs text-red-500 flex items-center gap-1 ml-3" role="alert">
                <AlertCircle size={12} /> {errors.location}
              </p>
            )}
          </div>

          {/* Pricing Toggle */}
          <div className="flex bg-secondary/5 p-1.5 rounded-2xl border border-secondary/10" role="radiogroup" aria-label="Event pricing">
            <button
              role="radio"
              aria-checked={formData.type === 'free'}
              onClick={() => setFormData({ ...formData, type: 'free', price: 0 })}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'free' ? 'bg-primary text-white shadow-lg' : 'text-secondary/50'}`}
            >
              Free
            </button>
            <button
              role="radio"
              aria-checked={formData.type === 'ticketed'}
              onClick={() => setFormData({ ...formData, type: 'ticketed', price: 10 })}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'ticketed' ? 'bg-primary text-white shadow-lg' : 'text-secondary/50'}`}
            >
              Ticketed
            </button>
          </div>

          {/* Price Input */}
          <AnimatePresence>
            {formData.type === 'ticketed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label htmlFor="event-price" className="text-[10px] font-black text-secondary/50 uppercase tracking-widest ml-3">Ticket Price (£)</label>
                <input
                  id="event-price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className={`w-full bg-secondary/5 border rounded-2xl px-4 py-4 text-lg font-black focus:outline-none focus:border-primary ${errors.price ? 'border-red-500' : 'border-secondary/10'}`}
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? 'price-error' : undefined}
                />
                {errors.price && (
                  <p id="price-error" className="text-xs text-red-500 flex items-center gap-1 ml-3" role="alert">
                    <AlertCircle size={12} /> {errors.price}
                  </p>
                )}
                <p className="text-[10px] text-secondary/40 ml-3">5% platform fee applies to ticketed events</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-paper p-6 pt-4 border-t border-secondary/10">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-2xl font-black uppercase tracking-widest shadow-lg text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check size={18} />
            Publish Event
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEventModal;

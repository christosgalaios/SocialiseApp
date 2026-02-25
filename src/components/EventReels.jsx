import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, ChevronUp, ChevronDown, MapPin, Calendar, Users, Play, Pause, Upload, Image } from 'lucide-react';
import { INCLUSIVITY_TAGS } from '../data/constants';

/**
 * EventReels - Full-screen vertical reels experience for browsing events.
 * Middle reel auto-plays video/slideshow. Users swipe up/down to navigate.
 */

const ReelSlideshow = ({ images, isActive }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive, images.length]);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          alt=""
          onError={() => {
            if (images.length > 1) {
              setCurrentIndex(prev => (prev + 1) % images.length);
            }
          }}
        />
      </AnimatePresence>
      {/* Slideshow dots */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ReelCard = ({ event, isActive, onLike, isLiked, onSelect }) => {
  const [showUpload, setShowUpload] = useState(false);

  // Generate slideshow images from event image + related unsplash images
  const slideshowImages = [
    event.image,
    event.image?.replace('w=800', 'w=801'),  // slight variation to simulate multiple
    `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80`,
  ];

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-secondary">
      {/* Slideshow / Image */}
      <ReelSlideshow images={slideshowImages} isActive={isActive} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      {/* Active indicator - glowing border */}
      {isActive && (
        <div className="absolute inset-0 rounded-[32px] border-2 border-primary/50 pointer-events-none" />
      )}

      {/* Right sidebar actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className="flex flex-col items-center gap-1"
          aria-label={isLiked ? 'Unlike event' : 'Like event'}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLiked ? 'bg-primary text-white' : 'bg-white/20 text-white'}`}>
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          </div>
          <span className="text-[10px] font-bold text-white" aria-hidden="true">{event.attendees}</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={(e) => { e.stopPropagation(); onSelect(); }} aria-label="Open event chat">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <MessageCircle size={20} />
          </div>
          <span className="text-[10px] font-bold text-white" aria-hidden="true">Chat</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowUpload(!showUpload); }}
          className="flex flex-col items-center gap-1"
          aria-label={showUpload ? 'Close upload' : 'Upload media'}
        >
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Upload size={20} />
          </div>
          <span className="text-[10px] font-bold text-white" aria-hidden="true">Upload</span>
        </button>
        <button className="flex flex-col items-center gap-1" aria-label="Share event">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Share2 size={20} />
          </div>
          <span className="text-[10px] font-bold text-white" aria-hidden="true">Share</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-5 right-20 z-10" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest">{event.category}</span>
          {event.tags?.slice(0, 1).map(tagId => {
            const tag = INCLUSIVITY_TAGS.find(t => t.id === tagId);
            if (!tag) return null;
            return <span key={tagId} className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold text-white">{tag.emoji} {tag.label}</span>;
          })}
        </div>
        <h3 className="text-2xl font-black text-white mb-1.5 drop-shadow-lg tracking-tight">{event.title}</h3>
        <div className="flex items-center gap-3 text-white/80 text-xs font-bold">
          <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {event.location?.split(',')[0]}</span>
          <span className="flex items-center gap-1"><Users size={12} /> {event.attendees}</span>
        </div>
        <p className="text-white/60 text-xs font-medium mt-2">by {event.host}</p>
      </div>

      {/* Upload overlay */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-4 bottom-40 z-20 bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-black text-secondary text-lg mb-4">Share a Moment</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all">
                <Play size={24} />
                <span className="text-xs font-bold">Upload Video</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all">
                <Image size={24} />
                <span className="text-xs font-bold">Upload Photo</span>
              </button>
            </div>
            <button onClick={() => setShowUpload(false)} className="w-full mt-3 py-2 text-xs font-bold text-secondary/50">Cancel</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play indicator for active reel */}
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 px-2.5 py-1 bg-primary/90 rounded-full flex items-center gap-1.5 z-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Playing</span>
        </motion.div>
      )}
    </div>
  );
};

const EventReels = ({ events, onClose, onSelectEvent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedEvents, setLikedEvents] = useState([]);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const isAnimating = useRef(false);

  const handleNext = () => {
    if (isAnimating.current) return;
    if (currentIndex < events.length - 1) {
      isAnimating.current = true;
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isAnimating.current) return;
    if (currentIndex > 0) {
      isAnimating.current = true;
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = 0;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) handleNext();
      else handlePrev();
    }
  };

  const handleTouchCancel = () => {
    touchStartY.current = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < events.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, events.length, onClose]);

  const toggleLike = (eventId) => {
    setLikedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 relative z-20">
        <h2 className="text-white font-black text-lg tracking-tight">Reels</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="Close reels"
        >
          <X size={20} />
        </button>
      </div>

      {/* Reels container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden px-4 pb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Nav buttons */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white disabled:opacity-20 transition-opacity"
          aria-label="Previous reel"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === events.length - 1}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white disabled:opacity-20 transition-opacity"
          aria-label="Next reel"
        >
          <ChevronDown size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onAnimationComplete={() => { isAnimating.current = false; }}
            className="w-full h-full"
          >
            {events[currentIndex] && (
              <ReelCard
                event={events[currentIndex]}
                isActive={true}
                isLiked={likedEvents.includes(events[currentIndex].id)}
                onLike={() => toggleLike(events[currentIndex].id)}
                onSelect={() => onSelectEvent(events[currentIndex])}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          {events.slice(0, 8).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${i === currentIndex ? 'h-6 bg-primary' : 'h-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EventReels;

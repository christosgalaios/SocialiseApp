import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Heart, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ADVERTISED_EVENTS } from '../data/constants';

/**
 * CuratedIntroCard - First card in the wall, personalized message
 */
const CuratedIntroCard = ({ userName = "You" }) => (
    <motion.div
        className="relative snap-center shrink-0 w-[280px] h-[400px] rounded-[32px] overflow-hidden cursor-pointer group shadow-2xl bg-gradient-to-br from-primary/90 to-secondary/90"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
    >
        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
        <div className="absolute bottom-20 left-8 w-16 h-16 bg-accent/20 rounded-full blur-xl" aria-hidden="true" />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm"
            >
                <Wand2 className="text-white" size={28} />
            </motion.div>

            <motion.h3
                className="text-2xl font-black text-white mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Picked for {userName}
            </motion.h3>

            <motion.p
                className="text-white/80 text-sm font-medium leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Based on your interests and connections, these experiences are calling your name.
            </motion.p>

            <motion.div
                className="mt-8 flex items-center gap-2 text-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <Heart size={16} className="fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">Swipe to explore</span>
            </motion.div>
        </div>
    </motion.div>
);

const VideoCard = ({ ad, onSelect, muted, onToggleMute, isSponsored = true }) => {
    const videoRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);

    // Global pointer-up listener ensures press resets even when finger drags off the card
    useEffect(() => {
        if (!isPressed) return;
        const release = () => setIsPressed(false);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        return () => {
            window.removeEventListener('pointerup', release);
            window.removeEventListener('pointercancel', release);
        };
    }, [isPressed]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
            videoRef.current.muted = muted;
        }
    }, [muted]);

    useEffect(() => {
        const playVideo = async () => {
            try {
                if (videoRef.current) {
                    await videoRef.current.play();
                }
            } catch (err) {
                console.warn("Autoplay failed:", err);
            }
        };
        playVideo();
    }, []);

    return (
        <motion.div
            layoutId={`video-${ad.id}`}
            onClick={() => onSelect(ad.eventId)}
            className="relative snap-center shrink-0 w-[280px] h-[400px] rounded-[32px] overflow-hidden cursor-pointer group shadow-2xl bg-secondary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: isPressed ? 0.98 : 1 }}
            transition={{ scale: { type: 'spring', stiffness: 400, damping: 25 } }}
            whileHover={!isPressed ? { scale: 1.02 } : undefined}
            onPointerDown={() => setIsPressed(true)}
        >
            <video
                ref={videoRef}
                src={ad.video}
                poster={ad.thumbnail}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                playsInline
                loop
                muted={muted}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

            {/* Top badges row */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                {/* Real People or Sponsored badge */}
                {isSponsored ? (
                    <span className="text-[9px] font-black bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Sponsored
                    </span>
                ) : (
                    <span className="text-[9px] font-black bg-green-500/90 text-white px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Heart size={10} className="fill-current" /> Real People
                    </span>
                )}

                {/* Mute Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute();
                    }}
                    className="w-10 h-10 rounded-full bg-secondary/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-paper/20 transition-colors focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    title={muted ? 'Unmute' : 'Mute'}
                >
                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-20 pointer-events-none">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary shadow-black drop-shadow-md">{ad.organizer}</p>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-xl text-white">{ad.title}</h3>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center">
                            <Play size={12} className="text-secondary ml-0.5" fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-white">Tap to view • {ad.attendees || 32} attending</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const VideoWall = ({ onEventSelect, userName = "You" }) => {
    const scrollRef = useRef(null);
    const interactionTimeoutRef = useRef(null);
    const touchStartRef = useRef(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [muted, setMuted] = useState(true);

    // Include intro card in total items
    const totalItems = ADVERTISED_EVENTS.length + 1;

    // Softer auto-scroll logic (7s instead of 5s)
    useEffect(() => {
        let interval;
        if (!isInteracting) {
            interval = setInterval(() => {
                if (scrollRef.current) {
                    const nextIndex = (activeIndex + 1) % totalItems;
                    setActiveIndex(nextIndex);

                    const cardWidth = 280;
                    const gap = 16;

                    scrollRef.current.scrollTo({
                        left: nextIndex * (cardWidth + gap),
                        behavior: 'smooth'
                    });
                }
            }, 7000); // Slower: 7 seconds
        }
        return () => clearInterval(interval);
    }, [isInteracting, activeIndex, totalItems]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const cardWidth = 280;
            const gap = 16;
            const index = Math.round(scrollLeft / (cardWidth + gap));
            setActiveIndex(Math.min(index, totalItems - 1));
        }
    };

    // Pause longer after interaction (5s instead of 3s)
    const handleInteractionEnd = () => {
        if (interactionTimeoutRef.current) {
            clearTimeout(interactionTimeoutRef.current);
        }
        interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 5000);
    };

    const scrollTo = (direction) => {
        if (!scrollRef.current) return;
        setIsInteracting(true);
        const nextIndex = direction === 'left'
            ? Math.max(0, activeIndex - 1)
            : Math.min(totalItems - 1, activeIndex + 1);
        setActiveIndex(nextIndex);
        const cardWidth = 280;
        const gap = 16;
        scrollRef.current.scrollTo({
            left: nextIndex * (cardWidth + gap),
            behavior: 'smooth'
        });
        handleInteractionEnd();
    };

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold tracking-tight text-secondary">Trending Now</h2>
                <div className="flex items-center gap-3">
                    {/* Nav arrows */}
                    <button
                        onClick={() => scrollTo('left')}
                        disabled={activeIndex === 0}
                        className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-secondary/10 disabled:hover:text-secondary disabled:hover:border-secondary/15 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                        aria-label="Previous card"
                        title="Previous card"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => scrollTo('right')}
                        disabled={activeIndex === totalItems - 1}
                        className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-secondary/10 disabled:hover:text-secondary disabled:hover:border-secondary/15 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                        aria-label="Next card"
                        title="Next card"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                    {/* Progress dots */}
                    {Array.from({ length: Math.min(totalItems, 5) }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-primary w-4' : 'bg-secondary/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onTouchStart={(e) => {
                    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }}
                onTouchEnd={(e) => {
                    if (touchStartRef.current) {
                        const touch = e.changedTouches[0];
                        const dx = Math.abs(touch.clientX - touchStartRef.current.x);
                        const dy = Math.abs(touch.clientY - touchStartRef.current.y);
                        // Only treat as horizontal interaction if swipe was mostly horizontal
                        if (dx > dy && dx > 10) {
                            setIsInteracting(true);
                            handleInteractionEnd();
                        }
                        touchStartRef.current = null;
                    }
                }}
                onMouseEnter={() => setIsInteracting(true)}
                onMouseLeave={handleInteractionEnd}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-4"
                style={{ touchAction: 'pan-x' }}
            >
                {/* Curated intro card first */}
                <CuratedIntroCard userName={userName} />

                {/* Video cards */}
                {ADVERTISED_EVENTS.map((ad, index) => (
                    <VideoCard
                        key={ad.id}
                        ad={ad}
                        onSelect={onEventSelect}
                        muted={muted}
                        onToggleMute={() => setMuted(!muted)}
                        isSponsored={index < 2} // First 2 are sponsored, rest are "Real People"
                    />
                ))}
            </div>
        </div>
    );
};

export default VideoWall;

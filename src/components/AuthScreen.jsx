import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Mango from './Mango';

// Testimonials from community members
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah K.",
    text: "I moved to London last year and felt so isolated. Socialise helped me find my people — we do coffee every Sunday now!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Marcus T.",
    text: "The micro-meets are genius. Small groups, real conversations. Made three genuine friends in my first month.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    name: "Priya D.",
    text: "As an introvert, I was scared. But everyone here gets it. The events are designed for people like me.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  }
];

const AuthScreen = ({ onLogin }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mangoMessage, setMangoMessage] = useState("Ready to meet your tribe? 🐱");

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update Mango's message based on testimonial
  useEffect(() => {
    const messages = [
      "Ready to meet your tribe? 🐱",
      "Everyone's welcome here!",
      "I'll help you find friends!"
    ];
    setMangoMessage(messages[activeTestimonial]);
  }, [activeTestimonial]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      key="auth-screen"
      className="fixed inset-0 z-[500] bg-paper flex flex-col p-8 md:p-10 relative overflow-hidden text-dark"
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5%] left-[-5%] w-60 h-60 bg-secondary/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -15, 0],
          y: [0, 15, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-40 h-40 bg-accent/5 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Header with logo */}
      <header className="mb-8 pt-6 md:pt-10">
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg text-white">
            <Crown size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-secondary">Socialise.</span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-heading font-black leading-[1.1] tracking-tighter mb-4 text-secondary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Building <span className="text-primary">Communities,</span><br />
          Creating Connections.
        </motion.h2>

        <motion.p
          className="text-secondary/60 font-medium text-base md:text-lg leading-relaxed max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Join the curated movement of local micro-gatherings and authentic connection.
        </motion.p>
      </header>

      {/* Testimonial Carousel */}
      <motion.div
        className="flex-1 flex flex-col justify-center -mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
          {/* Carousel container */}
          <div className="premium-card p-6 md:p-8 relative overflow-hidden">
            {/* Quote icon */}
            <div className="absolute top-4 right-4 text-primary/20">
              <Quote size={40} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={TESTIMONIALS[activeTestimonial].avatar}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-lg"
                    alt={TESTIMONIALS[activeTestimonial].name}
                  />
                  <div>
                    <p className="font-bold text-secondary">{TESTIMONIALS[activeTestimonial].name}</p>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Community Member</p>
                  </div>
                </div>
                <p className="text-secondary/80 font-medium italic leading-relaxed text-sm md:text-base">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial
                    ? 'bg-primary w-6'
                    : 'bg-secondary/20 hover:bg-secondary/40'
                    }`}
                />
              ))}
            </div>

            {/* Arrow navigation (desktop) */}
            <button
              onClick={prevTestimonial}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg items-center justify-center text-secondary/60 hover:text-secondary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextTestimonial}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg items-center justify-center text-secondary/60 hover:text-secondary transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mango waving in corner */}
      <motion.div
        className="absolute bottom-48 right-4 md:bottom-56 md:right-8"
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <Mango
          pose="wave"
          size={80}
          message={mangoMessage}
        />
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="mt-auto space-y-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={() => onLogin('google')}
          className="w-full py-5 bg-white border border-secondary/10 rounded-full flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all text-sm font-black uppercase tracking-widest text-secondary hover:shadow-2xl hover:border-primary/20"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-6 h-6" alt="google" />
          Continue with Google
        </button>

        <p className="text-center text-[10px] text-secondary/40 font-bold px-10 leading-relaxed italic opacity-80">
          By continuing, you agree to our <span className="underline decoration-primary cursor-pointer hover:text-primary transition-colors">Community Pact</span> and friendly guidelines.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AuthScreen;

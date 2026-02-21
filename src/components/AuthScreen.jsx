import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ChevronLeft, ChevronRight, Quote, Mail, Lock, User, AlertCircle } from 'lucide-react';

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
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await onLogin(
        isRegister ? 'register' : 'login',
        { email: email.trim(), password, name: name.trim() }
      );
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      key="auth-screen"
      className="fixed inset-0 z-[500] bg-paper flex flex-col p-8 md:p-10 relative overflow-hidden overflow-y-auto text-dark"
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5%] left-[-5%] w-60 h-60 bg-secondary/10 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Header */}
      <header className="mb-6 pt-6 md:pt-10">
        <motion.div
          className="flex items-center gap-3 mb-6"
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
          className="text-3xl md:text-5xl font-heading font-black leading-[1.1] tracking-tighter mb-3 text-secondary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Building <span className="text-primary">Communities,</span><br />
          Creating Connections.
        </motion.h2>

        <motion.p
          className="text-secondary/60 font-medium text-sm md:text-base leading-relaxed max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Join the curated movement of local micro-gatherings and authentic connection.
        </motion.p>
      </header>

      {/* Testimonial Carousel — compact */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="premium-card p-5 relative overflow-hidden">
          <div className="absolute top-3 right-3 text-primary/20"><Quote size={28} /></div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={TESTIMONIALS[activeTestimonial].avatar} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow" alt={TESTIMONIALS[activeTestimonial].name} />
                <div>
                  <p className="font-bold text-secondary text-sm">{TESTIMONIALS[activeTestimonial].name}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Community Member</p>
                </div>
              </div>
              <p className="text-secondary/80 font-medium italic leading-relaxed text-xs">
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-5' : 'bg-secondary/20'}`}
              />
            ))}
          </div>
          <button onClick={prevTestimonial} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow items-center justify-center text-secondary/60 hover:text-secondary"><ChevronLeft size={16} /></button>
          <button onClick={nextTestimonial} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow items-center justify-center text-secondary/60 hover:text-secondary"><ChevronRight size={16} /></button>
        </div>
      </motion.div>

      {/* Login / Register Form */}
      <motion.div
        className="mt-auto space-y-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                key="name"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white border border-secondary/10 text-[var(--text)] font-medium text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white border border-secondary/10 text-[var(--text)] font-medium text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white border border-secondary/10 text-[var(--text)] font-medium text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              required
              minLength={6}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-3"
              >
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-primary to-accent rounded-full shadow-xl active:scale-95 transition-all text-sm font-black uppercase tracking-widest text-white hover:shadow-2xl disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              isRegister ? 'Create Account' : 'Log In'
            )}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); setName(''); setError(''); }}
          className="w-full py-3 text-center text-xs font-bold text-secondary/60 hover:text-primary transition-colors"
        >
          {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>

        <p className="text-center text-[10px] text-secondary/40 font-bold px-10 leading-relaxed italic opacity-80">
          By continuing, you agree to our <span className="underline decoration-primary cursor-pointer hover:text-primary transition-colors">Community Pact</span> and friendly guidelines.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AuthScreen;

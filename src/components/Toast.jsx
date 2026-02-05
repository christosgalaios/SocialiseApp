import { motion } from 'framer-motion';
import { Check, Bell, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ y: -50, opacity: 0, scale: 0.9 }} 
    animate={{ y: 20, opacity: 1, scale: 1 }} 
    exit={{ y: -50, opacity: 0, scale: 0.9 }}
    className="fixed top-0 left-5 right-5 z-[200] flex justify-center pointer-events-none"
  >
    {/* Pointer events auto so we can click X, but surrounding area passes through */}
    <div className={`pointer-events-auto px-6 py-4 glass-2 rounded-[24px] shadow-2xl flex items-center gap-4 border-l-4 ${type === 'success' ? 'border-primary' : 'border-accent'}`}>
       {type === 'success' ? <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Check size={18} strokeWidth={3}/></div> : <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent"><Bell size={18} strokeWidth={3}/></div>}
       <span className="text-sm font-bold tracking-tight">{message}</span>
       <button onClick={onClose} className="ml-2 opacity-30 hover:opacity-100 transition-opacity"><X size={16}/></button>
    </div>
  </motion.div>
);

export default Toast;

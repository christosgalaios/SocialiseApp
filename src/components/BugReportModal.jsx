import { useState } from 'react';
import { Bug, X, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

export default function BugReportModal({ isOpen, onClose, onSubmit }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(onClose, isOpen);

  const handleSubmit = async () => {
    if (!description.trim()) return setError('Please describe the bug');
    if (description.trim().length < 10) return setError('Please provide a bit more detail');

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ description: description.trim() });
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit bug report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-secondary/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Report a bug"
    >
      <motion.div
        ref={focusTrapRef}
        className="w-full max-w-md bg-paper rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 border-t sm:border border-secondary/10 shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bug size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-secondary">Report a Bug</h2>
              <p className="text-[10px] text-secondary/50 font-medium">Something broken? Let us know</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center" aria-label="Close bug report">
            <X size={16} className="text-secondary/60" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">What went wrong?</label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); if (error) setError(''); }}
              placeholder={"Describe the bug and when it happens...\n\ne.g. \"Chat messages disappear after sending in the event detail page\" or \"Profile photo doesn't save when I crop and confirm\""}
              rows={5}
              maxLength={2000}
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
            />
            <p className="text-[10px] text-secondary/30 mt-1 text-right">{description.length}/2000</p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 px-4 py-2.5 rounded-xl"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="w-full py-3.5 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <Send size={16} />
                Submit
              </>
            )}
          </button>

          <p className="text-[9px] text-secondary/40 text-center leading-relaxed">
            Priority is determined automatically. Only existing broken behavior will be addressed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

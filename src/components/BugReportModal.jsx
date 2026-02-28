import { useState, useMemo } from 'react';
import { Bug, X, Send, AlertCircle, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import { formatError } from '../errorUtils';
import { playSwooshClose, hapticTap } from '../utils/feedback';

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  // Detect OS
  let os = 'Unknown OS';
  if (/Android\s?([\d.]+)?/i.test(ua)) {
    os = 'Android ' + (RegExp.$1 || '').split('.').slice(0, 2).join('.');
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    const ver = ua.match(/OS\s([\d_]+)/);
    os = 'iOS ' + (ver ? ver[1].replace(/_/g, '.').split('.').slice(0, 2).join('.') : '');
  } else if (/Mac OS X\s?([\d_.]+)?/.test(ua)) {
    os = 'macOS ' + (RegExp.$1 || '').replace(/_/g, '.').split('.').slice(0, 2).join('.');
  } else if (/Windows NT\s?([\d.]+)?/.test(ua)) {
    const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    os = 'Windows ' + (winMap[RegExp.$1] || RegExp.$1 || '');
  } else if (/CrOS/.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Detect browser
  let browser = 'Unknown Browser';
  if (/EdgA?\/([\d.]+)/.test(ua)) {
    browser = 'Edge ' + RegExp.$1.split('.').slice(0, 2).join('.');
  } else if (/SamsungBrowser\/([\d.]+)/.test(ua)) {
    browser = 'Samsung Browser ' + RegExp.$1.split('.')[0];
  } else if (/OPR\/([\d.]+)|Opera\/([\d.]+)/.test(ua)) {
    browser = 'Opera ' + (RegExp.$1 || RegExp.$2).split('.')[0];
  } else if (/CriOS\/([\d.]+)/.test(ua)) {
    browser = 'Chrome ' + RegExp.$1.split('.')[0];
  } else if (/FxiOS\/([\d.]+)/.test(ua)) {
    browser = 'Firefox ' + RegExp.$1.split('.')[0];
  } else if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) {
    browser = 'Chrome ' + RegExp.$1.split('.')[0];
  } else if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) {
    const safVer = ua.match(/Version\/([\d.]+)/);
    browser = 'Safari ' + (safVer ? safVer[1].split('.').slice(0, 2).join('.') : '');
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = 'Firefox ' + RegExp.$1.split('.')[0];
  }

  // Detect device type
  let device = 'Desktop';
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    device = 'Mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    device = 'Tablet';
  }

  return `${os.trim()} / ${browser.trim()} / ${device}`;
}

export default function BugReportModal({ isOpen, onClose, onSubmit }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(onClose, isOpen);
  const { sheetY, dragZoneProps } = useSwipeToClose(onClose);
  const platformInfo = useMemo(() => detectPlatform(), []);

  const handleSubmit = async () => {
    if (!description.trim()) return setError('Please describe the bug');
    if (description.trim().length < 30) return setError('Please provide a bit more detail — a couple of sentences helps a lot');

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ description: description.trim(), platform: platformInfo });
      setDescription('');
      onClose();
    } catch (err) {
      setError(formatError(err, 'Failed to submit bug report'));
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
        className="w-full max-w-md max-h-[85dvh] overflow-y-auto overscroll-contain bg-paper rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 border-t sm:border border-secondary/10 shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ y: sheetY }}
      >
        {/* Drag zone — handle + header */}
        <div {...dragZoneProps}>
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-secondary/20" /></div>

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
          <button onPointerDown={(e) => { e.stopPropagation(); playSwooshClose(); hapticTap(); onClose(); }} className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none" aria-label="Close bug report" style={{ touchAction: 'manipulation' }}>
            <X size={18} className="text-secondary/60" />
          </button>
        </div>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">What went wrong?</label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); if (error) setError(''); }}
              placeholder={"What happened? What did you expect instead?\n\ne.g. \"I tapped 'Join' on an event and the button spun forever — the RSVP never confirmed.\""}
              rows={4}
              maxLength={2000}
              className="w-full bg-paper border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none break-words"
              style={{ overflowWrap: 'break-word' }}
            />
            <p className="text-[10px] text-secondary/30 mt-1 text-right">{description.length}/2000</p>
          </div>

          {/* Auto-detected platform */}
          <div className="flex items-center gap-2 bg-secondary/5 border border-secondary/10 rounded-xl px-3 py-2.5">
            <Monitor size={14} className="text-secondary/40 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Platform</p>
              <p className="text-xs font-medium text-secondary/70 truncate">{platformInfo}</p>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 px-4 py-2.5 rounded-xl"
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
            className="w-full py-3.5 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
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
            The more detail you give (what, where, when), the faster it gets fixed. Priority is determined automatically.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

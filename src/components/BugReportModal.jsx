import { useState } from 'react';
import { Bug, X, Send, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const AREA_OPTIONS = [
  'Frontend - UI/Components',
  'Frontend - State Management',
  'Backend - API Routes',
  'Backend - Database Queries',
  'Auth - Login/Register',
  'UI/Design - Styling/Layout',
];

const SEVERITY_OPTIONS = [
  { value: 'P1', label: 'P1 - Critical', description: 'App crashes, data loss, auth broken' },
  { value: 'P2', label: 'P2 - Major', description: 'Feature broken, wrong data shown' },
  { value: 'P3', label: 'P3 - Minor', description: 'Visual glitch, edge case, typo' },
];

const initialForm = {
  area: '',
  severity: '',
  steps: '',
  expected: '',
  actual: '',
  component: '',
  context: '',
};

export default function BugReportModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(onClose, isOpen);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!form.area) return setError('Please select the affected area');
    if (!form.severity) return setError('Please select a severity level');
    if (!form.steps.trim()) return setError('Please describe steps to reproduce');
    if (!form.expected.trim()) return setError('Please describe expected behavior');
    if (!form.actual.trim()) return setError('Please describe actual behavior');

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      setForm(initialForm);
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
        className="w-full max-w-lg bg-paper rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 max-h-[90vh] overflow-y-auto no-scrollbar border-t sm:border border-secondary/10 shadow-2xl"
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
              <p className="text-[10px] text-secondary/50 font-medium">Bugs only — not feature requests</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center" aria-label="Close bug report">
            <X size={16} className="text-secondary/60" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Area dropdown */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Affected Area *</label>
            <div className="relative">
              <select
                value={form.area}
                onChange={e => updateField('area', e.target.value)}
                className="w-full appearance-none bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              >
                <option value="">Select area...</option>
                {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none" />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Severity *</label>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateField('severity', s.value)}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    form.severity === s.value
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-white border-secondary/10 text-secondary/60 hover:border-secondary/20'
                  }`}
                >
                  {s.value}
                  <span className="block text-[9px] font-medium mt-0.5 opacity-70">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Steps to reproduce */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Steps to Reproduce *</label>
            <textarea
              value={form.steps}
              onChange={e => updateField('steps', e.target.value)}
              placeholder={"1. Log in as...\n2. Navigate to...\n3. Click on..."}
              rows={3}
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
            />
          </div>

          {/* Expected behavior */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Expected Behavior *</label>
            <textarea
              value={form.expected}
              onChange={e => updateField('expected', e.target.value)}
              placeholder="What should happen?"
              rows={2}
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
            />
          </div>

          {/* Actual behavior */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Actual Behavior *</label>
            <textarea
              value={form.actual}
              onChange={e => updateField('actual', e.target.value)}
              placeholder="What actually happens?"
              rows={2}
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
            />
          </div>

          {/* Component (optional) */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Affected Component <span className="text-secondary/40 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.component}
              onChange={e => updateField('component', e.target.value)}
              placeholder="e.g. EventDetailSheet, HomeTab"
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
            />
          </div>

          {/* Additional context (optional) */}
          <div>
            <label className="text-xs font-bold text-secondary/70 mb-1.5 block">Additional Context <span className="text-secondary/40 font-normal">(optional)</span></label>
            <textarea
              value={form.context}
              onChange={e => updateField('context', e.target.value)}
              placeholder="Browser, device, console errors..."
              rows={2}
              className="w-full bg-white border border-secondary/10 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none"
            />
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
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <Send size={16} />
                Submit Bug Report
              </>
            )}
          </button>

          <p className="text-[9px] text-secondary/40 text-center leading-relaxed">
            Bug reports are reviewed by an automated agent that will attempt to validate and fix the issue.
            Only existing broken behavior will be addressed — feature requests will be closed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

const EmailVerificationModal = ({ email, verificationCode, onVerify, onSkip }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onVerify(email, code);
      setSuccess(true);
      setTimeout(onSkip, 1500); // Auto-close after success animation
    } catch (err) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>
          <h3 className="text-2xl font-black mb-2 text-secondary">Email Verified!</h3>
          <p className="text-secondary/60 text-sm">Welcome to Socialise. You're all set!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl"
      >
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-primary" />
        </div>

        <h3 className="text-2xl font-black text-center mb-2">Verify Your Email</h3>
        <p className="text-secondary/60 text-center text-sm mb-6">
          We sent a code to <span className="font-bold text-secondary">{email}</span>
        </p>

        {process.env.NODE_ENV !== 'production' && verificationCode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
            <p className="text-[11px] font-bold text-yellow-900 uppercase tracking-wider mb-1">Dev Mode</p>
            <p className="text-sm font-mono font-bold text-yellow-900">Code: <span className="text-lg">{verificationCode}</span></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.slice(0, 6));
                setError('');
              }}
              className="w-full py-3 px-4 rounded-xl bg-secondary/5 border border-secondary/10 text-[var(--text)] font-bold text-2xl text-center tracking-widest font-mono focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3"
            >
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-primary rounded-xl font-black text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Verify Email'
            )}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 text-center text-xs font-bold text-secondary/60 hover:text-secondary transition-colors"
          >
            Skip for now
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;

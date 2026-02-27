import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check } from 'lucide-react';
import { ORGANISER_VIBE_TAGS } from '../data/constants';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import { playTap, playSuccess, playSwooshClose, hapticTap } from '../utils/feedback';
import useUIStore from '../stores/uiStore';
import useAuthStore from '../stores/authStore';
import api from '../api';

export default function OrganiserReviewSheet() {
  const reviewData = useUIStore((s) => s.showOrganiserReview);
  const setShowOrganiserReview = useUIStore((s) => s.setShowOrganiserReview);
  const showToast = useUIStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);

  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const close = () => {
    playSwooshClose();
    setShowOrganiserReview(null);
  };

  useEscapeKey(!!reviewData, close);
  const focusTrapRef = useFocusTrap(!!reviewData);
  const { sheetY, dragZoneProps } = useSwipeToClose(close);

  // Load existing review if any
  useEffect(() => {
    if (!reviewData?.organiserId || !user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.getOrganiserReviews(reviewData.organiserId)
      .then(data => {
        if (cancelled) return;
        const myReview = data.reviews?.find(r => r.reviewerId === user.id);
        if (myReview) {
          setExistingReview(myReview);
          setSelectedTags(myReview.tags || []);
          setComment(myReview.comment || '');
        }
      })
      .catch(() => { /* silent */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reviewData?.organiserId, user?.id]);

  const toggleTag = (tagId) => {
    playTap(); hapticTap();
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : prev.length < 5 ? [...prev, tagId] : prev
    );
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.submitOrganiserReview(reviewData.organiserId, {
        tags: selectedTags,
        comment: comment.trim(),
      });
      playSuccess(); hapticTap();
      showToast(existingReview ? 'Review updated!' : 'Review submitted!', 'success');
      close();
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.deleteOrganiserReview(reviewData.organiserId);
      hapticTap();
      showToast('Review removed', 'info');
      close();
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reviewData) return null;

  return (
    <AnimatePresence>
      {reviewData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-secondary/60 backdrop-blur-sm flex items-end md:items-center justify-center"
          onPointerDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            ref={focusTrapRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            style={{ y: sheetY }}
            className="bg-paper rounded-t-[32px] md:rounded-[32px] w-full md:max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Review ${reviewData.organiserName || 'organiser'}`}
          >
            {/* Drag handle */}
            <div {...dragZoneProps} className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-secondary/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between border-b border-secondary/10">
              <div>
                <h2 className="text-lg font-black text-secondary">
                  {existingReview ? 'Edit Your Review' : 'Leave a Review'}
                </h2>
                <p className="text-[11px] text-secondary/40 font-medium mt-0.5">
                  How was your experience with {reviewData.organiserName || 'this organiser'}?
                </p>
              </div>
              <button
                onPointerDown={() => { playTap(); close(); }}
                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                aria-label="Close"
              >
                <X size={20} className="text-secondary/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" style={{ overscrollBehavior: 'contain' }}>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-32 bg-secondary/10 rounded-full animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 w-24 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />)}
                  </div>
                  <div className="h-4 w-24 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="h-20 bg-secondary/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
              ) : (
                <>
                  {/* Vibe Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest">
                        Vibe Tags<span className="text-accent">.</span>
                      </h4>
                      <span className={`text-[10px] font-bold transition-colors ${selectedTags.length > 0 ? 'text-primary' : 'text-secondary/30'}`}>
                        {selectedTags.length}/5 selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ORGANISER_VIBE_TAGS.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                              isSelected
                                ? `${tag.color} ring-2 ring-primary/20 shadow-sm`
                                : 'bg-secondary/5 text-secondary/50 border-secondary/10 hover:bg-secondary/10'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{tag.emoji}</span>
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Comment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest">
                        Comment<span className="text-accent">.</span>
                      </h4>
                      <span className="text-[10px] text-secondary/30 font-medium">Optional</span>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share a quick thought about this organiser..."
                      maxLength={200}
                      rows={3}
                      className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-secondary/20 transition-all placeholder:text-secondary/30 text-[var(--text)] resize-none break-words"
                      style={{ overflowWrap: 'break-word' }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-0.5 bg-secondary/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${comment.length > 180 ? 'bg-amber-500/60' : 'bg-primary/40'}`}
                          style={{ width: `${Math.min((comment.length / 200) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${comment.length > 180 ? 'text-amber-500' : 'text-secondary/30'}`}>{comment.length}/200</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary/10 pb-[max(24px,env(safe-area-inset-bottom))] flex gap-3">
              {existingReview && (
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-3 rounded-2xl bg-red-500/10 text-red-600 text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:outline-none"
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={selectedTags.length === 0 || isSubmitting}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent text-white shadow-lg focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    {existingReview ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

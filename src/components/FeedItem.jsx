import { useState } from 'react';
import { Heart, MessageCircle, Send, Smile, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_AVATAR } from '../data/constants';

const EMOJI_OPTIONS = ['❤️', '😂', '🔥', '👏', '😮', '😢'];

// Mock initial comments - reactions stored as { emoji: [userIds] }
const INITIAL_COMMENTS = {
  1: [
    {
      id: 1, user: 'Sarah K.', avatar: 'https://i.pravatar.cc/150?u=sarah',
      text: 'Yes! It was amazing 🔥', time: '10m ago', reactions: { '🔥': ['sarah', 'tom'], '❤️': ['elena'] },
      replies: [
        { id: 101, user: 'Marcus V.', avatar: 'https://i.pravatar.cc/150?u=marcus', text: 'Totally agree!', time: '8m ago', reactions: {} }
      ]
    },
    { id: 2, user: 'James M.', avatar: 'https://i.pravatar.cc/150?u=james', text: 'Link please?', time: '8m ago', reactions: {}, replies: [] },
    { id: 3, user: 'Elena P.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'Game changer for our workflow', time: '5m ago', reactions: { '👏': ['sarah', 'tom', 'marcus'] }, replies: [] },
  ],
  2: [
    {
      id: 1, user: 'Tom H.', avatar: 'https://i.pravatar.cc/150?u=tom',
      text: 'Stunning view! Where is this?', time: '45m ago', reactions: { '😮': ['sarah', 'marcus'] },
      replies: [
        { id: 201, user: 'Elena P.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'Peak District!', time: '40m ago', reactions: { '❤️': ['tom'] } }
      ]
    },
    { id: 2, user: 'Marcus V.', avatar: 'https://i.pravatar.cc/150?u=marcus', text: 'Need to join next time!', time: '30m ago', reactions: { '❤️': ['elena'] }, replies: [] },
  ],
  3: [
    { id: 1, user: 'Elena P.', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'Count me in!', time: '2h ago', reactions: { '🔥': ['tom'] }, replies: [] },
    { id: 2, user: 'Sarah K.', avatar: 'https://i.pravatar.cc/150?u=sarah', text: 'Love Wingspan 🦅', time: '1h ago', reactions: { '❤️': ['tom', 'marcus', 'elena', 'james'] }, replies: [] },
  ],
  4: [
    {
      id: 1, user: 'James M.', avatar: 'https://i.pravatar.cc/150?u=james',
      text: 'Congrats Sarah!! 🎉', time: '4h ago', reactions: { '👏': ['sarah', 'tom', 'marcus', 'elena'], '❤️': ['tom', 'elena'] },
      replies: [
        { id: 401, user: 'Sarah K.', avatar: 'https://i.pravatar.cc/150?u=sarah', text: 'Thank you so much! 🥹', time: '3h ago', reactions: { '❤️': ['james', 'tom'] } }
      ]
    },
    { id: 2, user: 'Tom H.', avatar: 'https://i.pravatar.cc/150?u=tom', text: 'Well deserved!', time: '3h ago', reactions: { '🔥': ['sarah'] }, replies: [] },
  ],
};

const CommentItem = ({ comment, onReact, onReply, isReply = false, currentUser, myReaction, onOpenProfile }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const hasReactions = Object.entries(comment.reactions || {}).some(([, users]) => users.length > 0);
  const hasReplies = !isReply && comment.replies && comment.replies.length > 0;

  const submitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const isCurrentUser = currentUser?.name && comment.user === currentUser.name;
  const handleProfileClick = () => {
    if (onOpenProfile && !isCurrentUser) onOpenProfile({ name: comment.user, avatar: comment.avatar });
  };

  return (
    <div className={`flex gap-2 group/comment ${isReply ? 'ml-10' : ''}`}>
      {onOpenProfile && !isCurrentUser ? (
        <button type="button" onClick={handleProfileClick} className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30">
          <img src={comment.avatar || DEFAULT_AVATAR} alt={comment.user} className={`rounded-full object-cover border border-secondary/10 ${isReply ? 'w-6 h-6' : 'w-8 h-8'}`} loading="lazy" />
        </button>
      ) : (
        <img src={comment.avatar || DEFAULT_AVATAR} alt={comment.user} className={`rounded-full object-cover border border-secondary/10 flex-shrink-0 ${isReply ? 'w-6 h-6' : 'w-8 h-8'}`} loading="lazy" />
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/5 rounded-2xl px-3 py-2 relative">
          {onOpenProfile && !isCurrentUser ? (
            <button type="button" onClick={handleProfileClick} className="text-xs font-bold text-secondary hover:text-primary transition-colors text-left">
              {comment.user}
            </button>
          ) : (
            <span className="text-xs font-bold text-secondary">{comment.user}</span>
          )}
          <p className="text-sm text-secondary/80">{comment.text}</p>

          {/* Emoji picker trigger */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-paper border border-secondary/20 flex items-center justify-center opacity-0 group-hover/comment:opacity-100 transition-opacity hover:bg-secondary/10"
            aria-label="React with emoji"
          >
            <Smile size={10} className="text-secondary/60" />
          </button>
        </div>

        {/* Emoji picker - outside the bubble */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-end mt-1"
            >
              <div className="bg-paper border border-secondary/20 rounded-full px-1.5 py-0.5 flex gap-0.5 shadow-lg">
                {EMOJI_OPTIONS.map(emoji => {
                  const isMyReaction = myReaction === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(comment.id, emoji, isReply);
                        setShowEmojiPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors text-sm ${isMyReaction ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary/10'}`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reactions + time + reply button */}
        <div className="flex items-center gap-2 mt-1 ml-1 flex-wrap">
          {hasReactions && (
            <div className="flex items-center gap-0.5 bg-secondary/5 rounded-full px-1.5 py-0.5">
              {Object.entries(comment.reactions).filter(([, users]) => users.length > 0).map(([emoji, users]) => {
                const isMyReaction = myReaction === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={() => onReact(comment.id, emoji, isReply)}
                    className={`flex items-center gap-0.5 transition-transform ${isMyReaction ? 'scale-110' : 'hover:scale-110'}`}
                  >
                    <span className="text-[10px]">{emoji}</span>
                    <span className={`text-[9px] font-bold ${isMyReaction ? 'text-primary' : 'text-secondary/60'}`}>{users.length}</span>
                  </button>
                );
              })}
            </div>
          )}
          <span className="text-[10px] text-secondary/40">{comment.time}</span>
          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-[10px] font-bold text-secondary/50 hover:text-primary flex items-center gap-0.5 transition-colors"
            >
              <Reply size={10} />
              Reply
            </button>
          )}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-[10px] font-bold text-primary flex items-center gap-0.5"
            >
              {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mt-2">
                <img src={currentUser?.avatar || DEFAULT_AVATAR} alt="You" className="w-6 h-6 rounded-full object-cover" loading="lazy" />
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitReply()}
                  className="flex-1 bg-secondary/5 border border-secondary/20 rounded-xl px-3 py-1.5 text-xs text-[var(--text)] focus:outline-none focus:border-primary placeholder:text-secondary/40"
                  autoFocus
                />
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-50 text-xs"
                >
                  <Send size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Threaded replies */}
        <AnimatePresence>
          {hasReplies && showReplies && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReact={onReact}
                  onReply={() => {}}
                  isReply={true}
                  currentUser={currentUser}
                  myReaction={myReaction}
                  onOpenProfile={onOpenProfile}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FeedItem = ({ post, currentUser = { name: 'Ben B.', avatar: '/ben-avatar.png' }, onOpenProfile }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(INITIAL_COMMENTS[post.id] || []);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const [myReactions, setMyReactions] = useState({}); // { commentId: emoji }

  const handleReact = (commentId, emoji, isReply = false) => {
    const userId = 'me'; // Current user ID
    const currentReaction = myReactions[commentId];
    const isSameReaction = currentReaction === emoji;

    // Update my reactions state
    if (isSameReaction) {
      setMyReactions(prev => { const n = { ...prev }; delete n[commentId]; return n; });
    } else {
      setMyReactions(prev => ({ ...prev, [commentId]: emoji }));
    }

    const updateReactions = (reactions, oldEmoji, newEmoji, removing) => {
      const updated = { ...reactions };
      // Remove from old reaction if switching
      if (oldEmoji && updated[oldEmoji]) {
        updated[oldEmoji] = updated[oldEmoji].filter(u => u !== userId);
        if (updated[oldEmoji].length === 0) delete updated[oldEmoji];
      }
      // Add to new reaction (or remove if same)
      if (!removing) {
        updated[newEmoji] = [...(updated[newEmoji] || []), userId];
      }
      return updated;
    };

    if (isReply) {
      setComments(comments.map(c => ({
        ...c,
        replies: (c.replies || []).map(r => {
          if (r.id === commentId) {
            return { ...r, reactions: updateReactions(r.reactions, currentReaction, emoji, isSameReaction) };
          }
          return r;
        })
      })));
    } else {
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { ...c, reactions: updateReactions(c.reactions, currentReaction, emoji, isSameReaction) };
        }
        return c;
      }));
    }
  };

  const handleReply = (commentId, text) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const newReply = {
          id: Date.now(),
          user: currentUser?.name ?? 'Guest',
          avatar: currentUser?.avatar ?? '',
          text,
          time: 'Just now',
          reactions: {}
        };
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      return c;
    }));
  };

  const submitComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        user: currentUser?.name ?? 'Guest',
        avatar: currentUser?.avatar ?? '',
        text: comment.trim(),
        time: 'Just now',
        reactions: {},
        replies: []
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-5 rounded-[24px] border border-secondary/5 relative overflow-hidden group hover:bg-secondary/5 transition-colors mb-4"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-3 mb-4">
        {onOpenProfile ? (
          <button
            type="button"
            onClick={() => onOpenProfile({ name: post.user, avatar: post.avatar, community: post.community })}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-2xl -m-1 p-1"
          >
            <img src={post.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-[14px] object-cover border border-secondary/10 shadow-inner" alt={post.user} loading="lazy" />
            <div>
              <h4 className="text-sm font-black tracking-tight text-secondary">{post.user}</h4>
              <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-primary">{post.community}</span> • {post.time}
              </p>
            </div>
          </button>
        ) : (
          <>
            <img src={post.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-[14px] object-cover border border-secondary/10 shadow-inner" alt={post.user} loading="lazy" />
            <div>
              <h4 className="text-sm font-black tracking-tight text-secondary">{post.user}</h4>
              <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
                <span className="text-primary">{post.community}</span> • {post.time}
              </p>
            </div>
          </>
        )}
      </div>
      <p className="text-[15px] font-medium leading-relaxed mb-4 tracking-tight text-secondary/90">{post.content}</p>
      {post.image && (
        <div className="rounded-2xl overflow-hidden mb-4 border border-secondary/10 shadow-2xl">
          <img src={post.image} className="w-full h-56 object-cover transition-transform duration-1000 group-hover:scale-105" alt="Post content" loading="lazy" />
        </div>
      )}
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 group transition-all ${liked ? 'text-primary' : 'text-secondary/40 hover:text-primary'}`}
        >
          <motion.div
            whileTap={{ scale: 1.3 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-primary/10' : 'bg-secondary/5 group-hover:bg-primary/5'}`}
          >
            <Heart size={16} className={liked ? 'fill-current' : ''} />
          </motion.div>
          <span className="text-xs font-black">{likeCount}</span>
        </button>
        <button
          onClick={toggleComments}
          className={`flex items-center gap-2 group transition-all ${showComments ? 'text-secondary' : 'text-secondary/40 hover:text-secondary'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showComments ? 'bg-secondary/10' : 'bg-secondary/5 group-hover:bg-secondary/10'}`}>
            <MessageCircle size={16} />
          </div>
          <span className="text-xs font-black">{totalComments}</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-secondary/10">
              {/* Comments Feed */}
              {comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {comments.map((c, index) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommentItem
                        comment={c}
                        onReact={handleReact}
                        onReply={handleReply}
                        currentUser={currentUser}
                        myReaction={myReactions[c.id]}
                        onOpenProfile={onOpenProfile}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  className="flex-1 bg-secondary/5 border border-secondary/20 rounded-xl px-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-primary placeholder:text-secondary/40"
                />
                <button
                  onClick={submitComment}
                  disabled={!comment.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedItem;




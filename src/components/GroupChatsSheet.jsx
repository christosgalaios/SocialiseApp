import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft, Image, Smile, Mic, Users, Pin, Search, Phone, Video } from 'lucide-react';
import api from '../api';
import useAuthStore from '../stores/authStore';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import { DEFAULT_AVATAR } from '../data/constants';

const QUICK_REACTIONS = ['❤️', '😂', '🔥', '👏', '😮', '👍'];

const MessageBubble = ({ msg }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState(msg.reaction || null);

  return (
    <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group`}>
      <div className="max-w-[85%] relative">
        {!msg.isMe && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <img src={msg.avatar || DEFAULT_AVATAR} alt="" className="w-5 h-5 rounded-full object-cover" loading="lazy" />
            <span className="text-[10px] font-bold text-secondary/60">{msg.user}</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 relative ${
            msg.isMe
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-white border border-secondary/10 text-secondary rounded-bl-sm shadow-sm'
          }`}
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {msg.isImage ? (
            <img src={msg.message} alt="Shared" className="w-48 h-36 object-cover rounded-xl" loading="lazy" />
          ) : (
            <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className={`text-[10px] ${msg.isMe ? 'text-white/60' : 'text-secondary/40'}`}>{msg.time}</p>
            {msg.isMe && <span className="text-[10px] text-white/50 ml-2">✓✓</span>}
          </div>
          {reaction && (
            <span className="absolute -bottom-2 right-2 text-sm bg-white rounded-full px-1 shadow-sm border border-secondary/10">{reaction}</span>
          )}
        </div>

        {/* Quick reactions popup */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 left-0 bg-white rounded-full shadow-xl border border-secondary/10 flex gap-1 px-2 py-1.5 z-10"
            >
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { setReaction(emoji); setShowReactions(false); }}
                  className="w-8 h-8 rounded-full hover:bg-secondary/10 flex items-center justify-center text-lg transition-all hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function GroupChatsSheet({ isOpen, onClose, joinedCommunities = [] }) {
  const user = useAuthStore((s) => s.user);
  useEscapeKey(isOpen, onClose);
  const focusTrapRef = useFocusTrap(isOpen);
  const { sheetY, handleProps } = useSwipeToClose(onClose);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedCommunityId = selectedCommunity?.id;
  useEffect(() => {
    if (!selectedCommunityId) return;
    let cancelled = false;
    setLoading(true);
    api.getCommunityChat(selectedCommunityId).then(data => {
      if (cancelled) return;
      const mapped = (data || []).map(m => ({
        id: m.id,
        user: m.user_name,
        avatar: m.user_avatar || '',
        message: m.message,
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        isMe: m.user_id === user?.id,
      }));
      setMessages(mapped);
    }).catch(() => {
      if (!cancelled) setMessages([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedCommunityId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openCommunity = (community) => {
    setSelectedCommunity(community);
    setMessages([]);
  };

  const closeCommunity = () => {
    setSelectedCommunity(null);
    setInput('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedCommunity) return;

    const name = user?.name ?? 'Guest';
    const parts = name.split(' ');
    const displayName = `${parts[0] ?? ''} ${parts[1]?.[0] ?? ''}.`.trim() || 'Guest';

    const optimisticId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: optimisticId,
      user: displayName,
      avatar: user?.avatar ?? null,
      message: input.trim(),
      time: 'Just now',
      isMe: true,
    };

    setMessages(prev => [...prev, optimisticMsg]);
    const text = input.trim();
    setInput('');

    try {
      await api.sendCommunityMessage(selectedCommunity.id, text);
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] bg-secondary/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Group chats"
        ref={focusTrapRef}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 top-12 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{ y: sheetY }}
        >
          <div {...handleProps} className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1 rounded-full bg-secondary/20" />
          </div>

          {selectedCommunity ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-secondary/10 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeCommunity}
                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                    aria-label="Back to communities"
                  >
                    <ArrowLeft size={20} className="text-secondary" />
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-xl">
                    {selectedCommunity.avatar || '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-secondary truncate text-sm">{selectedCommunity.name}</h2>
                    <p className="text-[10px] font-bold text-secondary/50">
                      {selectedCommunity.members} members
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-secondary/20 transition-colors" aria-label="Voice call">
                      <Phone size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-secondary/20 transition-colors" aria-label="Video call">
                      <Video size={16} />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                      aria-label="Close"
                    >
                      <X size={16} className="text-secondary" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pinned message */}
              <div className="px-4 py-2 bg-accent/5 border-b border-accent/10 flex items-center gap-2 shrink-0">
                <Pin size={12} className="text-accent shrink-0" />
                <p className="text-[11px] text-secondary/60 font-medium truncate">Welcome! Please read the group rules before posting.</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/[0.02]">
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-secondary/40 py-2">
                  Today
                </div>
                {loading && messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-secondary/40">Loading messages...</p>
                  </div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users size={24} className="text-secondary/40" />
                    </div>
                    <p className="text-sm font-bold text-secondary/50">Start a conversation</p>
                    <p className="text-xs text-secondary/30 mt-1">Messages are shared with the group</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={handleSend} className="p-3 border-t border-secondary/10 bg-paper shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-2">
                  <button type="button" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/50 hover:bg-secondary/20 transition-colors shrink-0" aria-label="Emoji">
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Chat message"
                    className="flex-1 bg-secondary/5 border border-secondary/10 rounded-2xl px-4 py-3 text-[var(--text)] placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-sm"
                  />
                  <button type="button" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/50 hover:bg-secondary/20 transition-colors shrink-0" aria-label="Attach image">
                    <Image size={20} />
                  </button>
                  {input.trim() ? (
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  ) : (
                    <button type="button" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0" aria-label="Voice message">
                      <Mic size={20} />
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Community list header */}
              <div className="px-6 pb-4 border-b border-secondary/10 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-primary">
                      Group Chats<span className="text-accent">.</span>
                    </h2>
                    <p className="text-xs text-secondary/50 mt-0.5">Your community conversations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                    >
                      <Search size={18} className="text-secondary" />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                    >
                      <X size={18} className="text-secondary" />
                    </button>
                  </div>
                </div>
                {showSearch && (
                  <motion.input
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/10 border border-secondary/15 rounded-2xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                  />
                )}
              </div>

              {/* Community list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {joinedCommunities.length === 0 ? (
                  <div className="text-center py-12 text-secondary/40">
                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No group chats yet</p>
                    <p className="text-xs mt-1">Join communities from the Hub to chat</p>
                  </div>
                ) : (
                  joinedCommunities
                    .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((community) => (
                      <motion.button
                        key={community.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openCommunity(community)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/5 transition-colors text-left"
                      >
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-2xl border border-secondary/15">
                            {community.avatar || '💬'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-bold text-secondary text-sm truncate">{community.name}</h3>
                          </div>
                          <p className="text-xs text-secondary/50 truncate">
                            {community.members} members
                          </p>
                        </div>
                      </motion.button>
                    ))
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

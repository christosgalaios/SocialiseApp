import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft, Image, Smile, Mic, Users, Pin, Search, Phone, Video } from 'lucide-react';
import api from '../api';

const STORAGE_PREFIX = 'socialise_community_chats_';

const getStoredMessages = (communityId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${communityId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return [];
};

const setStoredMessages = (communityId, messages) => {
  localStorage.setItem(`${STORAGE_PREFIX}${communityId}`, JSON.stringify(messages));
};

const DEMO_USER_NAME = 'You';
const QUICK_REACTIONS = ['❤️', '😂', '🔥', '👏', '😮', '👍'];

// Simulated typing responses
const AUTO_REPLIES = [
  { user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", delay: 3000, message: "That sounds great! Count me in 😊" },
  { user: "Marcus V.", avatar: "https://i.pravatar.cc/150?u=marcus", delay: 6000, message: "Awesome, see you all there!" },
];

const MessageBubble = ({ msg }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState(msg.reaction || null);

  return (
    <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group`}>
      <div className="max-w-[85%] relative">
        {!msg.isMe && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <img src={msg.avatar} alt="" className="w-5 h-5 rounded-full object-cover" loading="lazy" />
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
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const autoReplyIndex = useRef(0);

  const selectedCommunityId = selectedCommunity?.id;
  useEffect(() => {
    if (!selectedCommunityId) return;
    autoReplyIndex.current = 0;
    // Load from localStorage first, then fetch from API
    const stored = getStoredMessages(selectedCommunityId);
    if (stored.length) {
      setMessages(stored);
    } else {
      api.getCommunityChat(selectedCommunityId).then(data => {
        const mapped = (data || []).map(m => ({
          id: m.id,
          user: m.user_name,
          avatar: m.user_avatar || `https://i.pravatar.cc/150?u=${m.user_id}`,
          message: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
        }));
        setMessages(mapped);
        if (mapped.length) setStoredMessages(selectedCommunityId, mapped);
      }).catch(() => setMessages([]));
    }
  }, [selectedCommunityId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const openCommunity = (community) => {
    setSelectedCommunity(community);
    setMessages(getStoredMessages(community.id));
  };

  const closeCommunity = () => {
    setSelectedCommunity(null);
    setInput('');
    setIsTyping(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedCommunity) return;
    const newMsg = {
      id: Date.now(),
      user: DEMO_USER_NAME,
      avatar: null,
      message: input.trim(),
      time: 'Just now',
      isMe: true,
    };
    const next = [...messages, newMsg];
    setMessages(next);
    setStoredMessages(selectedCommunity.id, next);
    setInput('');

    // Post to API (fire-and-forget)
    api.sendCommunityMessage(selectedCommunity.id, newMsg.message).catch(() => {});

    // Simulate typing + auto reply
    if (autoReplyIndex.current < AUTO_REPLIES.length) {
      const reply = AUTO_REPLIES[autoReplyIndex.current];
      autoReplyIndex.current++;
      setTimeout(() => setIsTyping(reply.user), 1500);
      setTimeout(() => {
        setIsTyping(null);
        const replyMsg = {
          id: Date.now() + 1,
          user: reply.user,
          avatar: reply.avatar,
          message: reply.message,
          time: 'Just now',
          isMe: false,
        };
        setMessages(prev => {
          const updated = [...prev, replyMsg];
          setStoredMessages(selectedCommunity.id, updated);
          return updated;
        });
      }, reply.delay);
    }
  };

  // Online member count (simulated)
  const onlineCount = selectedCommunity ? Math.min(Math.floor(selectedCommunity.members * 0.08), 99) : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] bg-secondary/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 top-12 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2 shrink-0">
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
                    <p className="text-[10px] font-bold text-secondary/50 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {onlineCount} online • {selectedCommunity.members} members
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-secondary/20 transition-colors">
                      <Phone size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-secondary/20 transition-colors">
                      <Video size={16} />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
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
                {messages.length === 0 && (
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

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-secondary/50 text-xs font-medium"
                  >
                    <span className="italic">{isTyping} is typing</span>
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <form onSubmit={handleSend} className="p-3 border-t border-secondary/10 bg-paper shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-2">
                  <button type="button" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/50 hover:bg-secondary/20 transition-colors shrink-0">
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary/5 border border-secondary/10 rounded-2xl px-4 py-3 text-[var(--text)] placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-sm"
                  />
                  <button type="button" className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary/50 hover:bg-secondary/20 transition-colors shrink-0">
                    <Image size={20} />
                  </button>
                  {input.trim() ? (
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  ) : (
                    <button type="button" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
                    .map((community) => {
                      const stored = getStoredMessages(community.id);
                      const lastMsg = stored.length ? stored[stored.length - 1] : null;
                      return (
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
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-paper" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="font-bold text-secondary text-sm truncate">{community.name}</h3>
                              <span className="text-[10px] text-secondary/40 font-medium shrink-0 ml-2">{lastMsg?.time || ''}</span>
                            </div>
                            <p className="text-xs text-secondary/50 truncate">
                              {lastMsg ? `${lastMsg.user}: ${lastMsg.message}` : 'No messages yet'}
                            </p>
                          </div>
                          {community.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center shrink-0">{community.unread}</span>
                          )}
                        </motion.button>
                      );
                    })
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

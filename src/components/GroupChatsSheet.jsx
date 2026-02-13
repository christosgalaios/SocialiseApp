import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft } from 'lucide-react';
import { COMMUNITY_CHATS } from '../data/mockData';

const STORAGE_PREFIX = 'socialise_community_chats_';

const getStoredMessages = (communityId) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${communityId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const seed = COMMUNITY_CHATS[communityId];
  return Array.isArray(seed) ? seed.map((m) => ({ ...m, isMe: false })) : [];
};

const setStoredMessages = (communityId, messages) => {
  localStorage.setItem(`${STORAGE_PREFIX}${communityId}`, JSON.stringify(messages));
};

const DEMO_USER_NAME = 'You';

export default function GroupChatsSheet({ isOpen, onClose, joinedCommunities = [] }) {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedCommunity) return;
    setMessages(getStoredMessages(selectedCommunity.id));
  }, [selectedCommunity?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openCommunity = (community) => {
    setSelectedCommunity(community);
    setMessages(getStoredMessages(community.id));
  };

  const closeCommunity = () => {
    setSelectedCommunity(null);
    setInput('');
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
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 top-20 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1 rounded-full bg-secondary/20" />
          </div>

          {selectedCommunity ? (
            <>
              <div className="px-4 py-3 border-b border-secondary/10 flex items-center gap-3 shrink-0">
                <button
                  onClick={closeCommunity}
                  className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                  aria-label="Back to communities"
                >
                  <ArrowLeft size={20} className="text-secondary" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="font-black text-secondary truncate">{selectedCommunity.name}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Community chat • {selectedCommunity.members} members
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                >
                  <X size={20} className="text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/5">
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-secondary/50 py-2">
                  Chats from this community
                </div>
                {messages.length === 0 && (
                  <p className="text-center text-sm text-secondary/60 py-4">No messages yet. Say hi!</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.isMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white border border-secondary/10 text-secondary rounded-bl-sm'
                      }`}
                    >
                      {!msg.isMe && (
                        <p className="text-[10px] font-bold text-secondary/70 mb-0.5">{msg.user}</p>
                      )}
                      <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                      <p className="text-[10px] opacity-80 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-secondary/10 bg-paper shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-secondary/50 mb-2">Sends via WhatsApp</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-secondary/10 border border-secondary/10 rounded-2xl px-4 py-3 text-secondary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-3 rounded-2xl bg-primary text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="px-6 pb-4 border-b border-secondary/10 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-primary">
                    Group Chats<span className="text-accent">.</span>
                  </h2>
                  <p className="text-xs text-secondary/60 mt-0.5">Connected to your communities — pull all chats from each</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                >
                  <X size={20} className="text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/50 mb-3">Your communities</p>
                {joinedCommunities.length === 0 ? (
                  <p className="text-sm text-secondary/60 py-4">Join communities from the Hub to see their group chats here.</p>
                ) : (
                  joinedCommunities.map((community) => (
                    <motion.button
                      key={community.id}
                      onClick={() => openCommunity(community)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 text-2xl">
                        {community.avatar || '💬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary truncate">{community.name}</p>
                        <p className="text-xs text-secondary/60 truncate">{community.lastMessage || 'No messages yet'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-secondary/50 shrink-0">{community.members} members</span>
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

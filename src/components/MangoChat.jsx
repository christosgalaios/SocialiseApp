import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Wand2, MapPin, Calendar, Users } from 'lucide-react';
import { useMango } from '../contexts/MangoContext';
import { INITIAL_EVENTS, INITIAL_MICRO_MEETS, DEMO_USER } from '../data/mockData';

const MangoChat = () => {
    const { setIsChatOpen, setPose } = useMango();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hi Ben! 😸 I've been looking at some events I think you'd love. How can I help you today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Logic
        setTimeout(() => {
            const lowerInput = userMsg.text.toLowerCase();
            let botResponse = [];

            if (lowerInput.includes('hike') || lowerInput.includes('walk')) {
                setPose('celebrate'); // Excited about suggestion

                botResponse.push({
                    id: Date.now() + 1,
                    type: 'bot',
                    text: `I see you like **Hiking**! 🥾 Since you're based in **${DEMO_USER.location}**, I found some great options.`
                });

                // Find relevant events
                const hikeEvent = INITIAL_EVENTS.find(e => e.category === 'Walks and hikes');
                if (hikeEvent) {
                    botResponse.push({
                        id: Date.now() + 2,
                        type: 'bot',
                        text: "There's a big group hike this weekend:",
                        card: hikeEvent
                    });
                }

                const microMeet = INITIAL_MICRO_MEETS.find(m => m.type === 'hike');
                if (microMeet) {
                    botResponse.push({
                        id: Date.now() + 3,
                        type: 'bot',
                        text: "Or for something more intimate, this Micro-Meet matches your **Nature Lovers** vibe:",
                        card: microMeet,
                        isMicro: true
                    });
                }

                botResponse.push({
                    id: Date.now() + 4,
                    type: 'bot',
                    text: "Should I sign you up for one of these? 😺"
                });

            } else {
                botResponse.push({
                    id: Date.now() + 1,
                    type: 'bot',
                    text: "I'm still learning! But I can help you find *hikes*, *drinks*, or *games* nights. Just ask! 😸"
                });
            }

            setMessages(prev => [...prev, ...botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl z-[60] flex flex-col overflow-hidden border-t border-white/20"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white">
                        🐱
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Mango AI</h3>
                        <p className="text-xs text-secondary font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Online • Personal Assistant
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                <div className="text-center text-xs text-gray-400 my-4">Today</div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        {msg.text && (
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl shadow-sm relative ${msg.type === 'user'
                                    ? 'bg-gradient-to-br from-terracotta to-orange-600 text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                    }`}
                            >
                                <p className="leading-relaxed" dangerouslySetInnerHTML={{
                                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                }} />
                            </div>
                        )}

                        {/* Event Card Rendering */}
                        {msg.card && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-3 w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
                            >
                                <div className="h-32 bg-gray-200 relative">
                                    <img src={msg.card.image} alt={msg.card.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-gray-800">
                                        {msg.isMicro ? 'Micro-Meet' : 'Event'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{msg.card.title}</h4>

                                    <div className="space-y-2 text-sm text-gray-600 mt-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-terracotta" />
                                            <span>{msg.card.date} • {msg.card.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-terracotta" />
                                            <span>{msg.card.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-terracotta" />
                                            <span>{msg.isMicro ? `${msg.card.spotsLeft} spots left` : `${msg.card.attendees} going`}</span>
                                        </div>
                                    </div>

                                    <button className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm ml-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Mango something..."
                        className="flex-1 bg-gray-100 text-gray-900 rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-terracotta text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                        <Send size={18} fill="currentColor" />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default MangoChat;

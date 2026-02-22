import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Wand2, MapPin, Calendar, Users, Sparkles, Heart, Zap } from 'lucide-react';
import { useMango } from '../contexts/MangoContext';
import useUIStore from '../stores/uiStore';

const QUICK_PROMPTS = [
    { label: "What's on this week?", icon: '📅' },
    { label: "Find me a hike", icon: '🥾' },
    { label: "Suggest a dinner", icon: '🍽️' },
    { label: "My match score", icon: '✨' },
    { label: "Recommend a group", icon: '👥' },
];

const MangoChat = ({ user = {}, events = [] }) => {
    const { setIsChatOpen, setPose } = useMango();
    const loginStreak = useUIStore((s) => s.loginStreak);
    const [input, setInput] = useState('');
    const userName = user?.name?.split(' ')[0] || 'there';
    const userInterests = user?.interests || [];
    const userLocation = user?.location || 'your area';
    const microMeets = events.filter(e => e.is_micro_meet || e.isMicroMeet);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: `Hey ${userName}! 😸 I'm Mango, your personal social curator.${userInterests.length ? ` I know your interests — **${userInterests.join(', ')}** — and I've been scouting events for you.` : ''} What are you in the mood for?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const processInput = (text) => {
        const lower = text.toLowerCase();
        let responses = [];

        // Hike / Outdoor / Walk
        if (lower.includes('hike') || lower.includes('walk') || lower.includes('outdoor') || lower.includes('nature')) {
            setPose('celebrate');
            const hikeEvent = events.find(e => e.category === 'Outdoors');
            const hikeMeet = microMeets.find(m => m.category === 'Outdoors');

            responses.push({ id: Date.now() + 1, type: 'bot', text: `I love that you're adventurous! 🥾 Based on your location in **${userLocation}**, here's what I found:` });
            if (hikeEvent) {
                responses.push({ id: Date.now() + 2, type: 'bot', text: `This one has **${hikeEvent.attendees} people** going and covers a 12km trail with moderate difficulty:`, card: hikeEvent });
            }
            if (hikeMeet) {
                responses.push({ id: Date.now() + 3, type: 'bot', text: "For something more intimate, this **Micro-Meet** has a **88% match** with your profile:", card: hikeMeet, isMicro: true });
            }
            responses.push({ id: Date.now() + 4, type: 'bot', text: "Pro tip: The hike is dog-friendly and elder-friendly! Want me to sign you up? 😺" });
        }
        // Food / Dinner / Brunch / Drinks
        else if (lower.includes('food') || lower.includes('dinner') || lower.includes('brunch') || lower.includes('drink') || lower.includes('eat') || lower.includes('restaurant')) {
            setPose('celebrate');
            const foodEvents = events.filter(e => e.category === 'Food & Drinks');
            const dinnerMeet = microMeets.find(m => m.category === 'Food & Drinks');

            responses.push({ id: Date.now() + 1, type: 'bot', text: `Ooh, a foodie! 🍽️ I found **${foodEvents.length} food events** and a curated dinner Micro-Meet for you.` });
            if (foodEvents[0]) {
                responses.push({ id: Date.now() + 2, type: 'bot', text: `**${foodEvents[0].title}** is ${foodEvents[0].price === 0 ? 'FREE' : '£' + foodEvents[0].price} and has great vibes:`, card: foodEvents[0] });
            }
            if (dinnerMeet) {
                responses.push({ id: Date.now() + 3, type: 'bot', text: `And this AI-curated dinner has a **${dinnerMeet.matchScore}% match** — you'll love the crowd:`, card: dinnerMeet, isMicro: true });
            }
            if (foodEvents[1]) {
                responses.push({ id: Date.now() + 4, type: 'bot', text: `Also check out **${foodEvents[1].title}** at ${foodEvents[1].location?.split(',')[0]}:`, card: foodEvents[1] });
            }
        }
        // Games / Board games
        else if (lower.includes('game') || lower.includes('board') || lower.includes('play') || lower.includes('fun')) {
            setPose('playing');
            const gameEvent = events.find(e => e.category === 'Games');
            responses.push({ id: Date.now() + 1, type: 'bot', text: "Game night enthusiast! 🎲 I found the perfect match:" });
            if (gameEvent) {
                responses.push({ id: Date.now() + 2, type: 'bot', text: `**${gameEvent.title}** — beginner friendly with games provided! Only £${gameEvent.price}:`, card: gameEvent });
            }
            responses.push({ id: Date.now() + 3, type: 'bot', text: "The Board Game Night community also has **445 members**. Want me to show you their upcoming events? 🎯" });
        }
        // Music / Jazz / Party / Night
        else if (lower.includes('music') || lower.includes('jazz') || lower.includes('party') || lower.includes('night') || lower.includes('dance') || lower.includes('club')) {
            setPose('celebrate');
            const nightEvents = events.filter(e => e.category === 'Nightlife' || e.category === 'Entertainment');
            responses.push({ id: Date.now() + 1, type: 'bot', text: "Let's get the party started! 🎵 Here's what's happening:" });
            nightEvents.forEach((event, i) => {
                responses.push({ id: Date.now() + 2 + i, type: 'bot', text: i === 0 ? "This one's gonna be epic:" : "And if you prefer something more chill:", card: event });
            });
            responses.push({ id: Date.now() + 10, type: 'bot', text: "I noticed you're into **Music** — shall I keep an eye out for DJ sets and live performances? 🎧" });
        }
        // Coffee / Chat / Meet
        else if (lower.includes('coffee') || lower.includes('chat') || lower.includes('meet') || lower.includes('people') || lower.includes('friends')) {
            setPose('curious');
            const coffeeMeet = microMeets[0];
            responses.push({ id: Date.now() + 1, type: 'bot', text: "Love that you want to connect! ☕ Micro-Meets are perfect for meaningful conversations." });
            if (coffeeMeet) {
                responses.push({ id: Date.now() + 2, type: 'bot', text: `This **Startup Founders** coffee chat has a **${coffeeMeet.matchScore}% alignment** with your interests:`, card: coffeeMeet, isMicro: true });
            }
            responses.push({ id: Date.now() + 3, type: 'bot', text: "I can also suggest communities where people share your interests. Want recommendations? 🤝" });
        }
        // This week / Weekend / What's on
        else if (lower.includes('week') || lower.includes('weekend') || lower.includes("what's on") || lower.includes('upcoming') || lower.includes('soon')) {
            setPose('wave');
            responses.push({ id: Date.now() + 1, type: 'bot', text: `Great question! Here's your week at a glance: 📅\n\n**You have ${events.length} events** available${microMeets.length ? ` including **${microMeets.length} Micro-Meets**` : ''}.` });
            const nextEvent = events[0];
            if (nextEvent) {
                responses.push({ id: Date.now() + 2, type: 'bot', text: `Coming up soonest — **${nextEvent.title}** on ${nextEvent.date}:`, card: nextEvent });
            }
            responses.push({ id: Date.now() + 3, type: 'bot', text: "Want me to show you what matches your interests? 😸" });
        }
        // Match / Score / Compatibility
        else if (lower.includes('match') || lower.includes('score') || lower.includes('compatib') || lower.includes('synergy')) {
            setPose('celebrate');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: `Your match analysis is looking great! ✨\n\n**Smart Match Score: 94%**\n${userInterests.length ? `Based on your interests in **${userInterests.join(', ')}**, I've identified high-synergy events.` : 'I\'ve identified high-synergy events for you.'}\n\nYour strongest matches:\n• Dinner for 6 — **94%** (FinTech + Travel)\n• Coffee Chat — **91%** (Startup Founders)\n• Hike for 4 — **88%** (Nature Lovers)\n\nYour profile resonates most with **Tech** and **Food** communities. Keep going to events to improve your score! 📈`
            });
        }
        // Groups / Communities / Tribes
        else if (lower.includes('group') || lower.includes('community') || lower.includes('tribe') || lower.includes('join')) {
            setPose('curious');
            responses.push({ id: Date.now() + 1, type: 'bot', text: `Based on your profile, here are my top community picks: 👥\n\n🚀 **London Tech Socials** — 1,240 members, ⭐ 4.8 rating\n🥾 **Hiking Enthusiasts** — 890 members, ⭐ 4.6 rating\n🎲 **Board Game Night** — 445 members, ⭐ 4.9 rating\n\nYou're already in all three! Want me to suggest new communities to explore? I noticed **Foodies United** (2,100 members) matches your food interest perfectly. 🍜` });
        }
        // XP / Level / Progress
        else if (lower.includes('xp') || lower.includes('level') || lower.includes('progress') || lower.includes('achievement') || lower.includes('rank')) {
            setPose('celebrate');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: `Here's your progress report! 🎮\n\n⭐ **Level 4 — Socialite**\n💎 **750 XP** (250 until Level 5: Trailblazer)\n🔥 **${loginStreak > 0 ? `${loginStreak}-day streak!` : 'No streak yet — log in tomorrow to start one!'}**\n\n**Unlocked titles:** 5/10\n• 👣 First Steps\n• 🦋 Social Butterfly\n• 🛡️ Tribe Leader\n• 💬 Conversation Starter\n• 🦉 Night Owl\n\n**Next unlock:** 🗺️ Explorer — attend events in 3 categories. You've done 2 so far! Almost there! 💪`
            });
        }
        // Help / What can you do
        else if (lower.includes('help') || lower.includes('what can') || lower.includes('how') || lower.includes('features')) {
            setPose('wave');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: `I'm Mango, your social curator! Here's what I can help with: 😸\n\n🔍 **Find events** — "What's on this week?"\n🥾 **Activity search** — "Find me a hike"\n🍽️ **Food & drinks** — "Suggest a dinner"\n✨ **Match scores** — "My match score"\n👥 **Communities** — "Recommend a group"\n🎮 **Your progress** — "Show my XP"\n🎵 **Nightlife** — "What parties are on?"\n☕ **Meet people** — "I want to meet new friends"\n\nJust ask naturally — I understand context! 🐱`
            });
        }
        // Hello / Hi / Hey
        else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('sup') || lower === 'yo') {
            setPose('wave');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: `Hey there! 👋 Great to see you! How's your week going?\n\n${events.length ? `I noticed you have **${events.length} events** to explore${microMeets.length ? ` and **${microMeets.length} AI-curated Micro-Meets**` : ''} waiting.` : ''} What sounds good — something active, social, or creative? 😸`
            });
        }
        // Thanks / Thank you
        else if (lower.includes('thank') || lower.includes('thanks') || lower.includes('cheers') || lower.includes('awesome') || lower.includes('great')) {
            setPose('celebrate');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: "You're welcome! 😸 That's what I'm here for. Happy socialising! Let me know anytime you want event recommendations or need help. *purrs contentedly* 🐱"
            });
        }
        // Fallback - much more helpful now
        else {
            setPose('curious');
            responses.push({
                id: Date.now() + 1,
                type: 'bot',
                text: `Hmm, I'm not sure about that one! 🤔 But here are some things I'm great at:\n\n• Finding **events** by category (hikes, drinks, games, music)\n• Showing your **match scores** and recommendations\n• Suggesting **communities** to join\n• Checking your **XP progress** and achievements\n• Telling you **what's on** this week\n\nTry asking: *"What's happening this weekend?"* or *"Find me a dinner"* 😸`
            });
        }

        return responses;
    };

    const handleSend = (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking time (varies by complexity)
        const thinkTime = 800 + Math.random() * 1200;
        setTimeout(() => {
            const responses = processInput(currentInput);
            setMessages(prev => [...prev, ...responses]);
            setIsTyping(false);
        }, thinkTime);
    };

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
        setTimeout(() => {
            const userMsg = { id: Date.now(), type: 'user', text: prompt };
            setMessages(prev => [...prev, userMsg]);
            setIsTyping(true);
            setTimeout(() => {
                const responses = processInput(prompt);
                setMessages(prev => [...prev, ...responses]);
                setIsTyping(false);
            }, 1000);
        }, 100);
        setInput('');
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-paper backdrop-blur-xl rounded-t-[32px] shadow-2xl z-[60] flex flex-col overflow-hidden border-t border-secondary/10"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary/10 bg-paper shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white/20">
                        🐱
                    </div>
                    <div>
                        <h3 className="font-black text-secondary text-lg tracking-tight">Mango AI</h3>
                        <p className="text-[10px] text-secondary/50 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Online
                            <span className="text-accent">•</span>
                            Personal Curator
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsChatOpen(false); setPose('wave'); }}
                    className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Quick prompts (shown when few messages) */}
            {messages.length <= 2 && (
                <div className="px-4 py-3 border-b border-secondary/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickPrompt(prompt.label)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary/5 border border-secondary/10 text-xs font-bold text-secondary/70 whitespace-nowrap hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all shrink-0"
                        >
                            <span>{prompt.icon}</span>
                            {prompt.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/[0.02]">
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-secondary/30 my-3">Today</div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        {msg.text && (
                            <div
                                className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative ${msg.type === 'user'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white border border-secondary/10 text-secondary rounded-bl-sm'
                                    }`}
                            >
                                <p className="leading-relaxed text-sm font-medium whitespace-pre-line" dangerouslySetInnerHTML={{
                                    __html: msg.text
                                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                }} />
                            </div>
                        )}

                        {/* Event Card Rendering */}
                        {msg.card && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="mt-3 w-full max-w-sm premium-card overflow-hidden"
                            >
                                <div className="h-32 relative">
                                    <img src={msg.card.image} alt={msg.card.title} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent" />
                                    <div className="absolute top-3 right-3 flex gap-1.5">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${msg.isMicro ? 'bg-accent/90' : 'bg-white/20 backdrop-blur-md'}`}>
                                            {msg.isMicro ? 'Micro-Meet' : msg.card.category}
                                        </span>
                                        {msg.card.matchScore && (
                                            <span className="px-2 py-1 rounded-full bg-primary/90 text-[9px] font-black text-white flex items-center gap-1">
                                                <Zap size={10} /> {msg.card.matchScore}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <h4 className="font-black text-white text-lg drop-shadow-lg tracking-tight">{msg.card.title}</h4>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-4 text-xs text-secondary/60 font-bold">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary" /> {msg.card.date} • {msg.card.time}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary" /> {msg.card.location?.split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-secondary/50 font-bold flex items-center gap-1.5">
                                            <Users size={12} />
                                            {msg.isMicro ? `${msg.card.spotsLeft} spots left` : `${msg.card.attendees} going`}
                                        </span>
                                        <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-sm shadow-sm">🐱</div>
                        <div className="bg-white border border-secondary/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-secondary/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-secondary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-secondary/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-paper border-t border-secondary/10 pb-[max(16px,env(safe-area-inset-bottom))] shrink-0">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Mango anything..."
                        className="flex-1 bg-secondary/5 border border-secondary/10 text-[var(--text)] rounded-2xl pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-sm placeholder:text-secondary/40"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 w-10 h-10 bg-primary text-white rounded-xl disabled:opacity-30 disabled:bg-secondary/20 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default MangoChat;

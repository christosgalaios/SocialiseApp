import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wand2, Calendar, Clock, MapPin,
  ChevronRight, Zap, ShieldCheck, Heart,
  MessageCircle, Check, Send, Mountain, Ruler, TrendingUp, Footprints
} from 'lucide-react';
import { INCLUSIVITY_TAGS, CATEGORY_ATTRIBUTES } from '../data/constants';

const EventDetailSheet = ({ event, onClose, isJoined, onJoin, messages, onSendMessage, onOpenProfile }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [inputText, setInputText] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300, mass: 1 }}
        className="bg-paper w-full max-w-xl rounded-t-[48px] overflow-hidden flex flex-col relative z-50 max-h-[94vh] border-t border-secondary/10 shadow-[0_-25px_50px_-12px_rgba(45,95,93,0.15)]"
      >
        <div className="w-16 h-1.5 bg-secondary/10 rounded-full mx-auto my-5 shrink-0" />

        {/* Scrollable area: image scrolls up, tabs + content get more space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
            {/* Header Image - scrolls up and hides */}
            <div className="relative h-64 shrink-0 mx-5 rounded-[32px] overflow-hidden shadow-2xl border border-secondary/10 group">
              <img src={event.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={event.title} loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/80 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-[10px] font-black uppercase rounded-full shadow-2xl border border-white/20 tracking-widest text-white">{event.category}</span>
                  {event.isMicroMeet && <span className="px-4 py-1.5 bg-accent/90 backdrop-blur text-[10px] font-black uppercase rounded-full shadow-2xl border border-accent/30 flex items-center gap-2 tracking-widest text-white"><Wand2 size={12} /> AI Curated</span>}
                </div>
                <h2 className="text-4xl font-black leading-none tracking-tighter text-white drop-shadow-lg">{event.title}</h2>
              </div>
            </div>

            {/* Sticky bar: close + tabs - stays at top when image scrolls away */}
            <div className="sticky top-0 z-10 bg-paper border-b border-secondary/10 flex items-stretch shrink-0">
              <button onClick={onClose} className="p-4 flex items-center justify-center text-secondary/70 hover:text-secondary active:scale-90 transition-all" aria-label="Close">
                <X size={24} strokeWidth={2.5} />
              </button>
              {['info', 'chat'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-[12px] font-black uppercase tracking-[0.2em] transition-all relative border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-secondary' : 'border-transparent text-secondary/40'}`}
                >
                  {tab === 'info' ? 'The Experience' : 'Community Hub'}
                  {tab === 'chat' && messages.length > 0 && (
                    <span className="ml-3 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px]">{messages.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="grid grid-cols-2 gap-5 mb-10">
                  <div className="premium-card p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[18px] bg-primary/5 flex items-center justify-center border border-primary/10"><Calendar className="text-primary" size={24} /></div>
                    <div>
                      <h5 className="text-[10px] text-secondary/40 font-black uppercase tracking-widest mb-0.5">When</h5>
                      <p className="text-sm font-black tracking-tight text-secondary">{event.date}</p>
                    </div>
                  </div>
                  <div className="premium-card p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[18px] bg-secondary/5 flex items-center justify-center border border-secondary/10"><Clock className="text-secondary" size={24} /></div>
                    <div>
                      <h5 className="text-[10px] text-secondary/40 font-black uppercase tracking-widest mb-0.5">Time</h5>
                      <p className="text-sm font-black tracking-tight text-secondary">{event.time}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10 px-2 group">
                  <h4 className="text-secondary/40 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2.5">
                    <MapPin size={16} className="text-primary" /> Location Details
                  </h4>
                  <p className="text-xl font-extrabold mb-2 tracking-tight text-secondary group-hover:text-primary transition-colors">{event.location}</p>
                  <button className="text-primary text-xs font-black flex items-center gap-2 hover:translate-x-1 transition-transform">Get Directions <ChevronRight size={14} /></button>
                </div>

                <div className="mb-10 px-2">
                  <h4 className="text-secondary/40 text-[10px] font-black uppercase tracking-widest mb-4">Meeting Description</h4>
                  <p className="text-secondary/70 text-[15px] leading-relaxed font-medium tracking-tight">
                    {event.isMicroMeet
                      ? `Exclusive alignment for this tribe. Based on your profile, you have deep synergy with the 4 other attendees. Expect meaningful dialog on ${event.theme}.`
                      : `Join the community at ${event.location?.split(',')[0]} for a high-fidelity ${event.category.toLowerCase()} experience. Curated for authentic connections and local discovery.`
                    }
                  </p>
                </div>

                {/* Category-Specific Attributes */}
                {event.categoryAttrs && Object.keys(event.categoryAttrs).length > 0 && (
                  <div className="mb-10 px-2">
                    <h4 className="text-secondary/40 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2.5">
                      <Footprints size={16} className="text-primary" /> {event.category} Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(event.categoryAttrs).map(([key, value]) => {
                        const attrDef = CATEGORY_ATTRIBUTES[event.category]?.find(a => a.key === key);
                        const displayValue = Array.isArray(value) ? value.join(', ') : attrDef?.unit ? `${value} ${attrDef.unit}` : value;
                        return (
                          <div key={key} className="premium-card p-4 flex flex-col gap-1">
                            <span className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">{attrDef?.label || key}</span>
                            <span className="text-sm font-bold text-secondary">{displayValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inclusivity Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-10 px-2">
                    <h4 className="text-secondary/40 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2.5">
                      <Heart size={16} className="text-primary" /> Inclusivity
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tagId => {
                        const tag = INCLUSIVITY_TAGS.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <span key={tagId} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border ${tag.color}`}>
                            <span>{tag.emoji}</span> {tag.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="premium-card p-8 border-dashed border-secondary/20 bg-secondary/[0.02] mb-10">
                  <h4 className="text-[11px] font-black mb-6 flex items-center gap-2.5 uppercase tracking-[0.2em] text-primary">Trust & Safety</h4>
                  <div className="space-y-4">
                    {[
                      { text: 'Contribution Model Applied', icon: Zap, color: 'text-accent' },
                      { text: 'Safe & Curated Hub', icon: ShieldCheck, color: 'text-green-600' },
                      { text: 'Zero-Tolerance Harassment', icon: Heart, color: 'text-secondary' }
                    ].map(item => (
                      <div key={item.text} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center border border-secondary/5`}><item.icon size={14} className={item.color} /></div>
                        <span className="text-xs font-bold text-secondary/60 italic tracking-tight">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col pt-4">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 px-12 py-20">
                    <div className="w-24 h-24 rounded-[32px] glass-2 flex items-center justify-center mb-6 shadow-inner overflow-hidden relative">
                      <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                      <MessageCircle size={40} className="text-primary relative z-10" />
                    </div>
                    <h5 className="font-black text-xl mb-2 tracking-tight text-white">Pre-Event Hub</h5>
                    <p className="text-xs font-medium leading-relaxed italic opacity-80">Be the spark. Introduce yourself and start the conversation before you meet in person!</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-8 pb-10">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''} ${msg.isSystem ? 'justify-center py-2' : ''}`}>
                        {!msg.isSystem && (
                          <div className="relative shrink-0">
                            {onOpenProfile && !msg.isMe ? (
                              <button
                                type="button"
                                onClick={() => onOpenProfile({ name: msg.user, avatar: msg.avatar })}
                                className="rounded-[18px] focus:outline-none focus:ring-2 focus:ring-primary/40"
                              >
                                <img src={msg.avatar} className="w-12 h-12 rounded-[18px] object-cover shadow-2xl border border-white/10" alt={msg.user} loading="lazy" />
                              </button>
                            ) : (
                              <img src={msg.avatar} className="w-12 h-12 rounded-[18px] object-cover shadow-2xl border border-white/10" alt={msg.user} loading="lazy" />
                            )}
                            {msg.isHost && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-dark flex items-center justify-center"><Check size={10} strokeWidth={4} className="text-white" /></div>}
                          </div>
                        )}
                        <div className={`${msg.isSystem ? 'w-full text-center' : 'max-w-[75%]'} ${msg.isMe ? 'items-end flex flex-col' : ''}`}>
                          {!msg.isSystem && (
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                              {onOpenProfile && !msg.isMe ? (
                                <button type="button" onClick={() => onOpenProfile({ name: msg.user, avatar: msg.avatar })} className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors ${msg.isHost ? 'text-primary' : 'text-secondary/60'}`}>
                                  {msg.user}
                                </button>
                              ) : (
                                <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isHost ? 'text-primary' : 'text-secondary/60'}`}>{msg.user}</span>
                              )}
                              <span className="text-[9px] text-secondary/40 font-black">{msg.time}</span>
                            </div>
                          )}
                          <div className={`p-4.5 rounded-[24px] text-sm font-semibold tracking-tight leading-relaxed shadow-sm ${msg.isSystem ? 'bg-secondary/5 text-[10px] text-secondary/40 py-1.5 px-5 inline-block italic rounded-full' : msg.isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-secondary/5 border border-secondary/5 text-secondary rounded-tl-none'}`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-8 bg-paper border-t border-secondary/10 pb-[max(32px,env(safe-area-inset-bottom))] relative z-[60]">
          {activeTab === 'chat' ? (
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Message the hub..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (onSendMessage(inputText), setInputText(''))}
                className="flex-1 bg-secondary/5 border border-secondary/10 rounded-[22px] px-6 py-5 text-sm font-bold focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-secondary/30 text-[var(--text)]"
              />
              <button
                onClick={() => { onSendMessage(inputText); setInputText(''); }}
                className="w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all"
              >
                <Send size={28} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="shrink-0 flex flex-col">
                <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] mb-1">Access</span>
                <span className="text-3xl font-black text-accent italic leading-none">{(event.price ?? 0) === 0 ? 'FREE' : `£${event.price}`}</span>
              </div>
              <button
                onClick={onJoin}
                className={`flex-1 py-5 rounded-[24px] font-black text-xl uppercase tracking-[0.1em] transition-all shadow-xl active:scale-95 ${isJoined
                  ? 'bg-secondary/5 text-secondary/60 border-2 border-secondary/10'
                  : 'bg-gradient-to-r from-secondary to-primary text-white'
                  }`}
              >
                {isJoined ? 'I\'m Going ✨' : 'Join Now'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailSheet;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, Heart, Users, Zap } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

const OnboardingFlow = ({ onComplete, userName = 'there' }) => {
    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [location, setLocation] = useState('');
    const [groupSize, setGroupSize] = useState('any');

    const interests = CATEGORIES.filter(c => c.id !== 'All').map(c => ({
        id: c.id,
        label: c.label,
        icon: c.icon
    }));

    const toggleInterest = (id) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleComplete = () => {
        onComplete({
            interests: selectedInterests,
            location,
            groupSize
        });
    };

    const canProceed = () => {
        if (step === 0) return selectedInterests.length >= 2;
        if (step === 1) return location.trim().length > 0;
        return true;
    };

    const steps = [
        {
            title: `Hey ${(userName || 'there').split(' ')[0]}!`,
            subtitle: 'What are you into?',
            desc: 'Pick at least 2 interests'
        },
        {
            title: 'Where are you based?',
            subtitle: 'We\'ll find events nearby',
            desc: 'Enter your city or area'
        },
        {
            title: 'One last thing',
            subtitle: 'How do you like to socialise?',
            desc: 'This helps us match you better'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-paper flex flex-col"
        >
            {/* Progress bar */}
            <div className="p-6 pt-12">
                <div className="flex gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="h-1 flex-1 rounded-full overflow-hidden bg-secondary/10"
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: i <= step ? '100%' : '0%' }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-primary"
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-3xl font-black tracking-tight text-primary mb-1">
                        {steps[step].title}<span className="text-accent">.</span>
                    </h1>
                    <h2 className="text-xl font-bold text-secondary/80 mb-2">{steps[step].subtitle}</h2>
                    <p className="text-sm text-secondary/50">{steps[step].desc}</p>
                </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="interests"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {interests.map((interest) => {
                                const isSelected = selectedInterests.includes(interest.id);
                                const Icon = interest.icon;
                                return (
                                    <motion.button
                                        key={interest.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${isSelected
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-secondary/5 border-secondary/20 text-secondary/70 hover:border-secondary/40'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-secondary/10'
                                            }`}>
                                            {Icon && <Icon size={24} />}
                                        </div>
                                        <span className="text-sm font-bold">{interest.label}</span>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 right-2"
                                            >
                                                <Check size={16} className="text-primary" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="location"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            <div className="relative">
                                <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50" />
                                <input
                                    type="text"
                                    placeholder="e.g. London, Bristol, Manchester..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-secondary/5 border-2 border-secondary/20 rounded-2xl pl-12 pr-4 py-4 text-lg font-medium focus:outline-none focus:border-primary transition-all placeholder:text-secondary/40"
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['London', 'Bristol', 'Manchester', 'Birmingham', 'Edinburgh'].map(city => (
                                    <button
                                        key={city}
                                        onClick={() => setLocation(city)}
                                        className="px-4 py-2 bg-secondary/10 rounded-full text-sm font-bold text-secondary/70 hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="groupsize"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-4"
                        >
                            {[
                                { id: 'micro', icon: Heart, label: 'Micro Meets', desc: 'Small groups (2-6 people)', color: 'text-accent' },
                                { id: 'group', icon: Users, label: 'Group Events', desc: 'Larger gatherings (10+ people)', color: 'text-secondary' },
                                { id: 'any', icon: Zap, label: 'Both!', desc: 'Show me everything', color: 'text-primary' },
                            ].map(option => (
                                <motion.button
                                    key={option.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setGroupSize(option.id)}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${groupSize === option.id
                                            ? 'bg-primary/10 border-primary'
                                            : 'bg-secondary/5 border-secondary/20 hover:border-secondary/40'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${groupSize === option.id ? 'bg-primary/20' : 'bg-secondary/10'
                                        }`}>
                                        <option.icon size={28} className={groupSize === option.id ? 'text-primary' : option.color} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className={`font-bold ${groupSize === option.id ? 'text-primary' : 'text-secondary'}`}>
                                            {option.label}
                                        </p>
                                        <p className="text-sm text-secondary/60">{option.desc}</p>
                                    </div>
                                    {groupSize === option.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <Check size={24} className="text-primary" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 pb-10 flex gap-3">
                {step > 0 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-secondary" />
                    </button>
                )}
                <button
                    onClick={() => step < 2 ? setStep(step + 1) : handleComplete()}
                    disabled={!canProceed()}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                >
                    {step < 2 ? (
                        <>
                            Continue
                            <ChevronRight size={20} />
                        </>
                    ) : (
                        <>
                            Let's Go!
                            <Zap size={20} />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default OnboardingFlow;

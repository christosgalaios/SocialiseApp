import { ChevronRight, Compass, Zap } from 'lucide-react';
import { CATEGORIES } from '../data/constants';

const Sidebar = ({ activeCategory, onSelect, experimentalFeatures }) => (
    <div className="hidden md:flex flex-col w-64 h-full bg-paper border-r border-secondary/10 p-6 pt-24 shrink-0 transition-colors">


        <div className="mb-8">
            <h3 className="text-xs font-heading font-black text-secondary/70 uppercase tracking-widest mb-4 px-2">Discover</h3>
            <div className="space-y-2">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    if (!Icon) return null;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-primary text-white shadow-[0_8px_20px_rgba(226,114,91,0.25)]' : 'hover:bg-secondary/10 text-secondary/80 hover:text-secondary'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-white/20' : 'bg-secondary/5 group-hover:bg-secondary/10'}`}>
                                <Icon size={16} className={isActive ? 'text-white' : 'text-secondary/40 group-hover:text-secondary'} />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{cat.label}</span>
                            {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                        </button>
                    );
                })}
            </div>
        </div>


        <div className="mt-4 px-2 mb-8">
            {/* Dark Mode toggle removed */}
        </div>

        {experimentalFeatures && (
        <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/10 text-center">
            <Compass size={24} className="mx-auto mb-2 text-primary" />
            <h4 className="font-heading font-black text-sm mb-1 text-secondary">Go Premium</h4>
            <p className="text-[10px] text-secondary/60 mb-3">Unlock exclusive curated events.</p>
            <button className="text-[10px] font-black bg-primary text-white px-4 py-2 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Upgrade</button>
        </div>
        )}
    </div>
);

export default Sidebar;

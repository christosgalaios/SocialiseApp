import { ChevronRight, Compass, Home, Users, Search, User } from 'lucide-react';
import { playTap } from '../utils/feedback';

const navTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'hub', icon: Users, label: 'Hub' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ experimentalFeatures, activeTab, setActiveTab }) => {
    return (
        <nav className="hidden md:flex flex-col w-64 h-full bg-paper border-r border-secondary/10 p-6 pt-24 shrink-0 transition-colors" aria-label="Desktop navigation">
            {/* Primary Navigation */}
            <div className="mb-6">
                <h3 className="text-xs font-heading font-black text-secondary/70 uppercase tracking-widest mb-4 px-2">Navigate</h3>
                <div className="space-y-1">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { playTap(); setActiveTab(tab.id); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${isActive ? 'bg-secondary text-white shadow-[0_8px_20px_rgba(45,95,93,0.25)]' : 'hover:bg-secondary/10 text-secondary/80 hover:text-secondary'}`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-secondary/40 group-hover:text-secondary'} />
                                <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1" />

            {experimentalFeatures && (
            <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/10 text-center">
                <Compass size={24} className="mx-auto mb-2 text-primary" />
                <h4 className="font-heading font-black text-sm mb-1 text-secondary">Go Premium</h4>
                <p className="text-[10px] text-secondary/60 mb-3">Unlock exclusive curated events.</p>
                <button className="text-[10px] font-black bg-primary text-white px-4 py-2 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-md focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none" aria-label="Upgrade to Pro">Upgrade</button>
            </div>
            )}
        </nav>
    );
};

export default Sidebar;

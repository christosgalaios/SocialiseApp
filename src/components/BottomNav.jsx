import { motion } from 'framer-motion';
import { Home, Users, Compass, User } from 'lucide-react';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'hub', icon: Users, label: 'Hub' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const BottomNav = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (id) => {
    const fromIndex = tabs.findIndex(t => t.id === activeTab);
    const toIndex = tabs.findIndex(t => t.id === id);
    setActiveTab(id, toIndex - fromIndex);
  };

  // Navigate between tabs with arrow keys
  const handleKeyDown = (e, tabIndex) => {
    let nextIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (tabIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }

    const nextTab = tabs[nextIndex];
    handleTabClick(nextTab.id);
    // Focus the next tab button
    const allButtons = document.querySelectorAll('[data-nav-tab]');
    const target = Array.from(allButtons).find(btn => btn.dataset.navTab === nextTab.id);
    target?.focus();
  };

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50" aria-label="Main navigation">
      {/* Floating Tactical Pill Container */}
      <div className="glass-2 rounded-[32px] px-2 py-2 flex justify-around items-center shadow-[0_8px_40px_rgba(45,95,93,0.15)] border border-secondary/10 relative max-w-md mx-auto" role="tablist" aria-label="App sections">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              tabIndex={isActive ? 0 : -1}
              data-nav-tab={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex flex-col items-center gap-1 p-2 transition-all relative min-w-[60px] ${isActive ? 'text-primary' : 'text-secondary/40 hover:text-secondary/60'}`}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-x-[-12px] inset-y-[-4px] bg-primary/5 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={24} strokeWidth={isActive ? 3 : 2.5} className="relative z-10" />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`} aria-hidden="true">{tab.label}</span>

              {/* Brand period "." as active indicator instead of circle */}
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="text-accent font-black text-lg leading-none mt-0.5"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  aria-hidden="true"
                >
                  .
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import { motion } from 'framer-motion';
import { Home, Users, PlusCircle, Compass, User } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab, onCreateClick, hasEvents = true }) => {
  // Reordered: Home, Hub, Create, Explore, Profile
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'hub', icon: Users, label: 'Hub' },
    { id: 'create', icon: PlusCircle, label: 'Create', isAction: true },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const getTabIndex = (id) => tabs.findIndex(t => t.id === id);

  const handleTabClick = (id) => {
    const fromIndex = getTabIndex(activeTab);
    const toIndex = getTabIndex(id);
    setActiveTab(id, toIndex - fromIndex);
  };

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      {/* Floating Tactical Pill Container */}
      <div className="glass-2 rounded-[32px] px-2 py-2 flex justify-around items-center shadow-[0_8px_40px_rgba(45,95,93,0.15)] border border-secondary/10 relative max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <motion.button
                key={tab.id}
                onClick={onCreateClick}
                className="flex flex-col items-center gap-1 p-2 transition-all relative min-w-[60px] text-secondary/60 hover:text-secondary"
                whileTap={{ scale: 0.9 }}
              >
                {/* Accent glow behind Create button */}
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-60" />

                {/* Breathing animation when no events */}
                <motion.div
                  className="relative"
                  animate={!hasEvents ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-primary to-accent opacity-40"
                    animate={!hasEvents ? {
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.2, 0.4]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg relative z-10 border border-white/20">
                    <Icon size={20} strokeWidth={2.5} className="text-white" />
                  </div>
                </motion.div>
                <span className="text-[9px] font-bold uppercase tracking-wider transition-opacity opacity-0 h-0 hidden">{tab.label}</span>
              </motion.button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
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
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>{tab.label}</span>

              {/* Brand period "." as active indicator instead of circle */}
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="text-primary font-black text-lg leading-none mt-0.5"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  .
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;

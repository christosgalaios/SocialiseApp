import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Compass, User, Megaphone, ArrowRightLeft } from 'lucide-react';
import { playTap, hapticTap } from '../utils/feedback';
import useAuthStore from '../stores/authStore';
import useUIStore from '../stores/uiStore';
import api from '../api';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'hub', icon: Users, label: 'Hub' },
  { id: 'explore', icon: Compass, label: 'Explore' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const DOUBLE_TAP_DELAY = 300;
const LONG_PRESS_DELAY = 500;

const BottomNav = ({ activeTab, setActiveTab }) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useUIStore((s) => s.showToast);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const lastProfileTapRef = useRef(0);
  const longPressTimerRef = useRef(null);
  const isSwitchingRef = useRef(false);

  const isOrganiser = user?.role === 'organiser' && user?.organiserSetupComplete;
  const canSwitchRole = user?.organiserSetupComplete;

  const switchRole = useCallback(async (targetRole) => {
    if (isSwitchingRef.current) return;
    isSwitchingRef.current = true;
    try {
      const updated = await api.switchRole(targetRole);
      setUser(updated);
      hapticTap();
      showToast(`Switched to ${targetRole} view`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to switch role', 'error');
    } finally {
      isSwitchingRef.current = false;
      setShowRolePicker(false);
    }
  }, [setUser, showToast]);

  const handleProfileTap = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastProfileTapRef.current;
    lastProfileTapRef.current = now;

    if (elapsed < DOUBLE_TAP_DELAY && canSwitchRole) {
      // Double-tap: quick switch
      switchRole(isOrganiser ? 'attendee' : 'organiser');
      return;
    }

    // Single tap — normal navigation
    const fromIndex = tabs.findIndex(t => t.id === activeTab);
    const toIndex = tabs.findIndex(t => t.id === 'profile');
    playTap();
    hapticTap();
    setActiveTab('profile', toIndex - fromIndex);
  }, [activeTab, setActiveTab, canSwitchRole, isOrganiser, switchRole]);

  const handleProfilePointerDown = useCallback(() => {
    if (!canSwitchRole) return;
    longPressTimerRef.current = setTimeout(() => {
      hapticTap();
      setShowRolePicker(true);
    }, LONG_PRESS_DELAY);
  }, [canSwitchRole]);

  const handleProfilePointerUp = useCallback(() => {
    clearTimeout(longPressTimerRef.current);
  }, []);

  const handleTabClick = (id) => {
    if (id === 'profile') {
      handleProfileTap();
      return;
    }
    const fromIndex = tabs.findIndex(t => t.id === activeTab);
    const toIndex = tabs.findIndex(t => t.id === id);
    playTap();
    hapticTap();
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
      {/* Role Picker Popup */}
      <AnimatePresence>
        {showRolePicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="absolute bottom-full right-4 mb-3 glass-2 rounded-2xl p-2 shadow-xl border border-secondary/10 min-w-[180px]"
          >
            <button
              onClick={() => switchRole('attendee')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                !isOrganiser ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-secondary/10'
              }`}
            >
              <User size={18} />
              Attendee
              {!isOrganiser && <span className="ml-auto text-[9px] font-black text-primary uppercase tracking-widest">Active</span>}
            </button>
            <button
              onClick={() => switchRole('organiser')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                isOrganiser ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-secondary/10'
              }`}
            >
              <Megaphone size={18} />
              Organiser
              {isOrganiser && <span className="ml-auto text-[9px] font-black text-primary uppercase tracking-widest">Active</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for role picker */}
      {showRolePicker && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setShowRolePicker(false)} />
      )}

      {/* Floating Tactical Pill Container */}
      <div className="glass-2 rounded-[32px] px-2 py-2 flex justify-around items-center shadow-[0_8px_40px_rgba(45,95,93,0.15)] border border-secondary/10 relative max-w-md mx-auto" role="tablist" aria-label="App sections">
        {tabs.map((tab, i) => {
          const Icon = tab.id === 'profile' && isOrganiser ? Megaphone : tab.icon;
          const isActive = activeTab === tab.id;
          const isProfile = tab.id === 'profile';

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={isProfile && canSwitchRole ? `${tab.label} (hold to switch role)` : tab.label}
              tabIndex={isActive ? 0 : -1}
              data-nav-tab={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onPointerDown={isProfile ? handleProfilePointerDown : undefined}
              onPointerUp={isProfile ? handleProfilePointerUp : undefined}
              onPointerCancel={isProfile ? handleProfilePointerUp : undefined}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex flex-col items-center gap-1 p-2 transition-all relative min-w-[60px] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded-xl ${isActive ? 'text-primary' : 'text-secondary/40 hover:text-secondary/60'}`}
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
                {/* Role switch indicator dot */}
                {isProfile && canSwitchRole && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent border border-paper" aria-hidden="true" />
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`} aria-hidden="true">
                {isProfile && isOrganiser ? 'Host' : tab.label}
              </span>

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

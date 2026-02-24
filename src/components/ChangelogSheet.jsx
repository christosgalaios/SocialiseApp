import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Bug, Shield, Trash2, RefreshCw } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../hooks/useAccessibility';

const CATEGORY_CONFIG = {
  Added: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
  Changed: { icon: RefreshCw, color: 'text-accent', bg: 'bg-accent/10' },
  Fixed: { icon: Bug, color: 'text-secondary', bg: 'bg-secondary/10' },
  Removed: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  Security: { icon: Shield, color: 'text-secondary', bg: 'bg-secondary/10' },
};

const CHANGELOG = [
  {
    version: '0.1.164',
    date: '2026-02-24',
    sections: [
      {
        category: 'Added',
        items: ['Bug reports now auto-detect your platform, OS, and browser'],
      },
      {
        category: 'Fixed',
        items: [
          'Duplicate bug entries are automatically merged',
          'Bug report form now includes guided prompts',
          'Explore filters no longer bleed into the Home tab',
          'Create event close button reliably tappable on mobile',
          'Location picker shows text fallback when maps unavailable',
          'Desktop sidebar navigation routes correctly',
          'Mango drag bounds update on window resize',
        ],
      },
    ],
  },
  {
    version: '0.1.150',
    date: '2026-02-24',
    sections: [
      {
        category: 'Fixed',
        items: [
          'Event reels no longer freeze mid-swipe',
          'Creating an event prevents accidental double-submission',
          'Video wall no longer accumulates background timers',
        ],
      },
    ],
  },
  {
    version: '0.1.147',
    date: '2026-02-24',
    sections: [
      {
        category: 'Fixed',
        items: [
          'Splash screen no longer skips too early',
          'Bug reports include the current app version',
        ],
      },
    ],
  },
  {
    version: '0.1.142',
    date: '2026-02-23',
    sections: [
      {
        category: 'Added',
        items: ['Bug reports stored permanently and synced to tracking sheet'],
      },
    ],
  },
  {
    version: '0.1.134',
    date: '2026-02-22',
    sections: [
      {
        category: 'Added',
        items: ['XP and titles save to your account across devices'],
      },
      {
        category: 'Fixed',
        items: ['XP and achievements consistent between environments'],
      },
    ],
  },
  {
    version: '0.1.123',
    date: '2026-02-22',
    sections: [
      {
        category: 'Added',
        items: [
          'Login streak tracking on your profile',
          'In-app bug reporting from Profile settings',
        ],
      },
      {
        category: 'Fixed',
        items: ['New accounts start with 0 XP and no phantom achievements'],
      },
    ],
  },
  {
    version: '0.1.96',
    date: '2026-02-22',
    sections: [
      {
        category: 'Changed',
        items: ['Profile pictures optimised server-side for faster uploads'],
      },
      {
        category: 'Fixed',
        items: ['New profiles no longer inherit leftover avatars'],
      },
    ],
  },
  {
    version: '0.1.95',
    date: '2026-02-22',
    sections: [
      {
        category: 'Added',
        items: [
          'Password confirmation on registration',
          'Escape key closes all modals and sheets',
          'Full keyboard navigation for tabs and categories',
          'Screen reader support with ARIA roles and live regions',
          'Community chat loads real messages from the server',
        ],
      },
      {
        category: 'Changed',
        items: [
          'App loads ~47% faster (736 kb → 389 kb)',
          'Maps, animations, and video load on demand',
          'Smoother navigation and state updates',
        ],
      },
      {
        category: 'Fixed',
        items: [
          'Mobile tab switch scrolls to top correctly',
          'Cancelling a booking now syncs with the server',
        ],
      },
    ],
  },
  {
    version: '0.1.79',
    date: '2026-02-21',
    sections: [
      {
        category: 'Added',
        items: ['Delete your account from Profile → Settings'],
      },
    ],
  },
  {
    version: '0.1.67',
    date: '2026-02-21',
    sections: [
      {
        category: 'Added',
        items: ['Separate first and last name on registration'],
      },
      {
        category: 'Changed',
        items: ['Images load lazily for less data usage'],
      },
      {
        category: 'Security',
        items: [
          'Row Level Security on all database tables',
          'Login and registration rate-limited',
          'JWT tokens hardened in production',
          'CORS locked to known origins only',
        ],
      },
    ],
  },
  {
    version: '0.1.52',
    date: '2026-02-21',
    sections: [
      {
        category: 'Removed',
        items: ['Email verification on registration (was blocking sign-up)'],
      },
      {
        category: 'Fixed',
        items: ['Server crash when no users have registered yet'],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-02-21',
    sections: [
      {
        category: 'Added',
        items: [
          'Browse, join, and save local social events',
          'Micro-Meets — AI-matched small group dinners',
          'Communities (Tribes) with group chat and feed',
          'Global social feed with emoji reactions',
          'Mango — interactive kitten assistant',
          'Customisable profile with XP progression',
          'Secure email + password authentication',
        ],
      },
    ],
  },
];

const ChangelogSheet = ({ isOpen, onClose }) => {
  useEscapeKey(isOpen, onClose);
  const focusTrapRef = useFocusTrap(isOpen);

  const currentVersion = import.meta.env.VITE_APP_VERSION || CHANGELOG[0]?.version || '0.1.dev';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="What's new"
          ref={focusTrapRef}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-16 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-secondary/20" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-secondary/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-primary">
                  What&apos;s New<span className="text-accent">.</span>
                </h2>
                <p className="text-[11px] font-bold text-secondary/40 mt-0.5">
                  v{currentVersion}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 160px)' }}>
              <div className="px-6 py-5 space-y-6">
                {CHANGELOG.map((release) => (
                  <div key={release.version}>
                    {/* Version header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-black text-secondary tracking-tight">
                        v{release.version}
                      </span>
                      <div className="flex-1 h-px bg-secondary/10" />
                      <span className="text-[10px] font-bold text-secondary/30">
                        {release.date}
                      </span>
                    </div>

                    {/* Sections */}
                    <div className="space-y-3">
                      {release.sections.map((section) => {
                        const config = CATEGORY_CONFIG[section.category] || CATEGORY_CONFIG.Added;
                        const Icon = config.icon;
                        return (
                          <div key={section.category} className="rounded-2xl border border-secondary/10 bg-secondary/[0.03] overflow-hidden">
                            {/* Category tag */}
                            <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-md ${config.bg} flex items-center justify-center`}>
                                <Icon size={12} className={config.color} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                                {section.category}
                              </span>
                            </div>
                            {/* Items */}
                            <ul className="px-4 pb-3 space-y-1.5">
                              {section.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-accent text-[8px] mt-1.5 shrink-0">●</span>
                                  <span className="text-[13px] text-secondary/80 leading-snug">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Footer */}
                <div className="text-center pb-8 pt-2">
                  <p className="text-[10px] font-bold text-secondary/25 uppercase tracking-widest">
                    That&apos;s everything so far
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangelogSheet;

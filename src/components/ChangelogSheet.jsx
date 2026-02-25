import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Bug, Shield, Trash2, RefreshCw } from 'lucide-react';
import { useEscapeKey, useFocusTrap, useSwipeToClose } from '../hooks/useAccessibility';
import changelogRaw from '../../CHANGELOG.md?raw';

const CATEGORY_CONFIG = {
  Added: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
  Changed: { icon: RefreshCw, color: 'text-accent', bg: 'bg-accent/10' },
  Fixed: { icon: Bug, color: 'text-secondary', bg: 'bg-secondary/10' },
  Removed: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  Security: { icon: Shield, color: 'text-secondary', bg: 'bg-secondary/10' },
};

function parseChangelog(raw) {
  const releases = [];
  // Split on h2 headings — each chunk starts with the text after "## "
  const chunks = raw.split(/^## /m).slice(1);

  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const header = lines[0].trim();

    const isUnreleased = /^\[Unreleased\]/i.test(header);
    const releaseMatch = header.match(/^\[([^\]]+)\]\s*[—–-]+\s*(\d{4}-\d{2}-\d{2})/);

    if (!isUnreleased && !releaseMatch) continue;

    const version = isUnreleased ? 'Unreleased' : releaseMatch[1];
    const date = releaseMatch ? releaseMatch[2] : null;

    // Split body into category blocks (### heading)
    const body = lines.slice(1).join('\n');
    const sections = [];

    for (const catChunk of body.split(/^### /m).slice(1)) {
      const catLines = catChunk.split('\n');
      const category = catLines[0].trim();
      const items = catLines
        .slice(1)
        .filter((l) => l.startsWith('- '))
        .map((l) => l.slice(2).trim());

      if (items.length > 0) {
        sections.push({ category, items });
      }
    }

    if (sections.length > 0) {
      releases.push({ version, date, sections });
    }
  }

  return releases;
}

const CHANGELOG = parseChangelog(changelogRaw);

const ChangelogSheet = ({ isOpen, onClose }) => {
  useEscapeKey(isOpen, onClose);
  const focusTrapRef = useFocusTrap(isOpen);
  const { sheetY, dragZoneProps } = useSwipeToClose(onClose);

  const currentVersion =
    import.meta.env.VITE_APP_VERSION ||
    CHANGELOG.find((r) => r.version !== 'Unreleased')?.version ||
    '0.1.dev';

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
            className="absolute inset-x-0 bottom-0 top-16 bg-paper rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ y: sheetY }}
          >
            {/* Drag zone — handle + header */}
            <div {...dragZoneProps} className="shrink-0">
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
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">
              <div className="px-6 py-5 space-y-6">
                {CHANGELOG.map((release) => (
                  <div key={release.version}>
                    {/* Version header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-black text-secondary tracking-tight">
                        v{release.version}
                      </span>
                      <div className="flex-1 h-px bg-secondary/10" />
                      {release.date && (
                        <span className="text-[10px] font-bold text-secondary/30">
                          {release.date}
                        </span>
                      )}
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

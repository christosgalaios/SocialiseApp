import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // const isIOS = true; // FOR VERIFICATION ONLY
    
    // Check if running in standalone mode (already installed)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    // Check if user has already dismissed the prompt
    const hasDismissed = localStorage.getItem('ios_install_prompt_dismissed_v2');

    if (isIOS && !isStandalone && !hasDismissed) {
      // Small delay to not overwhelm on load
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('ios_install_prompt_dismissed_v2', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none flex justify-center pb-8"
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto relative">
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4 pr-6">
              <div className="bg-indigo-500/20 p-3 rounded-xl">
                <img src="/pwa-192x192.png" alt="App Icon" className="w-10 h-10 rounded-lg object-cover" onError={(e) => e.target.style.display = 'none'} />
                <Share className="text-indigo-400 w-10 h-10 hidden" style={{ display: 'none' }} /> 
                {/* Fallback icon if image fails, though we'll just hide image on error */}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Install Socialise</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Install this app on your iPhone for the best experience.
                </p>
                
                <div className="flex flex-col gap-2 mt-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-800 rounded text-xs text-slate-400">1</span>
                    <span>Tap the <Share size={16} className="inline mx-1 text-blue-400" /> Share button</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-800 rounded text-xs text-slate-400">2</span>
                    <span>Scroll down and tap <span className="font-medium text-white">Add to Home Screen</span> <PlusSquare size={16} className="inline mx-1" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IOSInstallPrompt;

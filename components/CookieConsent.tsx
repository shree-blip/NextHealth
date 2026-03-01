'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';
import { useSitePreferences } from '@/components/SitePreferencesProvider';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useSitePreferences();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Delay so it appears after the initial loading animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem('cookieConsent', 'necessary');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
          className="fixed bottom-0 left-0 right-0 z-[120] p-4 sm:p-6 md:p-8 pointer-events-none"
        >
          <div className={`mx-auto max-w-4xl rounded-2xl shadow-2xl p-6 md:p-8 pointer-events-auto flex flex-col md:flex-row items-start md:items-center gap-6 relative ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            
            <button 
              onClick={handleNecessaryOnly}
              className={`absolute top-4 right-4 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className={`flex-shrink-0 p-3 rounded-full ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-50'}`}>
              <Cookie className="h-8 w-8 text-emerald-500" />
            </div>
            
            <div className="flex-grow">
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>We value your privacy</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our <Link href="/privacy" className={`font-medium hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Privacy Policy</Link> for more information.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0 mt-4 md:mt-0">
              <button 
                onClick={handleNecessaryOnly}
                className={`px-6 py-2.5 rounded-xl font-medium transition-colors text-sm whitespace-nowrap ${isDark ? 'border border-slate-600 text-slate-300 hover:bg-slate-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                Necessary Only
              </button>
              <button 
                onClick={handleAcceptAll}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors text-sm whitespace-nowrap shadow-sm shadow-emerald-500/20"
              >
                Accept All
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

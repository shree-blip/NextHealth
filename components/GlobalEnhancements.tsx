'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false });
const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), { ssr: false });

export default function GlobalEnhancements() {
  const [showDeferred, setShowDeferred] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only show loader on initial page load or refresh (not on client-side navigation)
    if (!hasLoadedRef.current && typeof window !== 'undefined') {
      const navigationType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type;
      
      // Show loader on initial load (navigate) or refresh (reload)
      if (navigationType === 'navigate' || navigationType === 'reload') {
        setShowInitialLoader(true);
        hasLoadedRef.current = true;
      } else if (typeof document !== 'undefined') {
        document.body.classList.add('loaded');
      }
    } else if (typeof document !== 'undefined') {
      document.body.classList.add('loaded');
    }

    const activate = () => setShowDeferred(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(activate, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(activate, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {showInitialLoader && <LoadingScreen />}
      {showDeferred && (
        <>
          <CookieConsent />
          <ChatBot />
        </>
      )}
    </>
  );
}

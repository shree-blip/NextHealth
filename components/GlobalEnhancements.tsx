'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const ChatBot = dynamic(() => import('@/components/ChatBot'), { ssr: false });
const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), { ssr: false });

export default function GlobalEnhancements() {
  const [showDeferred, setShowDeferred] = useState(false);

  useEffect(() => {
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
      <LoadingScreen />
      {showDeferred && (
        <>
          <CookieConsent />
          <ChatBot />
        </>
      )}
    </>
  );
}

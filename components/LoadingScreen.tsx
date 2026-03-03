"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Logo from '@/components/Logo';

interface LoadingScreenProps {
  durationMs?: number;
  onComplete?: () => void;
}

export default function LoadingScreen({ durationMs = 2000, onComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Already loading, start progress
    document.body.style.overflow = 'hidden';
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(Math.round((elapsed / durationMs) * 100), 100);
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // small delay after hitting 100% before dismissing
        setTimeout(() => {
          setIsLoading(false);
          document.body.classList.add('loaded');
          document.body.style.overflow = '';
          onCompleteRef.current?.();
        }, 300);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = '';
    };
  }, [durationMs]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Logo showText={true} iconSize={120} darkText={true} />
            </motion.div>

            {/* Progress bar + percentage */}
            <div className="w-64 sm:w-80 flex flex-col items-center gap-3">
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #10b981, #3b82f6)',
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              </div>
              <span className="text-slate-600 text-sm font-mono tracking-wider">
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

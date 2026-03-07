'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Minimize2, Maximize2, X } from 'lucide-react';
import RunningPersonAnimation from './RunningPersonAnimation';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncProgressState {
  visible: boolean;
  minimized: boolean;
  status: SyncStatus;
  progress: number;        // 0-100
  label: string;           // e.g. "Syncing Business Profile data..."
  message: string;         // Final success/error message
  startedAt: number | null;
}

export const INITIAL_SYNC_STATE: SyncProgressState = {
  visible: false,
  minimized: false,
  status: 'idle',
  progress: 0,
  label: '',
  message: '',
  startedAt: null,
};

interface SyncProgressPopupProps {
  state: SyncProgressState;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onDismiss: () => void; // hides after success/error acknowledged
}

export default function SyncProgressPopup({
  state,
  onMinimize,
  onMaximize,
  onClose,
  onDismiss,
}: SyncProgressPopupProps) {
  if (!state.visible) return null;

  // Internal timer to keep elapsed time ticking
  const [, setTick] = useState(0);
  useEffect(() => {
    if (state.status !== 'syncing' || !state.startedAt) return;
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [state.status, state.startedAt]);

  const elapsed = state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : 0;
  const elapsedLabel = elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`;

  // ── Minimized pill ────────────────────────────────────
  if (state.minimized) {
    return (
      <AnimatePresence>
        <motion.button
          key="sync-pill"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onClick={onMaximize}
          className={`
            fixed bottom-6 right-6 z-[80] flex items-center gap-2 px-3.5 py-2 rounded-full shadow-2xl border
            backdrop-blur-sm cursor-pointer transition-all hover:scale-105 active:scale-95
            ${state.status === 'syncing'
              ? 'bg-white/95 dark:bg-slate-900/95 border-blue-300 dark:border-blue-700 shadow-blue-200/30 dark:shadow-blue-900/30'
              : state.status === 'success'
              ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-300 dark:border-emerald-700 shadow-emerald-200/30 dark:shadow-emerald-900/30'
              : 'bg-white/95 dark:bg-slate-900/95 border-red-300 dark:border-red-700 shadow-red-200/30 dark:shadow-red-900/30'
            }
          `}
        >
          {state.status === 'syncing' && (
            <>
              <RunningPersonAnimation size={22} className="text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Syncing… {state.progress}%</span>
            </>
          )}
          {state.status === 'success' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Report Ready</span>
            </>
          )}
          {state.status === 'error' && (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-bold text-red-600 dark:text-red-400">Sync Failed</span>
            </>
          )}
          <Maximize2 className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
        </motion.button>
      </AnimatePresence>
    );
  }

  // ── Expanded popup ────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        key="sync-popup"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`
          fixed bottom-6 right-6 z-[80] w-[380px] rounded-2xl shadow-2xl border p-5
          backdrop-blur-sm
          ${state.status === 'syncing'
            ? 'bg-white/95 dark:bg-slate-900/95 border-blue-200 dark:border-blue-800 shadow-blue-200/20 dark:shadow-blue-900/20'
            : state.status === 'success'
            ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 shadow-emerald-200/20 dark:shadow-emerald-900/20'
            : 'bg-white/95 dark:bg-slate-900/95 border-red-200 dark:border-red-800 shadow-red-200/20 dark:shadow-red-900/20'
          }
        `}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {state.status === 'syncing' && (
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <RunningPersonAnimation size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
            )}
            {state.status === 'success' && (
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            {state.status === 'error' && (
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {state.status === 'syncing' ? 'Syncing Data' : state.status === 'success' ? 'Sync Complete' : 'Sync Failed'}
              </p>
              {state.status === 'syncing' && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Elapsed: {elapsedLabel}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {state.status === 'syncing' && (
              <button
                onClick={onMinimize}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Minimize — sync continues in background"
              >
                <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
            {state.status === 'syncing' ? (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close popup — sync continues in background"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {state.status === 'syncing' && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{state.label}</p>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress</span>
                <span className="text-sm font-black tabular-nums text-blue-600 dark:text-blue-400">{state.progress}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              You can minimize or close this popup. The sync will continue in the background.
            </p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {state.message || 'Your report is ready. Please view it in the View tab.'}
              </p>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                {state.message || 'Sync failed. Please try again.'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

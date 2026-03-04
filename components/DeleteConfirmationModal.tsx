'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Check, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title,
  description,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with Icon */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-6 flex items-center gap-4">
                <motion.div
                  className="p-2 bg-white/20 rounded-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                >
                  <AlertTriangle className="text-white" size={24} />
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg">Confirm Delete</h3>
                  <p className="text-red-100 text-sm">This cannot be undone</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                  {title}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {description}
                </p>

                {itemName && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 mb-4">
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium truncate">
                      <span className="opacity-70">Deleting: </span>
                      {itemName}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                  {' '}
                  All associated data will be permanently removed.
                </p>
              </div>

              {/* Footer with Buttons */}
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex gap-3">
                <motion.button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={18} />
                  Cancel
                </motion.button>

                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.15 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      </motion.div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

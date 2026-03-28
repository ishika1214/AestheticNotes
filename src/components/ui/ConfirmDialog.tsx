import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white/70 dark:bg-stone-900/60 backdrop-blur-2xl rounded-[32px] border border-black/5 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "p-3 rounded-2xl",
                  variant === 'danger' && "bg-red-500/10 text-red-500",
                  variant === 'warning' && "bg-amber-500/10 text-amber-500",
                  variant === 'info' && "bg-[var(--accent)]/10 text-[var(--accent)]",
                )}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-stone-900 dark:text-stone-50 mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl",
                    variant === 'danger' && "bg-red-500 hover:bg-red-600 shadow-red-500/20",
                    variant === 'warning' && "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
                    variant === 'info' && "bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-[var(--accent)]/20",
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

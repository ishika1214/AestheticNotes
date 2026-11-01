import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CircleFace } from './Doodles';

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

const FACE_COLOR = {
  danger: '#f2a5ad',
  warning: '#ecb93f',
  info: '#4cc4c0',
};

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
            className="absolute inset-0 bg-[#0b3b3c]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="card relative w-full max-w-sm overflow-hidden p-8 text-center text-[var(--text)]"
          >
            <button onClick={onCancel} className="icon-btn absolute right-4 top-4" aria-label="Close">
              <X className="w-4 h-4" />
            </button>

            <CircleFace
              className="mx-auto mb-5 h-16 w-16"
              color={FACE_COLOR[variant]}
              mood={variant === 'danger' ? 'calm' : 'happy'}
            />

            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{message}</p>

            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row">
              <button
                onClick={onCancel}
                className="flex-1 rounded-full border-[1.5px] border-[var(--border)] px-6 py-3 text-sm font-medium transition-all hover:border-[var(--accent)] active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={cn(
                  'flex-1 rounded-full px-6 py-3 text-sm font-medium transition-all active:scale-95',
                  variant === 'danger' && 'bg-[#d1495b] text-white hover:bg-[#b93a4b]',
                  variant === 'warning' && 'bg-[#ecb93f] text-[#0b3b3c] hover:bg-[#e0a92a]',
                  variant === 'info' && 'btn-pill',
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

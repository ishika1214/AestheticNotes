import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface AILoadingProps {
  message?: string;
}

export default function AILoading({ message = "AI is thinking..." }: AILoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-20 animate-pulse" />
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-xl"
        >
          <Sparkles className="w-8 h-8 text-[var(--accent)]" />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1">
          {message}
        </p>
        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
          Magic in progress
        </p>
      </div>
    </div>
  );
}

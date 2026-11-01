import { motion } from 'motion/react';
import { CircleFace, HexFace, BlobFace } from '../ui/Doodles';

interface AILoadingProps {
  message?: string;
}

export default function AILoading({ message = "Thinking…" }: AILoadingProps) {
  const faces = [
    <CircleFace key="c" className="h-9 w-9" color="#f2a5ad" mood="happy" />,
    <HexFace key="h" className="h-9 w-9" />,
    <BlobFace key="b" className="h-9 w-9" />,
  ];
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-5">
      <div className="flex items-end gap-2">
        {faces.map((face, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          >
            {face}
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <p className="font-medium text-[var(--text)]">{message}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">This only takes a moment</p>
      </div>
    </div>
  );
}

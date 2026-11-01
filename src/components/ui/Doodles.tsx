import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

/*
 * Hand-drawn style shapes with little faces, inspired by playful
 * wellness illustration. All shapes share the same ink colour so they
 * read as one family, and each accepts className/style for placement.
 */

const INK = "#0b3b3c";

interface ShapeProps {
  className?: string;
  style?: CSSProperties;
  color?: string;
}

function Smile({ cx, cy, s = 1, mood = "happy" }: { cx: number; cy: number; s?: number; mood?: "happy" | "grin" | "calm" }) {
  const eye = 3.4 * s;
  const dx = 11 * s;
  return (
    <g fill="none" stroke={INK} strokeWidth={3.2 * s} strokeLinecap="round">
      {mood === "calm" ? (
        <>
          <path d={`M${cx - dx - 4 * s} ${cy - 6 * s} q4 ${-4 * s} ${8 * s} 0`} />
          <path d={`M${cx + dx - 4 * s} ${cy - 6 * s} q4 ${-4 * s} ${8 * s} 0`} />
        </>
      ) : (
        <>
          <circle cx={cx - dx} cy={cy - 6 * s} r={eye} fill={INK} stroke="none" />
          <circle cx={cx + dx} cy={cy - 6 * s} r={eye} fill={INK} stroke="none" />
        </>
      )}
      {mood === "grin" ? (
        <path d={`M${cx - 12 * s} ${cy + 4 * s} q${12 * s} ${16 * s} ${24 * s} 0 z`} fill={INK} />
      ) : (
        <path d={`M${cx - 10 * s} ${cy + 5 * s} q${10 * s} ${11 * s} ${20 * s} 0`} />
      )}
    </g>
  );
}

export function HexFace({ className, style, color = "#f27a1a" }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M60 6 L108 32 L108 88 L60 114 L12 88 L12 32 Z" fill={color} strokeLinejoin="round" />
      <Smile cx={60} cy={62} s={1.2} />
    </svg>
  );
}

export function CircleFace({ className, style, color = "#f2a5ad", mood = "grin" }: ShapeProps & { mood?: "happy" | "grin" | "calm" }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <circle cx="60" cy="60" r="56" fill={color} />
      <Smile cx={60} cy={62} s={1.2} mood={mood} />
    </svg>
  );
}

export function BlobFace({ className, style, color = "#4cc4c0" }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path
        d="M20 30 C30 4 92 2 106 26 C120 50 116 96 88 110 C60 122 14 112 8 84 C2 60 12 48 20 30 Z"
        fill={color}
      />
      <path d="M40 40 c10 -14 30 -6 22 8 c-8 14 22 18 30 6" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
      <Smile cx={60} cy={74} s={1} mood="calm" />
    </svg>
  );
}

export function TriangleFace({ className, style, color = "#e9d4a8" }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M14 22 Q12 8 28 10 L104 22 Q116 24 110 38 L66 108 Q58 118 50 106 Z" fill={color} />
      <circle cx="50" cy="44" r="6" fill={INK} />
      <circle cx="80" cy="40" r="6" fill={INK} />
      <path d="M58 60 l10 16 l10 -18 z" fill={INK} />
    </svg>
  );
}

export function HalfMoon({ className, style, color = "#ffffff" }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M60 4 A56 56 0 0 1 60 116 Z" fill={color} />
      <circle cx="84" cy="48" r="5" fill={INK} />
      <path d="M76 72 q10 10 22 -2" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function Starburst({ className, style, color = INK }: ShapeProps) {
  const points = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? 56 : 22;
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <polygon points={points} fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Asterisk({ className, style, color = INK }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <g stroke={color} strokeWidth="16" strokeLinecap="round">
        <line x1="60" y1="14" x2="60" y2="106" />
        <line x1="20" y1="37" x2="100" y2="83" />
        <line x1="20" y1="83" x2="100" y2="37" />
      </g>
    </svg>
  );
}

export function Flower({ className, style, color = "#4cc4c0", center = "#ecb93f" }: ShapeProps & { center?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="60" cy="32" rx="18" ry="26" fill={color} transform={`rotate(${r} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="14" fill={center} />
    </svg>
  );
}

export function Leaf({ className, style, color = "#2fb36a" }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M14 106 C10 50 50 10 108 12 C110 70 70 110 14 106 Z" fill={color} />
      <path d="M22 98 C50 70 70 50 96 24" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Squiggle({ className, style, color = INK }: ShapeProps) {
  return (
    <svg viewBox="0 0 120 40" className={className} style={style} aria-hidden>
      <path d="M4 20 q14 -18 28 0 t28 0 t28 0 t28 0" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** A cluster of faces for hero and empty-state art. */
export function FaceCluster({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <BlobFace className="absolute left-[4%] top-[34%] w-[42%]" />
      <HexFace className="absolute left-[32%] top-[4%] w-[46%]" />
      <CircleFace className="absolute right-[2%] top-[40%] w-[40%]" />
      <Asterisk className="absolute left-[34%] bottom-[0%] w-[18%]" />
      <Starburst className="absolute right-[0%] top-[0%] w-[24%]" />
    </div>
  );
}

/*
 * Note colours. New notes store the `key`; older notes stored a full
 * Tailwind class string, so `resolveNoteColor` also matches those by the
 * colour word they contain.
 */

export interface NoteColor {
  key: string;
  name: string;
  /** Background for cards and the studio canvas */
  surface: string;
  /** Solid swatch used in the colour picker */
  swatch: string;
}

export const NOTE_COLORS: NoteColor[] = [
  { key: "cream", name: "Cream", surface: "bg-white dark:bg-[#0f3132]", swatch: "#ffffff" },
  { key: "peach", name: "Peach", surface: "bg-[#f9e4cf] dark:bg-[#3a2c20]", swatch: "#f9e4cf" },
  { key: "blush", name: "Blush", surface: "bg-[#fbdcdc] dark:bg-[#3b2427]", swatch: "#fbdcdc" },
  { key: "butter", name: "Butter", surface: "bg-[#fbecc0] dark:bg-[#3a321b]", swatch: "#fbecc0" },
  { key: "mint", name: "Mint", surface: "bg-[#d4f0dc] dark:bg-[#18382a]", swatch: "#d4f0dc" },
  { key: "lagoon", name: "Lagoon", surface: "bg-[#d2efed] dark:bg-[#123a3a]", swatch: "#d2efed" },
  { key: "lilac", name: "Lilac", surface: "bg-[#e7e0f6] dark:bg-[#2a2640]", swatch: "#e7e0f6" },
  { key: "teal", name: "Deep Teal", surface: "bg-[#0b3b3c] text-[#f6efe6] dark:bg-[#062021]", swatch: "#0b3b3c" },
];

const LEGACY: Record<string, string> = {
  rose: "blush",
  amber: "butter",
  emerald: "mint",
  blue: "lagoon",
  indigo: "lilac",
  violet: "lilac",
};

export function resolveNoteColor(value?: string | null): NoteColor {
  if (!value) return NOTE_COLORS[0];
  const direct = NOTE_COLORS.find((c) => c.key === value);
  if (direct) return direct;
  for (const [word, key] of Object.entries(LEGACY)) {
    if (value.includes(word)) return NOTE_COLORS.find((c) => c.key === key)!;
  }
  return NOTE_COLORS[0];
}

export const TYPE_META = {
  note: { label: "Notes", color: "#f27a1a" },
  novel: { label: "Novels", color: "#4cc4c0" },
  diary: { label: "Diaries", color: "#2fb36a" },
} as const;

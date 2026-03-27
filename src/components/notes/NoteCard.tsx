import { motion } from "motion/react";
import { format } from "date-fns";
import { Pin, Globe, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Note } from "../../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
  onClick: () => void;
  onPin: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function NoteCard({
  note,
  viewMode,
  onClick,
  onPin,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
}: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={isSelectionMode ? onSelect : onClick}
      className={cn(
        "group relative overflow-hidden rounded-[24px] cursor-pointer transition-all bg-white/70 dark:bg-stone-900/40 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(124,58,237,0.25)] hover:border-[var(--accent)]/30 dark:hover:border-[var(--accent)]/30 hover:-translate-y-1.5 duration-300",
        isSelected && "ring-2 ring-[var(--accent)] bg-white/90 dark:bg-stone-800/60 shadow-[0_0_20px_rgba(124,58,237,0.2)]",
        note.color,
        viewMode === "list"
          ? "flex items-center p-4 gap-4"
          : "flex flex-col h-full",
      )}
    >
      {note.cover_image && viewMode === "grid" && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={note.cover_image}
            alt="Cover"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div
        className={cn("p-6 flex-1 flex flex-col", viewMode === "list" && "p-0")}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-2xl shrink-0 filter drop-shadow-sm">{note.emoji}</span>
            <h3 className="font-extrabold text-lg truncate text-stone-900 dark:text-stone-50 tracking-tight">
              {note.title || "Untitled"}
            </h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={cn(
                "p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                note.is_pinned && "text-[var(--accent)] bg-[var(--accent-soft)] dark:bg-[var(--accent)]/10 opacity-100",
              )}
              title={note.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn("w-4 h-4", note.is_pinned && "fill-current")} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className="
  text-stone-500
  dark:text-stone-400
  text-[13px]
  leading-relaxed
  line-clamp-3
  mb-6
  flex-1
"
          dangerouslySetInnerHTML={{ __html: note.content || "No content..." }}
        />

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[10px] text-stone-400 font-bold self-center">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            {format(new Date(note.updated_at), "MMM d")}
          </span>
        </div>
      </div>

      {note.is_public && (
        <div className="absolute top-3 left-3 p-1.5 bg-white/80 dark:bg-[#4a2d5a]/20 backdrop-blur-md rounded-full shadow-lg border border-black/5 dark:border-white/10">
          <Globe className="w-3 h-3 text-[var(--accent)]" />
        </div>
      )}

      {/* Selection Checkbox */}
      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-white/80 dark:bg-black/40 backdrop-blur-md group-hover:opacity-100",
          isSelected
            ? "bg-[var(--accent)] border-[var(--accent)] scale-110 opacity-100 shadow-lg"
            : "border-stone-200 dark:border-stone-700 opacity-0",
          isSelectionMode && "opacity-100",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300",
            isSelected ? "scale-100" : "scale-0",
          )}
        />
      </div>
    </motion.div>
  );
}

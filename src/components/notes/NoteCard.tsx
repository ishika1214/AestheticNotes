import { motion } from "motion/react";
import { format } from "date-fns";
import { Pin, Globe, Trash2, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { resolveNoteColor, TYPE_META } from "../../lib/palette";
import { type Note } from "../../types";

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

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

function previewText(note: Note) {
  if (note.type === 'note' || !note.type) {
    return stripHtml(note.content || "") || "Empty note";
  }
  if (note.sections && note.sections.length > 0) {
    return note.sections.map(s => `${s.title}: ${stripHtml(s.content)}`).join(' • ');
  }
  return stripHtml(note.content || "") || "An empty story, waiting.";
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
  const color = resolveNoteColor(note.color);
  const isDarkCard = color.key === "teal";
  const type = TYPE_META[note.type || 'note'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={isSelectionMode ? onSelect : onClick}
      className={cn(
        "group relative overflow-hidden rounded-[28px] cursor-pointer transition-all duration-300 shadow-[var(--shadow)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,59,60,0.35)]",
        color.surface,
        isSelected && "ring-[3px] ring-[#f27a1a] ring-offset-2 ring-offset-[var(--bg)]",
        viewMode === "list"
          ? "flex items-center p-5 gap-5"
          : "flex flex-col h-full min-h-56",
      )}
    >
      {note.cover_image && viewMode === "grid" && (
        <div className="h-36 w-full overflow-hidden p-2 pb-0">
          <img
            src={note.cover_image}
            alt=""
            className="w-full h-full object-cover rounded-[22px] transition-transform duration-500 group-hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className={cn("flex-1 flex flex-col min-w-0", viewMode === "grid" ? "p-6" : "")}>
        <div className="flex items-start gap-3 mb-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-xl dark:bg-white/10">
            {note.emoji || "📝"}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-base truncate tracking-tight">
                {note.title || "Untitled"}
              </h3>
              {note.is_public && <Globe className="w-3.5 h-3.5 shrink-0 opacity-60" />}
            </div>
            <span className={cn("mt-0.5 flex items-center gap-1.5 text-xs", isDarkCard ? "text-white/70" : "text-[var(--muted)]")}>
              <span className="h-2 w-2 rounded-full" style={{ background: type.color }} />
              {type.label.replace(/s$/, "")}
              <span aria-hidden>·</span>
              {format(new Date(note.updated_at), "MMM d")}
            </span>
          </div>
        </div>

        <p
          className={cn(
            "text-sm leading-relaxed line-clamp-3 flex-1",
            isDarkCard ? "text-white/80" : "text-[var(--muted)]",
            viewMode === "list" && "line-clamp-1",
          )}
        >
          {previewText(note)}
        </p>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium dark:bg-white/10"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[11px] opacity-60">+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "flex items-center gap-1 transition-all",
          viewMode === "grid" ? "absolute bottom-4 right-4" : "shrink-0",
          isSelectionMode ? "opacity-0 pointer-events-none" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className={cn(
            "rounded-full p-2 transition-colors bg-white/80 hover:bg-white dark:bg-black/30 dark:hover:bg-black/50",
            note.is_pinned ? "text-[#f27a1a]" : "text-[#0b3b3c] dark:text-[#f6efe6]",
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
          className="rounded-full p-2 bg-white/80 text-[#0b3b3c] transition-colors hover:bg-[#f2a5ad] dark:bg-black/30 dark:text-[#f6efe6] dark:hover:bg-[#f2a5ad] dark:hover:text-[#0b3b3c]"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pinned marker (always visible) */}
      {note.is_pinned && viewMode === "grid" && !isSelectionMode && (
        <Pin className="absolute top-5 right-5 w-4 h-4 fill-current text-[#f27a1a] group-hover:opacity-0 transition-opacity" />
      )}

      {/* Selection checkbox */}
      <button
        className={cn(
          "absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
          isSelected
            ? "border-[#f27a1a] bg-[#f27a1a] text-white opacity-100"
            : "border-[#0b3b3c]/25 bg-white/80 text-transparent dark:border-white/30 dark:bg-black/30",
          isSelectionMode || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          viewMode === "list" && "top-1/2 -translate-y-1/2 right-28",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        title={isSelected ? "Deselect" : "Select"}
      >
        <Check className="w-4 h-4" strokeWidth={3} />
      </button>
    </motion.div>
  );
}

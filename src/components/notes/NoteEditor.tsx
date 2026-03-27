import React, { useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  Pin,
  Globe,
  Lock,
  Palette,
  ImageIcon,
  X,
  Trash2,
  Plus,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Note, NoteUpdate } from "../../types";
import { RichTextEditor } from "../editor/RichTextEditor";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = [
  { name: "Default", value: "bg-white/70 dark:bg-[#4a2d5a]/20 backdrop-blur-xl border-black/5 dark:border-white/10" },
  { name: "Rose", value: "bg-rose-50/70 dark:bg-rose-950/30 backdrop-blur-xl border-rose-100/50 dark:border-rose-900/40" },
  { name: "Amber", value: "bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xl border-amber-100/50 dark:border-amber-900/40" },
  { name: "Emerald", value: "bg-emerald-50/70 dark:bg-emerald-950/30 backdrop-blur-xl border-emerald-100/50 dark:border-emerald-900/40" },
  { name: "Blue", value: "bg-blue-50/70 dark:bg-blue-950/30 backdrop-blur-xl border-blue-100/50 dark:border-blue-900/40" },
  { name: "Indigo", value: "bg-indigo-50/70 dark:bg-indigo-950/30 backdrop-blur-xl border-indigo-100/50 dark:border-indigo-900/40" },
  { name: "Violet", value: "bg-violet-50/70 dark:bg-violet-950/30 backdrop-blur-xl border-violet-100/50 dark:border-violet-900/40" },
];

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
  onUpdate: (updates: NoteUpdate) => void;
  onDelete: () => void;
  /** When true the editor is in create mode — no delete button, "Save" CTA */
  isNew?: boolean;
}

export default function NoteEditor({
  note,
  onClose,
  onUpdate,
  onDelete,
  isNew = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [emoji, setEmoji] = useState(note.emoji);
  const [color, setColor] = useState(note.color);
  const [isPublic, setIsPublic] = useState(note.is_public);
  const [isPinned, setIsPinned] = useState(note.is_pinned);
  const [tags, setTags] = useState(note.tags);
  const [newTag, setNewTag] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showCoverInput, setShowCoverInput] = useState(false);
  const [coverUrl, setCoverUrl] = useState(note.cover_image || "");

  const buildUpdates = (): NoteUpdate => ({
    title,
    content,
    emoji,
    color,
    is_public: isPublic,
    is_pinned: isPinned,
    tags,
    cover_image: coverUrl || null,
  });

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleSave = () => {
    const isTitleEmpty = !title.trim();
    const isContentEmpty = !stripHtml(content).trim();

    if (isTitleEmpty && isContentEmpty) {
      if (isNew) {
        onClose();
        return;
      }
      // If existing but now empty, we could either delete or just close
      // The user specifically mentioned "adding", so for now we just don't save
      onClose();
      return;
    }

    onUpdate(buildUpdates());
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSave();
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={cn(
          "w-full max-w-4xl h-[90vh] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col relative border border-black/5 dark:border-white/10 backdrop-blur-2xl transition-all duration-500",
          color,
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90",
                isPinned && "text-[var(--accent)] bg-black/5 dark:bg-white/10",
              )}
            >
              <Pin className={cn("w-5 h-5", isPinned && "fill-current")} />
            </button>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={cn(
                "p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90",
                isPublic && "text-[var(--accent)] bg-black/5 dark:bg-white/10",
              )}
            >
              {isPublic ? (
                <Globe className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-3 p-3 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex gap-2 z-50">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setColor(c.value);
                        setShowColorPicker(false);
                      }}
                      className={cn(
                        "w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 transition-all hover:scale-110",
                        c.value,
                        color === c.value &&
                          "ring-2 ring-[var(--accent)] ring-offset-2 dark:ring-offset-black",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCoverInput(!showCoverInput)}
                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                title="Set Cover Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              {showCoverInput && (
                <div className="absolute top-full left-0 mt-3 p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-72 z-50">
                  <p className="text-[10px] font-bold mb-3 uppercase tracking-[0.1em] text-stone-400">
                    Cover Image URL
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="flex-1 bg-stone-100 dark:bg-stone-950 border border-stone-50 dark:border-stone-800 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <button
                      onClick={() => {
                        const randomId = Math.floor(Math.random() * 1000);
                        setCoverUrl(
                          `https://picsum.photos/seed/${randomId}/1200/400`,
                        );
                      }}
                      className="p-2.5 bg-stone-100 dark:bg-stone-950 border border-stone-50 dark:border-stone-800 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                      title="Random"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {coverUrl && (
                    <button
                      onClick={() => setCoverUrl("")}
                      className="mt-3 text-[10px] text-red-500 font-bold hover:underline"
                    >
                      Remove Cover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-5 py-2.5 rounded-[14px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              {isPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => {
                handleSave();
                onClose();
              }}
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-6xl hover:scale-110 transition-transform active:scale-90"
                >
                  {emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-4 z-50">
                    <EmojiPicker
                      onEmojiClick={(data: EmojiClickData) => {
                        setEmoji(data.emoji);
                        setShowEmojiPicker(false);
                      }}
                      theme={
                        document.documentElement.classList.contains("dark")
                          ? "dark"
                          : ("light" as any)
                      }
                    />
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Untitled Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-5xl font-extrabold bg-transparent border-none outline-none placeholder:text-stone-200 dark:placeholder:text-stone-800 tracking-tight"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/5 dark:bg-white/5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-black/5 dark:border-white/5"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                className="bg-transparent border-none outline-none text-xs w-32 placeholder:text-stone-400 font-medium"
              />
            </div>

            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="text-xs text-stone-400 font-medium">
            {isNew
              ? "New note"
              : `Last edited ${format(new Date(note.updated_at), "PPP p")}`}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => {
                handleSave();
                onClose();
              }}
              className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs shadow-2xl shadow-[var(--accent)]/30 transition-all active:scale-95"
            >
              {isNew ? "Create Note" : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
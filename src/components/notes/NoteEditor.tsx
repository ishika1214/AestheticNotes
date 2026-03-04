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
  { name: "Default", value: "bg-white dark:bg-stone-900" },
  { name: "Rose", value: "bg-rose-50 dark:bg-rose-950/30" },
  { name: "Amber", value: "bg-amber-50 dark:bg-amber-950/30" },
  { name: "Emerald", value: "bg-emerald-50 dark:bg-emerald-950/30" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-950/30" },
  { name: "Indigo", value: "bg-indigo-50 dark:bg-indigo-950/30" },
  { name: "Violet", value: "bg-violet-50 dark:bg-violet-950/30" },
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

  const handleSave = () => {
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={cn(
          "w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative",
          color,
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                isPinned && "text-[#4a2d5a]",
              )}
            >
              <Pin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={cn(
                "p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                isPublic && "text-[#4a2d5a]",
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
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 flex gap-2 z-50">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setColor(c.value);
                        setShowColorPicker(false);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700",
                        c.value,
                        color === c.value &&
                          "ring-2 ring-[#4a2d5a] ring-offset-2",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCoverInput(!showCoverInput)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Set Cover Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              {showCoverInput && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 w-64 z-50">
                  <p className="text-xs font-bold mb-2 uppercase tracking-wider text-stone-400">
                    Cover Image URL
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="flex-1 bg-stone-100 dark:bg-stone-900 border-none rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-[#4a2d5a]"
                    />
                    <button
                      onClick={() => {
                        const randomId = Math.floor(Math.random() * 1000);
                        setCoverUrl(
                          `https://picsum.photos/seed/${randomId}/1200/400`,
                        );
                      }}
                      className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800"
                      title="Random"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {coverUrl && (
                    <button
                      onClick={() => setCoverUrl("")}
                      className="mt-2 text-[10px] text-red-500 font-bold hover:underline"
                    >
                      Remove Cover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium transition-colors"
            >
              {isPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => {
                handleSave();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-5xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50">
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
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-xs font-medium"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                className="bg-transparent border-none outline-none text-xs w-24 placeholder:text-stone-400"
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
              className="px-6 py-2 bg-[#4a2d5a] hover:bg-[#3d2147] text-white rounded-xl font-bold shadow-lg shadow-[#4a2d5a]/20 transition-all active:scale-95"
            >
              {isNew ? "Create" : "Done"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
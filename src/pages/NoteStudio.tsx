import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import BookView from "../components/notes/BookView";
import {
  Pin,
  Globe,
  Lock,
  Palette,
  X,
  Trash2,
  ChevronLeft,
  CloudCheck,
  Sparkles,
  Plus
} from "lucide-react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { cn } from "../lib/utils";
import { NOTE_COLORS, resolveNoteColor } from "../lib/palette";
import { RichTextEditor } from "../components/editor/RichTextEditor";
import AIActions from "../components/ai/AIActions";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { CircleFace } from "../components/ui/Doodles";
import api from "../api/axios";


interface NoteStudioProps {
  isNew?: boolean;
}

export default function NoteStudio({ isNew = false }: NoteStudioProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [color, setColor] = useState(NOTE_COLORS[0].key);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const { search } = useLocation();
  const queryType = new URLSearchParams(search).get('type') as 'note' | 'novel' | 'diary' | null;

  const [type, setType] = useState<'note' | 'novel' | 'diary'>(queryType || 'note');
  const [sections, setSections] = useState<{ title: string; content: string; date?: string; _id?: string }[]>(
    (queryType === 'novel' || queryType === 'diary') ? [{ title: "Chapter 1", content: "" }] : []
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // NEW — AI Studio Panel State
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const justCreatedRef = useRef(false);

  useEffect(() => {
    if (!isNew && id && !justCreatedRef.current) {
      fetchNote();
    }
  }, [id, isNew]);

  const fetchNote = async () => {
    try {
      const { data } = await api.get(`/notes`);
      const note = data.find((n: any) => n._id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setEmoji(note.emoji);
        setColor(note.color);
        setIsPublic(note.is_public);
        setIsPinned(note.is_pinned);
        setTags(note.tags);
        setType(note.type || 'note');
        setSections(note.sections || []);
        setCoverUrl(note.cover_image || "");
        setUpdatedAt(note.updated_at);
        // Always open at the last entry/page
        if (note.sections && note.sections.length > 0) {
          setCurrentPage(note.sections.length - 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const hasSectionsContent = sections.some(s => s.title.trim() || s.content.trim());
    if (!title.trim() && !content.trim() && !hasSectionsContent) return;

    setIsSaving(true);
    try {
      const payload = {
        title,
        content,
        emoji,
        color,
        is_public: isPublic,
        is_pinned: isPinned,
        tags,
        type,
        sections,
        cover_image: coverUrl || null
      };

      if (isNew) {
        const { data } = await api.post("/notes", payload);
        justCreatedRef.current = true;

        navigate(`/note/${data._id}`, { replace: true });
        toast.success("Note saved");
      } else {
        await api.put(`/notes/${id}`, payload);
        toast.success("Changes saved");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Couldn't save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async () => {
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Couldn't delete this note.");
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleSplitPage = (index: number, keep: string, move: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], content: keep };
    
    const newSection = { 
      title: type === 'diary' ? `Entry ${index + 2}` : `Chapter ${index + 2}`, 
      content: move,
      date: new Date().toISOString()
    };
    
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    
    // Calculate new spread index for BookView
    const newSpread = Math.floor((index + 1) / 2);
    setCurrentPage(newSpread);
  };

  // Aggregated content for AI actions
  const aggregatedContent = type === 'note' 
    ? content 
    : sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');

  const activeColor = resolveNoteColor(color);

  const addEntry = () => {
    const newIndex = sections.length;
    setSections([...sections, { title: type === 'diary' ? `Entry ${newIndex + 1}` : `Chapter ${newIndex + 1}`, content: "", date: new Date().toISOString() }]);
    setCurrentPage(newIndex);
  };

  const splitCurrentPage = () => {
    const text = sections[currentPage]?.content ?? "";
    const mid = Math.floor(text.length / 2);
    handleSplitPage(currentPage, text.slice(0, mid), text.slice(mid));
  };

  const goBack = async () => {
    if (isNew) {
      if (title.trim() || content.trim()) {
        await handleSave(); // handleSave handles navigation for new notes
      } else {
        navigate("/dashboard");
      }
    } else {
      await handleSave();
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <CircleFace className="w-14 h-14 energy-pulse" color="#f27a1a" mood="happy" />
          <p className="text-sm text-[var(--muted)]">Opening your note…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* TOOLBAR */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-3 sm:px-6 py-3">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button onClick={goBack} className="btn-ghost pl-3">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">All notes</span>
          </button>

          <div className="hidden sm:block h-6 w-px bg-[var(--border)] mx-1" />

          <button
            onClick={() => setIsPinned(!isPinned)}
            className={cn("icon-btn", isPinned && "!text-[#f27a1a]")}
            title={isPinned ? "Unpin" : "Pin"}
          >
            <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
          </button>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={cn("icon-btn", isPublic && "!text-[var(--text)]")}
            title={isPublic ? "Public" : "Private"}
          >
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="icon-btn"
              title="Note colour"
            >
              <Palette className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="card absolute top-full left-0 mt-2 p-3 grid grid-cols-4 gap-2 z-50"
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        setColor(c.key);
                        setShowColorPicker(false);
                      }}
                      title={c.name}
                      className={cn(
                        "w-9 h-9 rounded-full border-[1.5px] border-black/10 transition-transform hover:scale-110",
                        activeColor.key === c.key && "ring-2 ring-[#f27a1a] ring-offset-2 ring-offset-[var(--surface)]"
                      )}
                      style={{ background: c.swatch }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={cn(
              "ml-1 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95",
              isAIPanelOpen
                ? "bg-[#f27a1a] text-white"
                : "bg-[var(--surface)] border-[1.5px] border-[var(--border)] hover:border-[#f27a1a]"
            )}
            title="AI Studio"
          >
            <Sparkles className={cn("w-4 h-4", !isAIPanelOpen && "text-[#f27a1a]")} />
            <span className="hidden md:inline">AI Studio</span>
          </button>

          {(type === 'diary' || type === 'novel') && (
            <div className="hidden lg:flex items-center gap-1 ml-1">
              <button onClick={splitCurrentPage} className="btn-ghost text-[var(--muted)]" title="Split this page in two">
                <Plus className="w-4 h-4" /> Split page
              </button>
              <button onClick={addEntry} className="btn-ghost text-[var(--muted)]" title="Start a fresh page">
                <Plus className="w-4 h-4" /> {type === 'diary' ? "New entry" : "New chapter"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <CloudCheck className="w-4 h-4 text-[#2fb36a]" />
            {isSaving ? "Saving…" : updatedAt ? `Edited ${format(new Date(updatedAt), "MMM d, p")}` : "Not saved yet"}
          </span>
          <button onClick={handleSave} disabled={isSaving} className="btn-pill px-5 py-2.5">
            Save
          </button>
          {!isNew && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="icon-btn hover:!text-[#d1495b]"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile book controls */}
      {(type === 'diary' || type === 'novel') && (
        <div className="flex lg:hidden items-center gap-2 px-4 pb-2">
          <button onClick={splitCurrentPage} className="chip"><Plus className="w-3.5 h-3.5" /> Split page</button>
          <button onClick={addEntry} className="chip"><Plus className="w-3.5 h-3.5" /> {type === 'diary' ? "New entry" : "New chapter"}</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative px-2 sm:px-4 pb-2 sm:pb-4 gap-4">
        {/* CANVAS */}
        <main
          className={cn(
            "flex-1 overflow-y-auto scrollbar-hide rounded-[32px] transition-colors duration-500 shadow-[var(--shadow)]",
            activeColor.surface
          )}
        >
          <div className="mx-auto w-full max-w-3xl px-5 sm:px-12 py-8 sm:py-14 flex flex-col min-h-full">
            {/* EMOJI + TITLE */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-white/70 dark:bg-white/10 text-4xl md:text-5xl transition-transform hover:scale-105 active:scale-95"
                  title="Change emoji"
                >
                  {emoji}
                </button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      className="absolute top-full left-0 mt-3 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={(data: EmojiClickData) => {
                          setEmoji(data.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme={document.documentElement.classList.contains("dark") ? Theme.DARK : Theme.LIGHT}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                placeholder="Untitled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 min-w-0 pt-2 md:pt-4 text-3xl md:text-5xl font-semibold bg-transparent border-none outline-none placeholder:opacity-30 placeholder:text-current tracking-tight leading-tight"
              />
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-white/10 pl-3 pr-2 py-1.5 text-xs font-medium"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-black/5"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={addTag}
                className="bg-transparent border-none outline-none text-xs font-medium w-28 px-2 py-1.5 placeholder:opacity-50 placeholder:text-current"
              />
            </div>

            {/* EDITOR / BOOK */}
            <div className={cn("flex-1 w-full", type !== 'note' && "pb-10")}>
              {type === 'note' ? (
                <RichTextEditor value={content} onChange={setContent} />
              ) : (
                <BookView
                  type={type as 'novel' | 'diary'}
                  sections={sections}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onUpdateSection={(index, updates) => {
                    const newSections = [...sections];
                    newSections[index] = { ...newSections[index], ...updates };
                    setSections(newSections);
                  }}
                  onAddSection={() => {
                    setSections([...sections, { title: "New Chapter", content: "" }]);
                  }}
                  onRemoveSection={(index) => {
                    setSections(sections.filter((_, i) => i !== index));
                  }}
                />
              )}
            </div>

            <footer className="mt-12 pt-6 border-t border-current/10 text-xs opacity-50">
              {isNew
                ? "A fresh page. Start anywhere."
                : `Last edited ${format(new Date(updatedAt || Date.now()), "PPPP")}`}
            </footer>
          </div>
        </main>

        {/* AI STUDIO PANEL */}
        <motion.aside
          initial={false}
          animate={{
            width: isAIPanelOpen ? (window.innerWidth < 768 ? '100%' : (isAIExpanded ? 850 : 400)) : 0,
            opacity: isAIPanelOpen ? 1 : 0,
            x: isAIPanelOpen ? 0 : (window.innerWidth < 768 ? '100%' : 0)
          }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className={cn(
            "h-full overflow-hidden flex flex-col z-50 bg-[var(--surface)] shadow-[var(--shadow)]",
            "fixed inset-y-0 right-0 md:relative md:rounded-[32px]"
          )}
        >
          <div className={cn(
            "h-full p-5 sm:p-7 flex flex-col overflow-hidden",
            isAIExpanded ? "w-full md:w-[850px]" : "w-full md:w-[400px]"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="w-5 h-5 text-[#f27a1a]" /> AI Studio
              </h3>
              <button onClick={() => setIsAIPanelOpen(false)} className="icon-btn" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <AIActions
              content={aggregatedContent}
              original={{ title, content: aggregatedContent, tags }}
              onUpdate={(u) => {
                if (u.title) setTitle(u.title);
                if (u.content) {
                  if (type === 'note') {
                    setContent(u.content);
                  } else {
                    // For novels/diaries, we apply the AI update to the current chapter
                    const newSections = [...sections];
                    newSections[currentPage] = {
                      ...newSections[currentPage],
                      content: u.content
                    };
                    setSections(newSections);
                  }
                }
                if (u.tags) setTags([...new Set([...tags, ...u.tags])]);
              }}
              onPreviewChange={setIsAIExpanded}
            />
          </div>
        </motion.aside>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this note?"
        message="This note will be removed for good. This can't be undone."
        confirmText="Delete"
        onConfirm={deleteNote}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

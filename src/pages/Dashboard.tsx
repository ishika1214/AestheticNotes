import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Moon,
  Sun,
  LayoutGrid,
  List as ListIcon,
  Hash,
  Pin,
  LogOut,
  Sparkles,
  Book,
  PenTool,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../store/slices/authSlice";
import {
  fetchNotes,
  fetchTags,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
} from "../store/slices/noteSlice";
import NoteCard from "../components/notes/NoteCard";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { cn } from "../lib/utils";
import {
  CircleFace,
  HexFace,
  BlobFace,
  Starburst,
  Leaf,
  FaceCluster,
} from "../components/ui/Doodles";

const CREATE_OPTIONS = [
  { type: "note", label: "Note", icon: <FileText className="w-4 h-4" />, color: "#f27a1a" },
  { type: "novel", label: "Novel", icon: <Book className="w-4 h-4" />, color: "#4cc4c0" },
  { type: "diary", label: "Diary", icon: <PenTool className="w-4 h-4" />, color: "#2fb36a" },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, tags: allTags } = useAppSelector((state) => state.notes);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<'all' | 'note' | 'novel' | 'diary'>('all');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  function getInitialTheme() {
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchTags());

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        navigate("/note/new?type=note");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, navigate]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCreateNote = (type: 'note' | 'novel' | 'diary' = 'note') => {
    navigate(`/note/new?type=${type}`);
  };

  const handleDeleteNote = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete this note?",
      message: "This note will be removed for good. This can't be undone.",
      onConfirm: () => {
        dispatch(deleteNote(id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        toast.success("Note deleted");
      },
    });
  };

  const handleBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete selected notes?",
      message: `${selectedIds.length} notes will be removed for good. This can't be undone.`,
      onConfirm: () => {
        dispatch(bulkDeleteNotes(selectedIds));
        const count = selectedIds.length;
        setSelectedIds([]);
        toast.success(`${count} notes deleted`);
      },
    });
  };

  const toggleSelectNote = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => n.tags.includes(tag));

    const matchesType = activeType === 'all' || (n.type || 'note') === activeType;

    return matchesSearch && matchesTags && matchesType;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  const countOf = (t: 'note' | 'novel' | 'diary') => notes.filter((n) => (n.type || 'note') === t).length;

  const gridClass = cn(
    "grid gap-5",
    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
  );

  const renderCard = (note: (typeof notes)[number]) => (
    <NoteCard
      key={note._id}
      note={note}
      viewMode={viewMode}
      onClick={() => navigate(`/note/${note._id}`)}
      onPin={() => dispatch(updateNote({ id: note._id, updates: { is_pinned: !note.is_pinned } }))}
      onDelete={() => handleDeleteNote(note._id)}
      isSelectionMode={selectedIds.length > 0}
      isSelected={selectedIds.includes(note._id)}
      onSelect={() => toggleSelectNote(note._id)}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 shrink-0">
            <CircleFace className="w-8 h-8" color="#f27a1a" mood="happy" />
            <span className="text-xl font-semibold tracking-tight hidden sm:block">Aesthetic</span>
          </button>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search your notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field rounded-full pl-12 py-3"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="icon-btn hidden sm:inline-flex"
              title={viewMode === "grid" ? "List view" : "Grid view"}
            >
              {viewMode === "grid" ? <ListIcon className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
            <button onClick={toggleTheme} className="icon-btn" title="Toggle theme">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition-all hover:border-[var(--accent)] active:scale-95"
              title="AI Companion"
            >
              <Sparkles className="w-4 h-4 text-[#f27a1a]" />
              <span className="hidden md:inline">Ask AI</span>
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="icon-btn hover:!text-[#d1495b]"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-32">
        {/* WELCOME BANNER */}
        <section className="grain relative overflow-hidden rounded-[36px] bg-[#f9e4cf] text-[#0b3b3c] dark:bg-[#143b3c] dark:text-[#f6efe6] px-6 py-10 sm:px-12 sm:py-12 mt-2 mb-10">
          <div className="relative z-10 max-w-lg">
            <p className="text-sm opacity-70">{greeting()}{user?.username ? `, ${user.username}` : ""}</p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
              What's on your mind today?
            </h1>
            <p className="mt-4 text-sm opacity-75">
              {notes.length === 0
                ? "Your space is ready. Start with a note, a novel or a diary."
                : `${countOf('note')} notes · ${countOf('novel')} novels · ${countOf('diary')} diaries`}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {CREATE_OPTIONS.map((opt, i) => (
                <button
                  key={opt.type}
                  onClick={() => handleCreateNote(opt.type)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95",
                    i === 0
                      ? "bg-[#0b3b3c] text-white hover:bg-[#082c2d] dark:bg-[#f9e4cf] dark:text-[#0b3b3c]"
                      : "bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15",
                  )}
                >
                  {opt.icon}
                  New {opt.label.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 bottom-0 hidden w-[42%] md:block">
            <HexFace className="float-soft absolute right-[38%] top-[12%] w-28" style={{ ["--r" as string]: "-10deg" }} />
            <BlobFace className="absolute right-[6%] top-[-14%] w-36" />
            <CircleFace className="absolute right-[14%] bottom-[-18%] w-36" />
            <Starburst className="absolute right-[48%] bottom-[8%] w-16" />
            <Leaf className="absolute right-[-4%] bottom-[18%] w-24" />
          </div>
        </section>

        {/* TYPE TABS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="inline-flex w-fit rounded-full bg-[var(--surface)] p-1 shadow-[var(--shadow)] overflow-x-auto scrollbar-hide max-w-full">
            {([
              { id: 'all', label: 'All' },
              { id: 'note', label: 'Notes' },
              { id: 'novel', label: 'Novels' },
              { id: 'diary', label: 'Diaries' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                className="relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors"
                style={{ color: activeType === tab.id ? 'var(--accent-contrast)' : 'var(--muted)' }}
              >
                {activeType === tab.id && (
                  <motion.span layoutId="activeTabIndicator" className="absolute inset-0 rounded-full bg-[var(--accent)]" />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--muted)]">
            {filteredNotes.length} {filteredNotes.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* TAGS FILTER */}
        {allTags.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedTags([])}
              data-active={selectedTags.length === 0}
              className="chip shrink-0"
            >
              All tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                data-active={selectedTags.includes(tag)}
                className="chip shrink-0"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="card flex flex-col items-center px-6 py-16 text-center">
            <FaceCluster className="h-40 w-48" />
            <h2 className="mt-6 text-xl font-semibold">
              {notes.length === 0 ? "Nothing here yet" : "No matches"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
              {notes.length === 0
                ? "Create your first note and it will show up here."
                : "Try a different search, tag or tab."}
            </p>
            {notes.length === 0 && (
              <button onClick={() => handleCreateNote()} className="btn-pill mt-6">
                <Plus className="w-4 h-4" /> New note
              </button>
            )}
          </div>
        )}

        {pinnedNotes.length > 0 && (
          <section className="mb-10">
            <h2 className="eyebrow mb-4 flex items-center gap-2">
              <Pin className="w-3 h-3" /> Pinned
            </h2>
            <div className={gridClass}>{pinnedNotes.map(renderCard)}</div>
          </section>
        )}

        {otherNotes.length > 0 && (
          <section>
            {pinnedNotes.length > 0 && <h2 className="eyebrow mb-4">Everything else</h2>}
            <div className={gridClass}>{otherNotes.map(renderCard)}</div>
          </section>
        )}
      </main>

      {/* CREATE MENU */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showCreateMenu && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="card flex flex-col gap-1 p-2"
            >
              {CREATE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleCreateNote(opt.type)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--bg)]"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ background: opt.color }}
                  >
                    {opt.icon}
                  </span>
                  New {opt.label.toLowerCase()}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          whileTap={{ scale: 0.95 }}
          className="btn-pill px-6 py-4 shadow-[0_20px_40px_-12px_rgba(11,59,60,0.45)]"
        >
          <Plus className={cn("w-5 h-5 transition-transform duration-300", showCreateMenu && "rotate-45")} />
          <span className="hidden sm:block">{showCreateMenu ? "Close" : "Create"}</span>
        </motion.button>
      </div>

      {/* BULK BAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-[#0b3b3c] py-2 pl-3 pr-2 text-white shadow-[0_24px_48px_-12px_rgba(11,59,60,0.5)] dark:bg-[#f9e4cf] dark:text-[#0b3b3c]"
          >
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-full p-2 transition-colors hover:bg-white/10 dark:hover:bg-black/5"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-full bg-[#f2a5ad] px-5 py-2.5 text-sm font-medium text-[#0b3b3c] transition-all hover:bg-[#f48d98] active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

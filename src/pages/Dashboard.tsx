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
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Logo from "../assets/Logo.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, tags: allTags } = useAppSelector((state) => state.notes);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        handleCreateNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

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

  const handleCreateNote = () => {
    navigate("/note/new");
  };

  const handleDeleteNote = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Note",
      message: "Are you sure you want to delete this note? This action cannot be undone.",
      onConfirm: () => {
        dispatch(deleteNote(id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      },
    });
  };

  const handleBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${selectedIds.length} notes permanently?`,
      onConfirm: () => {
        dispatch(bulkDeleteNotes(selectedIds));
        setSelectedIds([]);
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
    return matchesSearch && matchesTags;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#fbfbfe] dark:bg-[#0d0d12] transition-colors duration-700 text-stone-900 dark:text-stone-100">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Designer Dot Grid for extra depth */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-20" />
        
        {/* Soft Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)] opacity-30 dark:opacity-40 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-[var(--neon-cyan)] opacity-30 dark:opacity-30 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[20%] w-[20%] h-[20%] bg-[var(--neon-pink)] opacity-20 dark:opacity-20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" 
        />
      </div>

      <header
        className="
  sticky top-0 z-30
  bg-white/60
  dark:bg-black/40
  backdrop-blur-2xl
  border-b
  border-black/5
  dark:border-white/10
  px-4 py-4
"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={Logo}
                alt="Aesthetic Notes Logo"
                className="w-10 h-10"
              />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block text-[var(--accent)] dark:text-stone-50 uppercase italic">
              Aesthetic Notes
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Search your thoughts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-100/50 dark:bg-[#4a2d5a]/10 border border-transparent focus:border-[var(--accent)]/30 rounded-2xl focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90 text-stone-500 dark:text-stone-400"
              title={viewMode === "grid" ? "List View" : "Grid View"}
            >
              {viewMode === "grid" ? (
                <ListIcon className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90 text-stone-500 dark:text-stone-400"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="p-2.5 hover:bg-[var(--accent)]/10 rounded-xl transition-all active:scale-90 text-[var(--accent)]"
              title="AI Companion"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-black/5 dark:bg-white/5 mx-1" />
            <button
              onClick={() => dispatch(logout())}
              className="p-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90 text-red-500"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedTags([])}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm",
                selectedTags.length === 0
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                  : "bg-white dark:bg-stone-900 border border-black/5 dark:border-white/5 text-stone-500 dark:text-stone-400 hover:bg-stone-50",
              )}
            >
              All Notes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-sm",
                  selectedTags.includes(tag)
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "bg-white dark:bg-stone-900 border border-black/5 dark:border-white/5 text-stone-500 dark:text-stone-400 hover:bg-stone-50",
                )}
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {pinnedNotes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
              <Pin className="w-3 h-3" /> Pinned
            </h2>
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  viewMode={viewMode}
                  onClick={() => navigate(`/note/${note._id}`)}
                  onPin={() =>
                    dispatch(
                      updateNote({
                        id: note._id,
                        updates: { is_pinned: !note.is_pinned },
                      }),
                    )
                  }
                  onDelete={() => handleDeleteNote(note._id)}
                  isSelectionMode={selectedIds.length > 0}
                  isSelected={selectedIds.includes(note._id)}
                  onSelect={() => toggleSelectNote(note._id)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
              Others
            </h2>
          )}
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {otherNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                viewMode={viewMode}
                onClick={() => navigate(`/note/${note._id}`)}
                onPin={() =>
                  dispatch(
                    updateNote({
                      id: note._id,
                      updates: { is_pinned: !note.is_pinned },
                    }),
                  )
                }
                onDelete={() => handleDeleteNote(note._id)}
                isSelectionMode={selectedIds.length > 0}
                isSelected={selectedIds.includes(note._id)}
                onSelect={() => toggleSelectNote(note._id)}
              />
            ))}
          </div>
        </section>
      </main>

      <motion.button
        onClick={handleCreateNote}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-10 right-10 flex items-center gap-3 px-8 py-4 bg-stone-900 dark:bg-stone-50 border border-black/5 dark:border-white/10 rounded-[28px] shadow-[0_32px_64px_-16px_rgba(124,58,237,0.4)] z-40 group overflow-hidden energy-pulse"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-purple)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Plus className="w-5 h-5 text-[var(--neon-purple)] group-hover:rotate-90 transition-transform duration-300 relative z-10" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-black relative z-10">
          Create Masterpiece
        </span>
      </motion.button>

      <AnimatePresence>
        {/* NoteEditor modal integration removed — now using dedicated NoteStudio pages */}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-stone-900 border border-white/10 rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex items-center gap-8 backdrop-blur-3xl"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedIds([])}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-stone-400"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {selectedIds.length} {selectedIds.length === 1 ? 'note' : 'notes'} selected
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                  Bulk Actions
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20"
              >
                <Pin className="w-4 h-4 rotate-45" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

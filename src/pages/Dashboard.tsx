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
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../store/slices/authSlice";
import {
  fetchNotes,
  fetchTags,
  createNote,
  updateNote,
  deleteNote,
} from "../store/slices/noteSlice";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import type { Note, NoteUpdate } from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Logo from "../assets/aesthetic-notes-logo.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NEW_NOTE_TEMPLATE: Note = {
  _id: "",
  title: "",
  content: "",
  emoji: "📝",
  color: "bg-white dark:bg-stone-900",
  is_public: false,
  is_pinned: false,
  tags: [],
  cover_image: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { notes, tags: allTags } = useAppSelector((state) => state.notes);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewNote, setIsNewNote] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    setEditingNote({ ...NEW_NOTE_TEMPLATE, updated_at: new Date().toISOString() });
    setIsNewNote(true);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (updates: NoteUpdate) => {
    if (isNewNote) {
      await dispatch(createNote(updates));
      dispatch(fetchTags());
    } else if (editingNote) {
      dispatch(updateNote({ id: editingNote._id, updates }));
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure?")) {
      dispatch(deleteNote(id));
      setIsEditorOpen(false);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setIsNewNote(false);
    setEditingNote(null);
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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-[#F8F3F6]/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-[#EDD5E3] dark:border-stone-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={Logo} alt="Aesthetic Notes Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Aesthetic Notes
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#EDD5E3]/50 dark:bg-stone-800/50 border-none rounded-full focus:ring-2 focus:ring-[#4a2d5a] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {viewMode === "grid" ? (
                <ListIcon className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTags([])}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                selectedTags.length === 0
                  ? "bg-[#4a2d5a] text-white shadow-md"
                  : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
              )}
            >
              All Notes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1",
                  selectedTags.includes(tag)
                    ? "bg-[#4a2d5a] text-white shadow-md"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
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
                  onClick={() => {
                    setEditingNote(note);
                    setIsNewNote(false);
                    setIsEditorOpen(true);
                  }}
                  onPin={() =>
                    dispatch(updateNote({ id: note._id, updates: { is_pinned: !note.is_pinned } }))
                  }
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
                onClick={() => {
                  setEditingNote(note);
                  setIsNewNote(false);
                  setIsEditorOpen(true);
                }}
                onPin={() =>
                  dispatch(updateNote({ id: note._id, updates: { is_pinned: !note.is_pinned } }))
                }
              />
            ))}
          </div>
        </section>
      </main>

      <button
        onClick={handleCreateNote}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#4a2d5a] hover:bg-[#3d2147] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isEditorOpen && editingNote && (
          <NoteEditor
            note={editingNote}
            onClose={handleCloseEditor}
            onUpdate={handleSaveNote}
            onDelete={() => handleDeleteNote(editingNote._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
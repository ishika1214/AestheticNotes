import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Pin, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {type Note } from '../../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteCardProps {
  note: Note;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onPin: () => void;
}

export default function NoteCard({ note, viewMode, onClick, onPin }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 cursor-pointer transition-all hover:shadow-xl",
        note.color,
        viewMode === 'list' ? "flex items-center p-4 gap-4 bg-[#edd5e3]" : "flex flex-col h-full"
      )}
    >
      {note.cover_image && viewMode === 'grid' && (
        <div className="h-32 w-full overflow-hidden">
          <img 
            src={note.cover_image} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className={cn("p-5 flex-1 flex flex-col  bg-[#edd5e3]", viewMode === 'list' && "p-0")}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl shrink-0">{note.emoji}</span>
            <h3 className="font-bold text-lg truncate">{note.title || 'Untitled'}</h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onPin(); }}
              className={cn("p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5", note.is_pinned && "text-indigo-600 opacity-100")}
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={cn(
          "text-stone-600 dark:text-stone-400 text-sm line-clamp-3 mb-4 flex-1",
          viewMode === 'list' && "line-clamp-1 mb-0"
        )} dangerouslySetInnerHTML ={{ __html: note.content || 'No content...' }} />
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full text-[10px] font-medium uppercase tracking-wider">
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && <span className="text-[10px] text-stone-400">+{note.tags.length - 2}</span>}
          </div>
          <span className="text-[10px] text-stone-400 font-medium">
            {format(new Date(note.updated_at), 'MMM d')}
          </span>
        </div>
      </div>

      {note.is_public && (
        <div className="absolute top-2 left-2 p-1 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full shadow-sm">
          <Globe className="w-3 h-3 text-indigo-600" />
        </div>
      )}
    </motion.div>
  );
}

import { useRef } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "../../lib/utils";

interface Section {
  title: string;
  content: string;
  date?: string;
  _id?: string;
}

interface BookViewProps {
  type: 'novel' | 'diary';
  sections: Section[];
  onUpdateSection: (index: number, updates: Partial<Section>) => void;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  isEditing?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function BookView({
  type,
  sections,
  onUpdateSection,
  isEditing = true,
  currentPage,
  onPageChange
}: BookViewProps) {

  // Ensure there's at least one section
  const safeSections = sections.length > 0 ? sections : [{ title: "Untitled", content: "" }];
  const totalPages = safeSections.length;

  const nextPage = () => onPageChange(Math.min(currentPage + 1, totalPages - 1));
  const prevPage = () => onPageChange(Math.max(currentPage - 1, 0));

  return (
    <div className="relative w-full mx-auto aspect-[3/4] sm:aspect-[4/5]">
      {/* COVER */}
      <div className={cn(
        "grain absolute inset-0 rounded-[32px] shadow-[0_30px_60px_-30px_rgba(11,59,60,0.5)]",
        type === 'diary' ? "bg-[#0b3b3c]" : "bg-[#f27a1a]"
      )} />

      {/* PAGE */}
      <div className="absolute inset-3 sm:inset-5 rounded-[24px] bg-[#fffaf3] dark:bg-[#11292a] text-[#0b3b3c] dark:text-[#f6efe6] overflow-hidden flex flex-col">
        <div className="w-full flex-1 p-6 sm:p-12 relative flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8 text-xs opacity-50">
            <span className="capitalize">{type}</span>
            <span>Page {currentPage + 1} of {totalPages}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-hidden h-full scrollbar-hide"
            >
              <SectionRenderer
                section={safeSections[currentPage]}
                index={currentPage}
                onUpdate={onUpdateSection}
                isEditing={isEditing}
                type={type}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute inset-x-0 -bottom-20 flex items-center justify-center gap-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="card flex h-12 w-12 items-center justify-center rounded-full text-[var(--text)] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                currentPage === i ? "w-7 bg-[#f27a1a]" : "w-2 bg-current opacity-20 hover:opacity-40"
              )}
              title={`Page ${i + 1}`}
            />
          ))}
          {totalPages > 10 && <span className="text-xs opacity-40 leading-none">…</span>}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          className="card flex h-12 w-12 items-center justify-center rounded-full text-[var(--text)] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          title="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function SectionRenderer({ section, index, onUpdate, isEditing, type }: {
  section: Section,
  index: number,
  onUpdate: (i: number, up: Partial<Section>) => void,
  isEditing: boolean,
  type: string
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isDiary = type === 'diary';
  const date = section.date ? new Date(section.date) : null;

  const titleClass = cn(
    "w-full bg-transparent border-none outline-none font-serif italic placeholder:opacity-30 placeholder:text-current",
    isDiary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
  );

  return (
    <div className={cn(
      "h-full flex flex-col relative overflow-hidden",
      isDiary && "bg-[linear-gradient(transparent_27px,rgba(11,59,60,0.08)_28px)] dark:bg-[linear-gradient(transparent_27px,rgba(255,255,255,0.08)_28px)] bg-[length:100%_28px] leading-[28px]"
    )}>
      <div className="flex items-center gap-4 mb-6">
        <div className={cn(
          "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-[#0b3b3c]",
          isDiary ? "bg-[#d4f0dc]" : "bg-[#f9e4cf]"
        )}>
          <span className="text-[10px] font-medium uppercase leading-none">
            {isDiary && date ? format(date, 'MMM') : 'Ch.'}
          </span>
          <span className="text-lg font-semibold leading-tight">
            {isDiary && date ? format(date, 'dd') : index + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={section.title}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder={isDiary ? "Dear diary…" : "Chapter title…"}
              className={titleClass}
            />
          ) : (
            <h2 className={titleClass}>{section.title}</h2>
          )}
          {isDiary && date && (
            <span className="text-xs opacity-50">{format(date, 'EEEE')}</span>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          ref={textRef}
          value={section.content}
          onChange={(e) => {
            onUpdate(index, { content: e.target.value });
          }}
          placeholder={isDiary ? "How was today?" : "Once upon a time…"}
          className={cn(
            "flex-1 w-full bg-transparent border-none outline-none resize-none leading-relaxed opacity-90 placeholder:opacity-30 placeholder:text-current m-0 p-0 scrollbar-hide overflow-hidden",
            isDiary ? "font-serif text-lg leading-[28px]" : "text-[17px]"
          )}
        />
      ) : (
        <p className={cn(
          "flex-1 leading-relaxed opacity-90 whitespace-pre-wrap scrollbar-hide overflow-hidden",
          isDiary ? "font-serif text-lg leading-[28px]" : "text-[17px]"
        )}>
          {section.content}
        </p>
      )}
    </div>
  );
}

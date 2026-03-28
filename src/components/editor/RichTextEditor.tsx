import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Redo2,
  Undo2,
  LinkIcon,
  Trash2,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuBarProps {
  editor: ReturnType<typeof useEditor> | null;
  isDarkMode?: boolean;
}

function MenuBar({ editor }: MenuBarProps) {
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const buttonClass =
    'p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-95 text-stone-500 dark:text-stone-400';
  const activeButtonClass = 'bg-[var(--accent)] text-white dark:bg-[var(--accent)] dark:text-white shadow-sm';

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={cn(buttonClass, 'disabled:opacity-50')}
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={cn(buttonClass, 'disabled:opacity-50')}
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px bg-black/10 dark:bg-white/10" />

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          buttonClass,
          editor.isActive('bold') && activeButtonClass,
          'disabled:opacity-50'
        )}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          buttonClass,
          editor.isActive('italic') && activeButtonClass,
          'disabled:opacity-50'
        )}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn(
          buttonClass,
          editor.isActive('underline') && activeButtonClass,
          'disabled:opacity-50'
        )}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px bg-black/10 dark:bg-white/10" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          buttonClass,
          editor.isActive('heading', { level: 1 }) && activeButtonClass
        )}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          buttonClass,
          editor.isActive('heading', { level: 2 }) && activeButtonClass
        )}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px bg-black/10 dark:bg-white/10" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          buttonClass,
          editor.isActive('bulletList') && activeButtonClass
        )}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          buttonClass,
          editor.isActive('orderedList') && activeButtonClass
        )}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px bg-black/10 dark:bg-white/10" />

      {/* Quote & Code */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          buttonClass,
          editor.isActive('blockquote') && activeButtonClass
        )}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          buttonClass,
          editor.isActive('codeBlock') && activeButtonClass
        )}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px bg-black/10 dark:bg-white/10" />

      {/* Link */}
      <div className="relative">
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={cn(
            buttonClass,
            editor.isActive('link') && activeButtonClass
          )}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {showLinkInput && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 z-50">
            <input
              type="text"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              className="w-48 px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
            />
            <button
              onClick={handleAddLink}
              className="mt-2 w-full px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
            >
              Add Link
            </button>
          </div>
        )}
      </div>

      {/* Clear formatting */}
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className={cn(buttonClass)}
        title="Clear formatting"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode?: boolean;
  placeholder?: string;
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, isDarkMode = false }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          hardBreak: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    return (
      <div ref={ref} className="w-full rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden bg-transparent">
        <div className="px-6"> 
          <MenuBar editor={editor} isDarkMode={isDarkMode} />
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-stone dark:prose-invert max-w-none px-12  focus:outline-none text-base leading-relaxed"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

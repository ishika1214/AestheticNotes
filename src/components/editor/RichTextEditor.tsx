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
import { cn } from '../../lib/utils';

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
    'p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 opacity-70 hover:opacity-100';
  const activeButtonClass = '!bg-[#0b3b3c] !text-white !opacity-100 dark:!bg-[#f9e4cf] dark:!text-[#0b3b3c]';

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-full bg-white/80 dark:bg-black/25 backdrop-blur-md px-2 py-1.5 w-fit max-w-full shadow-[var(--shadow)]">
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

      <div className="mx-1 h-5 w-px bg-current opacity-10" />

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

      <div className="mx-1 h-5 w-px bg-current opacity-10" />

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

      <div className="mx-1 h-5 w-px bg-current opacity-10" />

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

      <div className="mx-1 h-5 w-px bg-current opacity-10" />

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

      <div className="mx-1 h-5 w-px bg-current opacity-10" />

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
          <div className="card absolute top-full left-0 mt-2 p-3 z-50 text-[var(--text)]">
            <input
              type="text"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              className="field w-56 py-2.5"
              autoFocus
            />
            <button
              onClick={handleAddLink}
              className="btn-pill mt-2 w-full py-2"
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
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-[var(--accent)] underline cursor-pointer',
          },
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    React.useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }, [value, editor]);

    return (
      <div ref={ref} className="w-full">
        <MenuBar editor={editor} isDarkMode={isDarkMode} />
        <EditorContent
          editor={editor}
          className="prose prose-ink max-w-none mt-6 min-h-[50vh] text-[17px] leading-relaxed [&_.ProseMirror]:min-h-[50vh]"
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

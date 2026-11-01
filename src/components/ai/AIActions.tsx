import { 
  AlignLeft,
  Type, 
  Hash, 
  CheckSquare, 
  RefreshCw, 
  Zap,
  ArrowLeft,
  Check,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/aiService';
import AILoading from './AILoading';
import AIPreviewScreen from './AIPreviewScreen';
import { useState, useEffect } from 'react';

interface AIActionsProps {
  content: string;
  original: {
    title: string;
    content: string;
    tags: string[];
  };
  onUpdate: (updates: {
    title?: string;
    content?: string;
    tags?: string[];
    summary?: string;
  }) => void;
  onPreviewChange: (isExpanded: boolean) => void;
}

export default function AIActions({ content, original, onUpdate, onPreviewChange }: AIActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    onPreviewChange(!!previewResult);
  }, [previewResult, onPreviewChange]);

  const handleAI = async (actionId: string, actionLabel: string, fn: () => Promise<any>) => {
    try {
      setIsLoading(true);
      setLoadingMsg(actionLabel);
      const result = await fn();
      if (actionId === 'summarize') {
        let finalResult = result;
        // Secondary safety: if result is a string, try to parse it as JSON
        if (typeof result === 'string') {
          try {
            const start = result.indexOf('{');
            const end = result.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              finalResult = JSON.parse(result.substring(start, end + 1));
            }
          } catch (e) {
            console.error("Frontend JSON recovery failed:", e);
          }
        }
        setPreviewResult(finalResult);
        setActiveAction(actionId);
      } else {
        if (result) {
          setPreviewResult(result);
          setActiveAction(actionId);
        }
      }
    } catch (error) {
      console.error(`AI Error (${actionLabel}):`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewResult) return;
    
    if (typeof previewResult === 'string') {
      if (activeAction === 'title') {
        onUpdate({ title: previewResult });
      } else {
        onUpdate({ content: previewResult });
      }
    } else if (Array.isArray(previewResult)) {
      onUpdate({ tags: previewResult });
    } else if (typeof previewResult === 'object') {
     if (activeAction === 'title') {
          onUpdate({ title: previewResult.title || previewResult });
      } else if (activeAction === 'summarize') {
          // Construct formatted HTML for the full summary result
          const summaryHtml = `
            <h2>Summary</h2>
            <p>${previewResult.summary || ''}</p>
            ${previewResult.keyPoints?.length ? `
              <h2>Key Insights</h2>
              <ul>
                ${previewResult.keyPoints.map((p: string) => `<li>${p}</li>`).join('')}
              </ul>
            ` : ''}
            ${previewResult.actionItems?.length ? `
              <h2>Action Items</h2>
              <ul>
                ${previewResult.actionItems.map((a: string) => `<li>${a}</li>`).join('')}
              </ul>
            ` : ''}
          `.trim();
          
          onUpdate({ summary: previewResult.summary, content: summaryHtml });
      } else {
          onUpdate({ content: previewResult.content || JSON.stringify(previewResult) });
      }
    }
    
    setPreviewResult(null);
    setActiveAction(null);
  };

  const handleDiscard = () => {
    setPreviewResult(null);
    setActiveAction(null);
  };

  const actions = [
    { 
      id: 'summarize', 
      label: 'Summarize', 
      description: 'Condense your notes into key points',
      icon: <AlignLeft className="w-5 h-5" />, 
      tint: "#d2efed",
      handler: () => handleAI('summarize', "Summarizing...", () => aiService.summarize(content)) 
    },
    { 
      id: 'title', 
      label: 'Generate Title', 
      description: 'Find the perfect headline',
      icon: <Type className="w-5 h-5" />, 
      tint: "#fbdcdc",
      handler: () => handleAI('title', "Generating Title...", () => aiService.generateTitle(content)) 
    },
    { 
      id: 'tags', 
      label: 'Suggest Tags', 
      description: 'Auto-categorize with smart tags',
      icon: <Hash className="w-5 h-5" />, 
      tint: "#e7e0f6",
      handler: () => handleAI('tags', "Suggesting Tags...", () => aiService.generateTags(content)) 
    },
    { 
      id: 'professional', 
      label: 'Professional Polish', 
      description: 'Elevate the tone of your writing',
      icon: <RefreshCw className="w-5 h-5" />, 
      tint: "#d4f0dc",
      handler: () => handleAI('professional', "Rewriting...", () => aiService.rewrite(content, 'professional')) 
    },
    { 
      id: 'tasks', 
      label: 'Extract Tasks', 
      description: 'Turn your notes into action items',
      icon: <CheckSquare className="w-5 h-5" />, 
      tint: "#f9e4cf",
      handler: () => handleAI('tasks', "Extracting Tasks...", () => aiService.extractTasks(content)) 
    },
    { 
      id: 'format', 
      label: 'Clean Up Formatting', 
      description: 'Fix formatting and structure',
      icon: <Zap className="w-5 h-5" />, 
      tint: "#fbecc0",
      handler: () => handleAI('format', "Formatting...", () => aiService.format(content)) 
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[var(--surface)]/90 backdrop-blur-sm flex items-center justify-center rounded-3xl"
          >
            <AILoading message={loadingMsg} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {previewResult ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <button onClick={handleDiscard} className="btn-ghost pl-2 text-[var(--muted)]">
                <ArrowLeft className="w-4 h-4" />
                Back to tools
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscard}
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border)] px-4 py-2.5 text-sm font-medium transition-all hover:border-[var(--accent)] active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Discard
                </button>
                <button onClick={handleApply} className="btn-pill px-5 py-2.5">
                  <Check className="w-4 h-4" />
                  Apply
                </button>
              </div>
            </div>

            <AIPreviewScreen
              action={activeAction || ''}
              original={original}
              result={previewResult}
            />
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            <p className="mb-6 text-sm leading-relaxed text-[var(--muted)]">
              Pick a tool. You'll see a preview before anything changes.
            </p>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2 overflow-y-auto scrollbar-hide"
            >
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  variants={item}
                  onClick={action.handler}
                  disabled={isLoading}
                  className="group flex items-center gap-4 rounded-[22px] border-[1.5px] border-[var(--border)] p-3 pr-4 text-left transition-all hover:border-[var(--accent)] disabled:opacity-50"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0b3b3c] transition-transform group-hover:scale-105"
                    style={{ background: action.tint }}
                  >
                    {action.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{action.label}</span>
                    <span className="block text-xs text-[var(--muted)]">{action.description}</span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

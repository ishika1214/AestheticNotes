import { 
  Sparkles, 
  AlignLeft, 
  Type, 
  Hash, 
  CheckSquare, 
  RefreshCw, 
  Layout,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/aiService';
import AILoading from './AILoading';
import { useState } from 'react';

interface AIActionsProps {
  content: string;
  onUpdate: (updates: {
    title?: string;
    content?: string;
    tags?: string[];
    summary?: string;
  }) => void;
}

export default function AIActions({ content, onUpdate }: AIActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleAI = async (action: string, fn: () => Promise<any>) => {
    try {
      setIsLoading(true);
      setLoadingMsg(action);
      const result = await fn();
      if (result) {
        if (typeof result === 'string') {
          onUpdate({ content: result });
        } else if (Array.isArray(result)) {
           onUpdate({ tags: result });
        } else if (typeof result === 'object') {
           onUpdate({ summary: result.summary, content: result.summary });
        }
      }
    } catch (error) {
      console.error(`AI Error (${action}):`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    { 
      id: 'summarize', 
      label: 'Summarize', 
      icon: <AlignLeft className="w-4 h-4" />, 
      gradient: "from-blue-500/80 to-cyan-400/80 shadow-blue-500/20",
      handler: () => handleAI("Summarizing...", () => aiService.summarize(content)) 
    },
    { 
      id: 'title', 
      label: 'New Title', 
      icon: <Type className="w-4 h-4" />, 
      gradient: "from-purple-500/80 to-pink-500/80 shadow-purple-500/20",
      handler: () => handleAI("Generating Title...", async () => {
        const title = await aiService.generateTitle(content);
        onUpdate({ title });
        return null;
      }) 
    },
    { 
      id: 'tags', 
      label: 'Auto Tags', 
      icon: <Hash className="w-4 h-4" />, 
      gradient: "from-indigo-500/80 to-violet-500/80 shadow-indigo-500/20",
      handler: () => handleAI("Suggesting Tags...", () => aiService.generateTags(content)) 
    },
    { 
      id: 'format', 
      label: 'Cleanup', 
      icon: <Zap className="w-4 h-4" />, 
      gradient: "from-amber-400/80 to-orange-500/80 shadow-amber-500/20",
      handler: () => handleAI("Formatting...", () => aiService.format(content)) 
    },
    { 
      id: 'professional', 
      label: 'Professional', 
      icon: <RefreshCw className="w-4 h-4" />, 
      gradient: "from-emerald-400/80 to-teal-500/80 shadow-emerald-500/20",
      handler: () => handleAI("Rewriting...", () => aiService.rewrite(content, 'professional')) 
    },
    { 
      id: 'tasks', 
      label: 'Task List', 
      icon: <CheckSquare className="w-4 h-4" />, 
      gradient: "from-rose-500/80 to-red-400/80 shadow-rose-500/20",
      handler: () => handleAI("Extracting Tasks...", () => aiService.extractTasks(content)) 
    },
  ];

  return (
    <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-[28px] p-2.5 shadow-2xl shadow-black/5">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center rounded-[24px]"
          >
            <AILoading message={loadingMsg} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-50 rounded-2xl shadow-lg shrink-0">
          <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-black">
            AI Magic
          </span>
        </div>
        
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.handler}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-6 py-3 bg-gradient-to-br ${action.gradient} 
              rounded-2xl text-[10px] font-black uppercase tracking-widest text-white
              hover:scale-105 hover:brightness-110 shadow-lg transition-all active:scale-95 
              disabled:opacity-50 whitespace-nowrap
            `}
          >
            <span className="bg-white/20 p-1.5 rounded-lg">
                {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

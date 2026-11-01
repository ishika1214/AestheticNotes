import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIPreviewScreenProps {
  action: string;
  original: {
    title: string;
    content: string;
    tags: string[];
  };
  result: any;
}

export default function AIPreviewScreen({ action, original, result }: AIPreviewScreenProps) {
  const getComparisonData = () => {
    switch (action) {
      case 'title':
        return {
          label: 'Title Suggestion',
          left: original.title || 'Untitled Thought',
          right: typeof result === 'string' ? result : result.title || result,
          isFullWidth: true
        };
      case 'tags':
        return {
          label: 'Suggested Tags',
          left: original.tags.join(', ') || 'No tags',
          right: Array.isArray(result) ? result.join(', ') : result,
          isFullWidth: true
        };
      case 'summarize':
        return {
          label: 'Summary Preview',
          left: original.content,
          right: result.summary || result,
          type: 'content'
        };
      case 'professional':
        return {
          label: 'Polished Version',
          left: original.content,
          right: result.content || result,
          type: 'content'
        };
      case 'tasks':
        return {
          label: 'Extracted Tasks',
          left: original.content,
          right: result,
          type: 'content'
        };
      case 'format':
        return {
          label: 'Formatted Draft',
          left: original.content,
          right: result,
          type: 'content'
        };
      default:
        return {
          label: 'AI Suggestion',
          left: original.content,
          right: result,
          type: 'content'
        };
    }
  };

  const data = getComparisonData();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-4">
        <p className="eyebrow mb-1">Review</p>
        <h4 className="text-lg font-semibold">{data.label}</h4>
      </div>

      <div className={cn(
        "relative flex-1 grid gap-4 min-h-0",
        data.isFullWidth ? "grid-rows-2" : "grid-cols-2"
      )}>
        {/* ORIGINAL SIDE */}
        <div className="flex flex-col min-h-0 bg-[var(--bg)] rounded-[24px] p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-xs text-[var(--muted)]">
            <span>Before</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {action === 'title' ? (
              <p className="text-xl font-semibold opacity-50">
                {original.title || 'Untitled Thought'}
              </p>
            ) : action === 'tags' ? (
              <div className="text-sm opacity-60">
                {original.tags.join(', ') || 'No tags'}
              </div>
            ) : (
                <div 
                  className="prose prose-sm prose-ink max-w-none opacity-60 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: original.content }}
                />
            )}
          </div>
        </div>

        {/* TRANSITION ICON (only in side-by-side mode) */}
        {!data.isFullWidth && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#f27a1a] text-white rounded-full flex items-center justify-center shadow-[var(--shadow)]">
            <ArrowRight className="w-4 h-4" />
          </div>
        )}

        {/* SUGGESTED SIDE */}
        <div className="flex flex-col min-h-0 bg-[#f9e4cf] text-[#0b3b3c] dark:bg-[#143b3c] dark:text-[#f6efe6] rounded-[24px] p-5 overflow-hidden relative">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#f27a1a]" />
            <span>Suggestion</span>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
                {action === 'title' ? (
                  <p className="text-xl font-semibold">
                    {typeof result === 'string' ? result : result.title || result}
                  </p>
                ) : action === 'tags' ? (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(result) ? result : [result]).map((tag: string) => (
                      <span key={tag} className="rounded-full bg-white/80 dark:bg-white/10 px-3 py-1.5 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    {(result.summary || typeof result === 'string') && (
                      <div>
                        <h5 className="text-xs font-semibold mb-2 opacity-70">
                          Summary
                        </h5>
                        <div 
                          className="prose prose-sm prose-ink max-w-none leading-relaxed text-[15px]"
                          dangerouslySetInnerHTML={{ __html: result.summary || (typeof result === 'string' ? result : '') }}
                        />
                      </div>
                    )}

                    {/* Key Points Section */}
                    {Array.isArray(result.keyPoints) && result.keyPoints.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold mb-2 opacity-70">
                          Key points
                        </h5>
                        <ul className="space-y-3">
                          {result.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm leading-snug">
                               <span className="shrink-0 w-2 h-2 rounded-full bg-[#f27a1a] mt-1.5" />
                               {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items Section */}
                    {Array.isArray(result.actionItems) && result.actionItems.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold mb-2 opacity-70">
                          Action items
                        </h5>
                        <ul className="space-y-2">
                          {result.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm leading-snug p-3 bg-white/70 dark:bg-black/20 rounded-2xl">
                               <span className="shrink-0 text-[#2fb36a] font-bold">✓</span>
                               {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* RAW FALLBACK — only if nothing else matched */}
                    {!result.summary && !Array.isArray(result.keyPoints) && typeof result !== 'string' && (
                      <div className="p-4 bg-white/60 dark:bg-black/30 rounded-2xl overflow-x-auto">
                        <pre className="text-xs font-mono opacity-70">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
             </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
}

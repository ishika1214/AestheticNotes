import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Send, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  User, 
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AILoading from "../components/ai/AILoading";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/ai/history");
      setMessages(data.history);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear your conversation history?")) return;
    try {
      await api.delete("/ai/history");
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { query: input });
      const modelMsg: Message = {
        role: "model",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90 text-stone-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-50 uppercase italic">
                  AI Companion
                </h1>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                  Chat with your notes
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={clearHistory}
            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90 text-red-500"
            title="Clear Conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide"
        >
          {isFetching ? (
             <div className="h-full flex items-center justify-center">
                <AILoading message="Calling your memories..." />
             </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
               <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-stone-900 border border-black/5 dark:border-white/10 flex items-center justify-center shadow-2xl">
                  <MessageSquare className="w-12 h-12 text-stone-200 dark:text-stone-800" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-stone-900 dark:text-stone-50 mb-2">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto line-relaxed">
                    Ask questions about your notes, brainstorm new ideas, or summarize your projects. 
                    I'm here to help you stay organized and creative.
                  </p>
               </div>
               <div className="flex flex-wrap justify-center gap-3">
                  {["What are my main goals?", "Summarize my recent notes", "Help me brainstorm"].map(q => (
                    <button 
                      key={q}
                      onClick={() => setInput(q)}
                      className="px-4 py-2 bg-white dark:bg-stone-900 border border-black/5 dark:border-white/5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-4",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-110",
                    msg.role === "user" 
                      ? "bg-stone-900 dark:bg-stone-50 text-white dark:text-black" 
                      : "bg-[var(--neon-purple)] text-white neon-glow-purple"
                  )}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-[28px] p-5 shadow-2xl border transition-all duration-300",
                    msg.role === "user"
                      ? "bg-white dark:bg-stone-900 border-black/5 dark:border-white/10 text-stone-900 dark:text-stone-200 rounded-tr-none neon-glow-purple"
                      : "bg-white/40 dark:bg-black/40 border-transparent text-stone-800 dark:text-stone-300 rounded-tl-none backdrop-blur-3xl neon-glow-cyan"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[var(--neon-cyan)] text-white flex items-center justify-center shadow-lg energy-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="bg-white/40 dark:bg-black/40 rounded-[28px] rounded-tl-none p-5 border border-transparent backdrop-blur-3xl energy-pulse">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(d => (
                          <motion.div 
                            key={d}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.1 }}
                            className="w-1.5 h-1.5 bg-[var(--neon-cyan)] rounded-full"
                          />
                        ))}
                      </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-transparent">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative group"
          >
            <textarea
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              className="w-full pl-6 pr-16 py-4 bg-white dark:bg-stone-900 border border-black/5 dark:border-white/10 rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all placeholder:text-stone-400 font-medium resize-none overflow-hidden"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-12 h-12 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-[var(--accent)]/20 shadow-red"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-4">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AILoading from "../components/ai/AILoading";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { cn } from "../lib/utils";
import { CircleFace, FaceCluster } from "../components/ui/Doodles";

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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
    <div className="h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="icon-btn" title="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CircleFace className="w-10 h-10" color="#4cc4c0" mood="happy" />
            <div>
              <h1 className="font-semibold leading-tight">AI Companion</h1>
              <p className="text-xs text-[var(--muted)]">Answers from your own notes</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn-ghost text-[var(--muted)] hover:!text-[#d1495b]"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full flex flex-col min-h-0">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 scrollbar-hide"
        >
          {isFetching ? (
            <div className="h-full flex items-center justify-center">
              <AILoading message="Gathering your notes…" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="grain relative w-full max-w-md overflow-hidden rounded-[36px] bg-[#f9e4cf] dark:bg-[#143b3c] px-6 pt-8 pb-10">
                <FaceCluster className="mx-auto h-36 w-44" />
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#0b3b3c] dark:text-[#f6efe6]">
                  What would you like to know?
                </h2>
                <p className="mt-2 text-sm text-[#0b3b3c]/70 dark:text-[#f6efe6]/70">
                  Ask about your notes, brainstorm ideas or get a quick recap.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["What are my main goals?", "Summarise my recent notes", "Help me brainstorm"].map(q => (
                  <button key={q} onClick={() => setInput(q)} className="chip">
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-end gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "model" && (
                    <CircleFace className="w-8 h-8 shrink-0" color="#4cc4c0" mood="happy" />
                  )}
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-5 py-3.5",
                    msg.role === "user"
                      ? "rounded-[24px] rounded-br-md bg-[#0b3b3c] text-white dark:bg-[#f9e4cf] dark:text-[#0b3b3c]"
                      : "card rounded-[24px] rounded-bl-md"
                  )}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-3"
                >
                  <CircleFace className="w-8 h-8 shrink-0 energy-pulse" color="#4cc4c0" mood="calm" />
                  <div className="card rounded-[24px] rounded-bl-md px-5 py-4">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(d => (
                        <motion.div
                          key={d}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                          className="w-2 h-2 rounded-full bg-[#f27a1a]"
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
        <div className="px-4 sm:px-6 pb-5 pt-2">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              placeholder="Ask anything about your notes…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              className="field rounded-full py-4 pl-6 pr-16 resize-none overflow-hidden shadow-[var(--shadow)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-pill absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 p-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-xs text-[var(--muted)] mt-3">
            AI can make mistakes. Double-check anything important.
          </p>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear this conversation?"
        message="Your chat history with the companion will be removed. Your notes are not affected."
        confirmText="Clear"
        onConfirm={clearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

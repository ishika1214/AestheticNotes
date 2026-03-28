import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  Layout, 
} from "lucide-react";
import Logo from "../assets/Logo.png";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const features = [
  {
    title: "Summarization & Intelligence",
    description: "Instant summaries, task extraction, and professional rewrites powered by Gemini 1.5 Flash.",
    icon: <Zap className="w-8 h-8 text-amber-400" />,
    gradient: "from-amber-400/20 to-orange-500/20",
  },
  {
    title: "Talk to Your Notes (RAG)",
    description: "A context-aware AI Companion that reads your entire library to answer your deepest questions.",
    icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
    gradient: "from-purple-400/20 to-indigo-500/20",
  },
  {
    title: "Creative Studio Canvas",
    description: "An immersive, distraction-free writing environment designed for deep work and high focus.",
    icon: <Layout className="w-8 h-8 text-cyan-400" />,
    gradient: "from-cyan-400/20 to-blue-500/20",
  },
  {
    title: "Automated Semantic Retrieval",
    description: "Every thought you type is automatically indexed using text-embedding-004 for instant connectivity.",
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    gradient: "from-emerald-400/20 to-teal-500/20",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Mesh Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/40 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-black tracking-tighter uppercase italic text-[var(--accent)]">
            Aesthetic Notes
          </span>
        </div>
        <div className="flex items-center gap-8">
            <button 
                onClick={() => navigate("/auth")}
                className="text-xs font-black uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
            >
                Studio Entrance
            </button>
            <button 
                onClick={() => navigate("/auth")}
                className="px-6 py-3 bg-[var(--accent)] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all active:scale-95"
            >
                Start Writing
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-20 pb-40 px-6 max-w-7xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                    Next-Gen AI Workspace Ready
                </span>
            </div>
            
            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500/50">
                Your Thoughts, <br />
                Elevated by AI.
            </h1>
            
            <p className="text-xl text-stone-400 max-w-2xl mx-auto font-medium mb-12">
                The immersive, context-aware digital garden for your ideas. 
                Built with Gemini 1.5 Flash and RAG intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={() => navigate("/auth")}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-[28px] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl"
                >
                    Get Started Free
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                    Showcase Video
                </button>
            </div>
        </motion.div>
      </header>

      {/* Showcase Section */}
      <section className="relative z-10 py-40 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-12">
                <h2 className="text-5xl font-black tracking-tighter">
                   12+ AI Features. <br />
                   One Immersive Canvas.
                </h2>
                <div className="space-y-8">
                    {features.map((f, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-6 group"
                        >
                            <div className={cn("p-4 rounded-2xl bg-gradient-to-br transition-all group-hover:scale-110", f.gradient)}>
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">{f.title}</h3>
                                <p className="text-stone-400 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
             </div>

             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-[100px] z-0" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">NoteStudio Preview</div>
                    </div>
                    <div className="space-y-6 animate-pulse">
                        <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-white/5 rounded-full" />
                            <div className="h-4 w-full bg-white/5 rounded-full" />
                            <div className="h-4 w-[90%] bg-white/5 rounded-full" />
                        </div>
                        <div className="pt-8 grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="h-10 bg-[var(--accent)]/20 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </motion.div>
             </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-40 bg-gradient-to-t from-purple-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter mb-12">
                Ready to transform <br />
                your writing?
            </h2>
            <button 
                onClick={() => navigate("/auth")}
                className="px-16 py-8 bg-[var(--accent)] text-white rounded-full font-black uppercase tracking-[0.2em] text-lg shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all mb-20"
            >
                Get Access Now
            </button>
            <div className="flex flex-col items-center gap-4 text-stone-500 border-t border-white/5 pt-20">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Logo" className="w-6 h-6 grayscale opacity-50" />
                    <span className="text-sm font-bold tracking-tight">Aesthetic Notes Pro // v1.0.4</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Crafted with ❤️ for creators</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

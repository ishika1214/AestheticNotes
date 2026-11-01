import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Plus, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import {
  HexFace,
  CircleFace,
  BlobFace,
  TriangleFace,
  HalfMoon,
  Starburst,
  Asterisk,
  Flower,
  Leaf,
  FaceCluster,
} from "../components/ui/Doodles";

const steps = [
  {
    title: "Write freely",
    description: "A calm, distraction-free canvas for quick notes, long novels, or a daily diary.",
    color: "#f9e4cf",
  },
  {
    title: "Let AI tidy up",
    description: "Summaries, smart titles, tags, task lists and a professional polish in one click.",
    color: "#d2efed",
  },
  {
    title: "Ask your library",
    description: "Chat with an AI companion that has read every note and answers from your own words.",
    color: "#fbdcdc",
  },
];

const kinds = [
  {
    quote: "Quick thoughts, meeting notes and to-dos, with rich formatting and tags to find them again.",
    title: "Studio Notes",
    tone: "light",
  },
  {
    quote: "Chapter by chapter in a book view that turns pages like the real thing.",
    title: "Novels",
    tone: "dark",
  },
  {
    quote: "Dated entries on lined pages, ready whenever you want to look back.",
    title: "Diaries",
    tone: "light",
  },
] as const;

const faqs = [
  {
    q: "What can the AI actually do with my notes?",
    a: "From the AI Studio panel you can summarise a note, generate a title, suggest tags, rewrite it in a professional tone, extract tasks, or clean up formatting. You always see a before/after preview and choose whether to apply it.",
  },
  {
    q: "How does chatting with my notes work?",
    a: "The AI Companion searches your notes for the most relevant passages and uses them to answer, so replies are grounded in what you have written.",
  },
  {
    q: "Are my notes private?",
    a: "Notes are private by default. Each note has a lock / globe toggle so you decide what is public.",
  },
  {
    q: "What's the difference between notes, novels and diaries?",
    a: "Notes use a rich-text editor. Novels and diaries open in a book view with chapters or dated entries you can page through.",
  },
  {
    q: "Is there a dark mode?",
    a: "Yes. Use the sun / moon button in the header and your choice is remembered.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("landing-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("landing-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navLinks = [
    { label: "How it works", href: "#how" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* NAV */}
      <nav className="relative z-50 mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-6 sm:px-8">
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]">
              {l.label}
            </a>
          ))}
        </div>
        <button className="icon-btn md:hidden justify-self-start" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <a href="#" className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <CircleFace className="h-8 w-8" color="#f27a1a" mood="happy" />
          Aesthetic
        </a>

        <div className="flex items-center justify-end gap-2 sm:gap-6">
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="hidden text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] sm:block"
          >
            Sign in
          </button>
          <button onClick={() => navigate("/auth")} className="btn-pill hidden px-5 py-2.5 sm:inline-flex">
            Start writing
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card absolute left-5 right-5 top-full flex flex-col gap-1 p-3 md:hidden"
            >
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm hover:bg-[var(--surface-2)]">
                  {l.label}
                </a>
              ))}
              <button onClick={() => navigate("/auth")} className="btn-pill mt-2">
                Start writing
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grain relative overflow-hidden rounded-[40px] bg-[var(--color-peach)] px-6 py-24 text-center text-[var(--color-ink)] sm:py-32 dark:bg-[#143b3c] dark:text-[#f6efe6]">
          {/* left cluster */}
          <HalfMoon className="absolute -left-8 top-10 w-24 sm:w-32" />
          <HexFace className="float-soft absolute left-6 top-[46%] hidden w-28 sm:block lg:w-36" style={{ ["--r" as string]: "-8deg" }} />
          <BlobFace className="absolute -left-10 bottom-[-30px] w-32 sm:w-40" />
          <CircleFace className="absolute left-[18%] bottom-[-36px] hidden w-28 md:block" />
          <Asterisk className="absolute left-[14%] bottom-6 hidden w-12 lg:block" />
          {/* right cluster */}
          <TriangleFace className="absolute right-4 top-[-20px] w-24 rotate-12 sm:w-32" />
          <BlobFace className="absolute -right-10 top-[38%] hidden w-32 sm:block" color="#4cc4c0" />
          <Starburst className="absolute right-[16%] bottom-10 hidden w-24 md:block" />
          <CircleFace className="absolute right-[22%] bottom-[-44px] hidden w-28 md:block" color="#f2a5ad" mood="happy" />
          <Leaf className="absolute -right-6 bottom-[-20px] w-28 sm:w-36" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto max-w-2xl"
          >
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              A Calm Home for <br className="hidden sm:block" /> Every Thought
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed opacity-80 sm:text-lg">
              Write notes, novels and diaries in one cozy space, with a gentle AI that helps you
              summarise, organise and remember.
            </p>
            <button onClick={() => navigate("/auth")} className="btn-pill mt-10 px-8">
              Get started
            </button>
          </motion.div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto grid max-w-6xl scroll-mt-8 items-center gap-12 px-5 py-24 sm:px-8 md:grid-cols-2 md:py-32">
        <div>
          <p className="eyebrow mb-5">How it works</p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            We Help You Make Space for Your Ideas
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-[var(--muted)]">
            Capture now, tidy later. Aesthetic keeps your writing soft and simple, while the AI quietly does the
            organising in the background.
          </p>
          <div className="mt-10 space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card flex items-start gap-4 p-5"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#0b3b3c]"
                  style={{ background: s.color }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grain relative aspect-square overflow-hidden rounded-[40px] bg-[#0b3b3c] dark:bg-[#062021]"
        >
          <div className="absolute inset-x-[12%] bottom-[-18%] aspect-square rounded-full border-[3px] border-[#f9e4cf]/70 bg-[#f9e4cf]/90" />
          <FaceCluster className="absolute inset-[14%] top-[8%]" />
          <Flower className="absolute left-[8%] top-[10%] w-14" color="#f2a5ad" />
          <Flower className="absolute right-[10%] bottom-[14%] w-12" color="#ecb93f" center="#f27a1a" />
        </motion.div>
      </section>

      {/* NOTE KINDS — styled after the testimonial cards */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-24 sm:px-8 md:pb-32">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Three Ways to Write</h2>
            <p className="mt-5 max-w-sm leading-relaxed text-[var(--muted)]">
              Pick the format that fits the moment. Every one of them works with the AI Studio.
            </p>
            <button onClick={() => navigate("/auth")} className="btn-pill mt-8">
              Try it <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {kinds.map((k, i) => (
              <motion.div
                key={k.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "flex min-h-64 flex-col justify-between rounded-[32px] p-7",
                  k.tone === "dark"
                    ? "bg-[#0b3b3c] text-[#f6efe6] dark:bg-[#062021]"
                    : "bg-[#f9e4cf] text-[#0b3b3c] dark:bg-[#143b3c] dark:text-[#f6efe6]",
                )}
              >
                <p className="text-sm leading-relaxed">"{k.quote}"</p>
                <p className="mt-8 text-sm">— {k.title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="card mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-8 py-6 text-[var(--muted)] sm:justify-between">
          {["Summarise", "Smart titles", "Auto tags", "Polish", "Extract tasks", "Chat with notes"].map((f) => (
            <span key={f} className="text-base font-medium sm:text-lg">
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-8 gap-12 px-5 pb-24 sm:px-8 md:grid-cols-2 md:pb-32">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-[var(--muted)]">
            Answers to common questions about writing, the AI tools, and keeping your notes yours.
          </p>
          <div className="relative mt-10 hidden aspect-[4/3] max-w-sm overflow-hidden rounded-[32px] bg-[var(--color-peach)] md:block dark:bg-[#143b3c]">
            <CircleFace className="absolute bottom-[-18%] left-1/2 w-[60%] -translate-x-1/2" color="#ecb93f" mood="happy" />
            <Flower className="absolute left-[14%] top-[12%] w-16" />
            <Flower className="absolute right-[16%] top-[8%] w-14" color="#f2a5ad" />
            <HexFace className="absolute right-[8%] top-[42%] w-16" />
            <Leaf className="absolute left-[6%] top-[46%] w-14" />
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="card overflow-hidden rounded-[22px]">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium"
                  aria-expanded={open}
                >
                  {f.q}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] transition-transform",
                      open && "rotate-45",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed text-[var(--muted)]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA + FOOTER */}
      <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="grain relative overflow-hidden rounded-[40px] bg-[#0b3b3c] px-6 py-20 text-center text-[#f6efe6] dark:bg-[#062021]">
          <CircleFace className="absolute -left-8 -top-8 w-28" color="#f2a5ad" />
          <HexFace className="absolute -bottom-10 right-10 w-32" />
          <Starburst className="absolute right-[20%] top-8 w-16" color="#f9e4cf" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-5xl">Ready to start writing?</h2>
          <p className="relative mx-auto mt-4 max-w-md opacity-80">Your first note is one click away.</p>
          <button
            onClick={() => navigate("/auth")}
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#f9e4cf] px-8 py-3 text-sm font-medium text-[#0b3b3c] transition-all hover:bg-white active:scale-95"
          >
            Create your space <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span className="flex items-center gap-2">
            <CircleFace className="h-6 w-6" color="#f27a1a" mood="happy" /> Aesthetic Notes
          </span>
          <span>Made with care for writers & thinkers</span>
        </div>
      </footer>
    </div>
  );
}

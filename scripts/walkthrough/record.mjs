/*
 * Records the narrated "how to use" video for the landing page.
 *
 *   1. Seeds a demo account with sample notes through the real API.
 *   2. Generates narration with Gemini text-to-speech (cached in .cache/).
 *   3. Drives the real app in Chromium, drawing a cursor, arrows and captions.
 *   4. Mixes the narration onto the recording and writes an MP4 + poster to
 *      public/walkthrough/.
 *
 * Needs the backend (API_URL) and frontend (APP_URL) running. See README.md.
 */
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:5000/api";
const OUT_DIR = path.resolve(HERE, "../../public/walkthrough");
const CACHE_DIR = path.join(HERE, ".cache");
const VOICE = process.env.TTS_VOICE || "Kore";
const TTS_MODEL = process.env.TTS_MODEL || "gemini-2.5-flash-preview-tts";
const SIZE = { width: 1280, height: 720 };

const DEMO = { username: "demo", email: "demo@aestheticnotes.app", password: "demo-walkthrough-2026" };

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ------------------------------------------------------------------ */
/* Narration script                                                    */
/* ------------------------------------------------------------------ */

const LINES = {
  intro: "Welcome to Aesthetic Notes, a calm home for every thought. Let me show you how it works.",
  signin: "Click Get started, then sign in or create a free account with your email.",
  dashboard: "This is your dashboard. All your notes, novels and diaries live here, with pinned ones at the top.",
  filter: "Use search, the type tabs, and tags to find anything in seconds.",
  create: "To write something new, tap Create, and choose a note, a novel, or a diary.",
  write: "Give it a title and a few tags, then just start writing. The editor supports headings, lists, quotes and links.",
  studio: "Now open the AI Studio. Here you can summarise, generate a title, suggest tags, polish your writing, or pull out tasks.",
  summarise: "Let's summarise this note. The AI shows a preview first, so nothing changes until you press Apply.",
  save: "Happy with it? Press Save, and head back to your notes.",
  book: "Novels and diaries open like a real book. Turn the pages, and add new chapters or dated entries as your story grows.",
  chat: "Have a question? Open Ask AI. The AI Companion reads your notes and answers from your own words.",
  answer: "Here it pulls your goals straight from your Monthly goals note.",
  outro: "Pin what matters, keep notes private or public, and switch to dark mode any time. That's it. Create your free space and start writing.",
};

/* ------------------------------------------------------------------ */
/* Gemini text-to-speech                                               */
/* ------------------------------------------------------------------ */

function geminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envFile = path.resolve(HERE, "../../../AestheticNotes-Backend/.env.local");
  const match = fs.existsSync(envFile) && fs.readFileSync(envFile, "utf8").match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
  if (!match) throw new Error("Set GEMINI_API_KEY (or add it to AestheticNotes-Backend/.env.local)");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function pcmToWav(pcm, sampleRate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tts(text) {
  const hash = crypto.createHash("sha1").update(`${TTS_MODEL}|${VOICE}|${text}`).digest("hex").slice(0, 16);
  const file = path.join(CACHE_DIR, `${hash}.wav`);
  if (fs.existsSync(file)) return file;

  for (let attempt = 1; attempt <= 8; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey() },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Read this aloud in a warm, friendly, calm voice, like a product tour: ${text}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      const body = await res.text();
      const retry = Number(body.match(/"retryDelay":\s*"(\d+)s"/)?.[1] || 20);
      console.log(`  TTS busy (${res.status}), retrying in ${retry + 2}s…`);
      await sleep((retry + 2) * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    if (!b64) throw new Error("TTS returned no audio");
    fs.writeFileSync(file, pcmToWav(Buffer.from(b64, "base64")));
    return file;
  }
  throw new Error("TTS kept failing; try again later");
}

const wavSeconds = (file) => (fs.statSync(file).size - 44) / 48000;

/* ------------------------------------------------------------------ */
/* Demo account                                                        */
/* ------------------------------------------------------------------ */

async function api(method, url, body, token) {
  const res = await fetch(API_URL + url, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function seedDemo() {
  let r = await api("POST", "/auth/login", { email: DEMO.email, password: DEMO.password });
  if (!r.ok) r = await api("POST", "/auth/register", DEMO);
  if (!r.ok) throw new Error(`Could not sign in demo user: ${JSON.stringify(r.data)}`);
  const token = r.data.token;

  // Start every recording from the same clean set of notes.
  const existing = await api("GET", "/notes", null, token);
  const ids = (existing.data || []).map((n) => n._id);
  if (ids.length) await api("DELETE", "/notes/bulk", { ids }, token);

  const notes = [
    {
      title: "Book club notes", emoji: "📚", color: "lagoon", tags: ["reading", "friends"], type: "note",
      content: "<p>Themes of memory and place. Bring questions about the lighthouse keeper for chapter five.</p>",
    },
    {
      title: "Garden ideas", emoji: "🌱", color: "mint", tags: ["home"], type: "note",
      content: "<p>Tomatoes along the fence, herbs by the kitchen window, and a small bench under the apple tree.</p>",
    },
    {
      title: "Little diary", emoji: "🌙", color: "blush", tags: ["personal"], type: "diary", content: "",
      sections: [
        { title: "Rainy Sunday", content: "Stayed in with tea and a good book. Finally sorted the spare room.", date: "2026-10-25T09:00:00.000Z" },
        { title: "A good day", content: "Morning fog over the river. Started writing again and it felt easy.", date: "2026-11-01T09:00:00.000Z" },
      ],
    },
    {
      title: "The Lighthouse", emoji: "🌊", color: "peach", tags: ["novel", "draft"], type: "novel", content: "",
      sections: [
        { title: "The Keeper", content: "The lamp had been dark for eleven years when Mira climbed the spiral stairs and found the logbook still open on the desk." },
        { title: "Low Tide", content: "By morning the causeway had surfaced, glistening, and with it a set of footprints that did not belong to her." },
      ],
    },
    {
      title: "Monthly goals", emoji: "🎯", color: "butter", tags: ["goals", "personal"], type: "note", is_pinned: true,
      content: "<p>This month: read two books, run three times a week, and ship my portfolio website.</p><ul><li>Book: The Lighthouse draft to chapter 5</li><li>Run Tue / Thu / Sat</li><li>Portfolio live by the 30th</li></ul>",
    },
  ];
  for (const n of notes) {
    const res = await api("POST", "/notes", { is_public: false, is_pinned: false, cover_image: null, sections: [], ...n }, token);
    if (!res.ok) throw new Error(`Seeding "${n.title}" failed: ${JSON.stringify(res.data)}`);
  }
  // Fresh chat history so the answer on screen is the only one.
  await api("DELETE", "/ai/history", null, token);
  // Embeddings are generated asynchronously after each create.
  await sleep(6000);
}

/* ------------------------------------------------------------------ */
/* Recording helpers                                                   */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("1/4 Generating narration…");
  const audio = {};
  for (const [key, text] of Object.entries(LINES)) {
    audio[key] = await tts(text);
    console.log(`  ✓ ${key} (${wavSeconds(audio[key]).toFixed(1)}s)`);
  }

  console.log("2/4 Preparing demo account…");
  await seedDemo();

  console.log("3/4 Recording…");
  const browser = await chromium.launch();
  const videoDir = path.join(CACHE_DIR, "video");
  fs.rmSync(videoDir, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: SIZE,
    colorScheme: "light",
    recordVideo: { dir: videoDir, size: SIZE },
  });
  await context.addInitScript({ path: path.join(HERE, "overlay.js") });
  const page = await context.newPage();
  const t0 = Date.now();
  const cues = [];

  const overlay = (fn, ...args) => page.evaluate(([f, a]) => window.__wt[f](...a), [fn, args]);

  /** Starts a narration line; await `.done()` to hold until it has finished. */
  async function say(key) {
    const startedAt = Date.now();
    cues.push({ file: audio[key], at: startedAt - t0 });
    await overlay("caption", LINES[key]);
    const ms = wavSeconds(audio[key]) * 1000;
    return {
      done: async (gap = 450) => {
        const left = startedAt + ms - Date.now();
        if (left > 0) await sleep(left);
        await overlay("caption", "");
        await sleep(gap);
      },
    };
  }

  /** Moves the cursor to an element, optionally showing an arrow + label. */
  async function point(locator, label, side = "top") {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error(`Not visible: ${locator}`);
    await overlay("move", box.x + box.width / 2, box.y + box.height / 2);
    await sleep(750);
    if (label !== undefined) await overlay("highlight", box, label, side);
    return box;
  }

  async function click(locator, label, side) {
    await point(locator, label, side);
    if (label) await sleep(900);
    await overlay("click");
    await sleep(150);
    await locator.click();
    await overlay("clear");
    await sleep(400);
  }

  async function type(locator, text, delay = 45) {
    await click(locator);
    await page.keyboard.type(text, { delay });
  }

  const step = (n, label) => overlay("step", String(n), label);

  /* ---------------- the tour ---------------- */

  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await overlay("ensure");
  await sleep(600);
  const trimMs = Date.now() - t0;

  // Intro on the landing page
  let n = await say("intro");
  await step(1, "Welcome");
  await point(page.getByRole("heading", { level: 1 }), "");
  await n.done();

  // Sign in
  n = await say("signin");
  await step(2, "Sign in");
  await click(page.getByRole("button", { name: "Get started" }).first(), "Click Get started", "bottom");
  await page.waitForURL("**/auth");
  await sleep(500);
  await type(page.getByPlaceholder("Email address"), DEMO.email, 30);
  await type(page.getByPlaceholder("Password"), DEMO.password, 20);
  await click(page.locator('form button[type="submit"]'), "Sign in", "bottom");
  await page.waitForURL("**/dashboard");
  await page.getByText("Monthly goals").first().waitFor();
  await n.done();

  // Dashboard tour
  n = await say("dashboard");
  await step(3, "Your dashboard");
  await point(page.getByText("What's on your mind today?"), "Your home base", "bottom");
  await sleep(1600);
  await point(page.getByText("Pinned").first(), "Pinned notes stay on top", "right");
  await n.done();

  n = await say("filter");
  await point(page.getByPlaceholder("Search your notes"), "Search everything", "bottom");
  await sleep(1300);
  await click(page.getByRole("button", { name: "Novels", exact: true }), "Filter by type", "bottom");
  await sleep(700);
  await click(page.getByRole("button", { name: "All", exact: true }));
  await point(page.getByRole("button", { name: "All tags" }), "Filter by tag", "bottom");
  await n.done();

  // Create a note
  n = await say("create");
  await step(4, "Create a note");
  await click(page.getByRole("button", { name: "Create", exact: true }), "Create", "left");
  await sleep(500);
  await point(page.locator(".card").getByRole("button", { name: "New note" }), "Pick note, novel or diary", "left");
  await n.done(0);
  await click(page.locator(".card").getByRole("button", { name: "New note" }));
  await page.getByPlaceholder("Untitled").waitFor();

  n = await say("write");
  await type(page.getByPlaceholder("Untitled"), "Team retro", 60);
  await type(page.getByPlaceholder("+ Add tag"), "work", 60);
  await page.keyboard.press("Enter");
  await page.keyboard.type("sprint", { delay: 60 });
  await page.keyboard.press("Enter");
  await click(page.locator(".ProseMirror"));
  await page.keyboard.type(
    "We shipped the new onboarding two days late because the design review slipped, but pairing sessions really helped. " +
      "Next sprint: Priya sets up error tracking, Leo drafts the pricing page, and we book a usability test before Friday.",
    { delay: 12 },
  );
  await n.done();

  // AI Studio
  n = await say("studio");
  await step(5, "AI Studio");
  await click(page.getByTitle("AI Studio").first(), "Open AI Studio", "bottom");
  await sleep(900);
  await point(page.getByRole("button", { name: /Summarize/ }), "One-click AI tools", "left");
  await n.done();

  n = await say("summarise");
  await click(page.getByRole("button", { name: /Summarize/ }), "Summarise", "left");
  await page.getByRole("button", { name: "Apply" }).waitFor({ timeout: 120000 });
  await sleep(600);
  await point(page.getByRole("button", { name: "Apply" }), "Preview, then Apply", "bottom");
  await n.done(0);
  await click(page.getByRole("button", { name: "Apply" }));
  await sleep(800);

  n = await say("save");
  await click(page.getByRole("button", { name: "Save", exact: true }), "Save", "bottom");
  await sleep(1200);
  await click(page.getByRole("button", { name: "All notes" }), "Back to your notes", "bottom");
  await page.getByText("The Lighthouse", { exact: true }).first().waitFor();
  await n.done();

  // Book view
  n = await say("book");
  await step(6, "Novels & diaries");
  await click(page.getByText("The Lighthouse", { exact: true }).first(), "Open a novel", "bottom");
  await page.getByTitle("Next page").waitFor();
  await sleep(700);
  await point(page.locator("main textarea").first(), "Write chapter by chapter", "top");
  await sleep(1200);
  await click(page.getByTitle("Previous page"), "Turn the pages", "top");
  await sleep(1300);
  await click(page.getByTitle("Next page"));
  await sleep(600);
  await point(page.getByRole("button", { name: "New chapter" }).first(), "Add a chapter", "bottom");
  await n.done();
  await click(page.getByRole("button", { name: "All notes" }));
  await page.getByText("Monthly goals").first().waitFor();

  // AI Companion
  n = await say("chat");
  await step(7, "Ask AI");
  await click(page.getByTitle("AI Companion"), "Ask AI", "bottom");
  await page.getByPlaceholder(/Ask anything/).waitFor();
  await sleep(500);
  await type(page.getByPlaceholder(/Ask anything/), "What are my goals this month?", 50);
  const answered = page.waitForResponse((r) => r.url().includes("/ai/chat"), { timeout: 120000 });
  await click(page.getByTitle("Send"), "Send", "top");
  await n.done();
  await answered;
  await sleep(700);

  n = await say("answer");
  await point(page.locator("main .card").last(), "Answers from your notes", "top");
  await n.done();

  // Outro
  n = await say("outro");
  await step(8, "You're ready");
  await click(page.getByTitle("Back"));
  await page.getByText("Monthly goals").first().waitFor();
  await click(page.getByTitle("Toggle theme"), "Dark mode", "bottom");
  await sleep(800);
  await overlay("move", SIZE.width / 2, SIZE.height / 2 + 40);
  await n.done(1500);
  await overlay("step", "", "");

  await page.close();
  await context.close();
  await browser.close();

  console.log("4/4 Mixing narration and encoding…");
  const webm = fs.readdirSync(videoDir).find((f) => f.endsWith(".webm"));
  const inputs = ["-ss", (trimMs / 1000).toFixed(3), "-i", path.join(videoDir, webm)];
  const filters = [];
  cues.forEach((c, i) => {
    inputs.push("-i", c.file);
    const delay = Math.max(0, Math.round(c.at - trimMs));
    filters.push(`[${i + 1}:a]adelay=${delay}|${delay}[a${i}]`);
  });
  filters.push(`${cues.map((_, i) => `[a${i}]`).join("")}amix=inputs=${cues.length}:normalize=0:dropout_transition=0[aout]`);

  const mp4 = path.join(OUT_DIR, "walkthrough.mp4");
  execFileSync(ffmpegPath, [
    "-y", ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "0:v", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "128k", "-ac", "2",
    "-movflags", "+faststart",
    mp4,
  ], { stdio: "inherit" });

  // Poster: the dashboard, just after sign-in.
  const posterAt = (cues[2].at - trimMs) / 1000 + 0.4; // before any highlight dims the page
  execFileSync(ffmpegPath, ["-y", "-ss", posterAt.toFixed(2), "-i", mp4, "-frames:v", "1", "-q:v", "3", path.join(OUT_DIR, "poster.jpg")], { stdio: "ignore" });

  const mb = (fs.statSync(mp4).size / 1e6).toFixed(1);
  console.log(`Done → public/walkthrough/walkthrough.mp4 (${mb} MB) + poster.jpg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

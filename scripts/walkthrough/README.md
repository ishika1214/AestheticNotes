# Walkthrough video recorder

Records the narrated "How to use" video shown on the landing page
(`public/walkthrough/walkthrough.mp4` + `poster.jpg`).

It drives the real app in a headless browser, draws an on-screen cursor,
arrows, highlights and captions, voices the script with Gemini
text-to-speech, and mixes everything into an MP4.

## Re-record

1. Start MongoDB, the backend (port 5000) and the frontend (`npm run dev`, port 5173).
2. Run:

   ```sh
   cd scripts/walkthrough
   npm install
   npx playwright install chromium   # first time only
   npm run record
   ```

The script signs in as a demo user (`demo@aestheticnotes.app`) and resets its
notes to a fixed sample set, so every recording looks the same. It only
touches that demo account.

## Narration

- The script lives in `LINES` in `record.mjs`. Edit a line and only that clip is regenerated.
- Clips are cached in `.cache/`, so re-recording after a UI change needs no new voice requests.
- The Gemini key comes from `GEMINI_API_KEY`, or else from `AestheticNotes-Backend/.env.local`.
- The free tier allows about 10 voice clips per day per Google Cloud project. If you hit the limit, the script waits and retries.

Other overrides: `APP_URL`, `API_URL`, `TTS_VOICE` (default `Kore`).

# Build notes — Countdown VI v1.0

Working log for the next person (or the next session) touching this build.
Built Nov 12–13, 2026 by Muse (subagent) at Nick's direction.

## What shipped

Capacitor 7 + TypeScript + Vite app in `~/workspace/gta-companion/`,
repo `nhigh723/vi-countdown`: `main` branch holds the built site (GitHub
Pages preview), `source` branch holds the full project. See README.md for
the Mac mini submission steps and QA.md for the verified checklist.

## Decisions made along the way

- **Title "Countdown VI"** over "VI Launch Companion" — shorter, reads
  better as an icon label, still no trademarked words in the title.
- **Countdown target = local midnight Nov 19, 2026** (`LAUNCH_LOCAL` in
  `src/config.ts`). PlayStation confirms midnight local for PS5; Rockstar
  confirms the same Nov 19 console launch for Xbox without publishing an
  Xbox-specific hour. The app labels the day and attributes the midnight
  confirmation to PlayStation rather than inventing an Xbox hour.
- **Single-scroll page** (no router, no tabs): hero, unlock checker,
  timeline, facts, news, About. Fast to build, nothing to get lost in.
- **v1 free, no ads.** `src/monetization.ts` holds the v2 hooks
  (`ADS_ENABLED = false`, product ID reserved).
- **No jsdom functional drive.** The Chrome drive (`tests/chrome-drive.mjs`)
  covers everything jsdom would — real browser, real rendering, real
  localStorage, real timers — so a second, weaker harness was not built.
  Unit tests (20) + Chrome drive (15 steps) + eyeballed screenshots is the
  triple coverage.

## Bugs found and fixed during QA

1. **Wrong month constant:** `PHYSICAL_START_LOCAL` was written as
   `new Date(2026, 11, 12)` — month 11 is December, not November. The unit
   tests caught it (two config tests failed). Fixed to month 10.
2. **`npm test` script:** `node --test tests/` fails on Node 24 (treats the
   directory as a module path). Changed to `node --test "tests/*.test.mjs"`.
3. **Chrome drive — WebGL policy:** this VM's Chromium refuses to start
   without `--hatch-webgl-allowed-domains-file` + `--hatch-webgl-allowed-domains-sha256`.
   The drive script computes the SHA itself from `tests/webgl-policy.txt`
   (a one-line file containing the magic header
   `hatch-webgl-allowed-domains-v1`). The file path must be fully resolved
   (no `..` segments) or Chrome reports it unreadable.
4. **Chrome drive — file:// modules:** ES module scripts are CORS-blocked on
   `file://` without `--allow-file-access-from-files`. The drive passes it.
   (This VM's Chrome also blocks localhost pages, so `file://` is the only
   local route — same as the vintage app's QA.)
5. **Test needles, not app bugs:** "No PC version" failed because the app
   renders "PC: no PC version announced." (lowercase); "IT'S OUT NOW"
   failed because the app uses a curly apostrophe. Both fixed in the test.

## Repo / push notes (GitHub MCP)

- `gh` CLI is NOT logged in on this VM — use `/opt/hatch/bin/github` (the
  connector), never `gh auth login`.
- `push_files` rejects binary/non-UTF-8 content (max 2,000 files, 16 MiB).
  That is why the 4 PNGs (app icon + 3 splash images) are NOT in the repo:
  `tools/make-icons.py` regenerates them on the Mac. Same reason the
  `store/screenshots/` PNGs are not in the repo.
- Vite builds wipe `dist/.nojekyll` — run `touch dist/.nojekyll` before
  every preview publish (same gotcha as the vintage app).
- Pages pattern (same as vintage): repo root holds only the built site
  (`.nojekyll`, `README.md`, `assets/`, `index.html`, `privacy.html`),
  Pages serves from root. The `source` branch holds the full project.

## Open items (see QA.md "Not verified")

- Real-iPhone / Simulator test (needs the Mac mini).
- First Xcode compile + `pod install` (needs the Mac mini).
- App Review outcome; "VI" trademark residual risk + rename fallback.

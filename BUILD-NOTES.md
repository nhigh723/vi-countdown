# Build notes — Countdown VI v1.2

Working log for the next person (or the next session) touching this build.
Built Nov 12–13, 2026 by Muse (subagent) at Nick's direction. v1.1 (Nov 13)
added the get-ready checklist, the "What we know" guide, the
review-hardening fixes, and the Codemagic config; it is the submission
candidate in review. v1.2 (Nov 13) adds the $1.99 Launch Pass in-app
purchase (RevenueCat) and carries the four fixes from the independent v1.1
review audit. v1.2 ships right behind v1.1 once the RevenueCat key is in,
the Launch Pass product exists in App Store Connect, and the sandbox test
has passed.

## v1.2 notes

- **Launch Pass** (`src/store.ts` + constants in `src/config.ts`):
  $1.99 non-consumable, product ID `com.nickhigh.vicountdown.launchpass`,
  RevenueCat entitlement `launch_pass`. Buyers get a Founder badge on the
  hero + About immediately, the full v2 checklist experience ad-free at
  launch, and no ads ever. Purchase state comes from RevenueCat
  entitlements; localStorage key `cvi.launchpass` is only a cache of the
  last verified state (re-checked on every launch). `initStore()` runs
  async in `start()` and re-renders if the state changed.
- **RevenueCat v11 API — read this before touching the store:** the
  installed `@revenuecat/purchases-capacitor` 11.3.3 has NO
  `purchaseProduct(productId)` method. The real flow is `getProducts({ productIdentifiers, type: 'NON_SUBSCRIPTION' })` then
  `purchaseStoreProduct({ product })`. The vintage app's `src/store.ts`
  calls the non-existent `purchaseProduct()` — that would throw on a real
  device; do not copy that pattern. (Flagged to the parent Nov 13; the
  vintage app is not fixed yet.) Cancellation error code is
  `PURCHASE_CANCELLED_ERROR` ("1").
- **Dynamic import:** `store.ts` loads `@revenuecat/purchases-capacitor`
  via `await import()` inside `loadPurchases()` — only on a native
  platform with a real key. The web preview never loads the SDK, and the
  unit tests import `store.ts` without it.
- **No-key behavior is deliberate:** with the placeholder key the buy
  button is disabled and the section shows "Purchases are available in the
  App Store version of the app — this preview can't take payments." No
  simulated purchase (unlike the vintage app's preview mode). v1.2 does
  NOT submit until the real key is in.
- **Honest copy decision:** v1.1's teaser says the v2 checklist is a free
  update, so the pass does NOT claim to "unlock" it — it buys the full
  checklist experience ad-free, "no ads, nothing else to buy." Same
  reason the About version line mentions ONLY the Launch Pass (audit
  SHOULD-FIX-2): the future v2 $2.99 remove-ads is not advertised
  anywhere until it exists.
- **Audit fixes carried from v1.1** (see
  `~/workspace/gta-companion/REVIEW-AUDIT.md`, fixed in the v1.1 dir in
  commit 1f97648): SOURCES gains "Ultimate Edition contents" + "Game
  Pass" (exact wording copied); privacy.html carries the v1.1 "three
  small settings" + share-card cache wording verbatim, with the
  RevenueCat disclosure added on top; the `?now=` / `?platform=` QA
  hooks are kept (N1 — the chrome drive depends on `?now=`).
- **config.xml version gotcha (again):** `npx cap sync ios` regenerates
  `ios/App/App/config.xml` with a default widget version of 1.0.0. Set
  back to 1.2.0 after the last sync. Cosmetic — the App Store version
  comes from MARKETING_VERSION (1.2) in the Xcode project.
- **Drive gotcha — CSS uppercase vs innerText:** the Founder badge uses
  `text-transform: uppercase`, and `innerText` returns the RENDERED
  (uppercased) text, so the drive asserts `/Founder/i`, not `/Founder/`.
- **TS gotchas:** (1) the placeholder API key constant is typed
  `: string` explicitly — otherwise `tsc` narrows the literal and flags
  the `!== ''` comparison as unintentional. (2) `root` narrowing does not
  persist into a hoisted function declaration — `rerenderWithPassStatus`
  is an arrow-function const, which preserves it.
- **`cap sync ios`** re-ran for v1.2 and found the RevenueCat plugin,
  adding its pod to `ios/App/Podfile` (4 plugin pods now). `pod install`
  still needs the Mac / Codemagic.

## v1.1 notes

- **Get-ready checklist** (`src/checklist.ts` + `CHECKLIST_ITEMS` in
  `src/config.ts`): 7 items, localStorage key `cvi.ready`, progress
  "X of 7 ready" + gradient bar. Live badges follow the clock (pre-load /
  physical / bonus deadline). The section hides after launch. The checklist
  logic is pure + unit-tested (16 tests); `main.ts` only wires it to the
  DOM and real localStorage.
- **"What we know" guide** (`GUIDE_SECTIONS` in `src/config.ts`): story,
  setting, cast — official sources only, each section's `sourceLabel` must
  exist in `SOURCES` (enforced by a unit test). Full names and the six
  regions were verified Nov 13 against Rockstar's official pages via 5+
  corroborating sources each (see QA.md).
- **`allowImportingTsExtensions`:** `src/checklist.ts` imports
  `./config.ts` with an explicit extension because Node's type-stripping
  test runner cannot resolve extensionless TS imports. `tsconfig.json`
  enables `allowImportingTsExtensions` (allowed with `noEmit: true`) so
  `tsc` accepts it; Vite resolves it fine. If a future module needs to be
  unit-tested, import it the same way.
- **Review hardening:** subtitle shortened to 25 chars (was 31, over the
  30-char limit); keywords note corrected to 86 chars (was 99); news titles
  softened; privacy policy covers checklist localStorage; listing copy now
  describes the checklist + guide as included in v1.1.
- **v1.1 features (Nov 13, second batch):** launch-night reminder
  (`src/reminder.ts` + `@capacitor/local-notifications`), shareable
  countdown card (`src/share-card.ts` + `@capacitor/share` and
  `@capacitor/filesystem`), world unlock times (`src/world-times.ts`,
  Intl-only, no hardcoded offsets). The three plugins are pinned to their
  v7 lines (`@capacitor/*@^7.0.0`) — the v8 lines need Capacitor 8 and npm
  refuses them (ERESOLVE). `npx cap sync ios` found all 3 plugins and
  added their pods to `ios/App/Podfile`; it skipped `pod install` (no
  CocoaPods on the VM) — that runs on the Mac / Codemagic.
- **Share card native path:** on iOS the PNG is written to the cache
  directory via Filesystem, then shared via the Share plugin's `files`.
  On the web it tries the Web Share API with files, then downloads the PNG.
  The native sheet has never run on a device — first iPhone run must check
  it (see QA.md).
- **config.xml version gotcha:** `npx cap sync ios` / `npx cap copy ios`
  regenerates `ios/App/App/config.xml` with a default widget version of
  1.0.0, wiping a manual bump. The file was set back to 1.1.0 after the
  last sync. It is cosmetic anyway — the App Store version comes from
  MARKETING_VERSION in the Xcode project, not config.xml. If you re-sync,
  re-check this file.
- **World-times math:** each city's midnight is computed as UTC-midnight
  minus the Intl-measured offset at that instant. One correction is exact
  because Nov 19, 2026 is not a DST transition day in any listed city;
  the unit tests pin all eight UTC instants, so any tz-data surprise fails
  loudly.
- **Codemagic:** `codemagic.yaml` (adapted from Fizby's, same shape) was
  already present in the project root when v1.1 started — verified against
  the Fizby template (BUNDLE_ID `com.nickhigh.vicountdown`, placeholder
  Apple ID `0000000000`, TestFlight on, App Store off). Included in the
  source manifest. No build has been triggered.

## What shipped (v1.0)

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
- v1.2: RevenueCat public API key (Nick's free account) + IAP product in
  App Store Connect + sandbox test (see README "RevenueCat setup").
- v1.2: update the App Store Connect privacy declaration — no longer
  "Data Not Collected" (RevenueCat purchase data).

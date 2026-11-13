# Countdown VI — GTA VI Launch Companion (v1.1)

An unofficial fan companion app counting down to the **Grand Theft Auto VI**
launch on **Thursday, November 19, 2026** (PlayStation 5 and Xbox Series X|S).
v1.1 is the countdown + unlock checker + get-ready checklist + launch-night
reminder + world unlock times + "What we know" guide + facts + official
news links + shareable countdown card. The 100% completion checklist
ships in the post-launch v2 update.

v1.1 is the submission candidate: the checklist and guide materially
strengthen the app against Apple's minimum-functionality rule.

- **App title:** Countdown VI
- **Bundle ID:** `com.nickhigh.vicountdown`
- **Stack:** Capacitor 7 + TypeScript + Vite (same factory stack as Fizby and
  the vintage app)
- **Price:** FREE, no ads, no paywall in v1.1. The code is structured so ads +
  a $2.99 one-time remove-ads unlock can be added in v2
  (product ID reserved: `com.nickhigh.vicountdown.removeads`).

> **Unofficial fan app. Not affiliated with, endorsed by, or connected to
> Rockstar Games or Take-Two Interactive.** No Rockstar logos, artwork, map
> images, screenshots, or trailers are used anywhere — all visuals are
> original (gradients, shapes, text). "GTA", "Grand Theft Auto", and "Vice
> City" never appear in the app title or icon.

## What v1.1 does

- **Live countdown** to local midnight, Thursday Nov 19, 2026 — days / hours /
  minutes / seconds, ticking every second. The target is one constant:
  `LAUNCH_LOCAL` in `src/config.ts`.
- **Unlock-time checker:** pick PS5 or Xbox Series X|S and see your local
  launch timing, pre-load status, the 212 GB storage note, and the physical
  edition note. Choice persists (localStorage).
- **Get ready for launch (NEW in v1.1):** an interactive checklist of seven
  things to sort before midnight on Nov 19 — clear 212 GB, pre-load, confirm
  your edition, digital vs physical, console update, launch-night alarm, and
  the pre-order bonus deadline. Tick items off, watch the "X of 7 ready"
  progress bar, and your progress is saved on the device (localStorage).
  Items with live state (pre-load open, physical at retailers) show a status
  badge. The checklist hides after launch — it is pre-launch prep.
- **Launch-night reminder (NEW in v1.1):** a toggle that schedules a local
  notification for 11:55 PM on Wednesday, Nov 18 — 5 minutes before launch.
  Permission is requested when enabling; if denied, the toggle switches back
  off with a plain explanation. Toggle state persists (localStorage). On the
  web preview the plugin isn't available, so the section shows a clear
  "reminders work on your iPhone" note instead. No server, no account,
  nothing leaves the device. Hides after launch.
- **Who plays first? (NEW in v1.1):** the eight major cities' unlock moments
  (Auckland, Sydney, Tokyo, Paris, London, New York, Chicago, Los Angeles),
  ordered by who gets the game first. Unlock is midnight local everywhere,
  so each city's midnight is converted to the viewer's local time with Intl
  APIs — no hardcoded offsets, DST-safe. Your own city gets a "You" badge.
  Hides after launch.
- **Shareable countdown card (NEW in v1.1):** a "Share countdown" button on
  the hero renders a 1080×1920 PNG in the app's neon style (canvas, in-app)
  and shares it — native share sheet on iOS, Web Share API where supported,
  PNG download as the fallback. Original art only; no "GTA" in the image.
- **Launch timeline:** Nov 10 digital pre-load opens, Nov 12 physical edition
  at retailers, Nov 19 launch day — each marked done / today / coming up.
- **What we know (NEW in v1.1):** the story (Jason Duval and Lucia Caminos),
  the setting (Leonida and its six officially named regions), and the cast
  (the eight characters Rockstar has profiled) — official sources only, no
  rumors, no leaks. Every line traces to a source listed in the About
  screen (`src/config.ts`).
- **The game, in brief:** editions, platforms, and public facts. Every fact
  traces to a source listed in the About screen (`src/config.ts`).
- **Official news:** links only (Rockstar Newswire, the official VI page,
  PlayStation Store, Microsoft Store). No scraping, no copied articles.
- **Post-launch state:** after Nov 19 the hero flips to "IT'S OUT NOW" with
  store buttons and a "checklist coming soon" note.

## Facts, verified Nov 12–13, 2026

| Fact | Source |
| --- | --- |
| Launch Thu Nov 19, 2026, PS5 + Xbox Series X\|S | Rockstar VI page; Take-Two press release Jun 24, 2026 |
| Unlock at midnight local time (PS5 confirmed) | PlayStation official VI page |
| Digital pre-load from Nov 10, 2026 | Rockstar Newswire Nov 3, 2026 |
| Physical edition (code in a box, no disc) from Nov 12 | Rockstar support |
| Clear at least 212 GB | PlayStation guidance; Rockstar: up to 212 GB by device |
| Standard $79.99 / Ultimate $99.99 / Upgrade $20 | Take-Two press release; Xbox Store listing |
| Pre-order bonus: Vintage Vice City Pack + 1 month GTA+ (before Nov 19, 23:59:59) | Xbox Store listing |
| Jason and Lucia, Vice City, state of Leonida | Rockstar VI page |
| Protagonists: Jason Duval and Lucia Caminos; premise | Rockstar VI page + official character profiles |
| Six named Leonida regions: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga National Park | Rockstar "Only in Leonida" pages |
| Supporting cast: Cal Hampton, Boobie Ike, Dre'Quan Priest, Real Dimez, Raul Bautista, Brian Heder; no voice cast announced | Rockstar official character profiles |
| Free printable Leonida map on Rockstar's site from Nov 19 | Rockstar announcement Nov 3, 2026 |
| ESRB Mature 17+ | Xbox Store listing |
| No PC version announced; not announced for Game Pass at launch | Rockstar VI page; Xbox Store listing |
| Official album also drops Nov 19 | Rockstar Newswire Sep 17, 2026 |

No other dates, prices, or claims are in the app. If a fact is not in this
table, it is not in the app. Deliberately left out: map size (Rockstar has
published none), Vice City district lists (leak/datamine territory), voice
actors (none announced).

## Run the web preview

```bash
npm install
npm run build
# open dist/index.html in a browser, or use the live preview:
# https://nhigh723.github.io/vi-countdown/
```

QA hooks (preview only, harmless in the app): `?now=2026-11-20T12:00:00`
overrides the clock (shows the post-launch state), `?platform=xbox`
preselects Xbox.

## Tests

```bash
npm test                      # 46 unit tests: countdown math, config sanity, checklist logic, guide sources, reminder math, world times, share numbers, monetization flags
node tests/chrome-drive.mjs   # 24-step phone-size Chrome drive (390x844) + screenshots
```

The Chrome drive needs this VM's Chromium (`/opt/meta-chromium/chrome`) and
its WebGL domain-policy switches — it handles both itself. It does not run on
the Mac; the Mac-side check is the Xcode Simulator (see below).

## Mac mini steps — brand-new Mac to App Store submission

Assumptions: a Mac mini with macOS, an Apple ID, and an Apple Developer
Program membership ($99/yr) for the account that will submit. Do the steps in
order; nothing is submitted until you choose to.

### 1. Install Xcode (once, ~30–60 min download)

1. Open the **App Store** app, search **Xcode**, install it (free).
2. Open Xcode once so it finishes installing its tools. Agree to the license.
3. In Xcode: **Settings → Accounts → +** and sign in with the Apple ID that
   has the Developer Program membership.

### 2. Install Node.js (once)

1. Go to <https://nodejs.org> and download the **LTS** macOS installer
   (Apple Silicon / ARM64).
2. Run it, accept the defaults.
3. Open **Terminal** and check: `node --version` should print v20 or newer.

### 3. Install CocoaPods (once — Capacitor needs it for iOS)

```bash
sudo gem install cocoapods
```

(If that fails, the Homebrew route is `brew install cocoapods` after
installing Homebrew from <https://brew.sh>.)

### 4. Get the code

```bash
git clone --branch source https://github.com/nhigh723/vi-countdown.git countdown-vi
cd countdown-vi
npm install
```

### 5. Generate the icon + splash images (once)

The icon and splash PNGs are binary, so they are **not in the repo**. They are
generated from an original design by a script:

```bash
pip3 install pillow numpy
python3 tools/make-icons.py
```

This writes the 1024×1024 app icon and the splash images into `ios/`, plus a
copy of the icon at `store/icon-1024.png` for App Store Connect.

### 6. Build the web app and sync it into iOS

```bash
npm run build
npx cap sync ios
```

### 7. Open in Xcode and set signing

```bash
npx cap open ios
```

1. In the left sidebar, click **App** (the blue project icon) → select the
   **App** target → **Signing & Capabilities**.
2. Tick **Automatically manage signing**.
3. Set **Team** to the Developer Program account from step 1.
4. Confirm **Bundle Identifier** reads `com.nickhigh.vicountdown`.

### 8. Run it in the Simulator (the Mac-side QA check)

1. At the top of Xcode, pick a simulator (e.g. **iPhone 17**) as the run
   destination.
2. Press **▶ Run** (or Cmd+R).
3. Check: countdown digits ticking, PS5/Xbox toggle works, all sections
   scroll, no clipped text, no blank areas. Compare against
   `store/screenshots/` (reference shots taken during QA).
4. **Check the native features the VM could not:** flip the reminder toggle
   on — it must ask for notification permission and schedule for Nov 18,
   11:55 PM — and tap "Share countdown" — the iOS share sheet must open
   with the card image. (The Simulator cannot receive the notification at
   11:55 PM, but the toggle + permission flow must work.)

### 9. Archive and upload

1. With the run destination set to **Any iOS Device (arm64)**, choose
   **Product → Archive**.
2. When the archive finishes, the Organizer opens: click **Distribute App →
   App Store Connect → Upload**. Accept the defaults.

### 10. App Store Connect listing

1. Go to <https://appstoreconnect.apple.com> → **My Apps → + → New App**.
   Platform iOS, name **Countdown VI**, bundle ID
   `com.nickhigh.vicountdown`, SKU anything (e.g. `countdown-vi-1`).
2. Fill the listing from **`store/LISTING.md`** (title, subtitle, keywords,
   description — already written, no trademarked terms in the title).
3. Upload the app icon from `store/icon-1024.png`.
4. Upload screenshots: the reference set is in `store/screenshots/`
   (6.9" and 6.5" iPhone sizes). If you want fresh ones, screenshot the
   Simulator in step 8 instead.
5. **Privacy:** the app collects no data, has no account, and works offline.
   Privacy policy URL: `https://nhigh723.github.io/vi-countdown/privacy.html`
   (already live on the preview site). Answer the App Privacy questionnaire
   as "no data collected".
6. **Age rating:** answer the questionnaire honestly — the app itself
   contains no mature content (it is a countdown and fact list), but it
   references a game rated ESRB Mature 17+; let the questionnaire decide.
7. Pick the build you uploaded in step 9, then **Submit for Review**.

Review typically takes 1–3 days. The countdown goes stale at launch, so submit
as soon as the Mac mini is set up — the target is **live before Nov 19**.

## Codemagic cloud build (alternative to the Mac mini)

`codemagic.yaml` (in the project root, same shape as Fizby's) builds the app
on a cloud Mac and uploads it to TestFlight — no Mac mini needed for the
build itself. Workflow `ios-release`: mac_mini_m2, node 20, xcode latest,
automatic code signing via the App Store Connect API integration named
`codemagic`, signing secrets in the `ios_signing_key` group, build number
bumped to one above the latest TestFlight build, IPA built and submitted to
TestFlight (`submit_to_app_store: false` — the store submission stays a
human decision in App Store Connect).

Before the first build runs:

1. Create the App Store Connect app record for Countdown VI (step 10 above)
   and copy its Apple ID from the App Information page into
   `APP_STORE_APPLE_ID` in `codemagic.yaml` (it ships as `0000000000`; the
   build fails loudly until this is set).
2. In Codemagic: connect the `nhigh723/vi-countdown` repo (branch `source`),
   confirm the `codemagic` App Store Connect integration and the
   `ios_signing_key` group exist (Fizby's pipeline already has these on the
   same Codemagic team), then trigger the `ios-release` workflow.

No Codemagic build has been run yet — the config is staged, not triggered.

## After launch (v2 — not in this build)

- The 100% checklist (missions, collectibles, activities) — content written
  from public post-launch guides, no Rockstar assets.
- Ads + the $2.99 remove-ads unlock. Hooks live in `src/monetization.ts`
  (`ADS_ENABLED = false`, `REMOVE_ADS_PRODUCT_ID` reserved). Do not enable
  ads before the checklist ships — v1.1 is downloads first.

## Known risks / honest notes

- **"VI" trademark:** Take-Two's trademark line claims "VI" itself as a
  trademark in the GTA context. The title "Countdown VI" uses a Roman numeral
  with no Rockstar branding and a clear unofficial disclaimer, but a takedown
  or rejection on trademark grounds is still possible. If App Review rejects
  on the title, the fallback is a rename to "Countdown 6" or "Launch
  Countdown — Nov 19" (no code changes beyond strings).
- **Midnight unlock (Xbox):** PlayStation confirms midnight local for PS5.
  Rockstar confirms the same Nov 19 console launch for Xbox but has not
  published an Xbox-specific unlock hour; the app says "midnight local time"
  for the launch day and attributes the confirmation to PlayStation.
- **Screenshots in the repo:** `store/screenshots/` PNGs are generated by the
  Chrome QA drive on the build VM and are not pushed to git (binary). Use the
  reference set handed over with this build, or capture fresh ones from the
  Simulator.

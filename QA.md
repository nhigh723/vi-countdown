# QA checklist — Countdown VI v1.1

Verified Nov 13, 2026 on the production build (`npm run build` + `dist/`).
Every item below was checked by a test, a real-browser drive, or a human
eyeball of a screenshot — nothing is asserted on faith.

v1.1 is the submission candidate (not v1.0): the get-ready checklist and
the "What we know" guide materially strengthen the app against Apple's
minimum-functionality rule, and the review-hardening fixes below are in.

## Automated — unit tests (46/46 pass)

`npm test` — `tests/countdown.test.mjs` (20) + `tests/checklist.test.mjs` (16)
+ `tests/features.test.mjs` (10)

- [x] Countdown math: 7 days out exactly; mixed remainder; 59 seconds rolls
      up; 23:59:59 is 23 hours, not a day
- [x] Boundary: one second before launch is not launched; exactly at launch
      is launched with all zeros; after launch stays launched
- [x] `pad2` pads single digits, leaves double digits alone
- [x] Milestone status: past day = done, same day = today, future day =
      upcoming, day after a milestone = done
- [x] Config sanity: launch is local midnight Thu Nov 19, 2026; pre-load
      Nov 10 and physical Nov 12 both before launch; timeline in date order
      ending at launch; platforms are exactly PS5 + Xbox Series X|S (no PC);
      every news link is https to an official domain; every fact has a source
- [x] Monetization: ads off, no purchase exists in v1.1; v2 remove-ads product
      ID reserved and well-formed (`com.nickhigh.vicountdown.removeads`)
- [x] Checklist persistence: starts empty; loads stored ids; ignores unknown
      ids and non-string entries; corrupt JSON and non-array values start
      empty instead of crashing; save writes a sorted JSON array; save/load
      round trip preserves the set
- [x] Checklist toggle/count: toggle adds then removes without mutating the
      input; count counts only known ids
- [x] Checklist live badges: pre-load "Opens Nov 10" before Nov 10 and
      "Open now" after (boundary at midnight tested); physical "From Nov 12"
      before Nov 12 and "At retailers now" after; bonus badge is the fixed
      "Ends Nov 19"; plain items have no badge
- [x] Checklist config: exactly 7 items, unique ids, every item has a title
      and a one-line why; storage/edition items reuse the verified 212 GB /
      $79.99 / $99.99 facts
- [x] Guide config: every guide section cites a source label that exists in
      SOURCES; guide names Jason Duval, Lucia Caminos, and all six regions;
      guide contains no rumor or leak language
- [x] Reminder: fires at 11:55 PM Wed Nov 18, 2026 local (launch minus
      5 minutes); `isReminderTimePassed` flips exactly at that moment;
      toggle state persists, anything but "on" reads as off
- [x] World unlock times: cities ordered Auckland → Sydney → Tokyo → Paris
      → London → New York → Chicago → Los Angeles; every city's midnight
      spot-checked against its known UTC instant (NZDT +13, AEDT +11, JST
      +9, CET +1, GMT +0, EST −5, CST −6, PST −8); labels format in the
      viewer timezone; the viewer's own city is flagged (New York in EST
      reads "Thu, Nov 19, 12:00 AM", Auckland reads "Wed, Nov 18, 6:00 AM")
- [x] Share-card numbers: days big with an hours/minutes sub-line;
      singular day/hour/minute; under a day, hours big with a
      minutes/seconds sub-line; after launch the card says the game is out
- [x] Version: `APP_VERSION` is 1.1.0

## Automated — Chrome phone-size drive (24/24 pass, zero console errors)

`node tests/chrome-drive.mjs` — real Chromium at 390×844 (iPhone size),
production build served from `file://`

- [x] Hero countdown shows the correct days/hours (checked against an
      independent calculation of the same target)
- [x] Countdown ticks every second
- [x] Zero console errors and zero page errors across the whole drive
- [x] No horizontal overflow at 390px wide
- [x] Platform toggle PS5 → Xbox changes the unlock card text and store
      button; choice persists in localStorage; survives a reload; toggles
      back
- [x] Timeline statuses match the real date (Nov 10 done, Nov 12 done,
      Nov 19 coming up, as of Nov 13)
- [x] Info cards carry the verified facts ($79.99, $99.99, 212 GB,
      Mature 17+, no PC version announced, Jason and Lucia)
- [x] 4 news links, all https, all to rockstargames.com / playstation.com /
      xbox.com (titles softened in v1.1 — see below)
- [x] Checklist renders 7 items with progress ("0 of 7 ready") and live
      badges ("Open now", "At retailers now", "Ends Nov 19" as of Nov 13)
- [x] Ticking 2 items updates progress to "2 of 7 ready" and persists in
      localStorage; state survives reload; unticking returns to "1 of 7 ready"
- [x] Guide carries the verified story, setting, and cast facts (Jason Duval,
      Lucia Caminos, all six regions, Cal Hampton, Boobie Ike, no voice cast)
- [x] Pre-preload badges read correctly on Nov 9 (`?now=2026-11-09`):
      "Opens Nov 10" and "From Nov 12"
- [x] Reminder shows the web fallback note ("Reminders work on your iPhone")
      with the switch disabled in the browser preview
- [x] World unlock times render 8 cities in first-to-last order with labels
      matching the known UTC instants formatted in the browser's timezone
- [x] Share card renders and downloads as a real 1080×1920 PNG (IHDR
      verified, 1.3 MB); the status line confirms "Card downloaded"
- [x] Disclaimer present in About and footer
- [x] No placeholder text anywhere (no lorem / TODO / placeholder)
- [x] Post-launch state flips correctly (`?now=2026-11-20`): "IT'S OUT NOW",
      both store buttons, "checklist is coming soon", and the get-ready
      checklist, reminder, world times, and share button are all hidden
      (they are pre-launch features)
- [x] Day-before-launch shows 1 day (`?now=2026-11-18`)

## Visual — screenshots eyeballed (qa-shots/)

- [x] 01-hero: bold gradient digits, date line, pre-load pill, clean dark
      theme
- [x] 02-unlock: PS5 card complete, store button visible, no clipped text
- [x] 03-timeline: three milestones with correct done/coming-up states
- [x] 04-facts: editions, platforms, details — all readable, no overflow
- [x] 05-news: four link cards with the softened v1.1 titles ("Official game
      page", "PlayStation Store", "Microsoft Store"); About disclaimer
      visible below
- [x] 06-about: disclaimer, "collects no data" statement, full source list
      (now 14 entries, including the three new v1.1 guide sources)
- [x] 07-launched: "IT'S OUT NOW" hero, store buttons, checklist note
- [x] 08-ready (NEW): get-ready checklist — progress line and gradient bar,
      one ticked item struck through with a teal check, live green badges
      ("Open now", "At retailers now"), no overflow, no clipped text
- [x] 09-guide (NEW): "What we know" — story and setting sections readable,
      no overflow, no clipped text
- [x] 10-reminder (NEW): launch-night reminder — web note shown, switch
      disabled and greyed, world-times list starting below
- [x] 11-world (NEW): "Who plays first?" — 8 ranked cities, Auckland #1
      highlighted pink, correct local labels, no overflow
- [x] Share card PNG (NEW, downloaded by the drive): 1080×1920, gradient
      border, COUNTDOWN VI wordmark, big "5 DAYS", teal sub-line, launch
      date, "Get Countdown VI on the App Store", "Unofficial fan app" —
      no "GTA" anywhere, numbers match the live hero
- [x] App icon (`store/icon-1024.png`): original gradient "VI / COUNTDOWN",
      no Rockstar art, readable at small size

## Facts — verified against official sources Nov 12–13, 2026

- [x] Nov 19, 2026 launch, PS5 + Xbox Series X|S (Rockstar VI page,
      Take-Two press release Jun 24, 2026)
- [x] Midnight local unlock for PS5 (PlayStation official VI page); Xbox
      Nov 19 console launch confirmed by Rockstar, no Xbox-specific hour
      published — the app does not invent one
- [x] Pre-load Nov 10 (Rockstar Newswire Nov 3); physical Nov 12, code in a
      box, no disc (Rockstar support)
- [x] 212 GB storage (PlayStation guidance; Rockstar "up to 212 GB")
- [x] Prices $79.99 / $99.99 / $20 upgrade; pre-order bonus + deadline
      (Take-Two release; Xbox Store listing)
- [x] Jason and Lucia, Vice City, Leonida; ESRB Mature 17+; no PC version;
      not on Game Pass at launch; album Nov 19
- [x] NEW (v1.1, verified Nov 13): protagonists' full names Jason Duval and
      Lucia Caminos (Rockstar official character profiles, corroborated by
      5 independent sources citing them); premise (Rockstar VI page,
      re-checked Nov 13); six named Leonida regions — Vice City, Leonida
      Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga National
      Park (Rockstar "Only in Leonida" pages, corroborated by 5 sources);
      supporting cast of six more official profiles (Cal Hampton, Boobie
      Ike, Dre'Quan Priest, Real Dimez, Raul Bautista, Brian Heder); no
      voice cast announced; free printable Leonida map on Rockstar's site
      from Nov 19 (announced Nov 3)
- [x] Left out on purpose: no map size (Rockstar has published none — every
      figure is a community estimate), no Vice City district list (leak /
      datamine territory), no voice actors (none announced), no leaked-map
      claims of any kind
- [x] No Nov 18 date anywhere (some regional Xbox pages show it as a
      timezone quirk; the official date is Nov 19)

## Review hardening (v1.1)

- [x] Subtitle "Launch countdown & unlock" is 25 characters — verified under
      the 30-character App Store Connect limit (the v1.0 subtitle was 31
      characters, over the limit)
- [x] Keywords string verified at 86 characters (the v1.0 note said 99)
- [x] News link titles softened to reduce trademark surface: "Official game
      page", "PlayStation Store", "Microsoft Store" (URLs and detail text
      unchanged)
- [x] Privacy policy updated for v1.1: the "Data stored on your device"
      section now covers the checklist progress alongside the console choice
      (on-device localStorage only, deleted with the app); "Last updated:
      November 13, 2026" kept; the staged preview copy matches
- [x] Listing description and What's New rewritten for v1.1: the get-ready
      checklist and the guide are described as included features, not
      "coming in the next update" (the 100% completion checklist is still
      correctly described as the v2 update)

## Legal / IP

- [x] No Rockstar logos, artwork, map images, screenshots, or trailers
      anywhere in the app, icon, or listing
- [x] Title "Countdown VI" contains no "GTA" / "Grand Theft Auto" /
      "Vice City"; same for the subtitle and keywords ("Vice City" appears
      only inside factual sentences about the setting, never as branding)
- [x] Disclaimer in the app (About + footer) and in the listing copy
- [x] News hub is links only — no copied articles, no scraping

## Codemagic (v1.1)

- [x] `codemagic.yaml` staged in the project root: mac_mini_m2, node 20,
      xcode latest, app_store_connect integration "codemagic",
      ios_signing_key group, automatic code signing, build-number bump from
      TestFlight, IPA build, `submit_to_testflight: true`,
      `submit_to_app_store: false`; BUNDLE_ID `com.nickhigh.vicountdown`;
      APP_STORE_APPLE_ID is the 0000000000 placeholder — the App Store
      Connect app record does not exist yet, so the build cannot run until
      it is created and the Apple ID is filled in
- [ ] NOT run: no Codemagic build has been triggered (needs the app record +
      the Codemagic hookup — parent's job, not this build's)

## Audit fixes (Nov 13, ~00:40 — independent review audit, REVIEW-AUDIT.md)

The adversarial audit found 1 blocker + 3 should-fixes. All four are fixed
in this commit; the age-rating blocker is fixed in App Store Connect
(questionnaire re-answered → 12+), not in code.

- **SHOULD-FIX-2 (footer):** the About version line no longer advertises
  the $2.99 remove-ads option ("Version 1.1.0 · Free, no ads."). The
  reserved product ID/constants stay in `monetization.ts` (not
  user-visible) for v2. Regression test: drive step 21 asserts the exact
  version line and that About contains no "$2.99".
- **SHOULD-FIX-3 (sources):** two SOURCES entries added — "Ultimate
  Edition contents" (Rockstar / Xbox News Nov 10, 2026, PlayStation
  Store) and "Game Pass" (Xbox Store paid pre-order; Take-Two CEO's
  day-one-subscription objection). Both facts were verified true by the
  auditor; this closes the citation gap behind the "every line traces
  to a source" claim. Regression test: unit test asserts both labels
  exist in SOURCES.
- **SHOULD-FIX-1 (privacy policy):** "two small settings" → "three
  small settings" (console, checklist ticks, reminder toggle) + a line
  that the share card writes a temporary PNG to the device cache.
  `privacy.html` is pushed to the preview (main) with this change; the
  URL in App Store Connect is unchanged.
- **N1 (QA hooks) — KEPT deliberately:** the `?now=` / `?platform=`
  overrides are unreachable in production (no URL bar in WKWebView),
  and the chrome drive depends on `?now=` for the pre-preload and
  post-launch states. Stripping them would break QA for zero review
  benefit.
- **Drive fix:** the world-times step now strips the " You" badge from
  city names before comparing (the badge is a feature — exactly one
  city carries it, now asserted), after the step failed when the VM
  timezone made New York the user city.

**New counts after these fixes: 47/47 unit tests, 25/25 chrome-drive
steps, zero console errors.** About screenshot re-eyeballed (new source
entries render; version line verified by drive assertion).

## Not verified (honest gaps)

- [ ] **Real iPhone test:** the app has been driven in desktop Chromium at
      phone size, not on a physical iPhone or the iOS Simulator. Nick's
      Mac-mini Simulator run (README step 8) and his phone test of the
      GitHub Pages preview are the true checks. In particular, the NATIVE
      reminder scheduling (local notification permission + fire at
      11:55 PM Nov 18) and the NATIVE share sheet (Filesystem write +
      Share plugin) have never run on a device — only their web fallbacks
      were driven here (fallback note, PNG download). The first iPhone run
      must check: reminder toggle asks permission and schedules, share
      opens the iOS sheet with the image.
- [ ] **Xcode build:** no Mac exists on this VM, so the project has never
      been compiled by Xcode. `npx cap add ios` generated the project
      cleanly; `pod install` was skipped (no CocoaPods here) and must run
      on the Mac via `npx cap sync ios` (or on Codemagic). The Podfile now
      lists the three v1.1 plugin pods (Filesystem, LocalNotifications,
      Share), so `pod install` will pick them up.
- [ ] **App Review outcome:** the "VI" trademark residual risk is documented
      in the README; a rename fallback exists if Review objects.

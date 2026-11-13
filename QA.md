# QA checklist — Countdown VI v1.2

Verified Nov 13, 2026 on the production build (`npm run build` + `dist/`).
Every item below was checked by a test, a real-browser drive, or a human
eyeball of a screenshot — nothing is asserted on faith.

v1.1 is the submission candidate in review; v1.2 (this build) ships right
behind it once the RevenueCat key is in, the Launch Pass product exists in
App Store Connect, and the sandbox test has passed (see README "RevenueCat
setup" — v1.2 does NOT submit before then). v1.2 also carries the four
fixes from the independent v1.1 review audit (see "Review hardening
(v1.2)").

## Automated — unit tests (73/73 pass)

`npm test` — `tests/countdown.test.mjs` (22) + `tests/checklist.test.mjs` (16)
+ `tests/features.test.mjs` (10) + `tests/store.test.mjs` (25)

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
- [x] SOURCES (audit SHOULD-FIX-3, NEW in v1.2): the facts-section lines each
      have a source entry — "Game Pass" and "Ultimate Edition contents"
      both exist in SOURCES
- [x] Monetization: ads off, no purchase exists without a pass; Launch Pass
      holders never see ads (`hasRemoveAds(true)` is true,
      `shouldShowAds(true)` is false); v2 remove-ads product ID reserved
      and well-formed (`com.nickhigh.vicountdown.removeads`)
- [x] Launch Pass config (NEW in v1.2): product ID
      `com.nickhigh.vicountdown.launchpass`, entitlement `launch_pass`,
      name "Launch Pass", price "$1.99"; ships with the placeholder API
      key, so the store is unconfigured
- [x] Entitlement parsing (NEW in v1.2): accepts a bare CustomerInfo, the
      `{ customerInfo }` wrapper, and a MakePurchaseResult shape; rejects
      other entitlements, empty active maps, missing entitlements, and
      non-objects — never throws
- [x] Purchase-cancel detection (NEW in v1.2): RevenueCat code "1" /
      `PURCHASE_CANCELLED_ERROR` and cancel messages read as a user cancel;
      other failures (store problem, network, product not found) do not
- [x] Entitlement cache (NEW in v1.2): defaults to not-owned; round-trips
      true/false; any value but "1" reads as not-owned; never throws when
      storage is unavailable
- [x] No-key behavior (NEW in v1.2): the store is not ready before
      configuration; purchase and restore both return "unavailable" and
      never touch the store
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
- [x] Version: `APP_VERSION` is 1.2.0

## Automated — Chrome phone-size drive (29/29 pass, zero console errors)

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
- [x] Launch Pass renders in the no-key state (NEW in v1.2): the section
      shows the name, $1.99, one-time wording, all three benefits, and the
      "available in the App Store version" note; the buy button is
      disabled; there is no restore button and no Founder badge; the
      status line stays empty (no purchase attempt, no error)
- [x] IAP screenshot saved (NEW in v1.2): `store/iap-launchpass-screenshot.png`
      is a real PNG of the Launch Pass section, for the App Store Connect
      IAP review
- [x] Launch Pass owner state (NEW in v1.2, seeded cache — test-harness
      only): the Founder badge appears in the hero and in About, the
      section shows "You're a Founder — your Launch Pass is active", and
      the buy button is gone; clearing the seed returns cleanly to the
      no-pass state
- [x] Disclaimer present in About and footer
- [x] About version line advertises ONLY the real purchase (NEW in v1.2,
      audit SHOULD-FIX-2): "Version 1.2.0 · Free, no ads. Launch Pass
      ($1.99, one-time) available in-app — holders never see ads." — no
      "$2.99" anywhere in About (the future v2 remove-ads is not
      advertised until it exists)
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
- [x] 12-launchpass (NEW in v1.2): Launch Pass section — title, subtitle,
      three benefits, price line, disabled buy button, "App Store version"
      note; clean layout, no overflow
- [x] 13-launchpass-owner (NEW in v1.2): owner state — "You're a Founder —
      your Launch Pass is active" in teal, benefits, thank-you note, no
      buy button
- [x] 14-hero-founder (NEW in v1.2): Founder badge pill ("★ FOUNDER —
      LAUNCH PASS") sitting cleanly between "UNTIL LAUNCH" and the
      countdown tiles
- [x] IAP screenshot (NEW in v1.2, `store/iap-launchpass-screenshot.png`):
      tight crop of the Launch Pass section — title, benefits, price,
      button, note; readable, no clipping
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
- [x] NEW (v1.2, audit SHOULD-FIX-3, verified Nov 13): Ultimate Edition
      contents — exclusive vehicles, weapons, apparel and more for Jason
      and Lucia (Rockstar / Xbox News Nov 10, 2026, PlayStation Store);
      Game Pass — no announcement at launch, Xbox Store sells a paid
      pre-order, Take-Two's CEO has publicly objected to day-one
      subscription launches (checked Nov 13, 2026)
- [x] Left out on purpose: no map size (Rockstar has published none — every
      figure is a community estimate), no Vice City district list (leak /
      datamine territory), no voice actors (none announced), no leaked-map
      claims of any kind
- [x] No Nov 18 date anywhere (some regional Xbox pages show it as a
      timezone quirk; the official date is Nov 19)

## Review hardening (v1.2)

All four fixes from the independent v1.1 review audit (see
`~/workspace/gta-companion/REVIEW-AUDIT.md`) are carried into v1.2:

- [x] SHOULD-FIX-2 (footer): the About version line advertises ONLY
      purchases that exist in v1.2 — the $1.99 Launch Pass. The "$2.99
      remove-ads arrives with v2" sentence is gone; the future v2
      remove-ads is not advertised anywhere in the app. Drive step 8b
      asserts the exact version line and that About contains no "$2.99".
- [x] SHOULD-FIX-3 (sources): SOURCES now has "Ultimate Edition contents"
      and "Game Pass" entries (exact wording copied from the v1.1 fix);
      the unit test asserts both labels exist.
- [x] SHOULD-FIX-1 (privacy): `privacy.html` carries the v1.1 wording
      verbatim — "three small settings" (console, checklist ticks,
      reminder toggle) plus the share-card cache PNG line — with the
      RevenueCat disclosure added on top (see below), not replacing it.
- [x] N1 (QA hooks): the `?now=` / `?platform=` hooks are kept — the
      chrome drive depends on `?now=`; they are unreachable in production.
- [x] Privacy policy updated for v1.2: a new "In-app purchases (Launch
      Pass)" section discloses RevenueCat as the purchase processor
      (purchase records + device identifiers, link to RevenueCat's privacy
      policy) and that payment is handled entirely by Apple; the "Data we
      collect" section is qualified (nothing to any server except the
      optional purchase); the pass entitlement cache is disclosed as an
      on-device mirror. **Flag: the App Store Connect "Data Not Collected"
      declaration from v1.1 must be UPDATED for v1.2** (parent's job).
- [x] Listing updated for v1.2: description gains the Launch Pass section,
      What's New v1.2 mentions it, the "Offers In-App Purchases" note and
      IAP product details are documented, and the Privacy section flags the
      declaration update.

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

## Codemagic (v1.2)

- [x] `codemagic.yaml` staged in the project root: mac_mini_m2, node 20,
      xcode latest, app_store_connect integration "codemagic",
      ios_signing_key group, automatic code signing, build-number bump from
      TestFlight, IPA build, `submit_to_testflight: true`,
      `submit_to_app_store: false`; BUNDLE_ID `com.nickhigh.vicountdown`;
      APP_STORE_APPLE_ID is 6834272574 (the v1.1 app record already exists)
- [ ] NOT run: no v1.2 Codemagic build has been triggered (parent's job,
      not this build's)

## Not verified (honest gaps)

- [ ] **Launch Pass sandbox test (v1.2's biggest gap):** no real purchase,
      restore, or cancel has ever run — the VM has no App Store sandbox,
      the RevenueCat key is still the placeholder, and the IAP product does
      not exist in App Store Connect yet. The sandbox checklist in README
      ("RevenueCat setup") must pass on a real iPhone with a TestFlight
      build before v1.2 submits: buy (badge appears immediately), relaunch
      (badge persists), delete + reinstall + restore, cancel at the Apple
      sheet (no badge, no error, no crash), buy with no network (plain
      error, no crash).
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
      lists the v1.2 plugin pods (Filesystem, LocalNotifications, Share,
      RevenueCat Purchases), so `pod install` will pick them up.
- [ ] **App Review outcome:** the "VI" trademark residual risk is documented
      in the README; a rename fallback exists if Review objects.

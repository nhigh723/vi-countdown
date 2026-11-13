# QA checklist — Countdown VI v1.0

Verified Nov 13, 2026 on the production build (`npm run build` + `dist/`).
Every item below was checked by a test, a real-browser drive, or a human
eyeball of a screenshot — nothing is asserted on faith.

## Automated — unit tests (20/20 pass)

`npm test` — `tests/countdown.test.mjs`

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
- [x] Monetization: ads off, no purchase exists in v1; v2 remove-ads product
      ID reserved and well-formed (`com.nickhigh.vicountdown.removeads`)

## Automated — Chrome phone-size drive (15/15 pass, zero console errors)

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
      xbox.com
- [x] Disclaimer present in About and footer
- [x] No placeholder text anywhere (no lorem / TODO / placeholder)
- [x] Post-launch state flips correctly (`?now=2026-11-20`): "IT'S OUT NOW",
      both store buttons, "checklist is coming soon"
- [x] Day-before-launch shows 1 day (`?now=2026-11-18`)

## Visual — screenshots eyeballed (qa-shots/)

- [x] 01-hero: bold gradient digits, date line, pre-load pill, clean dark
      theme
- [x] 02-unlock: PS5 card complete, store button visible, no clipped text
- [x] 03-timeline: three milestones with correct done/coming-up states
- [x] 04-facts: editions, platforms, details — all readable, no overflow
- [x] 05-news: four link cards with domains and arrows; About disclaimer
      visible below
- [x] 06-about: disclaimer, "collects no data" statement, full source list
- [x] 07-launched: "IT'S OUT NOW" hero, store buttons, checklist note
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
- [x] No Nov 18 date anywhere (some regional Xbox pages show it as a
      timezone quirk; the official date is Nov 19)

## Legal / IP

- [x] No Rockstar logos, artwork, map images, screenshots, or trailers
      anywhere in the app, icon, or listing
- [x] Title "Countdown VI" contains no "GTA" / "Grand Theft Auto" /
      "Vice City"; same for the subtitle and keywords
- [x] Disclaimer in the app (About + footer) and in the listing copy
- [x] News hub is links only — no copied articles, no scraping

## Not verified (honest gaps)

- [ ] **Real iPhone test:** the app has been driven in desktop Chromium at
      phone size, not on a physical iPhone or the iOS Simulator. Nick's
      Mac-mini Simulator run (README step 8) and his phone test of the
      GitHub Pages preview are the true checks.
- [ ] **Xcode build:** no Mac exists on this VM, so the project has never
      been compiled by Xcode. `npx cap add ios` generated the project
      cleanly; `pod install` was skipped (no CocoaPods here) and must run
      on the Mac via `npx cap sync ios`.
- [ ] **App Review outcome:** the "VI" trademark residual risk is documented
      in the README; a rename fallback exists if Review objects.

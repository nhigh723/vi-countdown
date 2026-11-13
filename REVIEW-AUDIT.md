# REVIEW AUDIT — Countdown VI v1.1 (independent, adversarial)

**Auditor:** independent subagent (read-only; no files edited)
**Date:** Nov 13, 2026, ~00:30 EST
**Scope:** `~/workspace/gta-companion/` (src/, index.html, privacy.html,
capacitor.config.json, ios/ Xcode project + Info.plist + Podfile,
package.json + package-lock.json, store/LISTING.md, store/screenshots/,
store/icon-1024.png, QA.md, README.md, BUILD-NOTES.md, codemagic.yaml)
+ live preview https://nhigh723.github.io/vi-countdown/ + the App Store
Connect state as reported (listing filled per LISTING.md, v1.1, subtitle
"Launch countdown & unlock", 5+5 screenshots, privacy policy URL set,
App Privacy "Data Not Collected", age rating 4+, Free in all countries,
Support URL set, Copyright "2026 Nick High", sign-in unchecked, review
contact being filled).
**Method:** fetched the current App Store Review Guidelines
(developer.apple.com/app-store/review/guidelines/, 1107 lines, crawled
Nov 13 05:29 UTC) and Apple's age-rating values page, then checked the
app section by section. Every character count re-counted by hand; every
math claim re-computed by hand; every unsourced fact verified against
live official sources. The live preview was fetched independently.

---

## VERDICT: NOT READY

**1 blocker.** It is a 2-minute fix in App Store Connect (no code change,
no rebuild, no new Codemagic run) — but as submitted, the app has a real,
evidence-backed rejection risk. Fix the blocker, then submit.

**Blocker list:**
1. **Age rating 4+ contradicts Apple's own definitions** — the guide copy
   contains a drug reference ("drug runners") that Apple's age-rating
   values page maps to 12+ (global) / 13+ (iOS 26). The questionnaire was
   answered all-No/None. A reviewer reading the guide can disagree with
   the rating → metadata rejection. See BLOCKER-1 below.

**Also found:** 3 SHOULD-FIX items (all cheap; two need a rebuild, one
is a web-only push) and 9 NOTEs (residual risks and doc hygiene, no
action required before submission).

---

## BLOCKER

### BLOCKER-1 — Age rating 4+ vs "drug runners" copy (Guidelines 2.3.6, 1.x)

**Location:** `src/config.ts:189` — user-visible in "What we know" →
The story → Jason Duval. Confirmed live on the preview
(https://nhigh723.github.io/vi-countdown/, "working for local drug
runners").

**The mismatch.** Apple's own age-rating values page
(developer.apple.com/app-store/age-ratings-values-and-definitions/,
checked Nov 13, 2026) states:
- **12+** (global): "Infrequent or mild references to alcohol, tobacco,
  or drug use"
- **13+** (iOS 26 ratings): "Infrequent alcohol, tobacco, or drug use or
  references"

One sentence in a character bio is an infrequent drug reference. The
app's content therefore maps to **12+ / 13+**, not 4+. The questionnaire
was answered all-No/None, producing 4+. The questionnaire answers are
arguably inaccurate for the "Alcohol, Tobacco, or Drug Use or References"
category.

**Why it matters.** Reviewers read the guide — it is a core section of
the app. A reviewer who notices the drug reference (or who simply
registers that this is a companion app for an ESRB M-rated game — the
app itself states "Rating: ESRB Mature 17+" in its facts section) can
disagree with the 4+ rating and issue a metadata rejection. A metadata
rejection costs 1–2 days of resubmission in a 7-day window to launch.
`store/LISTING.md` itself anticipated this: "expect 12+ or 17+".

**Supporting context (not independently triggering):** the only other
rating-relevant strings in the entire app are "weapons" (one word,
`src/main.ts:286`, Ultimate Edition contents list — a product
description, not a depiction of weapon use) and story-backstory phrases
("criminal conspiracy", "Leonida Penitentiary", "Taught to fight by her
father"). None of these is a drug reference and none maps cleanly to a
questionnaire category on its own. The drug line is the trigger.

**Fix — pick one (Option A recommended):**
- **Option A (fastest, no rebuild):** Re-answer the questionnaire in App
  Store Connect honestly — "Alcohol, Tobacco, or Drug Use or References"
  = Infrequent/Mild → rating becomes 12+ (13+ on iOS 26). No code
  change, no rebuild, no new Codemagic run. Audience impact is nil:
  the game is M-rated and the app's users are adults.
- **Option B (rebuild):** Soften the copy to remove the drug reference,
  e.g. "ended up in the Leonida Keys working for the wrong crowd."
  Requires a rebuild + a new Codemagic run, and leaves the rating
  judgment to the reviewer on the remaining copy.
- Belt-and-braces: do both.

---

## SHOULD-FIX

### SHOULD-FIX-1 — Privacy policy understates what the app stores (Guideline 5.1.1)

**Location:** `privacy.html:29-31` — "The app stores two small settings
on your device only: which console [you picked] and [your checklist
ticks]."

**The problem.** THREE localStorage keys exist, not two:
- `cvi.platform` — console choice (`src/main.ts:48`)
- `cvi.ready` — checklist ticks (`src/checklist.ts:13`)
- `cvi.reminder` — reminder toggle (`src/reminder.ts:13`)

The reminder key was added in the second v1.1 batch, *after* the privacy
policy was updated for the checklist — the policy was never updated
again. In addition, the share card writes a PNG to the device cache
(`src/share-card.ts:205-208`, `Filesystem.writeFile` to
`Directory.Cache`), which the policy does not mention at all.

**Risk:** low for review (a reviewer is unlikely to diff the policy
against localStorage keys), but it is a factual inaccuracy in a legal
document, and Guideline 5.1.1 requires the policy to accurately describe
data practices.

**Fix (web-only, no rebuild, no Connect change):** change "two small
settings" to "three small settings", add the reminder toggle, and add
one line that the share card writes a temporary PNG to the device cache
when shared. Push the updated `privacy.html` to the `main` branch — the
URL already in App Store Connect does not change.

### SHOULD-FIX-2 — About footer advertises a purchase that doesn't exist (Guidelines 2.3.1(a), 2.1)

**Location:** `src/main.ts:346` — "Version 1.1.0 · Free, no ads. A $2.99
one-time remove-ads option arrives with the v2 checklist update."
(Price label from `src/monetization.ts:15`.)

**The problem.** No purchase code paths exist in v1.1 — verified:
`src/monetization.ts` has `ADS_ENABLED = false`,
`hasRemoveAds()` always returns false, no ad SDK is bundled, and the
only consumer of the price label is this footer line. Guideline
2.3.1(a) says not to include content or services the app does not
offer. A reviewer could flag a user-visible price for a product that
cannot be bought.

**Risk:** low (~10–15%). The sentence is future-tense ("arrives with
the v2 checklist update"), and roadmap statements are common. The
specific price makes it feel more like an offer than a roadmap note.

**Fix (needs a rebuild):** drop the sentence until v2 ships, leaving
"Version 1.1.0 · Free, no ads." Bundle with any other code fix. If no
rebuild is happening for any other reason, weigh a ~30-minute rebuild
against this low risk — but Nick's bar is "NO rejection issues", so if
you rebuild at all, fix it.

### SHOULD-FIX-3 — Game Pass line + Ultimate contents detail are unsourced; they break the app's own sourcing claim (Guideline 2.3)

**Locations:**
- `src/main.ts:295` — "Game Pass: not announced for Game Pass at launch
  — it is sold as a paid pre-order."
- `src/main.ts:286` — Ultimate Edition contents ("exclusive vehicles,
  weapons, apparel and more for Jason and Lucia's story").

**The problem.** Both lines live in `main.ts`, outside `config.ts` —
so the "every fact has a source" unit test does not cover them, and
neither appears in the `SOURCES` list shown in About. This breaks two
claims the app and listing make:
- The guide header: "Every line traces to a source listed in About."
- The listing description: "every line traced to an official source
  listed in the app."

**Both facts are TRUE** (verified Nov 13 against live sources — see
"Facts verified" below). This is a citation gap, not a falsehood.

**Fix (needs a rebuild):** add two `SOURCES` entries — Game Pass: Xbox
Store listing (paid $79.99/$99.99 pre-order, no Game Pass announcement)
+ Take-Two CEO's stated objection to day-one subscription launches;
Ultimate contents: Xbox News Nov 10, 2026 / PlayStation Store. Or drop
the Game Pass line (the less essential of the two).

---

## NOTES (no action required before submission)

- **N1 — QA hooks left in shipped code** (`src/main.ts:5-6` comment,
  `:52` `?now=ISO` clock override, `:65` `?platform=` override).
  Unreachable in production — there is no URL bar in the WKWebView, so
  no user or reviewer can trigger them. Strip as defense-in-depth if
  rebuilding anyway.
- **N2 — "Coming soon in v2" teasers** (`src/main.ts:315` plus the "After
  launch: the 100% checklist" section and the hero post-launch note).
  Lower risk than the footer price line: the teasers promise a *free*
  feature, clearly in the future. Common in shipping apps.
- **N3 — Keywords contain trademarks** ("gta", "gta 6", "ps5", "xbox",
  "series x"). A strict reading of Guideline 2.3.7 disfavors trademark
  keywords without permission. In practice, descriptive/relevant
  keywords for a companion app are the norm and rarely enforced.
  Dropping them would gut App Store discoverability — the tradeoff
  favors keeping them. Accept the residual risk.
- **N4 — `index.html` title/meta use the trademarks** ("GTA VI Launch
  Countdown", "Grand Theft Auto VI", "gta 6 countdown" keywords). This
  is web SEO for the GitHub Pages preview, not App Store metadata;
  reviewers do not inspect HTML titles.
- **N5 — Privacy policy contact is circular.** "Questions about this
  policy can be sent to the developer through the App Store listing" —
  the listing has no contact mechanism, and the Support URL (the preview
  page) has no contact path either. Low risk; fixing it needs Nick's
  choice of a publishable contact email. Not a rejection risk in
  practice.
- **N6 — Export compliance question not yet addressed in App Store
  Connect.** Must be answered at submission. The app uses only standard
  iOS HTTPS (and its external links open in Safari, not in-app), so the
  standard exemption applies. Connect-side step, not an app defect.
- **N7 — Stale docs (not submission issues).** `store/LISTING.md`'s
  header note claims "The description names the game it counts down
  to" — the submitted description actually contains NO "Grand Theft
  Auto", "GTA", or "Vice City" (only "Rockstar", "Leonida", character
  names). `codemagic.yaml`'s header says the app record doesn't exist
  yet (it does; Apple ID 6834272574 is filled). `QA.md`'s Codemagic
  section says the Apple ID is the placeholder (it's filled).
- **N8 — `config.xml` version gotcha.** `npx cap sync` regenerates
  `ios/App/App/config.xml` back to 1.0.0; it was set back to 1.1.0 after
  the last sync. Cosmetic only — the App Store version comes from
  MARKETING_VERSION, not config.xml. Re-check after any re-sync.
- **N9 — Never run on a real device or compiled by Xcode.** The native
  reminder and native share sheet have only ever run through web
  fallbacks; the Codemagic build now running is the first-ever Xcode
  compile. These are the known honest gaps from QA.md, not new
  findings — but they are the largest remaining unknowns. If the
  Codemagic build fails, read the log and fix; that is a build gate,
  not a review gate.

---

## SECTION-BY-SECTION GUIDELINE CHECK

### 1.x Safety — PASS except BLOCKER-1
Every user-visible string was grepped for mature content. The only
hits in the entire app: "drug runners" (`config.ts:189`) and "weapons"
(`main.ts:286`). No alcohol, tobacco, sex, gambling, profanity,
violence, blood, gore, or killing references anywhere. The app contains
no user-generated content, no chat, no web views of third-party content
(links open in Safari), no objectionable imagery. The 4+ rating is the
only safety-adjacent issue, and it is the blocker above.

### 2.1 Completeness — PASS with SHOULD-FIX-2 noted
No dead ends, no broken links (all 4 external URLs are live official
sites), no demo/beta/test labeling, no unfinished features in the UI.
The v2 teaser section is clearly labeled future and free. The footer
price line (SHOULD-FIX-2) is the only completeness-adjacent concern.
The app works fully offline except for the outbound news/store links,
which is stated in About.

### 2.3 Metadata accuracy — PASS with SHOULD-FIX-3 noted
Every listing claim was checked against the actual app:
- Description claims (countdown, unlock checker, timeline, checklist,
  guide, reminder, share card, world times, news links, offline, no
  data collected) — all true and present in the app.
- Subtitle "Launch countdown & unlock" — accurate.
- Promo text "Pre-load is open. 212 GB. Midnight Nov 19. Countdown,
  checklist, reminder & share card — free." — all true.
- Screenshots: all 10 at exact Apple sizes (see Assets), generated from
  the v1.1 build per QA.md.
- The one inaccuracy: the "every line traces to a source" claim, broken
  by the two unsourced lines in SHOULD-FIX-3.
- No misleading claims about affiliation: the unofficial-fan disclaimer
  appears in About, the footer, and the listing.

### 2.5 Software — PASS
Public APIs only: Capacitor 7.6.10 + three official Capacitor plugins
(Filesystem 7.1.9, LocalNotifications 7.0.7, Share 7.0.4), all on their
v7 lines, compatible with Capacitor 7. No undocumented APIs, no private
frameworks, no hidden features except the unreachable QA hooks (N1).
No `console.log`, `debugger`, TODO, or FIXME anywhere in `src/` (one
"console" hit is "Pick your console" — a game console, false positive).
No `fetch`, XHR, or WebSocket anywhere in `src/`. AppDelegate is the
stock Capacitor template. Info.plist is clean: display name
"Countdown VI", no usage-description keys needed (no camera/mic/photos/
location; local notifications need no plist key). iPhone portrait +
both landscapes, iPad all four orientations; `#app` max-width 560px
centered, so landscape/iPad renders a centered column.

### 3.x Business — PASS
Free app, no IAP in v1.1 — verified: no purchase code paths exist
(`monetization.ts` is flags and constants only; `hasRemoveAds()`
always false; no ad SDK bundled). The PlayStation/Microsoft store
links point to a console game consumed outside the app, not a digital
good used in the app (3.1.3(e)-style goods consumed outside the app) —
standard for game companion apps, low risk under 3.1.1/3.2.2. The v2
remove-ads mention is SHOULD-FIX-2, not a 3.x violation in itself
(nothing is sold in v1.1).

### 4.0/5.1 Privacy — PASS except SHOULD-FIX-1
Nothing sends data anywhere: no network calls in `src/`, no analytics,
no ads SDK, no crash reporting, no third-party SDKs at all. Storage is
three localStorage keys on-device only + one cached PNG for the share
card. Local notifications are scheduled on-device. The share sheet
shares only a locally generated image. External links open in Safari.
The "Data Not Collected" App Privacy declaration is accurate. The
privacy policy is live and correct except for the storage undercount
(SHOULD-FIX-1) and the circular contact (N5).

### 4.2 Minimum functionality — LIKELY PASSES
v1.1 has 9 sections with real interactivity: live countdown, platform
unlock checker (persisted toggle), launch timeline, 7-item get-ready
checklist (persisted, live badges), "What we know" guide, launch-night
reminder (schedules a real local notification), shareable countdown
card (generates a 1080×1920 PNG), who-plays-first world times
(Intl-based math), and official news links. Guideline 4.3(b) warns
that "simple timers" are rejected unless they offer a meaningfully
different experience — v1.1's defense is its interactivity, which goes
well beyond a timer. **Single weakest element:** the news section (4
pure outbound links, no in-app value) plus the v2 teaser section (no
functionality). Neither is likely to sink the review on its own given
the rest of the app, but if Apple pushes back on depth, these are the
two sections a reviewer would point at.

### 5.2 Intellectual property — RESIDUAL RISK (inherent to the concept)
Trademark counts in `src/` + `index.html`: Rockstar 33, Xbox 24,
PlayStation 22, Leonida 12, GTA 10, Vice City 10, Grand Theft Auto 7,
Take-Two 4, GTA+ 3 — mostly source attributions and nominative/factual
uses. No Rockstar logos, art, screenshots, or audio anywhere. The
unofficial-fan disclaimer is in About, the footer, and the listing.
**Riskiest 3 uses:**
1. The app's entire identity is built around GTA VI (title "Countdown
   VI" + sole subject). Mitigated by the disclaimer, the absence of any
   Rockstar assets, and live precedent: "Vice Protocol: The VI Hub" is
   already approved and live on the App Store with GTA VI countdowns.
2. "Grand Theft Auto VI" in prominent UI strings (hero launched state,
   timeline launch-day detail, guide, facts album line). Nominative use
   — naming the thing the app counts down to — but prominent.
3. "GTA+" service mark in the pre-order bonus (3×, all factual).
This risk cannot be eliminated without killing the app. The precedent
of an already-approved GTA VI countdown app is the strongest defense.

---

## CHARACTER RECOUNTS (done by hand, not trusted from the file)

| Field | Limit | Recounted | Result |
|---|---|---|---|
| Name "Countdown VI" | 30 | 12 | PASS |
| Subtitle "Launch countdown & unlock" | 30 | 25 | PASS |
| Keywords | 100 | 86 | PASS |
| Promo text | 170 | 142 | PASS |
| Description | 4000 | 2295 | PASS |
| What's New (v1.1) | 4000 | 513 | PASS (field does not exist on a first release; correctly skipped) |

The file's own notes (25, 86) are correct. The earlier 31-char subtitle
bug is fixed and stays fixed.

## CONSISTENCY — PASS

- Bundle ID `com.nickhigh.vicountdown` identical in
  `capacitor.config.json`, the Xcode pbxproj, and `codemagic.yaml`.
- Version 1.1: MARKETING_VERSION 1.1 (×2 in pbxproj),
  CURRENT_PROJECT_VERSION 1 (Codemagic bumps from TestFlight),
  APP_VERSION / package.json / config.xml 1.1.0.
- Deployment target iOS 14.0 (Capacitor 7 minimum — sane).
- Podfile has all 3 plugins (Filesystem, LocalNotifications, Share) +
  Capacitor/CapacitorCordova.
- package-lock resolves Capacitor 7.6.10, filesystem 7.1.9,
  local-notifications 7.0.7, share 7.0.4 — all v7, mutually compatible.

## ASSETS — PASS

- Icon 1024×1024, RGB, no alpha; the store icon is byte-identical to
  the Xcode AppIcon catalog file (md5
  `d387f143ae12ce649e9369775845f951`).
- All 10 screenshots at exact required sizes (6.5" 1242×2688, 6.9"
  1290×2796), RGB, no alpha.
- No placeholder/TODO/lorem text in `src/` or in the built `dist/`.

## MATH SPOT-CHECKS (done by hand, not trusted from the tests)

- **Countdown target:** `new Date(2026, 10, 19, 0, 0, 0)` = local
  midnight Thu Nov 19, 2026 (month 10 = November, 0-indexed). Nov 18,
  2026 = Wednesday, Nov 19 = Thursday (verified with `date`). ✓
- **Reminder:** launch minus 5 min = Nov 18, 11:55 PM local. ✓ Matches
  the app's copy and the checklist item.
- **World times (EST):** Auckland midnight NZDT (UTC+13) = Nov 18
  11:00 UTC = 6:00 AM EST / 3:00 AM PST; Sydney midnight AEDT (UTC+11)
  = Nov 18 13:00 UTC = 8:00 AM EST / 5:00 AM PST. ✓ Both match the
  live preview's rendered labels (preview rendered in PST: Auckland
  3:00 AM, Sydney 5:00 AM, Tokyo 7:00 AM, Paris 3:00 PM, London 4:00
  PM, New York 9:00 PM, Chicago 10:00 PM, Los Angeles midnight — all
  eight consistent with the UTC instants, confirming the Intl-based
  math works in a second timezone).
- **Six named regions:** Vice City, Leonida Keys, Grassrivers, Port
  Gellhorn, Ambrosia, Mount Kalaga National Park = 6. ✓ Verified
  against 5 live sources citing Rockstar's official "Only in Leonida"
  pages (gtamap.io, gta6-life.com, endgametools.com, gta6times.com,
  allgtaworld.com — all Nov 9–13, 2026).
- **Eight profiles:** Jason + Lucia + Cal Hampton, Boobie Ike,
  Dre'Quan Priest, Real Dimez, Raul Bautista, Brian Heder = 8. ✓
  Corroborated by allgtaworld.com ("alongside the eight confirmed
  characters").

## FACTS VERIFIED (live sources, Nov 13, 2026)

- **Game Pass line — TRUE.** Multiple sources (Oct 27–29, 2026) confirm
  no Game Pass announcement at launch; the Xbox Store sells GTA VI as a
  paid pre-order ($79.99 / $99.99). Take-Two's CEO has publicly
  objected to day-one subscription launches. (Citation still missing
  from the app — SHOULD-FIX-3.)
- **Ultimate Edition contents — TRUE.** The app's wording ("exclusive
  vehicles, weapons, apparel and more for Jason and Lucia's story")
  matches Rockstar's official wording verbatim (Xbox News, Nov 10,
  2026; PlayStation Store: "an exclusive collection of premium
  vehicles, weapons, apparel, and action threaded across all aspects of
  Jason and Lucia's story"). (Citation still missing from the app —
  SHOULD-FIX-3.)
- **Pre-order bonus deadline** (Nov 19, 11:59:59 PM) matches the Xbox
  Store listing. ✓
- **Six regions + eight profiles** verified as above. ✓

## LIVE PREVIEW CHECK (independent fetch, Nov 13 05:24 UTC)

https://nhigh723.github.io/vi-countdown/ renders v1.1 fully: countdown
(6 days, 02:35:43 at fetch), unlock checker, 7-item checklist (0 of 7
ready), reminder section with the web-fallback note, all 8 world times
in the correct order, timeline (Nov 10 Done / Nov 12 Today / Nov 19
Coming up), guide with the "drug runners" line (BLOCKER-1 confirmed
user-visible), facts, v2 teaser, news links, About with the full source
list, and the footer with the $2.99 line (SHOULD-FIX-2 confirmed
user-visible). No rendering errors, no placeholder text.

## WHAT THE TWO EARLIER AUDITS ALREADY FIXED (confirmed still fixed)

- Subtitle 31 chars → 25 chars. Still 25. ✓
- Missing Support URL / Copyright → both set in Connect. ✓
- Wrongly-checked "Sign-in required" → unchecked. ✓
- Privacy policy updated for checklist storage (but not for the
  reminder — SHOULD-FIX-1).
- News titles softened; listing copy updated for v1.1. ✓

## RECOMMENDED FIX ORDER (fastest path to READY)

1. **BLOCKER-1 — re-answer the age questionnaire in App Store Connect**
   (2 min, no rebuild): drug-reference question = Infrequent/Mild →
   rating becomes 12+. Do this before submitting. This alone moves the
   verdict to READY.
2. **SHOULD-FIX-1 — privacy policy** (web-only push, no rebuild, no
   Connect change): fix the storage count and add the cache line; push
   `privacy.html` to `main`. Can ship any time, before or after
   submission.
3. **If rebuilding for any reason**, bundle SHOULD-FIX-2 (footer),
   SHOULD-FIX-3 (two source entries), and N1 (strip QA hooks) into
   that build. If the Codemagic build already succeeded and no rebuild
   is otherwise needed, these three are a judgment call: each is
   individually low-probability, but Nick's bar is zero rejection
   issues, and a rebuild costs ~30 minutes against a 7-day window.
4. **At submission:** answer the export-compliance question (standard
   exemption) and confirm the review contact details are filled
   (first name Nicholas, last name High, phone 6036706361, email
   Nickrhigh@yahoo.com).
5. **Residual risks to accept, not fix:** the 5.2 IP identity risk
   (mitigated by disclaimer + no assets + Vice Protocol precedent),
   the 4.2 depth risk (mitigated by v1.1's interactivity), trademark
   keywords (N3), and the untested native paths (N9 — the Codemagic
   build and a first iPhone run are the only way to close these).

---

*End of report. Verdict: NOT READY — 1 blocker (age rating), 3
should-fixes, 9 notes. The blocker fix takes ~2 minutes in App Store
Connect and requires no rebuild.*

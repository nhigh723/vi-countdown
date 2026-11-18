# Countdown VI 2.0 — native rebuild (Expo)

Unofficial fan companion for the Nov 19, 2026 launch, rebuilt in Expo / React Native for the weeks **after** launch. Ships as an update to the existing App Store app (same bundle ID `com.nickhigh.vicountdown`, version **2.0**). The Capacitor 1.x app (repo root on the `source` branch) is untouched.

## What's in it

| | Free | Pro (one-time) |
|---|---|---|
| Countdown before launch / "Day N" launch mode after | ✓ | ✓ |
| Official store + news links | ✓ | ✓ |
| 100% tracker: six generic categories, your own goals, + / − | ✓ | ✓ |
| Custom tracker categories | 1 | Unlimited |
| Share card (countdown or progress), Neon style | ✓ | ✓ |
| Sunset / Ocean / Mono / Gold styles (cards + widgets) | — | ✓ |
| Home Screen widget (small, medium) | ✓ | ✓ |
| Lock Screen widgets (circular ring, rectangular, inline) | lock hint | ✓ |
| Founder badge | — | ✓ |
| Ads / account / analytics | none | none |

**Content rule:** the tracker ships no game data — no mission/collectible lists, counts, maps or anything copied from guides or datamined. Category names are generic; every goal is typed by the player. No Rockstar art, no "GTA" in name/icon/IAP. Disclaimer in About and on every share card.

**Launch-night Live Activity: not built.** 2.0 can't reach the App Store before launch night (1.1 is still in review, then 2.0 needs its own review), so a launch-night Live Activity would never be seen. If a future version wants one (e.g. a play-session timer), add a `type: "widget"` ActivityKit view to `targets/widget` plus a small native module to start it.

## Code map

- `App.tsx` — all screens (Home, Tracker, Pro, About), tab bar, share-card capture.
- `src/tracker.ts` — pure tracker logic (goals, counts, free limit, persistence, summary, day number).
- `src/themes.ts` — card/widget palettes, Pro gating, card wording.
- `src/entitlement.ts` — pure purchase parsing (owns Pro? cancelled? pending? price).
- `src/iap.ts` — StoreKit via `expo-iap` (OpenIAP): products, purchase, restore, purchase listener, finishTransaction. No third-party purchase service, no key.
- `src/widgetSync.ts` — writes progress / Pro / style to the App Group `group.com.nickhigh.vicountdown` for the widget (`@bacons/apple-targets` ExtensionStorage).
- `targets/widget/` — WidgetKit extension (SwiftUI), bundle `com.nickhigh.vicountdown.widget`, generated into the Xcode project at prebuild by `@bacons/apple-targets`.
- `store/IAP-SETUP.md` — product, price reasoning, review screenshot, sandbox checklist.
- `store/LISTING-2.0.md` — App Store copy, privacy answers, review notes.

## Test

```
npm ci
npm test              # jest: tracker, themes, entitlement, config + widget/app contract (35 tests)
npm run typecheck     # tsc --noEmit
npx expo export -p web --output-dir /tmp/cvi-web && node tests/web-drive.mjs   # headless Chrome drive, 11 steps
```

The web drive covers the JS UI. It can't cover StoreKit, the share sheet or widgets — those need the TestFlight build (see `store/IAP-SETUP.md`).

## Build → TestFlight (EAS, Expo account `nickhigh`, project `@nickhigh/countdown-vi`)

Build and submit are separate steps; nothing is ever submitted for App Review by these commands.

```
cd v2
export EXPO_TOKEN=…                       # Expo access token
eas build -p ios --profile production --non-interactive --no-wait
eas submit -p ios --profile production --id <BUILD_ID> --non-interactive   # TestFlight upload only
```

Credentials: EAS manages the distribution certificate and the provisioning profiles for the app **and** the widget extension (`com.nickhigh.vicountdown.widget`) and the App Group capability. On the first build for this project they must be created with Apple access — either an App Store Connect API key in the environment (`EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`, `EXPO_APPLE_TEAM_ID=Z3S5X9HZXU`, `EXPO_APPLE_TEAM_TYPE`) or one interactive `eas credentials -p ios` run.

**App Group — one manual step.** Credentials and both provisioning profiles now exist on EAS (made with the ASC API key; distribution cert shared with Aether). But the App Group *identifier* `group.com.nickhigh.vicountdown` can't be registered with an API key (Apple only allows it from the Developer portal or an Apple-ID login), so a `production` build fails signing with "profile doesn't support the group.com.nickhigh.vicountdown App Group". Fix once:

1. developer.apple.com → Certificates, IDs & Profiles → Identifiers → App Groups → **+** → `group.com.nickhigh.vicountdown`.
2. Open the identifiers `com.nickhigh.vicountdown` and `com.nickhigh.vicountdown.widget` → App Groups → Configure → tick the group → Save.
3. `eas credentials -p ios` → production → regenerate both provisioning profiles (or just delete them there; the next build recreates them), then `eas build -p ios --profile production`.

Until then, `--profile production-nogroup` (sets `CVI_APP_GROUP=0`, see `app.config.js`) builds without the App Group: everything works except the widget can't read tracker % / Pro state (Home widget shows the countdown/day count; Lock Screen widgets show the Pro prompt). Use it for TestFlight testing only — ship 2.0 from `production`.

Build number: `ios.buildNumber` in `app.json` (1.1 = build 1, 1.2 Capacitor = build 2 → 2.0 starts at 3). Bump it for every upload.

## Before submitting 2.0 (Nick's call)

1. 1.1 must be approved/released first (one version in review at a time).
2. Update the Launch Pass IAP's display name/description (and price if agreed) and its review screenshot — see `store/IAP-SETUP.md`.
3. Paste `store/LISTING-2.0.md` copy, new screenshots, review notes; attach the IAP to the 2.0 version.

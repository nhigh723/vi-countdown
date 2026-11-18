# Countdown VI 2.0 — monetization & review-risk research (Nov 17, 2026)

Short, sourced. **[A]** = assumption / judgment, not data.

## 1. What makes money for a game companion after a mega launch

| Finding | Source |
|---|---|
| Ads earn early and then stop: by Day 1 ads have made 57% of their 60-day revenue, by Day 7 89%. One-time IAP reaches 60% by Day 7, subscriptions 52%. | [AppsFlyer, App Monetization 2026 (summary)](https://gamedevreports.substack.com/p/appsflyer-app-monetization-in-2026) |
| North America converts ~11% of installs into first-time purchasers within 30 days for non-game apps (all-app average 9.8%). | same |
| Subscriptions are fastest-growing overall, but in games they're still small (4% → 7% of revenue in hybrid apps); IAP ~35%. | same; [AppWinners](https://appwinners.eu/guides/mobile-game-monetisation-models) |
| One-time purchase is uncommon in tracked apps (4%), subscription is the default (61%). | [Lazyweb tracked-app models](https://design.lazyweb.com/blog/how-do-tracked-apps-make-money-subscription-ads-transactions) |
| Widgets/Live Activities lift retention: Live Activity apps +23.7% 30-day retention (OneSignal); widget users +25% retention (Gratitude). Some apps keep widgets Premium-only (Tiimo). | [OneSignal report](https://www.businesswire.com/news/home/20240404579115/en/OneSignal-Releases-2024-State-of-Customer-Engagement-Report-Revealing-Key-Omnichannel-Considerations-and-Opportunities), [Android Dev Blog](https://developer.android.com/blog/posts/gratitude-saw-25-higher-retention-for-widget-users), [retention.blog](https://www.retention.blog/p/widgets-and-live-activities) |
| Live Activities must track a real, time-bound event and can't be used for marketing/upsell. | [retention.blog](https://www.retention.blog/p/widgets-and-live-activities) |
| Competing GTA VI fan apps on the App Store are ad- or AI-driven "guides" using the GTA name directly (e.g. "GTA 6 Guide & AI"). | [App Store listing](https://apps.apple.com/tm/app/gta-6-guide-ai/id6783925266) |

**What we did with it**
- **One-time Pro, not a subscription.** [A] A countdown/tracker for one game has a short, front-loaded life (weeks to a few months); a subscription would churn fast and invites 1-star "subscription for a countdown" reviews. A one-time unlock fits the AppsFlyer timing (most IAP within a week) and keeps the "no subscription" promise in the listing.
- **No ads.** Ads would add an SDK that breaks "Data Not Collected" (ATT prompt, privacy label), and at the likely install volume [A] they'd earn very little after the first days. Not justified.
- **Widgets as the hook; Lock Screen widgets + styles + unlimited trackers in Pro.** Home Screen widget stays free so people place it (retention); the Lock Screen version is the upgrade.
- **Live Activity: not built for 2.0.** 2.0 can't be approved before launch night, and Apple only allows Live Activities for real ongoing events. Revisit only if a real event exists (e.g. a play-session timer).

## 2. Apple review risk (5.2.1 / 4.1) for an unofficial fan app

- **5.2.1:** "Don't use protected third-party material such as trademarks … without permission … Apps should be submitted by the person or legal entity that owns or has licensed the intellectual property." ([Apple guidelines](https://developer.apple.com/app-store/review/guidelines/))
- Guides on 5.2.1 rejections say an "Unofficial" label rarely helps if the app **depends on** the franchise's name/art; the advice is to remove the material or become a generic tool. Typical triggers: brand in name/subtitle, trademarks in keywords, copied art. ([appsubmitter.io](https://www.appsubmitter.io/app-rejection-guides/app-store-guideline-5-2-1-intellectual-property/), [devoria.fr](https://devoria.fr/en/blog/guideline-5-2-1-intellectual-property-app-rejected))
- Take-Two actively enforces against fan GTA projects that use its games/assets (DMCA on a browser Vice City port, Dec 2025; fan GTA V ports shut down, Sep 2026). No confirmed App Store takedown of a plain countdown/tracker was found. ([XDA](https://www.xda-developers.com/gta-vice-city-now-playable-in-a-browser-dos-zone/), [iXBT](https://ixbt.games/en/news/2026/09/29/modder-brosil-vyzov-iuristam-take-two-ego-zametili-i-zakryli-fanatskie-porty-gta-v-na-android-i-nintendo-switch.html))

**How 2.0 is built to minimise it**
- Name, subtitle, keywords, icon and IAP name: no "GTA", "Grand Theft Auto", "Rockstar" or "Vice City".
- No Rockstar art, logos, screenshots, music, map, or guide/datamined content. The tracker is generic categories with goals the player types.
- The game is named only in factual, sourced text (dates, platforms, official profiles) with the source listed, plus the disclaimer in About and on every share card.
- **Residual risk [A]: real.** Selling Pro makes the app commercial use around someone else's game, which raises 5.2.1 exposure versus a free 1.x. The tracker/widget/Pro features themselves work for any game, which is the fallback if Apple objects: re-pitch as a generic "100% tracker" without the game references.

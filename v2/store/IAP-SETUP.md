# Countdown VI Pro — in-app purchase setup sheet (v2.0)

**Nothing here has been changed in App Store Connect.** Every edit below needs Nick's OK.

## The product (already exists — reuse it)

| Field | Value |
|---|---|
| Product ID | `com.nickhigh.vicountdown.launchpass` (exists, status *Ready to Submit*, Apple ID 6834406791) |
| Type | Non-consumable (one-time unlock, restorable on every device with the same Apple ID) |
| Reference name | Launch Pass (internal only, can stay) |
| Current price | $1.99 (US tier, set Nov 13) |
| **Suggested price** | **$2.99** — see reasoning below |
| **Suggested display name** (≤ 30 chars) | `Countdown VI Pro` |
| **Suggested description** (≤ 55 chars) | `Unlimited trackers, Lock Screen widgets, card styles` (52 chars) |
| Current description (stale) | "Founder badge, ad-free checklist, and no ads, ever." — no longer matches what the purchase unlocks; update before submitting 2.0 |
| Family Sharing | Optional; recommend **on** (goodwill, no cost) |
| Review screenshot | Required. Replace the current one (taken from the old web preview) with an iPhone screenshot of the **Pro tab** in a TestFlight build of 2.0, 1290×2796 (6.9") or 1320×2868. |
| Review notes | "Tap the Pro tab (star). 'Unlock Pro' buys com.nickhigh.vicountdown.launchpass, a one-time non-consumable. Restore Purchases is on the Pro and About tabs. Pro unlocks unlimited custom tracker categories, four extra share-card/widget styles, Lock Screen widgets and a Founder badge. No account, no server; purchase is verified by StoreKit on device." |

The in-app copy never hard-codes a price: the button shows StoreKit's localized `displayPrice`, so changing the price in App Store Connect needs no app update.

## Why $2.99 (assumption-labeled)

- It's a one-time unlock of tools people use for weeks (a 100% run on an open-world game is a 50–150 hour project — assumption), with widgets — the feature Collectr puts behind its paid tier ([BetaKit](https://betakit.com/how-collectr-bootstrapped-a-trading-card-hobby-into-an-eight-figure-business/)).
- $2.99 is still an impulse price; $1.99 leaves money on the table for a feature set this size, $4.99 starts to feel like a game DLC price for a fan app (judgment, not data).
- Proceeds at $2.99: about **$2.54** with the App Store Small Business Program (15%) or **$2.09** at the standard 30%. ASC shows $1.40 proceeds on the current $1.99 tier, which is the 30% rate — **check whether Nick's account is enrolled in the Small Business Program** ([Apple](https://developer.apple.com/app-store/small-business-program/)); enrolling is free and doubles-ish the margin on every sale.

## Upside — rough estimate, every input is an assumption [A]

Revenue ≈ active 2.0 users × Pro conversion × proceeds per sale.

| Active users who get 2.0 [A] | Conversion 1% [A] | Conversion 3% [A] |
|---|---|---|
| 5,000 | 50 sales ≈ $105–$127 | 150 ≈ $314–$381 |
| 25,000 | 250 ≈ $523–$635 | 750 ≈ $1,568–$1,905 |
| 100,000 | 1,000 ≈ $2,090–$2,540 | 3,000 ≈ $6,270–$7,620 |

Proceeds range = $2.09 (30% commission) to $2.54 (Small Business Program 15%). 1–3% is deliberately below AppsFlyer's ~11% NA first-purchase rate for non-game apps (that figure is for apps built around paying; a free fan countdown is not) — see `RESEARCH.md`. Install volume is the unknown that matters: we have no 1.x download data yet (1.1 isn't live). Most of it lands in the first 1–2 weeks after launch, so getting 2.0 approved quickly after 1.1 is worth more than adding features.

## Sandbox test checklist (needs the TestFlight build + a Sandbox Apple ID)

1. Fresh install → Pro tab shows "Unlock Pro — $x.xx" with the real price.
2. Buy → Apple sheet → success → "★ Founder" in the header, Lock Screen widget unlocked, second custom tracker allowed, Gold style selectable.
3. Delete app, reinstall → Pro is back automatically on launch (or via Restore Purchases).
4. Cancel in the Apple sheet → no message, nothing unlocked.
5. Ask to Buy (child sandbox account) → "Waiting for approval" → approve → Pro unlocks without another tap.
6. Refund in sandbox (Settings → Developer → Sandbox) → Restore Purchases → Pro is removed.

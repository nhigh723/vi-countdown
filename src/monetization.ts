// Countdown VI — monetization flags.
// v1.1 was FREE with no ads and no paywall. v1.2 adds the Launch Pass
// ($1.99 one-time, see src/store.ts): pass holders get the Founder badge
// now, the v2 100% checklist unlocked at launch, and NO ADS EVER.
// Ads themselves still do not exist yet — ADS_ENABLED stays false until
// v2 wires an ad SDK (AdMob) into the checklist screens.
//
// hasRemoveAds() takes the Launch Pass state: a pass holder never sees
// ads, so when ads arrive they are hidden for pass holders exactly as if
// they had bought the remove-ads unlock. The separate $2.99 remove-ads
// product (REMOVE_ADS_PRODUCT_ID) is for everyone else, and is still
// reserved for v2 — no remove-ads purchase exists in v1.2.

export const ADS_ENABLED = false;

/** Reserved product ID for the v2 one-time remove-ads purchase. */
export const REMOVE_ADS_PRODUCT_ID = 'com.nickhigh.vicountdown.removeads';
export const REMOVE_ADS_PRICE_LABEL = '$2.99';
export const REMOVE_ADS_ENTITLEMENT = 'remove_ads';

/**
 * True when this user must never see ads: Launch Pass holders are ad-free
 * forever. (The v2 remove-ads purchase will OR in here when it lands.)
 * Pass `launchPassOwned` from the store's entitlement cache.
 */
export function hasRemoveAds(launchPassOwned = false): boolean {
  return launchPassOwned;
}

/** Ads show only once an ad SDK exists (v2) AND the user has no pass. */
export function shouldShowAds(launchPassOwned = false): boolean {
  return ADS_ENABLED && !hasRemoveAds(launchPassOwned);
}

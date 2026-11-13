// Countdown VI — monetization hooks for v2 (post-launch checklist update).
// v1 is FREE with no ads and no paywall — downloads first. This file exists
// so v2 adds ads + the remove-ads unlock WITHOUT restructuring the app.
//
// v2 plan (do not build yet):
//  - Turn ADS_ENABLED on and wire an ad SDK (AdMob) into the checklist screens.
//  - Sell REMOVE_ADS_PRODUCT_ID as a $2.99 one-time non-consumable via
//    RevenueCat; entitlement "remove_ads" hides all ad slots.
//  - Nothing in v1 reads these flags except the About screen's roadmap line.

export const ADS_ENABLED = false;

/** Reserved product ID for the v2 one-time remove-ads purchase. */
export const REMOVE_ADS_PRODUCT_ID = 'com.nickhigh.vicountdown.removeads';
export const REMOVE_ADS_PRICE_LABEL = '$2.99';
export const REMOVE_ADS_ENTITLEMENT = 'remove_ads';

/** v1 always returns false: there is no ad system and no purchase yet. */
export function hasRemoveAds(): boolean {
  return false;
}

/** v1 always returns false: no ad SDK is bundled. */
export function shouldShowAds(): boolean {
  return ADS_ENABLED && !hasRemoveAds();
}

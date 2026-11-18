// Countdown VI v2 — constants. Facts here trace to official sources listed
// in About (carried over from v1.1, verified Nov 12–13, 2026).

export const APP_NAME = 'Countdown VI';
export const APP_VERSION = '2.0';
export const BUNDLE_ID = 'com.nickhigh.vicountdown';
export const APP_GROUP = 'group.com.nickhigh.vicountdown';

/** One-time, non-consumable Pro unlock. Re-uses the product that already
 *  exists in App Store Connect ("Launch Pass"), so no new product is
 *  needed — only its display name/description should be refreshed. */
export const PRO_PRODUCT_ID = 'com.nickhigh.vicountdown.launchpass';
export const PRO_NAME = 'Countdown VI Pro';

/** Local midnight, Thursday Nov 19, 2026 (PS5 confirms midnight local). */
export const LAUNCH_LOCAL = new Date(2026, 10, 19, 0, 0, 0);
export const LAUNCH_LABEL = 'Thursday, November 19, 2026';

export const DISCLAIMER =
  'Unofficial fan app. Not affiliated with, endorsed, sponsored, or approved by Rockstar Games or Take-Two Interactive. All trademarks belong to their owners.';

export const PRIVACY_URL = 'https://nhigh723.github.io/vi-countdown/privacy.html';

export interface StoreLink {
  id: 'ps5' | 'xbox';
  label: string;
  url: string;
}

export const STORE_LINKS: StoreLink[] = [
  { id: 'ps5', label: 'PlayStation Store', url: 'https://www.playstation.com/en-us/games/grand-theft-auto-vi/' },
  { id: 'xbox', label: 'Microsoft Store', url: 'https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn' },
];

export const NEWS_LINKS: { title: string; url: string }[] = [
  { title: 'Rockstar Newswire', url: 'https://www.rockstargames.com/newswire' },
  { title: 'Official game page', url: 'https://www.rockstargames.com/VI' },
];

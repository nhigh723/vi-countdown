// Countdown VI — single source of truth for every fact the app shows.
// Every fact here was verified against a public official source on Nov 12-13,
// 2026. Sources are listed in the About screen and in store/LISTING.md.
// RULE: if a fact cannot be traced to a source below, it does not go in.

export const APP_NAME = 'Countdown VI';
export const APP_VERSION = '1.0.0';
export const BUNDLE_ID = 'com.nickhigh.vicountdown';

/**
 * THE countdown target. Local midnight on launch day, Thursday Nov 19, 2026.
 * PlayStation confirms the PS5 version unlocks at midnight local time; Rockstar
 * confirms the same Nov 19 console launch for Xbox Series X|S. Change this ONE
 * constant if Rockstar ever moves the date.
 */
export const LAUNCH_LOCAL = new Date(2026, 10, 19, 0, 0, 0);
export const LAUNCH_LABEL = 'Thursday, November 19, 2026';
export const LAUNCH_WEEKDAY = 'Thursday';

export const PRELOAD_START_LOCAL = new Date(2026, 10, 10, 0, 0, 0);
export const PHYSICAL_START_LOCAL = new Date(2026, 10, 12, 0, 0, 0);

export const DISCLAIMER =
  'Unofficial fan app. Not affiliated with, endorsed by, or connected to Rockstar Games or Take-Two Interactive.';

export type PlatformId = 'ps5' | 'xbox';

export interface PlatformInfo {
  id: PlatformId;
  label: string;
  short: string;
  /** Unlock wording — must stay honest about what each platform confirms. */
  unlockLine: string;
  unlockNote: string;
  preloadLine: string;
  storeUrl: string;
  storeLabel: string;
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'ps5',
    label: 'PlayStation 5',
    short: 'PS5',
    unlockLine: 'Thursday, Nov 19 at 12:00 AM — midnight local time.',
    unlockNote:
      'PlayStation confirms the PS5 version unlocks at midnight local time on Nov 19. PS5 Pro Enhanced. Not playable on PS4.',
    preloadLine: 'Pre-loading opened Nov 10 at midnight local time.',
    storeUrl: 'https://www.playstation.com/en-us/games/grand-theft-auto-vi/',
    storeLabel: 'PlayStation Store',
  },
  {
    id: 'xbox',
    label: 'Xbox Series X|S',
    short: 'Xbox',
    unlockLine: 'Thursday, Nov 19 — launch day.',
    unlockNote:
      'Rockstar confirms the same Nov 19 console launch for Xbox Series X|S. Unlock timing follows your Microsoft Store region — midnight local is standard for console launches; confirm the exact hour on the store page.',
    preloadLine: 'Digital pre-loading opened Nov 10 (12:00 AM GMT).',
    storeUrl: 'https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn',
    storeLabel: 'Microsoft Store',
  },
];

export interface TimelineItem {
  date: Date;
  dateLabel: string;
  title: string;
  detail: string;
}

export const TIMELINE: TimelineItem[] = [
  {
    date: PRELOAD_START_LOCAL,
    dateLabel: 'Nov 10',
    title: 'Digital pre-loading opens',
    detail:
      'Pre-ordered the digital edition? You can download the game now so it is ready the second it unlocks. Clear at least 212 GB of space first (PlayStation guidance).',
  },
  {
    date: PHYSICAL_START_LOCAL,
    dateLabel: 'Nov 12',
    title: 'Physical edition at retailers',
    detail:
      'The physical Standard Edition is a code in a box — there is no disc. Redeem the code to pre-load; the game still unlocks on Nov 19.',
  },
  {
    date: LAUNCH_LOCAL,
    dateLabel: 'Nov 19',
    title: 'Launch day',
    detail:
      'Grand Theft Auto VI unlocks at midnight local time on PlayStation 5, with the same Nov 19 console launch on Xbox Series X|S.',
  },
];

export interface NewsLink {
  title: string;
  source: string;
  detail: string;
  url: string;
}

export const NEWS_LINKS: NewsLink[] = [
  {
    title: 'Rockstar Newswire',
    source: 'rockstargames.com',
    detail: 'Official news, straight from Rockstar — pre-load info, trailers, and launch updates.',
    url: 'https://www.rockstargames.com/newswire',
  },
  {
    title: 'Grand Theft Auto VI — official page',
    source: 'rockstargames.com',
    detail: 'The official game page: launch date, platforms, and the pre-load hub.',
    url: 'https://www.rockstargames.com/VI',
  },
  {
    title: 'PlayStation Store — GTA VI',
    source: 'playstation.com',
    detail: 'Editions, pre-load guide, and 212 GB storage guidance for PS5.',
    url: 'https://www.playstation.com/en-us/games/grand-theft-auto-vi/',
  },
  {
    title: 'Microsoft Store — GTA VI',
    source: 'xbox.com',
    detail: 'Editions and pre-order bonus details for Xbox Series X|S.',
    url: 'https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn',
  },
];

export interface FactSource {
  label: string;
  detail: string;
}

export const SOURCES: FactSource[] = [
  { label: 'Launch date & platforms', detail: 'Rockstar Games (rockstargames.com/VI) and Take-Two press release, Jun 24, 2026 — Nov 19, 2026, PS5 and Xbox Series X|S.' },
  { label: 'Midnight local unlock (PS5)', detail: 'PlayStation official GTA VI page — pre-loading from Nov 10, 2026 at midnight local time; release Nov 19, 2026.' },
  { label: 'Pre-load dates', detail: 'Rockstar Newswire, Nov 3, 2026 ("Pre-Load Begins on November 10"); PlayStation page (Nov 10, midnight local); Rockstar support (physical from Nov 12).' },
  { label: '212 GB storage', detail: 'PlayStation official GTA VI page — "clear a minimum of 212GB of storage space on your PlayStation 5." Rockstar guidance says up to 212 GB depending on device.' },
  { label: 'Editions & prices', detail: 'Standard $79.99 / Ultimate $99.99 / Ultimate Edition Upgrade $20 — Take-Two press release (Jun 24, 2026) and Xbox Store listing, checked Nov 8–9, 2026.' },
  { label: 'Pre-order bonus', detail: 'Vintage Vice City Pack + 1 month of GTA+ for purchases before Nov 19, 2026, 11:59:59 PM — Xbox Store listing.' },
  { label: 'Physical = code in a box', detail: 'Rockstar support pages — physical Standard Edition contains a download code, no disc.' },
  { label: 'Single-player, Vice City, Leonida', detail: 'Rockstar / PlayStation / Xbox official pages — single-player story starring Jason and Lucia, set in Vice City, state of Leonida.' },
  { label: 'ESRB rating', detail: 'Mature 17+ — Xbox Store listing (checked Nov 9 and Nov 12, 2026). PlayStation notes ratings vary by country.' },
  { label: 'No PC version announced', detail: 'Rockstar has not announced a PC version or PC release date (as of Nov 12, 2026).' },
  { label: 'Album', detail: 'Grand Theft Auto VI: The Album arrives Nov 19, 2026 — Rockstar Newswire, Sep 17, 2026.' },
];

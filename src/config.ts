// Countdown VI — single source of truth for every fact the app shows.
// Every fact here was verified against a public official source on Nov 12-13,
// 2026. Sources are listed in the About screen and in store/LISTING.md.
// RULE: if a fact cannot be traced to a source below, it does not go in.

export const APP_NAME = 'Countdown VI';
export const APP_VERSION = '1.1.0';
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

export type ChecklistStatusKind = 'none' | 'preload' | 'physical' | 'bonus';

/**
 * The "Get ready for launch" checklist (v1.1). Seven real, actionable
 * pre-launch steps. Every fact in a title or "why" reuses a verified fact
 * already in this file — nothing new is invented. `status` marks the items
 * whose badge is live (computed from the clock in checklist.ts):
 * 'preload' = pre-load open state, 'physical' = physical-edition state,
 * 'bonus' = pre-order bonus deadline. 'none' = no badge.
 */
export interface ChecklistItem {
  id: string;
  title: string;
  why: string;
  status: ChecklistStatusKind;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'storage',
    title: 'Clear at least 212 GB of console space',
    why: 'The download will not start without room. PlayStation says clear a minimum of 212 GB on PS5.',
    status: 'none',
  },
  {
    id: 'preload',
    title: 'Pre-load the game',
    why: 'Download it now so it unlocks the second Nov 19 hits — no waiting on launch night.',
    status: 'preload',
  },
  {
    id: 'edition',
    title: 'Confirm your edition',
    why: 'Standard $79.99, Ultimate $99.99, or the $20 Ultimate upgrade later. Know what you own before launch night.',
    status: 'none',
  },
  {
    id: 'format',
    title: 'Decide digital vs physical',
    why: 'Physical is a code in a box — no disc — so it still needs a download and the same 212 GB.',
    status: 'physical',
  },
  {
    id: 'update',
    title: 'Update your console and controller',
    why: 'A system update on launch night eats your first hour of play. Do it now while you wait.',
    status: 'none',
  },
  {
    id: 'reminder',
    title: 'Set a launch-night alarm',
    why: 'The game unlocks at midnight local time. Set an alarm for 11:55 PM on Wednesday, Nov 18.',
    status: 'none',
  },
  {
    id: 'bonus',
    title: 'Grab the pre-order bonus before it ends',
    why: 'The Vintage Vice City Pack and 1 month of GTA+ end Nov 19 at 11:59:59 PM. Already bought it? Tick this off.',
    status: 'bonus',
  },
];

/**
 * The "What we know" guide (v1.1). Story, setting, and cast — official
 * sources only (Rockstar, Take-Two, PlayStation, Xbox), verified Nov 13,
 * 2026. `sourceLabel` must match a label in SOURCES (enforced by tests).
 * No rumors, no leaked-map claims, no invented details.
 */
export interface GuideItem {
  lead: string;
  body: string;
}

export interface GuideSection {
  heading: string;
  sourceLabel: string;
  items: GuideItem[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    heading: 'The story',
    sourceLabel: 'Protagonists',
    items: [
      {
        lead: 'Jason Duval.',
        body: 'One of the two playable leads. Grew up around grifters and crooks, tried to straighten out in the Army, and ended up in the Leonida Keys working for local drug runners.',
      },
      {
        lead: 'Lucia Caminos.',
        body: 'The other playable lead — the first woman to headline a mainline Grand Theft Auto as a full protagonist. Taught to fight by her father; fighting for her family landed her in the Leonida Penitentiary, and sheer luck got her out.',
      },
      {
        lead: 'The premise.',
        body: 'When an easy score goes wrong, the two find themselves caught in a criminal conspiracy stretching across the state of Leonida — and have only each other to rely on.',
      },
    ],
  },
  {
    heading: 'The setting',
    sourceLabel: 'Setting & regions',
    items: [
      {
        lead: 'The state of Leonida.',
        body: "Rockstar's fictional take on Florida. Vice City is its centerpiece — but it is one part of a whole state, not the whole game.",
      },
      {
        lead: 'Six named regions.',
        body: 'Rockstar has officially named six regions: Vice City, the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, and Mount Kalaga National Park.',
      },
      {
        lead: 'No official map — yet.',
        body: "Rockstar hasn't published a full map of Leonida. A free printable map (plus a cover-art poster) arrives on its official site on launch day, Nov 19.",
      },
    ],
  },
  {
    heading: 'The cast',
    sourceLabel: 'Supporting cast',
    items: [
      {
        lead: 'Eight official profiles.',
        body: 'Rockstar has published character profiles for Jason and Lucia plus six more: Cal Hampton, Boobie Ike, Dre\u2019Quan Priest, Real Dimez, Raul Bautista, and Brian Heder.',
      },
      {
        lead: 'No voice cast announced.',
        body: "Rockstar hasn't announced a voice cast for any character.",
      },
    ],
  },
];

export const NEWS_LINKS: NewsLink[] = [
  {
    title: 'Rockstar Newswire',
    source: 'rockstargames.com',
    detail: 'Official news, straight from Rockstar — pre-load info, trailers, and launch updates.',
    url: 'https://www.rockstargames.com/newswire',
  },
  {
    title: 'Official game page',
    source: 'rockstargames.com',
    detail: 'The official game page: launch date, platforms, and the pre-load hub.',
    url: 'https://www.rockstargames.com/VI',
  },
  {
    title: 'PlayStation Store',
    source: 'playstation.com',
    detail: 'Editions, pre-load guide, and 212 GB storage guidance for PS5.',
    url: 'https://www.playstation.com/en-us/games/grand-theft-auto-vi/',
  },
  {
    title: 'Microsoft Store',
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
  { label: 'Ultimate Edition contents', detail: 'Rockstar / Xbox News, Nov 10, 2026, and PlayStation Store — the Ultimate Edition Upgrade adds exclusive vehicles, weapons, apparel and more for Jason and Lucia’s story.' },
  { label: 'Game Pass', detail: 'No Game Pass announcement at launch — the Xbox Store sells the game as a paid pre-order ($79.99 / $99.99), and Take-Two’s CEO has publicly objected to day-one subscription launches. Checked Nov 13, 2026.' },
  { label: 'Pre-order bonus', detail: 'Vintage Vice City Pack + 1 month of GTA+ for purchases before Nov 19, 2026, 11:59:59 PM — Xbox Store listing.' },
  { label: 'Physical = code in a box', detail: 'Rockstar support pages — physical Standard Edition contains a download code, no disc.' },
  { label: 'Single-player, Vice City, Leonida', detail: 'Rockstar / PlayStation / Xbox official pages — single-player story starring Jason and Lucia, set in Vice City, state of Leonida.' },
  { label: 'Protagonists', detail: 'Rockstar official GTA VI page and character profiles (rockstargames.com/VI) — Jason Duval and Lucia Caminos, the two playable leads; an easy score goes wrong, a criminal conspiracy across Leonida.' },
  { label: 'Setting & regions', detail: 'Rockstar "Only in Leonida" pages — six named regions: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia, Mount Kalaga National Park. Free printable map on Rockstar\'s site from Nov 19 (announced Nov 3, 2026).' },
  { label: 'Supporting cast', detail: 'Rockstar official character profiles — Cal Hampton, Boobie Ike, Dre\u2019Quan Priest, Real Dimez, Raul Bautista, Brian Heder. No voice cast announced (as of Nov 13, 2026).' },
  { label: 'ESRB rating', detail: 'Mature 17+ — Xbox Store listing (checked Nov 9 and Nov 12, 2026). PlayStation notes ratings vary by country.' },
  { label: 'No PC version announced', detail: 'Rockstar has not announced a PC version or PC release date (as of Nov 12, 2026).' },
  { label: 'Album', detail: 'Grand Theft Auto VI: The Album arrives Nov 19, 2026 — Rockstar Newswire, Sep 17, 2026.' },
];

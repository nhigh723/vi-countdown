// Share-card + widget themes. Original palettes only (no third-party art).
// 'neon' is free; the rest are Pro.
import type { TrackerSummary } from './tracker';

export type ThemeId = 'neon' | 'sunset' | 'ocean' | 'mono' | 'gold';

export interface CardTheme {
  id: ThemeId;
  label: string;
  bg: [string, string, string];
  accent: [string, string, string];
  text: string;
  muted: string;
  sub: string;
}

export const THEMES: Record<ThemeId, CardTheme> = {
  neon: { id: 'neon', label: 'Neon', bg: ['#0b0b14', '#141428', '#1b1030'], accent: ['#ff2e88', '#7c5cff', '#00e5c7'], text: '#f2f2f8', muted: '#a7a7bd', sub: '#00e5c7' },
  sunset: { id: 'sunset', label: 'Sunset', bg: ['#2a0a2e', '#5a1640', '#ff7a3d'], accent: ['#ffd23d', '#ff7a3d', '#ff2e88'], text: '#fff6ee', muted: '#ffd9c2', sub: '#ffd23d' },
  ocean: { id: 'ocean', label: 'Ocean', bg: ['#021a2b', '#04344f', '#0a6b7a'], accent: ['#40e0ff', '#2fa8ff', '#00ffaa'], text: '#eefbff', muted: '#9cc7d6', sub: '#00ffaa' },
  mono: { id: 'mono', label: 'Mono', bg: ['#000000', '#0d0d0d', '#1a1a1a'], accent: ['#ffffff', '#9a9a9a', '#ffffff'], text: '#ffffff', muted: '#9a9a9a', sub: '#ffffff' },
  gold: { id: 'gold', label: 'Gold', bg: ['#0f0b02', '#1f1606', '#2e210a'], accent: ['#fff1b8', '#e8b64a', '#a8771c'], text: '#fff7e0', muted: '#cdb98a', sub: '#f3d27a' },
};

export const THEME_ORDER: ThemeId[] = ['neon', 'sunset', 'ocean', 'mono', 'gold'];
export const FREE_THEME: ThemeId = 'neon';
export const PREMIUM_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['sunset', 'ocean', 'mono', 'gold']);

/** The theme a user may actually use: Pro themes fall back to Neon. */
export function resolveTheme(id: unknown, pro: boolean): CardTheme {
  const known = typeof id === 'string' && (THEME_ORDER as string[]).includes(id) ? (id as ThemeId) : FREE_THEME;
  if (PREMIUM_THEMES.has(known) && !pro) return THEMES[FREE_THEME];
  return THEMES[known];
}

/** Words on the progress card. */
export function getProgressNumbers(summary: TrackerSummary, day: number): { big: string; sub: string; kicker: string } {
  const kicker = day > 0 ? `DAY ${day}` : 'MY 100% RUN';
  if (summary.tracked === 0) return { big: '0%', sub: 'Just getting started', kicker };
  const cat = (n: number) => `categor${n === 1 ? 'y' : 'ies'}`;
  const sub =
    summary.percent >= 100
      ? `All ${summary.tracked} ${cat(summary.tracked)} complete`
      : `${summary.done} of ${summary.total} done · ${summary.complete} of ${summary.tracked} ${cat(summary.tracked)} complete`;
  return { big: `${summary.percent}%`, sub, kicker };
}

/** Words on the countdown card. */
export function getCountdownNumbers(cd: { days: number; hours: number; minutes: number; seconds: number; launched: boolean }): { big: string; unit: string; sub: string } {
  if (cd.launched) return { big: 'OUT', unit: 'NOW', sub: 'Launch day has arrived' };
  if (cd.days > 0) {
    return { big: String(cd.days), unit: cd.days === 1 ? 'DAY' : 'DAYS', sub: `${cd.hours}h ${cd.minutes}m to go` };
  }
  return { big: String(cd.hours), unit: cd.hours === 1 ? 'HOUR' : 'HOURS', sub: `${cd.minutes}m ${cd.seconds}s to go` };
}

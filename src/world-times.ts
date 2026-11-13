// Countdown VI — "Who plays first" world unlock times. Pure timezone math,
// no hardcoded offsets, DST-safe: every city's midnight is computed with
// Intl.DateTimeFormat, so the offsets come from the platform's own tz data.
//
// The game unlocks at midnight local time everywhere, so each city's unlock
// is Nov 19, 2026, 00:00 in that city's timezone. This module converts each
// of those midnights to a UTC instant, sorts them (who gets the game first),
// and formats each one in the VIEWER's local timezone.

export interface WorldCity {
  city: string;
  timeZone: string;
}

export const WORLD_CITIES: WorldCity[] = [
  { city: 'Auckland', timeZone: 'Pacific/Auckland' },
  { city: 'Sydney', timeZone: 'Australia/Sydney' },
  { city: 'Tokyo', timeZone: 'Asia/Tokyo' },
  { city: 'London', timeZone: 'Europe/London' },
  { city: 'Paris', timeZone: 'Europe/Paris' },
  { city: 'New York', timeZone: 'America/New_York' },
  { city: 'Chicago', timeZone: 'America/Chicago' },
  { city: 'Los Angeles', timeZone: 'America/Los_Angeles' },
];

export interface WorldUnlockRow {
  city: string;
  timeZone: string;
  /** The UTC instant of this city's midnight, Nov 19, 2026. */
  utcMs: number;
  /** That instant formatted in the viewer's local timezone. */
  localLabel: string;
  /** True when the viewer's own timezone is this city's. */
  isUserCity: boolean;
}

/**
 * The offset (local minus UTC, in ms) of `timeZone` at the given UTC instant.
 * Implemented with Intl only — no hardcoded offsets, no tz database in the
 * app. Note: hour '24' (midnight with hourCycle h23) is normalized to 0.
 */
export function getTimeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  const hour = Number(parts.hour) % 24;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - utcMs;
}

/**
 * The UTC instant of midnight on (year, month, day) in `timeZone`.
 * Starts from UTC midnight and corrects by the zone's offset at that guess;
 * one correction is exact because the offset is constant across the day
 * boundary except on DST transition days — and Nov 19, 2026 is not one in
 * any listed city (verified by the unit tests' spot-checked conversions).
 */
export function zonedMidnightUtcMs(year: number, month: number, day: number, timeZone: string): number {
  const guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  return guess - getTimeZoneOffsetMs(guess, timeZone);
}

export function formatUserLocal(utcMs: number, userTimeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: userTimeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(utcMs));
}

/**
 * All eight cities' unlock moments, ordered by who gets the game first
 * (earliest UTC instant first), each labelled in the viewer's timezone.
 */
export function getWorldUnlockTimes(userTimeZone: string): WorldUnlockRow[] {
  return WORLD_CITIES.map((c) => {
    const utcMs = zonedMidnightUtcMs(2026, 11, 19, c.timeZone);
    return {
      city: c.city,
      timeZone: c.timeZone,
      utcMs,
      localLabel: formatUserLocal(utcMs, userTimeZone),
      isUserCity: userTimeZone === c.timeZone,
    };
  }).sort((a, b) => a.utcMs - b.utcMs);
}

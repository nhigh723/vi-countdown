import { GUIDE_SECTIONS, PLATFORMS, SOURCES, TIMELINE, getWorldUnlockTimes, safeWorldUnlockTimes, zonedMidnightUtcMs } from '../src/guide';
import { LAUNCH_LOCAL } from '../src/config';

describe('launch guide data', () => {
  test('every guide section cites a listed source', () => {
    const labels = new Set(SOURCES.map((s) => s.label));
    for (const g of GUIDE_SECTIONS) expect(labels.has(g.sourceLabel)).toBe(true);
  });
  test('both platforms with official store links', () => {
    expect(PLATFORMS.map((p) => p.id)).toEqual(['ps5', 'xbox']);
    for (const p of PLATFORMS) expect(p.storeUrl).toMatch(/^https:\/\/www\.(playstation|xbox)\.com\//);
  });
  test('timeline is chronological and ends on launch day', () => {
    const t = TIMELINE.map((x) => x.date.getTime());
    expect([...t].sort((a, b) => a - b)).toEqual(t);
    expect(TIMELINE[TIMELINE.length - 1].date.getTime()).toBe(LAUNCH_LOCAL.getTime());
  });
  test('no rumor / leak / datamine wording in shipped facts', () => {
    const all = JSON.stringify({ GUIDE_SECTIONS, TIMELINE, PLATFORMS });
    expect(all).not.toMatch(/leak|rumou?r|datamin/i);
  });
});

describe('who plays first', () => {
  test('known midnights in UTC', () => {
    expect(new Date(zonedMidnightUtcMs(2026, 11, 19, 'America/New_York')).toISOString()).toBe('2026-11-19T05:00:00.000Z');
    expect(new Date(zonedMidnightUtcMs(2026, 11, 19, 'Pacific/Auckland')).toISOString()).toBe('2026-11-18T11:00:00.000Z');
    expect(new Date(zonedMidnightUtcMs(2026, 11, 19, 'Europe/London')).toISOString()).toBe('2026-11-19T00:00:00.000Z');
  });
  test('sorted earliest first, Auckland first, LA last, marks user city', () => {
    const rows = getWorldUnlockTimes('America/Chicago');
    expect(rows[0].city).toBe('Auckland');
    expect(rows[rows.length - 1].city).toBe('Los Angeles');
    expect(rows.find((r) => r.isUserCity)?.city).toBe('Chicago');
  });
  test('safe wrapper never throws', () => {
    expect(safeWorldUnlockTimes('Not/AZone')).toEqual([]);
    expect(safeWorldUnlockTimes('UTC').length).toBe(8);
  });
});

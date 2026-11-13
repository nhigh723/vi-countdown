// Countdown VI — unit tests for the v1.1 features: launch-night reminder,
// world unlock times, and share-card numbers. Run: npm test (node --test
// with TS type-stripping, Node 24+).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REMINDER_MINUTES_BEFORE_LAUNCH,
  REMINDER_STORAGE_KEY,
  getReminderTime,
  isReminderTimePassed,
  loadReminderOn,
  saveReminderOn,
} from '../src/reminder.ts';
import { getWorldUnlockTimes, zonedMidnightUtcMs } from '../src/world-times.ts';
import { getShareNumbers } from '../src/share-card.ts';

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

describe('reminder — 5 minutes before launch', () => {
  it('fires at 11:55 PM on Wednesday, Nov 18, 2026, local time', () => {
    assert.equal(REMINDER_MINUTES_BEFORE_LAUNCH, 5);
    const t = getReminderTime();
    assert.equal(t.getFullYear(), 2026);
    assert.equal(t.getMonth(), 10);
    assert.equal(t.getDate(), 18);
    assert.equal(t.getDay(), 3); // Wednesday
    assert.equal(t.getHours(), 23);
    assert.equal(t.getMinutes(), 55);
    assert.equal(t.getSeconds(), 0);
  });

  it('isReminderTimePassed flips exactly at the reminder moment', () => {
    assert.equal(isReminderTimePassed(new Date(2026, 10, 18, 23, 54, 59)), false);
    assert.equal(isReminderTimePassed(new Date(2026, 10, 18, 23, 55, 0)), true);
    assert.equal(isReminderTimePassed(new Date(2026, 10, 19, 0, 0, 0)), true);
  });

  it('toggle state persists and anything but "on" reads as off', () => {
    const s = fakeStorage();
    assert.equal(loadReminderOn(s), false);
    saveReminderOn(s, true);
    assert.equal(s.getItem(REMINDER_STORAGE_KEY), 'on');
    assert.equal(loadReminderOn(s), true);
    saveReminderOn(s, false);
    assert.equal(loadReminderOn(s), false);
    assert.equal(loadReminderOn(fakeStorage({ [REMINDER_STORAGE_KEY]: 'yes' })), false);
    assert.equal(loadReminderOn(fakeStorage({ [REMINDER_STORAGE_KEY]: '' })), false);
  });
});

describe('world unlock times — midnight local everywhere', () => {
  it('orders cities by who gets the game first', () => {
    const rows = getWorldUnlockTimes('UTC');
    assert.deepEqual(
      rows.map((r) => r.city),
      ['Auckland', 'Sydney', 'Tokyo', 'Paris', 'London', 'New York', 'Chicago', 'Los Angeles'],
    );
    for (let i = 1; i < rows.length; i++) {
      assert.ok(rows[i].utcMs > rows[i - 1].utcMs, `${rows[i].city} should unlock after ${rows[i - 1].city}`);
    }
  });

  it('spot-checks each city midnight against its known UTC instant', () => {
    const expected = {
      'Pacific/Auckland': Date.UTC(2026, 10, 18, 11, 0, 0), // NZDT UTC+13
      'Australia/Sydney': Date.UTC(2026, 10, 18, 13, 0, 0), // AEDT UTC+11
      'Asia/Tokyo': Date.UTC(2026, 10, 18, 15, 0, 0), // JST UTC+9
      'Europe/Paris': Date.UTC(2026, 10, 18, 23, 0, 0), // CET UTC+1
      'Europe/London': Date.UTC(2026, 10, 19, 0, 0, 0), // GMT UTC+0
      'America/New_York': Date.UTC(2026, 10, 19, 5, 0, 0), // EST UTC-5
      'America/Chicago': Date.UTC(2026, 10, 19, 6, 0, 0), // CST UTC-6
      'America/Los_Angeles': Date.UTC(2026, 10, 19, 8, 0, 0), // PST UTC-8
    };
    for (const [tz, utc] of Object.entries(expected)) {
      assert.equal(zonedMidnightUtcMs(2026, 11, 19, tz), utc, tz);
    }
  });

  it('labels each unlock in the viewer timezone and flags the viewer city', () => {
    const rows = getWorldUnlockTimes('UTC');
    const auckland = rows.find((r) => r.city === 'Auckland');
    assert.equal(auckland.localLabel, 'Wed, Nov 18, 11:00 AM');
    const la = rows.find((r) => r.city === 'Los Angeles');
    assert.equal(la.localLabel, 'Thu, Nov 19, 8:00 AM');
    assert.ok(rows.every((r) => r.isUserCity === false));

    const nyRows = getWorldUnlockTimes('America/New_York');
    const ny = nyRows.find((r) => r.city === 'New York');
    assert.equal(ny.isUserCity, true);
    assert.equal(ny.localLabel, 'Thu, Nov 19, 12:00 AM');
    assert.equal(nyRows.filter((r) => r.isUserCity).length, 1);
    const aucklandNy = nyRows.find((r) => r.city === 'Auckland');
    assert.equal(aucklandNy.localLabel, 'Wed, Nov 18, 6:00 AM');
  });
});

describe('share-card numbers', () => {
  const cd = (days, hours, minutes, seconds, launched = false) => ({
    days,
    hours,
    minutes,
    seconds,
    remainingMs: launched ? -1 : 1,
    launched,
  });

  it('shows days big with an hours/minutes sub-line', () => {
    assert.deepEqual(getShareNumbers(cd(5, 18, 52, 31)), {
      big: '5',
      bigUnit: 'DAYS',
      sub: '18 hours · 52 minutes to go',
    });
  });

  it('singularizes day/hour/minute', () => {
    assert.deepEqual(getShareNumbers(cd(1, 1, 1, 1)), {
      big: '1',
      bigUnit: 'DAY',
      sub: '1 hour · 1 minute to go',
    });
  });

  it('under a day, shows hours big with a minutes/seconds sub-line', () => {
    assert.deepEqual(getShareNumbers(cd(0, 3, 7, 9)), {
      big: '3',
      bigUnit: 'HOURS',
      sub: '7 minutes · 9 seconds to go',
    });
  });

  it('after launch, the card says the game is out', () => {
    assert.deepEqual(getShareNumbers(cd(0, 0, 0, 0, true)), {
      big: '0',
      bigUnit: 'DAYS',
      sub: 'The game is out now',
    });
  });
});

// Countdown VI — unit tests for the pure logic + config sanity.
// Run: npm test (node --test with TS type-stripping, Node 24+).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCountdown, getMilestoneStatus, pad2 } from '../src/countdown.ts';
import {
  LAUNCH_LOCAL,
  NEWS_LINKS,
  PHYSICAL_START_LOCAL,
  PLATFORMS,
  PRELOAD_START_LOCAL,
  SOURCES,
  TIMELINE,
} from '../src/config.ts';
import { ADS_ENABLED, REMOVE_ADS_PRODUCT_ID, hasRemoveAds, shouldShowAds } from '../src/monetization.ts';

const LAUNCH = new Date(2026, 10, 19, 0, 0, 0);

describe('getCountdown', () => {
  it('counts 7 days out exactly', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 12, 0, 0, 0));
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds, launched: cd.launched },
      { days: 7, hours: 0, minutes: 0, seconds: 0, launched: false },
    );
  });

  it('counts a mixed remainder', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 16, 21, 29, 45));
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds, launched: cd.launched },
      { days: 2, hours: 2, minutes: 30, seconds: 15, launched: false },
    );
  });

  it('one second before launch is not launched', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 18, 23, 59, 59));
    assert.equal(cd.launched, false);
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds },
      { days: 0, hours: 0, minutes: 0, seconds: 1 },
    );
  });

  it('exactly at launch is launched with all zeros', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 19, 0, 0, 0));
    assert.equal(cd.launched, true);
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds },
      { days: 0, hours: 0, minutes: 0, seconds: 0 },
    );
  });

  it('after launch stays launched with all zeros', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 20, 12, 0, 0));
    assert.equal(cd.launched, true);
    assert.equal(cd.days, 0);
    assert.equal(cd.hours, 0);
    assert.equal(cd.minutes, 0);
    assert.equal(cd.seconds, 0);
    assert.ok(cd.remainingMs < 0);
  });

  it('59 seconds rolls up correctly', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 18, 23, 58, 1));
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds },
      { days: 0, hours: 0, minutes: 1, seconds: 59 },
    );
  });

  it('23:59:59 is 23 hours, not a day', () => {
    const cd = getCountdown(LAUNCH, new Date(2026, 10, 18, 0, 0, 1));
    assert.deepEqual(
      { days: cd.days, hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds },
      { days: 0, hours: 23, minutes: 59, seconds: 59 },
    );
  });
});

describe('pad2', () => {
  it('pads single digits and leaves double digits alone', () => {
    assert.equal(pad2(0), '00');
    assert.equal(pad2(5), '05');
    assert.equal(pad2(9), '09');
    assert.equal(pad2(10), '10');
    assert.equal(pad2(59), '59');
  });
});

describe('getMilestoneStatus', () => {
  it('past day is done', () => {
    assert.equal(getMilestoneStatus(new Date(2026, 10, 10), new Date(2026, 10, 12, 9, 0, 0)).status, 'done');
  });
  it('same day is today regardless of the hour', () => {
    assert.equal(getMilestoneStatus(new Date(2026, 10, 12), new Date(2026, 10, 12, 23, 59, 0)).status, 'today');
    assert.equal(getMilestoneStatus(new Date(2026, 10, 12), new Date(2026, 10, 12, 0, 0, 1)).status, 'today');
  });
  it('future day is upcoming', () => {
    assert.equal(getMilestoneStatus(new Date(2026, 10, 19), new Date(2026, 10, 12)).status, 'upcoming');
  });
  it('the day after a milestone is done', () => {
    assert.equal(getMilestoneStatus(new Date(2026, 10, 12), new Date(2026, 10, 13, 0, 0, 0)).status, 'done');
  });
});

describe('config — the launch facts', () => {
  it('launch is local midnight Thursday Nov 19, 2026', () => {
    assert.equal(LAUNCH_LOCAL.getFullYear(), 2026);
    assert.equal(LAUNCH_LOCAL.getMonth(), 10);
    assert.equal(LAUNCH_LOCAL.getDate(), 19);
    assert.equal(LAUNCH_LOCAL.getHours(), 0);
    assert.equal(LAUNCH_LOCAL.getDay(), 4); // Thursday
  });
  it('pre-load starts Nov 10 and physical starts Nov 12, both before launch', () => {
    assert.ok(PRELOAD_START_LOCAL.getTime() < LAUNCH_LOCAL.getTime());
    assert.ok(PHYSICAL_START_LOCAL.getTime() < LAUNCH_LOCAL.getTime());
    assert.equal(PRELOAD_START_LOCAL.getDate(), 10);
    assert.equal(PHYSICAL_START_LOCAL.getDate(), 12);
  });
  it('timeline is in date order and ends at launch', () => {
    assert.equal(TIMELINE.length, 3);
    assert.ok(TIMELINE[0].date.getTime() < TIMELINE[1].date.getTime());
    assert.ok(TIMELINE[1].date.getTime() < TIMELINE[2].date.getTime());
    assert.equal(TIMELINE[2].date.getTime(), LAUNCH_LOCAL.getTime());
  });
  it('both platforms are PS5 and Xbox Series X|S — no PC', () => {
    assert.deepEqual(PLATFORMS.map((p) => p.id), ['ps5', 'xbox']);
    assert.ok(PLATFORMS.every((p) => p.storeUrl.startsWith('https://')));
  });
  it('every news link is an https link to an official domain', () => {
    const allowed = ['rockstargames.com', 'playstation.com', 'xbox.com'];
    assert.ok(NEWS_LINKS.length >= 4);
    for (const n of NEWS_LINKS) {
      const host = new URL(n.url).hostname;
      assert.ok(allowed.some((d) => host === d || host.endsWith(`.${d}`)), n.url);
    }
  });
  it('every fact has a source entry', () => {
    assert.ok(SOURCES.length >= 10);
    assert.ok(SOURCES.every((s) => s.label.length > 0 && s.detail.length > 0));
  });
});

describe('monetization — v1 is free, no ads', () => {
  it('ads are off and no purchase exists in v1', () => {
    assert.equal(ADS_ENABLED, false);
    assert.equal(hasRemoveAds(), false);
    assert.equal(shouldShowAds(), false);
  });
  it('the v2 remove-ads product ID is reserved and well-formed', () => {
    assert.equal(REMOVE_ADS_PRODUCT_ID, 'com.nickhigh.vicountdown.removeads');
  });
});

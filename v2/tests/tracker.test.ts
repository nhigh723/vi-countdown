import { describe, it } from '@jest/globals';
// Countdown VI — unit tests for the v1.2 100% tracker and share-card themes.

import { strict as assert } from 'assert';
import {
  FREE_CUSTOM_LIMIT,
  MAX_NAME_LENGTH,
  MAX_TOTAL,
  PRESET_CATEGORIES,
  TRACKER_STORAGE_KEY,
  addCustom,
  bump,
  canAddCustom,
  cleanName,
  dayNumber,
  defaultTracker,
  loadTracker,
  removeCustom,
  saveTracker,
  setTotal,
  summarize,
} from '../src/tracker';
import { PREMIUM_THEMES, THEMES, THEME_ORDER, getProgressNumbers, resolveTheme } from '../src/themes';

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return { getItem: (k: string) => (map.has(k) ? map.get(k) : null), setItem: (k: string, v: string) => map.set(k, v), map };
}

describe('tracker content rule — generic, user-entered only', () => {
  it('ships six generic categories with no goals pre-filled', () => {
    const t = defaultTracker();
    assert.equal(t.length, 6);
    assert.ok(t.every((c) => c.total === 0 && c.done === 0 && !c.custom));
  });
  it('preset names contain no game-specific or trademarked terms', () => {
    const banned = /gta|grand theft|rockstar|vice city|leonida|jason|lucia|\d/i;
    for (const p of PRESET_CATEGORIES) assert.doesNotMatch(p.name, banned, p.name);
  });
});

describe('goals and counts', () => {
  it('setTotal clamps to [0, MAX_TOTAL] and pulls done down', () => {
    let t = setTotal(defaultTracker(), 'story', 10);
    t = bump(t, 'story', 8);
    t = setTotal(t, 'story', 5);
    const s = t.find((c) => c.id === 'story');
    assert.deepEqual([s.done, s.total], [5, 5]);
    assert.equal(setTotal(t, 'story', 999999).find((c) => c.id === 'story').total, MAX_TOTAL);
    assert.equal(setTotal(t, 'story', -3).find((c) => c.id === 'story').total, 0);
    assert.equal(setTotal(t, 'story', 'abc').find((c) => c.id === 'story').total, 0);
  });
  it('bump never goes below 0 or above the goal', () => {
    let t = setTotal(defaultTracker(), 'side', 2);
    t = bump(bump(bump(t, 'side', 1), 'side', 1), 'side', 1);
    assert.equal(t.find((c) => c.id === 'side').done, 2);
    t = bump(bump(bump(t, 'side', -1), 'side', -1), 'side', -1);
    assert.equal(t.find((c) => c.id === 'side').done, 0);
  });
  it('bump with no goal does nothing', () => {
    assert.equal(bump(defaultTracker(), 'vehicles', 1).find((c) => c.id === 'vehicles').done, 0);
  });
});

describe('custom categories — free limit vs Launch Pass', () => {
  it(`free users can add ${FREE_CUSTOM_LIMIT}, then need the pass`, () => {
    const a = addCustom(defaultTracker(), 'Races won', 20, false, 'a');
    assert.equal(a.ok, true);
    assert.equal(canAddCustom(a.cats, false), false);
    const b = addCustom(a.cats, 'Photos taken', 10, false, 'b');
    assert.deepEqual(b, { ok: false, reason: 'needs-pass' });
  });
  it('pass holders can add many', () => {
    let t = defaultTracker();
    for (let i = 0; i < 10; i++) {
      const r = addCustom(t, `Thing ${i}`, 5, true, `s${i}`);
      assert.equal(r.ok, true);
      t = r.cats;
    }
    assert.equal(t.filter((c) => c.custom).length, 10);
  });
  it('rejects empty and duplicate names (case-insensitive, presets included)', () => {
    assert.deepEqual(addCustom(defaultTracker(), '   ', 5, true), { ok: false, reason: 'empty-name' });
    assert.deepEqual(addCustom(defaultTracker(), 'collectibles', 5, true), { ok: false, reason: 'duplicate' });
  });
  it('cleans names: trims, collapses spaces, caps length', () => {
    assert.equal(cleanName('  a   b  '), 'a b');
    assert.equal(cleanName('x'.repeat(100)).length, MAX_NAME_LENGTH);
    assert.equal(cleanName(5), '');
  });
  it('removes only custom categories', () => {
    const a = addCustom(defaultTracker(), 'Mine', 3, false, 'm');
    const id = a.cats.find((c) => c.custom).id;
    assert.equal(removeCustom(a.cats, id).length, 6);
    assert.equal(removeCustom(a.cats, 'story').length, 7);
  });
  it('generates unique ids even with the same seed', () => {
    const a = addCustom(defaultTracker(), 'One', 1, true, 'x');
    const b = addCustom(a.cats, 'Two', 1, true, 'x');
    const ids = b.cats.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('persistence', () => {
  it('round-trips presets and customs', () => {
    const s = fakeStorage();
    let t = bump(setTotal(defaultTracker(), 'story', 40), 'story', 7);
    t = addCustom(t, 'Races won', 12, false, 'r').cats;
    saveTracker(s, t);
    const back = loadTracker(s);
    assert.deepEqual(back, t);
  });
  it('falls back to defaults on corrupt or hostile data', () => {
    assert.deepEqual(loadTracker(fakeStorage({ [TRACKER_STORAGE_KEY]: '{not json' })), defaultTracker());
    assert.deepEqual(loadTracker(fakeStorage({ [TRACKER_STORAGE_KEY]: '"x"' })), defaultTracker());
    const hostile = JSON.stringify([
      { id: 'story', done: 50, total: 10 },
      { id: 'c-1', name: '', total: 3 },
      { id: 'evil', name: 'no prefix', total: 3 },
      { id: 'c-2', name: '<b>ok</b>', total: -4, done: 9 },
    ]);
    const t = loadTracker(fakeStorage({ [TRACKER_STORAGE_KEY]: hostile }));
    assert.deepEqual(t.find((c) => c.id === 'story'), { id: 'story', name: 'Story missions', done: 10, total: 10, custom: false });
    assert.equal(t.length, 7);
    assert.deepEqual(t[6], { id: 'c-2', name: '<b>ok</b>', done: 0, total: 0, custom: true });
  });
  it('never throws when storage is unavailable', () => {
    const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
    assert.deepEqual(loadTracker(broken), defaultTracker());
    assert.doesNotThrow(() => saveTracker(broken, defaultTracker()));
  });
});

describe('summary', () => {
  it('is 0% with no goals', () => {
    assert.deepEqual(summarize(defaultTracker()), { done: 0, total: 0, percent: 0, tracked: 0, complete: 0 });
  });
  it('counts only categories with goals and floors the percent', () => {
    let t = setTotal(setTotal(defaultTracker(), 'story', 3), 'side', 0);
    t = bump(bump(t, 'story', 1), 'story', 1);
    assert.deepEqual(summarize(t), { done: 2, total: 3, percent: 66, tracked: 1, complete: 0 });
    let big = setTotal(defaultTracker(), 'collectibles', 1000);
    big = bump(big, 'collectibles', 999);
    assert.equal(summarize(big).percent, 99, '99.9% must never show as 100%');
  });
  it('reports 100% and complete categories', () => {
    let t = setTotal(setTotal(defaultTracker(), 'story', 2), 'vehicles', 1);
    t = bump(bump(bump(t, 'story', 1), 'story', 1), 'vehicles', 1);
    assert.deepEqual(summarize(t), { done: 3, total: 3, percent: 100, tracked: 2, complete: 2 });
  });
});

describe('dayNumber', () => {
  const launch = new Date(2026, 10, 19, 0, 0, 0);
  it('is 0 before launch, 1 on launch day', () => {
    assert.equal(dayNumber(launch, new Date(2026, 10, 18, 23, 59)), 0);
    assert.equal(dayNumber(launch, new Date(2026, 10, 19, 0, 0)), 1);
    assert.equal(dayNumber(launch, new Date(2026, 10, 19, 23, 59)), 1);
  });
  it('counts calendar days', () => {
    assert.equal(dayNumber(launch, new Date(2026, 10, 25, 12)), 7);
    assert.equal(dayNumber(launch, new Date(2027, 0, 1, 9)), 44);
  });
});

describe('share-card themes', () => {
  it('neon is free; four premium themes', () => {
    assert.equal(THEME_ORDER.length, 5);
    assert.equal(PREMIUM_THEMES.size, 4);
    assert.equal(PREMIUM_THEMES.has('neon'), false);
    for (const id of THEME_ORDER) assert.equal(THEMES[id].id, id);
  });
  it('premium themes fall back to neon without the pass', () => {
    assert.equal(resolveTheme('gold', false).id, 'neon');
    assert.equal(resolveTheme('gold', true).id, 'gold');
    assert.equal(resolveTheme('nope', true).id, 'neon');
    assert.equal(resolveTheme(undefined, true).id, 'neon');
  });
  it('progress-card numbers', () => {
    assert.deepEqual(getProgressNumbers({ done: 0, total: 0, percent: 0, tracked: 0, complete: 0 }, 0),
      { big: '0%', sub: 'Just getting started', kicker: 'MY 100% RUN' });
    const p = getProgressNumbers({ done: 2, total: 3, percent: 66, tracked: 1, complete: 0 }, 3);
    assert.equal(p.big, '66%');
    assert.equal(p.kicker, 'DAY 3');
    assert.equal(p.sub, '2 of 3 done · 0 of 1 category complete');
    assert.equal(getProgressNumbers({ done: 3, total: 3, percent: 100, tracked: 2, complete: 2 }, 9).sub, 'All 2 categories complete');
  });
});

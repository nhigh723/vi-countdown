// Countdown VI — unit tests for the v1.1 get-ready checklist + "What we know"
// guide. Run: npm test (node --test with TS type-stripping, Node 24+).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHECKLIST_ITEMS, GUIDE_SECTIONS, SOURCES, APP_VERSION } from '../src/config.ts';
import {
  CHECKLIST_STORAGE_KEY,
  countChecked,
  getItemStatus,
  loadChecked,
  saveChecked,
  toggleChecked,
} from '../src/checklist.ts';

/** In-memory stand-in for localStorage. */
function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    _map: map,
  };
}

const itemById = (id) => CHECKLIST_ITEMS.find((i) => i.id === id);

describe('checklist persistence', () => {
  it('starts empty when nothing is stored', () => {
    assert.deepEqual([...loadChecked(fakeStorage())], []);
  });

  it('loads stored ids and ignores unknown ids and non-strings', () => {
    const s = fakeStorage({
      [CHECKLIST_STORAGE_KEY]: JSON.stringify(['storage', 'nope', 42, 'preload', null]),
    });
    assert.deepEqual([...loadChecked(s)].sort(), ['preload', 'storage']);
  });

  it('corrupt JSON and non-array values start empty instead of crashing', () => {
    assert.deepEqual([...loadChecked(fakeStorage({ [CHECKLIST_STORAGE_KEY]: '{bad json' }))], []);
    assert.deepEqual([...loadChecked(fakeStorage({ [CHECKLIST_STORAGE_KEY]: '"storage"' }))], []);
    assert.deepEqual([...loadChecked(fakeStorage({ [CHECKLIST_STORAGE_KEY]: 'null' }))], []);
  });

  it('saveChecked writes a sorted JSON array under the checklist key', () => {
    const s = fakeStorage();
    saveChecked(s, new Set(['preload', 'storage']));
    assert.equal(s.getItem(CHECKLIST_STORAGE_KEY), JSON.stringify(['preload', 'storage']));
  });

  it('a save/load round trip preserves the checked set', () => {
    const s = fakeStorage();
    saveChecked(s, new Set(['bonus', 'storage', 'reminder']));
    assert.deepEqual([...loadChecked(s)].sort(), ['bonus', 'reminder', 'storage']);
  });
});

describe('checklist toggling and counting', () => {
  it('toggleChecked adds then removes an id without mutating the input', () => {
    const before = new Set(['storage']);
    const added = toggleChecked(before, 'preload');
    assert.deepEqual([...added].sort(), ['preload', 'storage']);
    assert.deepEqual([...before], ['storage']);
    assert.deepEqual([...toggleChecked(added, 'storage')], ['preload']);
  });

  it('countChecked counts only known checklist ids', () => {
    assert.equal(countChecked(new Set()), 0);
    assert.equal(countChecked(new Set(['storage', 'preload', 'nope'])), 2);
    assert.equal(countChecked(new Set(CHECKLIST_ITEMS.map((i) => i.id))), CHECKLIST_ITEMS.length);
  });
});

describe('checklist live status badges', () => {
  it('pre-load badge is "Opens Nov 10" before Nov 10 and "Open now" after', () => {
    assert.deepEqual(getItemStatus(itemById('preload'), new Date(2026, 10, 9, 23, 59, 59)), {
      label: 'Opens Nov 10',
      live: false,
    });
    assert.deepEqual(getItemStatus(itemById('preload'), new Date(2026, 10, 10, 0, 0, 0)), {
      label: 'Open now',
      live: true,
    });
    assert.deepEqual(getItemStatus(itemById('preload'), new Date(2026, 10, 18, 12, 0, 0)), {
      label: 'Open now',
      live: true,
    });
  });

  it('physical badge is "From Nov 12" before Nov 12 and "At retailers now" after', () => {
    assert.deepEqual(getItemStatus(itemById('format'), new Date(2026, 10, 11, 23, 59, 59)), {
      label: 'From Nov 12',
      live: false,
    });
    assert.deepEqual(getItemStatus(itemById('format'), new Date(2026, 10, 12, 0, 0, 0)), {
      label: 'At retailers now',
      live: true,
    });
  });

  it('bonus badge is the fixed deadline and plain items have no badge', () => {
    assert.deepEqual(getItemStatus(itemById('bonus'), new Date(2026, 10, 13)), {
      label: 'Ends Nov 19',
      live: false,
    });
    assert.equal(getItemStatus(itemById('storage'), new Date(2026, 10, 13)), null);
    assert.equal(getItemStatus(itemById('update'), new Date(2026, 10, 13)), null);
    assert.equal(getItemStatus(itemById('reminder'), new Date(2026, 10, 13)), null);
    assert.equal(getItemStatus(itemById('edition'), new Date(2026, 10, 13)), null);
  });
});

describe('checklist config sanity', () => {
  it('has exactly 7 items with unique ids, a title, and a one-line why', () => {
    assert.equal(CHECKLIST_ITEMS.length, 7);
    const ids = CHECKLIST_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const item of CHECKLIST_ITEMS) {
      assert.ok(item.title.length > 0, item.id);
      assert.ok(item.why.length > 0, item.id);
      assert.ok(['none', 'preload', 'physical', 'bonus'].includes(item.status), item.id);
    }
  });

  it('the storage and edition items reuse the verified 212 GB / $79.99 facts', () => {
    assert.match(itemById('storage').title, /212 GB/);
    assert.match(itemById('edition').why, /\$79\.99/);
    assert.match(itemById('edition').why, /\$99\.99/);
  });
});

describe('guide config sanity', () => {
  it('every guide section cites a source label that exists in SOURCES', () => {
    assert.ok(GUIDE_SECTIONS.length >= 3);
    const labels = new Set(SOURCES.map((s) => s.label));
    for (const section of GUIDE_SECTIONS) {
      assert.ok(section.heading.length > 0);
      assert.ok(labels.has(section.sourceLabel), `missing source: ${section.sourceLabel}`);
      assert.ok(section.items.length > 0, section.heading);
      for (const item of section.items) {
        assert.ok(item.lead.length > 0 && item.body.length > 0, section.heading);
      }
    }
  });

  it('the guide names both protagonists with full names and all six regions', () => {
    const text = GUIDE_SECTIONS.flatMap((s) => s.items.map((i) => `${i.lead} ${i.body}`)).join(' ');
    for (const needle of ['Jason Duval', 'Lucia Caminos']) {
      assert.ok(text.includes(needle), `guide missing: ${needle}`);
    }
    for (const region of ['Vice City', 'Leonida Keys', 'Grassrivers', 'Port Gellhorn', 'Ambrosia', 'Mount Kalaga']) {
      assert.ok(text.includes(region), `guide missing region: ${region}`);
    }
  });

  it('the guide contains no rumor or leak language', () => {
    const text = GUIDE_SECTIONS.flatMap((s) => s.items.map((i) => `${i.lead} ${i.body}`)).join(' ');
    assert.ok(!/rumor|rumour|leak|datamine/i.test(text), 'guide must not repeat rumors or leaks');
  });
});

describe('version — v1.1.0', () => {
  it('APP_VERSION is 1.1.0', () => {
    assert.equal(APP_VERSION, '1.1.0');
  });
});

// Countdown VI — the 100% tracker (v2). Pure logic, no DOM, unit-tested.
//
// LEGAL / CONTENT RULE: this tracker ships NO game data. No mission names,
// no collectible lists, no counts, no maps, nothing copied from guides or
// datamined. The six built-in categories are generic words any open-world
// game uses, every goal starts at 0, and the player types in their own
// totals and names. That keeps the app clear of someone else's content
// (App Review 5.2.1) and means nothing here can be "wrong" on launch day.
//
// Free: the six built-in categories (+ up to FREE_CUSTOM_LIMIT custom one).
// Pro: unlimited custom categories.

/** Minimal sync key-value surface (an in-memory cache backed by AsyncStorage). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const TRACKER_STORAGE_KEY = 'cvi.tracker';
/** Custom categories a free user can add before the Launch Pass prompt. */
export const FREE_CUSTOM_LIMIT = 1;
export const MAX_NAME_LENGTH = 40;
export const MAX_TOTAL = 9999;
export const MAX_CUSTOM = 50;

export interface TrackerCategory {
  id: string;
  name: string;
  done: number;
  total: number;
  custom: boolean;
}

/** Generic, game-agnostic starter categories. Goals start at 0 — the
 *  player sets them. Do NOT add game-specific names or counts here. */
export const PRESET_CATEGORIES: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'story', name: 'Story missions' },
  { id: 'side', name: 'Side activities' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'properties', name: 'Properties & businesses' },
  { id: 'outfits', name: 'Outfits & customization' },
];

function clampInt(v: unknown, min: number, max: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Trims, collapses whitespace and caps length. Empty -> ''. */
export function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export function defaultTracker(): TrackerCategory[] {
  return PRESET_CATEGORIES.map((p) => ({ id: p.id, name: p.name, done: 0, total: 0, custom: false }));
}

/** Loads the tracker. Presets are always present (in order); saved counts
 *  are merged in; corrupt data falls back to defaults rather than crashing. */
export function loadTracker(storage: StorageLike): TrackerCategory[] {
  const base = defaultTracker();
  let parsed: unknown = null;
  try {
    const raw = storage.getItem(TRACKER_STORAGE_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    return base;
  }
  if (!Array.isArray(parsed)) return base;
  const byId = new Map<string, Record<string, unknown>>();
  for (const v of parsed) {
    if (v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'string') {
      byId.set((v as { id: string }).id, v as Record<string, unknown>);
    }
  }
  const out = base.map((c) => {
    const s = byId.get(c.id);
    if (!s) return c;
    const total = clampInt(s.total, 0, MAX_TOTAL);
    return { ...c, total, done: clampInt(s.done, 0, total) };
  });
  const presetIds = new Set(base.map((c) => c.id));
  for (const v of parsed) {
    if (out.filter((c) => c.custom).length >= MAX_CUSTOM) break;
    if (!v || typeof v !== 'object') continue;
    const s = v as Record<string, unknown>;
    if (typeof s.id !== 'string' || presetIds.has(s.id) || !s.id.startsWith('c-')) continue;
    if (out.some((c) => c.id === s.id)) continue;
    const name = cleanName(s.name);
    if (!name) continue;
    const total = clampInt(s.total, 0, MAX_TOTAL);
    out.push({ id: s.id, name, total, done: clampInt(s.done, 0, total), custom: true });
  }
  return out;
}

export function saveTracker(storage: StorageLike, cats: ReadonlyArray<TrackerCategory>): void {
  try {
    storage.setItem(
      TRACKER_STORAGE_KEY,
      JSON.stringify(cats.map((c) => ({ id: c.id, name: c.name, done: c.done, total: c.total, custom: c.custom }))),
    );
  } catch {
    /* storage unavailable — progress just won't persist */
  }
}

/** Sets a category's goal; `done` is clamped down if it now exceeds it. */
export function setTotal(cats: ReadonlyArray<TrackerCategory>, id: string, total: unknown): TrackerCategory[] {
  return cats.map((c) => {
    if (c.id !== id) return c;
    const t = clampInt(total, 0, MAX_TOTAL);
    return { ...c, total: t, done: Math.min(c.done, t) };
  });
}

/** Adds `delta` to a category's done count, clamped to [0, total]. */
export function bump(cats: ReadonlyArray<TrackerCategory>, id: string, delta: number): TrackerCategory[] {
  return cats.map((c) => (c.id === id ? { ...c, done: clampInt(c.done + delta, 0, c.total) } : c));
}

export function customCount(cats: ReadonlyArray<TrackerCategory>): number {
  return cats.filter((c) => c.custom).length;
}

/** Whether another custom category may be added with/without the pass. */
export function canAddCustom(cats: ReadonlyArray<TrackerCategory>, passOwned: boolean): boolean {
  const n = customCount(cats);
  if (n >= MAX_CUSTOM) return false;
  return passOwned || n < FREE_CUSTOM_LIMIT;
}

export type AddResult =
  | { ok: true; cats: TrackerCategory[] }
  | { ok: false; reason: 'empty-name' | 'duplicate' | 'needs-pass' | 'limit' };

/** Adds a custom category. `idSeed` makes ids deterministic in tests. */
export function addCustom(
  cats: ReadonlyArray<TrackerCategory>,
  rawName: unknown,
  rawTotal: unknown,
  passOwned: boolean,
  idSeed: string = Date.now().toString(36),
): AddResult {
  const name = cleanName(rawName);
  if (!name) return { ok: false, reason: 'empty-name' };
  if (cats.some((c) => c.name.toLowerCase() === name.toLowerCase())) return { ok: false, reason: 'duplicate' };
  if (customCount(cats) >= MAX_CUSTOM) return { ok: false, reason: 'limit' };
  if (!canAddCustom(cats, passOwned)) return { ok: false, reason: 'needs-pass' };
  let id = `c-${idSeed}`;
  let i = 1;
  while (cats.some((c) => c.id === id)) id = `c-${idSeed}-${i++}`;
  return { ok: true, cats: [...cats, { id, name, done: 0, total: clampInt(rawTotal, 0, MAX_TOTAL), custom: true }] };
}

/** Removes a custom category (built-ins can't be removed, only zeroed). */
export function removeCustom(cats: ReadonlyArray<TrackerCategory>, id: string): TrackerCategory[] {
  return cats.filter((c) => !(c.custom && c.id === id));
}

export interface TrackerSummary {
  done: number;
  total: number;
  /** 0–100, whole number. 0 when no goals are set. */
  percent: number;
  /** Categories with a goal set. */
  tracked: number;
  /** Categories with a goal set that are complete. */
  complete: number;
}

/** Overall completion across every category that has a goal. */
export function summarize(cats: ReadonlyArray<TrackerCategory>): TrackerSummary {
  let done = 0;
  let total = 0;
  let tracked = 0;
  let complete = 0;
  for (const c of cats) {
    if (c.total <= 0) continue;
    tracked++;
    total += c.total;
    done += Math.min(c.done, c.total);
    if (c.done >= c.total) complete++;
  }
  // Floor, so 99.6% never shows as a false "100%".
  const percent = total === 0 ? 0 : Math.floor((done / total) * 100);
  return { done, total, percent, tracked, complete };
}

/** Whole days since launch (Day 1 = launch day). 0 before launch. */
export function dayNumber(launch: Date, now: Date): number {
  if (now.getTime() < launch.getTime()) return 0;
  const a = new Date(launch.getFullYear(), launch.getMonth(), launch.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((b - a) / 86400000) + 1;
}

// Countdown VI — pure "Get ready for launch" checklist logic. No DOM and no
// direct localStorage access: persistence goes through a StorageLike passed
// in, so everything here is fully unit-testable. main.ts wires it to real
// localStorage.

import {
  CHECKLIST_ITEMS,
  PHYSICAL_START_LOCAL,
  PRELOAD_START_LOCAL,
  type ChecklistItem,
} from './config.ts';

export const CHECKLIST_STORAGE_KEY = 'cvi.ready';

/** Minimal storage surface — window.localStorage satisfies this. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Reads the checked item ids. Corrupt JSON, a non-array value, unknown ids,
 * and non-string entries are all ignored — the checklist just starts empty
 * rather than crashing.
 */
export function loadChecked(storage: StorageLike): Set<string> {
  try {
    const raw = storage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const valid = new Set(CHECKLIST_ITEMS.map((i) => i.id));
    return new Set(parsed.filter((v): v is string => typeof v === 'string' && valid.has(v)));
  } catch {
    return new Set();
  }
}

/** Persists the checked ids as a sorted JSON array. */
export function saveChecked(storage: StorageLike, checked: ReadonlySet<string>): void {
  try {
    storage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify([...checked].sort()));
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}

/** Returns a new set with `id` toggled. Unknown ids are still toggled — the
 *  caller only ever passes ids from CHECKLIST_ITEMS. */
export function toggleChecked(checked: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(checked);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** How many checklist items are checked (unknown ids never count). */
export function countChecked(checked: ReadonlySet<string>): number {
  return CHECKLIST_ITEMS.filter((i) => checked.has(i.id)).length;
}

export interface ItemStatus {
  /** Short badge text shown next to the item title. */
  label: string;
  /** True when the badge marks something live right now (green). */
  live: boolean;
}

/**
 * The live status badge for an item, or null when the item has none.
 * 'preload' and 'physical' badges follow the clock; 'bonus' is a fixed
 * deadline note (the checklist only shows before launch, so the bonus is
 * always still available while it is visible).
 */
export function getItemStatus(item: ChecklistItem, now: Date): ItemStatus | null {
  switch (item.status) {
    case 'preload':
      return now.getTime() >= PRELOAD_START_LOCAL.getTime()
        ? { label: 'Open now', live: true }
        : { label: 'Opens Nov 10', live: false };
    case 'physical':
      return now.getTime() >= PHYSICAL_START_LOCAL.getTime()
        ? { label: 'At retailers now', live: true }
        : { label: 'From Nov 12', live: false };
    case 'bonus':
      return { label: 'Ends Nov 19', live: false };
    default:
      return null;
  }
}

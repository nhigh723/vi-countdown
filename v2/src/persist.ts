// AsyncStorage-backed state with a synchronous in-memory cache, so the pure
// tracker logic can use a simple getItem/setItem surface.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageLike } from './tracker';

const cache = new Map<string, string>();
export const KEYS = ['cvi.tracker', 'cvi.theme', 'cvi.pro'] as const;

export async function hydrate(): Promise<void> {
  try {
    const pairs = await AsyncStorage.multiGet([...KEYS]);
    for (const [k, v] of pairs) if (v !== null) cache.set(k, v);
  } catch {
    /* start fresh */
  }
}

export const storage: StorageLike = {
  getItem: (k) => cache.get(k) ?? null,
  setItem: (k, v) => {
    cache.set(k, v);
    AsyncStorage.setItem(k, v).catch(() => {});
  },
};

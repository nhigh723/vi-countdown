// Pro unlock — Apple StoreKit via expo-iap (OpenIAP). No third-party
// purchase service, no account, no server, so the privacy label stays
// "Data Not Collected". Ownership = StoreKit's verified transaction history
// (getAvailablePurchases), never a bare flag; AsyncStorage only caches the
// last verified answer so Pro features render instantly offline.
import { Platform } from 'react-native';
import { PRO_PRODUCT_ID } from './config';
import { isCancelled, isPending, ownsPro, priceOf } from './entitlement';

export type BuyOutcome = 'purchased' | 'cancelled' | 'pending' | 'failed' | 'unavailable';
export type RestoreOutcome = 'restored' | 'nothing' | 'failed' | 'unavailable';

type Iap = typeof import('expo-iap');
let iap: Iap | null = null;
let connected = false;

async function load(): Promise<Iap | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    if (!iap) iap = await import('expo-iap');
    if (!connected) {
      await iap.initConnection();
      connected = true;
    }
    return iap;
  } catch {
    return null;
  }
}

/** Finishes any Pro transactions StoreKit hands us (non-consumable). */
async function finishAll(m: Iap, list: unknown): Promise<void> {
  const arr = Array.isArray(list) ? list : list ? [list] : [];
  for (const p of arr) {
    try {
      if (p && (p as { productId?: string }).productId === PRO_PRODUCT_ID) {
        await m.finishTransaction({ purchase: p as never, isConsumable: false });
      }
    } catch {
      /* already finished — fine */
    }
  }
}

export interface StoreState {
  available: boolean;
  price: string | null;
  owned: boolean | null; // null = couldn't check
}

/** Loads the product (localized price) and current ownership. */
export async function initStore(): Promise<StoreState> {
  const m = await load();
  if (!m) return { available: false, price: null, owned: null };
  let price: string | null = null;
  let owned: boolean | null = null;
  try {
    price = priceOf(await m.fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' }));
  } catch {
    price = null;
  }
  try {
    const purchases = await m.getAvailablePurchases();
    owned = ownsPro(purchases);
    await finishAll(m, purchases);
  } catch {
    owned = null;
  }
  return { available: price !== null, price, owned };
}

/** Listens for purchases that complete outside a tap (Ask to Buy approval,
 *  interrupted purchases replayed at launch). Returns an unsubscribe. */
export async function listenForPro(onOwned: () => void): Promise<() => void> {
  const m = await load();
  if (!m) return () => {};
  const sub = m.purchaseUpdatedListener((p) => {
    if (ownsPro(p)) {
      void finishAll(m, p);
      onOwned();
    }
  });
  return () => sub.remove();
}

export async function buyPro(): Promise<BuyOutcome> {
  const m = await load();
  if (!m) return 'unavailable';
  try {
    const result = await m.requestPurchase({ request: { apple: { sku: PRO_PRODUCT_ID } }, type: 'in-app' });
    if (ownsPro(result)) {
      await finishAll(m, result);
      return 'purchased';
    }
    const list = await m.getAvailablePurchases();
    if (ownsPro(list)) {
      await finishAll(m, list);
      return 'purchased';
    }
    return 'failed';
  } catch (e) {
    if (isCancelled(e)) return 'cancelled';
    if (isPending(e)) return 'pending';
    return 'failed';
  }
}

export async function restorePro(): Promise<RestoreOutcome> {
  const m = await load();
  if (!m) return 'unavailable';
  try {
    await m.restorePurchases();
    const list = await m.getAvailablePurchases();
    await finishAll(m, list);
    return ownsPro(list) ? 'restored' : 'nothing';
  } catch {
    return 'failed';
  }
}

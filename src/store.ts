// Launch Pass (v1.2) — $1.99 one-time in-app purchase via RevenueCat.
// ----------------------------------------------------------------
// What buyers get: (1) IMMEDIATELY — a "Founder" badge on the hero and
// in About, plus an active Launch Pass section; (2) ON LAUNCH DAY — the
// v2 100% completion checklist unlocked the moment it ships; (3) FOREVER
// — no ads, ever, when ads arrive in v2.
//
// Purchase state comes from the RevenueCat 'launch_pass' ENTITLEMENT —
// never from a bare localStorage flag. localStorage holds only a cache
// that mirrors the last verified entitlement state (so the badge renders
// instantly on launch); the cache is written ONLY from a real
// getCustomerInfo()/restorePurchases()/purchase result, and refreshes
// from RevenueCat on every app start. Restores work across devices
// because restorePurchases() re-links the Apple ID purchase.
//
// NO-KEY STATE: with the placeholder API key still in config.ts (web
// preview, or before Nick pastes his free RevenueCat key), purchases are
// UNAVAILABLE. initStore() returns early, isStoreReady() is false, and
// the UI shows the offer with a clear "available in the App Store
// version" note. purchase()/restorePurchases() are never called in that
// state — there is no simulated purchase and no dead button. v1.2 does
// NOT submit until the real key is in (see README — Launch Pass
// launch blockers).
//
// SDK note (verified against the installed package, v11.3.3): this SDK
// has NO purchaseProduct(productId) method — the vintage app's store.ts
// calls one, and it does not exist in v11. The real v11 flow is:
// getProducts({ productIdentifiers }) -> purchaseStoreProduct({ product }).
// Do not "simplify" this back to purchaseProduct; it will throw on device.

import { Capacitor } from '@capacitor/core';
import {
  LAUNCH_PASS_ENTITLEMENT_ID,
  LAUNCH_PASS_PRODUCT_ID,
  REVENUECAT_API_KEY,
  isRevenueCatConfigured,
} from './config.ts';
import type { StorageLike } from './checklist.ts';

/** Cache key for the last VERIFIED entitlement state (see header). */
export const LAUNCH_PASS_STORAGE_KEY = 'cvi.launchpass';

/** Outcome of a purchase attempt, for the UI to report honestly. */
export type PurchaseOutcome = 'purchased' | 'cancelled' | 'failed' | 'unavailable';

/** Outcome of a restore attempt. */
export type RestoreOutcome = 'restored' | 'nothing-to-restore' | 'failed' | 'unavailable';

// Minimal structural view of the RevenueCat v11 Capacitor surface we use.
// Kept loose on purpose: the SDK's exact result wrappers have shifted
// between versions, so the entitlement check accepts both
// { customerInfo } wrappers and bare CustomerInfo shapes.
interface PurchasesApi {
  configure: (o: { apiKey: string }) => Promise<unknown>;
  getProducts: (o: { productIdentifiers: string[]; type?: string }) => Promise<unknown>;
  purchaseStoreProduct: (o: { product: unknown }) => Promise<unknown>;
  restorePurchases: () => Promise<unknown>;
  getCustomerInfo: () => Promise<unknown>;
}

let purchasesApi: PurchasesApi | null = null;
let configured = false;

async function loadPurchases(): Promise<PurchasesApi | null> {
  if (purchasesApi) return purchasesApi;
  try {
    const mod = await import('@revenuecat/purchases-capacitor').catch(() => null);
    const Purchases = (mod as { Purchases?: PurchasesApi } | null)?.Purchases;
    if (Purchases && typeof Purchases.configure === 'function') {
      purchasesApi = Purchases;
      return purchasesApi;
    }
  } catch {
    // Native plugin unavailable — caller stays unconfigured.
  }
  return null;
}

/**
 * Pure entitlement check, unit-tested. Accepts a CustomerInfo object, a
 * { customerInfo } wrapper (what getCustomerInfo/restorePurchases return),
 * or a MakePurchaseResult (which carries customerInfo too). Anything else
 * is "not entitled". Never throws on odd shapes — an unparseable receipt
 * is not a Launch Pass.
 */
export function hasLaunchPassEntitlement(customerInfo: unknown): boolean {
  try {
    const root = customerInfo as {
      customerInfo?: unknown;
      entitlements?: { active?: Record<string, unknown> };
    } | null;
    if (!root || typeof root !== 'object') return false;
    const info = (root.customerInfo ?? root) as {
      entitlements?: { active?: Record<string, unknown> };
    };
    const active = info?.entitlements?.active;
    if (!active || typeof active !== 'object') return false;
    return Boolean(active[LAUNCH_PASS_ENTITLEMENT_ID]);
  } catch {
    return false;
  }
}

/**
 * Pure cancellation check, unit-tested. RevenueCat rejects a user-cancelled
 * purchase with code "1" (PURCHASE_CANCELLED_ERROR); the Capacitor plugin
 * may also surface it as a message containing "cancel". Anything else is a
 * real failure, not a cancellation.
 */
export function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: unknown; message?: unknown };
  if (err.code === '1' || err.code === 1 || err.code === 'PURCHASE_CANCELLED_ERROR') {
    return true;
  }
  if (typeof err.message === 'string' && /cancel/i.test(err.message)) return true;
  return false;
}

/** Reads the entitlement cache. The cache mirrors the last VERIFIED
 *  entitlement state — it is written only from a real RevenueCat result
 *  (init refresh, purchase, restore), never from UI code directly. */
export function loadLaunchPassOwned(storage: StorageLike): boolean {
  try {
    return storage.getItem(LAUNCH_PASS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Writes the entitlement cache. Callers: initStore/purchase/restore only,
 *  and only with a value derived from hasLaunchPassEntitlement(). */
export function saveLaunchPassOwned(storage: StorageLike, owned: boolean): void {
  try {
    storage.setItem(LAUNCH_PASS_STORAGE_KEY, owned ? '1' : '0');
  } catch {
    /* storage unavailable — the badge just won't persist */
  }
}

/** True only when RevenueCat is configured AND the native plugin loaded
 *  (i.e. on a real device with a real key). The UI shows the live buy
 *  button only when this is true; otherwise it shows the no-key note. */
export function isStoreReady(): boolean {
  return configured;
}

/**
 * Initialises RevenueCat on a real device with a real key, then refreshes
 * the entitlement cache so returning Launch Pass holders see the Founder
 * badge on launch. No-ops on the web preview and with the placeholder key
 * (purchases unavailable there — see the header).
 */
export async function initStore(storage: StorageLike): Promise<void> {
  if (!isRevenueCatConfigured()) return; // placeholder key: purchases unavailable
  if (!Capacitor.isNativePlatform()) return; // web preview: never attempt purchases
  const Purchases = await loadPurchases();
  if (!Purchases) return; // no native plugin: stay unconfigured
  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    configured = true;
    // Refresh entitlement state so returning buyers show the badge on launch.
    try {
      const info = await Purchases.getCustomerInfo();
      saveLaunchPassOwned(storage, hasLaunchPassEntitlement(info));
    } catch {
      // Entitlement refresh is best-effort; purchase/restore re-check.
    }
  } catch {
    configured = false;
  }
}

/**
 * Purchase path (device only, key configured). Real v11 flow:
 * getProducts() for the Launch Pass product, then purchaseStoreProduct().
 * The local cache is set ONLY when the 'launch_pass' entitlement is
 * actually active afterwards — a completed payment without the entitlement
 * does not unlock anything (returns 'failed'; the UI suggests Restore).
 * A user-cancelled purchase returns 'cancelled' (no error screen).
 * Any other failure returns 'failed' — this function never throws, so the
 * UI can always report a plain message. With no key/plugin configured it
 * returns 'unavailable' without touching the store.
 */
export async function purchaseLaunchPass(storage: StorageLike): Promise<PurchaseOutcome> {
  if (!configured) return 'unavailable';
  const Purchases = await loadPurchases();
  if (!Purchases) return 'unavailable';
  let product: unknown = null;
  try {
    const result = (await Purchases.getProducts({
      productIdentifiers: [LAUNCH_PASS_PRODUCT_ID],
      type: 'NON_SUBSCRIPTION',
    })) as { products?: unknown[] } | null;
    const products = Array.isArray(result?.products) ? result.products : [];
    product = products[0] ?? null;
  } catch {
    return 'failed';
  }
  if (!product) return 'failed'; // product not found in RevenueCat/App Store
  let result: unknown;
  try {
    result = await Purchases.purchaseStoreProduct({ product });
  } catch (e) {
    if (isPurchaseCancelled(e)) return 'cancelled';
    return 'failed';
  }
  // The purchase result already carries customerInfo; re-check via
  // getCustomerInfo so the entitlement verdict is always fresh.
  let entitled = hasLaunchPassEntitlement(result);
  if (!entitled) {
    try {
      entitled = hasLaunchPassEntitlement(await Purchases.getCustomerInfo());
    } catch {
      entitled = false;
    }
  }
  saveLaunchPassOwned(storage, entitled);
  return entitled ? 'purchased' : 'failed';
}

/**
 * Restore path (device only, key configured). Calls the real
 * restorePurchases(), which re-links the Apple ID purchase to this
 * RevenueCat user — this is what makes the pass work across devices.
 * Returns 'restored' only when the entitlement is active afterwards,
 * 'nothing-to-restore' when the account has no Launch Pass, 'failed' on
 * error (usually network or a different Apple ID), and 'unavailable'
 * with no key/plugin configured. Never throws.
 */
export async function restoreLaunchPass(storage: StorageLike): Promise<RestoreOutcome> {
  if (!configured) return 'unavailable';
  const Purchases = await loadPurchases();
  if (!Purchases) return 'unavailable';
  try {
    const info = await Purchases.restorePurchases();
    const entitled = hasLaunchPassEntitlement(info);
    saveLaunchPassOwned(storage, entitled);
    return entitled ? 'restored' : 'nothing-to-restore';
  } catch {
    return 'failed';
  }
}

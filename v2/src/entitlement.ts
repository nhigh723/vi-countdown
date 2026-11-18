// Pure, unit-tested helpers for the Pro unlock (no native imports here).
import { PRO_PRODUCT_ID } from './config';

export interface PurchaseLike {
  productId?: unknown;
  purchaseState?: unknown;
  revocationDateIOS?: unknown;
}

/** True when a verified, non-revoked Pro purchase is in `list`.
 *  Accepts an array, a single purchase, or null. Never throws. */
export function ownsPro(list: unknown): boolean {
  try {
    const arr: unknown[] = Array.isArray(list) ? list : list && typeof list === 'object' ? [list] : [];
    return arr.some((p) => {
      if (!p || typeof p !== 'object') return false;
      const x = p as PurchaseLike;
      if (x.productId !== PRO_PRODUCT_ID) return false;
      if (x.purchaseState === 'pending') return false;
      return x.revocationDateIOS === undefined || x.revocationDateIOS === null || x.revocationDateIOS === 0;
    });
  } catch {
    return false;
  }
}

/** expo-iap / OpenIAP error codes + message fallbacks. */
export function isCancelled(e: unknown): boolean {
  if (!e) return false;
  const err = e as { code?: unknown; message?: unknown };
  const code = typeof err.code === 'string' ? err.code.toLowerCase() : '';
  if (code.includes('cancel')) return true;
  const msg = typeof e === 'string' ? e : typeof err.message === 'string' ? err.message : '';
  return /cancel/i.test(msg);
}

export function isPending(e: unknown): boolean {
  if (!e) return false;
  const err = e as { code?: unknown; message?: unknown };
  const code = typeof err.code === 'string' ? err.code.toLowerCase() : '';
  if (code.includes('pending') || code.includes('deferred')) return true;
  const msg = typeof e === 'string' ? e : typeof err.message === 'string' ? err.message : '';
  return /pending|deferred|ask to buy/i.test(msg);
}

/** Localized price for the Pro product from fetchProducts(), or null. */
export function priceOf(products: unknown): string | null {
  if (!Array.isArray(products)) return null;
  const p = products.find((x) => x && typeof x === 'object' && (x as { id?: unknown }).id === PRO_PRODUCT_ID) as
    | { displayPrice?: unknown }
    | undefined;
  return p && typeof p.displayPrice === 'string' && p.displayPrice.trim() ? p.displayPrice : null;
}

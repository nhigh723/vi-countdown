// Countdown VI — unit tests for the v1.2 Launch Pass store: entitlement
// parsing, cancellation detection, the entitlement cache, no-key behavior,
// and the monetization flags. Run: npm test (node --test with TS
// type-stripping, Node 24+).
//
// What these tests CANNOT cover (no App Store sandbox here): a real
// purchase, a real restore, and RevenueCat configure() on a device. Those
// are on the pre-submission sandbox checklist in README.md.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAUNCH_PASS_ENTITLEMENT_ID,
  LAUNCH_PASS_NAME,
  LAUNCH_PASS_PRICE_LABEL,
  LAUNCH_PASS_PRODUCT_ID,
  REVENUECAT_API_KEY,
  isRevenueCatConfigured,
} from '../src/config.ts';
import {
  LAUNCH_PASS_STORAGE_KEY,
  hasLaunchPassEntitlement,
  isPurchaseCancelled,
  isStoreReady,
  loadLaunchPassOwned,
  purchaseLaunchPass,
  restoreLaunchPass,
  saveLaunchPassOwned,
} from '../src/store.ts';
import {
  ADS_ENABLED,
  REMOVE_ADS_PRODUCT_ID,
  hasRemoveAds,
  shouldShowAds,
} from '../src/monetization.ts';

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
}

function throwingStorage() {
  return {
    getItem: () => {
      throw new Error('storage unavailable');
    },
    setItem: () => {
      throw new Error('storage unavailable');
    },
  };
}

describe('Launch Pass config — product, entitlement, price', () => {
  it('has the exact product ID, entitlement, name, and price', () => {
    assert.equal(LAUNCH_PASS_PRODUCT_ID, 'com.nickhigh.vicountdown.launchpass');
    assert.equal(LAUNCH_PASS_ENTITLEMENT_ID, 'launch_pass');
    assert.equal(LAUNCH_PASS_NAME, 'Launch Pass');
    assert.equal(LAUNCH_PASS_PRICE_LABEL, '$1.99');
  });

  it('ships with a real public API key, so the store is configured', () => {
    assert.ok(REVENUECAT_API_KEY.startsWith('appl_'));
    assert.equal(isRevenueCatConfigured(), true);
  });
});

describe('hasLaunchPassEntitlement — pure entitlement parsing', () => {
  it('accepts a bare CustomerInfo with an active launch_pass', () => {
    assert.equal(
      hasLaunchPassEntitlement({ entitlements: { active: { launch_pass: { identifier: 'launch_pass' } } } }),
      true,
    );
  });

  it('accepts the { customerInfo } wrapper getCustomerInfo/restore return', () => {
    assert.equal(
      hasLaunchPassEntitlement({
        customerInfo: { entitlements: { active: { launch_pass: {} } } },
      }),
      true,
    );
  });

  it('accepts a MakePurchaseResult shape (customerInfo + productIdentifier)', () => {
    assert.equal(
      hasLaunchPassEntitlement({
        customerInfo: { entitlements: { active: { launch_pass: {} } } },
        productIdentifier: 'com.nickhigh.vicountdown.launchpass',
        transaction: {},
      }),
      true,
    );
  });

  it('rejects when another entitlement is active but not launch_pass', () => {
    assert.equal(
      hasLaunchPassEntitlement({ entitlements: { active: { remove_ads: {} } } }),
      false,
    );
  });

  it('rejects an empty active map', () => {
    assert.equal(hasLaunchPassEntitlement({ entitlements: { active: {} } }), false);
  });

  it('rejects a missing entitlements object', () => {
    assert.equal(hasLaunchPassEntitlement({}), false);
    assert.equal(hasLaunchPassEntitlement({ customerInfo: {} }), false);
  });

  it('rejects non-objects without throwing', () => {
    for (const bad of [null, undefined, 'yes', 1, true, [], 42]) {
      assert.equal(hasLaunchPassEntitlement(bad), false);
    }
  });

  it('rejects a non-object active map without throwing', () => {
    assert.equal(hasLaunchPassEntitlement({ entitlements: { active: 'launch_pass' } }), false);
    assert.equal(hasLaunchPassEntitlement({ entitlements: 'yes' }), false);
  });
});

describe('isPurchaseCancelled — user cancel vs real failure', () => {
  it('treats RevenueCat code "1" (PURCHASE_CANCELLED_ERROR) as a cancel', () => {
    assert.equal(isPurchaseCancelled({ code: '1', message: 'Purchase cancelled' }), true);
    assert.equal(isPurchaseCancelled({ code: 1 }), true);
    assert.equal(isPurchaseCancelled({ code: 'PURCHASE_CANCELLED_ERROR' }), true);
  });

  it('treats a cancel message as a cancel', () => {
    assert.equal(isPurchaseCancelled({ message: 'User cancelled the purchase' }), true);
    assert.equal(isPurchaseCancelled({ message: 'Purchase cancelled by user' }), true);
    assert.equal(isPurchaseCancelled(new Error('The user cancelled.')), true);
  });

  it('does not treat other failures as cancels', () => {
    assert.equal(isPurchaseCancelled({ code: '2', message: 'Store problem' }), false);
    assert.equal(isPurchaseCancelled({ message: 'Network error' }), false);
    assert.equal(isPurchaseCancelled(new Error('Product not found')), false);
  });

  it('rejects non-objects without throwing', () => {
    for (const bad of [null, undefined, 'cancelled', 1, true]) {
      assert.equal(isPurchaseCancelled(bad), false);
    }
  });
});

describe('entitlement cache — mirrors the last verified state only', () => {
  it('defaults to not-owned on empty storage', () => {
    assert.equal(loadLaunchPassOwned(fakeStorage()), false);
  });

  it('round-trips owned true and false', () => {
    const s = fakeStorage();
    saveLaunchPassOwned(s, true);
    assert.equal(loadLaunchPassOwned(s), true);
    assert.equal(s.getItem(LAUNCH_PASS_STORAGE_KEY), '1');
    saveLaunchPassOwned(s, false);
    assert.equal(loadLaunchPassOwned(s), false);
    assert.equal(s.getItem(LAUNCH_PASS_STORAGE_KEY), '0');
  });

  it('treats any value other than "1" as not-owned', () => {
    assert.equal(loadLaunchPassOwned(fakeStorage({ [LAUNCH_PASS_STORAGE_KEY]: 'yes' })), false);
    assert.equal(loadLaunchPassOwned(fakeStorage({ [LAUNCH_PASS_STORAGE_KEY]: '' })), false);
  });

  it('never throws when storage is unavailable', () => {
    assert.equal(loadLaunchPassOwned(throwingStorage()), false);
    assert.doesNotThrow(() => saveLaunchPassOwned(throwingStorage(), true));
  });
});

describe('no-key behavior — purchases unavailable without a real key', () => {
  it('the store is not ready before any configuration', () => {
    assert.equal(isStoreReady(), false);
  });

  it('purchase returns unavailable (never touches the store)', async () => {
    assert.equal(await purchaseLaunchPass(fakeStorage()), 'unavailable');
  });

  it('restore returns unavailable (never touches the store)', async () => {
    assert.equal(await restoreLaunchPass(fakeStorage()), 'unavailable');
  });
});

describe('monetization — Launch Pass holders never see ads', () => {
  it('ads are still off in v1.2 (no ad SDK yet)', () => {
    assert.equal(ADS_ENABLED, false);
  });

  it('hasRemoveAds follows the pass: false by default, true for holders', () => {
    assert.equal(hasRemoveAds(), false);
    assert.equal(hasRemoveAds(false), false);
    assert.equal(hasRemoveAds(true), true);
  });

  it('shouldShowAds is false for everyone while ads are off', () => {
    assert.equal(shouldShowAds(), false);
    assert.equal(shouldShowAds(false), false);
    assert.equal(shouldShowAds(true), false);
  });

  it('the v2 remove-ads product ID is still reserved and well-formed', () => {
    assert.equal(REMOVE_ADS_PRODUCT_ID, 'com.nickhigh.vicountdown.removeads');
  });
});

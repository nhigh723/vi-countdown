import { describe, it } from '@jest/globals';
import { strict as assert } from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { PRO_PRODUCT_ID, BUNDLE_ID, APP_GROUP, DISCLAIMER, APP_NAME } from '../src/config';
import { isCancelled, isPending, ownsPro, priceOf } from '../src/entitlement';
import { getCountdownNumbers } from '../src/themes';
import { getCountdown } from '../src/countdown';

const ROOT = path.join(__dirname, '..');
const PASS = { productId: PRO_PRODUCT_ID, purchaseState: 'purchased', transactionId: '1' };

describe('config', () => {
  it('ships as an update to the existing app and reuses the existing IAP', () => {
    const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
    assert.equal(app.ios.bundleIdentifier, BUNDLE_ID);
    assert.equal(BUNDLE_ID, 'com.nickhigh.vicountdown');
    assert.equal(app.version, '2.0');
    assert.equal(PRO_PRODUCT_ID, 'com.nickhigh.vicountdown.launchpass');
    assert.deepEqual(app.ios.entitlements['com.apple.security.application-groups'], [APP_GROUP]);
  });
  it('keeps the name free of third-party marks and keeps the disclaimer', () => {
    assert.doesNotMatch(APP_NAME, /gta|grand theft|rockstar/i);
    assert.match(DISCLAIMER, /^Unofficial fan app\. Not affiliated/);
  });
  it('declares no tracking and no collected data in the privacy manifest', () => {
    const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
    assert.equal(app.ios.privacyManifests.NSPrivacyTracking, false);
    assert.deepEqual(app.ios.privacyManifests.NSPrivacyCollectedDataTypes, []);
  });
  it('has no ad, analytics or third-party purchase SDKs', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const deps = Object.keys(pkg.dependencies);
    for (const bad of ['react-native-purchases', '@revenuecat', 'google-mobile-ads', 'firebase', 'analytics', 'tracking-transparency', 'sentry', 'amplitude', 'mixpanel']) {
      assert.ok(!deps.some((d) => d.includes(bad)), `unexpected dependency matching ${bad}`);
    }
  });
  it('never hard-codes a price in the UI (StoreKit supplies it)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'App.tsx'), 'utf8');
    assert.doesNotMatch(src, /\$\d+\.\d\d/);
  });
});

describe('ownsPro', () => {
  it('accepts a purchase list or a single purchase', () => {
    assert.equal(ownsPro([PASS]), true);
    assert.equal(ownsPro(PASS), true);
  });
  it('rejects refunded, pending, other products and junk', () => {
    assert.equal(ownsPro([{ ...PASS, revocationDateIOS: 1790000000000 }]), false);
    assert.equal(ownsPro([{ ...PASS, purchaseState: 'pending' }]), false);
    assert.equal(ownsPro([{ productId: 'x' }]), false);
    for (const v of [null, undefined, 3, 'x', {}, [null]]) assert.equal(ownsPro(v), false);
  });
});

describe('purchase errors', () => {
  it('detects cancel and pending', () => {
    assert.equal(isCancelled({ code: 'user-cancelled' }), true);
    assert.equal(isCancelled({ code: 'E_USER_CANCELLED' }), true);
    assert.equal(isCancelled(new Error('Purchase cancelled')), true);
    assert.equal(isCancelled(new Error('network')), false);
    assert.equal(isPending({ code: 'deferred-payment' }), true);
    assert.equal(isPending(new Error('pending')), true);
    assert.equal(isPending(null), false);
  });
});

describe('priceOf', () => {
  it('returns the localized price of the Pro product', () => {
    assert.equal(priceOf([{ id: 'x', displayPrice: '$1' }, { id: PRO_PRODUCT_ID, displayPrice: '2,99 €' }]), '2,99 €');
    assert.equal(priceOf([]), null);
    assert.equal(priceOf(null), null);
    assert.equal(priceOf([{ id: PRO_PRODUCT_ID, displayPrice: '' }]), null);
  });
});

describe('countdown card numbers', () => {
  const launch = new Date(2026, 10, 19);
  it('days, hours, and launched', () => {
    assert.deepEqual(getCountdownNumbers(getCountdown(launch, new Date(2026, 10, 17, 19, 0, 0))), { big: '1', unit: 'DAY', sub: '5h 0m to go' });
    assert.deepEqual(getCountdownNumbers(getCountdown(launch, new Date(2026, 10, 18, 22, 30, 0))), { big: '1', unit: 'HOUR', sub: '30m 0s to go' });
    assert.equal(getCountdownNumbers(getCountdown(launch, new Date(2026, 10, 20))).big, 'OUT');
  });
});

describe('widget source', () => {
  const swift = fs.readFileSync(path.join(ROOT, 'targets/widget/Widgets.swift'), 'utf8');
  it('reads the same App Group and keys the app writes', () => {
    assert.ok(swift.includes(`"${APP_GROUP}"`));
    for (const k of ['percent', 'done', 'total', 'tracked', 'pro', 'theme']) assert.ok(swift.includes(`forKey: "${k}"`), k);
    const sync = fs.readFileSync(path.join(ROOT, 'src/widgetSync.ts'), 'utf8');
    for (const k of ['percent', 'done', 'total', 'tracked', 'pro', 'theme']) assert.ok(sync.includes(`s.set('${k}'`), k);
  });
  it('uses the same launch date as the app', () => {
    assert.match(swift, /c\.year = 2026; c\.month = 11; c\.day = 19/);
  });
  it('gates Lock Screen widgets on Pro and has no third-party marks', () => {
    assert.match(swift, /if !entry\.pro/);
    assert.doesNotMatch(swift, /gta|grand theft|rockstar/i);
  });
});

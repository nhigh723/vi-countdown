// Countdown VI v2 — browser smoke drive of the web export (react-native-web).
// Covers the JS UI flows a browser can run: tabs, countdown, tracker goals
// and +/−, persistence, the free custom-tracker limit, locked Pro styles,
// and the Pro screen's off-device state. NOT covered here (needs an iPhone):
// StoreKit purchase/restore, share sheet, widgets.
// Run: npx expo export -p web --output-dir /tmp/cvi-web && node tests/web-drive.mjs
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const DIR = process.env.WEB_DIR || '/tmp/cvi-web';
const SHOTS = process.env.SHOTS || '/tmp/cvi-shots';
fs.mkdirSync(SHOTS, { recursive: true });
const CHROME = process.env.CHROME_PATH || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/opt/meta-chromium/chrome'].find((p) => fs.existsSync(p));

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let f = path.join(DIR, url);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIR, 'index.html');
  res.setHeader('content-type', f.endsWith('.js') ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

let n = 0;
const ok = (s) => console.log(`  PASS ${++n}. ${s}`);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const text = () => page.evaluate(() => document.body.innerText);
  const clickText = async (t) => {
    const ok = await page.evaluate((t) => {
      const els = [...document.querySelectorAll('[role="button"],[role="tab"],div,button')].filter((e) => e.innerText && e.innerText.trim() === t);
      const el = els[els.length - 1];
      if (!el) return false;
      el.click();
      return true;
    }, t);
    assert.ok(ok, `no element with text "${t}"`);
    await new Promise((r) => setTimeout(r, 150));
  };

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('COUNTDOWN'), { timeout: 15000 });
  let t = await text();
  const launched = Date.now() >= new Date(2026, 10, 19).getTime();
  assert.match(t, launched ? /IT’S OUT NOW/ : /UNTIL LAUNCH/);
  assert.match(t, /Unofficial fan companion/);
  assert.match(t, /PlayStation Store ↗/);
  ok(`home renders (${launched ? 'launch mode' : 'countdown mode'}), store links present`);
  await page.screenshot({ path: `${SHOTS}/01-home.png` });

  await clickText('Launch');
  t = await text();
  assert.match(t, /When can I play\?/);
  assert.match(t, /midnight local time/);
  await clickText('Xbox');
  t = await text();
  assert.match(t, /Xbox Series X\|S/);
  assert.match(t, /Timeline/);
  assert.match(t, /What we know/);
  assert.match(t, /Who plays first/);
  await clickText('Show all sources');
  assert.match(await text(), /Launch date & platforms:/);
  ok('launch tab: unlock checker PS5/Xbox, who plays first, timeline, what we know, sources');
  await page.screenshot({ path: `${SHOTS}/01b-launch.png`, fullPage: true });

  await clickText('Tracker');
  t = await text();
  assert.match(t, /Your 100% tracker/);
  for (const c of ['Story missions', 'Side activities', 'Collectibles', 'Vehicles', 'Properties & businesses', 'Outfits & customization']) assert.ok(t.includes(c), c);
  assert.doesNotMatch(t, /\bGTA\b|Rockstar/);
  ok('tracker shows six generic categories, no third-party names');

  // Set a goal on Story missions, then + + + −.
  await page.evaluate(() => {
    const inp = document.querySelector('input[aria-label="Goal for Story missions"]');
    inp.focus();
  });
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('4');
  await page.evaluate(() => document.querySelector('input[aria-label="Goal for Story missions"]').blur());
  await new Promise((r) => setTimeout(r, 200));
  for (const label of ['One more Story missions', 'One more Story missions', 'One more Story missions', 'One less Story missions']) {
    await page.click(`[aria-label="${label}"]`);
    await new Promise((r) => setTimeout(r, 80));
  }
  t = await text();
  assert.match(t, /2 \/ 4/);
  assert.match(t, /50% · 2 of 4/);
  ok('goal + / − update the count and the 50% summary');
  await page.screenshot({ path: `${SHOTS}/02-tracker.png` });

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('COUNTDOWN'));
  await clickText('Tracker');
  assert.match(await text(), /2 \/ 4/);
  ok('tracker progress survives a reload');

  const addCustom = async (name, goal) => {
    await page.click('input[placeholder="e.g. Races won"]');
    await page.keyboard.type(name);
    await page.click('input[placeholder="Goal"]');
    await page.keyboard.type(goal);
    const label = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((e) => e.innerText.trim()).find((s) => s.startsWith('Add')));
    await clickText(label);
  };
  await addCustom('Races won', '10');
  t = await text();
  assert.match(t, /Races won/);
  assert.match(t, /0 \/ 10/);
  ok('free user adds one custom tracker');
  await addCustom('Photos', '5');
  t = await text();
  assert.match(t, /Countdown VI Pro/, 'second custom tracker should route to the Pro screen');
  ok('second custom tracker routes a free user to Pro');

  assert.match(t, /One-time purchase\. No subscription/);
  assert.match(t, /Purchases are available in the iPhone app/);
  assert.match(t, /Lock Screen widgets/);
  assert.doesNotMatch(t, /\$\d/);
  ok('Pro screen: honest one-time copy, no hard-coded price, disabled off-device');
  await page.screenshot({ path: `${SHOTS}/03-pro.png` });

  await clickText('Tracker');
  await page.click('[aria-label="Gold style, Pro"]');
  await new Promise((r) => setTimeout(r, 150));
  assert.match(await text(), /Countdown VI Pro/);
  ok('locked Pro style routes to Pro instead of applying');

  // Seed Pro (test harness only) and check the Founder badge + unlimited adds.
  await page.evaluate(() => localStorage.setItem('cvi.pro', '1'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('COUNTDOWN'));
  assert.match(await text(), /★ FOUNDER/);
  await clickText('Tracker');
  await addCustom('Photos', '5');
  await addCustom('Stunts', '3');
  t = await text();
  assert.match(t, /Photos/);
  assert.match(t, /Stunts/);
  await page.click('[aria-label="Gold style"]');
  ok('Pro (seeded): Founder badge, unlimited custom trackers, Gold style selectable');
  await page.screenshot({ path: `${SHOTS}/04-tracker-pro.png`, fullPage: true });

  await clickText('About');
  t = await text();
  assert.match(t, /Unofficial fan app\. Not affiliated with, endorsed, sponsored, or approved by Rockstar Games/);
  assert.match(t, /Version 2\.0/);
  ok('About carries the disclaimer and version 2.0');
  await page.screenshot({ path: `${SHOTS}/05-about.png` });

  assert.deepEqual(errors.filter((e) => !/favicon/i.test(e)), [], 'console/page errors');
  ok('zero console / page errors');
} finally {
  await browser.close();
  server.close();
}

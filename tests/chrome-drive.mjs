// Countdown VI — Chrome phone-size QA drive (puppeteer-core, real browser).
// Serves the production build from file:// (this VM's Chrome blocks localhost
// pages via Local Network Access checks). Run: node tests/chrome-drive.mjs
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = `file://${ROOT}/dist/index.html`;
const SHOTS = `${ROOT}/qa-shots`;
const STORE_SHOTS = `${ROOT}/store/screenshots`;

// This VM's Chromium build refuses to start without a WebGL domain policy
// file + SHA-256 switches (see tests/webgl-policy.txt).
const POLICY = `${ROOT}/tests/webgl-policy.txt`;
const POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(POLICY)).digest('hex');

const CHROME = '/opt/meta-chromium/chrome';
let step = 0;
const ok = (name) => console.log(`  PASS ${++step}. ${name}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--force-device-scale-factor=1',
    '--allow-file-access-from-files', // ES module scripts are CORS-blocked on file:// without this
    `--hatch-webgl-allowed-domains-file=${POLICY}`,
    `--hatch-webgl-allowed-domains-sha256=${POLICY_SHA}`,
  ],
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // --- 1. Load + hero countdown ---
  await page.goto(DIST, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#cd-days', { timeout: 10000 });
  const hero = await page.$eval('#hero', (el) => el.innerText);
  assert.match(hero, /UNTIL LAUNCH/);
  const days = Number(await page.$eval('#cd-days', (el) => el.textContent));
  const hours = Number(await page.$eval('#cd-hours', (el) => el.textContent));
  // Expected values computed the same way the app does (local midnight Nov 19).
  const target = new Date(2026, 10, 19, 0, 0, 0).getTime();
  const remaining = Math.max(0, target - Date.now());
  const expDays = Math.floor(remaining / 86400000);
  const expHours = Math.floor(remaining / 3600000) % 24;
  assert.equal(days, expDays, `days tile ${days} != expected ${expDays}`);
  assert.ok(Math.abs(hours - expHours) <= 1, `hours tile ${hours} vs expected ${expHours}`);
  ok('hero countdown shows correct days/hours');

  // --- 2. Countdown ticks ---
  const s1 = await page.$eval('#cd-secs', (el) => el.textContent);
  await new Promise((r) => setTimeout(r, 2200));
  const s2 = await page.$eval('#cd-secs', (el) => el.textContent);
  assert.notEqual(s1, s2, 'seconds tile did not tick');
  ok('countdown ticks every second');

  // --- 3. No console/page errors so far ---
  assert.deepEqual(errors, []);
  ok('zero console errors / page errors');

  // --- 4. No horizontal overflow ---
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 0, `horizontal overflow: ${overflow}px`);
  ok('no horizontal overflow at 390px wide');

  // --- 5. Platform toggle: PS5 -> Xbox changes the unlock card + persists ---
  const ps5Text = await page.$eval('#unlock', (el) => el.innerText);
  assert.match(ps5Text, /PlayStation 5/);
  await page.click('[data-platform="xbox"]');
  const xboxText = await page.$eval('#unlock', (el) => el.innerText);
  assert.match(xboxText, /Xbox Series X\|S/);
  assert.match(xboxText, /Microsoft Store/);
  assert.doesNotMatch(xboxText, /PlayStation confirms/);
  const stored = await page.evaluate(() => localStorage.getItem('cvi.platform'));
  assert.equal(stored, 'xbox');
  ok('platform toggle switches PS5 -> Xbox and persists');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#cd-days');
  const afterReload = await page.$eval('#unlock', (el) => el.innerText);
  assert.match(afterReload, /Xbox Series X\|S/);
  ok('Xbox choice survives reload');
  await page.click('[data-platform="ps5"]');
  assert.equal(await page.evaluate(() => localStorage.getItem('cvi.platform')), 'ps5');
  ok('toggle back to PS5 works');

  // --- 6. Timeline statuses are date-correct ---
  const tl = await page.$$eval('.tl-item', (els) => els.map((el) => el.className + '|' + el.innerText));
  assert.equal(tl.length, 3);
  const today = new Date();
  const dayNum = (y, m, d) => new Date(y, m, d).getTime();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const expectStatus = (date) => (startOfToday > date ? 'tl-done' : startOfToday === date ? 'tl-today' : 'tl-upcoming');
  assert.ok(tl[0].includes(expectStatus(dayNum(2026, 10, 10))), `Nov 10 status: ${tl[0]}`);
  assert.ok(tl[1].includes(expectStatus(dayNum(2026, 10, 12))), `Nov 12 status: ${tl[1]}`);
  assert.ok(tl[2].includes(expectStatus(dayNum(2026, 10, 19))), `Nov 19 status: ${tl[2]}`);
  ok('timeline statuses match the real date');

  // --- 7. Facts + news links ---
  const facts = (await page.$eval('#facts', (el) => el.innerText)).replace(/\s+/g, ' ');
  for (const needle of ['$79.99', '$99.99', '212 GB', 'Mature 17+', 'no pc version announced', 'Jason and Lucia']) {
    assert.ok(facts.toLowerCase().includes(needle.toLowerCase()), `facts missing: ${needle}`);
  }
  ok('info cards carry the verified facts');
  const links = await page.$$eval('.news-link', (els) => els.map((a) => a.href));
  assert.equal(links.length, 4);
  for (const href of links) {
    assert.ok(href.startsWith('https://'), href);
    assert.ok(/rockstargames\.com|playstation\.com|xbox\.com/.test(href), href);
  }
  ok('4 news links, all https to official domains');

  // --- 7b. Get-ready checklist renders with 7 items and live badges ---
  const readyItems = await page.$$eval('#ready .ready-item', (els) => els.map((el) => el.innerText));
  assert.equal(readyItems.length, 7, `checklist has ${readyItems.length} items, expected 7`);
  assert.equal(await page.$eval('#ready-progress', (el) => el.textContent), '0 of 7 ready');
  assert.equal(await page.$eval('#ready-fill', (el) => el.style.width), '0%');
  const readyText = await page.$eval('#ready', (el) => el.innerText);
  assert.match(readyText, /Clear at least 212 GB/);
  assert.match(readyText, /Pre-load the game/);
  assert.match(readyText, /Set a launch-night alarm/);
  // Badge expectations follow the real date (same approach as the timeline).
  const preloadBadge = startOfToday >= dayNum(2026, 10, 10) ? 'Open now' : 'Opens Nov 10';
  const physicalBadge = startOfToday >= dayNum(2026, 10, 12) ? 'At retailers now' : 'From Nov 12';
  assert.ok(readyText.includes(preloadBadge), `pre-load badge should be "${preloadBadge}"`);
  assert.ok(readyText.includes(physicalBadge), `physical badge should be "${physicalBadge}"`);
  assert.ok(readyText.includes('Ends Nov 19'), 'bonus badge missing');
  ok('checklist renders 7 items with progress and live badges');

  // --- 7c. Ticking items updates progress, persists, and survives reload ---
  await page.click('input[data-ready="storage"]');
  await page.click('input[data-ready="preload"]');
  assert.equal(await page.$eval('#ready-progress', (el) => el.textContent), '2 of 7 ready');
  assert.equal(await page.$eval('#ready-fill', (el) => el.style.width), '29%');
  const storedReady = await page.evaluate(() => localStorage.getItem('cvi.ready'));
  assert.deepEqual(JSON.parse(storedReady).sort(), ['preload', 'storage']);
  const doneCount = await page.$$eval('#ready .ready-item.ready-done', (els) => els.length);
  assert.equal(doneCount, 2);
  ok('ticking 2 items updates progress to 2 of 7 and persists');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#cd-days');
  assert.equal(await page.$eval('#ready-progress', (el) => el.textContent), '2 of 7 ready');
  assert.equal(await page.$eval('input[data-ready="storage"]', (el) => el.checked), true);
  assert.equal(await page.$eval('input[data-ready="preload"]', (el) => el.checked), true);
  ok('checklist state survives reload');
  await page.click('input[data-ready="preload"]');
  assert.equal(await page.$eval('#ready-progress', (el) => el.textContent), '1 of 7 ready');
  assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem('cvi.ready'))), ['storage']);
  ok('unticking an item updates progress back to 1 of 7');

  // --- 7d. "What we know" guide carries the verified story/setting/cast facts ---
  const guide = (await page.$eval('#guide', (el) => el.innerText)).replace(/\s+/g, ' ');
  for (const needle of ['Jason Duval', 'Lucia Caminos', 'Leonida Keys', 'Grassrivers', 'Port Gellhorn', 'Ambrosia', 'Mount Kalaga', 'Cal Hampton', 'Boobie Ike', 'No voice cast announced', 'no rumors']) {
    assert.ok(guide.includes(needle), `guide missing: ${needle}`);
  }
  ok('guide carries the verified story, setting, and cast facts');

  // --- 7e. Pre-preload badges via ?now= (Nov 9: nothing open yet) ---
  await page.goto(`${DIST}?now=2026-11-09T12:00:00`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#ready');
  const earlyReady = await page.$eval('#ready', (el) => el.innerText);
  assert.ok(earlyReady.includes('Opens Nov 10'), 'pre-load badge should read "Opens Nov 10" on Nov 9');
  assert.ok(earlyReady.includes('From Nov 12'), 'physical badge should read "From Nov 12" on Nov 9');
  ok('pre-preload badges read correctly on Nov 9 (?now=)');
  await page.goto(DIST, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#cd-days');

  // --- 7f. Reminder: web preview shows the iPhone note, switch disabled ---
  const reminderText = await page.$eval('#reminder', (el) => el.innerText);
  assert.match(reminderText, /Reminders work on your iPhone/);
  assert.match(reminderText, /11:55 PM, Nov 18/);
  assert.equal(await page.$eval('input[data-reminder]', (el) => el.disabled), true);
  assert.equal(await page.$eval('input[data-reminder]', (el) => el.checked), false);
  ok('reminder shows the web fallback note with the switch disabled');

  // --- 7g. World unlock times: 8 cities, first-to-last order, correct labels ---
  const worldRows = await page.$$eval('#world .world-item', (els) =>
    els.map((el) => ({
      city: el.querySelector('.world-city').innerText.trim(),
      time: el.querySelector('.world-time').innerText.trim(),
    })),
  );
  assert.equal(worldRows.length, 8);
  assert.deepEqual(
    worldRows.map((r) => r.city),
    ['Auckland', 'Sydney', 'Tokyo', 'Paris', 'London', 'New York', 'Chicago', 'Los Angeles'],
  );
  // Expected labels computed from the known UTC instants, formatted in the
  // browser's own timezone — validates the app's conversion end to end.
  const userTz = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: userTz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const expectedLabels = {
    Auckland: fmt.format(new Date(Date.UTC(2026, 10, 18, 11, 0, 0))),
    Sydney: fmt.format(new Date(Date.UTC(2026, 10, 18, 13, 0, 0))),
    Tokyo: fmt.format(new Date(Date.UTC(2026, 10, 18, 15, 0, 0))),
    Paris: fmt.format(new Date(Date.UTC(2026, 10, 18, 23, 0, 0))),
    London: fmt.format(new Date(Date.UTC(2026, 10, 19, 0, 0, 0))),
    'New York': fmt.format(new Date(Date.UTC(2026, 10, 19, 5, 0, 0))),
    Chicago: fmt.format(new Date(Date.UTC(2026, 10, 19, 6, 0, 0))),
    'Los Angeles': fmt.format(new Date(Date.UTC(2026, 10, 19, 8, 0, 0))),
  };
  for (const row of worldRows) {
    assert.equal(row.time, expectedLabels[row.city], `${row.city} label`);
  }
  ok('world unlock times render 8 cities in first-to-last order with correct labels');

  // --- 7h. Share card: button renders a 1080x1920 PNG (download fallback) ---
  const DL_DIR = '/tmp/cvi-downloads';
  fs.rmSync(DL_DIR, { recursive: true, force: true });
  fs.mkdirSync(DL_DIR, { recursive: true });
  const cdp = await page.createCDPSession();
  await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DL_DIR });
  await page.evaluate(() => document.getElementById('hero').scrollIntoView());
  await page.click('#share-btn');
  await page.waitForFunction(
    () => document.getElementById('share-status').textContent.includes('Card downloaded'),
    { timeout: 15000 },
  );
  const pngPath = `${DL_DIR}/countdown-vi.png`;
  for (let i = 0; i < 30 && !fs.existsSync(pngPath); i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(fs.existsSync(pngPath), 'share card PNG did not download');
  const png = fs.readFileSync(pngPath);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'not a PNG file');
  assert.equal(png.readUInt32BE(16), 1080, 'card width is not 1080');
  assert.equal(png.readUInt32BE(20), 1920, 'card height is not 1920');
  assert.ok(png.length > 20000, `card PNG suspiciously small: ${png.length} bytes`);
  ok('share card renders and downloads as a 1080x1920 PNG');

  // --- 8. Disclaimer present (About + footer) ---
  const about = await page.$eval('#about', (el) => el.innerText);
  assert.match(about, /Unofficial fan app\. Not affiliated with/);
  const footer = await page.$eval('.app-footer', (el) => el.innerText);
  assert.match(footer, /Unofficial fan app/);
  ok('disclaimer present in About and footer');

  // --- 9. No placeholder text anywhere on the page ---
  const bodyText = await page.evaluate(() => document.body.innerText);
  for (const bad of ['lorem', 'TODO', 'placeholder', 'Lorem']) {
    assert.ok(!bodyText.includes(bad), `placeholder text found: ${bad}`);
  }
  ok('no placeholder text on any screen');

  // --- 10. Post-launch state via ?now= ---
  await page.goto(`${DIST}?now=2026-11-20T12:00:00`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.launched-title');
  const launched = await page.$eval('#hero', (el) => el.innerText);
  assert.match(launched, /IT[’']S OUT NOW/);
  assert.match(launched, /checklist is coming soon/);
  const storeBtns = await page.$$eval('#hero a.btn', (els) => els.map((a) => a.href));
  assert.equal(storeBtns.length, 2);
  assert.equal(await page.$('#ready'), null, 'get-ready checklist should hide after launch');
  assert.equal(await page.$('#reminder'), null, 'reminder should hide after launch');
  assert.equal(await page.$('#world'), null, 'world unlock times should hide after launch');
  assert.equal(await page.$('#share-btn'), null, 'share button should hide after launch');
  ok('post-launch state flips correctly (?now=2026-11-20)');

  // --- 11. One day before launch: countdown shows 1 day ---
  await page.goto(`${DIST}?now=2026-11-18T00:00:00`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#cd-days');
  assert.equal(await page.$eval('#cd-days', (el) => el.textContent), '1');
  ok('day-before-launch shows 1 day');

  // --- 12. Final error check ---
  assert.deepEqual(errors, []);
  ok('still zero console/page errors after all navigation');

  // --- Screenshots: QA set (390x844) + App Store sizes ---
  await page.goto(DIST, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#cd-days');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.screenshot({ path: `${SHOTS}/01-hero.png` });
  await page.evaluate(() => document.getElementById('unlock').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/02-unlock.png` });
  await page.evaluate(() => document.getElementById('timeline').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/03-timeline.png` });
  await page.evaluate(() => document.getElementById('facts').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/04-facts.png` });
  await page.evaluate(() => document.getElementById('news').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/05-news.png` });
  await page.evaluate(() => document.getElementById('about').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/06-about.png` });
  await page.evaluate(() => document.getElementById('ready').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/08-ready.png` });
  await page.evaluate(() => document.getElementById('guide').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/09-guide.png` });
  await page.evaluate(() => document.getElementById('reminder').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/10-reminder.png` });
  await page.evaluate(() => document.getElementById('world').scrollIntoView());
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: `${SHOTS}/11-world.png` });
  await page.goto(`${DIST}?now=2026-11-20T12:00:00`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.launched-title');
  await page.screenshot({ path: `${SHOTS}/07-launched.png` });
  console.log('  QA screenshots saved to qa-shots/');

  // App Store screenshots: 6.9" (1290x2796) and 6.5" (1242x2688).
  for (const [name, w, h] of [['iphone-69', 1290, 2796], ['iphone-65', 1242, 2688]]) {
    await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(DIST, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#cd-days');
    await page.screenshot({ path: `${STORE_SHOTS}/${name}-hero.png` });
    await page.evaluate(() => document.getElementById('unlock').scrollIntoView());
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${STORE_SHOTS}/${name}-unlock.png` });
    await page.evaluate(() => document.getElementById('timeline').scrollIntoView());
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${STORE_SHOTS}/${name}-timeline.png` });
    await page.evaluate(() => document.getElementById('ready').scrollIntoView());
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${STORE_SHOTS}/${name}-ready.png` });
    await page.evaluate(() => document.getElementById('world').scrollIntoView());
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: `${STORE_SHOTS}/${name}-world.png` });
  }
  console.log('  Store screenshots saved to store/screenshots/');

  console.log(`\nCHROME DRIVE: ${step}/${step} steps PASS, zero console errors.`);
} finally {
  await browser.close();
}

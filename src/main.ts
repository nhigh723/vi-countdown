// Countdown VI v1.1 — countdown + unlock checker + get-ready checklist +
// launch-night reminder + world unlock times + launch timeline +
// what-we-know guide + facts + news links + shareable countdown card.
// Single scroll page. All facts come from config.ts (verified public sources).
// QA hook (documented in README): ?now=ISO overrides the clock, e.g.
// ?now=2026-11-20T12:00:00 drives the post-launch state.

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  APP_NAME,
  APP_VERSION,
  CHECKLIST_ITEMS,
  DISCLAIMER,
  GUIDE_SECTIONS,
  LAUNCH_LABEL,
  LAUNCH_LOCAL,
  NEWS_LINKS,
  PHYSICAL_START_LOCAL,
  PLATFORMS,
  PRELOAD_START_LOCAL,
  SOURCES,
  TIMELINE,
  type PlatformId,
  type PlatformInfo,
} from './config';
import { getCountdown, getMilestoneStatus, pad2 } from './countdown';
import {
  countChecked,
  getItemStatus,
  loadChecked,
  saveChecked,
  toggleChecked,
} from './checklist';
import {
  REMINDER_BODY,
  REMINDER_NOTIFICATION_ID,
  REMINDER_TITLE,
  getReminderTime,
  isReminderTimePassed,
  loadReminderOn,
  saveReminderOn,
} from './reminder';
import { getWorldUnlockTimes } from './world-times';
import { shareCountdownCard } from './share-card';

const PLATFORM_KEY = 'cvi.platform';

function getNow(): Date {
  try {
    const param = new URLSearchParams(window.location.search).get('now');
    if (param) {
      const d = new Date(param);
      if (!Number.isNaN(d.getTime())) return d;
    }
  } catch {
    /* fall through to the real clock */
  }
  return new Date();
}

function loadPlatform(): PlatformId {
  try {
    const param = new URLSearchParams(window.location.search).get('platform');
    if (param === 'ps5' || param === 'xbox') return param;
    const saved = window.localStorage.getItem(PLATFORM_KEY);
    if (saved === 'ps5' || saved === 'xbox') return saved;
  } catch {
    /* storage unavailable — default below */
  }
  return 'ps5';
}

function savePlatform(id: PlatformId): void {
  try {
    window.localStorage.setItem(PLATFORM_KEY, id);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}

function platformById(id: PlatformId): PlatformInfo {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHero(now: Date): string {
  const cd = getCountdown(LAUNCH_LOCAL, now);
  const preloadOpen = now.getTime() >= PRELOAD_START_LOCAL.getTime();
  const pill = preloadOpen
    ? '<span class="pill pill-live"><span class="dot"></span>Pre-load is open now</span>'
    : '<span class="pill">Pre-load opens Nov 10</span>';
  if (cd.launched) {
    return `
    <section class="hero hero-launched" id="hero">
      <p class="hero-kicker">LAUNCH DAY HAS ARRIVED</p>
      <h1 class="launched-title">IT&rsquo;S OUT NOW</h1>
      <p class="hero-date">Grand Theft Auto VI is out now on PlayStation 5 and Xbox Series X|S.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${PLATFORMS[0].storeUrl}" target="_blank" rel="noopener">PlayStation Store</a>
        <a class="btn btn-ghost" href="${PLATFORMS[1].storeUrl}" target="_blank" rel="noopener">Microsoft Store</a>
      </div>
      <p class="hero-note">The 100% checklist is coming soon in the next update.</p>
    </section>`;
  }
  return `
  <section class="hero" id="hero">
    <p class="hero-kicker">UNTIL LAUNCH</p>
    <div class="countdown" role="timer" aria-label="Time until launch">
      <div class="cd-tile"><span class="cd-num" id="cd-days">${cd.days}</span><span class="cd-label">Days</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-hours">${pad2(cd.hours)}</span><span class="cd-label">Hours</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-mins">${pad2(cd.minutes)}</span><span class="cd-label">Mins</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-secs">${pad2(cd.seconds)}</span><span class="cd-label">Secs</span></div>
    </div>
    <p class="hero-date">${LAUNCH_LABEL} &middot; Midnight local time</p>
    ${pill}
    <div class="hero-share">
      <button type="button" class="btn btn-ghost" id="share-btn">Share countdown ↗</button>
      <p class="share-status" id="share-status" aria-live="polite"></p>
    </div>
  </section>`;
}

function renderUnlock(platform: PlatformInfo, now: Date): string {
  const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
  const preloadOpen = now.getTime() >= PRELOAD_START_LOCAL.getTime();
  const physicalOut = now.getTime() >= PHYSICAL_START_LOCAL.getTime();
  const toggle = PLATFORMS.map(
    (p) =>
      `<button type="button" class="seg-btn${p.id === platform.id ? ' seg-active' : ''}" data-platform="${p.id}" aria-pressed="${p.id === platform.id}">${esc(p.label)}</button>`,
  ).join('');
  const launchLine = launched
    ? '<p class="unlock-big">It&rsquo;s out now — go play.</p>'
    : `<p class="unlock-big">${esc(platform.unlockLine)}</p>`;
  return `
  <section class="card" id="unlock">
    <h2>When can I play?</h2>
    <p class="section-sub">Pick your console. Times are your local time.</p>
    <div class="segmented" role="group" aria-label="Choose your console">${toggle}</div>
    ${launchLine}
    <p class="unlock-note">${esc(platform.unlockNote)}</p>
    <ul class="check-list">
      <li><span class="check-ico">${preloadOpen ? '✓' : '○'}</span><span>${esc(platform.preloadLine)}${preloadOpen ? ' <strong>Open now.</strong>' : ''}</span></li>
      <li><span class="check-ico">○</span><span>Clear at least <strong>212 GB</strong> of space before downloading (PlayStation guidance; Rockstar says up to 212 GB depending on device).</span></li>
      <li><span class="check-ico">${physicalOut ? '✓' : '○'}</span><span>Physical edition is a code in a box, no disc.${physicalOut ? ' <strong>Available at retailers now.</strong>' : ' Available at retailers from Nov 12.'}</span></li>
    </ul>
    <a class="btn btn-primary btn-block" href="${platform.storeUrl}" target="_blank" rel="noopener">Open on the ${esc(platform.storeLabel)} ↗</a>
  </section>`;
}

function renderChecklist(now: Date, checked: ReadonlySet<string>): string {
  const total = CHECKLIST_ITEMS.length;
  const done = countChecked(checked);
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;
  const items = CHECKLIST_ITEMS.map((item) => {
    const isChecked = checked.has(item.id);
    const st = getItemStatus(item, now);
    const badge = st
      ? `<span class="ready-badge${st.live ? ' ready-badge-live' : ''}">${esc(st.label)}</span>`
      : '';
    return `
    <li class="ready-item${isChecked ? ' ready-done' : ''}">
      <label>
        <input type="checkbox" data-ready="${esc(item.id)}"${isChecked ? ' checked' : ''} />
        <span class="ready-body">
          <span class="ready-title">${esc(item.title)} ${badge}</span>
          <span class="ready-why">${esc(item.why)}</span>
        </span>
      </label>
    </li>`;
  }).join('');
  return `
  <section class="card" id="ready">
    <h2>Get ready for launch</h2>
    <p class="section-sub">Seven things to sort before midnight on Nov 19. Tick them off as you go — your progress is saved on this device.</p>
    <p class="ready-progress" id="ready-progress" aria-live="polite">${allDone ? `All ${total} done — you're ready. See you at midnight.` : `${done} of ${total} ready`}</p>
    <div class="progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Launch readiness"><div class="progress-fill" id="ready-fill" style="width: ${pct}%"></div></div>
    <ul class="ready-list">${items}</ul>
  </section>`;
}

function renderReminder(now: Date, reminderOn: boolean): string {
  const native = Capacitor.isNativePlatform();
  const tooLate = isReminderTimePassed(now);
  const disabled = !native || tooLate;
  const status = !native
    ? ''
    : tooLate
      ? 'Launch is less than 5 minutes away — the reminder moment has passed.'
      : reminderOn
        ? 'Reminder is on — you\u2019ll get a notification at 11:55 PM on Wednesday, Nov 18.'
        : '';
  return `
  <section class="card" id="reminder">
    <h2>Launch-night reminder</h2>
    <p class="section-sub">Get a notification 5 minutes before launch — Wednesday, Nov 18 at 11:55 PM, your local time. No account, nothing leaves your device.</p>
    ${native ? '' : '<p class="reminder-note">Reminders work on your iPhone — this web preview can\u2019t send notifications.</p>'}
    <label class="switch-row">
      <span class="switch-label">Remind me at 11:55 PM, Nov 18</span>
      <span class="switch">
        <input type="checkbox" data-reminder${reminderOn && native && !tooLate ? ' checked' : ''}${disabled ? ' disabled' : ''} />
        <span class="slider" aria-hidden="true"></span>
      </span>
    </label>
    <p class="reminder-status" id="reminder-status" aria-live="polite">${esc(status)}</p>
  </section>`;
}

function renderWorld(): string {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const rows = getWorldUnlockTimes(userTz);
  const items = rows
    .map(
      (r, i) => `
    <li class="world-item">
      <span class="world-rank" aria-hidden="true">${i + 1}</span>
      <span class="world-city">${esc(r.city)}${r.isUserCity ? ' <span class="world-you">You</span>' : ''}</span>
      <span class="world-time">${esc(r.localLabel)}</span>
    </li>`,
    )
    .join('');
  return `
  <section class="card" id="world">
    <h2>Who plays first?</h2>
    <p class="section-sub">Midnight local everywhere — here&rsquo;s when each city&rsquo;s midnight lands in your time.</p>
    <ol class="world-list">${items}</ol>
  </section>`;
}

function renderGuide(): string {
  const sections = GUIDE_SECTIONS.map(
    (s) => `
    <h3>${esc(s.heading)}</h3>
    <ul class="fact-list">
      ${s.items.map((it) => `<li><strong>${esc(it.lead)}</strong> ${esc(it.body)}</li>`).join('')}
    </ul>`,
  ).join('');
  return `
  <section class="card" id="guide">
    <h2>What we know</h2>
    <p class="section-sub">Everything Rockstar has officially confirmed — no rumors, no leaks. Every line traces to a source listed in About.</p>
    ${sections}
  </section>`;
}

function renderTimeline(now: Date): string {
  const items = TIMELINE.map((t) => {
    const st = getMilestoneStatus(t.date, now);
    const cls = st.status === 'done' ? 'tl-done' : st.status === 'today' ? 'tl-today' : 'tl-upcoming';
    const mark = st.status === 'done' ? '✓' : st.status === 'today' ? '●' : '○';
    return `
    <li class="tl-item ${cls}">
      <span class="tl-mark" aria-hidden="true">${mark}</span>
      <div class="tl-body">
        <p class="tl-head"><span class="tl-date">${esc(t.dateLabel)}</span><span class="tl-status">${esc(st.label)}</span></p>
        <p class="tl-title">${esc(t.title)}</p>
        <p class="tl-detail">${esc(t.detail)}</p>
      </div>
    </li>`;
  }).join('');
  return `
  <section class="card" id="timeline">
    <h2>Launch timeline</h2>
    <p class="section-sub">The three dates that matter.</p>
    <ol class="timeline">${items}</ol>
  </section>`;
}

function renderFacts(): string {
  return `
  <section class="card" id="facts">
    <h2>The game, in brief</h2>
    <p class="section-sub">Public facts only — every line traces to a source listed below.</p>
    <h3>Editions</h3>
    <ul class="fact-list">
      <li><strong>Standard — $79.99.</strong> The game, plus the pre-order bonus below.</li>
      <li><strong>Ultimate — $99.99.</strong> The game plus the Ultimate Edition Upgrade (exclusive vehicles, weapons, apparel and more for Jason and Lucia&rsquo;s story).</li>
      <li><strong>Ultimate Edition Upgrade — $20</strong> on its own, if you start with Standard.</li>
      <li><strong>Pre-order bonus:</strong> the Vintage Vice City Pack and one month of GTA+ when you buy before Nov 19, 2026, 11:59:59 PM.</li>
    </ul>
    <h3>Platforms</h3>
    <ul class="fact-list">
      <li><strong>PlayStation 5</strong> (PS5 Pro Enhanced). Not playable on PS4.</li>
      <li><strong>Xbox Series X|S.</strong> Optimized for Series X|S.</li>
      <li><strong>PC:</strong> no PC version announced.</li>
      <li><strong>Game Pass:</strong> not announced for Game Pass at launch — it is sold as a paid pre-order.</li>
    </ul>
    <h3>Details</h3>
    <ul class="fact-list">
      <li><strong>Single-player story</strong> starring Jason and Lucia, set in Vice City, in the state of Leonida.</li>
      <li><strong>Rating:</strong> ESRB Mature 17+ (per the Xbox Store listing).</li>
      <li><strong>Storage:</strong> clear at least 212 GB before pre-loading.</li>
      <li><strong>Also Nov 19:</strong> the official Grand Theft Auto VI album arrives the same day.</li>
    </ul>
  </section>`;
}

function renderChecklistTeaser(now: Date): string {
  const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
  return `
  <section class="card card-highlight" id="checklist">
    <h2>After launch: the 100% checklist</h2>
    <p>${launched
      ? 'The game is out — the checklist update is coming soon. Missions, collectibles, and 100% completion tracking, built from public community data.'
      : 'When the game is out, this app grows a checklist: missions, collectibles, and 100% completion tracking, built from public community data. No spoilers on the home screen — the checklist stays one tap away.'}</p>
    <p class="coming-soon">Coming soon in v2 — free update.</p>
  </section>`;
}

function renderNews(): string {
  const links = NEWS_LINKS.map(
    (n) => `
    <li>
      <a class="news-link" href="${n.url}" target="_blank" rel="noopener">
        <span class="news-text"><span class="news-title">${esc(n.title)}</span><span class="news-detail">${esc(n.detail)}</span></span>
        <span class="news-meta"><span class="news-source">${esc(n.source)}</span><span class="news-arrow" aria-hidden="true">↗</span></span>
      </a>
    </li>`,
  ).join('');
  return `
  <section class="card" id="news">
    <h2>Official news</h2>
    <p class="section-sub">Links to official sources — no copied articles, no rumors.</p>
    <ul class="news-list">${links}</ul>
  </section>`;
}

function renderAbout(): string {
  const sources = SOURCES.map((s) => `<li><strong>${esc(s.label)}:</strong> ${esc(s.detail)}</li>`).join('');
  return `
  <section class="card" id="about">
    <h2>About</h2>
    <p class="disclaimer">${esc(DISCLAIMER)}</p>
    <p>${esc(APP_NAME)} is a fan-made countdown. It collects no data, has no account, and works offline — the countdown, timeline, and facts all live inside the app. News links open the official sites in your browser.</p>
    <h3>Where every fact comes from</h3>
    <ul class="fact-list sources-list">${sources}</ul>
    <p class="version">Version ${esc(APP_VERSION)} · Free, no ads.</p>
    <p><a href="./privacy.html">Privacy policy</a></p>
  </section>`;
}

function renderApp(now: Date, platform: PlatformInfo, checked: ReadonlySet<string>, reminderOn: boolean): string {
  const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
  return `
  <header class="app-header">
    <p class="wordmark">COUNTDOWN <span class="wordmark-vi">VI</span></p>
    <p class="tagline">Unofficial fan companion</p>
  </header>
  <main>
    ${renderHero(now)}
    ${renderUnlock(platform, now)}
    ${launched ? '' : renderChecklist(now, checked)}
    ${launched ? '' : renderReminder(now, reminderOn)}
    ${launched ? '' : renderWorld()}
    ${renderTimeline(now)}
    ${renderGuide()}
    ${renderFacts()}
    ${renderChecklistTeaser(now)}
    ${renderNews()}
    ${renderAbout()}
  </main>
  <footer class="app-footer"><p>${esc(DISCLAIMER)}</p></footer>`;
}

/** Updates the checklist progress line, bar, and item styling in place after
 *  a tick — no full re-render, so scroll position and focus are preserved. */
function refreshChecklistUI(checked: ReadonlySet<string>): void {
  const total = CHECKLIST_ITEMS.length;
  const done = countChecked(checked);
  const progress = document.getElementById('ready-progress');
  if (progress) {
    progress.textContent =
      done === total ? `All ${total} done — you're ready. See you at midnight.` : `${done} of ${total} ready`;
  }
  const fill = document.getElementById('ready-fill');
  if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;
  const track = fill?.parentElement;
  if (track) track.setAttribute('aria-valuenow', String(done));
}

function start(): void {
  const root = document.getElementById('app');
  if (!root) return;
  let platform = platformById(loadPlatform());
  let checked = loadChecked(window.localStorage);
  let reminderOn = loadReminderOn(window.localStorage);
  let wasLaunched = getNow().getTime() >= LAUNCH_LOCAL.getTime();
  root.innerHTML = renderApp(getNow(), platform, checked, reminderOn);

  async function handleShare(): Promise<void> {
    const status = document.getElementById('share-status');
    const btn = document.getElementById('share-btn');
    if (btn) btn.setAttribute('disabled', 'true');
    if (status) status.textContent = 'Making your card…';
    const outcome = await shareCountdownCard(getCountdown(LAUNCH_LOCAL, getNow()));
    if (btn) btn.removeAttribute('disabled');
    if (!status) return;
    status.textContent =
      outcome === 'shared'
        ? 'Card shared.'
        : outcome === 'downloaded'
          ? 'Card downloaded — share it anywhere.'
          : outcome === 'cancelled'
            ? ''
            : 'Couldn\u2019t make the card. Please try again.';
  }

  async function handleReminderToggle(input: HTMLInputElement): Promise<void> {
    const statusEl = document.getElementById('reminder-status');
    const setStatus = (msg: string): void => {
      if (statusEl) statusEl.textContent = msg;
    };
    if (!Capacitor.isNativePlatform()) {
      // The switch is disabled on the web; this is a safety net only.
      input.checked = false;
      return;
    }
    if (input.checked) {
      if (isReminderTimePassed(getNow())) {
        input.checked = false;
        setStatus('Launch is less than 5 minutes away — the reminder moment has passed.');
        return;
      }
      try {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          perm = await LocalNotifications.requestPermissions();
        }
        if (perm.display !== 'granted') {
          input.checked = false;
          reminderOn = false;
          saveReminderOn(window.localStorage, false);
          setStatus('Reminders need notification permission. Turn it on in Settings, then try again.');
          return;
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id: REMINDER_NOTIFICATION_ID,
              title: REMINDER_TITLE,
              body: REMINDER_BODY,
              schedule: { at: getReminderTime() },
            },
          ],
        });
        reminderOn = true;
        saveReminderOn(window.localStorage, true);
        setStatus('Reminder is on — you\u2019ll get a notification at 11:55 PM on Wednesday, Nov 18.');
      } catch {
        input.checked = false;
        reminderOn = false;
        saveReminderOn(window.localStorage, false);
        setStatus('Something went wrong setting the reminder. Please try again.');
      }
      return;
    }
    try {
      await LocalNotifications.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] });
    } catch {
      /* nothing scheduled — fine */
    }
    reminderOn = false;
    saveReminderOn(window.localStorage, false);
    setStatus('');
  }

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.('#share-btn')) {
      void handleShare();
      return;
    }
    const btn = target?.closest?.('[data-platform]') as HTMLElement | null;
    if (!btn) return;
    const id = btn.getAttribute('data-platform');
    if (id !== 'ps5' && id !== 'xbox') return;
    platform = platformById(id);
    savePlatform(id);
    const unlock = document.getElementById('unlock');
    if (unlock) {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderUnlock(platform, getNow());
      unlock.replaceWith(tmp.firstElementChild as HTMLElement);
    }
  });

  // Checklist ticks + reminder toggle: the change event bubbles from the
  // checkbox up to #app.
  root.addEventListener('change', (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
    if (target.hasAttribute('data-reminder')) {
      void handleReminderToggle(target);
      return;
    }
    const id = target.getAttribute('data-ready');
    if (!id || !CHECKLIST_ITEMS.some((i) => i.id === id)) return;
    checked = toggleChecked(checked, id);
    saveChecked(window.localStorage, checked);
    const item = target.closest('.ready-item');
    if (item) item.classList.toggle('ready-done', target.checked);
    refreshChecklistUI(checked);
  });

  window.setInterval(() => {
    const now = getNow();
    const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
    if (launched !== wasLaunched) {
      wasLaunched = launched;
      root.innerHTML = renderApp(now, platform, checked, reminderOn);
      return;
    }
    if (launched) return;
    const cd = getCountdown(LAUNCH_LOCAL, now);
    const days = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const mins = document.getElementById('cd-mins');
    const secs = document.getElementById('cd-secs');
    if (days) days.textContent = String(cd.days);
    if (hours) hours.textContent = pad2(cd.hours);
    if (mins) mins.textContent = pad2(cd.minutes);
    if (secs) secs.textContent = pad2(cd.seconds);
  }, 1000);
}

start();

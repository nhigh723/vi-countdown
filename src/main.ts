// Countdown VI v1 — countdown + unlock checker + timeline + facts + news links.
// Single scroll page. All facts come from config.ts (verified public sources).
// QA hook (documented in README): ?now=ISO overrides the clock, e.g.
// ?now=2026-11-20T12:00:00 drives the post-launch state.

import {
  APP_NAME,
  APP_VERSION,
  DISCLAIMER,
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
import { REMOVE_ADS_PRICE_LABEL } from './monetization';

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
    <p class="version">Version ${esc(APP_VERSION)} · Free, no ads. A ${REMOVE_ADS_PRICE_LABEL} one-time remove-ads option arrives with the v2 checklist update.</p>
    <p><a href="./privacy.html">Privacy policy</a></p>
  </section>`;
}

function renderApp(now: Date, platform: PlatformInfo): string {
  return `
  <header class="app-header">
    <p class="wordmark">COUNTDOWN <span class="wordmark-vi">VI</span></p>
    <p class="tagline">Unofficial fan companion</p>
  </header>
  <main>
    ${renderHero(now)}
    ${renderUnlock(platform, now)}
    ${renderTimeline(now)}
    ${renderFacts()}
    ${renderChecklistTeaser(now)}
    ${renderNews()}
    ${renderAbout()}
  </main>
  <footer class="app-footer"><p>${esc(DISCLAIMER)}</p></footer>`;
}

function start(): void {
  const root = document.getElementById('app');
  if (!root) return;
  let platform = platformById(loadPlatform());
  let wasLaunched = getNow().getTime() >= LAUNCH_LOCAL.getTime();
  root.innerHTML = renderApp(getNow(), platform);

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
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

  window.setInterval(() => {
    const now = getNow();
    const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
    if (launched !== wasLaunched) {
      wasLaunched = launched;
      root.innerHTML = renderApp(now, platform);
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

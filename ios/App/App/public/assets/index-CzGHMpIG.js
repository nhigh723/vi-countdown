(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const T="Countdown VI",N="1.0.0",c=new Date(2026,10,19,0,0,0),L="Thursday, November 19, 2026",g=new Date(2026,10,10,0,0,0),w=new Date(2026,10,12,0,0,0),S="Unofficial fan app. Not affiliated with, endorsed by, or connected to Rockstar Games or Take-Two Interactive.",h=[{id:"ps5",label:"PlayStation 5",short:"PS5",unlockLine:"Thursday, Nov 19 at 12:00 AM — midnight local time.",unlockNote:"PlayStation confirms the PS5 version unlocks at midnight local time on Nov 19. PS5 Pro Enhanced. Not playable on PS4.",preloadLine:"Pre-loading opened Nov 10 at midnight local time.",storeUrl:"https://www.playstation.com/en-us/games/grand-theft-auto-vi/",storeLabel:"PlayStation Store"},{id:"xbox",label:"Xbox Series X|S",short:"Xbox",unlockLine:"Thursday, Nov 19 — launch day.",unlockNote:"Rockstar confirms the same Nov 19 console launch for Xbox Series X|S. Unlock timing follows your Microsoft Store region — midnight local is standard for console launches; confirm the exact hour on the store page.",preloadLine:"Digital pre-loading opened Nov 10 (12:00 AM GMT).",storeUrl:"https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn",storeLabel:"Microsoft Store"}],$=[{date:g,dateLabel:"Nov 10",title:"Digital pre-loading opens",detail:"Pre-ordered the digital edition? You can download the game now so it is ready the second it unlocks. Clear at least 212 GB of space first (PlayStation guidance)."},{date:w,dateLabel:"Nov 12",title:"Physical edition at retailers",detail:"The physical Standard Edition is a code in a box — there is no disc. Redeem the code to pre-load; the game still unlocks on Nov 19."},{date:c,dateLabel:"Nov 19",title:"Launch day",detail:"Grand Theft Auto VI unlocks at midnight local time on PlayStation 5, with the same Nov 19 console launch on Xbox Series X|S."}],A=[{title:"Rockstar Newswire",source:"rockstargames.com",detail:"Official news, straight from Rockstar — pre-load info, trailers, and launch updates.",url:"https://www.rockstargames.com/newswire"},{title:"Grand Theft Auto VI — official page",source:"rockstargames.com",detail:"The official game page: launch date, platforms, and the pre-load hub.",url:"https://www.rockstargames.com/VI"},{title:"PlayStation Store — GTA VI",source:"playstation.com",detail:"Editions, pre-load guide, and 212 GB storage guidance for PS5.",url:"https://www.playstation.com/en-us/games/grand-theft-auto-vi/"},{title:"Microsoft Store — GTA VI",source:"xbox.com",detail:"Editions and pre-order bonus details for Xbox Series X|S.",url:"https://www.xbox.com/en-us/games/store/grand-theft-auto-vi/9nl3wwnzlzzn"}],x=[{label:"Launch date & platforms",detail:"Rockstar Games (rockstargames.com/VI) and Take-Two press release, Jun 24, 2026 — Nov 19, 2026, PS5 and Xbox Series X|S."},{label:"Midnight local unlock (PS5)",detail:"PlayStation official GTA VI page — pre-loading from Nov 10, 2026 at midnight local time; release Nov 19, 2026."},{label:"Pre-load dates",detail:'Rockstar Newswire, Nov 3, 2026 ("Pre-Load Begins on November 10"); PlayStation page (Nov 10, midnight local); Rockstar support (physical from Nov 12).'},{label:"212 GB storage",detail:'PlayStation official GTA VI page — "clear a minimum of 212GB of storage space on your PlayStation 5." Rockstar guidance says up to 212 GB depending on device.'},{label:"Editions & prices",detail:"Standard $79.99 / Ultimate $99.99 / Ultimate Edition Upgrade $20 — Take-Two press release (Jun 24, 2026) and Xbox Store listing, checked Nov 8–9, 2026."},{label:"Pre-order bonus",detail:"Vintage Vice City Pack + 1 month of GTA+ for purchases before Nov 19, 2026, 11:59:59 PM — Xbox Store listing."},{label:"Physical = code in a box",detail:"Rockstar support pages — physical Standard Edition contains a download code, no disc."},{label:"Single-player, Vice City, Leonida",detail:"Rockstar / PlayStation / Xbox official pages — single-player story starring Jason and Lucia, set in Vice City, state of Leonida."},{label:"ESRB rating",detail:"Mature 17+ — Xbox Store listing (checked Nov 9 and Nov 12, 2026). PlayStation notes ratings vary by country."},{label:"No PC version announced",detail:"Rockstar has not announced a PC version or PC release date (as of Nov 12, 2026)."},{label:"Album",detail:"Grand Theft Auto VI: The Album arrives Nov 19, 2026 — Rockstar Newswire, Sep 17, 2026."}];function v(e,t){const n=e.getTime()-t.getTime(),s=n<=0,a=Math.max(0,n),o=Math.floor(a/1e3);return{days:Math.floor(o/86400),hours:Math.floor(o/3600)%24,minutes:Math.floor(o/60)%60,seconds:o%60,remainingMs:n,launched:s}}function d(e){return e<10?`0${e}`:String(e)}function f(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function I(e,t){const n=f(e).getTime(),s=f(t).getTime();return s>n?{status:"done",label:"Done"}:s===n?{status:"today",label:"Today"}:{status:"upcoming",label:"Coming up"}}const E="$2.99",k="cvi.platform";function m(){try{const e=new URLSearchParams(window.location.search).get("now");if(e){const t=new Date(e);if(!Number.isNaN(t.getTime()))return t}}catch{}return new Date}function C(){try{const e=new URLSearchParams(window.location.search).get("platform");if(e==="ps5"||e==="xbox")return e;const t=window.localStorage.getItem(k);if(t==="ps5"||t==="xbox")return t}catch{}return"ps5"}function M(e){try{window.localStorage.setItem(k,e)}catch{}}function b(e){var t;return(t=h.find(n=>n.id===e))!=null?t:h[0]}function i(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function R(e){const t=v(c,e),s=e.getTime()>=g.getTime()?'<span class="pill pill-live"><span class="dot"></span>Pre-load is open now</span>':'<span class="pill">Pre-load opens Nov 10</span>';return t.launched?`
    <section class="hero hero-launched" id="hero">
      <p class="hero-kicker">LAUNCH DAY HAS ARRIVED</p>
      <h1 class="launched-title">IT&rsquo;S OUT NOW</h1>
      <p class="hero-date">Grand Theft Auto VI is out now on PlayStation 5 and Xbox Series X|S.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${h[0].storeUrl}" target="_blank" rel="noopener">PlayStation Store</a>
        <a class="btn btn-ghost" href="${h[1].storeUrl}" target="_blank" rel="noopener">Microsoft Store</a>
      </div>
      <p class="hero-note">The 100% checklist is coming soon in the next update.</p>
    </section>`:`
  <section class="hero" id="hero">
    <p class="hero-kicker">UNTIL LAUNCH</p>
    <div class="countdown" role="timer" aria-label="Time until launch">
      <div class="cd-tile"><span class="cd-num" id="cd-days">${t.days}</span><span class="cd-label">Days</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-hours">${d(t.hours)}</span><span class="cd-label">Hours</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-mins">${d(t.minutes)}</span><span class="cd-label">Mins</span></div>
      <div class="cd-tile"><span class="cd-num" id="cd-secs">${d(t.seconds)}</span><span class="cd-label">Secs</span></div>
    </div>
    <p class="hero-date">${L} &middot; Midnight local time</p>
    ${s}
  </section>`}function P(e,t){const n=t.getTime()>=c.getTime(),s=t.getTime()>=g.getTime(),a=t.getTime()>=w.getTime(),o=h.map(r=>`<button type="button" class="seg-btn${r.id===e.id?" seg-active":""}" data-platform="${r.id}" aria-pressed="${r.id===e.id}">${i(r.label)}</button>`).join(""),l=n?'<p class="unlock-big">It&rsquo;s out now — go play.</p>':`<p class="unlock-big">${i(e.unlockLine)}</p>`;return`
  <section class="card" id="unlock">
    <h2>When can I play?</h2>
    <p class="section-sub">Pick your console. Times are your local time.</p>
    <div class="segmented" role="group" aria-label="Choose your console">${o}</div>
    ${l}
    <p class="unlock-note">${i(e.unlockNote)}</p>
    <ul class="check-list">
      <li><span class="check-ico">${s?"✓":"○"}</span><span>${i(e.preloadLine)}${s?" <strong>Open now.</strong>":""}</span></li>
      <li><span class="check-ico">○</span><span>Clear at least <strong>212 GB</strong> of space before downloading (PlayStation guidance; Rockstar says up to 212 GB depending on device).</span></li>
      <li><span class="check-ico">${a?"✓":"○"}</span><span>Physical edition is a code in a box, no disc.${a?" <strong>Available at retailers now.</strong>":" Available at retailers from Nov 12."}</span></li>
    </ul>
    <a class="btn btn-primary btn-block" href="${e.storeUrl}" target="_blank" rel="noopener">Open on the ${i(e.storeLabel)} ↗</a>
  </section>`}function O(e){return`
  <section class="card" id="timeline">
    <h2>Launch timeline</h2>
    <p class="section-sub">The three dates that matter.</p>
    <ol class="timeline">${$.map(n=>{const s=I(n.date,e),a=s.status==="done"?"tl-done":s.status==="today"?"tl-today":"tl-upcoming",o=s.status==="done"?"✓":s.status==="today"?"●":"○";return`
    <li class="tl-item ${a}">
      <span class="tl-mark" aria-hidden="true">${o}</span>
      <div class="tl-body">
        <p class="tl-head"><span class="tl-date">${i(n.dateLabel)}</span><span class="tl-status">${i(s.label)}</span></p>
        <p class="tl-title">${i(n.title)}</p>
        <p class="tl-detail">${i(n.detail)}</p>
      </div>
    </li>`}).join("")}</ol>
  </section>`}function U(){return`
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
  </section>`}function G(e){return`
  <section class="card card-highlight" id="checklist">
    <h2>After launch: the 100% checklist</h2>
    <p>${e.getTime()>=c.getTime()?"The game is out — the checklist update is coming soon. Missions, collectibles, and 100% completion tracking, built from public community data.":"When the game is out, this app grows a checklist: missions, collectibles, and 100% completion tracking, built from public community data. No spoilers on the home screen — the checklist stays one tap away."}</p>
    <p class="coming-soon">Coming soon in v2 — free update.</p>
  </section>`}function V(){return`
  <section class="card" id="news">
    <h2>Official news</h2>
    <p class="section-sub">Links to official sources — no copied articles, no rumors.</p>
    <ul class="news-list">${A.map(t=>`
    <li>
      <a class="news-link" href="${t.url}" target="_blank" rel="noopener">
        <span class="news-text"><span class="news-title">${i(t.title)}</span><span class="news-detail">${i(t.detail)}</span></span>
        <span class="news-meta"><span class="news-source">${i(t.source)}</span><span class="news-arrow" aria-hidden="true">↗</span></span>
      </a>
    </li>`).join("")}</ul>
  </section>`}function X(){const e=x.map(t=>`<li><strong>${i(t.label)}:</strong> ${i(t.detail)}</li>`).join("");return`
  <section class="card" id="about">
    <h2>About</h2>
    <p class="disclaimer">${i(S)}</p>
    <p>${i(T)} is a fan-made countdown. It collects no data, has no account, and works offline — the countdown, timeline, and facts all live inside the app. News links open the official sites in your browser.</p>
    <h3>Where every fact comes from</h3>
    <ul class="fact-list sources-list">${e}</ul>
    <p class="version">Version ${i(N)} · Free, no ads. A ${E} one-time remove-ads option arrives with the v2 checklist update.</p>
    <p><a href="./privacy.html">Privacy policy</a></p>
  </section>`}function y(e,t){return`
  <header class="app-header">
    <p class="wordmark">COUNTDOWN <span class="wordmark-vi">VI</span></p>
    <p class="tagline">Unofficial fan companion</p>
  </header>
  <main>
    ${R(e)}
    ${P(t,e)}
    ${O(e)}
    ${U()}
    ${G(e)}
    ${V()}
    ${X()}
  </main>
  <footer class="app-footer"><p>${i(S)}</p></footer>`}function B(){const e=document.getElementById("app");if(!e)return;let t=b(C()),n=m().getTime()>=c.getTime();e.innerHTML=y(m(),t),e.addEventListener("click",s=>{var u;const a=s.target,o=(u=a==null?void 0:a.closest)==null?void 0:u.call(a,"[data-platform]");if(!o)return;const l=o.getAttribute("data-platform");if(l!=="ps5"&&l!=="xbox")return;t=b(l),M(l);const r=document.getElementById("unlock");if(r){const p=document.createElement("div");p.innerHTML=P(t,m()),r.replaceWith(p.firstElementChild)}}),window.setInterval(()=>{const s=m(),a=s.getTime()>=c.getTime();if(a!==n){n=a,e.innerHTML=y(s,t);return}if(a)return;const o=v(c,s),l=document.getElementById("cd-days"),r=document.getElementById("cd-hours"),u=document.getElementById("cd-mins"),p=document.getElementById("cd-secs");l&&(l.textContent=String(o.days)),r&&(r.textContent=d(o.hours)),u&&(u.textContent=d(o.minutes)),p&&(p.textContent=d(o.seconds))},1e3)}B();

/* Aggregate visit counter. Read ANALYTICS.md before changing its source or consent rules. */
(function () {
  'use strict';
  if (window.__hendrawantoVisits) return;
  window.__hendrawantoVisits = true;
  const production = ['hendrawanto.com', 'www.hendrawanto.com'].includes(window.location.hostname);
  const path = window.location.pathname.toLowerCase();
  if (!production || /^\/(?:en\/)?(?:desk|newclient|shsnewclientdesk|shsdesk-imbalan-kerja)(?:\/|$)/.test(path) || /\/demo(?:\/|$)/.test(path)) return;

  const urn = 'hendrawanto.com/visits-20261005';
  const sessionKey = 'hendrawanto.visit.activity.v1';
  const sessionWindow = 30 * 60 * 1000;
  const cacheUrl = 'https://raw.githubusercontent.com/Hendraw83/hendrawanto.com/visit-count-data/data/visit-count.json';
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const card = document.querySelector('[data-visit-counter]');
  const number = card && card.querySelector('[data-visit-number]');
  const status = card && card.querySelector('[data-visit-status]');
  const locale = english ? 'en-GB' : 'id-ID';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let target = null;
  let displayed = 0;
  let visible = !('IntersectionObserver' in window);
  let animation = 0;

  function paint(value) {
    number.textContent = new Intl.NumberFormat(locale).format(value);
    displayed = value;
  }

  function animate() {
    if (!number || target === null || !visible) return;
    window.cancelAnimationFrame(animation);
    if (reducedMotion.matches) { paint(target); return; }
    const from = displayed;
    const to = target;
    const start = window.performance.now();
    function frame(now) {
      const progress = Math.min(1, Math.max(0, (now - start) / 1000));
      const ease = 1 - Math.pow(1 - progress, 3);
      paint(Math.round(from + (to - from) * ease));
      if (progress < 1) animation = window.requestAnimationFrame(frame);
    }
    animation = window.requestAnimationFrame(frame);
  }

  if (card && 'IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        visible = true;
        animate();
        observer.disconnect();
      }
    }, {threshold: 0.15});
    observer.observe(card);
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', animate);

  function isSnapshot(data) {
    return data && data.counter === urn && Number.isSafeInteger(data.total) && data.total >= 0 &&
      typeof data.updatedAt === 'string' && Number.isFinite(Date.parse(data.updatedAt)) &&
      Date.parse(data.updatedAt) <= Date.now() + 5 * 60 * 1000;
  }

  async function readSnapshot(url) {
    const response = await window.fetch(url, {
      credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
      signal: window.AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Snapshot unavailable');
    const data = await response.json();
    if (!isSnapshot(data)) throw new Error('Invalid snapshot');
    return data;
  }

  async function refresh() {
    if (!card) return;
    let data;
    let fallback = false;
    // Shared minute buckets refresh CDN caches without a per-visitor identifier.
    try { data = await readSnapshot(cacheUrl + '?refresh=' + Math.floor(Date.now() / 60000)); }
    catch (_) {
      try { data = await readSnapshot('/data/visit-count.json'); fallback = true; }
      catch (_) {
        card.dataset.visitState = 'unavailable';
        number.textContent = '—';
        status.textContent = english ? 'The visit count is temporarily unavailable.' : 'Jumlah kunjungan sementara belum tersedia.';
        return;
      }
    }
    target = data.total;
    const stale = Date.now() - Date.parse(data.updatedAt) > 2 * 60 * 60 * 1000;
    card.dataset.visitState = stale || fallback ? 'cached' : 'ready';
    const date = new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
    }).format(new Date(data.updatedAt));
    status.textContent = (english ? (stale || fallback ? 'Last saved count: ' : 'Updated: ') : (stale || fallback ? 'Salinan terakhir: ' : 'Diperbarui: ')) + date + ' WIB';
    number.setAttribute('aria-label', new Intl.NumberFormat(locale).format(target) + (english ? ' recorded visits' : ' kunjungan tercatat'));
    animate();
  }

  function recordVisit() {
    if (started || window.__hendrawantoStatisticsChoice !== 'allow') return;
    started = true;
    const now = Date.now();
    let last = 0;
    let stored = false;
    try {
      last = Number(window.localStorage.getItem(sessionKey));
      window.localStorage.setItem(sessionKey, String(now));
      stored = true;
    } catch (_) { /* With blocked storage, count only once on the current page. */ }
    if (Number.isFinite(last) && last > 0 && last <= now && now - last < sessionWindow) return;
    const pixel = document.createElement('img');
    pixel.id = 'hendrawanto-visit-pixel';
    pixel.alt = '';
    pixel.width = 1;
    pixel.height = 1;
    pixel.hidden = true;
    pixel.referrerPolicy = 'no-referrer';
    pixel.onload = function () { document.documentElement.dataset.visitRecorded = 'true'; };
    pixel.onerror = function () {
      document.documentElement.dataset.visitRecorded = 'failed';
      if (stored) {
        try {
          if (window.localStorage.getItem(sessionKey) === String(now)) window.localStorage.removeItem(sessionKey);
        } catch (_) { /* No local recovery is available. */ }
      }
    };
    pixel.src = 'https://hits.sh/' + urn + '.svg';
    document.body.appendChild(pixel);
  }

  function applyChoice() {
    if (window.__hendrawantoStatisticsChoice === 'allow') recordVisit();
    else if (window.__hendrawantoStatisticsChoice === 'deny' || window.__hendrawantoStatisticsChoice === null) {
      try { window.localStorage.removeItem(sessionKey); } catch (_) { /* Storage may be blocked. */ }
    }
  }
  window.addEventListener('hendrawanto:statistics-choice', applyChoice);
  applyChoice();
  refresh();
  // A read-only refresh uses the saved aggregate; it never increments a visit.
  if (card) window.addEventListener('pageshow', function (event) { if (event.persisted) refresh(); });
})();

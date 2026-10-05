'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../visits.js'), 'utf8');
const sessionKey = 'hendrawanto.visit.activity.v1';

async function setup(options = {}) {
  const now = Date.now();
  const snapshot = {counter: 'hendrawanto.com/visits-20261005', total: options.total ?? 42, updatedAt: new Date(now).toISOString()};
  const storage = new Map(options.last ? [[sessionKey, String(options.last)]] : []);
  const parts = {};
  const card = {dataset: {}, querySelector(selector) { return parts[selector] ||= {textContent: '', attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }}; }};
  const document = {
    documentElement: {lang: options.lang || 'id', dataset: {}},
    querySelector: () => options.noCard ? null : card,
    createElement: tag => ({tagName: tag}),
    body: {children: [], appendChild(child) { this.children.push(child); }}
  };
  const requests = [];
  const window = {
    location: {hostname: options.host || 'hendrawanto.com', pathname: options.route || '/'},
    __hendrawantoStatisticsChoice: options.choice,
    listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; },
    localStorage: {
      getItem(key) { if (options.blockStorage) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (options.blockStorage) throw Error('blocked'); storage.set(key, value); },
      removeItem(key) { storage.delete(key); }
    },
    matchMedia: () => ({matches: options.reducedMotion ?? true, addEventListener() {}}),
    performance: {now: () => 0},
    requestAnimationFrame(callback) { callback(1000); return 1; }, cancelAnimationFrame() {},
    AbortSignal,
    async fetch(url, settings) {
      requests.push({url, settings});
      if (options.offline || options.remoteFails && url.startsWith('https:')) throw Error('offline');
      return {ok: true, json: async () => snapshot};
    }
  };
  const context = {window, document, Date, Intl, Number};
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return {window, document, storage, card, parts, requests, context};
}

(async function () {
  for (const choice of [null, 'deny', 'paused']) {
    const page = await setup({choice});
    assert.equal(page.document.body.children.length, 0, 'no third-party hit without consent');
    assert.equal(page.parts['[data-visit-number]'].textContent, '42', 'everyone sees the shared aggregate');
    assert.equal(page.requests.length, 1, 'reading the total does not increment it');
    assert.equal(page.requests[0].settings.credentials, 'omit');
    assert.equal(page.requests[0].settings.referrerPolicy, 'no-referrer');
    assert.equal(page.storage.has(sessionKey), false, 'no visit timestamp before consent');
  }
  const fresh = await setup({choice: 'allow', reducedMotion: false});
  assert.equal(fresh.document.body.children.length, 1);
  const pixel = fresh.document.body.children[0];
  assert.equal(pixel.src, 'https://hits.sh/hendrawanto.com/visits-20261005.svg');
  assert.equal(pixel.referrerPolicy, 'no-referrer');
  assert.equal(pixel.hidden, true);
  assert.equal(fresh.parts['[data-visit-number]'].textContent, '42', 'animation ends on the actual shared value');
  vm.runInNewContext(source, fresh.context);
  fresh.window.listeners['hendrawanto:statistics-choice']();
  assert.equal(fresh.document.body.children.length, 1, 'duplicate script/consent does not increment again');
  pixel.onload();
  assert.equal(fresh.document.documentElement.dataset.visitRecorded, 'true');
  pixel.onerror();
  assert.equal(fresh.storage.has(sessionKey), false, 'failed recording can retry on a subsequent visit');
  const recent = await setup({choice: 'allow', last: Date.now() - 10 * 60000, total: 1234});
  assert.equal(recent.document.body.children.length, 0, 'reload and language changes within the activity window are not new visits');
  assert.equal(recent.parts['[data-visit-number]'].textContent, '1.234', 'count comes from shared data, not the local timestamp');
  assert.equal((await setup({choice: 'allow', last: Date.now() - 31 * 60000})).document.body.children.length, 1, 'new visit after inactivity');
  assert.equal((await setup({choice: 'allow', blockStorage: true})).document.body.children.length, 1, 'blocked storage records at most once per page');
  const later = await setup();
  later.window.__hendrawantoStatisticsChoice = 'allow';
  later.window.listeners['hendrawanto:statistics-choice']();
  assert.equal(later.document.body.children.length, 1, 'acceptance on an open page starts counting');
  later.window.__hendrawantoStatisticsChoice = 'deny';
  later.window.listeners['hendrawanto:statistics-choice']();
  assert.equal(later.storage.has(sessionKey), false, 'revocation clears visit activity');
  const cached = await setup({remoteFails: true});
  assert.equal(cached.card.dataset.visitState, 'cached');
  assert.equal(cached.requests.length, 2, 'a failed data service falls back to the published snapshot');
  const offline = await setup({offline: true});
  assert.equal(offline.parts['[data-visit-number]'].textContent, '—', 'failure never fabricates a zero');
  assert.equal(offline.card.dataset.visitState, 'unavailable');
  assert.equal((await setup({total: -2})).card.dataset.visitState, 'unavailable', 'invalid shared values are rejected');
  assert.match((await setup({lang: 'en'})).parts['[data-visit-status]'].textContent, /Updated:/);
  for (const options of [{host: 'localhost'}, {route: '/desk/'}, {route: '/newclient/'}, {route: '/en/tools/pajak-tangguhan/demo/'}]) {
    const excluded = await setup({...options, choice: 'allow'});
    assert.equal(excluded.requests.length, 0);
    assert.equal(excluded.document.body.children.length, 0);
  }
  const {parseTotal} = await import('./update-visit-count.mjs');
  assert.equal(parseTotal({total: 23}, 200), 23);
  assert.equal(parseTotal(null, 404), 0);
  for (const [data, code] of [[{total: '23'}, 200], [{total: -1}, 200], [null, 500]]) assert.throws(() => parseTotal(data, code));
  console.log('Shared totals, consent, inactivity window, reduced motion, exclusions, failures and source validation: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });

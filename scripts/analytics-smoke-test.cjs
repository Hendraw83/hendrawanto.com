'use strict';
// Network-free checks of consent boundaries and the payload queued for GA4.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');
const key = 'hendrawanto.analytics.v1';
const disable = 'ga-disable-G-ZPRBG3X1JL';
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.listeners = {}; this.parts = {}; this.hidden = false; }
  setAttribute(name, value) { this[name] = value; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(selector) { return this.parts[selector] ||= new Element('button'); }
  addEventListener(name, handler) { this.listeners[name] = handler; }
}
function setup(options = {}) {
  const document = {documentElement: {lang: options.lang || 'id', dataset: {}}, head: new Element('head'), body: new Element('body'), readyState: 'complete', title: 'Public page', referrer: options.referrer || 'https://example.com/private?email=someone@example.com'};
  const footer = new Element('footer');
  const storage = new Map(options.choice ? [[key, JSON.stringify({choice: options.choice, at: options.at ?? Date.now()})]] : []);
  const window = {location: {hostname: options.host || 'hendrawanto.com', origin: 'https://' + (options.host || 'hendrawanto.com'), pathname: options.path || '/artikel/', href: 'https://hendrawanto.com/artikel/?q=private#secret', reload() { window.reloads++; }}, reloads: 0, listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; }, localStorage: {getItem(name) { if (options.blockStorage) throw Error('blocked'); return storage.get(name) ?? null; }, setItem(name, value) { if (options.blockStorage) throw Error('blocked'); storage.set(name, value); }}};
  document.cookie = 'he_ga=example; he_ga_ZPRBG3X1JL=example';
  document.createElement = tag => new Element(tag);
  document.querySelector = () => footer;
  document.addEventListener = () => {};
  const context = {window, document, URL, Date};
  vm.runInNewContext(source, context);
  return {window, document, context, storage, footer, banner: document.body.children[0]};
}

const fresh = setup();
assert.equal(fresh.document.head.children.length, 0, 'no Google request before consent');
assert.equal(fresh.window.dataLayer, undefined, 'no Analytics queue before consent');
fresh.banner.querySelector('[data-analytics-allow]').listeners.click();
assert.equal(fresh.document.head.children.length, 1);
assert.equal(fresh.document.head.children[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-ZPRBG3X1JL');
const config = Array.from(fresh.window.dataLayer.find(item => item[0] === 'config'));
assert.equal(config[1], 'G-ZPRBG3X1JL');
assert.equal(config[2].page_location, 'https://hendrawanto.com/artikel/');
assert.equal(config[2].page_referrer, 'https://example.com/');
assert.equal(config[2].allow_google_signals, false);
assert.equal(config[2].allow_ad_personalization_signals, false);
assert.equal(config[2].cookie_expires, 180 * 24 * 60 * 60);
vm.runInNewContext(source, fresh.context);
assert.equal(fresh.document.head.children.length, 1, 'duplicate loader does not create a second tag');
fresh.document.head.children[0].onload();
assert.equal(fresh.document.documentElement.dataset.analyticsState, 'tag-loaded');

const denied = setup({choice: 'deny'});
assert.equal(denied.document.head.children.length, 0);
assert.equal(denied.window[disable], true);
assert.equal(denied.banner.hidden, true);
assert.equal(setup({choice: 'allow'}).document.head.children.length, 1, 'remembered acceptance resumes');
assert.equal(setup({choice: 'allow', at: Date.now() - 181 * 24 * 60 * 60 * 1000}).document.head.children.length, 0, 'expired acceptance does not resume');
assert.equal(setup({choice: 'allow', at: Date.now() + 100000}).document.head.children.length, 0, 'future timestamps do not resume');
for (const path of ['/newclient/', '/desk/', '/SHSNewClientDesk/kantor/', '/shsdesk-imbalan-kerja/', '/tools/imbalan-kerja/demo/', '/en/tools/pajak-tangguhan/demo/']) {
  const page = setup({path, choice: 'allow'});
  assert.equal(page.document.head.children.length, 0, 'operational route ' + path);
  assert.equal(page.document.body.children.length, 0);
}
assert.equal(setup({host: 'localhost', choice: 'allow'}).document.head.children.length, 0, 'preview sends no data');
const blockedStorage = setup({blockStorage: true});
assert.equal(blockedStorage.document.head.children.length, 0);
blockedStorage.banner.querySelector('[data-analytics-allow]').listeners.click();
assert.equal(blockedStorage.document.head.children.length, 1, 'current-page consent still works with blocked storage');

fresh.window.listeners.input();
assert.equal(fresh.window[disable], true, 'form input pauses collection');
const message = setup({choice: 'allow'});
message.window.listeners.click({target: {closest: () => ({href: 'https://wa.me/628123?text=private'})}});
assert.equal(message.window[disable], true, 'message link pauses collection');
const revoked = setup({choice: 'allow'});
revoked.banner.querySelector('[data-analytics-deny]').listeners.click();
assert.equal(revoked.window[disable], true);
assert.equal(JSON.parse(revoked.storage.get(key)).choice, 'deny');
assert.equal(revoked.window.reloads, 1, 'revocation reloads without the Google tag');
assert.match(revoked.document.cookie, /max-age=0/);
assert.match(setup({lang: 'en'}).banner.innerHTML, /Allow visit statistics/);
console.log('Analytics consent, exclusions, sanitized URLs, duplicate loading, input pause and revocation: PASS');

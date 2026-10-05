const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

async function workerTest(folder, namespace) {
  const events = {}, deleted = [], opened = [];
  const scope = 'https://hendrawanto.com/' + folder + '/';
  const self = {
    location: { origin: 'https://hendrawanto.com' }, registration: { scope },
    clients: { claim: async () => {} }, skipWaiting: async () => {},
    addEventListener: (name, handler) => { events[name] = handler; }
  };
  const cache = { addAll: async () => {}, put: async () => {}, match: async () => 'own-cache-result' };
  const caches = {
    keys: async () => ['unrelated-application', 'shs-desk-other-v8', 'shs-desk-' + namespace + '-v2', 'shs-desk-' + namespace + '-v3'],
    delete: async key => { deleted.push(key); },
    open: async key => { opened.push(key); return cache; }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', folder, 'sw.js'), 'utf8'), {
    self, caches, URL, fetch: async () => { throw new Error('offline'); }
  });
  let activation;
  events.activate({ waitUntil: task => { activation = task; } });
  await activation;
  assert.deepEqual(deleted, ['shs-desk-' + namespace + '-v2'], 'Activation must preserve other apps caches');
  for (const url of ['https://script.google.com/macros/example', 'https://hendrawanto.com/privasi/', 'https://hendrawanto.com/' + folder + '-other/index.html']) {
    let responded = false;
    events.fetch({ request: { method: 'GET', url }, respondWith: () => { responded = true; } });
    assert.equal(responded, false, 'Worker must not intercept another app or origin');
  }
  let response;
  events.fetch({ request: { method: 'GET', url: scope + 'index.html' }, respondWith: task => { response = task; } });
  assert.equal(await response, 'own-cache-result', 'Offline fallback must come from this apps cache');
  assert(opened.every(key => key === 'shs-desk-' + namespace + '-v3'));
}

(async () => {
  await workerTest('desk', 'main');
  await workerTest('SHSNewClientDesk/kantor', 'kantor');
  console.log('PASS: cache isolation, request scope and offline fallback for both app shells.');
})().catch(error => { console.error(error); process.exitCode = 1; });

#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { createHash } from 'node:crypto';
import { root, origin, filesBelow, attr, assetPath, resourceTags, policyFor, sri } from './security-policy.mjs';

const live = process.argv.includes('--live');
const errors = [], warnings = [], pages = [];
const fail = (page, message) => errors.push(`${page}: ${message}`);

function inspect(html, page, prefix = '', checkSri = true) {
  const tags = resourceTags(html);
  const metas = tags.filter(tag => /^<meta\b/i.test(tag));
  const csps = metas.filter(tag => attr(tag, 'http-equiv').toLowerCase() === 'content-security-policy');
  const policy = csps.length === 1 ? attr(csps[0], 'content') : '';
  if (csps.length !== 1 || policy !== policyFor(html, page)) fail(prefix + page, 'CSP missing or differs from the reviewed policy');
  const cspPos = csps.length ? html.indexOf(csps[0]) : -1;
  const firstResource = html.search(/<(?:script|link|style)\b/i);
  if (cspPos < 0 || (firstResource >= 0 && cspPos > firstResource)) fail(prefix + page, 'CSP must precede resource loading');
  if (!metas.some(tag => attr(tag, 'name').toLowerCase() === 'referrer' && ['no-referrer', 'strict-origin-when-cross-origin'].includes(attr(tag, 'content')))) fail(prefix + page, 'Referrer policy missing');
  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\//.test(html)) fail(prefix + page, 'Legacy SheetJS loaded by the demo');

  for (const tag of tags) {
    if (/\s+on[a-z]+\s*=/i.test(tag)) fail(prefix + page, 'Inline HTML event handler blocked by CSP');
    for (const name of ['src', 'href', 'action', 'poster']) {
      const value = attr(tag, name);
      if (/^(?:http:|javascript:|\/\/)/i.test(value)) fail(prefix + page, 'Insecure resource/link URL');
    }
    if (/^<base\b/i.test(tag)) fail(prefix + page, 'Unexpected base element');
    if (/^<iframe\b/i.test(tag) && attr(tag, 'referrerpolicy') !== 'no-referrer') fail(prefix + page, 'Iframe must not expose the parent URL');
    if (/^<a\b/i.test(tag) && attr(tag, 'target') === '_blank' && !attr(tag, 'rel').split(/\s+/).includes('noopener')) fail(prefix + page, 'New-tab link lacks noopener');
    const url = /^<script\b/i.test(tag) ? attr(tag, 'src') : /^<link\b/i.test(tag) && attr(tag, 'rel') === 'stylesheet' ? attr(tag, 'href') : '';
    if (!url) continue;
    const asset = assetPath(url, page);
    if (!asset) {
      if (/^<link\b/i.test(tag) && url.startsWith('https://fonts.googleapis.com/css2?') && /\/demo\//.test('/' + page)) continue;
      fail(prefix + page, 'Unexpected external static script/stylesheet'); continue;
    }
    try { if (checkSri && attr(tag, 'integrity') !== sri(asset)) fail(prefix + page, 'Asset integrity hash missing or stale'); }
    catch (_) { fail(prefix + page, 'Referenced asset missing'); }
  }
}

for (const file of filesBelow().filter(file => file.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8'), page = relative(root, file);
  if (!/<head\b/i.test(html)) continue;
  pages.push(page); inspect(html, page);
}

// Inspect first-party source without ever printing a matched secret.
const secretPatterns = [ /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{32,}\b/, /\bgithub_pat_[A-Za-z0-9_]{40,}\b/, /\bAKIA[A-Z0-9]{16}\b/ ];
for (const file of filesBelow().filter(file => /\.(?:html|js|mjs|cjs|json|ya?ml|env)$/.test(file))) {
  const page = relative(root, file);
  if (page.startsWith('scripts/')) continue; // Patterns and negative fixtures belong here.
  const text = readFileSync(file, 'utf8');
  if (secretPatterns.some(pattern => pattern.test(text))) fail(page, 'Possible embedded credential; value withheld');
}

for (const page of ['desk/sw.js', 'SHSNewClientDesk/kantor/sw.js']) {
  const text = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
  if (!text.includes('url.pathname.startsWith(scope.pathname)') || !text.includes('k.startsWith(CACHE_PREFIX)')) fail(page, 'Service worker cache must be scoped to its app');
}

if (live) {
  // Compare hashes with the bytes actually served, not a newer un-deployed checkout.
  const queue = [...pages];
  const assets = new Map();
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const page = queue.shift(), path = '/' + page.replace(/index\.html$/, '');
      try {
        const response = await fetch(origin + path, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
        if (!response.ok || new URL(response.url).origin !== origin) { fail('live/' + page, 'Unexpected HTTP status or redirect origin'); continue; }
        const html = await response.text();
        inspect(html, page, 'live/', false);
        for (const tag of resourceTags(html)) {
          const source = /^<script\b/i.test(tag) ? attr(tag, 'src') : /^<link\b/i.test(tag) && attr(tag, 'rel') === 'stylesheet' ? attr(tag, 'href') : '';
          if (!source || !assetPath(source, page)) continue;
          const assetUrl = new URL(source, origin + '/' + page).href;
          if (!assets.has(assetUrl)) assets.set(assetUrl, (async () => {
            const assetResponse = await fetch(assetUrl, { signal: AbortSignal.timeout(20000) });
            if (!assetResponse.ok) throw new Error('Asset HTTP error');
            return 'sha384-' + createHash('sha384').update(Buffer.from(await assetResponse.arrayBuffer())).digest('base64');
          })());
          try { if (attr(tag, 'integrity') !== await assets.get(assetUrl)) fail('live/' + page, 'Served asset differs from its integrity hash'); }
          catch (_) { fail('live/' + page, 'Live asset integrity could not be checked'); }
        }
      } catch (_) { fail('live/' + page, 'HTTP fetch failed'); }
    }
  }));
  try {
    const response = await fetch('http://hendrawanto.com/', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (![301, 302, 307, 308].includes(response.status) || !response.headers.get('location')?.startsWith(origin + '/')) fail('live/http', 'HTTP does not redirect to canonical HTTPS');
  } catch (_) { fail('live/http', 'Redirect could not be checked'); }
  try {
    const response = await fetch(origin + '/', { signal: AbortSignal.timeout(15000) });
    for (const header of ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'permissions-policy']) {
      if (!response.headers.get(header)) warnings.push(`Server header absent: ${header}; HTML meta does not supply this header`);
    }
  } catch (_) { warnings.push('Server headers unavailable'); }
}

warnings.push('PDF demo loads two specifically allowed CDN scripts; versions/advisories require separate review, not a claim of being vulnerability-free.');
warnings.push('Backend Apps Script authorization, account MFA, WAF and repository historical secrets are outside this static check.');
console.log(`Security audit: ${pages.length} HTML pages; errors=${errors.length}; warnings=${warnings.length}; live=${live}.`);
for (const message of errors) console.error('ERROR ' + message);
for (const message of warnings) console.warn('WARN ' + message);
if (errors.length) process.exitCode = 1;

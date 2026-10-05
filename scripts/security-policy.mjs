import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const origin = 'https://hendrawanto.com';
export const pdfLibraries = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/5.0.8/jspdf.plugin.autotable.min.js'
];

export function filesBelow(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

export function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

export function resourceTags(html) {
  return html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .match(/<[a-z][^>]*>/gi) ?? [];
}

export function assetPath(url, page) {
  const parsed = new URL(url, new URL(page, origin + '/'));
  if (parsed.origin !== origin) return null;
  const path = resolve(root, '.' + decodeURIComponent(parsed.pathname));
  if (!path.startsWith(root + '/')) throw new Error('Asset escapes the site root');
  return path;
}

function setAttr(tag, name, value) {
  const pattern = new RegExp(`\\s+${name}\\s*=\\s*(["'])(.*?)\\1`, 'ig');
  return tag.replace(pattern, '').replace(/\s*\/?\s*>$/, ` ${name}="${value}">`);
}

export function scriptHash(script) {
  return 'sha256-' + createHash('sha256').update(script.replace(/\r\n?/g, '\n')).digest('base64');
}

export function sri(file) {
  return 'sha384-' + createHash('sha384').update(readFileSync(file)).digest('base64');
}

export function policyFor(html, page) {
  const demo = /\/demo\//.test('/' + page);
  const analytics = /<script\b[^>]*src=["']\/analytics\.js\b/i.test(html);
  const scripts = ["'self'"];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!attr('<script ' + match[1] + '>', 'src') && match[2].trim()) scripts.push("'" + scriptHash(match[2]) + "'");
  }
  if (analytics) scripts.push('https://www.googletagmanager.com/gtag/js');
  if (demo) scripts.push(...pdfLibraries);
  const frames = [];
  if (html.includes('https://www.youtube-nocookie.com/embed/')) frames.push('https://www.youtube-nocookie.com');
  if (html.includes('https://script.google.com/')) frames.push('https://script.google.com', 'https://script.googleusercontent.com', 'https://accounts.google.com');
  const connects = ["'self'"];
  const images = ["'self'", 'data:', 'blob:'];
  if (analytics) {
    connects.push('https://*.google-analytics.com', 'https://www.googletagmanager.com', 'https://*.google.com', 'https://raw.githubusercontent.com');
    images.push('https://hits.sh', 'https://*.google-analytics.com', 'https://www.googletagmanager.com');
  }
  return [
    "default-src 'self'", "base-uri 'none'", "object-src 'none'",
    'script-src ' + [...new Set(scripts)].join(' '), "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'" + (demo ? ' https://fonts.googleapis.com' : ''),
    "font-src 'self'" + (demo ? ' https://fonts.gstatic.com' : ''),
    'img-src ' + images.join(' '), 'connect-src ' + connects.join(' '),
    'frame-src ' + (frames.join(' ') || "'none'"),
    "form-action 'self'", "media-src 'self' blob:", "worker-src 'self' blob:",
    "manifest-src 'self'", 'upgrade-insecure-requests'
  ].join('; ');
}

export function harden(html, page) {
  html = html.replace(/\s*<!-- security-baseline:start -->[\s\S]*?<!-- security-baseline:end -->\s*/g, '\n');
  html = html.replace(/<meta\b[^>]*(?:http-equiv=["']Content-Security-Policy["']|name=["']referrer["'])[^>]*>\s*/gi, '');
  html = html.replace(/<(script|link)\b[^>]*>/gi, tag => {
    const url = /^<script/i.test(tag) ? attr(tag, 'src') : attr(tag, 'rel').toLowerCase() === 'stylesheet' ? attr(tag, 'href') : '';
    if (!url) return tag;
    const asset = assetPath(url, page);
    if (!asset) return tag;
    if (!existsSync(asset)) throw new Error(`${page}: missing asset ${url}`);
    return setAttr(setAttr(tag, 'integrity', sri(asset)), 'crossorigin', 'anonymous');
  });
  const referrer = /^(?:desk|newclient|SHSNewClientDesk)\//i.test(page) ? 'no-referrer' : 'strict-origin-when-cross-origin';
  const block = `\n<!-- security-baseline:start -->\n<meta http-equiv="Content-Security-Policy" content="${policyFor(html, page)}">\n<meta name="referrer" content="${referrer}">\n<!-- security-baseline:end -->\n`;
  const charset = /<meta\b[^>]*charset\s*=\s*["']?utf-8["']?[^>]*>/i;
  const charsetTag = html.match(charset)?.[0] ?? '<meta charset="utf-8">';
  html = html.replace(charset, '');
  return html.replace(/(<head\b[^>]*>)\s*/i, (_, head) => head + '\n' + charsetTag + block);
}

export function applyPolicies() {
  let changed = 0, pages = 0;
  for (const file of filesBelow().filter(path => path.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    if (!/<head\b/i.test(html)) continue; // Keep Google's exact verification response unchanged.
    const hardened = harden(html, relative(root, file));
    pages++;
    if (hardened !== html) { writeFileSync(file, hardened); changed++; }
  }
  return { pages, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--apply')) throw new Error('Use --apply after reviewing the code and diff; never run this blindly on other work.');
  console.log(JSON.stringify(applyPolicies()));
}

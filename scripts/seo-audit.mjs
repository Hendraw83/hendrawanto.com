#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://hendrawanto.com";
const liveMode = process.argv.includes("--live");
const errors = [];
const warnings = [];

function filesBelow(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] ?? "";
}

function meta(html, name) {
  const tag = tags(html, "meta").find((item) => attribute(item, "name").toLowerCase() === name);
  return tag ? attribute(tag, "content") : "";
}

function canonical(html) {
  const tag = tags(html, "link").find((item) =>
    attribute(item, "rel").toLowerCase().split(/\s+/).includes("canonical")
  );
  return tag ? attribute(tag, "href") : "";
}

function localPath(urlOrPath) {
  const url = new URL(urlOrPath, origin);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  return join(root, pathname.replace(/^\//, ""));
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const urlSet = new Set(urls);
const htmlFiles = filesBelow(root).filter((file) => file.endsWith("index.html"));
const descriptions = new Map();

if (urlSet.size !== urls.length) errors.push("Duplicate URLs in sitemap");
if (!readFileSync(join(root, "robots.txt"), "utf8").includes(origin + "/sitemap.xml")) {
  errors.push("robots.txt does not point to the sitemap");
}
if (!meta(readFileSync(join(root, "newclient/index.html"), "utf8"), "robots").toLowerCase().includes("noindex")) {
  errors.push("New-client form wrapper must be noindex");
}

for (const url of urls) {
  if (!url.startsWith(origin + "/")) {
    errors.push(`Unexpected sitemap origin: ${url}`);
    continue;
  }
  const file = localPath(url);
  if (!existsSync(file)) {
    errors.push(`Sitemap points to a missing file: ${url}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const robots = meta(html, "robots").toLowerCase();
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim() ?? "";
  const description = meta(html, "description");
  const pageCanonical = canonical(html);
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  if (robots.includes("noindex")) errors.push(`Noindex URL in sitemap: ${url}`);
  if (!title) errors.push(`Missing title: ${url}`);
  if (!description) errors.push(`Missing meta description: ${url}`);
  if (pageCanonical !== url) errors.push(`Canonical mismatch: ${url} -> ${pageCanonical || "missing"}`);
  if (h1Count !== 1) errors.push(`Expected one H1, found ${h1Count}: ${url}`);
  if (title.length > 70) warnings.push(`Long title (${title.length}): ${url}`);
  if (description && (description.length < 70 || description.length > 170)) {
    warnings.push(`Meta description length ${description.length}: ${url}`);
  }

  for (const script of [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]) {
    try {
      const data = JSON.parse(script[1]);
      for (const node of data["@graph"] ?? [data]) {
        if (node["@type"] === "ProfilePage" && node.dateModified &&
            !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(node.dateModified)) {
          errors.push(`Invalid ProfilePage.dateModified: ${url}`);
        }
      }
    } catch (error) {
      errors.push(`Invalid JSON-LD: ${url} (${error.message})`);
    }
  }

  if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), url]);

  const counterpart = url.includes(origin + "/en/")
    ? url.replace(origin + "/en/", origin + "/")
    : url.replace(origin + "/", origin + "/en/");
  if (urlSet.has(counterpart)) {
    const alternates = tags(html, "link").filter((item) => attribute(item, "rel").toLowerCase() === "alternate");
    if (!alternates.some((item) => attribute(item, "href") === counterpart)) {
      errors.push(`Missing bilingual alternate: ${url} -> ${counterpart}`);
    }
  }
}

for (const [, duplicateUrls] of descriptions) {
  if (duplicateUrls.length > 1) warnings.push(`Duplicate meta description: ${duplicateUrls.join(", ")}`);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const tag of tags(html, "a")) {
    const href = attribute(tag, "href");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const target = localPath(href);
    if (!existsSync(target)) errors.push(`Broken internal link in ${relative(root, file)}: ${href}`);
  }
}

if (liveMode) {
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
      return { url, status: response.status, finalUrl: response.url };
    } catch (error) {
      return { url, status: 0, error: error.message };
    }
  }));
  for (const result of results) {
    if (result.status !== 200 || result.finalUrl !== result.url) {
      errors.push(`Live URL failed: ${result.url} (${result.status || result.error}; final ${result.finalUrl || "n/a"})`);
    }
  }
}

console.log(`SEO audit: ${urls.length} sitemap URLs; ${htmlFiles.length} HTML entry points.`);
console.log(`Errors: ${errors.length}; warnings: ${warnings.length}; live check: ${liveMode ? "enabled" : "skipped"}.`);
for (const item of errors) console.error(`ERROR ${item}`);
for (const item of warnings) console.warn(`WARN  ${item}`);
if (errors.length) process.exitCode = 1;

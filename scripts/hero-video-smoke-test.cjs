"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const script = fs.readFileSync(path.join(__dirname, "../hero-video.js"), "utf8");
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function target(fields = {}) {
  const listeners = new Map();
  return Object.assign(fields, {
    addEventListener(name, fn) {
      const list = listeners.get(name) || [];
      list.push(fn);
      listeners.set(name, list);
    },
    emit(name, value) { (listeners.get(name) || []).forEach(fn => fn(value)); },
  });
}

function setup({ reduced = false, saveData = false, blocked = false, deferred = false } = {}) {
  const source = { dataset: { src: "/assets/video/hendrawanto-office-20261005.mp4" } };
  const label = { textContent: "" };
  const button = target({
    hidden: true, dataset: { startLabel: "Putar animasi", pauseLabel: "Jeda animasi" },
    querySelector: () => label,
  });
  const promises = [];
  const video = target({
    paused: true, plays: 0, loads: 0, blocked,
    querySelector: () => source,
    load() { this.loads++; },
    play() {
      this.plays++;
      if (this.blocked) return Promise.reject(new Error("Autoplay blocked"));
      this.paused = false;
      if (deferred) return new Promise((resolve, reject) => promises.push({ resolve, reject }));
      this.emit("playing");
      return Promise.resolve();
    },
    pause() {
      if (!this.paused) { this.paused = true; this.emit("pause"); }
    },
  });
  const section = {
    dataset: {}, getBoundingClientRect: () => ({ top: 80, bottom: 790 }),
    querySelector: selector => selector === "video" ? video : button,
  };
  const motion = target({ matches: reduced });
  const connection = target({ saveData });
  const document = target({ hidden: false, querySelector: () => section });
  let intersection;
  const window = target({
    innerHeight: 900, matchMedia: () => motion,
    IntersectionObserver: function (callback) {
      intersection = callback;
      this.observe = () => {};
    },
  });
  vm.runInNewContext(script, {
    window, document, navigator: { connection },
    IntersectionObserver: window.IntersectionObserver, Promise,
  });
  return { source, label, button, video, section, motion, connection, document, window, promises,
    visible(value) { intersection([{ isIntersecting: value, intersectionRatio: value ? .6 : 0 }]); },
  };
}

(async () => {
  const normal = setup();
  await flush();
  assert.equal(normal.video.muted, true);
  assert.equal(normal.video.defaultMuted, true);
  assert.equal(normal.video.loads, 1);
  assert.equal(normal.video.paused, false);
  assert.equal(normal.label.textContent, "Jeda animasi");
  normal.button.emit("click");
  normal.document.hidden = true;
  normal.document.emit("visibilitychange");
  normal.document.hidden = false;
  normal.document.emit("visibilitychange");
  normal.visible(false);
  normal.visible(true);
  assert.equal(normal.video.plays, 1, "A user pause must survive visibility changes");
  assert.equal(normal.label.textContent, "Putar animasi");
  normal.button.emit("click");
  await flush();
  normal.visible(false);
  assert.equal(normal.video.paused, true);
  normal.visible(true);
  await flush();
  assert.equal(normal.video.paused, false);
  assert.equal(normal.video.loads, 1, "Visibility changes must not reload the asset");
  normal.document.hidden = true;
  normal.document.emit("visibilitychange");
  assert.equal(normal.video.paused, true);
  normal.document.hidden = false;
  normal.document.emit("visibilitychange");
  await flush();
  assert.equal(normal.video.paused, false);

  for (const option of [{ reduced: true }, { saveData: true }]) {
    const staticView = setup(option);
    await flush();
    assert.equal(staticView.source.src, undefined, "Static preference must prevent video download");
    assert.equal(staticView.video.plays, 0);
    assert.equal(staticView.label.textContent, "Putar animasi");
    staticView.button.emit("click");
    await flush();
    assert.equal(staticView.video.paused, false, "Explicit play may opt into animation");
    staticView.motion.matches = true;
    staticView.motion.emit("change");
    assert.equal(staticView.video.paused, true, "A new motion preference must be respected");
  }

  const blocked = setup({ blocked: true });
  await flush();
  assert.equal(blocked.label.textContent, "Putar animasi");
  assert.equal(blocked.button.hidden, false);
  blocked.video.blocked = false;
  blocked.button.emit("click");
  await flush();
  assert.equal(blocked.video.paused, false, "A blocked autoplay can be retried by the visitor");
  blocked.video.emit("error");
  assert.equal(blocked.section.dataset.videoReady, "false");
  assert.equal(blocked.button.hidden, true);
  assert.equal(blocked.video.paused, true);

  const loading = setup({ deferred: true });
  loading.visible(false);
  loading.visible(true);
  assert.equal(loading.promises.length, 2);
  loading.promises[0].reject(new Error("The previous play was interrupted"));
  await flush();
  loading.video.emit("playing");
  loading.promises[1].resolve();
  await flush();
  assert.equal(loading.video.paused, false, "An obsolete play promise must not cancel a new play");
  assert.equal(loading.label.textContent, "Jeda animasi");

  for (const page of ["index.html", "en/index.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", page), "utf8");
    assert.equal((html.match(/data-hero-video(?=[ >])/g) || []).length, 1);
    assert.match(html, /<video[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b[^>]*preload="none"/);
    assert.doesNotMatch(html.match(/<video[\s\S]*?<\/video>/)[0], /\bautoplay\b|<source\s+src=/);
    assert.match(html, /aria-controls="hero-bg-video"/);
    assert.match(html, /data-src="\/assets\/video\/hendrawanto-office-20261005\.mp4"/);
    assert.match(html, /href="\/hero-video\.css\?v=20261005-hero"/);
    assert.match(html, /src="\/hero-video\.js\?v=20261005-hero" defer/);
    assert.ok(html.indexOf("hero-video.css") > html.indexOf("styles.css"), "Scoped video styles load after shared styles");
  }
  console.log("Hero video: playback, pause persistence, visibility, motion/data preferences, autoplay failure, loading race and ID/EN markup passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });

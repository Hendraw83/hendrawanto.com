// Homepage name block: red line under the name follows the background video's playback (Claude, 2026-10-05).
// Reads the existing video only; playback is still controlled by hero-video.js.
(() => {
  const block = document.querySelector("[data-hero-name]");
  const video = document.getElementById("hero-bg-video");
  if (!block || !video) return;
  const reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let frame = 0;
  const set = (p) => block.style.setProperty("--hn-p", String(Math.max(0, Math.min(1, p))));
  const tick = () => {
    frame = 0;
    if (video.duration > 0) set(video.currentTime / video.duration);
    if (!video.paused && !video.ended) frame = requestAnimationFrame(tick);
  };
  const start = () => {
    block.dataset.progress = "on";
    if (reduce && reduce.matches) { set(1); return; }
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    tick();
  };
  // Fit text widths: credentials = width of the name, role line = width of the red line (block width).
  const nameEl = block.querySelector(".hn-name span");
  const credEl = block.querySelector(".hn-cred");
  const roleEl = block.querySelector(".hn-role");
  const fitTo = (el, target) => {
    if (!el || !(target > 0)) return;
    el.style.fontSize = "";
    for (let i = 0; i < 3; i++) {
      const w = el.getBoundingClientRect().width;
      if (!(w > 0)) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = (fs * target / w).toFixed(2) + "px";
    }
  };
  const fit = () => {
    if (!nameEl) return;
    const nameW = nameEl.getBoundingClientRect().width;
    fitTo(credEl, nameW);
    fitTo(roleEl, block.clientWidth);
  };
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; fit(); } });
  block.dataset.progress = "off";
  video.addEventListener("playing", start);
  video.addEventListener("pause", stop);
  video.addEventListener("seeked", tick);
  video.addEventListener("timeupdate", () => { if (!video.paused && !frame) start(); });
  video.addEventListener("error", () => { stop(); block.dataset.progress = "off"; });
  if (!video.paused && video.readyState > 2) start();
})();

(() => {
  "use strict";
  const section = document.querySelector("[data-hero-video]");
  if (!section) return;
  const video = section.querySelector("video");
  const source = video?.querySelector("source[data-src]");
  const button = section.querySelector(".hero-video-toggle");
  const label = button?.querySelector(".hero-video-toggle-label");
  if (!video || !source || !button || !label) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  const bounds = section.getBoundingClientRect();
  let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
  let userPaused = false;
  let optedIn = false;
  let loaded = false;
  let pending = false;
  let attempt = 0;
  let failed = false;
  video.muted = true;
  video.defaultMuted = true;
  button.hidden = false;

  const mayPlay = () => !failed && !userPaused && inView && !document.hidden &&
    (optedIn || (!motion.matches && !connection?.saveData));

  function render() {
    const playing = !video.paused || (pending && mayPlay());
    button.dataset.state = playing ? "playing" : "paused";
    label.textContent = playing ? button.dataset.pauseLabel : button.dataset.startLabel;
  }

  function pausePlayback() {
    if (pending) {
      attempt += 1;
      pending = false;
    }
    video.pause();
  }

  function reconcile() {
    if (!mayPlay()) {
      pausePlayback();
      render();
      return;
    }
    if (!loaded) {
      source.src = source.dataset.src;
      video.load();
      loaded = true;
    }
    if (video.paused && !pending) {
      pending = true;
      const currentAttempt = ++attempt;
      try {
        Promise.resolve(video.play()).then(() => {
          if (currentAttempt !== attempt) return;
          pending = false;
          if (!mayPlay()) video.pause();
          render();
        }, () => {
          if (currentAttempt !== attempt) return;
          pending = false;
          userPaused = true;
          render();
        });
      } catch {
        pending = false;
        userPaused = true;
      }
    }
    render();
  }

  button.addEventListener("click", () => {
    if (!video.paused || (pending && mayPlay())) {
      userPaused = true;
    } else {
      userPaused = false;
      optedIn = true;
    }
    reconcile();
  });
  video.addEventListener("playing", () => {
    section.dataset.videoReady = "true";
    render();
  });
  video.addEventListener("pause", render);
  video.addEventListener("error", () => {
    failed = true;
    section.dataset.videoReady = "false";
    button.hidden = true;
    pausePlayback();
  });
  document.addEventListener("visibilitychange", reconcile);
  window.addEventListener("pageshow", reconcile);
  window.addEventListener("pagehide", pausePlayback);
  const preferenceChanged = () => {
    optedIn = false;
    reconcile();
  };
  if (motion.addEventListener) motion.addEventListener("change", preferenceChanged);
  else motion.addListener(preferenceChanged);
  connection?.addEventListener?.("change", preferenceChanged);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .01;
      reconcile();
    }, { threshold: .01 }).observe(section);
  }
  render();
  reconcile();
})();

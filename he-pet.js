// HE pet: small animated character on all public pages (Claude, 2026-10-15; spritesheet made with ChatGPT/Codex).
// Sheet /assets/he-pet.webp: 8 columns x 4 rows. Rows: 0 idle (6), 1 walk (8), 2 cheer (4), 3 greet (4).
(() => {
  const en = document.documentElement.lang.toLowerCase().startsWith("en");
  const HIDE_KEY = "hendrawanto.pet.hidden.v1";
  const GREET_KEY = "hendrawanto.pet.greeted.v1";
  const store = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} };
  const read = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  if (location.hash === "#he-pet") store(HIDE_KEY, null);
  if (read(HIDE_KEY) === "1") return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ANIM = { idle: [0, 6, 6], walk: [1, 8, 10], cheer: [2, 4, 7], greet: [3, 4, 3] };
  const t = en
    ? { label: "HE, the site's companion. Say hello", text: "Hi, I'm HE. Need help with audit, accounting or tax?", link: "Let's talk", close: "Hide HE" }
    : { label: "HE, teman di situs ini. Sapa HE", text: "Halo, saya HE. Ada yang bisa dibantu soal audit, akuntansi, atau pajak?", link: "Mari berdiskusi", close: "Sembunyikan HE" };

  const root = document.createElement("div");
  root.className = "he-pet";
  root.dataset.hePet = "";
  root.innerHTML =
    '<div class="he-pet-bubble" role="status" hidden><p></p><a href="#kontak"></a>' +
    '<button type="button" class="he-pet-close">&times;</button></div>' +
    '<button type="button" class="he-pet-sprite"></button>';
  const sprite = root.querySelector(".he-pet-sprite");
  const bubble = root.querySelector(".he-pet-bubble");
  const closeBtn = root.querySelector(".he-pet-close");
  bubble.querySelector("p").textContent = t.text;
  bubble.querySelector("a").textContent = t.link;
  if (!document.getElementById("kontak")) bubble.querySelector("a").href = en ? "/en/#kontak" : "/#kontak";
  sprite.setAttribute("aria-label", t.label);
  closeBtn.setAttribute("aria-label", t.close);
  document.body.appendChild(root);

  let anim = "idle", frame = 0, last = 0, x = 0, busyUntil = 0, timer = 0;
  const set = (name) => { anim = name; frame = 0; root.style.setProperty("--he-r", ANIM[name][0]); root.style.setProperty("--he-f", 0); };
  const tick = (now) => {
    const [, count, fps] = ANIM[anim];
    if (now - last >= 1000 / fps) {
      last = now;
      frame = (frame + 1) % count;
      root.style.setProperty("--he-f", frame);
    }
    if (!document.hidden) requestAnimationFrame(tick);
  };
  const play = (name, ms) => { set(name); busyUntil = performance.now() + ms; clearTimeout(timer); timer = setTimeout(() => set("idle"), ms); };
  const walk = () => {
    if (reduce || document.hidden || performance.now() < busyUntil || !bubble.hidden) return;
    const max = Math.min(220, Math.max(60, window.innerWidth * 0.18));
    const target = x === 0 ? -Math.round(max * (0.5 + Math.random() * 0.5)) : 0;
    root.style.setProperty("--he-flip", target < x ? 1 : -1);
    x = target;
    root.style.setProperty("--he-x", x + "px");
    play("walk", 2600);
  };
  const greet = () => {
    bubble.hidden = false;
    if (!reduce) play("greet", 1400 * 2 + 200);
  };
  sprite.addEventListener("click", () => {
    if (bubble.hidden) { if (!reduce) play("cheer", 1200); greet(); }
    else bubble.hidden = true;
  });
  closeBtn.addEventListener("click", () => { store(HIDE_KEY, "1"); root.remove(); });
  bubble.querySelector("a").addEventListener("click", () => { bubble.hidden = true; });

  set("idle");
  if (!reduce) {
    requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(tick); });
    setInterval(walk, 14000);
  }
  if (read(GREET_KEY) !== "1") {
    setTimeout(() => { greet(); store(GREET_KEY, "1"); setTimeout(() => { bubble.hidden = true; }, 7000); }, 3500);
  }
})();

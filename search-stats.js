// Homepage card: Google Search impressions from data/search-impressions.json (Claude, 2026-10-06).
// The file is refreshed from Search Console by Claude's daily task; the HTML holds a fallback value.
(() => {
  // Owner-only view (2026-10-06): both statistic cards stay hidden for visitors. Opening the homepage once with
  // #statistik-he shows them in that browser (stored locally); #statistik-off hides them again. Not access control.
  const wrap = document.querySelector("[data-stats-private]");
  const applyOwner = () => {
    if (!wrap) return;
    const key = "hendrawanto.stats.owner.v1";
    const h = location.hash;
    let owner = false;
    try {
      if (h === "#statistik-he") localStorage.setItem(key, "1");
      if (h === "#statistik-off") localStorage.removeItem(key);
      owner = localStorage.getItem(key) === "1";
    } catch (_) { owner = h === "#statistik-he"; }
    if (h === "#statistik-he" || h === "#statistik-off") {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (_) {}
    }
    wrap.hidden = !owner;
  };
  applyOwner();
  window.addEventListener("hashchange", applyOwner);
  const card = document.querySelector("[data-search-counter]");
  if (!card) return;
  const en = document.documentElement.lang === "en";
  const num = card.querySelector("[data-search-number]");
  const since = card.querySelector("[data-search-since]");
  const status = card.querySelector("[data-search-status]");
  const fmtNum = new Intl.NumberFormat(en ? "en-US" : "id-ID");
  const fmtDate = (s) => {
    const d = new Date(s + "T00:00:00Z");
    if (isNaN(d)) return null;
    return d.toLocaleDateString(en ? "en-GB" : "id-ID", { day: "numeric", month: en ? "long" : "long", year: "numeric", timeZone: "UTC" });
  };
  fetch("/data/search-impressions.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      if (!Number.isFinite(d.total) || d.total < 0) return;
      num.textContent = fmtNum.format(d.total);
      num.setAttribute("aria-label", fmtNum.format(d.total) + (en ? " impressions" : " tayangan"));
      const s = fmtDate(d.since), t = fmtDate(d.dataThrough);
      if (s && since) since.textContent = s;
      if (t && status) status.textContent = (en ? "Google data through " : "Data Google s.d. ") + t;
      card.dataset.visitState = "ready";
    })
    .catch(() => {});
})();

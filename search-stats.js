// Homepage card: Google Search impressions from data/search-impressions.json (Claude, 2026-10-06).
// The file is refreshed from Search Console by Claude's daily task; the HTML holds a fallback value.
(() => {
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

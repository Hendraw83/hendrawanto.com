/* Sinkronisasi tinggi & posisi gulir formulir new client (Google Apps Script).
   Aman tanpa sisi Apps Script: selama sinyal tinggi belum diterima, iframe
   mempertahankan scrollbar sendiri sehingga formulir tetap bisa diisi penuh. */
(function () {
  "use strict";
  var frame = document.querySelector(".proposal-frame");
  if (!frame) return;
  var iframe = frame.querySelector("iframe");
  if (!iframe) return;

  var ALLOWED = /^https:\/\/([a-z0-9-]+\.)*googleusercontent\.com$/;
  var synced = false;

  function allowed(origin) {
    return ALLOWED.test(origin) || origin === "https://script.google.com";
  }

  window.addEventListener("message", function (event) {
    if (!allowed(event.origin)) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "KAPSHS_IFRAME_HEIGHT" && typeof data.height === "number") {
      var h = Math.ceil(data.height);
      if (!(h > 400 && h < 20000)) return;
      if (!synced) {
        synced = true;
        iframe.setAttribute("scrolling", "no");
        frame.classList.add("is-synced");
      }
      iframe.style.height = h + 32 + "px";
      iframe.style.minHeight = h + 32 + "px";
      return;
    }

    if (data.type === "KAPSHS_SCROLL_TO_Y" && typeof data.offsetTop === "number") {
      var top = iframe.getBoundingClientRect().top + (window.pageYOffset || 0);
      var target = Math.max(0, top + data.offsetTop - 110);
      try {
        window.scrollTo({ top: target, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, target);
      }
    }
  });
})();

// HE pet chat: guided, public-safe answers based on the site's services.
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
  const t = en ? {
    label: "HE, the site's companion. Chat with HE", greeting: "Hi, I'm HE. I can help you explore audit, accounting and tax services.",
    placeholder: "Type a question…", send: "Send", close: "Hide HE", wa: "Continue on WhatsApp",
    topics: ["Audit services", "Accounting & SAK", "Tax consultation", "Contact Hendrawanto"],
    answers: {
      audit: "Hendrawanto supports financial statement audit, review, internal control evaluation, investigative audit, state-loss calculations and expert testimony. Tell me what you want to explore, or continue on WhatsApp for a specific discussion.",
      accounting: "The accounting practice covers financial statements, performance and cash-flow analysis, accounting systems and policies, and SAK implementation.",
      tax: "Tax support includes compliance review, transaction analysis, tax planning and documentation. Specific advice requires a direct discussion with the team.",
      contact: "You can continue the discussion via WhatsApp. Please share only a general overview here and do not send confidential documents in public chat."
    }
  } : {
    label: "HE, teman di situs ini. Ajak HE mengobrol", greeting: "Halo, saya HE. Saya bisa membantu menjelajahi layanan audit, akuntansi, dan pajak.",
    placeholder: "Tulis pertanyaan…", send: "Kirim", close: "Sembunyikan HE", wa: "Lanjutkan di WhatsApp",
    topics: ["Layanan audit", "Akuntansi & SAK", "Konsultasi pajak", "Hubungi Hendrawanto"],
    answers: {
      audit: "Hendrawanto melayani audit laporan keuangan, review, evaluasi pengendalian, audit investigatif, penghitungan kerugian negara, dan keterangan ahli. Untuk pembahasan khusus, lanjutkan ke WhatsApp.",
      accounting: "Layanan akuntansi mencakup penyusunan laporan keuangan, analisis kinerja dan arus kas, sistem serta kebijakan akuntansi, dan penerapan SAK.",
      tax: "Konsultasi pajak mencakup telaah kepatuhan, analisis pajak atas transaksi, perencanaan pajak, dan penataan dokumentasi. Nasihat khusus perlu dibahas langsung dengan tim.",
      contact: "Pembahasan dapat dilanjutkan melalui WhatsApp. Cukup tuliskan gambaran umum di sini dan jangan kirim dokumen atau data rahasia melalui chat publik."
    }
  };
  const root = document.createElement("div");
  root.className = "he-pet"; root.dataset.hePet = "";
  root.innerHTML = '<div class="he-pet-bubble" role="dialog" aria-label="HE chat" hidden><div class="he-chat-head"><strong>HE Chat</strong><button type="button" class="he-pet-close" aria-label="' + t.close + '">&times;</button></div><div class="he-chat-messages" aria-live="polite"></div><div class="he-chat-topics"></div><form class="he-chat-form"><input aria-label="' + t.placeholder + '" placeholder="' + t.placeholder + '" maxlength="500" autocomplete="off"><button type="submit">' + t.send + '</button></form><a class="he-chat-wa" href="https://wa.me/6287790487353" target="_blank" rel="noopener noreferrer">' + t.wa + ' →</a></div><button type="button" class="he-pet-sprite"></button>';
  const sprite = root.querySelector(".he-pet-sprite"), bubble = root.querySelector(".he-pet-bubble"), closeBtn = root.querySelector(".he-pet-close"), messages = root.querySelector(".he-chat-messages"), topics = root.querySelector(".he-chat-topics"), form = root.querySelector(".he-chat-form"), input = form.querySelector("input");
  sprite.setAttribute("aria-label", t.label);
  const add = (text, who) => { const p = document.createElement("p"); p.className = "he-chat-message " + who; p.textContent = text; messages.appendChild(p); messages.scrollTop = messages.scrollHeight; };
  const answer = (q) => { const s = q.toLowerCase(); if (/audit|assur|investig|kerugian|keterangan ahli/.test(s)) return t.answers.audit; if (/akunt|account|sak|laporan|arus kas/.test(s)) return t.answers.accounting; if (/pajak|tax|perpajakan/.test(s)) return t.answers.tax; if (/hubung|kontak|whatsapp|wa|proposal|fee/.test(s)) return t.answers.contact; return en ? "I can help with general information about audit, accounting and tax services. Choose a topic below, or continue on WhatsApp for a specific need." : "Saya dapat membantu informasi umum tentang layanan audit, akuntansi, dan pajak. Pilih topik di bawah atau lanjutkan ke WhatsApp untuk kebutuhan khusus."; };
  const open = () => { bubble.hidden = false; if (!messages.children.length) { add(t.greeting, "he"); t.topics.forEach((label, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.addEventListener("click", () => { add(label, "visitor"); add(answer(label), "he"); }); topics.appendChild(b); }); } };
  bubble.querySelector(".he-chat-wa").href = "https://wa.me/6287790487353?text=" + encodeURIComponent(en ? "Hello, I visited hendrawanto.com and would like to discuss a service." : "Halo Pak Hendrawanto, saya mengunjungi hendrawanto.com dan ingin berdiskusi.");
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (!q) return; add(q, "visitor"); input.value = ""; window.setTimeout(() => add(answer(q), "he"), 120); });
  sprite.addEventListener("click", () => { if (bubble.hidden) { open(); if (!reduce) play("cheer", 1200); } else bubble.hidden = true; });
  closeBtn.addEventListener("click", () => { store(HIDE_KEY, "1"); root.remove(); });
  document.body.appendChild(root);
  let anim = "idle", frame = 0, last = 0, x = 0, busyUntil = 0, timer = 0;
  const set = (name) => { anim = name; frame = 0; root.style.setProperty("--he-r", ANIM[name][0]); root.style.setProperty("--he-f", 0); };
  const tick = (now) => { const [, count, fps] = ANIM[anim]; if (now - last >= 1000 / fps) { last = now; frame = (frame + 1) % count; root.style.setProperty("--he-f", frame); } if (!document.hidden) requestAnimationFrame(tick); };
  const play = (name, ms) => { set(name); busyUntil = performance.now() + ms; clearTimeout(timer); timer = setTimeout(() => set("idle"), ms); };
  const walk = () => { if (reduce || document.hidden || performance.now() < busyUntil || !bubble.hidden) return; const max = Math.min(220, Math.max(60, window.innerWidth * .18)); const target = x === 0 ? -Math.round(max * (.5 + Math.random() * .5)) : 0; root.style.setProperty("--he-flip", target < x ? 1 : -1); x = target; root.style.setProperty("--he-x", x + "px"); play("walk", 2600); };
  set("idle"); if (!reduce) { requestAnimationFrame(tick); document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(tick); }); setInterval(walk, 14000); }
  if (read(GREET_KEY) !== "1") { setTimeout(() => { open(); store(GREET_KEY, "1"); setTimeout(() => { if (bubble) bubble.hidden = true; }, 7000); }, 3500); }
})();
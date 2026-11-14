/* Homepage interactions: load video players only after an explicit choice. */
(() => {
  'use strict';
  const en = document.documentElement.lang.toLowerCase().startsWith('en');
  document.querySelectorAll('.home-video-preview').forEach(button => {
    button.addEventListener('click', () => {
      const url = new URL(button.dataset.videoSrc);
      if (url.origin !== 'https://www.youtube-nocookie.com' || !/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) return;
      const frame = document.createElement('iframe');
      frame.title = button.dataset.videoTitle;
      frame.width = '560'; frame.height = '315';
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; web-share');
      frame.setAttribute('allowfullscreen', '');
      url.searchParams.set('autoplay', '1');
      frame.src = url.href;
      button.replaceWith(frame);
      frame.focus();
    }, { once: true });
  });

  const root = document.querySelector('.home-assistant');
  if (!root) return;
  const toggle = root.querySelector('.home-assistant-toggle');
  const panel = root.querySelector('.home-assistant-panel');
  const close = root.querySelector('.home-assistant-close');
  const input = root.querySelector('input');
  const messages = root.querySelector('.home-assistant-messages');
  const responses = en ? {
    audit: 'Audit and assurance services are performed through KAP SHS, subject to independence and engagement acceptance. Services include financial statement audits, investigations, state financial loss calculations and expert testimony.',
    accounting: 'Accounting services cover financial reporting, accounting policies, financial analysis and SAK implementation. The appropriate scope depends on your business and reporting needs.',
    tax: 'Tax support includes compliance reviews, transaction analysis and tax planning. A conclusion for a particular case requires the relevant facts and documents.',
    other: 'I provide general information about audit, accounting and tax services. For your specific needs, use the WhatsApp link above to speak with Hendrawanto. Please do not enter confidential information here.'
  } : {
    audit: 'Jasa audit dan asurans dilaksanakan melalui KAP SHS, setelah evaluasi independensi dan penerimaan penugasan. Ruang lingkup mencakup audit laporan keuangan, investigasi, penghitungan kerugian keuangan negara, dan keterangan ahli.',
    accounting: 'Layanan akuntansi mencakup pelaporan keuangan, kebijakan akuntansi, analisis keuangan, dan penerapan SAK. Ruang lingkup disesuaikan dengan kegiatan usaha dan kebutuhan pelaporan.',
    tax: 'Pendampingan pajak mencakup telaah kepatuhan, analisis transaksi, dan perencanaan pajak. Kesimpulan untuk kasus tertentu memerlukan fakta dan dokumen yang relevan.',
    other: 'Saya membantu informasi umum tentang layanan audit, akuntansi, dan pajak. Untuk kebutuhan khusus, gunakan tautan WhatsApp di atas untuk berbicara dengan Pak Hendrawanto. Jangan masukkan informasi rahasia di sini.'
  };
  const answer = question => /audit|assur|investig|kerugian|ahli/.test(question) ? responses.audit : /akunt|account|sak|laporan|arus kas/.test(question) ? responses.accounting : /pajak|tax/.test(question) ? responses.tax : responses.other;
  const add = (text, visitor = false) => {
    const p = document.createElement('p');
    p.className = visitor ? 'home-assistant-message visitor' : 'home-assistant-message';
    p.textContent = text; messages.appendChild(p); messages.scrollTop = messages.scrollHeight;
  };
  const show = open => {
    panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
    if (open) close.focus(); else toggle.focus();
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => show(panel.hidden));
  close.addEventListener('click', () => show(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) show(false); });
  document.addEventListener('click', event => { if (!panel.hidden && !root.contains(event.target)) show(false); });
  root.querySelectorAll('[data-assistant-topic]').forEach(button => button.addEventListener('click', () => {
    add(button.textContent, true); add(answer(button.dataset.assistantTopic));
  }));
  root.querySelector('form').addEventListener('submit', event => {
    event.preventDefault(); const question = input.value.trim(); if (!question) return;
    add(question, true); add(answer(question.toLowerCase())); input.value = ''; input.focus();
  });
})();

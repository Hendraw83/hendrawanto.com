/* Shared GA4 loader for public pages. See ANALYTICS.md before changing it. */
(function () {
  'use strict';
  if (window.__hendrawantoAnalytics) return;
  window.__hendrawantoAnalytics = true;

  const measurementId = 'G-ZPRBG3X1JL';
  const consentKey = 'hendrawanto.analytics.v1';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const disableKey = 'ga-disable-' + measurementId;
  const path = window.location.pathname.toLowerCase();
  const operationalPath = /^\/(?:en\/)?(?:desk|newclient|shsnewclientdesk|shsdesk-imbalan-kerja)(?:\/|$)/.test(path) || /\/demo(?:\/|$)/.test(path);
  if (operationalPath) return;

  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const privacyPath = english ? '/en/privasi/' : '/privasi/';
  const text = english ? {
    title: 'Allow visit statistics?',
    description: 'With your permission, Google Analytics measures page visits and approximate locations using analytics cookies, and an aggregate counter records visits. You can change your choice at any time.',
    privacy: 'Privacy information', deny: 'Decline', allow: 'Allow statistics', preferences: 'Statistics preferences'
  } : {
    title: 'Izinkan statistik kunjungan?',
    description: 'Dengan izin Anda, Google Analytics memakai cookie analitik untuk mengukur kunjungan halaman dan perkiraan lokasi, serta penghitung agregat mencatat kunjungan. Pilihan dapat diubah kapan saja.',
    privacy: 'Informasi privasi', deny: 'Tolak', allow: 'Izinkan statistik', preferences: 'Preferensi statistik'
  };

  let loaded = false;
  let pausedForInput = false;
  let banner;
  window[disableKey] = true;

  function setState(value) {
    document.documentElement.dataset.analyticsState = value;
  }

  function readConsent() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(consentKey));
      if (saved && ['allow', 'deny'].includes(saved.choice) && Number.isFinite(saved.at) && saved.at <= Date.now() && Date.now() - saved.at < consentLifetime) return saved.choice;
    } catch (_) { /* A blocked storage area must not enable tracking. */ }
    return null;
  }

  function saveConsent(choice) {
    try { window.localStorage.setItem(consentKey, JSON.stringify({choice: choice, at: Date.now()})); } catch (_) { /* Apply the choice to this page only. */ }
  }

  function notifyStatisticsChoice(choice) {
    window.__hendrawantoStatisticsChoice = choice;
    window.dispatchEvent(new Event('hendrawanto:statistics-choice'));
  }

  function loadVisitCounter() {
    if (!['hendrawanto.com', 'www.hendrawanto.com'].includes(window.location.hostname)) return;
    const script = document.createElement('script');
    script.id = 'hendrawanto-visit-loader';
    script.src = '/visits.js?v=20261005';
    script.async = true;
    document.head.appendChild(script);
  }

  function clearCookies() {
    document.cookie.split(';').forEach(function (item) {
      const name = item.split('=')[0].trim();
      if (!/^he_ga(?:_|$)/.test(name)) return;
      ['', '; domain=hendrawanto.com', '; domain=.hendrawanto.com'].forEach(function (domain) {
        document.cookie = name + '=; max-age=0; path=/; SameSite=Lax; Secure' + domain;
      });
    });
  }

  function safeReferrer() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch (_) { return ''; }
  }

  function enableAnalytics() {
    if (loaded || pausedForInput) return;
    if (!['hendrawanto.com', 'www.hendrawanto.com'].includes(window.location.hostname)) {
      setState('preview-only');
      return;
    }
    loaded = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: window.location.origin + window.location.pathname,
      page_referrer: safeReferrer(),
      page_title: document.title,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: 'he',
      cookie_domain: 'hendrawanto.com',
      cookie_expires: consentLifetime / 1000,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    const script = document.createElement('script');
    script.id = 'hendrawanto-google-tag';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    script.onload = function () { if (!window[disableKey]) setState('tag-loaded'); };
    script.onerror = function () { setState('tag-blocked'); };
    setState('loading');
    document.head.appendChild(script);
  }

  // Stop further collection before form input or a message link can reach
  // Google's optional automatic interaction measurement. Page views already
  // sent contain no query strings, fragments or form values from this code.
  function pauseForPrivateInput() {
    pausedForInput = true;
    window[disableKey] = true;
    notifyStatisticsChoice('paused');
    if (loaded) setState('paused-for-input');
  }
  window.addEventListener('input', pauseForPrivateInput, true);
  window.addEventListener('submit', pauseForPrivateInput, true);
  window.addEventListener('click', function (event) {
    const target = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!target) return;
    try {
      const url = new URL(target.href, window.location.href);
      if (['text', 'message', 'email', 'name', 'phone'].some(function (key) { return url.searchParams.has(key); })) pauseForPrivateInput();
    } catch (_) { /* Ignore malformed links. */ }
  }, true);

  function choose(choice) {
    saveConsent(choice);
    notifyStatisticsChoice(choice);
    banner.hidden = true;
    if (choice === 'allow') {
      if (loaded || pausedForInput) { window.location.reload(); return; }
      enableAnalytics();
    } else {
      window[disableKey] = true;
      clearCookies();
      setState('declined');
      if (loaded) window.location.reload();
    }
  }

  function showPreferences() { banner.hidden = false; }
  function init() {
    banner = document.createElement('section');
    banner.className = 'analytics-banner';
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.innerHTML = '<h2 id="analytics-consent-title">' + text.title + '</h2><p>' + text.description + ' <a href="' + privacyPath + '">' + text.privacy + '</a>.</p><div class="analytics-actions"><button type="button" data-analytics-deny>' + text.deny + '</button><button type="button" data-analytics-allow>' + text.allow + '</button></div>';
    banner.querySelector('[data-analytics-deny]').addEventListener('click', function () { choose('deny'); });
    banner.querySelector('[data-analytics-allow]').addEventListener('click', function () { choose('allow'); });
    document.body.appendChild(banner);
    const footer = document.querySelector('.footer-links');
    if (footer) {
      const preference = document.createElement('button');
      preference.type = 'button';
      preference.className = 'analytics-preferences';
      preference.textContent = text.preferences;
      preference.addEventListener('click', showPreferences);
      footer.appendChild(preference);
    }
    const choice = readConsent();
    notifyStatisticsChoice(choice);
    loadVisitCounter();
    banner.hidden = choice !== null;
    if (choice === 'allow') enableAnalytics();
    else if (choice === 'deny') { clearCookies(); setState('declined'); }
    else setState('awaiting-consent');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();

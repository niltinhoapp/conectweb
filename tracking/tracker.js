/*
 * ConnectWeb Tracking V1
 * Client-side attribution and parameter preservation.
 *
 * Install:
 * <script src="https://SEU-DOMINIO/tracking/tracker.js" data-account="CW_xxx" defer></script>
 *
 * This library does not send conversion events to Meta/Google by itself.
 * It captures and preserves attribution data so a future server/event layer
 * can consume the same record safely.
 */
(function (window, document) {
  'use strict';

  var VERSION = '1.0.0';
  var STORAGE_KEY = '__cw_tracking_v1__';
  var COOKIE_KEY = 'cw_tracking_v1';
  var TTL_MS = 90 * 24 * 60 * 60 * 1000;

  var CAMPAIGN_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
  ];
  var CLICK_ID_KEYS = [
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'twclid',
    'li_fat_id', 'yclid', 'dclid'
  ];
  var ATTRIBUTION_KEYS = CAMPAIGN_KEYS.concat(CLICK_ID_KEYS);

  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName('script');
    script = scripts[scripts.length - 1];
  }

  var account = script && script.getAttribute('data-account');
  var debug = script && script.getAttribute('data-debug') === 'true';
  var decorateLinks = !(script && script.getAttribute('data-decorate-links') === 'false');
  var captureForms = !(script && script.getAttribute('data-capture-forms') === 'false');

  function log() {
    if (!debug || !window.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[ConnectWeb Tracking]');
    console.log.apply(console, args);
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function readStorage() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = safeJsonParse(raw);
        if (parsed && parsed.version === VERSION) return parsed;
      }
    } catch (_) {}

    try {
      var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
      if (match) return safeJsonParse(decodeURIComponent(match[1]));
    } catch (_) {}
    return null;
  }

  function writeStorage(data) {
    var serialized;
    try { serialized = JSON.stringify(data); } catch (_) { return; }

    try { window.localStorage.setItem(STORAGE_KEY, serialized); } catch (_) {}

    try {
      document.cookie = COOKIE_KEY + '=' + encodeURIComponent(serialized) +
        '; Max-Age=' + Math.floor(TTL_MS / 1000) + '; Path=/; SameSite=Lax';
    } catch (_) {}
  }

  function nowIso() { return new Date().toISOString(); }

  function cleanValue(value) {
    if (value === null || value === undefined) return '';
    var text = String(value).trim();
    return text.length > 500 ? text.slice(0, 500) : text;
  }

  function getUrlParams(url) {
    try { return new URL(url); } catch (_) { return null; }
  }

  function getAttributionFromUrl(url) {
    var parsed = getUrlParams(url);
    var result = {};
    if (!parsed) return result;
    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = cleanValue(parsed.searchParams.get(key));
      if (value) result[key] = value;
    });
    return result;
  }

  function hasCampaignData(data) {
    return CAMPAIGN_KEYS.some(function (key) { return !!data[key]; }) ||
      CLICK_ID_KEYS.some(function (key) { return !!data[key]; });
  }

  function classifySource(data, referrer) {
    var source = (data.utm_source || '').toLowerCase();
    var medium = (data.utm_medium || '').toLowerCase();
    var ref = (referrer || '').toLowerCase();

    if (source) return source;
    if (data.fbclid) return 'facebook';
    if (data.gclid || data.gbraid || data.wbraid) return 'google';
    if (data.ttclid) return 'tiktok';
    if (data.msclkid) return 'bing';
    if (medium === 'organic') return 'organic';
    if (!ref) return 'direct';

    try {
      var host = new URL(ref).hostname.replace(/^www\./, '');
      var ownHost = window.location.hostname.replace(/^www\./, '');
      if (host === ownHost || host.endsWith('.' + ownHost)) return 'internal';
      if (/google\./.test(host)) return 'google-organic';
      if (/bing\./.test(host)) return 'bing-organic';
      if (/facebook\.|instagram\./.test(host)) return 'meta-referral';
      if (/tiktok\./.test(host)) return 'tiktok-referral';
      if (/youtube\./.test(host)) return 'youtube-referral';
      return host;
    } catch (_) {
      return 'referral';
    }
  }

  function makeBaseRecord(current) {
    var url = window.location.href;
    var referrer = document.referrer || '';
    var landing = {
      url: url,
      path: window.location.pathname,
      referrer: referrer,
      captured_at: nowIso()
    };

    return {
      version: VERSION,
      account: account || '',
      visitor_id: createId(),
      first_touch: current,
      last_touch: current,
      landing_page: landing,
      last_page: url,
      updated_at: nowIso(),
      history: [{ type: 'touch', at: nowIso(), data: current }]
    };
  }

  function createId() {
    var random = Math.random().toString(36).slice(2);
    var time = Date.now().toString(36);
    return 'cw_' + time + '_' + random;
  }

  function merge(base, incoming) {
    var out = {};
    Object.keys(base || {}).forEach(function (key) { out[key] = base[key]; });
    Object.keys(incoming || {}).forEach(function (key) {
      if (incoming[key]) out[key] = incoming[key];
    });
    return out;
  }

  function capture() {
    var current = getAttributionFromUrl(window.location.href);
    var stored = readStorage();
    var meaningful = hasCampaignData(current);

    if (!stored || !stored.first_touch) {
      var initial = makeBaseRecord(current);
      initial.source = classifySource(current, document.referrer);
      writeStorage(initial);
      return initial;
    }

    stored.account = account || stored.account || '';
    stored.last_page = window.location.href;
    stored.updated_at = nowIso();

    if (meaningful) {
      var previousLast = stored.last_touch || {};
      var nextLast = merge(previousLast, current);
      stored.last_touch = nextLast;
      stored.last_touch_source = classifySource(nextLast, document.referrer);
      stored.history = stored.history || [];
      stored.history.push({ type: 'touch', at: nowIso(), data: current });
      if (stored.history.length > 20) stored.history = stored.history.slice(-20);
    }

    writeStorage(stored);
    return stored;
  }

  function getRecord() {
    return readStorage() || capture();
  }

  function buildPublicData() {
    var record = getRecord();
    var first = record.first_touch || {};
    var last = record.last_touch || {};
    return {
      version: VERSION,
      account: record.account || account || '',
      visitor_id: record.visitor_id || '',
      first_touch: first,
      last_touch: last,
      source: record.last_touch_source || classifySource(last, record.landing_page && record.landing_page.referrer),
      landing_page: record.landing_page || {},
      current_page: window.location.href,
      updated_at: record.updated_at || nowIso()
    };
  }

  function addParamsToUrl(href) {
    var parsed = getUrlParams(href);
    if (!parsed) return href;
    if (!/^https?:$/i.test(parsed.protocol)) return href;

    var record = getRecord();
    var source = merge(record.first_touch || {}, record.last_touch || {});

    ATTRIBUTION_KEYS.forEach(function (key) {
      if (!parsed.searchParams.get(key) && source[key]) {
        parsed.searchParams.set(key, source[key]);
      }
    });

    var host = parsed.hostname.toLowerCase();
    var isHotmart = host.indexOf('hotmart') !== -1;
    var isKiwify = host.indexOf('kiwify') !== -1;

    if (isHotmart || isKiwify) {
      var sckParts = [
        source.utm_source,
        source.utm_medium,
        source.utm_campaign,
        source.utm_content,
        source.utm_term
      ].filter(Boolean);
      if (sckParts.length && !parsed.searchParams.get('sck')) {
        parsed.searchParams.set('sck', sckParts.join('|'));
      }
      if (source.utm_source && !parsed.searchParams.get('src')) {
        parsed.searchParams.set('src', source.utm_source);
      }
    }

    return parsed.toString();
  }

  function decorateAnchor(anchor) {
    if (!anchor || !anchor.href) return;
    if (anchor.hasAttribute('popup')) return;
    if (anchor.hasAttribute('data-cw-ignore')) return;
    if (anchor.target === '_blank' && anchor.rel.indexOf('noopener') === -1) {
      anchor.rel = (anchor.rel + ' noopener').trim();
    }
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    var updated = addParamsToUrl(anchor.href);
    if (updated && updated !== anchor.href) anchor.href = updated;
  }

  function decorateAllLinks(root) {
    if (!decorateLinks) return;
    var scope = root || document;
    var anchors = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    Array.prototype.forEach.call(anchors, decorateAnchor);
  }

  function injectFormFields(form) {
    if (!form || form.hasAttribute('data-cw-ignore')) return;
    var data = buildPublicData();
    var fields = {};

    CAMPAIGN_KEYS.concat(CLICK_ID_KEYS).forEach(function (key) {
      fields[key] = data.last_touch[key] || data.first_touch[key] || '';
    });
    fields.cw_visitor_id = data.visitor_id;
    fields.cw_first_touch = JSON.stringify(data.first_touch);
    fields.cw_last_touch = JSON.stringify(data.last_touch);
    fields.cw_landing_page = data.landing_page.url || '';

    Object.keys(fields).forEach(function (name) {
      var existing = form.querySelector('input[name="' + name + '"]');
      if (!existing) {
        existing = document.createElement('input');
        existing.type = 'hidden';
        existing.name = name;
        form.appendChild(existing);
      }
      existing.value = fields[name];
    });
  }

  function captureFormsOnPage() {
    if (!captureForms) return;
    Array.prototype.forEach.call(document.querySelectorAll('form'), injectFormFields);
  }

  function setupObserver() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === 'A') decorateAnchor(node);
          if (node.tagName === 'FORM') injectFormFields(node);
          decorateAllLinks(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    if (!account) log('Aviso: data-account não informado.');
    var record = capture();
    log('Inicializado', buildPublicData());
    decorateAllLinks(document);
    captureFormsOnPage();
    setupObserver();

    window.ConnectWebTracking = {
      version: VERSION,
      account: account || '',
      get: buildPublicData,
      getRaw: getRecord,
      refresh: function () {
        var next = capture();
        decorateAllLinks(document);
        captureFormsOnPage();
        return next;
      },
      decorateUrl: addParamsToUrl
    };

    window.dispatchEvent(new CustomEvent('connectweb:tracking-ready', {
      detail: buildPublicData()
    }));

    return record;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);

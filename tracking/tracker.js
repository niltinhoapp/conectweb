/*
 * ConnectWeb Tracking V1.1
 * Client-side attribution and parameter preservation.
 *
 * Install (modo simples, sem exigir consentimento):
 * <script src="https://SEU-DOMINIO/tracking/tracker.js" data-account="CW_xxx" defer></script>
 *
 * Install (modo com consentimento obrigatorio - LGPD/GDPR):
 * <script src="https://SEU-DOMINIO/tracking/tracker.js"
 *   data-account="CW_xxx"
 *   data-consent-required="true"
 *   data-consent-cookie="meu_cookie_de_consentimento"
 *   data-consent-cookie-value="granted"
 *   defer></script>
 *
 * Quando data-consent-required="true", nada e capturado, gravado em
 * localStorage/cookie ou decorado em links/formularios ate o consentimento
 * ser concedido. O host page pode conceder/negar consentimento de duas formas:
 *
 *   1. window.ConnectWebTracking.setConsent(true | false)
 *   2. window.dispatchEvent(new CustomEvent('connectweb:consent-changed', {
 *        detail: { granted: true }
 *      }))
 *
 * Requisitos de navegador: URL/URLSearchParams, MutationObserver e
 * CustomEvent (todos os navegadores evergreen desde ~2017). Internet
 * Explorer 11 nao e suportado - o script identifica a ausencia dessas
 * APIs e nao executa, em vez de lancar erros nao tratados.
 *
 * Esta biblioteca nao envia eventos de conversao para Meta/Google por si
 * so. Ela captura e preserva dados de atribuicao para uma camada futura
 * de servidor/eventos consumir o mesmo registro com seguranca.
 */
(function (window, document) {
  'use strict';

  // -----------------------------------------------------------------------
  // Feature detection - em vez de tentar suportar navegadores antigos
  // (ex.: IE11) artificialmente, o script simplesmente nao roda neles.
  // -----------------------------------------------------------------------
  var SUPPORTED = !!(
    window.URL &&
    window.URLSearchParams &&
    window.MutationObserver &&
    window.JSON &&
    Array.prototype.forEach &&
    Object.keys
  );
  if (!SUPPORTED) return;

  var VERSION = '1.1.0';
  var VERSION_MAJOR = 1;
  var STORAGE_PREFIX = '__cw_tracking_v1__';
  var COOKIE_PREFIX = 'cw_tracking_v1';
  var OPTOUT_COOKIE_PREFIX = 'cw_tracking_optout_v1';
  var TTL_MS = 90 * 24 * 60 * 60 * 1000;

  var CAMPAIGN_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
  ];
  var CLICK_ID_KEYS = [
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'twclid',
    'li_fat_id', 'yclid', 'dclid'
  ];
  var ATTRIBUTION_KEYS = CAMPAIGN_KEYS.concat(CLICK_ID_KEYS);

  // -----------------------------------------------------------------------
  // Configuracao via atributos da tag <script>
  // -----------------------------------------------------------------------
  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName('script');
    script = scripts[scripts.length - 1];
  }

  function attr(name, fallback) {
    var value = script && script.getAttribute(name);
    return value === null || value === undefined ? fallback : value;
  }

  var account = attr('data-account', '');
  var debug = attr('data-debug', 'false') === 'true';
  var decorateLinksEnabled = attr('data-decorate-links', 'true') !== 'false';
  var captureFormsEnabled = attr('data-capture-forms', 'true') !== 'false';
  var consentRequired = attr('data-consent-required', 'false') === 'true';
  var consentGrantedAttr = attr('data-consent-granted', 'false') === 'true';
  var consentCookieName = attr('data-consent-cookie', '');
  var consentCookieValue = attr('data-consent-cookie-value', 'granted');
  var extraDomainsRaw = attr('data-decorate-domains', '');
  var extraDomains = extraDomainsRaw
    .split(',')
    .map(function (s) { return s.trim().toLowerCase(); })
    .filter(Boolean);

  // Namespacing por conta: cada data-account tem sua propria chave de
  // storage, entao trocar de conta no mesmo dominio nunca reaproveita ou
  // sobrescreve dados de outra conta silenciosamente - so passa a gravar
  // (e ler) num slot separado.
  var accountSlug = account ? account.replace(/[^a-zA-Z0-9_-]/g, '_') : 'default';
  var STORAGE_KEY = STORAGE_PREFIX + '__' + accountSlug;
  var COOKIE_KEY = COOKIE_PREFIX + '__' + accountSlug;
  var OPTOUT_COOKIE = OPTOUT_COOKIE_PREFIX + '__' + accountSlug;

  function log() {
    if (!debug || !window.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[ConnectWeb Tracking]');
    console.log.apply(console, args);
  }

  function fireEvent(name, detail) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    } catch (_) { /* CustomEvent indisponivel - ignora silenciosamente */ }
  }

  // -----------------------------------------------------------------------
  // Consentimento
  // -----------------------------------------------------------------------
  var consentState = 'granted'; // 'granted' | 'denied' | 'unknown'

  function readCookieRaw(name) {
    try {
      var pattern = new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)');
      var match = document.cookie.match(pattern);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (_) { return null; }
  }

  function writeCookieRaw(name, value, maxAgeSeconds) {
    try {
      var secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = name + '=' + encodeURIComponent(value) +
        '; Max-Age=' + Math.floor(maxAgeSeconds) + '; Path=/; SameSite=Lax' + secure;
    } catch (_) {}
  }

  function deleteCookieRaw(name) {
    try {
      var secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + secure;
    } catch (_) {}
  }

  function resolveInitialConsent() {
    if (!consentRequired) return 'granted';
    if (readCookieRaw(OPTOUT_COOKIE) !== null) return 'denied';
    if (consentGrantedAttr) return 'granted';
    if (consentCookieName) {
      var raw = readCookieRaw(consentCookieName);
      if (raw !== null && raw === consentCookieValue) return 'granted';
    }
    return 'unknown';
  }

  function canTrack() {
    return consentState === 'granted';
  }

  // -----------------------------------------------------------------------
  // Storage (localStorage + cookie como fallback)
  // -----------------------------------------------------------------------
  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function isExpired(record) {
    if (!record || !record.updated_at) return false;
    var updated = Date.parse(record.updated_at);
    if (isNaN(updated)) return false;
    return (Date.now() - updated) > TTL_MS;
  }

  // Migra um registro de uma versao MENOR/PATCH anterior (mesma major)
  // preenchendo campos novos com defaults, em vez de descartar o
  // first_touch/visitor_id existente. Um bump de major version e tratado
  // como incompativel (registro novo comeca do zero).
  function migrateRecord(record) {
    if (!record || typeof record !== 'object') return null;
    var recordMajor = parseInt(String(record.version || '0').split('.')[0], 10);
    if (recordMajor !== VERSION_MAJOR) return null;
    record.version = VERSION;
    if (!record.first_touch) record.first_touch = {};
    if (!record.last_touch) record.last_touch = {};
    if (!record.landing_page) record.landing_page = { url: '', path: '', referrer: '', captured_at: record.updated_at || nowIso() };
    if (!record.history) record.history = [];
    return record;
  }

  function readStorage() {
    var record = null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) record = migrateRecord(safeJsonParse(raw));
    } catch (_) {}

    if (!record) {
      try {
        var cookieRaw = readCookieRaw(COOKIE_KEY);
        if (cookieRaw) record = migrateRecord(safeJsonParse(cookieRaw));
      } catch (_) {}
    }

    if (record && isExpired(record)) {
      log('Registro expirado (TTL de 90 dias), iniciando novo ciclo de atribuicao.');
      return null;
    }
    return record;
  }

  // Versao compacta do registro para o cookie: sem o array `history`
  // (que pode crescer e estourar o limite de ~4KB de um cookie).
  function compactForCookie(data) {
    return {
      version: data.version,
      account: data.account,
      visitor_id: data.visitor_id,
      first_touch: data.first_touch,
      last_touch: data.last_touch,
      last_touch_source: data.last_touch_source,
      source: data.source,
      landing_page: data.landing_page,
      last_page: data.last_page,
      updated_at: data.updated_at
    };
  }

  function writeStorage(data) {
    var serialized;
    try { serialized = JSON.stringify(data); } catch (_) { return; }

    try { window.localStorage.setItem(STORAGE_KEY, serialized); } catch (_) {}

    var compactSerialized;
    try { compactSerialized = JSON.stringify(compactForCookie(data)); } catch (_) { compactSerialized = serialized; }
    writeCookieRaw(COOKIE_KEY, compactSerialized, TTL_MS / 1000);
  }

  function clearStorage() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    deleteCookieRaw(COOKIE_KEY);
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

  function createId() {
    var random = Math.random().toString(36).slice(2);
    var time = Date.now().toString(36);
    return 'cw_' + time + '_' + random;
  }

  // Copia "limpa" de um conjunto de atribuicao: so as chaves realmente
  // presentes no `data` de origem. Usada para o last_touch NUNCA misturar
  // campos de toques/campanhas diferentes (o bug corrigido nesta versao).
  function cleanCopy(data) {
    var out = {};
    if (!data) return out;
    ATTRIBUTION_KEYS.forEach(function (key) {
      if (data[key]) out[key] = data[key];
    });
    return out;
  }

  // Usada apenas para DECORAR links de saida (Hotmart/Kiwify/etc.): aqui
  // sim faz sentido completar campos ausentes do last_touch com os do
  // first_touch, para o link de checkout carregar o maximo de contexto
  // possivel. Isso NUNCA e gravado de volta no registro armazenado.
  function mergeForDecoration(base, incoming) {
    var out = {};
    Object.keys(base || {}).forEach(function (key) { out[key] = base[key]; });
    Object.keys(incoming || {}).forEach(function (key) {
      if (incoming[key]) out[key] = incoming[key];
    });
    return out;
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

    var cleanCurrent = cleanCopy(current);

    return {
      version: VERSION,
      account: account || '',
      visitor_id: createId(),
      first_touch: cleanCurrent,
      last_touch: cleanCurrent,
      last_touch_source: classifySource(cleanCurrent, referrer),
      source: classifySource(cleanCurrent, referrer),
      landing_page: landing,
      last_page: url,
      updated_at: nowIso(),
      history: [{ type: 'touch', at: nowIso(), data: cleanCurrent }]
    };
  }

  // -----------------------------------------------------------------------
  // Captura (first touch / last touch)
  // -----------------------------------------------------------------------
  var memoryRecord = null; // usado somente quando consentState !== 'granted'

  function capture() {
    if (!canTrack()) {
      // Nada e persistido antes do consentimento. Mantemos so um registro
      // efemero em memoria (perdido no reload) para a API nao quebrar.
      var current = getAttributionFromUrl(window.location.href);
      if (!memoryRecord) memoryRecord = makeBaseRecord(current);
      return memoryRecord;
    }

    var currentAttribution = getAttributionFromUrl(window.location.href);
    var stored = readStorage();
    var meaningful = hasCampaignData(currentAttribution);

    if (!stored || !stored.first_touch) {
      var initial = makeBaseRecord(currentAttribution);
      writeStorage(initial);
      return initial;
    }

    stored.account = account || stored.account || '';
    stored.last_page = window.location.href;
    stored.updated_at = nowIso();

    if (meaningful) {
      // FIX: last_touch passa a ser uma copia limpa do toque atual, nunca
      // uma mistura com o last_touch anterior. Uma campanha nova SUBSTITUI
      // o conjunto de atribuicao anterior por completo.
      var nextLast = cleanCopy(currentAttribution);
      stored.last_touch = nextLast;
      stored.last_touch_source = classifySource(nextLast, document.referrer);
      stored.source = stored.last_touch_source;
      stored.history = stored.history || [];
      stored.history.push({ type: 'touch', at: nowIso(), data: nextLast });
      if (stored.history.length > 20) stored.history = stored.history.slice(-20);
    }
    // Acesso direto (meaningful === false) nunca sobrescreve o last_touch
    // existente - preserva o ultimo canal pago/organico conhecido.

    writeStorage(stored);
    return stored;
  }

  function getRecord() {
    if (!canTrack()) return capture();
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
      source: record.last_touch_source || record.source || classifySource(last, document.referrer),
      landing_page: record.landing_page || {},
      current_page: window.location.href,
      updated_at: record.updated_at || nowIso(),
      consent: consentState
    };
  }

  // -----------------------------------------------------------------------
  // Decoracao de links (escopo restrito - nunca same-origin, so
  // Hotmart/Kiwify por padrao + dominios extras configurados)
  // -----------------------------------------------------------------------
  function matchesDomainList(host, list) {
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (!d) continue;
      // endsWith (nao indexOf com calculo manual de posicao): a formula
      // anterior dava falso positivo quando host e d tinham o mesmo
      // comprimento (indexOf retornava -1 e a posicao esperada tambem
      // era -1, entao -1===-1 batia mesmo sem nenhuma relacao real).
      if (host === d || host.endsWith('.' + d)) return true;
    }
    return false;
  }

  var HOTMART_DOMAINS = ['hotmart.com'];
  var KIWIFY_DOMAINS = ['kiwify.com.br', 'kiwify.com'];

  function classifyDestination(hostname) {
    var host = hostname.toLowerCase().replace(/^www\./, '');
    if (matchesDomainList(host, HOTMART_DOMAINS)) return 'hotmart';
    if (matchesDomainList(host, KIWIFY_DOMAINS)) return 'kiwify';
    if (matchesDomainList(host, extraDomains)) return 'custom';
    return null;
  }

  function isSameOrigin(hostname) {
    var host = hostname.toLowerCase().replace(/^www\./, '');
    var own = window.location.hostname.toLowerCase().replace(/^www\./, '');
    return host === own || host.endsWith('.' + own);
  }

  function addParamsToUrl(href) {
    var parsed = getUrlParams(href);
    if (!parsed) return href;
    if (!/^https?:$/i.test(parsed.protocol)) return href;

    // Nunca decora links internos/same-origin: a atribuicao ja fica
    // persistida em storage, nao precisa (nem deve) poluir a URL visivel
    // de paginas do proprio site.
    if (isSameOrigin(parsed.hostname)) return href;

    var destination = classifyDestination(parsed.hostname);
    if (!destination) return href; // dominio nao permitido: nao mexe no link

    if (!canTrack()) return href; // sem consentimento, nao decora nada

    var record = getRecord();
    var source = mergeForDecoration(record.first_touch || {}, record.last_touch || {});

    // Hotmart e Kiwify: so os parametros oficialmente documentados por
    // ambas (os 5 UTMs + src). Os 10 click IDs (fbclid, gclid etc.) NAO
    // sao enviados para essas duas plataformas - continuam sendo
    // capturados e armazenados normalmente pelo tracker (para uso futuro
    // na atribuicao/camada server-side), so nao vao mais na URL de saida
    // do checkout. Outros destinos (data-decorate-domains) continuam
    // recebendo o conjunto completo, como antes.
    var keysToDecorate = (destination === 'hotmart' || destination === 'kiwify')
      ? CAMPAIGN_KEYS
      : ATTRIBUTION_KEYS;

    keysToDecorate.forEach(function (key) {
      if (!parsed.searchParams.get(key) && source[key]) {
        parsed.searchParams.set(key, source[key]);
      }
    });

    // src: parametro de texto livre suportado tanto pela Hotmart quanto
    // pela Kiwify (confirmado na documentacao oficial de ambas). Nao
    // sintetizamos mais o "sck" concatenando UTMs - esse formato nao e
    // documentado por nenhuma das duas plataformas; se o link de destino
    // ja tiver um sck definido manualmente, ele e preservado como esta.
    if (destination === 'hotmart' || destination === 'kiwify') {
      if (!parsed.searchParams.get('src')) {
        var srcValue = source.utm_source || record.last_touch_source || record.source || '';
        if (srcValue) parsed.searchParams.set('src', srcValue);
      }
    }

    return parsed.toString();
  }

  function decorateAnchor(anchor) {
    if (!anchor || !anchor.tagName || anchor.tagName !== 'A' || !anchor.href) return;
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
    if (!decorateLinksEnabled) return;
    var scope = root || document;
    if (!scope.querySelectorAll) return;
    var anchors = scope.querySelectorAll('a[href]');
    Array.prototype.forEach.call(anchors, decorateAnchor);
  }

  // -----------------------------------------------------------------------
  // Formularios
  // -----------------------------------------------------------------------
  function injectFormFields(form) {
    if (!canTrack()) return;
    if (!form || !form.tagName || form.tagName !== 'FORM' || form.hasAttribute('data-cw-ignore')) return;
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

  function injectFormsIn(root) {
    if (!captureFormsEnabled) return;
    var scope = root || document;
    if (!scope.querySelectorAll) return;
    Array.prototype.forEach.call(scope.querySelectorAll('form'), injectFormFields);
  }

  function captureFormsOnPage() {
    injectFormsIn(document);
  }

  // -----------------------------------------------------------------------
  // MutationObserver (com deteccao de forms/links aninhados, mudanca de
  // href e debounce para paginas com muito churn de DOM)
  // -----------------------------------------------------------------------
  function setupObserver() {
    var pendingAdded = [];
    var pendingHrefNodes = [];
    var scheduled = false;

    function processPending() {
      scheduled = false;
      var added = pendingAdded; pendingAdded = [];
      var hrefNodes = pendingHrefNodes; pendingHrefNodes = [];

      added.forEach(function (node) {
        if (!node || node.nodeType !== 1) return;
        if (node.tagName === 'A') decorateAnchor(node);
        if (node.tagName === 'FORM') injectFormFields(node);
        decorateAllLinks(node); // links aninhados dentro do container adicionado
        injectFormsIn(node);    // forms aninhados dentro do container adicionado
      });

      hrefNodes.forEach(function (node) {
        if (node && node.tagName === 'A') decorateAnchor(node);
      });
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      // setTimeout (nao requestAnimationFrame): rAF fica suspenso
      // indefinidamente em abas em segundo plano/ocultas, o que atrasaria
      // a decoracao de links/forms adicionados dinamicamente enquanto a
      // aba nao esta em foco. setTimeout continua rodando (com throttling
      // do navegador, mas sem suspensao total) mesmo em background.
      window.setTimeout(processPending, 16);
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') {
          if (mutation.target) pendingHrefNodes.push(mutation.target);
          return;
        }
        Array.prototype.forEach.call(mutation.addedNodes, function (node) {
          pendingAdded.push(node);
        });
      });
      if (pendingAdded.length || pendingHrefNodes.length) schedule();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });

    return observer;
  }

  // -----------------------------------------------------------------------
  // Suporte a SPA (pushState / replaceState / popstate)
  // -----------------------------------------------------------------------
  function setupSpaSupport() {
    var lastHref = window.location.href;

    function onUrlChange() {
      if (window.location.href === lastHref) return;
      lastHref = window.location.href;
      if (!canTrack()) return;
      // capture() reaplica as mesmas regras de first/last touch: nunca
      // mexe no first_touch, e so troca o last_touch se o novo toque for
      // significativo (tiver UTM/click id).
      capture();
      decorateAllLinks(document);
      captureFormsOnPage();
      fireEvent('connectweb:tracking-updated', buildPublicData());
    }

    try {
      ['pushState', 'replaceState'].forEach(function (method) {
        var original = window.history[method];
        if (typeof original !== 'function') return;
        window.history[method] = function () {
          var result = original.apply(this, arguments);
          onUrlChange();
          return result;
        };
      });
    } catch (_) { /* history.pushState indisponivel/imutavel - ignora */ }

    window.addEventListener('popstate', onUrlChange);
  }

  // -----------------------------------------------------------------------
  // API publica de consentimento
  // -----------------------------------------------------------------------
  function runFullCapture() {
    capture();
    decorateAllLinks(document);
    captureFormsOnPage();
  }

  function setConsent(granted) {
    if (!consentRequired) return buildPublicData(); // no-op em modo sem consentimento
    if (granted) {
      consentState = 'granted';
      deleteCookieRaw(OPTOUT_COOKIE);
      memoryRecord = null;
      runFullCapture();
      fireEvent('connectweb:tracking-ready', buildPublicData());
    } else {
      consentState = 'denied';
      clearStorage();
      memoryRecord = null;
    }
    return buildPublicData();
  }

  function clear() {
    clearStorage();
    memoryRecord = null;
  }

  function optOut() {
    clear();
    consentState = 'denied';
    writeCookieRaw(OPTOUT_COOKIE, '1', 365 * 24 * 60 * 60);
  }

  // -----------------------------------------------------------------------
  // Inicializacao
  // -----------------------------------------------------------------------
  function init() {
    if (!account) log('Aviso: data-account nao informado.');
    consentState = resolveInitialConsent();
    log('Consentimento inicial:', consentState, consentRequired ? '(obrigatorio)' : '(nao exigido)');

    if (canTrack()) {
      runFullCapture();
    }

    setupObserver();
    setupSpaSupport();

    window.addEventListener('connectweb:consent-changed', function (e) {
      var granted = !!(e && e.detail && e.detail.granted);
      setConsent(granted);
    });

    window.ConnectWebTracking = {
      version: VERSION,
      account: account || '',
      get: buildPublicData,
      getRaw: getRecord,
      refresh: function () {
        if (!canTrack()) return buildPublicData();
        var next = capture();
        decorateAllLinks(document);
        captureFormsOnPage();
        return next;
      },
      decorateUrl: addParamsToUrl,
      setConsent: setConsent,
      clear: clear,
      optOut: optOut,
      hasConsent: canTrack,
      consentState: function () { return consentState; }
    };

    log('Inicializado', buildPublicData());
    if (canTrack()) fireEvent('connectweb:tracking-ready', buildPublicData());

    return canTrack() ? getRecord() : null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);

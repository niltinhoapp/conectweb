/* =====================================================================
   Conect Web — consent.js
   Consentimento de cookies (LGPD).

   IMPORTANTE: o Google Analytics (GA4) e o Meta Pixel NAO estao mais
   embutidos no HTML. Eles sao carregados APENAS por este arquivo, e
   somente depois que o visitante clica em "Aceitar". Enquanto nao ha
   consentimento, nenhum cookie de medicao/publicidade e criado.

   Preferencia guardada em localStorage ("cw_consent"): "accepted" | "rejected".
   A pagina /cookies/ pode chamar window.cwConsent.abrir() para reabrir o
   banner e permitir a troca da escolha a qualquer momento.
   ===================================================================== */
(function () {
  "use strict";

  var KEY = "cw_consent";
  var GA_ID = "G-MTNSGRC4ES";
  var PIXEL_ID = "1427951505078207";
  var carregado = false;

  /* ---------- Carregamento das ferramentas (so apos aceite) ---------- */
  function carregarGA() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  function carregarPixel() {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function ativarMedicao() {
    if (carregado) return;
    carregado = true;
    carregarGA();
    carregarPixel();
  }

  /* ---------- Banner ---------- */
  var banner = null;

  function fechar() {
    if (banner) { banner.remove(); banner = null; }
  }

  function decidir(valor) {
    try { localStorage.setItem(KEY, valor); } catch (e) { /* modo privado */ }
    fechar();
    if (valor === "accepted") ativarMedicao();
    else location.reload(); // garante que nada carregado continue ativo
  }

  function montarBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "cookiebar";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Aviso de cookies");
    banner.innerHTML =
      '<div class="cookiebar__inner">' +
        '<p class="cookiebar__txt">' +
          'Usamos cookies para medir o desempenho do site e melhorar sua experiência. ' +
          'Você escolhe: sem o seu aceite, nenhum cookie de medição ou publicidade é criado. ' +
          '<a href="/cookies/">Saiba mais</a>.' +
        '</p>' +
        '<div class="cookiebar__btns">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-consent="rejected">Recusar</button>' +
          '<button type="button" class="btn btn--primary btn--sm" data-consent="accepted">Aceitar</button>' +
        '</div>' +
      '</div>';

    banner.addEventListener("click", function (e) {
      var alvo = e.target.closest("[data-consent]");
      if (alvo) decidir(alvo.getAttribute("data-consent"));
    });

    document.body.appendChild(banner);
  }

  /* ---------- Inicializacao ---------- */
  var escolha = null;
  try { escolha = localStorage.getItem(KEY); } catch (e) { /* ignora */ }

  if (escolha === "accepted") {
    ativarMedicao();
  } else if (escolha !== "rejected") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", montarBanner);
    } else {
      montarBanner();
    }
  }

  /* API publica: usada pela pagina /cookies/ para trocar a escolha. */
  window.cwConsent = {
    abrir: montarBanner,
    estado: function () { return escolha || "pendente"; },
    limpar: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
      location.reload();
    }
  };
})();

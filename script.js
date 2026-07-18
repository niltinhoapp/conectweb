// =============================
// Conect Web - script.js
// Comentado para manutenção
// =============================

/**
 * CONFIGURAÇÕES
 * - troque o número se precisar
 * - DOMAIN entra na mensagem do WhatsApp
 */
const WHATSAPP_NUMBER = "5514996807881";
const DOMAIN = "conectweb.online";

/* =============================
   WhatsApp message helpers
   ============================= */
function baseMessage() {
  return (
    "Olá! Quero falar sobre um projeto de sistema/desenvolvimento.\n\n" +
    "Tipo de projeto: ____ (sistema / app / integração / automação / outro)\n" +
    "Necessidade: ____\n" +
    "Prazo ou orçamento: ____\n\n" +
    "Site: " + DOMAIN
  );
}

function filledMessage({ tipo, descricao, prazo }, utmText) {
  return (
    "Olá! Quero falar sobre um projeto de sistema/desenvolvimento.\n\n" +
    "Tipo de projeto: " + tipo + "\n" +
    "Necessidade: " + descricao + "\n" +
    "Prazo/orçamento: " + (prazo || "a combinar") + "\n\n" +
    "Site: " + DOMAIN +
    (utmText ? "\n\n" + utmText : "")
  );
}

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * TRACK
 * - envia pro console (debug), GA4 (gtag) e Meta Pixel (fbq)
 * - GA4 e Pixel são carregados via <script> no <head> de cada página
 *   (ver TODO com o ID real em index.html, integracao-de-sistemas/index.html
 *   e cartao/index.html — enquanto o ID for o placeholder, os eventos são
 *   enviados só pro "Testar eventos" ou ignorados, nada quebra)
 */
function track(eventName, extra = {}) {
  try {
    console.log("[track]", eventName, extra);
  } catch {}

  // Google Analytics (GA4)
  try {
    if (typeof gtag === "function") gtag("event", eventName, extra);
  } catch {}

  // Meta Pixel — eventos padrão (Lead/Contact) otimizam campanha melhor
  // que eventos customizados; o resto vai como trackCustom.
  try {
    if (typeof fbq !== "function") return;
    const isWhatsApp = String(extra.href || "").indexOf("wa.me") !== -1;

    if (eventName === "lead_submit") {
      fbq("track", "Lead", extra);
    } else if (isWhatsApp) {
      fbq("track", "Contact", extra);
    } else {
      fbq("trackCustom", eventName, extra);
    }
  } catch {}
}

/* =============================
   Smooth scroll
   ============================= */
function smoothScrollTo(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =============================
   UTM capture + persist
   - pega UTM da URL e salva no localStorage
   ============================= */
function getUTM() {
  const p = new URLSearchParams(window.location.search);

  const utm = {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content: p.get("utm_content") || "",
    utm_term: p.get("utm_term") || "",
  };

  const any = Object.values(utm).some(Boolean);

  if (any) {
    localStorage.setItem("conectweb_utm", JSON.stringify(utm));
    return utm;
  }

  const saved = localStorage.getItem("conectweb_utm");
  if (saved) {
    try { return JSON.parse(saved); } catch { return utm; }
  }

  return utm;
}

function utmToText(utmObj) {
  const any = Object.values(utmObj).some(Boolean);
  if (!any) return "";
  return (
    "UTM:\n" +
    "source=" + (utmObj.utm_source || "-") + "\n" +
    "medium=" + (utmObj.utm_medium || "-") + "\n" +
    "campaign=" + (utmObj.utm_campaign || "-") + "\n" +
    "content=" + (utmObj.utm_content || "-") + "\n" +
    "term=" + (utmObj.utm_term || "-")
  );
}

const utm = getUTM();
const utmText = utmToText(utm);

/* =============================
   Apply WhatsApp links
   - aplica href + target em todos [data-wa-btn]
   ============================= */
function applyDefaultWhatsAppLinks() {
  const msg = baseMessage() + (utmText ? "\n\n" + utmText : "");
  const link = waLink(msg);

  document.querySelectorAll("[data-wa-btn]").forEach((btn) => {
    btn.setAttribute("href", link);
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });
}
applyDefaultWhatsAppLinks();

/* =============================
   Track clicks by data-event
   ============================= */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-event]");
  if (!el) return;
  track(el.getAttribute("data-event"), { href: el.getAttribute("href") || "" });
});

/* =============================
   Smooth scroll para âncoras (#)
   ============================= */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    smoothScrollTo(href);
  });
});

/* =============================
   Mobile menu (abre/fecha)
   - usa [hidden] e aria-expanded
   ============================= */
const btnMenu = document.querySelector("[data-menu-btn]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (btnMenu && mobileMenu) {
  btnMenu.addEventListener("click", () => {
    const isOpen = !mobileMenu.hasAttribute("hidden");
    if (isOpen) mobileMenu.setAttribute("hidden", "");
    else mobileMenu.removeAttribute("hidden");

    btnMenu.setAttribute("aria-expanded", String(!isOpen));
    track("toggle_mobile_menu", { open: !isOpen });
  });

  // Fecha ao clicar em qualquer link dentro do menu
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileMenu.setAttribute("hidden", "");
      btnMenu.setAttribute("aria-expanded", "false");
    });
  });
}

/* =============================
   FAQ accordion (acessível)
   - alterna aria-expanded + hidden
   ============================= */
(function faqAccordion(){
  const faq = document.querySelector("[data-faq]");
  if (!faq) return;

  const questions = Array.from(faq.querySelectorAll(".faq__q"));

  questions.forEach((q) => {
    const ans = q.nextElementSibling; // .faq__a
    if (!ans) return;

    // garante estado inicial
    q.setAttribute("aria-expanded", "false");
    ans.setAttribute("hidden", "");

    q.addEventListener("click", () => {
      const isOpen = q.getAttribute("aria-expanded") === "true";

      // fecha todos
      questions.forEach((qq) => {
        qq.setAttribute("aria-expanded", "false");
        const aa = qq.nextElementSibling;
        if (aa) aa.setAttribute("hidden", "");
      });

      // abre somente o clicado (se não estava aberto)
      if (!isOpen) {
        q.setAttribute("aria-expanded", "true");
        ans.removeAttribute("hidden");
      }

      track("faq_toggle", {
        open: !isOpen,
        title: q.textContent.trim().slice(0, 60)
      });
    });
  });
})();

/* =============================
   Lead form -> WhatsApp
   - valida e abre WhatsApp com msg pronta
   ============================= */
const form = document.querySelector("[data-lead-form]");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const tipo = String(fd.get("tipo") || "").trim();
    const descricao = String(fd.get("descricao") || "").trim();
    const prazo = String(fd.get("prazo") || "").trim();
    const aceite = fd.get("aceite");

    if (!tipo || !descricao || !aceite) {
      alert("Preencha o tipo, a descrição e marque o aceite para enviar no WhatsApp.");
      return;
    }

    const msg = filledMessage({ tipo, descricao, prazo }, utmText);
    const link = waLink(msg);

    track("lead_submit", { tipo, descricao, prazo, utm });

    window.open(link, "_blank", "noopener");
  });
}

/* =============================
   Reveal on scroll (animação de entrada)
   - adiciona .in quando o elemento entra na tela
   ============================= */
(function revealOnScroll(){
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el) => io.observe(el));
})();

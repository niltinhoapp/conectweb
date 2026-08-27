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
  return "Olá! Conheci a Conect Web pelo site e gostaria de conversar sobre um projeto.";
}

function filledMessage({ tipo, estagio, descricao, prazo }, utmText) {
  return (
    "Olá! Quero falar sobre um projeto de sistema/desenvolvimento.\n\n" +
    "Tipo de projeto: " + tipo + "\n" +
    "Estágio do projeto: " + estagio + "\n" +
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
 * - GA4 e Meta Pixel são carregados no <head> do index.html
 *   (troque os IDs placeholder G-XXXXXXXXXX e 0000000000000000 pelos
 *   IDs reais antes de rodar tráfego — enquanto forem placeholder,
 *   os eventos são processados aqui mas não chegam a nenhuma conta real)
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

    if (eventName === "lead_submit") {
      fbq("track", "Lead", extra);
    } else if (eventName === "whatsapp_click") {
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
  const lines = [];

  if (utmObj.utm_source) {
    lines.push(
      "Origem: " + utmObj.utm_source +
      (utmObj.utm_medium ? " (" + utmObj.utm_medium + ")" : "")
    );
  }
  if (utmObj.utm_campaign) lines.push("Campanha: " + utmObj.utm_campaign);
  if (utmObj.utm_content) lines.push("Anúncio: " + utmObj.utm_content);
  if (utmObj.utm_term) lines.push("Termo: " + utmObj.utm_term);

  if (!lines.length) return "";
  return "Origem do contato:\n" + lines.join("\n");
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

  const eventName = el.getAttribute("data-event");
  const payload = { href: el.getAttribute("href") || "" };

  if (eventName === "cta_click") {
    payload.cta_name =
      el.getAttribute("data-cta") || el.textContent.trim().slice(0, 60);
    payload.page_path = window.location.pathname;
    payload.page_title = document.title;
  }

  track(eventName, payload);
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

// form_start: dispara 1x quando o usuário realmente começa a preencher
// (primeiro foco em qualquer campo), não quando o formulário só aparece.
if (form) {
  let formStarted = false;
  form.addEventListener("focusin", () => {
    if (formStarted) return;
    formStarted = true;
    track("form_start", { page_path: window.location.pathname });
  });
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const tipo = String(fd.get("tipo") || "").trim();
    const estagio = String(fd.get("estagio") || "").trim();
    const descricao = String(fd.get("descricao") || "").trim();
    const prazo = String(fd.get("prazo") || "").trim();
    const aceite = fd.get("aceite");

    if (!tipo || !estagio || !descricao || !aceite) {
      alert("Preencha o tipo, o estágio, a descrição e marque o aceite para enviar no WhatsApp.");
      return;
    }

    const msg = filledMessage({ tipo, estagio, descricao, prazo }, utmText);
    const link = waLink(msg);

    track("lead_submit", { tipo, estagio, descricao, prazo, utm });

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

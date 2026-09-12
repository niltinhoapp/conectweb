from pathlib import Path
import re

index = Path('index.html')
html = index.read_text()

new_section = r'''<section class="section capabilities-section" id="capacidades"><div class="container"><header class="section__head capabilities-head"><span class="eyebrow">O que fazemos</span><h2>Capacidades para construir, integrar e evoluir sua operação</h2><p>Da arquitetura ao produto em produção, atuamos nas frentes necessárias para resolver problemas reais com tecnologia, clareza técnica e responsabilidade de ponta a ponta.</p><span class="capabilities-hint">Selecione uma capacidade para ver como ela se transforma em solução.</span></header>

<div class="capabilities-grid" data-capabilities-grid>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Engenharia de software"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">01</span><span class="cap-card__type">Base tecnológica</span></div><div><h3>Engenharia de software</h3><p>Transformamos regras de negócio, processos e operações em sistemas confiáveis, organizados e preparados para evoluir.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Engenharia de software</span><h3>Software sob medida começa entendendo a operação antes de escrever código.</h3><p class="cap-detail__lead">Mapeamos usuários, regras, permissões, fluxos e pontos críticos. A partir disso, estruturamos uma solução que faça sentido para o negócio e possa crescer sem virar um conjunto de remendos.</p><div class="cap-detail__grid"><div><strong>Onde atuamos</strong><p>Sistemas internos, plataformas web, painéis operacionais, produtos SaaS, portais e ferramentas específicas para processos que não cabem bem em soluções prontas.</p></div><div><strong>Como construímos</strong><p>Arquitetura, banco de dados, autenticação, regras de acesso, integrações, testes e publicação são tratados como partes do mesmo produto, com entregas por etapas.</p></div><div><strong>Quando faz sentido</strong><p>Quando planilhas, ferramentas desconectadas ou processos manuais começam a limitar a operação, aumentar erros ou dificultar controle e escala.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_engenharia">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Integrações e APIs"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">02</span><span class="cap-card__type">Conectividade</span></div><div><h3>Integrações &amp; APIs</h3><p>Conectamos sistemas para que dados e ações circulem com menos retrabalho, menos duplicidade e mais previsibilidade.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Integrações &amp; APIs</span><h3>Sistemas conectados eliminam tarefas repetidas e reduzem pontos cegos na operação.</h3><p class="cap-detail__lead">Projetamos integrações pensando em autenticação, consistência dos dados, falhas temporárias, reprocessamento e rastreabilidade. Não basta conectar duas pontas, é preciso garantir que a operação continue confiável.</p><div class="cap-detail__grid"><div><strong>O que conectamos</strong><p>ERP, CRM, e-commerce, pagamentos, logística, WhatsApp, plataformas de atendimento, sistemas próprios e serviços externos com API ou webhooks.</p></div><div><strong>O que tratamos</strong><p>Sincronização de cadastros, pedidos, status, eventos, notificações e dados operacionais, com validação e tratamento de erros.</p></div><div><strong>Quando faz sentido</strong><p>Quando a equipe precisa copiar informação entre ferramentas, conferir dados manualmente ou lidar com sistemas que funcionam isolados.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_integracoes">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Automação e IA"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">03</span><span class="cap-card__type">Eficiência operacional</span></div><div><h3>Automação &amp; IA</h3><p>Automatizamos tarefas previsíveis e usamos IA onde ela realmente melhora atendimento, triagem, análise ou tomada de decisão.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Automação &amp; IA</span><h3>Automação boa reduz esforço sem tirar controle da empresa.</h3><p class="cap-detail__lead">Desenhamos fluxos com regras claras, limites, registros e pontos de intervenção humana. Quando usamos IA, ela entra com contexto e responsabilidade, não como uma camada solta sobre o processo.</p><div class="cap-detail__grid"><div><strong>Aplicações práticas</strong><p>Atendimento inicial, classificação de solicitações, respostas assistidas, notificações, follow-up, leitura de dados e execução de rotinas acionadas por eventos.</p></div><div><strong>Controles importantes</strong><p>Handoff humano, histórico, regras de horário, conhecimento autorizado, validação de ações e monitoramento de falhas.</p></div><div><strong>Quando faz sentido</strong><p>Quando atividades repetitivas consomem tempo da equipe ou quando o volume de atendimento e informação cresce mais rápido que a operação.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_automacao">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Produtos digitais"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">04</span><span class="cap-card__type">Produto e negócio</span></div><div><h3>Produtos digitais</h3><p>Estruturamos ideias em produtos utilizáveis, com fluxo real, base técnica consistente e espaço para validar e evoluir.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Produtos digitais</span><h3>Um produto digital precisa funcionar para o usuário e continuar sustentável para quem opera.</h3><p class="cap-detail__lead">Trabalhamos da definição do fluxo principal até a estrutura necessária para colocar o produto em uso real. Priorizamos o que precisa existir primeiro e evitamos complexidade prematura.</p><div class="cap-detail__grid"><div><strong>O que pode nascer aqui</strong><p>SaaS, plataformas de nicho, portais, ferramentas internas que evoluem para produto e soluções digitais com operação recorrente.</p></div><div><strong>O que estruturamos</strong><p>Jornadas, perfis de acesso, dados, integrações, painel, regras de negócio, publicação e base para novas versões.</p></div><div><strong>Quando faz sentido</strong><p>Quando existe um problema claro, uma operação que pode ser transformada em produto ou uma oportunidade que precisa sair da ideia e chegar ao uso real.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_produtos">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Mobile"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">05</span><span class="cap-card__type">Experiência em campo</span></div><div><h3>Mobile</h3><p>Criamos experiências para Android e PWA quando o celular faz parte do processo, da equipe ou da jornada do cliente.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Mobile</span><h3>Mobile faz sentido quando aproxima o sistema de onde o trabalho realmente acontece.</h3><p class="cap-detail__lead">A decisão por aplicativo ou PWA parte do uso, não da tendência. Avaliamos acesso, frequência, recursos necessários, conectividade e manutenção antes de definir a melhor abordagem.</p><div class="cap-detail__grid"><div><strong>Cenários comuns</strong><p>Equipe externa, consulta rápida, operação em campo, acompanhamento de clientes, execução de tarefas e acesso recorrente a funções específicas.</p></div><div><strong>O que cuidamos</strong><p>Experiência responsiva, autenticação, permissões, integração com backend, estados de carregamento, erros e comportamento em diferentes tamanhos de tela.</p></div><div><strong>Quando faz sentido</strong><p>Quando o celular é o principal ponto de acesso ou quando uma experiência dedicada reduz atrito em atividades frequentes.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_mobile">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

<article class="cap-card" data-cap-card tabindex="0" role="button" aria-expanded="false" aria-label="Abrir detalhes de Web de alta performance"><div class="cap-card__inner">
<div class="cap-card__face cap-card__front"><div class="cap-card__meta"><span class="cap-card__number">06</span><span class="cap-card__type">Presença e conversão</span></div><div><h3>Web de alta performance</h3><p>Sites e landing pages com velocidade, clareza, responsividade e estrutura técnica coerente com o objetivo comercial.</p></div><span class="cap-card__action">Ver como aplicamos</span></div>
<div class="cap-card__face cap-card__back"><button class="cap-card__close" type="button" data-cap-close aria-label="Voltar">Voltar</button><div class="cap-detail"><span class="cap-detail__eyebrow">Web de alta performance</span><h3>Uma boa página precisa comunicar bem, carregar rápido e facilitar a próxima ação.</h3><p class="cap-detail__lead">Tratamos conteúdo, hierarquia visual, responsividade e base técnica como parte da mesma entrega. O objetivo é evitar páginas bonitas que falham em clareza, velocidade ou manutenção.</p><div class="cap-detail__grid"><div><strong>O que desenvolvemos</strong><p>Sites institucionais, landing pages, páginas de produto e interfaces web ligadas a sistemas e campanhas.</p></div><div><strong>O que observamos</strong><p>Performance, acessibilidade, SEO técnico, estrutura semântica, analytics, experiência mobile e integração com formulários ou sistemas.</p></div><div><strong>Quando faz sentido</strong><p>Quando a presença digital precisa representar melhor a empresa, apoiar aquisição ou conectar marketing e operação com uma base profissional.</p></div></div><a class="btn btn--primary" href="#contato" data-event="cta_click" data-cta="cap_web">Conversar sobre este tipo de projeto</a></div></div>
</div></article>

</div><div class="capabilities-backdrop" data-cap-backdrop hidden></div></div></section>'''

pattern = re.compile(r'<section class="section section--alt"><div class="container"><header class="section__head"><span class="eyebrow">O que fazemos</span>.*?</section>\n\n<section id="parceiros"', re.S)
match = pattern.search(html)
if not match:
    raise SystemExit('Seção O que fazemos não encontrada')
html = pattern.sub(new_section + '\n\n<section id="parceiros"', html, count=1)

js_marker = '/* CAPABILITIES_INTERACTION */'
js = r'''<script>
/* CAPABILITIES_INTERACTION */
(() => {
  const cards = [...document.querySelectorAll('[data-cap-card]')];
  const backdrop = document.querySelector('[data-cap-backdrop]');
  let activeCard = null;
  let lastFocus = null;

  const openCard = (card) => {
    if (!card || activeCard === card) return;
    if (activeCard) closeCard(activeCard, false);
    activeCard = card;
    lastFocus = document.activeElement;
    card.classList.add('is-open');
    card.setAttribute('aria-expanded', 'true');
    document.body.classList.add('capability-open');
    if (backdrop) backdrop.hidden = false;
    requestAnimationFrame(() => {
      backdrop?.classList.add('is-visible');
      card.classList.add('is-flipped');
      card.querySelector('[data-cap-close]')?.focus({preventScroll:true});
    });
  };

  const closeCard = (card = activeCard, restoreFocus = true) => {
    if (!card) return;
    card.classList.remove('is-flipped');
    card.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('is-visible');
    window.setTimeout(() => {
      card.classList.remove('is-open');
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove('capability-open');
      activeCard = null;
      if (restoreFocus && lastFocus instanceof HTMLElement) lastFocus.focus({preventScroll:true});
    }, 280);
  };

  cards.forEach(card => {
    card.addEventListener('click', (event) => {
      const close = event.target.closest('[data-cap-close]');
      const cta = event.target.closest('a');
      if (close) { event.stopPropagation(); closeCard(card); return; }
      if (cta) return;
      if (!card.classList.contains('is-open')) openCard(card);
      else if (card.classList.contains('is-flipped')) closeCard(card);
    });
    card.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a,button')) {
        event.preventDefault();
        card.classList.contains('is-open') ? closeCard(card) : openCard(card);
      }
    });
  });

  backdrop?.addEventListener('click', () => closeCard());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeCard) closeCard();
  });
})();
</script>'''
if js_marker not in html:
    html = html.replace('</body>', js + '\n</body>')

index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
css_marker = '/* CAPABILITIES_SECTION_V2 */'
if css_marker not in css:
    css += r'''

/* CAPABILITIES_SECTION_V2 */
.capabilities-section{
  position:relative;
  overflow:clip;
  background:
    radial-gradient(900px 480px at 8% 0%,rgba(37,99,235,.08),transparent 60%),
    radial-gradient(700px 420px at 96% 96%,rgba(124,58,237,.07),transparent 60%),
    var(--bg-subtle);
  border-block:1px solid var(--line);
}
.capabilities-head{max-width:790px;margin-bottom:48px}
.capabilities-head h2{max-width:760px;margin-inline:auto}
.capabilities-hint{display:inline-flex;margin-top:18px;padding:8px 13px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.72);font-size:12.5px;font-weight:700;color:var(--muted);letter-spacing:.01em}
.capabilities-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;position:relative;z-index:2}
.cap-card{position:relative;min-height:310px;perspective:1600px;border-radius:24px;outline:none;cursor:pointer}
.cap-card__inner{position:relative;width:100%;height:100%;min-height:310px;transform-style:preserve-3d;transition:transform .68s cubic-bezier(.2,.72,.2,1),box-shadow .25s ease,border-radius .25s ease}
.cap-card__face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:24px;border:1px solid var(--line);overflow:hidden}
.cap-card__front{display:flex;flex-direction:column;justify-content:space-between;gap:34px;padding:28px;background:linear-gradient(145deg,#fff 0%,#fbfcff 68%,#f5f7fb 100%);box-shadow:var(--shadow-sm)}
.cap-card__front::before{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-86px;top:-92px;background:var(--grad-soft);filter:blur(2px);pointer-events:none}
.cap-card__front::after{content:"";position:absolute;left:28px;right:28px;bottom:62px;height:1px;background:linear-gradient(90deg,var(--line),transparent);pointer-events:none}
.cap-card__meta{display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;z-index:1}
.cap-card__number{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--dark);color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em}
.cap-card__type{font-size:11.5px;font-weight:700;letter-spacing:.065em;text-transform:uppercase;color:var(--brand)}
.cap-card h3{font-size:clamp(21px,2vw,25px);margin:0 0 12px;position:relative;z-index:1}
.cap-card__front p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.68;position:relative;z-index:1}
.cap-card__action{position:relative;z-index:1;display:inline-flex;align-items:center;width:max-content;font-size:13px;font-weight:750;color:var(--brand-ink);padding-top:4px}
.cap-card:hover .cap-card__front,.cap-card:focus-visible .cap-card__front{border-color:#c5cddd;box-shadow:var(--shadow);transform:translateY(-3px)}
.cap-card__back{transform:rotateY(180deg);padding:clamp(28px,4vw,52px);background:linear-gradient(145deg,#0b0d14,#111827 62%,#151b2a);border-color:rgba(255,255,255,.12);color:#fff;overflow:auto}
.cap-card.is-open{position:fixed;z-index:102;inset:clamp(14px,3vw,34px);width:auto;height:auto;min-height:0;cursor:default}
.cap-card.is-open .cap-card__inner{min-height:100%;height:100%;box-shadow:0 38px 100px -26px rgba(0,0,0,.72)}
.cap-card.is-flipped .cap-card__inner{transform:rotateY(180deg)}
.cap-card.is-open .cap-card__face{border-radius:28px}
.capabilities-backdrop{position:fixed;inset:0;z-index:101;background:rgba(8,11,18,.68);backdrop-filter:blur(10px);opacity:0;transition:opacity .28s ease}
.capabilities-backdrop.is-visible{opacity:1}
body.capability-open{overflow:hidden}
.cap-card__close{position:sticky;top:0;margin-left:auto;display:flex;align-items:center;justify-content:center;min-width:84px;height:38px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:13px;font-weight:700;cursor:pointer;z-index:4;backdrop-filter:blur(10px)}
.cap-card__close:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.3)}
.cap-detail{max-width:1040px;margin:clamp(8px,2vh,24px) auto 0;display:flex;flex-direction:column;min-height:calc(100% - 58px);justify-content:center}
.cap-detail__eyebrow{font-size:12px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:#93c5fd;margin-bottom:14px}
.cap-detail h3{max-width:820px;color:#fff;font-size:clamp(30px,4.8vw,56px);line-height:1.04;letter-spacing:-.04em;margin-bottom:20px}
.cap-detail__lead{max-width:840px;color:rgba(226,232,240,.78);font-size:clamp(16px,1.6vw,20px);line-height:1.72;margin:0 0 clamp(28px,4vw,42px)}
.cap-detail__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:30px}
.cap-detail__grid>div{padding:22px;border-radius:18px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1)}
.cap-detail__grid strong{display:block;color:#fff;margin-bottom:8px;font-size:14px}
.cap-detail__grid p{margin:0;color:rgba(226,232,240,.68);font-size:14px;line-height:1.65}
.cap-detail>.btn{align-self:flex-start}

@media (max-width:1000px){.capabilities-grid{grid-template-columns:repeat(2,1fr)}.cap-detail__grid{grid-template-columns:1fr 1fr}.cap-detail__grid>div:last-child{grid-column:1/-1}}
@media (max-width:720px){
  .capabilities-head{text-align:left;margin-bottom:30px}.capabilities-head h2{margin-inline:0}.capabilities-hint{line-height:1.35}
  .capabilities-grid{grid-template-columns:1fr;gap:12px}.cap-card,.cap-card__inner{min-height:260px}.cap-card__front{padding:22px;gap:24px}.cap-card__front::after{left:22px;right:22px}
  .cap-card.is-open{inset:8px}.cap-card.is-open .cap-card__face{border-radius:22px}.cap-card__back{padding:18px}
  .cap-detail{justify-content:flex-start;margin-top:8px;padding-bottom:18px}.cap-detail h3{font-size:clamp(27px,9vw,38px);margin-bottom:14px}.cap-detail__lead{font-size:15.5px;margin-bottom:20px}.cap-detail__grid{grid-template-columns:1fr;gap:10px;margin-bottom:20px}.cap-detail__grid>div:last-child{grid-column:auto}.cap-detail__grid>div{padding:16px}.cap-detail>.btn{width:100%}.cap-card__close{position:sticky;top:0}
}
@media (prefers-reduced-motion:reduce){.cap-card__inner,.capabilities-backdrop{transition:none!important}}
'''
    styles.write_text(css)

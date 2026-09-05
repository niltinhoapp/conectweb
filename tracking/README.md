# ConnectWeb Tracking V1.1

ConnectWeb Tracking é um script JavaScript universal que captura e
preserva a origem do visitante durante a navegação e transporta os
parâmetros de atribuição até o checkout/destino final. Resolve a perda
de origem entre `anúncio → site/LP → navegação → botão/formulário →
checkout` — nada além disso. Não é uma plataforma de analytics, CRM,
gestão de leads ou concorrente das ferramentas de atribuição das
próprias plataformas de anúncio.

## Compatibilidade universal

O núcleo não tem nenhuma dependência de plataforma. Se o site permite
inserir um `<script>` (no `<head>` ou em qualquer parte do HTML), o
Tracking funciona — independente de a página ser HTML puro, PHP,
WordPress, Elementor, Shopify, Nuvemshop, Wix, Webflow, Framer, React,
Next.js ou qualquer outro ambiente que permita JavaScript.

## O que este produto NÃO é

Fora de escopo, permanentemente — não por falta de tempo, mas por
decisão de produto:

- Dashboard de analytics, CRM ou gestão de leads.
- Sistema de anúncios, públicos ou remarketing.
- Substituto do Meta Pixel, Google Analytics ou das ferramentas de
  atribuição de Meta/Google/TikTok Ads.
- Atribuição própria de conversões publicitárias, CAPI ou qualquer
  envio de eventos de conversão para plataformas de anúncio.
- Banco de dados de clientes ou coleta de nome, telefone, e-mail ou
  qualquer dado pessoal como finalidade do produto — o tracker só lida
  com parâmetros de atribuição (UTMs, click IDs, IDs técnicos gerados
  pelo próprio script).
- Sistema de gerenciamento de consentimento (CMP) ou banner de
  cookies — o suporte a consentimento existente é opt-in e reage a um
  consentimento já resolvido por outro sistema no site; o Tracking não
  exige que o cliente instale nada além dele mesmo.

Regra para qualquer funcionalidade nova: "isso é necessário para
preservar e transportar a origem do visitante até o checkout?" Se não
for, não entra no V1.

## Requisitos de navegador

Requer `URL`/`URLSearchParams`, `MutationObserver`, `CustomEvent` e `JSON`
nativos — todos disponíveis em qualquer navegador evergreen desde
aproximadamente 2017 (Chrome, Firefox, Safari, Edge). **Internet Explorer
não é suportado**: o script detecta a ausência dessas APIs e simplesmente
não executa, em vez de lançar erros.

## Instalação

Modo simples (sem exigir consentimento prévio — mantém compatibilidade com
a V1 original):

```html
<script src="https://SEU-DOMINIO/tracking/tracker.js" data-account="CW_xxx" defer></script>
```

Modo com consentimento obrigatório (LGPD/GDPR):

```html
<script src="https://SEU-DOMINIO/tracking/tracker.js"
  data-account="CW_xxx"
  data-consent-required="true"
  data-consent-cookie="meu_cookie_de_consentimento"
  data-consent-cookie-value="granted"
  defer></script>
```

O `data-account` identifica a conta do cliente **e também isola o
armazenamento**: cada conta grava em uma chave própria de localStorage/
cookie, então trocar de conta no mesmo domínio nunca reaproveita ou
sobrescreve dados de outra conta — só passa a gravar em um slot separado.

### Atributos disponíveis

| Atributo | Padrão | Efeito |
|---|---|---|
| `data-account` | — | Identifica a conta e isola o storage. |
| `data-debug` | `false` | Loga eventos no console. |
| `data-decorate-links` | `true` | Liga/desliga a decoração de links. |
| `data-capture-forms` | `true` | Liga/desliga a injeção de campos ocultos em formulários. |
| `data-decorate-domains` | — | Lista de domínios extras (separados por vírgula) a decorar, além de Hotmart/Kiwify. |
| `data-consent-required` | `false` | Se `true`, nada é capturado/persistido/decorado antes do consentimento. |
| `data-consent-granted` | `false` | Se `true`, assume consentimento já concedido no carregamento (ex.: quando o host page já resolveu isso no servidor). |
| `data-consent-cookie` | — | Nome de um cookie já existente (ex.: do CMP/consent.js do site) usado para checar consentimento já dado. |
| `data-consent-cookie-value` | `granted` | Valor esperado nesse cookie para considerar consentimento concedido. |

## O que a V1.1 faz

- Captura UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`).
- Captura click IDs: `fbclid`, `gclid`, `gbraid`, `wbraid`, `ttclid`, `msclkid`, `twclid`, `li_fat_id`, `yclid` e `dclid`.
- Registra **first touch** (nunca sobrescrito) e **last touch** — uma campanha nova **substitui por completo** o conjunto de atribuição anterior (nunca mistura `utm_campaign` de uma campanha com `gclid` de outra). Acesso direto nunca apaga o last touch existente.
- Persiste em `localStorage` (principal) com cookie como fallback, ambos com TTL de 90 dias verificado na leitura (registro expirado inicia um novo ciclo de atribuição). Cookie gravado sem o histórico completo (evita estourar o limite de ~4KB) e com `Secure` quando o site é HTTPS.
- Preserva parâmetros ao navegar por links — **apenas** para domínios permitidos: Hotmart e Kiwify por padrão, mais qualquer domínio listado em `data-decorate-domains`. Links internos (mesmo domínio) e qualquer domínio não listado **nunca** são alterados.
- Para Hotmart e Kiwify especificamente, só os parâmetros oficialmente documentados por ambas vão para a URL de saída: os 5 UTMs + `src`. Os 10 click IDs (`fbclid`, `gclid` etc.) **não** são enviados a essas duas plataformas — continuam sendo capturados e armazenados normalmente pelo tracker (disponíveis via `get()`/`getRaw()` para uso futuro na atribuição/camada server-side), só não vão mais na URL do checkout. Destinos configurados via `data-decorate-domains` continuam recebendo o conjunto completo de parâmetros.
- Adiciona o parâmetro `src` (texto livre, suportado oficialmente por Hotmart e Kiwify) quando o destino é uma dessas plataformas e o link ainda não tem um `src` definido. Não sintetiza mais um `sck` artificial — esse comportamento não é documentado oficialmente por nenhuma das duas plataformas; se o link já tiver `sck`, ele é preservado como está.
- Injeta dados de atribuição em formulários como campos ocultos, incluindo formulários adicionados dinamicamente e **aninhados** dentro de containers inseridos depois do carregamento.
- Detecta mudanças de `href` em links já existentes (não só links novos).
- Detecta navegação de SPA via `pushState`/`replaceState`/`popstate`, atualizando o last touch quando aplicável sem nunca recriar o first touch.
- Processa mutações do DOM em lote (debounce via `requestAnimationFrame`) para não sobrecarregar páginas com muito churn de DOM.
- Suporte a consentimento configurável por conta: em modo `data-consent-required="true"`, nada é gravado em `localStorage`/cookie nem decorado em links/formulários antes da concessão. Integração via `window.ConnectWebTracking.setConsent(true|false)` ou pelo evento `connectweb:consent-changed`.
- API pública `window.ConnectWebTracking`: `get()`, `getRaw()`, `refresh()`, `decorateUrl()`, `setConsent()`, `clear()`, `optOut()`, `hasConsent()`, `consentState()`.

## Limites intencionais da V1.1

É, por decisão de produto, **só** um tracker client-side: captura,
preserva e transporta a origem do visitante até o checkout. Ela **não
envia conversões para Meta, Google ou TikTok** e não promete que uma
plataforma de anúncios registre toda conversão — isso é papel do pixel/
CAPI de cada plataforma, não deste script. Ver "O que este produto NÃO
é" acima para a lista completa do que está permanentemente fora de
escopo.

## Teste

- `/tracking/` — página de demonstração manual (mesma da V1, com botões de consentimento adicionados).
- `/tracking/tests.html` — suíte de testes automatizados (roda no navegador, sem dependências) cobrindo os cenários abaixo.

Cenários cobertos pela suíte automatizada:

1. Acesso direto (sem UTM).
2. Facebook com UTMs completos.
3. Google Ads só com `gclid`.
4. Troca Facebook → Google (verifica que o last touch não mistura campos).
5. Troca Google → Facebook.
6. Campanha completa → campanha parcial (mesmo teste do bug do merge, na outra direção).
7. Retorno direto (não apaga o last touch existente).
8. Múltiplas páginas (persistência entre navegações).
9. Link interno (não deve ser decorado).
10. Link externo não listado (não deve ser decorado).
11. Link Hotmart (deve ganhar UTMs + `src`).
12. Link Kiwify (deve ganhar UTMs + `src`).
13. Formulário presente no carregamento inicial.
14. Formulário inserido dinamicamente.
15. Formulário aninhado dentro de um container inserido dinamicamente.
16. Navegação SPA via `pushState`.
17. Consentimento aceito (modo `data-consent-required`).
18. Consentimento negado (modo `data-consent-required`).
19. Opt-out (`optOut()` + persistência do opt-out entre reloads).
20. Expiração por TTL (registro antigo simulado é descartado).
21. Troca de `data-account` (isolamento — não reaproveita dados da conta anterior).
22. Alteração dinâmica de `href` para Hotmart (o link é decorado ao virar um destino permitido).
23. Alteração dinâmica de `href` de volta para um destino não permitido (o link não fica decorado indevidamente).
24. Hotmart/Kiwify recebem só os parâmetros documentados (sem click IDs), que continuam armazenados internamente.
25. Entrada por TikTok (`ttclid`).
26. Preservação de um `sck` pré-existente no link de destino (nunca sintetizado, nunca sobrescrito).
27. Link inserido dinamicamente (novo `<a>`, via `MutationObserver`) é decorado sem click IDs.

## Próximas etapas

Só o que continua dentro do escopo do V1 (capturar → preservar →
transportar) — ver "O que este produto NÃO é" acima para o que
permanece deliberadamente fora:

1. Testes de regressão automatizados em CI (a suíte atual roda manualmente no navegador).
2. Suporte a novos destinos de checkout além de Hotmart/Kiwify, caso surja demanda real
   (mesmo modelo: só os parâmetros de atribuição, nunca uma integração específica de
   plataforma).

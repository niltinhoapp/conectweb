# ConnectWeb Tracking V1.1

Primeira versão do produto de rastreamento e atribuição da ConnectWeb.

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
- Adiciona o parâmetro `src` (texto livre, suportado oficialmente por Hotmart e Kiwify) quando o destino é uma dessas plataformas e o link ainda não tem um `src` definido. Não sintetiza mais um `sck` artificial — esse comportamento não é documentado oficialmente por nenhuma das duas plataformas; se o link já tiver `sck`, ele é preservado como está.
- Injeta dados de atribuição em formulários como campos ocultos, incluindo formulários adicionados dinamicamente e **aninhados** dentro de containers inseridos depois do carregamento.
- Detecta mudanças de `href` em links já existentes (não só links novos).
- Detecta navegação de SPA via `pushState`/`replaceState`/`popstate`, atualizando o last touch quando aplicável sem nunca recriar o first touch.
- Processa mutações do DOM em lote (debounce via `requestAnimationFrame`) para não sobrecarregar páginas com muito churn de DOM.
- Suporte a consentimento configurável por conta: em modo `data-consent-required="true"`, nada é gravado em `localStorage`/cookie nem decorado em links/formulários antes da concessão. Integração via `window.ConnectWebTracking.setConsent(true|false)` ou pelo evento `connectweb:consent-changed`.
- API pública `window.ConnectWebTracking`: `get()`, `getRaw()`, `refresh()`, `decorateUrl()`, `setConsent()`, `clear()`, `optOut()`, `hasConsent()`, `consentState()`.

## Limites intencionais da V1.1

Ainda é um tracker client-side. Ela **não envia conversões para Meta,
Google ou TikTok** e não promete que uma plataforma de anúncios registre
toda conversão. O próximo estágio é adicionar uma camada server-side/
eventos, mantendo o mesmo modelo de atribuição.

Isso ainda é uma biblioteca de cliente única por domínio, não um produto
SaaS multi-conta completo: falta painel, API de ingestão server-side,
autenticação multi-tenant e testes automatizados de regressão contínua.

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

## Próximas etapas

1. Endpoint de ingestão server-side.
2. Painel multi-conta.
3. Eventos de conversão e `event_id`.
4. Integrações com plataformas de checkout/anúncios além de Hotmart/Kiwify.
5. Testes de regressão automatizados em CI (a suíte atual roda manualmente no navegador).

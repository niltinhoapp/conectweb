# ConnectWeb Tracking V1

Primeira versão do produto de rastreamento e atribuição da ConnectWeb.

## Instalação

```html
<script src="https://SEU-DOMINIO/tracking/tracker.js" data-account="CW_xxx" defer></script>
```

O cliente instala uma única tag no site. O `data-account` identifica a conta do cliente.

## O que a V1 faz

- Captura UTMs.
- Captura click IDs: `fbclid`, `gclid`, `gbraid`, `wbraid`, `ttclid`, `msclkid`, `twclid`, `li_fat_id`, `yclid` e `dclid`.
- Registra primeira visita/origem e última origem com campanha relevante.
- Mantém histórico curto de toques de atribuição.
- Persiste dados no `localStorage`, com cookie como fallback.
- Preserva parâmetros ao navegar por links.
- Injeta dados de atribuição em formulários como campos ocultos.
- Adapta checkout Hotmart/Kiwify com `sck` e `src` quando aplicável.
- Processa links e formulários adicionados dinamicamente via `MutationObserver`.
- Expõe API `window.ConnectWebTracking` para integração futura.

## Limites intencionais da V1

A V1 é um tracker client-side. Ela **não envia conversões para Meta, Google ou TikTok** e não promete que uma plataforma de anúncios registre toda conversão. O próximo estágio é adicionar uma camada server-side/eventos, mantendo o mesmo modelo de atribuição.

## Teste

A página `/tracking/` é uma página de teste. Exemplos:

`/tracking/?utm_source=facebook&utm_medium=paid&utm_campaign=teste&fbclid=abc123`

Depois verifique:

1. Dados exibidos no painel da página.
2. Links Hotmart/Kiwify com parâmetros adicionados.
3. Campos ocultos adicionados ao formulário.
4. Persistência após recarregar/navegar.
5. Não sobrescrever a primeira origem com uma visita direta.

## Próximas etapas

1. Testes automatizados e manuais.
2. Endpoint de ingestão server-side.
3. Painel multi-conta.
4. Eventos de conversão e `event_id`.
5. Integrações com plataformas de checkout/anúncios.
6. Consentimento/LGPD configurável por conta.

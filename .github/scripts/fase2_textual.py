from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# SEO e posicionamento: Conect Web como marca principal.
s = s.replace(
    '<title>Conect Web | Tecnologia, Automação e Produtos Próprios com IA</title>',
    '<title>Conect Web | Engenharia de Software, Integrações e Automação</title>'
)
s = s.replace(
    '<meta name="description" content="A Conect Web desenvolve produtos próprios de IA e automação — como a Lívia — além de sistemas sob medida, integrações e automações. Parceiro Certificado Nuvemshop.">',
    '<meta name="description" content="A Conect Web desenvolve software sob medida, integra sistemas e cria automações e produtos digitais para empresas que precisam ganhar eficiência e escalar.">'
)
s = s.replace(
    '<meta property="og:title" content="Conect Web | Tecnologia, Automação e Produtos Próprios com IA">',
    '<meta property="og:title" content="Conect Web | Engenharia de Software, Integrações e Automação">'
)
s = s.replace(
    '<meta property="og:description" content="A Conect Web desenvolve produtos próprios de IA e automação — como a Lívia — além de sistemas sob medida, integrações e automações. Parceiro Certificado Nuvemshop.">',
    '<meta property="og:description" content="Software sob medida, integrações, automação e produtos digitais desenvolvidos pela Conect Web.">'
)

# Remove atalhos especiais da Lívia do menu: produtos permanecem agrupados na seção própria.
s = s.replace('<a class="nav__livia" href="https://livia.conectweb.online/" target="_blank" rel="noopener" data-event="cta_click" data-cta="nav_livia"><span class="nav__livia-dot"></span>Lívia</a>', '')
s = s.replace('<a class="nav__livia" href="https://livia.conectweb.online/" target="_blank" rel="noopener" data-event="cta_click" data-cta="nav_mobile_livia"><span class="nav__livia-dot"></span>Conhecer a Lívia</a>', '')

# Hero institucional: marca e competência antes dos produtos.
s = s.replace('<a class="livia-badge" href="https://livia.conectweb.online/" target="_blank" rel="noopener" data-event="cta_click" data-cta="hero_livia_strip"><span class="livia-badge__dot"></span>Lívia — recepcionista com IA →</a>', '')
s = s.replace(
    '<h1>Tecnologia que conecta <span class="u">atendimento, automação e vendas.</span></h1>',
    '<h1>Tecnologia para transformar <span class="u">processos em soluções que escalam.</span></h1>'
)
s = s.replace(
    '<p class="lead">A Conect Web desenvolve produtos próprios de IA e automação — como a Lívia — e constrói sistemas sob medida, integrações e automações para empresas que querem atender melhor, vender mais e operar sem gargalos.</p>',
    '<p class="lead">A Conect Web desenvolve software sob medida, conecta sistemas e automatiza operações para empresas que precisam ganhar eficiência, reduzir trabalho manual e crescer com uma base tecnológica sólida.</p>'
)

# Reestrutura produtos com hierarquia equilibrada.
prod_start = s.index('<section id="produtos-conectweb"')
diag_start = s.index('<section class="section"><div class="container"><header class="section__head"><span class="eyebrow">Diagnóstico</span>', prod_start)
new_products = '''<section id="produtos-conectweb" class="section reveal"><div class="container"><header class="section__head"><span class="eyebrow">Produtos ConectWeb</span><h2>Produtos desenvolvidos pela Conect Web</h2><p>Soluções próprias que aplicam nossa experiência em software, automação, IA e gestão a operações reais.</p></header>

<div class="prodhub"><div class="prodhub__grid">

<article class="prodcard"><div class="prodcard__top"><span class="prodcard__tag">IA · Atendimento</span><h3>Lívia</h3><p class="prodcard__tagline">Recepcionista inteligente para WhatsApp, agenda e organização do atendimento.</p></div><a class="link" href="https://livia.conectweb.online/" target="_blank" rel="noopener" data-event="cta_click" data-cta="produtos_livia">Conhecer a Lívia →</a></article>

<article class="prodcard"><div class="prodcard__top"><span class="prodcard__tag">Automação · Nuvemshop</span><h3>Nuvem Rush</h3><p class="prodcard__tagline">Automações de pós-venda, carrinho abandonado e relacionamento via WhatsApp e e-mail.</p></div><a class="link" href="https://nuvemrush.com.br" target="_blank" rel="noopener" data-event="cta_click" data-cta="produtos_nuvemrush">Ver o Nuvem Rush →</a></article>

<article class="prodcard"><div class="prodcard__top"><span class="prodcard__tag">Sistema · Revendas</span><h3>Financer Auto</h3><p class="prodcard__tagline">Gestão de contratos, parcelas, cobrança, loja virtual e área do cliente para revendas.</p></div><a class="link" href="https://financer-auto.conectweb.online" target="_blank" rel="noopener" data-event="cta_click" data-cta="produtos_financerauto">Ver o Financer Auto →</a></article>

<article class="prodcard"><div class="prodcard__top"><span class="prodcard__tag">Inteligência financeira · Marketplace</span><h3>Lucro ML</h3><p class="prodcard__tagline">DRE, análise de margem e diagnóstico financeiro para operações no Mercado Livre.</p></div><a class="link" href="https://lucro.conectweb.online" target="_blank" rel="noopener" data-event="cta_click" data-cta="produtos_lucroml">Ver o Lucro ML →</a></article>

</div></div><div class="sys__cta" style="justify-content:center"><a class="btn btn--ghost btn--lg" href="/projetos/">Ver todos os produtos e projetos →</a></div></div></section>

'''
s = s[:prod_start] + new_products + s[diag_start:]

# Diagnóstico repetia as mesmas capacidades apresentadas logo abaixo. Remove a seção inteira.
diag_start = s.index('<section class="section"><div class="container"><header class="section__head"><span class="eyebrow">Diagnóstico</span>')
sol_start = s.index('<section class="section section--alt">', diag_start)
s = s[:diag_start] + s[sol_start:]

# Consolida a antiga seção "Soluções" como apresentação principal das capacidades da empresa.
s = s.replace('<span class="eyebrow">Soluções</span><h2>Escolha o caminho para o seu projeto</h2><p>Cada frente possui uma página própria, com escopo, processo e exemplos relacionados.</p>', '<span class="eyebrow">O que fazemos</span><h2>Capacidades para construir, integrar e evoluir sua operação</h2><p>Da arquitetura ao produto em produção, atuamos nas frentes necessárias para resolver o problema com tecnologia.</p>')

# Diferenciais menos repetitivos e mais institucionais.
old_diff = '<span class="eyebrow">Diferenciais</span><h2>Do planejamento à publicação</h2><p>Uma entrega técnica, documentada e pronta para evoluir.</p></header><div class="diffgrid"><div class="diff"><strong>Código próprio</strong><p>Projetos sob medida com código próprio e repositório dedicado ao projeto.</p></div><div class="diff"><strong>Arquitetura escalável</strong><p>Preparada para o crescimento da operação.</p></div><div class="diff"><strong>Integrações reais</strong><p>APIs, webhooks e automações que conectam sistemas.</p></div><div class="diff"><strong>Atendimento técnico</strong><p>Contato direto com quem desenvolve.</p></div><div class="diff"><strong>Segurança e LGPD</strong><p>Boas práticas de acesso e tratamento de dados.</p></div><div class="diff"><strong>Parceiro Nuvemshop</strong><p>Conhecimento certificado da plataforma.</p></div>'
new_diff = '<span class="eyebrow">Por que Conect Web</span><h2>Tecnologia com responsabilidade de ponta a ponta</h2><p>Projetos conduzidos com visão de negócio, clareza técnica e base preparada para evoluir.</p></header><div class="diffgrid"><div class="diff"><strong>Decisão técnica com contexto</strong><p>A tecnologia é escolhida a partir do problema, da operação e do objetivo do projeto.</p></div><div class="diff"><strong>Projeto organizado</strong><p>Escopo, código e evolução tratados de forma estruturada e rastreável.</p></div><div class="diff"><strong>Evolução contínua</strong><p>Soluções pensadas para receber melhorias sem depender de reconstruções constantes.</p></div><div class="diff"><strong>Contato técnico direto</strong><p>Comunicação com quem entende a arquitetura e acompanha a implementação.</p></div><div class="diff"><strong>Segurança e LGPD</strong><p>Boas práticas de acesso, dados e integrações desde a concepção.</p></div><div class="diff"><strong>Ecossistema e parceiros</strong><p>Experiência prática com plataformas e integrações usadas em operações reais.</p></div>'
assert old_diff in s, 'bloco de diferenciais não encontrado'
s = s.replace(old_diff, new_diff)

# Validações da hierarquia final.
assert 'hero_livia_strip' not in s
assert 'nav_mobile_livia' not in s
assert 'nav_livia' not in s
assert '<span class="eyebrow">Diagnóstico</span>' not in s
assert 'Produto em destaque · IA' not in s
assert 'Produtos desenvolvidos pela Conect Web' in s
assert 'Capacidades para construir, integrar e evoluir sua operação' in s
assert s.count('https://livia.conectweb.online/') == 1, s.count('https://livia.conectweb.online/')

p.write_text(s, encoding='utf-8')

from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=14', '/styles.css?v=15')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
marker = '/* CAPABILITIES_OVERLAY_READABILITY_FIX */'
if marker not in css:
    css += r'''

/* CAPABILITIES_OVERLAY_READABILITY_FIX */
/* O backdrop estava sendo renderizado acima do card por causa do stacking context da grade.
   Mantemos a camada apenas para capturar o clique externo, sem escurecer o conteúdo aberto. */
.capabilities-backdrop,
.capabilities-backdrop.is-visible{
  background:transparent!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.cap-card.is-open .cap-card__back{
  opacity:1!important;
  filter:none!important;
  isolation:isolate;
}
.cap-card.is-open .cap-detail,
.cap-card.is-open .cap-card__close{
  opacity:1!important;
  filter:none!important;
}
'''
styles.write_text(css)

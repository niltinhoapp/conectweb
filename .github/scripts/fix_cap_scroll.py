from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=15', '/styles.css?v=16')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
marker = '/* CAPABILITIES_SCROLL_FIX */'
if marker not in css:
    css += r'''

/* CAPABILITIES_SCROLL_FIX */
/* Evita que o backdrop fique acima do card por causa do stacking context da grade. */
body.capability-open .capabilities-grid{
  z-index:auto!important;
}

/* Backdrop volta a escurecer apenas a pagina atras do card e continua clicavel. */
.capabilities-backdrop,
.capabilities-backdrop.is-visible{
  background:rgba(15,23,42,.58)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  pointer-events:auto!important;
}

/* O card aberto fica acima do backdrop e o proprio verso vira a area rolavel. */
.cap-card.is-open{
  z-index:102!important;
  overflow:hidden!important;
}
.cap-card.is-open .cap-card__inner{
  height:100%!important;
  min-height:0!important;
  overflow:hidden!important;
}
.cap-card.is-open .cap-card__back{
  overflow-y:auto!important;
  overflow-x:hidden!important;
  max-height:100%!important;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  touch-action:pan-y;
  scrollbar-gutter:stable;
  pointer-events:auto!important;
}
.cap-card.is-open .cap-detail{
  min-height:auto!important;
  justify-content:flex-start!important;
}

@media (max-width:720px){
  .cap-card.is-open .cap-card__back{
    overflow-y:auto!important;
    -webkit-overflow-scrolling:touch;
    touch-action:pan-y;
  }
}
'''
styles.write_text(css)

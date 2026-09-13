from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=16', '/styles.css?v=17')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
marker = '/* CAPABILITIES_BACK_NO_MIRROR_FIX */'
if marker not in css:
    css += r'''

/* CAPABILITIES_BACK_NO_MIRROR_FIX */
/* Quando o card vira modal, abandonamos o 3D no estado aberto.
   Isso evita o bug de composicao do navegador que mostrava o verso espelhado
   ao combinar rotateY com overflow/scroll. O flip continua existindo nos cards fechados. */
.cap-card.is-open .cap-card__inner,
.cap-card.is-open.is-flipped .cap-card__inner{
  transform:none!important;
  transform-style:flat!important;
}
.cap-card.is-open .cap-card__front{
  display:none!important;
}
.cap-card.is-open .cap-card__back{
  position:absolute!important;
  inset:0!important;
  transform:none!important;
  backface-visibility:visible!important;
  -webkit-backface-visibility:visible!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
}
'''
styles.write_text(css)

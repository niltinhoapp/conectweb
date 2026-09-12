from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=12', '/styles.css?v=13')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
marker = '/* CAPABILITIES_BACK_CONTRAST_FIX */'
if marker not in css:
    css += r'''

/* CAPABILITIES_BACK_CONTRAST_FIX */
.cap-card__back{
  background:#0b1020;
  color:#fff;
  text-shadow:none;
  filter:none;
  opacity:1;
}
.cap-card.is-open .cap-card__back{
  background:linear-gradient(145deg,#080c16 0%,#0f172a 58%,#111827 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
}
.cap-card.is-open .cap-card__back::before{
  content:none!important;
  display:none!important;
}
.cap-detail{position:relative;z-index:2}
.cap-detail__eyebrow{color:#bfdbfe!important;opacity:1}
.cap-detail h3{color:#fff!important;text-shadow:none!important;opacity:1}
.cap-detail__lead{color:#e5e7eb!important;opacity:1}
.cap-detail__grid>div{
  background:#151d2e!important;
  border-color:rgba(255,255,255,.16)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.cap-detail__grid strong{color:#fff!important;opacity:1}
.cap-detail__grid p{color:#d7deea!important;opacity:1}
.cap-card__close{
  background:#1e293b!important;
  color:#fff!important;
  border-color:rgba(255,255,255,.24)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
.capabilities-backdrop{
  background:rgba(5,8,14,.82);
  backdrop-filter:none;
  -webkit-backdrop-filter:none;
}
@media (max-width:720px){
  .cap-card.is-open{inset:6px}
  .cap-card__back{padding:16px;background:#0b1020}
  .cap-detail__lead{color:#e5e7eb!important;line-height:1.65}
  .cap-detail__grid p{color:#d7deea!important}
}
'''
styles.write_text(css)

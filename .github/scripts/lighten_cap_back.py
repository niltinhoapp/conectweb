from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=13', '/styles.css?v=14')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
marker = '/* CAPABILITIES_BACK_LIGHT_FIX */'
if marker not in css:
    css += r'''

/* CAPABILITIES_BACK_LIGHT_FIX */
.cap-card__back,
.cap-card.is-open .cap-card__back{
  background:#f8fafc!important;
  color:#0f172a!important;
  border-color:#dbe2ea!important;
  box-shadow:0 24px 70px -28px rgba(15,23,42,.28)!important;
}
.cap-card.is-open .cap-card__back::before{content:none!important;display:none!important}
.cap-detail__eyebrow{color:#2563eb!important}
.cap-detail h3{color:#0f172a!important;text-shadow:none!important}
.cap-detail__lead{color:#334155!important}
.cap-detail__grid>div{
  background:#ffffff!important;
  border-color:#dbe2ea!important;
  box-shadow:0 8px 22px -18px rgba(15,23,42,.22)!important;
}
.cap-detail__grid strong{color:#0f172a!important}
.cap-detail__grid p{color:#475569!important}
.cap-card__close{
  background:#ffffff!important;
  color:#0f172a!important;
  border-color:#cbd5e1!important;
  box-shadow:0 4px 14px -10px rgba(15,23,42,.35)!important;
}
.cap-card__close:hover{background:#f1f5f9!important;border-color:#94a3b8!important}
.cap-card__back .btn--primary{
  --btn-bg:#2563eb;
  --btn-fg:#fff;
}
.capabilities-backdrop{background:rgba(15,23,42,.58)!important}
@media (max-width:720px){
  .cap-card__back{background:#f8fafc!important}
  .cap-detail__lead{color:#334155!important}
  .cap-detail__grid p{color:#475569!important}
}
'''
styles.write_text(css)

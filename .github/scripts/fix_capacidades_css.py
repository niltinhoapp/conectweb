from pathlib import Path

index = Path('index.html')
html = index.read_text()
html = html.replace('/styles.css?v=11', '/styles.css?v=12')
index.write_text(html)

styles = Path('styles.css')
css = styles.read_text()
css = css.replace('.cap-card__face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:24px;border:1px solid var(--line);overflow:hidden}', '.cap-card__face{inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:24px;border:1px solid var(--line);overflow:hidden}')
css = css.replace('.cap-card__front{display:flex;flex-direction:column;justify-content:space-between;gap:34px;padding:28px;background:linear-gradient(145deg,#fff 0%,#fbfcff 68%,#f5f7fb 100%);box-shadow:var(--shadow-sm)}', '.cap-card__front{position:relative;min-height:310px;display:flex;flex-direction:column;justify-content:space-between;gap:34px;padding:28px;background:linear-gradient(145deg,#fff 0%,#fbfcff 68%,#f5f7fb 100%);box-shadow:var(--shadow-sm)}')
css = css.replace('.cap-card__back{transform:rotateY(180deg);padding:clamp(28px,4vw,52px);background:linear-gradient(145deg,#0b0d14,#111827 62%,#151b2a);border-color:rgba(255,255,255,.12);color:#fff;overflow:auto}', '.cap-card__back{position:absolute;inset:0;transform:rotateY(180deg);padding:clamp(28px,4vw,52px);background:linear-gradient(145deg,#0b0d14,#111827 62%,#151b2a);border-color:rgba(255,255,255,.12);color:#fff;overflow:auto}')
css = css.replace('.capabilities-grid{grid-template-columns:1fr;gap:12px}.cap-card,.cap-card__inner{min-height:260px}.cap-card__front{padding:22px;gap:24px}', '.capabilities-grid{grid-template-columns:1fr;gap:12px}.cap-card,.cap-card__inner,.cap-card__front{min-height:260px}.cap-card__front{padding:22px;gap:24px}')
styles.write_text(css)

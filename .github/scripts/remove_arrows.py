from pathlib import Path
p=Path('index.html')
s=p.read_text()
s=s.replace(' →','')
s=s.replace('→','')
p.write_text(s)

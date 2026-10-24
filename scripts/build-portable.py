"""Build a local-only standalone HTML without external runtime dependencies."""
from pathlib import Path
import base64

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
html = (dist / 'index.html').read_text()
css = (dist / 'styles.css').read_text()
wallpaper = 'data:image/png;base64,' + base64.b64encode((dist / 'assets/coast.png').read_bytes()).decode()
css = ':root{--coast:url("' + wallpaper + '")}\n' + css.replace("url('./assets/coast.png')", 'var(--coast)')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>' + css + '</style>')
favicon = 'data:image/svg+xml;base64,' + base64.b64encode((dist / 'assets/favicon.svg').read_bytes()).decode()
html = html.replace('assets/favicon.svg', favicon)
for name in ['content.js', 'gallery-data.js', 'icons.js', 'core.js', 'app.js']:
    js = (dist / name).read_text().replace('</script', '<\\/script')
    if name == 'gallery-data.js':
        import json
        for photo in json.loads((root / 'research/ASSET_MANIFEST_0520.json').read_text())['assets']:
            photo_data = 'data:image/jpeg;base64,' + base64.b64encode((dist / photo['path']).read_bytes()).decode()
            js = js.replace('"' + photo['path'] + '"', '"' + photo_data + '"')
    html = html.replace('<script src="' + name + '"></script>', '<script>' + js + '</script>')
(root / 'portable').mkdir(exist_ok=True)
(root / 'portable/xiaosheng-phone.html').write_text(html)
print('Portable HTML ready:', root / 'portable/xiaosheng-phone.html')

"""Build a local-only standalone HTML without external runtime dependencies."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
html = (dist / 'index.html').read_text()
css = (dist / 'styles.css').read_text()
wallpaper = 'data:image/png;base64,' + base64.b64encode((dist / 'assets/coast.png').read_bytes()).decode()
css = ':root{--coast:url("' + wallpaper + '")}\n' + css.replace("url('./assets/coast.png')", 'var(--coast)')
html = re.sub(r'<link rel="stylesheet" href="styles\.css(?:\?[^"]*)?">', lambda _: '<style>'+css+'</style>', html)
for name in ['developer-easter-egg.css','lock-screen.css']:
    html = re.sub(r'<link rel="stylesheet" href="'+re.escape(name)+r'(?:\?[^"]*)?">', lambda _: '<style>'+(dist/name).read_text()+'</style>', html)
favicon = 'data:image/svg+xml;base64,' + base64.b64encode((dist / 'assets/favicon.svg').read_bytes()).decode()
html = html.replace('assets/favicon.svg', favicon)
for name in ['content.js', 'gallery-data.js', 'icons.js', 'core.js', 'wang-dialogue.js', 'wang-chat-runtime.js', 'phone-experience.js', 'dali-map-data.js', 'dali-experience.js', 'app.js', 'developer-easter-egg.js']:
    js = (dist / name).read_text().replace('</script', '<\\/script')
    if name in ['gallery-data.js', 'phone-experience.js']:
        import json
        for photo in json.loads((root / 'research/ASSET_MANIFEST_0520.json').read_text())['assets']:
            photo_data = 'data:image/jpeg;base64,' + base64.b64encode((dist / photo['path']).read_bytes()).decode()
            js = js.replace('"' + photo['path'] + '"', '"' + photo_data + '"').replace("'" + photo['path'] + "'", "'" + photo_data + "'")
    if name == 'developer-easter-egg.js':
        image_path = 'assets/payment/wechat_099_official_user_image.png'
        image_data = 'data:image/png;base64,' + base64.b64encode((dist/image_path).read_bytes()).decode()
        js = js.replace(image_path+'?v=c21531196852', image_data)
    html = re.sub(r'<script src="'+re.escape(name)+r'(?:\?[^"]*)?"></script>', lambda _: '<script>'+js+'</script>', html)
(root / 'portable').mkdir(exist_ok=True)
(root / 'portable/xiaosheng-phone.html').write_text(html)
print('Portable HTML ready:', root / 'portable/xiaosheng-phone.html')

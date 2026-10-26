"""Build a standalone HTML using the same display images as the published phone."""
from pathlib import Path
import base64
import json
import mimetypes
import re

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
html = (dist / 'index.html').read_text()
def data_url(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return 'data:' + mime + ';base64,' + base64.b64encode((dist/path).read_bytes()).decode()
# Map URLs in one place; shared avatars/thumbnails no longer duplicate image bytes per message.
embedded = {str(p.relative_to(dist)): data_url(str(p.relative_to(dist))) for p in (dist/'assets').rglob('*') if p.is_file() and p.suffix in ['.jpg', '.webp']}
html = html.replace('assets/favicon.svg', data_url('assets/favicon.svg'))
def stylesheet(match):
    css = (dist/match[1]).read_text()
    css = re.sub(r'url\([\'\"]?(?:\./)?(assets/[^)\'\"]+)[\'\"]?\)', lambda m: 'url("'+embedded.get(m[1], data_url(m[1]))+'")', css)
    return '<style>'+css+'</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">', stylesheet, html)
def script(match):
    name = match[1]
    js = (dist/name).read_text()
    prefix = ''
    if name == 'photo-media.js':
        prefix = '<script>window.PHONE_EMBEDDED_ASSETS='+json.dumps(embedded,separators=(',', ':'))+';</script>'
    if name == 'dali-experience.js':
        prefix = '<script>'+(dist/'dali-map-data.js').read_text()+'</script>'
    if name == 'developer-easter-egg.js':
        js = js.replace('assets/payment/wechat_099_official_user_image.png?v=c21531196852', data_url('assets/payment/wechat_099_official_user_image.png'))
    return prefix+'<script>'+js.replace('</script', '<\\/script')+'</script>'
html = re.sub(r'<script(?: defer)? src="([^"?]+)(?:\?[^"]*)?"></script>', script, html)
(root/'portable').mkdir(exist_ok=True)
(root/'portable/xiaosheng-phone.html').write_text(html)
print('Portable HTML ready:', root/'portable/xiaosheng-phone.html')

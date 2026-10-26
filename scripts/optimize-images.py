"""Generate versioned display images; preserve every original photo byte-for-byte."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import json
from io import BytesIO

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
gallery = json.loads((DIST / 'gallery-data.js').read_text().split('=', 1)[1].strip().rstrip(';'))
output = DIST / 'assets/optimized'
output.mkdir(parents=True, exist_ok=True)
variants = {}
for asset in gallery['assets'] + [{'id': 'coast', 'path': 'assets/coast.png'}]:
    path = DIST / asset['path']
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
    record = {}
    with Image.open(path) as image:
        original = ImageOps.exif_transpose(image).convert('RGB')
        for name, edge, quality in [('avatar', 320, 78), ('thumb', 480, 78), ('full', 1280, 86)]:
            image = original.copy()
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            relative = f'assets/optimized/{asset["id"]}-{digest}-{name}.webp'
            if not (DIST / relative).exists() or not (DIST / relative).stat().st_size:
                buffer = BytesIO()
                image.save(buffer, 'WEBP', quality=quality, method=6)
                temporary = (DIST / relative).with_suffix('.tmp')
                temporary.write_bytes(buffer.getvalue())
                temporary.replace(DIST / relative)
            record[name] = {'path': relative, 'width': image.width, 'height': image.height}
    variants[asset['path']] = record
(DIST / 'photo-variants.js').write_text('window.PHOTO_VARIANTS = ' + json.dumps(variants, ensure_ascii=False, separators=(',', ':')) + ';\n')
original_bytes = sum((DIST / a['path']).stat().st_size for a in gallery['assets'])
for kind in ['avatar', 'thumb', 'full']:
    total = sum((DIST / v[kind]['path']).stat().st_size for path, v in variants.items() if path != 'assets/coast.png')
    print(f'{kind}: {total:,} bytes vs {original_bytes:,} original ({(1-total/original_bytes)*100:.1f}% smaller)')

import re
css_path = DIST / 'styles.css'
css = css_path.read_text()
css = re.sub(r"url\('\./assets/(?:coast\.png|optimized/coast-[a-f0-9]+-full\.webp)'\)", "url('./" + variants['assets/coast.png']['full']['path'] + "')", css)
css_path.write_text(css)

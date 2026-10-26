#!/usr/bin/env python3
"""Prepare a PRIVATE-INSTALL Android asset snapshot without modifying GitHub Pages."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
src = root/'dist'
out = root/'android/app/src/main/assets/site'
if out.exists():
    shutil.rmtree(out)
shutil.copytree(src,out)
html = (out/'index.html').read_text(encoding='utf-8')
anchor = '<script defer src="persona-chat-runtime.js?'
assert anchor in html
html = html.replace(anchor,'<script defer src="local-ai.js?v=android-local-only"></script>'+anchor,1)
(out/'local-ai.js').write_text((root/'android/local-ai.js').read_text(encoding='utf-8'),encoding='utf-8')
for name in ('persona-chat-runtime.js','phone-experience.js','phone-life.css'):
    (out/name).write_text((root/'android/local'/name).read_text(encoding='utf-8'),encoding='utf-8')
(out/'index.html').write_text(html,encoding='utf-8')
assert 'GIRLS_AI_API' not in (out/'index.html').read_text() # only local-ai.js defines it
assert not (out/'ai-config.js').exists()
print('Local Android assets ready: '+str(out))

"""Extract Chinese strings from activity views for i18n."""
import re
import os
import json

root = os.path.join(os.path.dirname(__file__), '..', 'src', 'views', 'activity')
pattern = re.compile(r'[\u4e00-\u9fff][^\n\'"]{0,120}')

strings = set()
file_counts = {}
for dirpath, _, files in os.walk(root):
    for f in files:
        if not f.endswith('.vue'):
            continue
        path = os.path.join(dirpath, f)
        with open(path, encoding='utf-8') as fh:
            content = fh.read()
        matches = pattern.findall(content)
        chinese = [m.strip() for m in matches if re.search(r'[\u4e00-\u9fff]', m)]
        if chinese:
            rel = os.path.relpath(path, root)
            file_counts[rel] = len(chinese)
            strings.update(chinese)

print('Files:', len(file_counts))
print('Unique strings:', len(strings))
for rel, c in sorted(file_counts.items(), key=lambda x: -x[1]):
    print(f'  {c:4d} {rel}')

out = os.path.join(os.path.dirname(__file__), 'activity-strings.json')
with open(out, 'w', encoding='utf-8') as fh:
    json.dump(sorted(strings), fh, ensure_ascii=False, indent=2)
print('Wrote', out)

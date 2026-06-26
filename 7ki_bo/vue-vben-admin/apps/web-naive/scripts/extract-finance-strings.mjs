import fs from 'fs';
import path from 'path';

const dir = 'src/views/finance';
const strings = new Map();

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.vue'))) {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]/g;
  let m;
  while ((m = re.exec(c))) {
    const s = m[1].trim();
    if (s.length > 0 && s.length < 150 && !s.startsWith('//')) {
      if (!strings.has(s)) strings.set(s, []);
      strings.get(s).push(f);
    }
  }
}

console.log('unique quoted strings:', strings.size);
const sorted = [...strings.keys()].sort();
for (const s of sorted.slice(0, 50)) {
  console.log(JSON.stringify(s));
}
